use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::errors::PandaBattleError;
use crate::state::*;

/// Initialize the game configuration
pub fn initialize_game(
    ctx: Context<InitializeGame>,
    entry_fee: u64,
    turn_base_price: u64,
    round_duration: i64,
    steal_percentage: u8,
    idle_decay_percentage: u8,
) -> Result<()> {
    require!(
        steal_percentage <= MAX_STEAL_PERCENTAGE,
        PandaBattleError::InvalidConfig
    );
    require!(
        idle_decay_percentage <= 10,
        PandaBattleError::InvalidConfig
    );
    require!(round_duration > 0, PandaBattleError::InvalidConfig);

    let game_config = &mut ctx.accounts.game_config;
    
    game_config.admin = ctx.accounts.admin.key();
    game_config.entry_fee = entry_fee;
    game_config.turn_base_price = turn_base_price;
    game_config.round_duration = round_duration;
    game_config.steal_percentage = steal_percentage;
    game_config.idle_decay_percentage = idle_decay_percentage;
    game_config.current_round = 0;
    game_config.total_rounds = 0;
    game_config.bump = ctx.bumps.game_config;
    game_config.vault_bump = ctx.bumps.vault;

    msg!("Game initialized with entry_fee: {}, turn_price: {}", entry_fee, turn_base_price);
    
    Ok(())
}

/// Create a new game round
pub fn create_round(ctx: Context<CreateRound>) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;
    let game_round = &mut ctx.accounts.game_round;
    let clock = Clock::get()?;

    // Increment round counter
    game_config.current_round = game_config.total_rounds + 1;
    game_config.total_rounds += 1;

    // Initialize round
    game_round.game_config = game_config.key();
    game_round.round_number = game_config.current_round;
    game_round.start_time = clock.unix_timestamp;
    game_round.end_time = clock.unix_timestamp + game_config.round_duration;
    game_round.prize_pool = 0;
    game_round.player_count = 0;
    game_round.total_battles = 0;
    game_round.is_active = true;
    game_round.payouts_processed = false;
    game_round.bump = ctx.bumps.game_round;

    msg!(
        "Round {} created. Starts: {}, Ends: {}",
        game_round.round_number,
        game_round.start_time,
        game_round.end_time
    );

    Ok(())
}

/// End the current round
pub fn end_round(ctx: Context<EndRound>) -> Result<()> {
    let game_round = &mut ctx.accounts.game_round;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundAlreadyEnded);
    
    // Allow early end by admin or auto-end after duration
    let is_admin = ctx.accounts.admin.key() == ctx.accounts.game_config.admin;
    let is_expired = clock.unix_timestamp >= game_round.end_time;
    
    require!(
        is_admin || is_expired,
        PandaBattleError::Unauthorized
    );

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

/// Update game configuration
pub fn update_config(
    ctx: Context<UpdateConfig>,
    entry_fee: Option<u64>,
    turn_base_price: Option<u64>,
    round_duration: Option<i64>,
    steal_percentage: Option<u8>,
    idle_decay_percentage: Option<u8>,
) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;

    if let Some(fee) = entry_fee {
        game_config.entry_fee = fee;
    }

    if let Some(price) = turn_base_price {
        game_config.turn_base_price = price;
    }

    if let Some(duration) = round_duration {
        require!(duration > 0, PandaBattleError::InvalidConfig);
        game_config.round_duration = duration;
    }

    if let Some(percentage) = steal_percentage {
        require!(
            percentage <= MAX_STEAL_PERCENTAGE,
            PandaBattleError::InvalidConfig
        );
        game_config.steal_percentage = percentage;
    }

    if let Some(percentage) = idle_decay_percentage {
        require!(percentage <= 10, PandaBattleError::InvalidConfig);
        game_config.idle_decay_percentage = percentage;
    }

    msg!("Game config updated");

    Ok(())
}

// ============== CONTEXTS ==============

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = GameConfig::LEN,
        seeds = [GAME_CONFIG_SEED],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,

    /// CHECK: Vault PDA for holding prize pool funds
    #[account(
        seeds = [VAULT_SEED, game_config.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateRound<'info> {
    #[account(
        mut,
        constraint = admin.key() == game_config.admin @ PandaBattleError::Unauthorized
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = admin,
        space = GameRound::LEN,
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            (game_config.total_rounds + 1).to_le_bytes().as_ref()
        ],
        bump
    )]
    pub game_round: Account<'info, GameRound>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndRound<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump,
        constraint = game_round.is_active @ PandaBattleError::RoundAlreadyEnded
    )]
    pub game_round: Account<'info, GameRound>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        constraint = admin.key() == game_config.admin @ PandaBattleError::Unauthorized
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,
}
