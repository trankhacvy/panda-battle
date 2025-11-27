use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token};

use crate::state::*;
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [TREASURY_SEED.as_bytes()],
        bump = treasury_config.bump
    )]
    pub treasury_config: Account<'info, TreasuryConfig>,

    #[account(
        mut,
        address = treasury_config.vault_ata @ ErrorCode::InvalidTokenAccount
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = player,
        space = PlayerRewardClaim::LEN,
        seeds = [
            PLAYER_REWARD_CLAIM_SEED.as_bytes(),
            player.key().as_ref(),
            &[0u8; 8] // Placeholder pool_id - will be updated
        ],
        bump
    )]
    pub reward_claim: Account<'info, PlayerRewardClaim>,

    #[account(
        init_if_needed,
        payer = player,
        space = RewardPool::LEN,
        seeds = [
            REWARD_POOL_SEED.as_bytes(),
            &0u64.to_le_bytes(), // Pool ID 0
        ],
        bump
    )]
    pub reward_pool: Account<'info, RewardPool>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<ClaimRewards>,
    claim_amount: u64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let reward_pool = &mut ctx.accounts.reward_pool;
    let reward_claim = &mut ctx.accounts.reward_claim;
    let treasury = &mut ctx.accounts.treasury_config;

    // Initialize reward pool if needed
    if reward_pool.pool_id == 0 && reward_pool.created_at == 0 {
        reward_pool.pool_id = 0;
        reward_pool.total_rewards = MAX_SEASON_REWARDS;
        reward_pool.distributed_rewards = 0;
        reward_pool.max_claimable = MAX_SEASON_REWARDS / 1000; // Per-player limit
        reward_pool.season = 1;
        reward_pool.created_at = now;
        reward_pool.expires_at = now + 86400 * 90; // 90 days
        reward_pool.bump = ctx.bumps.reward_pool;
        reward_pool.version = 1;
    }

    // Check if pool is expired
    require!(now <= reward_pool.expires_at, ErrorCode::RewardPoolExpired);

    // Initialize claim if needed
    if reward_claim.player == Pubkey::default() {
        reward_claim.player = ctx.accounts.player.key();
        reward_claim.pool_id = reward_pool.pool_id;
        reward_claim.amount_claimed = 0;
        reward_claim.claimed_at = now;
        reward_claim.bump = ctx.bumps.reward_claim;
    }

    // Check if already claimed in this pool
    require!(
        reward_claim.pool_id != reward_pool.pool_id || reward_claim.amount_claimed == 0,
        ErrorCode::RewardAlreadyClaimed
    );

    // Check max claimable
    let actual_claim = std::cmp::min(claim_amount, reward_pool.max_claimable);
    require!(
        actual_claim <= reward_pool.max_claimable,
        ErrorCode::ExceedsMaxClaimable
    );

    // Check treasury has balance
    require!(
        treasury.vault_ata == ctx.accounts.vault_ata.key(),
        ErrorCode::InvalidTokenAccount
    );

    require!(
        ctx.accounts.vault_ata.amount >= actual_claim,
        ErrorCode::InsufficientBalance
    );

    // Transfer tokens from treasury to player
    let seeds = &[TREASURY_SEED.as_bytes(), &[treasury.bump]];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.vault_ata.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: treasury.to_account_info(),
            },
            signer_seeds,
        ),
        actual_claim,
    )?;

    // Update state
    reward_claim.amount_claimed = actual_claim;
    reward_claim.claimed_at = now;
    reward_pool.distributed_rewards = reward_pool.distributed_rewards
        .checked_add(actual_claim)
        .ok_or(ErrorCode::CustomError)?;
    treasury.total_distributed = treasury.total_distributed
        .checked_add(actual_claim)
        .ok_or(ErrorCode::CustomError)?;

    emit!(RewardsClaimed {
        player: ctx.accounts.player.key(),
        pool_id: reward_pool.pool_id,
        amount: actual_claim,
        timestamp: now,
    });

    emit!(TreasuryTransferred {
        from: ctx.accounts.vault_ata.key(),
        to: ctx.accounts.player_token_account.key(),
        amount: actual_claim,
        reason: "claim_rewards".to_string(),
        timestamp: now,
    });

    msg!("Claimed {} tokens for player", actual_claim);

    Ok(())
}
