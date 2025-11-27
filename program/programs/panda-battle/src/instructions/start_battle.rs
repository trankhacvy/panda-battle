use anchor_lang::prelude::*;
use crate::state::{BattleQueue, BattleState, BattleStatus};
use crate::events::BattleStarted;
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct StartBattle<'info> {
    #[account(mut)]
    pub initiator: Signer<'info>,

    /// Battle queue containing queued players
    #[account(
        mut,
        seeds = [b"battle_queue", get_current_season().to_le_bytes().as_ref()],
        bump,
    )]
    pub battle_queue: Account<'info, BattleQueue>,

    /// Battle state account (new)
    #[account(
        init,
        seeds = [b"battle_state", battle_id.as_ref()],
        bump,
        payer = initiator,
        space = 8 + BattleState::size(),
    )]
    pub battle_state: Account<'info, BattleState>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<StartBattle>,
    battle_id: [u8; 32],
    player1_hp: u16,
    player2_hp: u16,
) -> Result<()> {
    let queue = &mut ctx.accounts.battle_queue;
    let battle_state = &mut ctx.accounts.battle_state;

    // Require at least 2 players in queue
    require!(
        queue.queued_players.len() >= 2,
        ErrorCode::NotEnoughPlayersInQueue
    );

    // Pop first two players from queue
    let player1_queued = queue.queued_players.remove(0);
    let player2_queued = queue.queued_players.remove(0);

    // Create battle seed from battle_id (deterministic randomness)
    let mut battle_seed = [0u8; 32];
    battle_seed.copy_from_slice(&battle_id);

    // Initialize battle state
    battle_state.battle_id = battle_id;
    battle_state.bump = *ctx.bumps.get("battle_state").unwrap();

    battle_state.player_pubkey = player1_queued.player_pubkey;
    battle_state.player_panda_mint = player1_queued.panda_mint;
    battle_state.opponent_pubkey = player2_queued.player_pubkey;
    battle_state.opponent_panda_mint = player2_queued.panda_mint;

    battle_state.status = BattleStatus::InProgress;
    battle_state.current_turn = 0;
    battle_state.max_turns = MAX_TURNS_PER_BATTLE;

    battle_state.player_current_hp = player1_hp;
    battle_state.opponent_current_hp = player2_hp;
    battle_state.player_base_hp = player1_hp;
    battle_state.opponent_base_hp = player2_hp;

    battle_state.player_special_cooldown = 0;
    battle_state.opponent_special_cooldown = 0;

    battle_state.turn_log = Vec::new();

    battle_state.winner_reward_bamboo = WINNER_REWARD_BAMBOO;
    battle_state.loser_reward_bamboo = LOSER_REWARD_BAMBOO;
    battle_state.rating_delta = 0;

    battle_state.battle_seed = battle_seed;

    battle_state.created_at = Clock::get()?.unix_timestamp;
    battle_state.ended_at = 0;

    battle_state.version = 1;

    // Emit event
    emit!(BattleStarted {
        battle_id,
        player1_pubkey: player1_queued.player_pubkey,
        player1_panda: player1_queued.panda_mint,
        player2_pubkey: player2_queued.player_pubkey,
        player2_panda: player2_queued.panda_mint,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Battle started between {:?} and {:?}",
        player1_queued.player_pubkey,
        player2_queued.player_pubkey
    );

    Ok(())
}

/// Get current season number based on timestamp
fn get_current_season() -> u32 {
    let now = Clock::get().map(|c| c.unix_timestamp).unwrap_or(0);
    (now / QUEUE_SEASON_LENGTH_SECONDS) as u32
}
