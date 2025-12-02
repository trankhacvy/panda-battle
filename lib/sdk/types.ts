/**
 * Frontend-friendly types for Panda Battle game state
 * These types map from the generated Solana types to more convenient formats
 */

import type { Address } from "@solana/kit";
import { GlobalConfig } from "./generated";

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
  /** Unique ID for this game instance */
  id: number;
  /** Admin authority address */
  admin: string;
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
  /** Token mint for the game */
  tokenMint: string;
  /** Round number */
  roundNumber: number;
  /** Entry fee in tokens */
  entryFee: number;
  /** Attack pack base price in tokens */
  attackPackPrice: number;
  /** Round duration in seconds */
  durationSecs: number;
  /** Entry fee hourly increase percentage */
  entryHourlyIncPct: number;
  /** Round start timestamp (Unix timestamp in seconds) */
  startTime: number;
  /** Round end timestamp (Unix timestamp in seconds) */
  endTime: number;
  /** Leaderboard reveal timestamp (Unix timestamp in seconds) */
  leaderboardRevealTs: number;
  /** Total prize pool in tokens */
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
  str: number;
  /** Agility attribute (turn order, dodge chance, crit chance) */
  agi: number;
  /** Intelligence attribute (damage mitigation) */
  int: number;
  /** Current level (0-10, starts at 0) */
  level: number;
  /** Current experience points */
  xp: number;
  /** Leaderboard points (wins = +1 point) */
  points: number;
  /** Current available turns */
  turns: number;
  /** Maximum turn storage */
  maxTurns: number;
  /** Last turn regeneration timestamp (Unix timestamp in seconds) */
  lastTurnRegen: number;
  /** Number of rerolls used (max 3) */
  rerollsUsed: number;
  /** Number of attack packs bought in current hour */
  packsBoughtHour: number;
  /** Last hour when pack was bought (unix timestamp) */
  lastPackHour: number;
  /** Last battle/action timestamp (Unix timestamp in seconds) */
  lastBattle: number;
  /** Total battles fought */
  battlesFought: number;
  /** Battles won */
  wins: number;
  /** Battles lost */
  losses: number;
  /** Prize share for this round (calculated at end) */
  prizeShare: number;
  /** Whether prize has been claimed */
  prizeClaimed: boolean;
  /** When player joined the round (Unix timestamp in seconds) */
  joinedAt: number;
  /** Entry fee paid in tokens */
  entryFeePaid: number;
  /** Bump seed for PDA */
  bump: number;
}

/**
 * Convert generated GameConfig to frontend-friendly format
 */
export function mapGameConfig(generated: GlobalConfig): GameConfig {
  return {
    id: Number(generated.id),
    admin: generated.admin,
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
    gameConfig: generated.globalConfig,
    tokenMint: generated.tokenMint,
    roundNumber: Number(generated.roundNumber),
    entryFee: Number(generated.entryFee) / 1e6, // Assuming 6 decimals for tokens
    attackPackPrice: Number(generated.attackPackPrice) / 1e6,
    durationSecs: Number(generated.durationSecs),
    entryHourlyIncPct: generated.entryHourlyIncPct,
    startTime: Number(generated.startTime),
    endTime: Number(generated.endTime),
    leaderboardRevealTs: Number(generated.leaderboardRevealTs),
    prizePool: Number(generated.prizePool) / 1e6,
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
    str: generated.str,
    agi: generated.agi,
    int: generated.int,
    level: generated.level,
    xp: generated.xp,
    points: generated.points,
    turns: generated.turns,
    maxTurns: generated.maxTurns,
    lastTurnRegen: Number(generated.lastTurnRegen),
    rerollsUsed: generated.rerollsUsed,
    packsBoughtHour: generated.packsBoughtHour,
    lastPackHour: Number(generated.lastPackHour),
    lastBattle: Number(generated.lastBattle),
    battlesFought: generated.battlesFought,
    wins: generated.wins,
    losses: generated.losses,
    prizeShare: Number(generated.prizeShare) / 1e6,
    prizeClaimed: generated.prizeClaimed,
    joinedAt: Number(generated.joinedAt),
    entryFeePaid: Number(generated.entryFeePaid) / 1e6,
    bump: generated.bump,
  };
}
