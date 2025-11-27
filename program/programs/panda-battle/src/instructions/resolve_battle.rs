use anchor_lang::prelude::*;
use crate::state::{BattleState, BattleStatus, BattleRecord};
use crate::events::BattleResolved;
use crate::error::ErrorCode;
use crate::utils::calculate_rating_delta;

#[derive(Accounts)]
pub struct ResolveBattle<'info> {
    #[account(mut)]
    pub initiator: Signer<'info>,

    /// Battle state account
    #[account(mut)]
    pub battle_state: Account<'info, BattleState>,

    /// Battle record account (new, stores result)
    #[account(
        init,
        seeds = [b"battle_record", battle_state.battle_id.as_ref()],
        bump,
        payer = initiator,
        space = 8 + BattleRecord::size(),
    )]
    pub battle_record: Account<'info, BattleRecord>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ResolveBattle>) -> Result<()> {
    let battle_state = &mut ctx.accounts.battle_state;
    let battle_record = &mut ctx.accounts.battle_record;

    // Validate battle is completed
    require!(
        battle_state.status != BattleStatus::InProgress,
        ErrorCode::BattleNotInProgress
    );

    // Determine winner and rating deltas
    let (winner_pubkey, player_rating_delta, opponent_rating_delta) = match battle_state.status {
        BattleStatus::PlayerWon => {
            let delta = calculate_rating_delta(1600, 1600, true); // TODO: Use actual ratings
            let opponent_delta = -delta;
            (battle_state.player_pubkey, delta, opponent_delta)
        }
        BattleStatus::OpponentWon => {
            let delta = calculate_rating_delta(1600, 1600, false);
            let opponent_delta = -delta;
            (battle_state.opponent_pubkey, delta, opponent_delta)
        }
        BattleStatus::Forfeit => {
            // Winner was opponent
            let delta = calculate_rating_delta(1600, 1600, false);
            let opponent_delta = -delta;
            (battle_state.opponent_pubkey, delta, opponent_delta)
        }
        BattleStatus::InProgress => return Err(ErrorCode::BattleNotInProgress.into()),
    };

    // Update rating delta on battle state
    battle_state.rating_delta = player_rating_delta;

    // Calculate total damage from turn log
    let mut player_total_damage = 0u64;
    let mut opponent_total_damage = 0u64;

    for turn in &battle_state.turn_log {
        player_total_damage += turn.player_damage_dealt as u64;
        opponent_total_damage += turn.opponent_damage_dealt as u64;
    }

    // Create battle record
    battle_record.battle_id = battle_state.battle_id;
    battle_record.bump = *ctx.bumps.get("battle_record").unwrap();

    battle_record.player_pubkey = battle_state.player_pubkey;
    battle_record.player_panda_mint = battle_state.player_panda_mint;
    battle_record.opponent_pubkey = battle_state.opponent_pubkey;
    battle_record.opponent_panda_mint = battle_state.opponent_panda_mint;

    battle_record.status = battle_state.status;
    battle_record.winner_pubkey = winner_pubkey;
    battle_record.winner_reward_bamboo = battle_state.winner_reward_bamboo;
    battle_record.loser_reward_bamboo = battle_state.loser_reward_bamboo;
    battle_record.player_rating_delta = player_rating_delta;
    battle_record.opponent_rating_delta = opponent_rating_delta;

    battle_record.total_turns = battle_state.current_turn;
    battle_record.player_total_damage = player_total_damage;
    battle_record.opponent_total_damage = opponent_total_damage;

    battle_record.created_at = battle_state.created_at;
    battle_record.ended_at = Clock::get()?.unix_timestamp;

    battle_record.version = 1;

    // Emit event
    emit!(BattleResolved {
        battle_id: battle_state.battle_id,
        winner_pubkey,
        winner_reward: battle_state.winner_reward_bamboo,
        loser_reward: battle_state.loser_reward_bamboo,
        player_rating_delta,
        opponent_rating_delta,
        total_turns: battle_state.current_turn,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Battle resolved - Winner: {:?}, Reward: {}",
        winner_pubkey,
        battle_state.winner_reward_bamboo
    );

    Ok(())
}
