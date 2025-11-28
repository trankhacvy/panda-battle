/**
 * Zustand Store for Panda Battle Game State
 * Manages player state, turns, battles, and leaderboard
 */

import { create } from "zustand";
import {
  Player,
  Attributes,
  BattleRecord,
  RoundState,
  mockCurrentPlayer,
  mockPlayers,
  mockBattleHistory,
  mockCurrentRound,
} from "../mock/data";

// ============================================================================
// Store State Interface
// ============================================================================

interface GameState {
  // Player State
  currentPlayer: Player;
  opponents: Player[];

  // Battle State
  battleHistory: BattleRecord[];
  currentBattle: BattleRecord | null;

  // Round State
  currentRound: RoundState;

  // UI State
  isLoading: boolean;
  lastTurnRegeneration: Date;

  // Actions - Player
  updatePlayerAttributes: (attributes: Partial<Attributes>) => void;
  updatePlayerTurns: (turns: number) => void;
  consumeTurn: () => boolean;
  addTurns: (amount: number) => void;

  // Actions - Turn Regeneration (Requirement 2.1)
  regenerateTurns: () => void;
  simulateTurnRegeneration: () => void;

  // Actions - Battle
  initiateBattle: (opponentWallet: string) => Promise<BattleRecord | null>;
  completeBattle: (result: BattleRecord) => void;

  // Actions - Leaderboard
  updateLeaderboard: () => Promise<void>;
  getPlayerRank: (wallet: string) => number;
  getTop20: () => Player[];
  getLeaderboard: () => Player[];
  getLeaderboardWithVisibility: (viewerWallet: string) => Promise<Player[]>;

  // Actions - Round
  updatePrizePool: (amount: number) => void;

  // Utility
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_TURNS = 10;
const TURNS_PER_HOUR = 3; // Requirement 2.1
const TURN_REGEN_INTERVAL = 3600000; // 1 hour in milliseconds

// ============================================================================
// Store Implementation
// ============================================================================

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  currentPlayer: mockCurrentPlayer,
  opponents: mockPlayers,
  battleHistory: mockBattleHistory,
  currentBattle: null,
  currentRound: mockCurrentRound,
  isLoading: false,
  lastTurnRegeneration: new Date(),

  // ============================================================================
  // Player Actions
  // ============================================================================

