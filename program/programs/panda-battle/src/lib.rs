use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::AttributeType;

declare_id!("2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG");

#[program]
pub mod panda_battle {
    use super::*;

    // ============== ADMIN INSTRUCTIONS ==============

    /// Initialize the game configuration (one-time setup)
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        entry_fee: u64,
        turn_base_price: u64,
        round_duration: i64,
        steal_percentage: u8,
        idle_decay_percentage: u8,
    ) -> Result<()> {
        instructions::admin::initialize_game(
            ctx,
            entry_fee,
            turn_base_price,
            round_duration,
            steal_percentage,
            idle_decay_percentage,
        )
    }

    /// Create a new game round
    pub fn create_round(ctx: Context<CreateRound>) -> Result<()> {
        instructions::admin::create_round(ctx)
    }

    /// End the current round and prepare for payouts
    pub fn end_round(ctx: Context<EndRound>) -> Result<()> {
        instructions::admin::end_round(ctx)
    }

    /// Update game configuration parameters
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        entry_fee: Option<u64>,
        turn_base_price: Option<u64>,
        round_duration: Option<i64>,
        steal_percentage: Option<u8>,
        idle_decay_percentage: Option<u8>,
    ) -> Result<()> {
        instructions::admin::update_config(
            ctx,
            entry_fee,
            turn_base_price,
            round_duration,
            steal_percentage,
            idle_decay_percentage,
        )
    }

    // ============== PLAYER INSTRUCTIONS ==============

    /// Request to join the current round (Step 1: Request VRF)
    pub fn request_join_round(ctx: Context<RequestJoinRound>, client_seed: u8) -> Result<()> {
        instructions::player::request_join_round(ctx, client_seed)
    }

    /// Callback to complete join round (Step 2: Consume VRF randomness)
    pub fn callback_join_round(
        ctx: Context<CallbackJoinRound>,
        randomness: [u8; 32],
    ) -> Result<()> {
        instructions::player::callback_join_round(ctx, randomness)
    }

    /// Purchase additional turns
    pub fn purchase_turns(ctx: Context<PurchaseTurns>, amount: u8) -> Result<()> {
        instructions::player::purchase_turns(ctx, amount)
    }

    /// Initiate a battle against another player
    pub fn initiate_battle(
        ctx: Context<InitiateBattle>,
        steal_attribute: AttributeType,
    ) -> Result<()> {
        instructions::player::initiate_battle(ctx, steal_attribute)
    }

    /// Claim rewards after round ends
    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        instructions::player::claim_reward(ctx)
    }

    // ============== CRANK INSTRUCTIONS ==============

    /// Regenerate turns for a player (can be called by anyone)
    pub fn regenerate_turns(ctx: Context<RegenerateTurns>) -> Result<()> {
        instructions::crank::regenerate_turns(ctx)
    }

    /// Apply idle decay to inactive player (can be called by anyone)
    pub fn apply_idle_decay(ctx: Context<ApplyIdleDecay>) -> Result<()> {
        instructions::crank::apply_idle_decay(ctx)
    }
}
