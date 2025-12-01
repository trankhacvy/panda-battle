use anchor_lang::prelude::*;

#[error_code]
pub enum PandaBattleError {
    // Admin Errors
    #[msg("Only the admin can perform this action")]
    Unauthorized,

    #[msg("Invalid configuration parameter")]
    InvalidConfig,

    // Round Errors
    #[msg("Round is not active")]
    RoundNotActive,

    #[msg("Round has already ended")]
    RoundAlreadyEnded,

    #[msg("Round has not ended yet")]
    RoundNotEnded,

    #[msg("Round is still active, cannot create new round")]
    RoundStillActive,

    // Player Errors
    #[msg("Player has already joined this round")]
    AlreadyJoined,

    #[msg("Player has not joined this round")]
    NotJoined,

    #[msg("Insufficient turns to perform this action")]
    InsufficientTurns,

    #[msg("Cannot purchase more than 5 turns at once")]
    TooManyTurns,

    #[msg("Turn storage is full")]
    TurnStorageFull,

    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Maximum rerolls reached (3 max)")]
    MaxRerollsReached,

    // Battle Errors
    #[msg("Cannot battle yourself")]
    CannotBattleSelf,

    #[msg("Target player not found in this round")]
    TargetNotFound,

    #[msg("Battle calculation overflow")]
    BattleOverflow,

    // Reward Errors
    #[msg("Rewards already claimed")]
    AlreadyClaimed,

    #[msg("No rewards available")]
    NoRewardsAvailable,

    // Crank Errors
    #[msg("Turn regeneration not ready yet")]
    RegenNotReady,

    // Leaderboard Errors
    #[msg("Leaderboard reveal time has not been reached yet")]
    LeaderboardNotReady,

    #[msg("Leaderboard has already been revealed")]
    LeaderboardAlreadyRevealed,

    #[msg("Leaderboard has not been revealed yet")]
    LeaderboardNotRevealed,

    #[msg("Leaderboard is empty")]
    EmptyLeaderboard,

    #[msg("Invalid round for player state")]
    InvalidRound,

    // Math Errors
    #[msg("Numerical overflow")]
    Overflow,

    #[msg("Numerical underflow")]
    Underflow,

    // Token Errors
    #[msg("Invalid token mint for this round")]
    InvalidMint,
}
