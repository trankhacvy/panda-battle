use anchor_lang::prelude::*;

/// Global game configuration account
#[account]
#[derive(Default, InitSpace)]
pub struct GameConfig {
    /// Admin authority
    pub admin: Pubkey,

    /// Entry fee in lamports
    pub entry_fee: u64,

    /// Base price for purchasing turns (in lamports)
    pub turn_base_price: u64,

    /// Round duration in seconds
    pub round_duration: i64,

    /// Percentage of attribute stolen on win (0-25)
    pub steal_percentage: u8,

    /// Percentage of attribute decay per hour when idle (0-10)
    pub idle_decay_percentage: u8,

    /// Current active round number
    pub current_round: u64,

    /// Total rounds played
    pub total_rounds: u64,

    /// Bump seed for PDA
    pub bump: u8,

    /// Vault bump seed
    pub vault_bump: u8,
}

impl GameConfig {}

/// Game round state
#[account]
#[derive(Default, InitSpace)]
pub struct GameRound {
    /// Reference to game config
    pub game_config: Pubkey,

    /// Round number
    pub round_number: u64,

    /// Round start timestamp
    pub start_time: i64,

    /// Round end timestamp
    pub end_time: i64,

    /// Total prize pool in lamports
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

    // ===== ATTRIBUTES =====
    /// Strength attribute (damage output)
    pub strength: u16,

    /// Speed attribute (turn order, dodge chance)
    pub speed: u16,

    /// Endurance attribute (HP, damage absorption)
    pub endurance: u16,

    /// Luck attribute (crit chance, steal success)
    pub luck: u16,

    // ===== TURNS =====
    /// Current available turns
    pub turns: u8,

    /// Maximum turn storage
    pub max_turns: u8,

    /// Last turn regeneration timestamp
    pub last_turn_regen: i64,

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
    /// Rewards earned this round
    pub rewards_earned: u64,

    /// Whether rewards have been claimed
    pub rewards_claimed: bool,

    // ===== TIMESTAMPS =====
    /// When player joined the round
    pub joined_at: i64,

    /// Last idle decay application
    pub last_decay: i64,

    /// Entry fee paid (for late join tracking)
    pub entry_fee_paid: u64,

    /// Bump seed for PDA
    pub bump: u8,
}

impl PlayerState {
    /// Calculate total attribute sum (for ranking)
    pub fn total_attributes(&self) -> u64 {
        self.strength as u64 + self.speed as u64 + self.endurance as u64 + self.luck as u64
    }

    /// Calculate battle score with weighted formula
    pub fn battle_score(&self) -> u64 {
        // Weights: Strength 30%, Speed 25%, Endurance 30%, Luck 15%
        let strength_score = (self.strength as u64) * 30;
        let speed_score = (self.speed as u64) * 25;
        let endurance_score = (self.endurance as u64) * 30;
        let luck_score = (self.luck as u64) * 15;

        (strength_score + speed_score + endurance_score + luck_score) / 100
    }
}

/// Attribute type enum for steal selection
#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AttributeType {
    Strength,
    Speed,
    Endurance,
    Luck,
}

impl Default for AttributeType {
    fn default() -> Self {
        AttributeType::Strength
    }
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
