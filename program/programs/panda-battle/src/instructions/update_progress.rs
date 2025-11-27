use anchor_lang::prelude::*;
use crate::state::{PlayerProfile, PlayerProgress, ActivityType};
use crate::error::ErrorCode;
use crate::constants::*;

#[derive(Accounts)]
pub struct UpdateProgress<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"player_profile", signer.key().as_ref()],
        bump = player_profile.bump,
        constraint = player_profile.player_pubkey == signer.key() @ ErrorCode::UnauthorizedProfileModification,
        constraint = !player_profile.is_banned @ ErrorCode::PlayerBanned,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    #[account(
        mut,
        seeds = [b"player_progress", signer.key().as_ref()],
        bump = player_progress.bump,
        constraint = player_progress.player_pubkey == signer.key() @ ErrorCode::UnauthorizedProfileModification,
    )]
    pub player_progress: Account<'info, PlayerProgress>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProgressUpdate {
    pub battle_won: bool,
    pub xp_earned: u64,
    pub rating_delta: i32,
}

pub fn handler(ctx: Context<UpdateProgress>, update: ProgressUpdate) -> Result<()> {
    let player_profile = &mut ctx.accounts.player_profile;
    let player_progress = &mut ctx.accounts.player_progress;
    let clock = Clock::get()?;
    
    // Check if player is banned
    require!(!player_profile.is_banned, ErrorCode::PlayerBanned);
    
    // Update battle stats
    player_progress.battles_completed += 1;
    player_progress.last_activity_at = clock.unix_timestamp;
    
    // Check and reset daily counters if needed
    if clock.unix_timestamp >= player_progress.daily_reset_at {
        player_progress.daily_battles_played = 0;
        player_progress.daily_pandas_forged = 0;
        player_progress.daily_reset_at = get_daily_reset_timestamp(clock.unix_timestamp);
    }
    
    player_progress.daily_battles_played += 1;
    
    // Update win streak and player stats
    if update.battle_won {
        player_profile.total_wins += 1;
        player_progress.consecutive_wins += 1;
        
        if player_progress.consecutive_wins > player_progress.max_consecutive_wins {
            player_progress.max_consecutive_wins = player_progress.consecutive_wins;
        }
    } else {
        player_profile.total_losses += 1;
        player_progress.consecutive_wins = 0;
    }
    
    // Update rating with constraints
    let new_rating = (player_profile.current_rating as i32 + update.rating_delta)
        .max(PlayerProfile::MIN_RATING as i32)
        .min(PlayerProfile::MAX_RATING as i32);
    
    player_profile.current_rating = new_rating;
    
    if new_rating > player_profile.peak_rating {
        player_profile.peak_rating = new_rating;
    }
    
    // Update XP
    let xp_multiplier = if update.battle_won {
        player_progress.battle_xp_multiplier as u64
    } else {
        (player_progress.battle_xp_multiplier as u64 / 2).max(50)
    };
    
    let adjusted_xp = (update.xp_earned * xp_multiplier) / 100;
    player_profile.total_xp += adjusted_xp;
    player_progress.total_xp_earned += adjusted_xp;
    
    // Update level based on XP (simple formula: level = sqrt(total_xp / 100) + 1)
    let xp_for_level = player_profile.total_xp / 100;
    player_profile.level = (isqrt(xp_for_level) + 1) as u32;
    
    // Update last battle timestamp
    player_profile.last_battle_at = clock.unix_timestamp;
    player_profile.updated_at = clock.unix_timestamp;
    player_progress.updated_at = clock.unix_timestamp;
    
    emit!(ProgressUpdated {
        player: ctx.accounts.signer.key(),
        activity_type: if update.battle_won { ActivityType::BattleWon } else { ActivityType::BattleLost },
        xp_earned: adjusted_xp,
        rating_delta: update.rating_delta,
        new_rating: player_profile.current_rating,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

fn get_daily_reset_timestamp(current_timestamp: i64) -> i64 {
    let seconds_per_day = 86400i64;
    let current_day_start = (current_timestamp / seconds_per_day) * seconds_per_day;
    current_day_start + seconds_per_day
}

fn isqrt(n: u64) -> u64 {
    if n == 0 {
        return 0;
    }
    let mut x = n;
    let mut y = (x + 1) / 2;
    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }
    x
}

#[event]
pub struct ProgressUpdated {
    pub player: Pubkey,
    pub activity_type: ActivityType,
    pub xp_earned: u64,
    pub rating_delta: i32,
    pub new_rating: i32,
    pub timestamp: i64,
}
