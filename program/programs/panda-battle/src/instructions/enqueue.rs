use anchor_lang::prelude::*;
use crate::state::{BattleQueue, QueuedPlayer};
use crate::events::BattleEnqueued;
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct EnqueueForBattle<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    /// Panda NFT mint account (for eligibility check)
    pub panda_mint: Account<'info, anchor_spl::token::Mint>,

    /// Battle queue PDA (current season)
    #[account(
        mut,
        seeds = [b"battle_queue", get_current_season().to_le_bytes().as_ref()],
        bump,
    )]
    pub battle_queue: Account<'info, BattleQueue>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<EnqueueForBattle>,
    stake_amount: u64,
) -> Result<()> {
    let player = ctx.accounts.player.key();
    let panda_mint = ctx.accounts.panda_mint.key();
    let queue = &mut ctx.accounts.battle_queue;

    // Validate stake amount
    require!(
        stake_amount >= MIN_STAKE_AMOUNT,
        ErrorCode::InsufficientStake
    );

    // Check if player already in queue
    for queued in &queue.queued_players {
        require!(
            queued.player_pubkey != player,
            ErrorCode::DoubleEntry
        );
    }

    // Add player to queue
    let queued_player = QueuedPlayer {
        player_pubkey: player,
        panda_mint,
        stake_amount,
        joined_at: Clock::get()?.unix_timestamp,
    };

    queue.queued_players.push(queued_player);

    // Emit event
    emit!(BattleEnqueued {
        player_pubkey: player,
        panda_mint,
        stake_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Player {:?} enqueued for battle with stake: {}", player, stake_amount);

    Ok(())
}

/// Get current season number based on timestamp
fn get_current_season() -> u32 {
    let now = Clock::get().map(|c| c.unix_timestamp).unwrap_or(0);
    (now / QUEUE_SEASON_LENGTH_SECONDS) as u32
}
