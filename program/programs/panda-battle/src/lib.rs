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

    pub fn initialize_player(ctx: Context<InitializePlayer>, name: String) -> Result<()> {
        initialize_player::handler(ctx, name)
    }

    pub fn update_progress(ctx: Context<UpdateProgress>, update: ProgressUpdate) -> Result<()> {
        update_progress::handler(ctx, update)
    }

    pub fn record_activity(ctx: Context<RecordActivity>, activity: ActivityRecord) -> Result<()> {
        record_activity::handler(ctx, activity)
    }
}
