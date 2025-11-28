/**
 * Mock Data Layer - Main Export File
 * Provides convenient access to all mock data and utilities
 */

// Core Data Types and Functions
export type {
  Attributes,
  AttributeType,
  Player,
  Shield,
  Buff,
  BuffType,
  BattleRecord,
  RoundState,
} from "./data";

export {
  generateAttributes,
  calculateTotalPower,
  calculateWinRate,
  mockCurrentPlayer,
  mockPlayers,
  mockBattleHistory,
  mockCurrentRound,
  opponentToPlayer,
  leaderboardToPlayer,
  getAllOpponentsAsPlayers,
  getLeaderboardAsPlayers,
  getPlayerByWallet,
  getBattleHistoryForPlayer,
} from "./data";

// Battle Logic
export {
  calculateBattleScore,
  determineWinner,
  calculateStealAmount,
  applyAttributeSteal,
  selectRandomAttributeToSteal,
  simulateBattle,
  applyBattleResults,
  validateBattle,
  calculateWinProbability,
  getBattleDifficulty,
} from "./battle-logic";

// Leaderboard Logic
export type {
  LeaderboardPlayer,
  LeaderboardVisibility,
} from "./leaderboard-logic";

export {
  calculateRankings,
  calculateRankingsByWinRate,
  getTop20Players,
  detectTop20Changes,
  getSignificantRankChanges,
  getVisibility,
  applyVisibilityRules,
  calculateLeaderboardStats,
  getTop20Distance,
  filterLeaderboard,
  getPlayersAroundRank,
} from "./leaderboard-logic";

// Existing Mock Data
export type { OpponentPanda, BattleEvent, ReplayBattle } from "./battles";
export {
  mockOpponents,
  getOpponentVisibility,
  generateMockBattleReplay,
} from "./battles";

export type {
  LeaderboardEntry,
  Visibility,
  PandaAttributes,
} from "./leaderboard";
export { mockLeaderboardEntries, getRankBadge, isTop20 } from "./leaderboard";

export type { PlayerData, TurnData, UserStats, PoolEntry } from "./game";
export {
  mockPlayerData,
  mockTurnData,
  mockUserStats,
  mockPoolData,
  battleStances,
} from "./game";

export type { PandaType, PandaRarity, PandaArchetype } from "./pandas";
export {
  PANDA_ARCHETYPES,
  rollRandomStats,
  calculateRarity,
  getRarityColor,
  getArchetypeByName,
  rollRandomArchetype,
  calculateStealChance,
} from "./pandas";

export type { Badge, WalletBalance, WalletProfile } from "./wallet";
export {
  mockWalletProfile,
  mockAllBadges,
  getRarityColor as getWalletRarityColor,
  getRarityBgColor,
} from "./wallet";
