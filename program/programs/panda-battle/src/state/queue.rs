use anchor_lang::prelude::*;

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct QueuedPlayer {
    pub player_pubkey: Pubkey,
    pub panda_mint: Pubkey,
    pub stake_amount: u64,
    pub joined_at: i64,
}

#[account]
pub struct BattleQueue {
    pub season: u32,
    pub bump: u8,
    pub queued_players: Vec<QueuedPlayer>,
    pub created_at: i64,
    pub version: u8,
}

impl BattleQueue {
    pub const DISCRIMINATOR_SIZE: usize = 8;
    pub const MAX_QUEUE_SIZE: usize = 10000; // ~50 bytes per player * 200 max players

    pub fn size() -> usize {
        8 + // discriminator
        4 + // season
        1 + // bump
        4 + Self::MAX_QUEUE_SIZE + // queued_players (vec header + data)
        8 + // created_at
        1 // version
    }
}
