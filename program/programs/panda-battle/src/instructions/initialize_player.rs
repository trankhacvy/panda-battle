use anchor_lang::prelude::*;
use crate::state::{PlayerProfile, PlayerProgress};
use crate::error::ErrorCode;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init,
        payer = signer,
        space = PlayerProfile::space(),
        seeds = [b"player_profile", signer.key().as_ref()],
        bump
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    #[account(
        init,
        payer = signer,
        space = PlayerProgress::space(),
        seeds = [b"player_progress", signer.key().as_ref()],
        bump
    )]
    pub player_progress: Account<'info, PlayerProgress>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePlayer>, name: String) -> Result<()> {
    let player_profile = &mut ctx.accounts.player_profile;
    let player_progress = &mut ctx.accounts.player_progress;
    let signer = &ctx.accounts.signer;
    let clock = Clock::get()?;
    
    // Validate input
    require!(
        !name.is_empty() && name.len() <= PlayerProfile::MAX_NAME_LEN,
        ErrorCode::InvalidNameLength
    );
    
    // Initialize PlayerProfile
    player_profile.player_pubkey = signer.key();
    player_profile.bump = ctx.bumps.player_profile;
    player_profile.authority = signer.key();
    player_profile.name = name;
    player_profile.avatar_url = String::new();
    player_profile.bio = String::new();
    player_profile.region = None;
    
    player_profile.total_wins = 0;
    player_profile.total_losses = 0;
    player_profile.current_rating = PlayerProfile::STARTING_RATING;
    player_profile.peak_rating = PlayerProfile::STARTING_RATING;
    
    player_profile.total_xp = 0;
    player_profile.level = 1;
    
    player_profile.active_panda_mint = None;
    player_profile.pandas_owned = 0;
    player_profile.total_bamboo_earned = 0;
    player_profile.total_bamboo_spent = 0;
    
    player_profile.badges = Vec::new();
    
    player_profile.created_at = clock.unix_timestamp;
    player_profile.last_battle_at = 0;
    player_profile.updated_at = clock.unix_timestamp;
    
    player_profile.version = PlayerProfile::CURRENT_VERSION;
    player_profile.is_banned = false;
    
    // Initialize PlayerProgress
    player_progress.player_pubkey = signer.key();
    player_progress.bump = ctx.bumps.player_progress;
    
    player_progress.battles_completed = 0;
    player_progress.consecutive_wins = 0;
    player_progress.max_consecutive_wins = 0;
    
    player_progress.last_forge_at = 0;
    player_progress.forge_cooldown_seconds = PlayerProgress::DEFAULT_FORGE_COOLDOWN_SECONDS;
    
    player_progress.last_activity_at = clock.unix_timestamp;
    player_progress.daily_battles_played = 0;
    player_progress.daily_pandas_forged = 0;
    player_progress.daily_reset_at = get_daily_reset_timestamp(clock.unix_timestamp);
    
    player_progress.total_xp_earned = 0;
    player_progress.battle_xp_multiplier = 100; // 1.0x
    player_progress.forge_xp_multiplier = 100; // 1.0x
    
    player_progress.created_at = clock.unix_timestamp;
    player_progress.updated_at = clock.unix_timestamp;
    player_progress.version = PlayerProgress::CURRENT_VERSION;
    
    emit!(PlayerInitialized {
        player: signer.key(),
        name: player_profile.name.clone(),
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

fn get_daily_reset_timestamp(current_timestamp: i64) -> i64 {
    let seconds_per_day = 86400i64;
    let current_day_start = (current_timestamp / seconds_per_day) * seconds_per_day;
    current_day_start + seconds_per_day // Next day reset
}

#[event]
pub struct PlayerInitialized {
    pub player: Pubkey,
    pub name: String,
    pub timestamp: i64,
}
