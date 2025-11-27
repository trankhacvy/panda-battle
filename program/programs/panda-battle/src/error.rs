use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,

    // Panda-related errors
    #[msg("Panda not found")]
    PandaNotFound,

    #[msg("Not panda owner")]
    NotPandaOwner,

    #[msg("Panda is locked")]
    PandaLocked,

    // Breeding-related errors
    #[msg("Invalid breeding pair")]
    InvalidBreedingPair,

    #[msg("Breeding cooldown not yet passed")]
    CooldownViolation,

    #[msg("Same panda cannot breed with itself")]
    SamePandaBreeding,

    #[msg("Panda reached maximum breed count")]
    MaxBreedCountReached,

    #[msg("Parent generation exceeds maximum")]
    MaxGenerationReached,

    #[msg("Breeding session not found")]
    BreedingSessionNotFound,

    #[msg("Breeding session expired")]
    BreedingSessionExpired,

    #[msg("Breeding session already completed")]
    BreedingSessionComplete,

    #[msg("Parent mints do not match session")]
    ParentMintMismatch,

    // Supply limit errors
    #[msg("Pandas per player limit reached")]
    PandasPerPlayerLimitReached,

    #[msg("Total pandas supply cap reached")]
    TotalSupplyCapReached,

    #[msg("Generation cap reached")]
    GenerationCapReached,

    // Economic errors
    #[msg("Insufficient funds for operation")]
    InsufficientFunds,

    #[msg("Token transfer failed")]
    TokenTransferFailed,

    #[msg("Invalid token account")]
    InvalidTokenAccount,

    // Account setup errors
    #[msg("Invalid PDA")]
    InvalidPDA,

    #[msg("Account mismatch")]
    AccountMismatch,

    #[msg("Metadata account required")]
    MetadataAccountRequired,

    // Input validation errors
    #[msg("Invalid panda name")]
    InvalidPandaName,

    #[msg("Invalid panda type")]
    InvalidPandaType,

    #[msg("Invalid stat value")]
    InvalidStatValue,

    // Trait inheritance errors
    #[msg("Trait inheritance failed")]
    TraitInheritanceFailed,

    #[msg("Randomization failed")]
    RandomizationFailed,
}
