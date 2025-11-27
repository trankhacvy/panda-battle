use anchor_lang::prelude::*;

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum BreedingStatus {
    Active,
    Complete,
    Cancelled,
}

#[account]
pub struct BreedingSession {
    // Session Identity
    pub breeding_id: [u8; 32],
    pub bump: u8,

    // Participants
    pub player_pubkey: Pubkey,
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,

    // Offspring Info
    pub offspring_mint: Option<Pubkey>,
    pub offspring_created_at: Option<i64>,

    // Session State
    pub status: BreedingStatus,
    pub started_at: i64,
    pub expires_at: i64,
    pub completed_at: Option<i64>,

    // Economic Data
    pub bamboo_cost: u64,
    pub bamboo_paid: bool,

    // Version
    pub version: u8,
}

impl BreedingSession {
    pub fn is_expired(&self, current_time: i64) -> bool {
        current_time > self.expires_at
    }

    pub fn can_complete(&self, current_time: i64) -> bool {
        self.status == BreedingStatus::Active && !self.is_expired(current_time)
    }
}
