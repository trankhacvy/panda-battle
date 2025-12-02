use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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
    player_state.last_turn_regen =
        player_state.last_turn_regen + (cycles as i64 * TURN_REGEN_INTERVAL);

    msg!(
        "Regenerated {} turns for player {}. New total: {}",
        turns_to_add.min(player_state.max_turns - player_state.turns + turns_to_add),
        player_state.player,
        player_state.turns
    );

    Ok(())
}

/// Reset packs bought counter if a new hour has started (can be called by anyone - crank)
pub fn reset_packs_if_new_hour(ctx: Context<ResetPacksIfNewHour>) -> Result<()> {
    let player_state = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;

    // Check if at least 1 hour (3600 seconds) has passed since last pack purchase
    if player_state.last_pack_hour >= 0
        && clock.unix_timestamp >= player_state.last_pack_hour + 3600
    {
        player_state.packs_bought_hour = 0;

        msg!(
            "Reset pack counter for player {}. New hour started.",
            player_state.player
        );
    }

    Ok(())
}

/// Reveal leaderboard after reveal timestamp (computes and stores top 20 players)
pub fn reveal_leaderboard(ctx: Context<RevealLeaderboard>) -> Result<()> {
    let game_round = &ctx.accounts.game_round;
    let leaderboard = &mut ctx.accounts.leaderboard;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);
    require!(
        clock.unix_timestamp >= game_round.leaderboard_reveal_ts,
        PandaBattleError::LeaderboardNotReady
    );
    require!(
        !leaderboard.is_revealed,
        PandaBattleError::LeaderboardAlreadyRevealed
    );

    // Collect player data from remaining accounts
    let mut player_data: Vec<(Pubkey, u16)> = Vec::new();

    for account_info in ctx.remaining_accounts.iter() {
        // Try to deserialize as PlayerState
        let data = account_info.try_borrow_data()?;
        let mut data_slice: &[u8] = &data;
        let player_state = PlayerState::try_deserialize(&mut data_slice)?;

        // Verify player belongs to this round
        require_eq!(
            player_state.round,
            game_round.key(),
            PandaBattleError::InvalidRound
        );

        player_data.push((player_state.player, player_state.points));
    }

    // Sort by points descending
    player_data.sort_by(|a, b| b.1.cmp(&a.1));

    // Take top 20
    let top_20: Vec<LeaderboardEntry> = player_data
        .into_iter()
        .take(20)
        .map(|(player, points)| LeaderboardEntry { player, points })
        .collect();

    leaderboard.entries = top_20;
    leaderboard.is_revealed = true;
    leaderboard.round = game_round.key();

    msg!(
        "Leaderboard revealed with {} entries",
        leaderboard.entries.len()
    );

    Ok(())
}

