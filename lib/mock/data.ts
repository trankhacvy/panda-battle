/**
 * Comprehensive Mock Data Structure for Panda Battle Game
 * Implements data models from design.md
 */

import { mockOpponents, OpponentPanda } from "./battles";
import { mockLeaderboardEntries, LeaderboardEntry } from "./leaderboard";
import { mockPlayerData } from "./game";

// ============================================================================
// Core Data Types (from design.md)
// ============================================================================

export interface Attributes {
  strength: number;
  speed: number;
  endurance: number;
  luck: number;
}

export interface Player {
  wallet: string;
  attributes: Attributes;
  turns: number;
  lastBattleTime: Date;
  lastActivityTime: Date;
  battleCount: number;
  winCount: number;
  lossCount: number;
  entryTime: Date;
  shields: Shield[];
  buffs: Buff[];
  rank: number;
  inTop20: boolean;
  pandaName: string;
  earnings: number; // SOL
}

export interface Shield {
  attribute: AttributeType;
  remainingBattles: number;
  expiresAt: Date;
}

export interface Buff {
  type: BuffType;
  value: number;
  expiresAt: Date;
}

export type AttributeType = "strength" | "speed" | "endurance" | "luck";
export type BuffType =
  | "strength"
  | "speed"
  | "endurance"
  | "luck"
  | "steal_bonus";

export interface BattleRecord {
  id: string;
  roundId: string;
  attacker: string;
  defender: string;
  winner: string;
  attackerScore: number;
  defenderScore: number;
  attributeStolen: AttributeType | null;
  amountStolen: number;
  timestamp: Date;
}

export interface RoundState {
  id: string;
  startTime: Date;
  endTime: Date | null;
  prizePool: number;
  playerCount: number;
  status: "active" | "ended";
  hourlyDistributions: number;
  totalDistributed: number;
}

// ============================================================================
// Mock Data Generation
// ============================================================================

/**
 * Generate random attributes within defined ranges (Requirements 1.4)
 * Each attribute: 15-40 range, normalized to 100 total points
 */
export function generateAttributes(): Attributes {
  const totalPoints = 100;
  const minPerAttribute = 15;
  const maxPerAttribute = 40;

  const randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const strength = randomInRange(minPerAttribute, maxPerAttribute);
  const speed = randomInRange(minPerAttribute, maxPerAttribute);
  const endurance = randomInRange(minPerAttribute, maxPerAttribute);
  const luck = randomInRange(minPerAttribute, maxPerAttribute);

  const sum = strength + speed + endurance + luck;
  const factor = totalPoints / sum;

  return {
    strength: Math.floor(strength * factor),
    speed: Math.floor(speed * factor),
    endurance: Math.floor(endurance * factor),
    luck: Math.floor(luck * factor),
  };
}

/**
 * Calculate total power from attributes
 */
export function calculateTotalPower(attributes: Attributes): number {
  return (
    attributes.strength +
    attributes.speed +
    attributes.endurance +
    attributes.luck
  );
}

/**
 * Generate mock player data (20-30 players)
 */
export function generateMockPlayers(count: number = 25): Player[] {
  const players: Player[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const attributes = generateAttributes();
    const battleCount = Math.floor(Math.random() * 50) + 5;
    const winCount = Math.floor(battleCount * (0.3 + Math.random() * 0.5));
    const lossCount = battleCount - winCount;

    players.push({
      wallet: `player_${i + 1}`,
      attributes,
      turns: Math.floor(Math.random() * 10) + 3,
      lastBattleTime: new Date(now.getTime() - Math.random() * 3600000),
      lastActivityTime: new Date(now.getTime() - Math.random() * 1800000),
      battleCount,
      winCount,
      lossCount,
      entryTime: new Date(now.getTime() - Math.random() * 86400000),
      shields: [],
      buffs: [],
      rank: i + 1,
      inTop20: i < 20,
      pandaName: `Panda ${i + 1}`,
      earnings: Math.random() * 5,
    });
  }

  return players;
}

/**
 * Generate mock battle history
 */
