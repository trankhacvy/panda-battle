use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

// Player Profile Constants
#[constant]
pub const PLAYER_PROFILE_SEED: &str = "player_profile";

// Player Progress Constants
#[constant]
pub const PLAYER_PROGRESS_SEED: &str = "player_progress";

// Player Limits
#[constant]
pub const MAX_PLAYERS: u32 = 1_000_000;

#[constant]
pub const MAX_PANDAS_PER_PLAYER: u32 = 100;

#[constant]
pub const FORGE_COOLDOWN_SECONDS: u32 = 3600; // 1 hour

#[constant]
pub const MAX_DAILY_BATTLES: u32 = 50;

#[constant]
pub const MAX_DAILY_FORGES: u32 = 10;

// Rating Constants
#[constant]
pub const MIN_RATING: i32 = 1000;

#[constant]
pub const MAX_RATING: i32 = 3000;

#[constant]
pub const STARTING_RATING: i32 = 1200;

#[constant]
pub const ELO_K_FACTOR: i32 = 32; // Rating change multiplier
