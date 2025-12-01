// ============== GAME CONSTANTS ==============

/// Maximum turns a player can hold
pub const MAX_TURNS: u8 = 9;

/// Starting turns when joining a round
pub const STARTING_TURNS: u8 = 3;

/// Turns regenerated per hour
pub const TURNS_PER_HOUR: u8 = 3;

/// Turn regeneration interval in seconds (1 hour)
pub const TURN_REGEN_INTERVAL: i64 = 3600;

/// Base attribute value for randomization (5-15 range for u8)
pub const BASE_ATTRIBUTE_MIN: u8 = 5;
pub const BASE_ATTRIBUTE_MAX: u8 = 15;

/// Late join penalty thresholds (in seconds from round start)
pub const LATE_JOIN_TIER1: i64 = 21600; // 6 hours
pub const LATE_JOIN_TIER2: i64 = 43200; // 12 hours

/// Late join fee multipliers (in basis points, 10000 = 100%)
pub const LATE_JOIN_FEE_TIER1: u64 = 12500; // 125%
pub const LATE_JOIN_FEE_TIER2: u64 = 15000; // 150%

/// Late join attribute penalty (in basis points)
pub const LATE_JOIN_ATTR_PENALTY_TIER1: u16 = 1000; // 10%
pub const LATE_JOIN_ATTR_PENALTY_TIER2: u16 = 2000; // 20%

/// Turn price multipliers for progressive pricing (in basis points)
pub const TURN_PRICE_MULTIPLIER_2: u64 = 15000; // 150% for 2nd turn
pub const TURN_PRICE_MULTIPLIER_3: u64 = 20000; // 200% for 3rd+ turn

/// Seeds for PDA derivation
pub const GLOBAL_CONFIG_SEED: &[u8] = b"global_config";
pub const GAME_ROUND_SEED: &[u8] = b"game_round";
pub const PLAYER_STATE_SEED: &[u8] = b"player_state";
pub const VAULT_SEED: &[u8] = b"vault";
pub const LEADERBOARD_SEED: &[u8] = b"leaderboard";

// ============== LEVEL SYSTEM CONSTANTS ==============

/// XP thresholds for each level (cumulative)
/// Level 0->1: 5 XP, 1->2: 10 XP, 2->3: 15 XP, ..., 9->10: 50 XP
/// Total to reach level 10: 275 XP
pub const LEVEL_XP_THRESHOLDS: [u32; 11] = [
    0,   // Level 0 (starting)
    5,   // Level 1
    15,  // Level 2 (5 + 10)
    30,  // Level 3 (15 + 15)
    50,  // Level 4 (30 + 20)
    75,  // Level 5 (50 + 25)
    105, // Level 6 (75 + 30)
    140, // Level 7 (105 + 35)
    180, // Level 8 (140 + 40)
    225, // Level 9 (180 + 45)
    275, // Level 10 (225 + 50)
];

/// XP gained per win
pub const XP_PER_WIN: u32 = 3;

/// Maximum level
pub const MAX_LEVEL: u8 = 10;

/// Maximum attribute cap (base 5-15 + 5 from levels = 20 max)
pub const MAX_ATTRIBUTE: u8 = 20;

// ============== BATTLE CONSTANTS ==============

/// Maximum battle turns
pub const MAX_BATTLE_TURNS: u8 = 10;

/// Base HP constant
pub const BASE_HP: u16 = 100;

/// Crit damage multiplier (50% = 0.5, stored as basis points)
pub const CRIT_DAMAGE_MULTIPLIER: u16 = 5000; // 50% in basis points (10000 = 100%)
