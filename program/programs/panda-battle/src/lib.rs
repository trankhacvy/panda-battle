use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("H7UJumnqZJjHNcmfTjcnM3vyz23g4DNNZbh5upWF6ECP");

#[ephemeral]
#[program]
pub mod panda_battle {
    use super::*;

    // ============== ADMIN INSTRUCTIONS ==============

    pub fn initialize_game(ctx: Context<InitializeGame>, token_mint: Pubkey) -> Result<()> {
        instructions::admin::initialize_game(ctx, token_mint)
    }

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

    pub fn delegate_round(ctx: Context<DelegateRound>) -> Result<()> {
        instructions::admin::delegate_round(ctx)
    }

    pub fn end_round(ctx: Context<EndRound>) -> Result<()> {
        instructions::admin::end_round(ctx)
    }

    pub fn update_config(ctx: Context<UpdateConfig>, token_mint: Option<Pubkey>) -> Result<()> {
        instructions::admin::update_config(ctx, token_mint)
    }

    // ============== PLAYER INSTRUCTIONS ==============

    pub fn request_join_round(ctx: Context<RequestJoinRound>, client_seed: u8) -> Result<()> {
        instructions::player::request_join_round(ctx, client_seed)
    }

    pub fn callback_join_round(
        ctx: Context<CallbackJoinRound>,
        randomness: [u8; 32],
    ) -> Result<()> {
        instructions::player::callback_join_round(ctx, randomness)
    }

    pub fn buy_attack_packs(ctx: Context<BuyAttackPacks>, num_packs: u8) -> Result<()> {
        instructions::player::buy_attack_packs(ctx, num_packs)
    }

    pub fn reroll_attributes(ctx: Context<RerollAttributes>, client_seed: u8) -> Result<()> {
        instructions::player::reroll_attributes(ctx, client_seed)
    }

    pub fn callback_reroll_attributes(
        ctx: Context<CallbackRerollAttributes>,
        randomness: [u8; 32],
    ) -> Result<()> {
        instructions::player::callback_reroll_attributes(ctx, randomness)
    }

    pub fn initiate_battle(ctx: Context<InitiateBattle>, client_seed: u8) -> Result<()> {
        instructions::player::initiate_battle(ctx, client_seed)
    }

    pub fn callback_resolve_battle(
        ctx: Context<CallbackResolveBattle>,
        randomness: [u8; 32],
    ) -> Result<()> {
        instructions::player::callback_resolve_battle(ctx, randomness)
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>) -> Result<()> {
        instructions::player::claim_prize(ctx)
    }

    // ============== CRANK INSTRUCTIONS ==============

    pub fn regenerate_turns(ctx: Context<RegenerateTurns>) -> Result<()> {
        instructions::crank::regenerate_turns(ctx)
    }

    pub fn reset_packs_if_new_hour(ctx: Context<ResetPacksIfNewHour>) -> Result<()> {
        instructions::crank::reset_packs_if_new_hour(ctx)
    }

    pub fn reveal_leaderboard(ctx: Context<RevealLeaderboard>) -> Result<()> {
        instructions::crank::reveal_leaderboard(ctx)
    }

    pub fn hourly_jackpot(ctx: Context<HourlyJackpot>, client_seed: u8) -> Result<()> {
        instructions::crank::hourly_jackpot(ctx, client_seed)
    }

    pub fn distribute_prizes(ctx: Context<DistributePrizes>) -> Result<()> {
        instructions::crank::distribute_prizes(ctx)
    }
}
