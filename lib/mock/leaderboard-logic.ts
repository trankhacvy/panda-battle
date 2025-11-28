/**
 * Mock Leaderboard Logic for Panda Battle Game
 * Implements ranking calculations and Top 20 management
 * Requirement: 5.1
 */

import { Player, calculateTotalPower } from "./data";

// ============================================================================
// Leaderboard Entry Interface
// ============================================================================

export interface LeaderboardPlayer extends Player {
  previousRank?: number;
  rankChange?: number; // Positive = moved up, Negative = moved down
}

// ============================================================================
// Ranking Calculation (Requirement 5.1)
// ============================================================================

/**
 * Calculate rankings based on total attribute sum
 * Players with higher total power rank higher
 *
 * @param players - Array of players to rank
 * @returns Sorted array with updated ranks
 */
export function calculateRankings(players: Player[]): LeaderboardPlayer[] {
  // Store previous ranks
  const playersWithPrevious: LeaderboardPlayer[] = players.map((p) => ({
    ...p,
    previousRank: p.rank,
  }));

  // Sort by total power (descending)
  const sorted = playersWithPrevious.sort((a, b) => {
    const powerA = calculateTotalPower(a.attributes);
    const powerB = calculateTotalPower(b.attributes);

    // Primary sort: total power
    if (powerB !== powerA) {
      return powerB - powerA;
    }

    // Tiebreaker 1: win count
    if (b.winCount !== a.winCount) {
      return b.winCount - a.winCount;
    }

    // Tiebreaker 2: fewer losses
    if (a.lossCount !== b.lossCount) {
      return a.lossCount - b.lossCount;
    }

    // Tiebreaker 3: entry time (earlier is better)
    return a.entryTime.getTime() - b.entryTime.getTime();
  });

  // Update ranks and calculate rank changes
  sorted.forEach((player, index) => {
    const newRank = index + 1;
    player.rank = newRank;
    player.inTop20 = newRank <= 20;

    if (player.previousRank) {
      player.rankChange = player.previousRank - newRank; // Positive = moved up
    }
  });

  return sorted;
}

/**
 * Alternative ranking based on win/loss ratio
 * Can be used as an alternative ranking method
 */
export function calculateRankingsByWinRate(
  players: Player[]
): LeaderboardPlayer[] {
  const playersWithPrevious: LeaderboardPlayer[] = players.map((p) => ({
    ...p,
    previousRank: p.rank,
  }));

  const sorted = playersWithPrevious.sort((a, b) => {
    const winRateA = a.battleCount > 0 ? a.winCount / a.battleCount : 0;
    const winRateB = b.battleCount > 0 ? b.winCount / b.battleCount : 0;

    // Primary sort: win rate
    if (winRateB !== winRateA) {
      return winRateB - winRateA;
    }

    // Tiebreaker: total wins
    if (b.winCount !== a.winCount) {
      return b.winCount - a.winCount;
    }

    // Tiebreaker: total power
    const powerA = calculateTotalPower(a.attributes);
    const powerB = calculateTotalPower(b.attributes);
    return powerB - powerA;
  });

  sorted.forEach((player, index) => {
    const newRank = index + 1;
    player.rank = newRank;
    player.inTop20 = newRank <= 20;

    if (player.previousRank) {
      player.rankChange = player.previousRank - newRank;
    }
  });

  return sorted;
}

// ============================================================================
// Top 20 Management
// ============================================================================

/**
 * Get Top 20 players from leaderboard
 */
export function getTop20Players(
  players: LeaderboardPlayer[]
): LeaderboardPlayer[] {
  return players.filter((p) => p.rank <= 20);
}

/**
 * Check if a player entered or exited Top 20
 */
export function detectTop20Changes(players: LeaderboardPlayer[]): {
  entered: LeaderboardPlayer[];
  exited: LeaderboardPlayer[];
} {
  const entered: LeaderboardPlayer[] = [];
  const exited: LeaderboardPlayer[] = [];

  players.forEach((player) => {
    if (player.previousRank && player.rank) {
      // Entered Top 20
      if (player.previousRank > 20 && player.rank <= 20) {
        entered.push(player);
      }
      // Exited Top 20
      if (player.previousRank <= 20 && player.rank > 20) {
        exited.push(player);
      }
    }
  });

  return { entered, exited };
}

/**
 * Get players who had significant rank changes
 */
export function getSignificantRankChanges(
  players: LeaderboardPlayer[],
  threshold: number = 5
): LeaderboardPlayer[] {
  return players.filter(
    (p) => p.rankChange && Math.abs(p.rankChange) >= threshold
  );
}

// ============================================================================
// Leaderboard Visibility (Requirements 5.5, 5.6, 9.1, 9.2, 9.3)
// ============================================================================

export type LeaderboardVisibility = "full" | "partial" | "hidden";

