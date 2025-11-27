pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use events::*;
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

    pub fn initialize_queue(ctx: Context<InitializeQueue>, season: u32) -> Result<()> {
        init_queue::handler(ctx, season)
    }

    pub fn enqueue_for_battle(ctx: Context<EnqueueForBattle>, stake_amount: u64) -> Result<()> {
        enqueue::handler(ctx, stake_amount)
    }

    pub fn start_battle(
        ctx: Context<StartBattle>,
        battle_id: [u8; 32],
        player1_hp: u16,
        player2_hp: u16,
    ) -> Result<()> {
        start_battle::handler(ctx, battle_id, player1_hp, player2_hp)
    }

    pub fn submit_turn(ctx: Context<SubmitTurn>, player_move: u8) -> Result<()> {
        submit_turn::handler(ctx, player_move)
    }

    pub fn resolve_battle(ctx: Context<ResolveBattle>) -> Result<()> {
        resolve_battle::handler(ctx)
    }
}
