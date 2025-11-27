use anchor_lang::prelude::*;
use crate::state::BattleQueue;

#[derive(Accounts)]
pub struct InitializeQueue<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Battle queue PDA for current season
    #[account(
        init,
        seeds = [b"battle_queue", get_current_season().to_le_bytes().as_ref()],
        bump,
        payer = authority,
        space = 8 + BattleQueue::size(),
    )]
    pub battle_queue: Account<'info, BattleQueue>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeQueue>, season: u32) -> Result<()> {
    let queue = &mut ctx.accounts.battle_queue;

    queue.season = season;
    queue.bump = *ctx.bumps.get("battle_queue").unwrap();
    queue.queued_players = Vec::new();
    queue.created_at = Clock::get()?.unix_timestamp;
    queue.version = 1;

    msg!("Battle queue initialized for season {}", season);

    Ok(())
}

/// Get current season number based on timestamp
fn get_current_season() -> u32 {
    let now = Clock::get().map(|c| c.unix_timestamp).unwrap_or(0);
    (now / 3600) as u32 // 1 hour seasons
}
