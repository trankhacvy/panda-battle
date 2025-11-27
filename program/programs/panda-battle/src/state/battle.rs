use anchor_lang::prelude::*;

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum MoveType {
    Attack,
    Defend,
    Technique,
    Special,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum BattleStatus {
    InProgress,
    PlayerWon,
    OpponentWon,
    Forfeit,
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct TurnOutcome {
    pub turn_number: u32,
    pub player_move: MoveType,
    pub opponent_move: MoveType,
    pub player_damage_dealt: u16,
    pub opponent_damage_dealt: u16,
    pub effects_applied: u8, // Bitmask: bit 0 = crit, bit 1 = defend, etc.
    pub player_hp_after: u16,
    pub opponent_hp_after: u16,
}

#[account]
pub struct BattleState {
    // Battle Identity
    pub battle_id: [u8; 32],
    pub bump: u8,

    // Participants
    pub player_pubkey: Pubkey,
    pub player_panda_mint: Pubkey,
    pub opponent_pubkey: Pubkey,
    pub opponent_panda_mint: Pubkey,

    // Battle State
    pub status: BattleStatus,
    pub current_turn: u32,
    pub max_turns: u32,

    // HP Tracking
    pub player_current_hp: u16,
    pub opponent_current_hp: u16,
    pub player_base_hp: u16,
    pub opponent_base_hp: u16,

    // Move Cooldowns (turns remaining before move is available)
    pub player_special_cooldown: u32,
    pub opponent_special_cooldown: u32,

    // Turn History
    pub turn_log: Vec<TurnOutcome>,

    // Rewards (populated when battle ends)
    pub winner_reward_bamboo: u64,
    pub loser_reward_bamboo: u64,
    pub rating_delta: i32,

    // Randomness seed for deterministic outcomes
    pub battle_seed: [u8; 32],

    // Timestamps
    pub created_at: i64,
    pub ended_at: i64,

    // Versioning
    pub version: u8,
}

impl BattleState {
    pub const DISCRIMINATOR_SIZE: usize = 8;
    pub const MAX_TURN_LOG_SIZE: usize = 1000; // ~100 bytes per turn * 10 turns

    pub fn size() -> usize {
        8 + // discriminator
        32 + // battle_id
        1 + // bump
        32 + // player_pubkey
        32 + // player_panda_mint
        32 + // opponent_pubkey
        32 + // opponent_panda_mint
        1 + // status
        4 + // current_turn
        4 + // max_turns
        2 + // player_current_hp
        2 + // opponent_current_hp
        2 + // player_base_hp
        2 + // opponent_base_hp
        4 + // player_special_cooldown
        4 + // opponent_special_cooldown
        4 + Self::MAX_TURN_LOG_SIZE + // turn_log (vec header + data)
        8 + // winner_reward_bamboo
        8 + // loser_reward_bamboo
        4 + // rating_delta
        32 + // battle_seed
        8 + // created_at
        8 + // ended_at
        1 // version
    }
}
