use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG");

#[program]
pub mod panda_battle {
    use super::*;

    // ============== ADMIN INSTRUCTIONS ==============

    /// Initialize the global game configuration (one-time setup)
    pub fn initialize_game(ctx: Context<InitializeGame>, token_mint: Pubkey) -> Result<()> {
        instructions::admin::initialize_game(ctx, token_mint)
    }

    /// Create a new game round
    pub fn create_round(
        ctx: Context<CreateRound>,
        entry_fee: u64,
        attack_pack_price: u64,
        duration_secs: i64,
        entry_hourly_inc_pct: u8,
    ) -> Result<()> {
        instructions::admin::create_round(
            ctx,
            entry_fee,
            attack_pack_price,
            duration_secs,
            entry_hourly_inc_pct,
        )
    }

    /// End the current round and prepare for payouts
    pub fn end_round(ctx: Context<EndRound>) -> Result<()> {
        instructions::admin::end_round(ctx)
    }

    /// Update global configuration parameters
    pub fn update_config(ctx: Context<UpdateConfig>, token_mint: Option<Pubkey>) -> Result<()> {
        instructions::admin::update_config(ctx, token_mint)
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

    /// Buy attack packs (replaces purchase_turns)
    pub fn buy_attack_packs(ctx: Context<BuyAttackPacks>, num_packs: u8) -> Result<()> {
        instructions::player::buy_attack_packs(ctx, num_packs)
    }

    /// Reroll attributes (costs $1 fixed, max 3 times)
    pub fn reroll_attributes(ctx: Context<RerollAttributes>, client_seed: u8) -> Result<()> {
        instructions::player::reroll_attributes(ctx, client_seed)
    }

    /// Callback to complete attribute reroll (Step 2: Consume VRF randomness)
    pub fn callback_reroll_attributes(
        ctx: Context<CallbackRerollAttributes>,
        randomness: [u8; 32],
    ) -> Result<()> {
        instructions::player::callback_reroll_attributes(ctx, randomness)
    }

    /// Initiate a battle against another player (Step 1: Request VRF)
    pub fn initiate_battle(ctx: Context<InitiateBattle>, client_seed: u8) -> Result<()> {
        instructions::player::initiate_battle(ctx, client_seed)
    }

    /// Callback to resolve battle (Step 2: Full battle simulation with VRF randomness)
    pub fn callback_resolve_battle(
        ctx: Context<CallbackResolveBattle>,
        randomness: [u8; 32],
    ) -> Result<()> {
        instructions::player::callback_resolve_battle(ctx, randomness)
    }

    /// Claim prize after round ends
    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        instructions::player::claim_prize(ctx)
    }

    // ============== CRANK INSTRUCTIONS ==============

    /// Regenerate turns for a player (can be called by anyone)
    pub fn regenerate_turns(ctx: Context<RegenerateTurns>) -> Result<()> {
        instructions::crank::regenerate_turns(ctx)
    }

    /// Reset packs bought counter if a new hour has started (can be called by anyone)
    pub fn reset_packs_if_new_hour(ctx: Context<ResetPacksIfNewHour>) -> Result<()> {
        instructions::crank::reset_packs_if_new_hour(ctx)
    }

    /// Reveal leaderboard after reveal timestamp (computes and stores top 20 players)
    pub fn reveal_leaderboard(ctx: Context<RevealLeaderboard>) -> Result<()> {
        instructions::crank::reveal_leaderboard(ctx)
    }

    /// Hourly jackpot distribution (post-reveal, weighted random pick from top 20)
    pub fn hourly_jackpot(ctx: Context<HourlyJackpot>, client_seed: u8) -> Result<()> {
        instructions::crank::hourly_jackpot(ctx, client_seed)
    }

    /// Distribute prizes after round ends (calculates prize shares for all players)
    pub fn distribute_prizes(ctx: Context<DistributePrizes>) -> Result<()> {
        instructions::crank::distribute_prizes(ctx)
    }
}
