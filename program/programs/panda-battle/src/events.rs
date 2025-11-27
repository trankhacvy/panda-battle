use anchor_lang::prelude::*;

#[event]
pub struct BattleEnqueued {
    pub player_pubkey: Pubkey,
    pub panda_mint: Pubkey,
    pub stake_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct BattleStarted {
    pub battle_id: [u8; 32],
    pub player1_pubkey: Pubkey,
    pub player1_panda: Pubkey,
    pub player2_pubkey: Pubkey,
    pub player2_panda: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TurnSubmitted {
    pub battle_id: [u8; 32],
    pub turn_number: u32,
    pub player_move: u8, // 0=Attack, 1=Defend, 2=Technique, 3=Special
    pub opponent_move: u8,
    pub player_damage: u16,
    pub opponent_damage: u16,
    pub player_hp: u16,
    pub opponent_hp: u16,
    pub timestamp: i64,
}

#[event]
pub struct BattleResolved {
    pub battle_id: [u8; 32],
    pub winner_pubkey: Pubkey,
    pub winner_reward: u64,
    pub loser_reward: u64,
    pub player_rating_delta: i32,
    pub opponent_rating_delta: i32,
    pub total_turns: u32,
    pub timestamp: i64,
}

#[event]
pub struct BattleForfeited {
    pub battle_id: [u8; 32],
    pub forfeiter_pubkey: Pubkey,
    pub winner_pubkey: Pubkey,
    pub timestamp: i64,
}
