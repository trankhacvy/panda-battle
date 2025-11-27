pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG");

#[program]
pub mod panda_battle {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        initialize_treasury::handler(ctx)
    }

    pub fn distribute_bamboo_rewards(
        ctx: Context<DistributeBambooRewards>,
        amount: u64,
        reason: String,
    ) -> Result<()> {
        distribute_bamboo_rewards::handler(ctx, amount, reason)
    }

    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
        claim_amount: u64,
    ) -> Result<()> {
        claim_rewards::handler(ctx, claim_amount)
    }

    pub fn spend_bamboo_for_action(
        ctx: Context<SpendBambooForAction>,
        amount: u64,
        action: String,
    ) -> Result<()> {
        spend_bamboo_for_action::handler(ctx, amount, action)
    }
}