export function generateMockBattleHistory(
  players: Player[],
  count: number = 50
): BattleRecord[] {
  const battles: BattleRecord[] = [];
  const now = new Date();
  const attributes: AttributeType[] = [
    "strength",
    "speed",
    "endurance",
    "luck",
  ];

  for (let i = 0; i < count; i++) {
    const attacker = players[Math.floor(Math.random() * players.length)];
    const defender = players[Math.floor(Math.random() * players.length)];

    if (attacker.wallet === defender.wallet) continue;

    const attackerScore = Math.random() * 100 + 50;
    const defenderScore = Math.random() * 100 + 50;
    const winner = attackerScore > defenderScore ? attacker : defender;
    const loser = winner === attacker ? defender : attacker;
    const attributeStolen =
      attributes[Math.floor(Math.random() * attributes.length)];
    const amountStolen = Math.floor(
      loser.attributes[attributeStolen] * (0.1 + Math.random() * 0.1)
    );

    battles.push({
      id: `battle_${i + 1}`,
      roundId: "round_1",
      attacker: attacker.wallet,
      defender: defender.wallet,
      winner: winner.wallet,
      attackerScore,
      defenderScore,
      attributeStolen,
      amountStolen,
      timestamp: new Date(now.getTime() - Math.random() * 86400000),
    });
  }

  return battles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ============================================================================
// Mock Data Instances
// ============================================================================

// Current player (from existing mock data)
export const mockCurrentPlayer: Player = {
  wallet: "player_current",
  attributes: {
    strength: mockPlayerData.attributes.strength,
    speed: mockPlayerData.attributes.speed,
    endurance: mockPlayerData.attributes.endurance,
    luck: mockPlayerData.attributes.luck,
  },
  turns: mockPlayerData.turns,
  lastBattleTime: new Date(Date.now() - 30 * 60 * 1000),
  lastActivityTime: new Date(Date.now() - 5 * 60 * 1000),
  battleCount: mockPlayerData.totalBattles,
  winCount: mockPlayerData.wins,
  lossCount: mockPlayerData.losses,
  entryTime: new Date(Date.now() - 6 * 3600 * 1000),
  shields: [],
  buffs: [],
  rank: mockPlayerData.rank,
  inTop20: mockPlayerData.rank <= 20,
  pandaName: mockPlayerData.pandaName,
  earnings: mockPlayerData.earnings,
};

// Generate opponent list (20-30 players)
export const mockPlayers = generateMockPlayers(30);

// Generate battle history
export const mockBattleHistory = generateMockBattleHistory(mockPlayers, 50);

// Current round state
export const mockCurrentRound: RoundState = {
  id: "round_1",
  startTime: new Date(Date.now() - 12 * 3600 * 1000), // 12 hours ago
  endTime: null,
  prizePool: 125.5, // SOL
  playerCount: 342,
  status: "active",
  hourlyDistributions: 12,
  totalDistributed: 15.2,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert OpponentPanda to Player format
 */
export function opponentToPlayer(opponent: OpponentPanda): Player {
  return {
    wallet: opponent.id,
    attributes: opponent.attributes,
    turns: Math.floor(Math.random() * 10) + 3,
    lastBattleTime: opponent.lastMatch
      ? new Date(opponent.lastMatch.timestamp)
      : new Date(),
    lastActivityTime: new Date(),
    battleCount: opponent.wins + opponent.losses,
    winCount: opponent.wins,
    lossCount: opponent.losses,
    entryTime: new Date(Date.now() - Math.random() * 86400000),
    shields: [],
    buffs: [],
    rank: opponent.rank,
    inTop20: opponent.isInTop20,
    pandaName: opponent.name,
    earnings: Math.random() * 10,
  };
}

/**
 * Convert LeaderboardEntry to Player format
 */
export function leaderboardToPlayer(entry: LeaderboardEntry): Player | null {
  if (!entry.attributes) return null;

  return {
    wallet: entry.id,
    attributes: entry.attributes,
    turns: Math.floor(Math.random() * 10) + 3,
    lastBattleTime: new Date(),
    lastActivityTime: new Date(),
    battleCount: entry.totalWins + entry.totalLosses,
    winCount: entry.totalWins,
    lossCount: entry.totalLosses,
    entryTime: new Date(Date.now() - Math.random() * 86400000),
    shields: [],
    buffs: [],
    rank: entry.rank,
    inTop20: entry.rank <= 20,
    pandaName: entry.player,
    earnings: Math.random() * 10,
  };
}

/**
 * Get all opponents as Player objects
 */
export function getAllOpponentsAsPlayers(): Player[] {
  return mockOpponents.map(opponentToPlayer);
}

/**
 * Get leaderboard as Player objects
 */
export function getLeaderboardAsPlayers(): Player[] {
  return mockLeaderboardEntries
    .map(leaderboardToPlayer)
    .filter((p): p is Player => p !== null);
}

/**
 * Get player by wallet address
 */
export function getPlayerByWallet(wallet: string): Player | null {
  if (wallet === mockCurrentPlayer.wallet) {
    return mockCurrentPlayer;
  }

  const player = mockPlayers.find((p) => p.wallet === wallet);
  return player || null;
}

/**
 * Get battle history for a player
 */
export function getBattleHistoryForPlayer(wallet: string): BattleRecord[] {
  return mockBattleHistory.filter(
    (b) => b.attacker === wallet || b.defender === wallet
  );
}

/**
 * Calculate win rate
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100 * 100) / 100;
}
