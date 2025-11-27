use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

#[constant]
pub const TREASURY_SEED: &str = "treasury";

#[constant]
pub const REWARD_POOL_SEED: &str = "reward_pool";

#[constant]
pub const PLAYER_REWARD_CLAIM_SEED: &str = "player_reward_claim";

// Token economy constants
#[constant]
pub const BATTLE_WIN_REWARD: u64 = 100_000_000; // 100 Bamboo (in lamports)

#[constant]
pub const BATTLE_LOSS_REWARD: u64 = 25_000_000; // 25 Bamboo (in lamports)

#[constant]
pub const PANDA_FORGE_COST: u64 = 50_000_000; // 50 Bamboo (in lamports)

#[constant]
pub const CLAIM_REWARD_COST: u64 = 5_000_000; // 5 Bamboo (in lamports)

#[constant]
pub const MAX_SEASON_REWARDS: u64 = 1_000_000_000_000; // 1B Bamboo (in lamports)

#[constant]
pub const REWARD_POOL_DECIMALS: u8 = 9;

#[constant]
pub const TREASURY_BUMP: &[u8] = b"treasury_bump";
