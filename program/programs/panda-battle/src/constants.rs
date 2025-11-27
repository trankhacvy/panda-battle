use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

// Battle constants
#[constant]
pub const MAX_TURNS_PER_BATTLE: u32 = 10;

#[constant]
pub const INITIAL_HP_BASE: u16 = 100;

#[constant]
pub const INITIAL_HP_MAX: u16 = 150;

#[constant]
pub const SPECIAL_MOVE_COOLDOWN: u32 = 2;

#[constant]
pub const MIN_STAKE_AMOUNT: u64 = 1000; // 0.001 tokens (assuming 9 decimals)

#[constant]
pub const WINNER_REWARD_BAMBOO: u64 = 50000; // 0.05 tokens

#[constant]
pub const LOSER_REWARD_BAMBOO: u64 = 10000; // 0.01 tokens

#[constant]
pub const QUEUE_SEASON_LENGTH_SECONDS: i64 = 3600; // 1 hour seasons

#[constant]
pub const PLAYER_BATTLE_COOLDOWN_SECONDS: i64 = 60; // 1 minute between battles
