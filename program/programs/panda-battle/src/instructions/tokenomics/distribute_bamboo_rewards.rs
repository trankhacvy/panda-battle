use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token};

use crate::state::*;
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct DistributeBambooRewards<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

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

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<DistributeBambooRewards>,
    amount: u64,
    reason: String,
) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.treasury_config.authority,
        ErrorCode::InvalidTreasuryAuthority
    );

    require!(
        ctx.accounts.vault_ata.amount >= amount,
        ErrorCode::InsufficientBalance
    );

    let seeds = &[TREASURY_SEED.as_bytes(), &[ctx.accounts.treasury_config.bump]];
    let signer_seeds = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.vault_ata.to_account_info(),
                to: ctx.accounts.player_token_account.to_account_info(),
                authority: ctx.accounts.treasury_config.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    ctx.accounts.treasury_config.total_distributed = ctx.accounts.treasury_config.total_distributed
        .checked_add(amount)
        .ok_or(ErrorCode::CustomError)?;

    emit!(RewardsDistributed {
        player: ctx.accounts.player_token_account.owner,
        amount,
        reason,
        timestamp: Clock::get()?.unix_timestamp,
    });

    emit!(TreasuryTransferred {
        from: ctx.accounts.vault_ata.key(),
        to: ctx.accounts.player_token_account.key(),
        amount,
        reason: "battle_reward".to_string(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Distributed {} tokens to player", amount);

    Ok(())
}
