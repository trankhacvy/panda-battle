use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};
use ephemeral_rollups_sdk::anchor::delegate;
use ephemeral_rollups_sdk::cpi::DelegateConfig;

use crate::constants::*;
use crate::errors::PandaBattleError;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + GlobalConfig::INIT_SPACE,
        seeds = [GLOBAL_CONFIG_SEED],
        bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_game(ctx: Context<InitializeGame>, token_mint: Pubkey) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;

    global_config.admin = ctx.accounts.admin.key();
    global_config.token_mint = token_mint;
    global_config.current_round = 0;
    global_config.total_rounds = 0;
    global_config.bump = ctx.bumps.global_config;

    msg!(
        "Game initialized with admin: {}, token_mint: {}",
        global_config.admin,
        token_mint
    );

    Ok(())
}

#[derive(Accounts)]
pub struct CreateRound<'info> {
    #[account(
        mut,
        constraint = admin.key() == global_config.admin @ PandaBattleError::Unauthorized
    )]
    pub admin: Signer<'info>,

    /// Token mint for this round
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = admin,
        space = 8 + GameRound::INIT_SPACE,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
            (global_config.total_rounds + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = game_round,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn create_round(
    ctx: Context<CreateRound>,
    entry_fee: u64,
    attack_pack_price: u64,
    duration_secs: i64,
    entry_hourly_inc_pct: u8,
) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;
    let game_round = &mut ctx.accounts.game_round;
    let clock = Clock::get()?;

    require!(duration_secs > 0, PandaBattleError::InvalidConfig);

    global_config.current_round = global_config.total_rounds + 1;
    global_config.total_rounds += 1;

    game_round.global_config = global_config.key();
    game_round.round_number = global_config.current_round;
    game_round.entry_fee = entry_fee;
    game_round.attack_pack_price = attack_pack_price;
    game_round.duration_secs = duration_secs;
    game_round.entry_hourly_inc_pct = entry_hourly_inc_pct;
    game_round.start_time = clock.unix_timestamp;
    game_round.end_time = clock.unix_timestamp + duration_secs;
    game_round.leaderboard_reveal_ts = clock.unix_timestamp + (duration_secs / 2); // 12 hours for 24h round
    game_round.prize_pool = 0;
    game_round.player_count = 0;
    game_round.total_battles = 0;
    game_round.is_active = true;
    game_round.payouts_processed = false;
    game_round.bump = ctx.bumps.game_round;

    msg!(
        "Round {} created. Entry: {}, Pack: {}, Duration: {}s. Starts: {}, Ends: {}, Reveal: {}",
        game_round.round_number,
        entry_fee,
        attack_pack_price,
        duration_secs,
        game_round.start_time,
        game_round.end_time,
        game_round.leaderboard_reveal_ts
    );

    Ok(())
}

#[delegate]
#[derive(Accounts)]
pub struct DelegateRound<'info> {
    pub admin: Signer<'info>,
    /// CHECK: Checked by the delegate program
    pub validator: Option<AccountInfo<'info>>,
    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            game_round.global_config.as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        del
    )]
    pub game_round: Account<'info, GameRound>,
}

pub fn delegate_round(ctx: Context<DelegateRound>) -> Result<()> {
    let game_round = &ctx.accounts.game_round;
    let round_number_bytes = game_round.round_number.to_le_bytes();

    let seeds = &[
        GAME_ROUND_SEED,
        game_round.global_config.as_ref(),
        round_number_bytes.as_ref(),
    ];

    game_round.exit(&crate::ID)?;

    msg!("Delegating round {} to validator", game_round.round_number);

    ctx.accounts.delegate_game_round(
        &ctx.accounts.admin,
        seeds,
        // &[
        //     GAME_ROUND_SEED,
        //     game_round.global_config.as_ref(),
        //     game_round.round_number.to_le_bytes().as_ref(),
        // ],
        DelegateConfig::default(),
    )?;
    Ok(())
}

#[derive(Accounts)]
pub struct EndRound<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = game_round.is_active @ PandaBattleError::RoundAlreadyEnded
    )]
    pub game_round: Account<'info, GameRound>,
}

pub fn end_round(ctx: Context<EndRound>) -> Result<()> {
    let game_round = &mut ctx.accounts.game_round;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundAlreadyEnded);

    // Allow early end by admin or auto-end after duration
    let is_admin = ctx.accounts.admin.key() == ctx.accounts.global_config.admin;
    let is_expired = clock.unix_timestamp >= game_round.end_time;

    require!(is_admin || is_expired, PandaBattleError::Unauthorized);

    game_round.is_active = false;
    game_round.end_time = clock.unix_timestamp;

    msg!(
        "Round {} ended. Total prize pool: {}, Players: {}, Battles: {}",
        game_round.round_number,
        game_round.prize_pool,
        game_round.player_count,
        game_round.total_battles
    );

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        constraint = admin.key() == global_config.admin @ PandaBattleError::Unauthorized
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_CONFIG_SEED],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,
}

pub fn update_config(ctx: Context<UpdateConfig>, token_mint: Option<Pubkey>) -> Result<()> {
    let global_config = &mut ctx.accounts.global_config;

    if let Some(mint) = token_mint {
        global_config.token_mint = mint;
    }

    msg!("Global config updated");

    Ok(())
}

// ============== UTILITY FUNCTIONS ==============

pub fn transfer_to_vault<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    token_program: &Program<'info, Token>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    msg!("Transferred {} tokens to vault", amount);
    Ok(())
}

pub fn transfer_from_vault<'info>(
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &AccountInfo<'info>,
    token_program: &Program<'info, Token>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = Transfer {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_ctx =
        CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, signer_seeds);
    transfer(cpi_ctx, amount)?;

    msg!("Transferred {} tokens from vault", amount);
    Ok(())
}
