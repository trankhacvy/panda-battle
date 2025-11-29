/**
 * Frontend-friendly types for Panda Battle game state
 * These types map from the generated Solana types to more convenient formats
 */

import type { Address } from "@solana/kit";

/**
 * Attribute type enum for steal selection
 */
export enum AttributeType {
  Strength = 0,
  Speed = 1,
  Endurance = 2,
  Luck = 3,
}

/**
 * Frontend-friendly GameConfig type
 */
export interface GameConfig {
  /** Admin authority address */
  admin: string;
  /** Entry fee in SOL */
  entryFee: number;
  /** Base price for purchasing turns in SOL */
  turnBasePrice: number;
  /** Round duration in seconds */
  roundDuration: number;
  /** Percentage of attribute stolen on win (0-25) */
  stealPercentage: number;
  /** Percentage of attribute decay per hour when idle (0-10) */
  idleDecayPercentage: number;
  /** Current active round number */
  currentRound: number;
  /** Total rounds played */
  totalRounds: number;
  /** Bump seed for PDA */
  bump: number;
  /** Vault bump seed */
  vaultBump: number;
}

/**
 * Frontend-friendly GameRound type
 */
export interface GameRound {
  /** Reference to game config address */
  gameConfig: string;
  /** Round number */
  roundNumber: number;
  /** Round start timestamp (Unix timestamp in seconds) */
  startTime: number;
  /** Round end timestamp (Unix timestamp in seconds) */
  endTime: number;
  /** Total prize pool in SOL */
  prizePool: number;
  /** Number of players in this round */
  playerCount: number;
  /** Total battles fought this round */
  totalBattles: number;
  /** Whether the round is active */
  isActive: boolean;
  /** Whether payouts have been processed */
  payoutsProcessed: boolean;
  /** Bump seed for PDA */
  bump: number;
}

/**
 * Frontend-friendly PlayerState type
 */
export interface PlayerState {
  /** Player's wallet address */
  player: string;
  /** Reference to the game round address */
  round: string;
  /** Strength attribute (damage output) */
  strength: number;
  /** Speed attribute (turn order, dodge chance) */
  speed: number;
  /** Endurance attribute (HP, damage absorption) */
  endurance: number;
  /** Luck attribute (crit chance, steal success) */
  luck: number;
  /** Current available turns */
  turns: number;
  /** Maximum turn storage */
  maxTurns: number;
  /** Last turn regeneration timestamp (Unix timestamp in seconds) */
  lastTurnRegen: number;
  /** Last battle/action timestamp (Unix timestamp in seconds) */
  lastBattle: number;
  /** Total battles fought */
  battlesFought: number;
  /** Battles won */
  wins: number;
  /** Battles lost */
  losses: number;
  /** Rewards earned this round in SOL */
  rewardsEarned: number;
  /** Whether rewards have been claimed */
  rewardsClaimed: boolean;
  /** When player joined the round (Unix timestamp in seconds) */
  joinedAt: number;
  /** Last idle decay application (Unix timestamp in seconds) */
  lastDecay: number;
  /** Entry fee paid in SOL */
  entryFeePaid: number;
  /** Bump seed for PDA */
  bump: number;
}

/**
 * Convert generated GameConfig to frontend-friendly format
 */
export function mapGameConfig(
  generated: import("./generated/accounts/gameConfig").GameConfig
): GameConfig {
  return {
    admin: generated.admin,
    entryFee: Number(generated.entryFee) / 1e9,
    turnBasePrice: Number(generated.turnBasePrice) / 1e9,
    roundDuration: Number(generated.roundDuration),
    stealPercentage: generated.stealPercentage,
    idleDecayPercentage: generated.idleDecayPercentage,
    currentRound: Number(generated.currentRound),
    totalRounds: Number(generated.totalRounds),
    bump: generated.bump,
    vaultBump: generated.vaultBump,
  };
}

/**
 * Convert generated GameRound to frontend-friendly format
 */
export function mapGameRound(
  generated: import("./generated/accounts/gameRound").GameRound
): GameRound {
  return {
    gameConfig: generated.gameConfig,
    roundNumber: Number(generated.roundNumber),
    startTime: Number(generated.startTime),
    endTime: Number(generated.endTime),
    prizePool: Number(generated.prizePool) / 1e9,
    playerCount: generated.playerCount,
    totalBattles: generated.totalBattles,
    isActive: generated.isActive,
    payoutsProcessed: generated.payoutsProcessed,
    bump: generated.bump,
  };
}

/**
 * Convert generated PlayerState to frontend-friendly format
 */
export function mapPlayerState(
  generated: import("./generated/accounts/playerState").PlayerState
): PlayerState {
  return {
    player: generated.player,
    round: generated.round,
    strength: generated.strength,
    speed: generated.speed,
    endurance: generated.endurance,
    luck: generated.luck,
    turns: generated.turns,
    maxTurns: generated.maxTurns,
    lastTurnRegen: Number(generated.lastTurnRegen),
    lastBattle: Number(generated.lastBattle),
    battlesFought: generated.battlesFought,
    wins: generated.wins,
    losses: generated.losses,
    rewardsEarned: Number(generated.rewardsEarned) / 1e9,
    rewardsClaimed: generated.rewardsClaimed,
    joinedAt: Number(generated.joinedAt),
    lastDecay: Number(generated.lastDecay),
    entryFeePaid: Number(generated.entryFeePaid) / 1e9,
    bump: generated.bump,
  };
}
