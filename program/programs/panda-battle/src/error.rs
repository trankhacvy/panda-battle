use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid battle state")]
    InvalidBattleState,

    #[msg("Player not in queue")]
    PlayerNotInQueue,

    #[msg("Panda not eligible for battle")]
    PandaNotEligible,

    #[msg("Insufficient stake amount")]
    InsufficientStake,

    #[msg("Player already in queue")]
    DoubleEntry,

    #[msg("Player on battle cooldown")]
    BattleOnCooldown,

    #[msg("Invalid move selection")]
    InvalidMove,

    #[msg("Move is on cooldown")]
    MoveOnCooldown,

    #[msg("Invalid battle ID")]
    InvalidBattleId,

    #[msg("Battle not in progress")]
    BattleNotInProgress,

    #[msg("Battle already completed")]
    BattleAlreadyCompleted,

    #[msg("Not authorized to perform this action")]
    Unauthorized,

    #[msg("Queue not found")]
    QueueNotFound,

    #[msg("Battle record not found")]
    BattleRecordNotFound,

    #[msg("Invalid opponent")]
    InvalidOpponent,

    #[msg("Maximum turns reached")]
    MaxTurnsReached,

    #[msg("Battle already has both players")]
    QueueFull,

    #[msg("Need at least 2 players in queue")]
    NotEnoughPlayersInQueue,
}
