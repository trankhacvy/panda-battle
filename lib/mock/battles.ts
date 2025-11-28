export interface BattleEvent {
  id: string;
  type:
    | "attack"
    | "defend"
    | "damage"
    | "heal"
    | "stance_change"
    | "victory"
    | "defeat";
  actor: "player" | "opponent";
  description: string;
  damageDealt?: number;
  timestamp: number;
  icon?: string;
}

// Opponent visibility based on rank (Requirements 9.1, 9.2, 9.3)
export type OpponentVisibility = "full" | "partial" | "hidden";

export interface OpponentPanda {
  id: string;
  name: string;
  type: "bamboo" | "red" | "giant" | "snow";
  rank: number; // Leaderboard position
  visibility: OpponentVisibility; // Based on rank
  power: number; // Total attribute sum
  risk: number; // 1-10 (difficulty)
  favoriteStance: "offensive" | "defensive" | "stealth";
  baseHP: number;
  // Attributes match design spec (Strength, Speed, Endurance, Luck)
  attributes: {
    strength: number;
    speed: number;
    endurance: number;
    luck: number;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isInTop20: boolean; // Top 20 players have vulnerability modifier (Requirement 3.6)
  lastMatch?: {
    opponentName: string;
    result: "win" | "loss" | "draw";
    timestamp: string;
  };
  wins: number;
  losses: number;
  winRate: number;
}

export interface ReplayBattle {
  id: string;
  playerPanda: OpponentPanda;
  opponentPanda: OpponentPanda;
  events: BattleEvent[];
  duration: number; // in milliseconds
  winner: "player" | "opponent";
}

// Helper to determine visibility based on rank (Requirements 9.1, 9.2, 9.3)
export function getOpponentVisibility(rank: number): OpponentVisibility {
  if (rank <= 20) return "full"; // Top 20: full visibility
  if (rank <= 100) return "partial"; // Mid-tier: partial visibility
  return "hidden"; // Bottom-tier: hidden
}

// Mock opponent roster with proper attributes matching design spec
export const mockOpponents: OpponentPanda[] = [
  // Top 20 opponents (full visibility)
  {
    id: "opponent_1",
    name: "Panda Pro",
    type: "red",
    rank: 1,
    visibility: "full",
    power: 115,
    risk: 10,
    favoriteStance: "offensive",
    baseHP: 140,
    attributes: {
      strength: 35,
      speed: 32,
      endurance: 28,
      luck: 20,
    },
    colorPalette: {
      primary: "#D32F2F",
      secondary: "#E53935",
      accent: "#FF6F00",
    },
    isInTop20: true,
    wins: 245,
    losses: 68,
    winRate: 78.27,
    lastMatch: {
      opponentName: "Battle King",
      result: "win",
      timestamp: "2024-11-27T14:30:00Z",
    },
  },
  {
    id: "opponent_2",
    name: "Battle King",
    type: "giant",
    rank: 2,
    visibility: "full",
    power: 112,
    risk: 9,
    favoriteStance: "defensive",
    baseHP: 145,
    attributes: {
      strength: 38,
      speed: 25,
      endurance: 32,
      luck: 17,
    },
    colorPalette: {
      primary: "#8D6E63",
      secondary: "#A1887F",
      accent: "#795548",
    },
    isInTop20: true,
    wins: 212,
    losses: 66,
    winRate: 76.26,
    lastMatch: {
      opponentName: "Panda Pro",
      result: "loss",
      timestamp: "2024-11-27T14:30:00Z",
    },
  },
  {
    id: "opponent_3",
    name: "Red Fury",
    type: "red",
    rank: 3,
    visibility: "full",
    power: 110,
    risk: 9,
    favoriteStance: "offensive",
    baseHP: 125,
    attributes: {
      strength: 33,
      speed: 35,
      endurance: 24,
      luck: 18,
    },
    colorPalette: {
      primary: "#C62828",
      secondary: "#E53935",
      accent: "#FF9800",
    },
    isInTop20: true,
    wins: 198,
    losses: 72,
    winRate: 73.33,
  },
  {
    id: "opponent_4",
    name: "Snowflake",
    type: "snow",
    rank: 5,
    visibility: "full",
    power: 108,
    risk: 7,
    favoriteStance: "stealth",
    baseHP: 130,
    attributes: {
      strength: 26,
      speed: 30,
      endurance: 28,
      luck: 24,
    },
    colorPalette: {
      primary: "#81C784",
      secondary: "#66BB6A",
      accent: "#2196F3",
    },
    isInTop20: true,
    wins: 178,
    losses: 84,
    winRate: 67.92,
  },
  {
    id: "opponent_5",
    name: "Giant Slayer",
    type: "bamboo",
    rank: 8,
    visibility: "full",
    power: 105,
    risk: 8,
    favoriteStance: "offensive",
    baseHP: 128,
    attributes: {
      strength: 32,
      speed: 28,
      endurance: 26,
      luck: 19,
    },
    colorPalette: {
      primary: "#1A1A1A",
      secondary: "#333333",
      accent: "#4CAF50",
    },
    isInTop20: true,
    wins: 165,
    losses: 78,
    winRate: 67.88,
  },
  {
    id: "opponent_6",
    name: "Swift Strike",
    type: "red",
    rank: 12,
    visibility: "full",
    power: 103,
    risk: 9,
    favoriteStance: "offensive",
    baseHP: 118,
    attributes: {
      strength: 28,
      speed: 38,
      endurance: 20,
      luck: 17,
    },
    colorPalette: {
      primary: "#D32F2F",
      secondary: "#FF5252",
      accent: "#FF6F00",
    },
    isInTop20: true,
    wins: 152,
    losses: 65,
    winRate: 70.07,
  },
  {
    id: "opponent_7",
    name: "Bamboo Master",
    type: "bamboo",
    rank: 15,
    visibility: "full",
    power: 101,
    risk: 6,
    favoriteStance: "defensive",
    baseHP: 135,
    attributes: {
      strength: 25,
      speed: 24,
      endurance: 32,
      luck: 20,
    },
    colorPalette: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#4CAF50",
    },
    isInTop20: true,
    wins: 148,
    losses: 72,
    winRate: 67.27,
  },
  {
    id: "opponent_8",
    name: "Shadow Dancer",
    type: "bamboo",
    rank: 18,
    visibility: "full",
    power: 100,
    risk: 8,
    favoriteStance: "stealth",
    baseHP: 122,
    attributes: {
      strength: 27,
      speed: 32,
      endurance: 23,
      luck: 18,
    },
    colorPalette: {
      primary: "#1A1A1A",
      secondary: "#333333",
      accent: "#9C27B0",
    },
    isInTop20: true,
    wins: 135,
    losses: 70,
    winRate: 65.85,
  },
  // Mid-tier opponents (partial visibility)
  {
    id: "opponent_9",
    name: "Thunder Fist",
    type: "red",
    rank: 35,
    visibility: "partial",
    power: 95,
    risk: 7,
    favoriteStance: "offensive",
    baseHP: 120,
    attributes: {
      strength: 30,
      speed: 28,
      endurance: 20,
      luck: 17,
    },
    colorPalette: {
      primary: "#C62828",
      secondary: "#E53935",
      accent: "#FF9800",
    },
    isInTop20: false,
    wins: 112,
    losses: 68,
    winRate: 62.22,
  },
  {
    id: "opponent_10",
    name: "Luna Knight",
    type: "snow",
    rank: 48,
    visibility: "partial",
    power: 92,
    risk: 6,
    favoriteStance: "defensive",
    baseHP: 125,
    attributes: {
      strength: 24,
      speed: 26,
      endurance: 25,
      luck: 17,
    },
    colorPalette: {
      primary: "#4DB8FF",
      secondary: "#81D4FA",
      accent: "#2196F3",
    },
    isInTop20: false,
    wins: 105,
    losses: 72,
    winRate: 59.32,
  },
  {
    id: "opponent_11",
    name: "Iron Defender",
    type: "giant",
    rank: 62,
    visibility: "partial",
    power: 90,
    risk: 5,
    favoriteStance: "defensive",
    baseHP: 138,
    attributes: {
      strength: 26,
      speed: 20,
      endurance: 28,
      luck: 16,
    },
    colorPalette: {
      primary: "#795548",
      secondary: "#8D6E63",
      accent: "#BCAAA4",
    },
    isInTop20: false,
    wins: 98,
    losses: 75,
    winRate: 56.65,
  },
  // Bottom-tier opponents (hidden)
  {
    id: "opponent_12",
    name: "Hidden Warrior",
    type: "bamboo",
    rank: 150,
    visibility: "hidden",
    power: 85,
    risk: 4,
    favoriteStance: "defensive",
    baseHP: 115,
    attributes: {
      strength: 22,
      speed: 24,
      endurance: 23,
      luck: 16,
    },
    colorPalette: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#4CAF50",
    },
    isInTop20: false,
    wins: 65,
    losses: 88,
    winRate: 42.48,
  },
  {
    id: "opponent_13",
    name: "Mystery Panda",
    type: "snow",
    rank: 200,
    visibility: "hidden",
    power: 82,
    risk: 3,
    favoriteStance: "stealth",
    baseHP: 110,
    attributes: {
      strength: 20,
      speed: 22,
      endurance: 22,
      luck: 18,
    },
    colorPalette: {
      primary: "#81C784",
      secondary: "#66BB6A",
      accent: "#2196F3",
    },
    isInTop20: false,
    wins: 52,
    losses: 95,
    winRate: 35.37,
  },
];

