use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

// PandaNFT Account Seeds
#[constant]
pub const PANDA_METADATA_SEED: &str = "panda_metadata";

// Breeding Session Seeds
#[constant]
pub const BREEDING_SESSION_SEED: &str = "breeding_session";

// Economic Parameters
#[constant]
pub const FORGE_PANDA_COST: u64 = 100_000_000; // 100 Bamboo in smallest units

#[constant]
pub const BREEDING_COST: u64 = 50_000_000; // 50 Bamboo in smallest units

#[constant]
pub const OFFSPRING_MINT_COST: u64 = 25_000_000; // 25 Bamboo in smallest units

// Breeding Cooldowns (in seconds)
#[constant]
pub const PANDA_BREEDING_COOLDOWN: i64 = 7 * 24 * 60 * 60; // 7 days

#[constant]
pub const BREEDING_SESSION_TIMEOUT: i64 = 48 * 60 * 60; // 48 hours

// Supply Caps
#[constant]
pub const MAX_PANDAS_PER_PLAYER: u32 = 100;

#[constant]
pub const MAX_TOTAL_PANDAS: u32 = 10_000;

#[constant]
pub const MAX_GENERATIONS: u8 = 10;

#[constant]
pub const MAX_BREED_COUNT: u8 = 5; // Maximum breeding attempts per panda