/**
 * Determine visibility level based on rank
 */
export function getVisibility(rank: number): LeaderboardVisibility {
  if (rank <= 20) return "full"; // Top 20: full visibility
  if (rank <= 100) return "partial"; // Mid-tier: partial visibility
  return "hidden"; // Bottom-tier: hidden
}

/**
 * Apply visibility rules to leaderboard
 * Returns leaderboard with appropriate information hidden
 */
export function applyVisibilityRules(
  players: LeaderboardPlayer[],
  viewerWallet: string
): LeaderboardPlayer[] {
  return players.map((player) => {
    const visibility = getVisibility(player.rank);

    // Always show full info for the viewer
    if (player.wallet === viewerWallet) {
      return { ...player };
    }

    // Apply visibility rules
    if (visibility === "hidden") {
      return {
        ...player,
        pandaName: "Hidden Player",
        attributes: {
          strength: 0,
          speed: 0,
          endurance: 0,
          luck: 0,
        },
        winCount: 0,
        lossCount: 0,
        battleCount: 0,
      };
    }

    if (visibility === "partial") {
      return {
        ...player,
        // Show partial attributes (rounded/obscured)
        attributes: {
          strength: Math.floor(player.attributes.strength / 5) * 5,
          speed: Math.floor(player.attributes.speed / 5) * 5,
          endurance: Math.floor(player.attributes.endurance / 5) * 5,
          luck: Math.floor(player.attributes.luck / 5) * 5,
        },
      };
    }

    // Full visibility
    return { ...player };
  });
}

// ============================================================================
// Leaderboard Statistics
// ============================================================================

/**
 * Calculate leaderboard statistics
 */
export function calculateLeaderboardStats(players: LeaderboardPlayer[]): {
  totalPlayers: number;
  averagePower: number;
  topPower: number;
  averageWinRate: number;
  top20Threshold: number;
} {
  const totalPlayers = players.length;
  const totalPower = players.reduce(
    (sum, p) => sum + calculateTotalPower(p.attributes),
    0
  );
  const averagePower = totalPlayers > 0 ? totalPower / totalPlayers : 0;

  const topPower =
    players.length > 0 ? calculateTotalPower(players[0].attributes) : 0;

  const totalWinRate = players.reduce((sum, p) => {
    const winRate = p.battleCount > 0 ? p.winCount / p.battleCount : 0;
    return sum + winRate;
  }, 0);
  const averageWinRate = totalPlayers > 0 ? totalWinRate / totalPlayers : 0;

  const top20Player = players.find((p) => p.rank === 20);
  const top20Threshold = top20Player
    ? calculateTotalPower(top20Player.attributes)
    : 0;

  return {
    totalPlayers,
    averagePower: Math.round(averagePower),
    topPower,
    averageWinRate: Math.round(averageWinRate * 100) / 100,
    top20Threshold,
  };
}

/**
 * Get player's position relative to Top 20
 */
export function getTop20Distance(player: Player): {
  distance: number;
  powerNeeded: number;
  message: string;
} {
  if (player.rank <= 20) {
    return {
      distance: 0,
      powerNeeded: 0,
      message: "You are in the Top 20!",
    };
  }

  const distance = player.rank - 20;

  // This would need the actual Top 20 threshold from the leaderboard
  // For now, estimate based on rank
  const estimatedPowerNeeded = distance * 2;

  return {
    distance,
    powerNeeded: estimatedPowerNeeded,
    message: `You are ${distance} ranks away from Top 20`,
  };
}

// ============================================================================
// Leaderboard Filtering and Sorting
// ============================================================================

/**
 * Filter leaderboard by various criteria
 */
export function filterLeaderboard(
  players: LeaderboardPlayer[],
  filters: {
    minRank?: number;
    maxRank?: number;
    minPower?: number;
    maxPower?: number;
    minWinRate?: number;
  }
): LeaderboardPlayer[] {
  return players.filter((player) => {
    if (filters.minRank && player.rank < filters.minRank) return false;
    if (filters.maxRank && player.rank > filters.maxRank) return false;

    const power = calculateTotalPower(player.attributes);
    if (filters.minPower && power < filters.minPower) return false;
    if (filters.maxPower && power > filters.maxPower) return false;

    if (filters.minWinRate) {
      const winRate =
        player.battleCount > 0 ? player.winCount / player.battleCount : 0;
      if (winRate < filters.minWinRate) return false;
    }

    return true;
  });
}

/**
 * Get players around a specific rank (for context)
 */
export function getPlayersAroundRank(
  players: LeaderboardPlayer[],
  targetRank: number,
  range: number = 5
): LeaderboardPlayer[] {
  const minRank = Math.max(1, targetRank - range);
  const maxRank = targetRank + range;

  return players.filter((p) => p.rank >= minRank && p.rank <= maxRank);
}
