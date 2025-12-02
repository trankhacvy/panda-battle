use anchor_lang::prelude::*;

/// Global game configuration account
#[account]
#[derive(Default, InitSpace)]
pub struct GlobalConfig {
    /// Unique ID for this game instance
    pub id: u64,

    /// Admin authority
    pub admin: Pubkey,

    /// Current active round number
    pub current_round: u64,

    /// Total rounds played
    pub total_rounds: u64,

    /// Bump seed for PDA
    pub bump: u8,

    /// Vault bump seed
    pub vault_bump: u8,
}

impl GlobalConfig {}

/// Game round state
#[account]
#[derive(Default, InitSpace)]
pub struct GameRound {
    /// Reference to global config
    pub global_config: Pubkey,

    /// Token mint for the game
    pub token_mint: Pubkey,

    /// Round number
    pub round_number: u64,

    /// Entry fee in tokens (e.g., $1.99 worth)
    pub entry_fee: u64,

    /// Attack pack base price in tokens (e.g., $0.10 worth)
    pub attack_pack_price: u64,

    /// Round duration in seconds (e.g., 24 hours = 86400)
    pub duration_secs: i64,

    /// Entry fee hourly increase percentage (default: 1%)
    pub entry_hourly_inc_pct: u8,

    /// Round start timestamp
    pub start_time: i64,

    /// Round end timestamp
    pub end_time: i64,

    /// Leaderboard reveal timestamp (12 hours after start)
    pub leaderboard_reveal_ts: i64,

    /// Total prize pool in tokens
    pub prize_pool: u64,

    /// Number of players in this round
    pub player_count: u32,

    /// Total battles fought this round
    pub total_battles: u32,

    /// Whether the round is active
    pub is_active: bool,

    /// Whether payouts have been processed
    pub payouts_processed: bool,

    /// Bump seed for PDA
    pub bump: u8,
}

/// Player state for a specific round
#[account]
#[derive(Default, InitSpace)]
pub struct PlayerState {
    /// Player's wallet address
    pub player: Pubkey,

    /// Reference to the game round
    pub round: Pubkey,

    // ===== ATTRIBUTES (u8, init 5-15, max 15 with levels) =====
    /// Strength attribute (damage output)
    pub str: u8,

    /// Agility attribute (turn order, dodge chance, crit chance)
    pub agi: u8,

    /// Intelligence attribute (damage mitigation)
    pub int: u8,

    // ===== PROGRESSION =====
    /// Current level (0-10, starts at 0)
    pub level: u8,

    /// Current experience points
    pub xp: u32,

    /// Leaderboard points (wins = +1 point)
    pub points: u16,

    // ===== TURNS =====
    /// Current available turns
    pub turns: u8,

    /// Maximum turn storage (default 50)
    pub max_turns: u8,

    /// Last turn regeneration timestamp
    pub last_turn_regen: i64,

    // ===== REROLLS =====
    /// Number of rerolls used (max 3)
    pub rerolls_used: u8,

    // ===== ATTACK PACKS =====
    /// Number of attack packs bought in current hour
    pub packs_bought_hour: u8,

    /// Last hour when pack was bought (unix timestamp)
    pub last_pack_hour: i64,

    // ===== BATTLE STATS =====
    /// Last battle/action timestamp
    pub last_battle: i64,

    /// Total battles fought
    pub battles_fought: u16,

    /// Battles won
    pub wins: u16,

    /// Battles lost
    pub losses: u16,

    // ===== REWARDS =====
    /// Prize share for this round (calculated at end)
    pub prize_share: u64,

    /// Whether prize has been claimed
    pub prize_claimed: bool,

    // ===== TIMESTAMPS =====
    /// When player joined the round
    pub joined_at: i64,

    /// Entry fee paid (for tracking)
    pub entry_fee_paid: u64,

    pub delegated: bool,

    /// Bump seed for PDA
    pub bump: u8,
}

impl PlayerState {
    /// Calculate total power (for ranking)
    pub fn total_power(&self) -> u16 {
        self.str as u16 + self.agi as u16 + self.int as u16
    }

    /// Calculate HP for battle: 100 + (STR + INT) * 2
    pub fn calculate_hp(&self) -> u16 {
        100 + ((self.str as u16 + self.int as u16) * 2)
    }
}

/// Leaderboard entry
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default, InitSpace)]
pub struct LeaderboardEntry {
    pub player: Pubkey,
    pub points: u16,
}

/// Leaderboard state (top 20 players)
#[account]
#[derive(Default, InitSpace)]
pub struct Leaderboard {
    /// Reference to the game round
    pub round: Pubkey,

    /// Top 20 players (sorted by points descending)
    #[max_len(20)]
    pub entries: Vec<LeaderboardEntry>,

    /// Whether leaderboard has been revealed
    pub is_revealed: bool,

    /// Bump seed for PDA
    pub bump: u8,
}

/// Round status enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum RoundStatus {
    Pending,
    Active,
    Ended,
    PayoutsProcessed,
}

impl Default for RoundStatus {
    fn default() -> Self {
        RoundStatus::Pending
    }
}
