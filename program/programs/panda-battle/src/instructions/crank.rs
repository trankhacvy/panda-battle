use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::PandaBattleError;
use crate::state::*;

/// Regenerate turns for a player (can be called by anyone - crank)
pub fn regenerate_turns(ctx: Context<RegenerateTurns>) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;
    let game_round = &ctx.accounts.game_round;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);

    // Check if enough time has passed for regeneration
    let time_since_last_regen = clock.unix_timestamp - player_state.last_turn_regen;
    require!(
        time_since_last_regen >= TURN_REGEN_INTERVAL,
        PandaBattleError::RegenNotReady
    );

    // Calculate how many regeneration cycles have passed
    let cycles = (time_since_last_regen / TURN_REGEN_INTERVAL) as u8;
    let turns_to_add = cycles * TURNS_PER_HOUR;

    // Check if player is already at max turns
    require!(
        player_state.turns < player_state.max_turns,
        PandaBattleError::TurnStorageFull
    );

    // Add turns up to max
    let new_turns = player_state.turns.saturating_add(turns_to_add);
    player_state.turns = new_turns.min(player_state.max_turns);

    // Update last regeneration timestamp
    // Align to the last complete cycle to avoid drift
    player_state.last_turn_regen = player_state.last_turn_regen + 
        (cycles as i64 * TURN_REGEN_INTERVAL);

    msg!(
        "Regenerated {} turns for player {}. New total: {}",
        turns_to_add.min(player_state.max_turns - player_state.turns + turns_to_add),
        player_state.player,
        player_state.turns
    );

    Ok(())
}

/// Apply idle decay to inactive player (can be called by anyone - crank)
pub fn apply_idle_decay(ctx: Context<ApplyIdleDecay>) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;
    let game_config = &ctx.accounts.game_config;
    let game_round = &ctx.accounts.game_round;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);

    // Check if player is idle
    let time_since_battle = clock.unix_timestamp - player_state.last_battle;
    require!(
        time_since_battle >= IDLE_THRESHOLD,
        PandaBattleError::PlayerNotIdle
    );

    // Check if decay was already applied recently
    let time_since_decay = clock.unix_timestamp - player_state.last_decay;
    require!(
        time_since_decay >= IDLE_THRESHOLD,
        PandaBattleError::DecayAlreadyApplied
    );

    // Calculate decay cycles (one per hour of idleness)
    let idle_hours = (time_since_battle / IDLE_THRESHOLD) as u32;
    let decay_percentage = game_config.idle_decay_percentage as u32;

    // Apply decay to each attribute
    for _ in 0..idle_hours.min(5) {
        // Cap at 5 hours of decay per call
        apply_attribute_decay(
            &mut player_state.strength,
            decay_percentage,
        );
        apply_attribute_decay(
            &mut player_state.speed,
            decay_percentage,
        );
        apply_attribute_decay(
            &mut player_state.endurance,
            decay_percentage,
        );
        apply_attribute_decay(
            &mut player_state.luck,
            decay_percentage,
        );
    }

    player_state.last_decay = clock.unix_timestamp;

    msg!(
        "Applied {} hours of idle decay to player {}. New attributes: S:{} Sp:{} E:{} L:{}",
        idle_hours.min(5),
        player_state.player,
        player_state.strength,
        player_state.speed,
        player_state.endurance,
        player_state.luck
    );

    Ok(())
}

/// Apply decay to a single attribute
fn apply_attribute_decay(attribute: &mut u16, decay_percentage: u32) {
    let decay_amount = (*attribute as u32 * decay_percentage / 100) as u16;
    let decay_amount = decay_amount.max(1); // Minimum 1 point decay
    
    *attribute = attribute.saturating_sub(decay_amount);
    
    // Enforce minimum attribute value
    if *attribute < 10 {
        *attribute = 10;
    }
}

// ============== CONTEXTS ==============

#[derive(Accounts)]
pub struct RegenerateTurns<'info> {
    /// Anyone can call this (crank)
    pub caller: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player_state.player.as_ref()
        ],
        bump = player_state.bump
    )]
    pub player_state: Account<'info, PlayerState>,
}

#[derive(Accounts)]
pub struct ApplyIdleDecay<'info> {
    /// Anyone can call this (crank)
    pub caller: Signer<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump = game_config.bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            game_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        mut,
        seeds = [
            PLAYER_STATE_SEED,
            game_round.key().as_ref(),
            player_state.player.as_ref()
        ],
        bump = player_state.bump
    )]
    pub player_state: Account<'info, PlayerState>,
}
