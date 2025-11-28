use anchor_lang::prelude::*;

// ============== GAME CONSTANTS ==============

/// Maximum turns a player can hold
pub const MAX_TURNS: u8 = 9;

/// Starting turns when joining a round
pub const STARTING_TURNS: u8 = 3;

/// Turns regenerated per hour
pub const TURNS_PER_HOUR: u8 = 3;

/// Turn regeneration interval in seconds (1 hour)
pub const TURN_REGEN_INTERVAL: i64 = 3600;

/// Minimum battles required for payout eligibility
pub const MIN_BATTLES_FOR_PAYOUT: u16 = 5;

/// Idle threshold in seconds (1 hour)
pub const IDLE_THRESHOLD: i64 = 3600;

/// Base attribute value for randomization (100-200 range)
pub const BASE_ATTRIBUTE_MIN: u16 = 100;
pub const BASE_ATTRIBUTE_MAX: u16 = 200;

/// Late join penalty thresholds (in seconds from round start)
pub const LATE_JOIN_TIER1: i64 = 21600;  // 6 hours
pub const LATE_JOIN_TIER2: i64 = 43200;  // 12 hours

/// Late join fee multipliers (in basis points, 10000 = 100%)
pub const LATE_JOIN_FEE_TIER1: u64 = 12500;  // 125%
pub const LATE_JOIN_FEE_TIER2: u64 = 15000;  // 150%

/// Late join attribute penalty (in basis points)
pub const LATE_JOIN_ATTR_PENALTY_TIER1: u16 = 1000;  // 10%
pub const LATE_JOIN_ATTR_PENALTY_TIER2: u16 = 2000;  // 20%

/// Turn price multipliers for progressive pricing (in basis points)
pub const TURN_PRICE_MULTIPLIER_2: u64 = 15000;  // 150% for 2nd turn
pub const TURN_PRICE_MULTIPLIER_3: u64 = 20000;  // 200% for 3rd+ turn

/// Maximum steal percentage cap
pub const MAX_STEAL_PERCENTAGE: u8 = 25;

/// Seeds for PDA derivation
pub const GAME_CONFIG_SEED: &[u8] = b"game_config";
pub const GAME_ROUND_SEED: &[u8] = b"game_round";
pub const PLAYER_STATE_SEED: &[u8] = b"player_state";
pub const VAULT_SEED: &[u8] = b"vault";
