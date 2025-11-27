use anchor_lang::prelude::*;

#[account]
pub struct PlayerProfile {
    // Identity & Auth
    pub player_pubkey: Pubkey,           // [32] Player's wallet
    pub bump: u8,                         // [1] PDA bump seed
    pub authority: Pubkey,                // [32] Authority signer (usually = player)
    
    // Profile Data
    pub name: String,                     // [4 + 20] Max 20 chars
    pub avatar_url: String,               // [4 + 256] IPFS/CDN URL
    pub bio: String,                      // [4 + 160] Max 160 chars
    pub region: Option<String>,           // [1 + 4 + 64] Optional region tag
    
    // Statistics (Updated after each battle)
    pub total_wins: u32,                  // [4] Lifetime wins
    pub total_losses: u32,                // [4] Lifetime losses
    pub current_rating: i32,              // [4] Current Elo rating (1000-3000)
    pub peak_rating: i32,                 // [4] Highest rating achieved
    
    // XP & Progression
    pub total_xp: u64,                    // [8] Total experience points
    pub level: u32,                       // [4] Derived from XP
    
    // Inventory
    pub active_panda_mint: Option<Pubkey>, // [1 + 32] Current battle panda NFT mint
    pub pandas_owned: u32,                 // [4] Count of panda NFTs owned
    pub total_bamboo_earned: u64,         // [8] Lifetime Bamboo tokens earned
    pub total_bamboo_spent: u64,          // [8] Lifetime Bamboo tokens spent
    
    // Badges & Achievements
    pub badges: Vec<u8>,                  // [4 + ?] Badge IDs earned
    
    // Timestamps
    pub created_at: i64,                  // [8] Unix timestamp (account creation)
    pub last_battle_at: i64,              // [8] Unix timestamp (last battle)
    pub updated_at: i64,                  // [8] Last profile update
    
    // Flags & Versioning
    pub version: u8,                      // [1] Account schema version
    pub is_banned: bool,                  // [1] Suspension flag
}

impl PlayerProfile {
    pub const MAX_NAME_LEN: usize = 20;
    pub const MAX_AVATAR_URL_LEN: usize = 256;
    pub const MAX_BIO_LEN: usize = 160;
    pub const MAX_REGION_LEN: usize = 64;
    pub const MAX_BADGES: usize = 50;
    
    pub const CURRENT_VERSION: u8 = 1;
    pub const MIN_RATING: i32 = 1000;
    pub const MAX_RATING: i32 = 3000;
    pub const STARTING_RATING: i32 = 1200;
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // player_pubkey
        1 + // bump
        32 + // authority
        (4 + 20) + // name (max 20 chars)
        (4 + 256) + // avatar_url (max 256 chars)
        (4 + 160) + // bio (max 160 chars)
        (1 + 4 + 64) + // region (optional)
        4 + // total_wins
        4 + // total_losses
        4 + // current_rating
        4 + // peak_rating
        8 + // total_xp
        4 + // level
        (1 + 32) + // active_panda_mint (optional)
        4 + // pandas_owned
        8 + // total_bamboo_earned
        8 + // total_bamboo_spent
        (4 + 50) + // badges (max 50)
        8 + // created_at
        8 + // last_battle_at
        8 + // updated_at
        1 + // version
        1 // is_banned
    }
}
