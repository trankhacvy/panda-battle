use anchor_lang::prelude::*;
use crate::state::BattleStatus;

#[account]
pub struct BattleRecord {
    pub battle_id: [u8; 32],
    pub bump: u8,

    // Participants
    pub player_pubkey: Pubkey,
    pub player_panda_mint: Pubkey,
    pub opponent_pubkey: Pubkey,
    pub opponent_panda_mint: Pubkey,

    // Outcome
    pub status: BattleStatus,
    pub winner_pubkey: Pubkey,
    pub winner_reward_bamboo: u64,
    pub loser_reward_bamboo: u64,
    pub player_rating_delta: i32,
    pub opponent_rating_delta: i32,

    // Stats
    pub total_turns: u32,
    pub player_total_damage: u64,
    pub opponent_total_damage: u64,

    // Timestamps
    pub created_at: i64,
    pub ended_at: i64,

    // Versioning
    pub version: u8,
}

impl BattleRecord {
    pub const DISCRIMINATOR_SIZE: usize = 8;

    pub fn size() -> usize {
        8 + // discriminator
        32 + // battle_id
        1 + // bump
        32 + // player_pubkey
        32 + // player_panda_mint
        32 + // opponent_pubkey
        32 + // opponent_panda_mint
        1 + // status
        32 + // winner_pubkey
        8 + // winner_reward_bamboo
        8 + // loser_reward_bamboo
        4 + // player_rating_delta
        4 + // opponent_rating_delta
        4 + // total_turns
        8 + // player_total_damage
        8 + // opponent_total_damage
        8 + // created_at
        8 + // ended_at
        1 // version
    }
}