/// Hourly jackpot distribution (post-reveal, weighted random pick from top 20)
pub fn hourly_jackpot(ctx: Context<HourlyJackpot>, client_seed: u8) -> Result<()> {
    let game_round = &ctx.accounts.game_round;
    let leaderboard = &ctx.accounts.leaderboard;
    let clock = Clock::get()?;

    require!(game_round.is_active, PandaBattleError::RoundNotActive);
    require!(
        leaderboard.is_revealed,
        PandaBattleError::LeaderboardNotRevealed
    );
    require!(
        clock.unix_timestamp >= game_round.leaderboard_reveal_ts,
        PandaBattleError::LeaderboardNotReady
    );
    require!(
        !leaderboard.entries.is_empty(),
        PandaBattleError::EmptyLeaderboard
    );

    // For now, we'll use a simple pseudo-random approach
    // In production, this should use VRF similar to battles
    // Using client_seed + clock as entropy source
    let entropy = (client_seed as u64)
        .wrapping_mul(clock.unix_timestamp as u64)
        .wrapping_mul(clock.slot);

    // Calculate weighted random selection (inverse rank odds)
    // Rank 1 gets weight 20, rank 2 gets 19, etc.
    let total_weight: u64 = (1..=leaderboard.entries.len() as u64).sum();
    let random_value = entropy % total_weight;

    let mut cumulative_weight = 0u64;
    let mut winner_index = 0usize;

    for (idx, _) in leaderboard.entries.iter().enumerate() {
        let weight = (leaderboard.entries.len() - idx) as u64;
        cumulative_weight += weight;
        if random_value < cumulative_weight {
            winner_index = idx;
            break;
        }
    }

    // Random percentage between 0.5% and 1% (50-100 basis points)
    let pct_basis_points = 50 + (entropy % 51); // 50-100 basis points
    let jackpot_amount = game_round
        .prize_pool
        .checked_mul(pct_basis_points)
        .ok_or(PandaBattleError::Overflow)?
        .checked_div(10000)
        .ok_or(PandaBattleError::Overflow)?;

    // Transfer jackpot to winner
    let global_config = &ctx.accounts.global_config;
    let global_config_key = global_config.key();
    let vault_seeds = &[
        TOKEN_VAULT_SEED,
        global_config_key.as_ref(),
        &[global_config.vault_bump],
    ];
    let signer_seeds = &[&vault_seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.winner_token_account.to_account_info(),
        authority: ctx.accounts.vault.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    token::transfer(cpi_ctx, jackpot_amount)?;

    msg!(
        "Hourly jackpot: {} tokens to winner {} (rank {})",
        jackpot_amount,
        leaderboard.entries[winner_index].player,
        winner_index + 1
    );

    Ok(())
}

// ============== CONTEXTS ==============

#[derive(Accounts)]
pub struct RegenerateTurns<'info> {
    /// Anyone can call this (crank)
    pub caller: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
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
pub struct ResetPacksIfNewHour<'info> {
    /// Anyone can call this (crank)
    pub caller: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
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
pub struct RevealLeaderboard<'info> {
    /// Anyone can call this (crank)
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
        bump = global_config.bump
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(
        seeds = [
            GAME_ROUND_SEED,
            global_config.key().as_ref(),
            game_round.round_number.to_le_bytes().as_ref()
        ],
        bump = game_round.bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        init_if_needed,
        payer = caller,
        space = 8 + Leaderboard::INIT_SPACE,
        seeds = [
            LEADERBOARD_SEED,
            game_round.key().as_ref()
        ],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,

    pub system_program: Program<'info, System>,
    // remaining_accounts: Vec<PlayerState> accounts to scan
}

#[derive(Accounts)]
pub struct HourlyJackpot<'info> {
    /// Anyone can call this (crank)
    pub caller: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
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
        bump = game_round.bump
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        seeds = [
            LEADERBOARD_SEED,
            game_round.key().as_ref()
        ],
        bump = leaderboard.bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,

    #[account(
        mut,
        seeds = [TOKEN_VAULT_SEED, global_config.key().as_ref()],
        bump = global_config.vault_bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// Winner's token account (derived from leaderboard selection)
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

/// Distribute prizes after round ends (calculates prize shares for all players)
pub fn distribute_prizes(ctx: Context<DistributePrizes>) -> Result<()> {
    let game_round = &mut ctx.accounts.game_round;
    let leaderboard = &ctx.accounts.leaderboard;

    require!(!game_round.is_active, PandaBattleError::RoundNotEnded);
    require!(
        !game_round.payouts_processed,
        PandaBattleError::AlreadyClaimed
    );
    require!(
        leaderboard.is_revealed,
        PandaBattleError::LeaderboardNotRevealed
    );

    let total_prize_pool = game_round.prize_pool;
    let top20_pool = total_prize_pool
        .checked_mul(80)
        .ok_or(PandaBattleError::Overflow)?
        .checked_div(100)
        .ok_or(PandaBattleError::Overflow)?;
    let rest_pool = total_prize_pool
        .checked_sub(top20_pool)
        .ok_or(PandaBattleError::Underflow)?;

    // Calculate total points for top 20
    let total_top20_points: u64 = leaderboard.entries.iter().map(|e| e.points as u64).sum();

    // Process top 20 players (proportional to points)
    for entry in leaderboard.entries.iter() {
        // Find the player state in remaining accounts
        for account_info in ctx.remaining_accounts.iter() {
            let data = account_info.try_borrow_data()?;
            let mut data_slice: &[u8] = &data;

            // Try to deserialize as PlayerState
            if let Ok(mut player_state) = PlayerState::try_deserialize(&mut data_slice) {
                if player_state.player == entry.player {
                    // Calculate proportional share
                    let share = if total_top20_points > 0 {
                        top20_pool
                            .checked_mul(entry.points as u64)
                            .ok_or(PandaBattleError::Overflow)?
                            .checked_div(total_top20_points)
                            .ok_or(PandaBattleError::Overflow)?
                    } else {
                        0
                    };

                    player_state.prize_share = share;

                    // Serialize back
                    drop(data);
                    let mut data = account_info.try_borrow_mut_data()?;
                    let mut data_slice: &mut [u8] = &mut data;
                    player_state.try_serialize(&mut data_slice)?;

                    msg!(
                        "Top 20 player {} allocated {} tokens ({} points)",
                        entry.player,
                        share,
                        entry.points
                    );
                    break;
                }
            }
        }
    }

    // Calculate equal share for remaining players
    let top20_players: Vec<Pubkey> = leaderboard.entries.iter().map(|e| e.player).collect();
    let mut rest_player_count = 0u32;

    // Count non-top20 players
    for account_info in ctx.remaining_accounts.iter() {
        let data = account_info.try_borrow_data()?;
        let mut data_slice: &[u8] = &data;

        if let Ok(player_state) = PlayerState::try_deserialize(&mut data_slice) {
            if !top20_players.contains(&player_state.player) {
                rest_player_count += 1;
            }
        }
    }

    // Distribute equal share to rest
    if rest_player_count > 0 {
        let equal_share = rest_pool
            .checked_div(rest_player_count as u64)
            .ok_or(PandaBattleError::Overflow)?;

        for account_info in ctx.remaining_accounts.iter() {
            let data = account_info.try_borrow_data()?;
            let mut data_slice: &[u8] = &data;

            if let Ok(mut player_state) = PlayerState::try_deserialize(&mut data_slice) {
                if !top20_players.contains(&player_state.player) {
                    player_state.prize_share = equal_share;

                    // Serialize back
                    drop(data);
                    let mut data = account_info.try_borrow_mut_data()?;
                    let mut data_slice: &mut [u8] = &mut data;
                    player_state.try_serialize(&mut data_slice)?;

                    msg!(
                        "Rest player {} allocated {} tokens (equal share)",
                        player_state.player,
                        equal_share
                    );
                }
            }
        }
    }

    // Mark payouts as processed
    game_round.payouts_processed = true;

    msg!(
        "Prize distribution complete. Top 20 pool: {}, Rest pool: {}, Rest players: {}",
        top20_pool,
        rest_pool,
        rest_player_count
    );

    Ok(())
}

#[derive(Accounts)]
pub struct DistributePrizes<'info> {
    /// Anyone can call this (crank)
    pub caller: Signer<'info>,

    #[account(
        seeds = [GLOBAL_CONFIG_SEED, &global_config.id.to_le_bytes()],
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
        constraint = !game_round.is_active @ PandaBattleError::RoundNotEnded,
        constraint = !game_round.payouts_processed @ PandaBattleError::AlreadyClaimed
    )]
    pub game_round: Account<'info, GameRound>,

    #[account(
        seeds = [
            LEADERBOARD_SEED,
            game_round.key().as_ref()
        ],
        bump = leaderboard.bump,
        constraint = leaderboard.is_revealed @ PandaBattleError::LeaderboardNotRevealed
    )]
    pub leaderboard: Account<'info, Leaderboard>,

    pub system_program: Program<'info, System>,
    // remaining_accounts: Vec<PlayerState> accounts to update with prize shares
}
