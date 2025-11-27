use anchor_lang::prelude::*;

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum PandaType {
    Bamboo,
    Red,
    Giant,
    Snow,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum Rarity {
    Common,
    Rare,
    Epic,
    Legendary,
}

#[account]
pub struct PandaNFT {
    // Mint Reference
    pub panda_mint: Pubkey,
    pub owner: Pubkey,
    pub bump: u8,

    // Core Traits
    pub panda_type: PandaType,
    pub name: String,
    pub rarity: Rarity,

    // Attributes (0-100 each)
    pub attack: u8,
    pub defense: u8,
    pub speed: u8,
    pub intellect: u8,
    pub base_hp: u16,

    // Color Palette
    pub primary_color: [u8; 3],
    pub secondary_color: [u8; 3],
    pub accent_color: [u8; 3],

    // Battle Statistics
    pub level: u8,
    pub total_wins: u32,
    pub total_losses: u32,
    pub total_damage_dealt: u64,
    pub total_damage_taken: u64,
    pub highest_hp_reached: u16,

    // Lineage
    pub parent_male: Option<Pubkey>,
    pub parent_female: Option<Pubkey>,
    pub generation: u8,
    pub breed_count: u8,

    // Breeding Cooldown
    pub last_bred_at: i64,
    pub breeding_cooldown_ends: i64,

    // Metadata & History
    pub created_at: i64,
    pub last_battle_at: i64,
    pub uri: String,

    // Flags
    pub is_locked: bool,
    pub version: u8,
}

impl PandaNFT {
    pub fn is_breeding_ready(&self, current_time: i64) -> bool {
        current_time >= self.breeding_cooldown_ends
    }

    pub fn calculate_rarity(stats: &[u8; 4]) -> Rarity {
        let average = stats.iter().map(|s| *s as u32).sum::<u32>() / 4;
        match average {
            0..=35 => Rarity::Common,
            36..=60 => Rarity::Rare,
            61..=85 => Rarity::Epic,
            _ => Rarity::Legendary,
        }
    }

    pub fn get_rarity_color(&self) -> &str {
        match self.rarity {
            Rarity::Common => "#808080",
            Rarity::Rare => "#4169E1",
            Rarity::Epic => "#9370DB",
            Rarity::Legendary => "#FFD700",
        }
    }
}
