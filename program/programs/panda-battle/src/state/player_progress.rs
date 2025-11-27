use anchor_lang::prelude::*;

#[account]
pub struct PlayerProgress {
    // Identity & Auth
    pub player_pubkey: Pubkey,           // [32] Player's wallet
    pub bump: u8,                         // [1] PDA bump seed
    
    // Battle Statistics
    pub battles_completed: u32,           // [4] Total battles played
    pub consecutive_wins: u32,            // [4] Current win streak
    pub max_consecutive_wins: u32,        // [4] Best win streak
    
    // Forge Cooldowns
    pub last_forge_at: i64,               // [8] Last panda forge timestamp
    pub forge_cooldown_seconds: u32,      // [4] Cooldown duration
    
    // Activity Tracking
    pub last_activity_at: i64,            // [8] Last any activity timestamp
    pub daily_battles_played: u32,        // [4] Battles played today
    pub daily_pandas_forged: u32,         // [4] Pandas forged today
    pub daily_reset_at: i64,              // [8] When daily stats reset
    
    // Progression
    pub total_xp_earned: u64,             // [8] Total XP from all activities
    pub battle_xp_multiplier: u8,         // [1] Percentage (100 = 1.0x)
    pub forge_xp_multiplier: u8,          // [1] Percentage (100 = 1.0x)
    
    // Timestamps & Versioning
    pub created_at: i64,                  // [8] Account creation time
    pub updated_at: i64,                  // [8] Last progress update
    pub version: u8,                      // [1] Account schema version
}

impl PlayerProgress {
    pub const CURRENT_VERSION: u8 = 1;
    pub const DEFAULT_FORGE_COOLDOWN_SECONDS: u32 = 3600; // 1 hour
    pub const MAX_DAILY_BATTLES: u32 = 50;
    pub const MAX_DAILY_FORGES: u32 = 10;
    pub const DAILY_RESET_HOUR: u32 = 0; // UTC
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // player_pubkey
        1 + // bump
        4 + // battles_completed
        4 + // consecutive_wins
        4 + // max_consecutive_wins
        8 + // last_forge_at
        4 + // forge_cooldown_seconds
        8 + // last_activity_at
        4 + // daily_battles_played
        4 + // daily_pandas_forged
        8 + // daily_reset_at
        8 + // total_xp_earned
        1 + // battle_xp_multiplier
        1 + // forge_xp_multiplier
        8 + // created_at
        8 + // updated_at
        1 // version
    }
}

#[event]
pub struct PlayerActivityRecorded {
    pub player: Pubkey,
    pub activity_type: ActivityType,
    pub xp_earned: u64,
    pub timestamp: i64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum ActivityType {
    BattleWon,
    BattleLost,
    PandaForged,
    AchievementUnlocked,
}
