use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient balance to perform action")]
    InsufficientBalance,

    #[msg("Treasury not initialized")]
    TreasuryNotInitialized,

    #[msg("Invalid treasury authority")]
    InvalidTreasuryAuthority,

    #[msg("Invalid token account")]
    InvalidTokenAccount,

    #[msg("Invalid signer")]
    InvalidSigner,

    #[msg("Reward pool not found")]
    RewardPoolNotFound,

    #[msg("Reward already claimed")]
    RewardAlreadyClaimed,

    #[msg("Reward pool expired")]
    RewardPoolExpired,

    #[msg("Exceeds max claimable amount")]
    ExceedsMaxClaimable,

    #[msg("Invalid mint")]
    InvalidMint,

    #[msg("Custom error message")]
    CustomError,
}