// Sample battle events for replay demonstrations
export const generateMockBattleReplay = (
  playerPanda: OpponentPanda,
  opponentPanda: OpponentPanda
): ReplayBattle => {
  const playerWins = Math.random() > 0.5;
  const events: BattleEvent[] = [
    {
      id: "event_0",
      type: "attack",
      actor: "player",
      description: `${playerPanda.name} uses Quick Attack!`,
      damageDealt: 18,
      timestamp: 0,
      icon: "⚡",
    },
    {
      id: "event_1",
      type: "damage",
      actor: "opponent",
      description: `${opponentPanda.name} takes 18 damage!`,
      damageDealt: 18,
      timestamp: 500,
      icon: "💥",
    },
    {
      id: "event_2",
      type: "defend",
      actor: "opponent",
      description: `${opponentPanda.name} takes a defensive stance!`,
      timestamp: 1200,
      icon: "🛡️",
    },
    {
      id: "event_3",
      type: "attack",
      actor: "opponent",
      description: `${opponentPanda.name} counterattacks!`,
      damageDealt: 12,
      timestamp: 2000,
      icon: "🥊",
    },
    {
      id: "event_4",
      type: "damage",
      actor: "player",
      description: `${playerPanda.name} takes 12 damage!`,
      damageDealt: 12,
      timestamp: 2500,
      icon: "💢",
    },
    {
      id: "event_5",
      type: "attack",
      actor: "player",
      description: `${playerPanda.name} uses Power Strike!`,
      damageDealt: 28,
      timestamp: 3200,
      icon: "💫",
    },
    {
      id: "event_6",
      type: "damage",
      actor: "opponent",
      description: `${opponentPanda.name} takes 28 damage!`,
      damageDealt: 28,
      timestamp: 3800,
      icon: "💥",
    },
    {
      id: "event_7",
      type: "stance_change",
      actor: "opponent",
      description: `${opponentPanda.name} switches to aggressive stance!`,
      timestamp: 4500,
      icon: "🔥",
    },
    {
      id: "event_8",
      type: "attack",
      actor: "opponent",
      description: `${opponentPanda.name} launches ultimate attack!`,
      damageDealt: 35,
      timestamp: 5300,
      icon: "⚔️",
    },
    {
      id: "event_9",
      type: "damage",
      actor: "player",
      description: `${playerPanda.name} takes 35 damage!`,
      damageDealt: 35,
      timestamp: 5900,
      icon: "💢",
    },
    {
      id: "event_10",
      type: playerWins ? "victory" : "defeat",
      actor: playerWins ? "player" : "opponent",
      description: playerWins
        ? `${playerPanda.name} is victorious!`
        : `${opponentPanda.name} wins the battle!`,
      timestamp: 7000,
      icon: playerWins ? "🏆" : "💀",
    },
  ];

  return {
    id: `battle_${Date.now()}`,
    playerPanda,
    opponentPanda,
    events,
    duration: 7000,
    winner: playerWins ? "player" : "opponent",
  };
};
