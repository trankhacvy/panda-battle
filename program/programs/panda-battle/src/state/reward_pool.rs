use anchor_lang::prelude::*;

#[account]
pub struct RewardPool {
    pub pool_id: u64,
    pub total_rewards: u64,
    pub distributed_rewards: u64,
    pub max_claimable: u64,
    pub season: u32,
    pub created_at: i64,
    pub expires_at: i64,
    pub bump: u8,
    pub version: u8,
}

impl RewardPool {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8 + 32 + 32 + 1 + 1;
}

#[account]
pub struct PlayerRewardClaim {
    pub player: Pubkey,
    pub pool_id: u64,
    pub amount_claimed: u64,
    pub claimed_at: i64,
    pub bump: u8,
}

impl PlayerRewardClaim {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1;
}

#[event]
pub struct RewardPoolCreated {
    pub pool_id: u64,
    pub total_rewards: u64,
    pub max_claimable: u64,
    pub season: u32,
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimed {
    pub player: Pubkey,
    pub pool_id: u64,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardsDistributed {
    pub player: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct TokensSpent {
    pub player: Pubkey,
    pub amount: u64,
    pub action: String,
    pub timestamp: i64,
}
