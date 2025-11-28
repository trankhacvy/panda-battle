export interface PoolEntry {
  id: string;
  name: string;
  totalWagers: number;
  participantCount: number;
  rewardPool: number;
  status: "active" | "upcoming" | "completed";
}

export const mockPoolData: PoolEntry[] = [
  {
    id: "pool_1",
    name: "Daily Dragon Masters",
    totalWagers: 45250,
    participantCount: 342,
    rewardPool: 12500,
    status: "active",
  },
  {
    id: "pool_2",
    name: "Panda Championship 2024",
    totalWagers: 89500,
    participantCount: 687,
    rewardPool: 25000,
    status: "active",
  },
  {
    id: "pool_3",
    name: "Weekend Warriors Cup",
    totalWagers: 32100,
    participantCount: 245,
    rewardPool: 8500,
    status: "active",
  },
  {
    id: "pool_4",
    name: "Bamboo Elite Showdown",
    totalWagers: 67800,
    participantCount: 512,
    rewardPool: 18900,
    status: "active",
  },
  {
    id: "pool_5",
    name: "Night Owls Battle Royale",
    totalWagers: 54300,
    participantCount: 421,
    rewardPool: 15000,
    status: "active",
  },
  {
    id: "pool_6",
    name: "Speed Racer Tournament",
    totalWagers: 38600,
    participantCount: 298,
    rewardPool: 11200,
    status: "active",
  },
];

export interface UserStats {
  totalWins: number;
  totalLosses: number;
  level: number;
  rating: number;
  winRate: number;
  currentStreak: number;
}

export const mockUserStats: UserStats = {
  totalWins: 42,
  totalLosses: 18,
  level: 7,
  rating: 1620,
  winRate: 70,
  currentStreak: 5,
};

export interface TurnData {
  remainingTurns: number;
  maxTurns: number;
  nextResetTime: Date;
  turnsRegeneratePerHour: number;
}

export const mockTurnData: TurnData = {
  remainingTurns: 8,
  maxTurns: 10,
  nextResetTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
  turnsRegeneratePerHour: 2,
};

export const battleStances = [
  { id: "aggressive", label: "Aggressive", emoji: "⚔️" },
  { id: "balanced", label: "Balanced", emoji: "⚖️" },
  { id: "defensive", label: "Defensive", emoji: "🛡️" },
  { id: "swift", label: "Swift", emoji: "💨" },
];

export interface PlayerData {
  id: string;
  name: string;
  pandaName: string;
  attributes: {
    strength: number;
    speed: number;
    endurance: number;
    luck: number;
  };
  rank: number;
  totalPlayers: number;
  wins: number;
  losses: number;
  totalBattles: number;
  earnings: number;
  turns: number;
  maxTurns: number;
  nextTurnRegenTime: Date;
}

export const mockPlayerData: PlayerData = {
  id: "player_1",
  name: "Player",
  pandaName: "Shadow Striker",
  attributes: {
    strength: 28,
    speed: 32,
    endurance: 22,
    luck: 18,
  },
  rank: 42,
  totalPlayers: 342,
  wins: 15,
  losses: 8,
  totalBattles: 23,
  earnings: 2.45, // SOL
  turns: 8,
  maxTurns: 10,
  nextTurnRegenTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
};
