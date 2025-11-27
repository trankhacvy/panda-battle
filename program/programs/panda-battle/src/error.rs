use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
    
    // Player Profile Errors
    #[msg("Player profile already initialized")]
    PlayerAlreadyInitialized,
    
    #[msg("Player profile not found")]
    PlayerNotFound,
    
    #[msg("Only the player can modify their own profile")]
    UnauthorizedProfileModification,
    
    #[msg("Forge cooldown is still active")]
    ForgeCooldownActive,
    
    #[msg("Daily forge limit exceeded")]
    DailyForgeLimit,
    
    #[msg("Invalid player name length")]
    InvalidNameLength,
    
    #[msg("Invalid avatar URL length")]
    InvalidAvatarUrlLength,
    
    #[msg("Invalid bio length")]
    InvalidBioLength,
    
    #[msg("Invalid rating value")]
    InvalidRating,
    
    #[msg("Maximum pandas owned limit reached")]
    MaxPandasExceeded,
    
    #[msg("Player is banned")]
    PlayerBanned,
    
    #[msg("Invalid bump seed")]
    InvalidBumpSeed,
    
    #[msg("Invalid authority")]
    InvalidAuthority,
}
