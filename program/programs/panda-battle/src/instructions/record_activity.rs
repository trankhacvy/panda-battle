use anchor_lang::prelude::*;
use crate::state::{PlayerProgress, ActivityType};
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct RecordActivity<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"player_progress", signer.key().as_ref()],
        bump = player_progress.bump,
        constraint = player_progress.player_pubkey == signer.key() @ ErrorCode::UnauthorizedProfileModification,
    )]
    pub player_progress: Account<'info, PlayerProgress>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ActivityRecord {
    pub activity_type: ActivityType,
    pub xp_earned: u64,
}

pub fn handler(ctx: Context<RecordActivity>, activity: ActivityRecord) -> Result<()> {
    let player_progress = &mut ctx.accounts.player_progress;
    let clock = Clock::get()?;
    
    // Check and reset daily counters if needed
    if clock.unix_timestamp >= player_progress.daily_reset_at {
        player_progress.daily_battles_played = 0;
        player_progress.daily_pandas_forged = 0;
        player_progress.daily_reset_at = get_daily_reset_timestamp(clock.unix_timestamp);
    }
    
    // Apply activity type specific logic
    match activity.activity_type {
        ActivityType::PandaForged => {
            // Check forge cooldown
            if player_progress.last_forge_at > 0 {
                let time_since_last_forge = clock.unix_timestamp - player_progress.last_forge_at;
                require!(
                    time_since_last_forge >= player_progress.forge_cooldown_seconds as i64,
                    ErrorCode::ForgeCooldownActive
                );
            }
            
            // Check daily forge limit
            require!(
                player_progress.daily_pandas_forged < MAX_DAILY_FORGES,
                ErrorCode::DailyForgeLimit
            );
            
            player_progress.daily_pandas_forged += 1;
            player_progress.last_forge_at = clock.unix_timestamp;
        },
        _ => {
            // Other activity types don't have specific cooldown/limit checks
        }
    }
    
    // Update progress tracking
    player_progress.total_xp_earned += activity.xp_earned;
    player_progress.last_activity_at = clock.unix_timestamp;
    player_progress.updated_at = clock.unix_timestamp;
    
    emit!(ActivityRecorded {
        player: ctx.accounts.signer.key(),
        activity_type: activity.activity_type,
        xp_earned: activity.xp_earned,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

fn get_daily_reset_timestamp(current_timestamp: i64) -> i64 {
    let seconds_per_day = 86400i64;
    let current_day_start = (current_timestamp / seconds_per_day) * seconds_per_day;
    current_day_start + seconds_per_day
}

#[event]
pub struct ActivityRecorded {
    pub player: Pubkey,
    pub activity_type: ActivityType,
    pub xp_earned: u64,
    pub timestamp: i64,
}