  updatePlayerAttributes: (attributes: Partial<Attributes>) => {
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        attributes: {
          ...state.currentPlayer.attributes,
          ...attributes,
        },
      },
    }));
  },

  updatePlayerTurns: (turns: number) => {
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        turns: Math.min(turns, MAX_TURNS),
      },
    }));
  },

  consumeTurn: () => {
    const state = get();
    if (state.currentPlayer.turns <= 0) {
      return false;
    }

    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        turns: state.currentPlayer.turns - 1,
        lastActivityTime: new Date(),
      },
    }));

    return true;
  },

  addTurns: (amount: number) => {
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        turns: Math.min(state.currentPlayer.turns + amount, MAX_TURNS),
      },
    }));
  },

  // ============================================================================
  // Turn Regeneration (Requirement 2.1, 2.2)
  // ============================================================================

  regenerateTurns: () => {
    const state = get();
    const now = new Date();
    const timeSinceLastRegen =
      now.getTime() - state.lastTurnRegeneration.getTime();

    // Check if an hour has passed
    if (timeSinceLastRegen >= TURN_REGEN_INTERVAL) {
      const hoursElapsed = Math.floor(timeSinceLastRegen / TURN_REGEN_INTERVAL);
      const turnsToAdd = hoursElapsed * TURNS_PER_HOUR;

      set((state) => ({
        currentPlayer: {
          ...state.currentPlayer,
          turns: Math.min(state.currentPlayer.turns + turnsToAdd, MAX_TURNS),
        },
        lastTurnRegeneration: now,
      }));
    }
  },

  simulateTurnRegeneration: () => {
    // Simulate turn regeneration for testing/demo purposes
    set((state) => ({
      currentPlayer: {
        ...state.currentPlayer,
        turns: Math.min(state.currentPlayer.turns + TURNS_PER_HOUR, MAX_TURNS),
      },
      lastTurnRegeneration: new Date(),
    }));
  },

  // ============================================================================
  // Battle Actions
  // ============================================================================

  initiateBattle: async (opponentWallet: string) => {
    const state = get();

    // Check if player has turns (Requirement 3.1)
    if (!state.currentPlayer.turns || state.currentPlayer.turns <= 0) {
      console.error("No turns available");
      return null;
    }

    // Find opponent
    const opponent = state.opponents.find((p) => p.wallet === opponentWallet);
    if (!opponent) {
      console.error("Opponent not found");
      return null;
    }

    // Validate battle
    const { validateBattle, simulateBattle, applyBattleResults } = await import(
      "../mock/battle-logic"
    );

    const validation = validateBattle(state.currentPlayer, opponent);
    if (!validation.valid) {
      console.error(validation.error);
      return null;
    }

    set({ isLoading: true });

    // Simulate battle delay for animation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate battle (Requirements 3.2, 3.3, 4.2)
    const battleRecord = simulateBattle(
      state.currentPlayer,
      opponent,
      state.currentRound.id
    );

    // Apply battle results to player objects
    applyBattleResults(state.currentPlayer, opponent, battleRecord);

    // Consume turn
    get().consumeTurn();

    // Complete battle and update state
    get().completeBattle(battleRecord);

    set({ isLoading: false });

    return battleRecord;
  },

  completeBattle: (result: BattleRecord) => {
    set((state) => ({
      battleHistory: [result, ...state.battleHistory],
      currentBattle: result,
      currentPlayer: {
        ...state.currentPlayer,
        battleCount: state.currentPlayer.battleCount + 1,
        winCount:
          result.winner === state.currentPlayer.wallet
            ? state.currentPlayer.winCount + 1
            : state.currentPlayer.winCount,
        lossCount:
          result.winner !== state.currentPlayer.wallet
            ? state.currentPlayer.lossCount + 1
            : state.currentPlayer.lossCount,
        lastBattleTime: new Date(),
        lastActivityTime: new Date(),
      },
    }));

    // Update leaderboard after battle
    get().updateLeaderboard();
  },

  // ============================================================================
  // Leaderboard Actions (Requirement 5.1)
  // ============================================================================

  updateLeaderboard: async () => {
    const state = get();

    // Import leaderboard logic dynamically
    const { calculateRankings } = await import("../mock/leaderboard-logic");

    // Create array of all players including current player
    const allPlayers = [state.currentPlayer, ...state.opponents];

    // Calculate rankings (Requirement 5.1)
    const rankedPlayers = calculateRankings(allPlayers);

    // Separate current player from opponents
    const currentPlayer = rankedPlayers.find(
      (p) => p.wallet === state.currentPlayer.wallet
    )!;
    const opponents = rankedPlayers.filter(
      (p) => p.wallet !== state.currentPlayer.wallet
    );

    set({
      currentPlayer,
      opponents,
    });
  },

  getPlayerRank: (wallet: string) => {
    const state = get();
    if (wallet === state.currentPlayer.wallet) {
      return state.currentPlayer.rank;
    }

    const opponent = state.opponents.find((p) => p.wallet === wallet);
    return opponent?.rank || 0;
  },

  // ============================================================================
  // Additional Leaderboard Helpers
  // ============================================================================

  getTop20: () => {
    const state = get();
    const allPlayers = [state.currentPlayer, ...state.opponents];
    return allPlayers.filter((p) => p.inTop20).sort((a, b) => a.rank - b.rank);
  },

  getLeaderboard: () => {
    const state = get();
    const allPlayers = [state.currentPlayer, ...state.opponents];
    return allPlayers.sort((a, b) => a.rank - b.rank);
  },

  getLeaderboardWithVisibility: async (viewerWallet: string) => {
    const state = get();
    const { applyVisibilityRules } = await import("../mock/leaderboard-logic");
    const allPlayers = [state.currentPlayer, ...state.opponents];
    const sorted = allPlayers.sort((a, b) => a.rank - b.rank);
    return applyVisibilityRules(sorted, viewerWallet);
  },

  // ============================================================================
  // Round Actions
  // ============================================================================

  updatePrizePool: (amount: number) => {
    set((state) => ({
      currentRound: {
        ...state.currentRound,
        prizePool: state.currentRound.prizePool + amount,
      },
    }));
  },

  // ============================================================================
  // Utility
  // ============================================================================

  reset: () => {
    set({
      currentPlayer: mockCurrentPlayer,
      opponents: mockPlayers,
      battleHistory: mockBattleHistory,
      currentBattle: null,
      currentRound: mockCurrentRound,
      isLoading: false,
      lastTurnRegeneration: new Date(),
    });
  },
}));

// ============================================================================
// Hooks for Specific State Slices
// ============================================================================

/**
 * Hook to get current player state
 */
export const useCurrentPlayer = () =>
  useGameStore((state) => state.currentPlayer);

/**
 * Hook to get opponents
 */
export const useOpponents = () => useGameStore((state) => state.opponents);

/**
 * Hook to get battle history
 */
export const useBattleHistory = () =>
  useGameStore((state) => state.battleHistory);

/**
 * Hook to get current round
 */
export const useCurrentRound = () =>
  useGameStore((state) => state.currentRound);

/**
 * Hook to get loading state
 */
export const useIsLoading = () => useGameStore((state) => state.isLoading);

/**
 * Hook to get player turns
 */
export const usePlayerTurns = () =>
  useGameStore((state) => state.currentPlayer.turns);

/**
 * Hook to get player rank
 */
export const usePlayerRank = () =>
  useGameStore((state) => state.currentPlayer.rank);

/**
 * Hook to check if player is in Top 20
 */
export const useIsTop20 = () =>
  useGameStore((state) => state.currentPlayer.inTop20);
