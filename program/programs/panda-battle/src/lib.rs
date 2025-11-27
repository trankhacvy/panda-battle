pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;
pub use utils::*;

declare_id!("2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG");

#[program]
pub mod panda_battle {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn forge_panda(
        ctx: Context<ForgePanda>,
        name: String,
        panda_type: PandaType,
        attack: u8,
        defense: u8,
        speed: u8,
        intellect: u8,
        primary_color: [u8; 3],
        secondary_color: [u8; 3],
        accent_color: [u8; 3],
    ) -> Result<()> {
        forge_panda::handler(
            ctx,
            name,
            panda_type,
            attack,
            defense,
            speed,
            intellect,
            primary_color,
            secondary_color,
            accent_color,
        )
    }

    pub fn start_breeding(ctx: Context<StartBreeding>, breeding_id: [u8; 32]) -> Result<()> {
        start_breeding::handler(ctx, breeding_id)
    }

    pub fn complete_breeding(
        ctx: Context<CompleteBreeding>,
        offspring_name: String,
        offspring_rarity_boost: u8,
    ) -> Result<()> {
        complete_breeding::handler(ctx, offspring_name, offspring_rarity_boost)
    }
}
