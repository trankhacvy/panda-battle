export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type Visibility = 'public' | 'private' | 'friends-only';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  player: string;
  clan?: string;
  level: number;
  rating: number;
  riskLevel: RiskLevel;
  winStreak: number;
  visibility: Visibility;
  avatar: string;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  badges?: string[];
}

export const mockLeaderboardEntries: LeaderboardEntry[] = [
  {
    id: 'user_1',
    rank: 1,
    player: 'Panda Pro',
    clan: 'Elite Dragons',
    level: 15,
    rating: 2850,
    riskLevel: 'extreme',
    winStreak: 18,
    visibility: 'public',
    avatar: '🏆',
    totalWins: 245,
    totalLosses: 68,
    winRate: 78.27,
    badges: ['🏆', '⭐', '🔥'],
  },
  {
    id: 'user_2',
    rank: 2,
    player: 'Battle King',
    clan: 'Shadow Masters',
    level: 14,
    rating: 2790,
    riskLevel: 'high',
    winStreak: 12,
    visibility: 'public',
    avatar: '👑',
    totalWins: 212,
    totalLosses: 66,
    winRate: 76.26,
    badges: ['🏆', '⭐'],
  },
  {
    id: 'user_3',
    rank: 3,
    player: 'Red Fury',
    clan: 'Crimson Alliance',
    level: 13,
    rating: 2750,
    riskLevel: 'high',
    winStreak: 15,
    visibility: 'public',
    avatar: '🔴',
    totalWins: 198,
    totalLosses: 72,
    winRate: 73.33,
    badges: ['🏆', '⭐'],
  },
  {
    id: 'user_4',
    rank: 4,
    player: 'Snowflake',
    level: 12,
    rating: 2680,
    riskLevel: 'medium',
    winStreak: 8,
    visibility: 'public',
    avatar: '❄️',
    totalWins: 178,
    totalLosses: 84,
    winRate: 67.92,
    badges: ['⭐'],
  },
  {
    id: 'user_5',
    rank: 5,
    player: 'Giant Slayer',
    clan: 'Mountain Tribe',
    level: 11,
    rating: 2620,
    riskLevel: 'high',
    winStreak: 11,
    visibility: 'public',
    avatar: '⛰️',
    totalWins: 165,
    totalLosses: 78,
    winRate: 67.88,
    badges: ['⭐'],
  },
  {
    id: 'user_6',
    rank: 6,
    player: 'Swift Strike',
    level: 10,
    rating: 2560,
    riskLevel: 'extreme',
    winStreak: 20,
    visibility: 'public',
    avatar: '⚡',
    totalWins: 152,
    totalLosses: 65,
    winRate: 70.07,
    badges: ['⭐'],
  },
  {
    id: 'user_7',
    rank: 7,
    player: 'Bamboo Master',
    clan: 'Green Forest',
    level: 10,
    rating: 2510,
    riskLevel: 'low',
    winStreak: 6,
    visibility: 'public',
    avatar: '🎋',
    totalWins: 148,
    totalLosses: 72,
    winRate: 67.27,
  },
  {
    id: 'user_8',
    rank: 8,
    player: 'Shadow Dancer',
    level: 9,
    rating: 2450,
    riskLevel: 'high',
    winStreak: 14,
    visibility: 'public',
    avatar: '🌑',
    totalWins: 135,
    totalLosses: 70,
    winRate: 65.85,
  },
  {
    id: 'user_9',
    rank: 9,
    player: 'Phoenix Rising',
    clan: 'Fire Kingdom',
    level: 9,
    rating: 2400,
    riskLevel: 'medium',
    winStreak: 7,
    visibility: 'friends-only',
    avatar: '🔥',
    totalWins: 128,
    totalLosses: 75,
    winRate: 63.07,
  },
  {
    id: 'user_10',
    rank: 10,
    player: 'Zen Master',
    level: 8,
    rating: 2350,
    riskLevel: 'low',
    winStreak: 3,
    visibility: 'public',
    avatar: '☮️',
    totalWins: 120,
    totalLosses: 82,
    winRate: 59.41,
  },
  {
    id: 'user_11',
    rank: 11,
    player: 'Thunder Fist',
    clan: 'Storm Warriors',
    level: 8,
    rating: 2300,
    riskLevel: 'extreme',
    winStreak: 17,
    visibility: 'public',
    avatar: '⚡',
    totalWins: 112,
    totalLosses: 68,
    winRate: 62.22,
  },
  {
    id: 'user_12',
    rank: 12,
    player: 'Luna Knight',
    level: 8,
    rating: 2250,
    riskLevel: 'medium',
    winStreak: 5,
    visibility: 'public',
    avatar: '🌙',
    totalWins: 105,
    totalLosses: 72,
    winRate: 59.32,
  },
  {
    id: 'user_13',
    rank: 13,
    player: 'Iron Defender',
    clan: 'Steel Fortress',
    level: 7,
    rating: 2200,
    riskLevel: 'low',
    winStreak: 4,
    visibility: 'public',
    avatar: '🛡️',
    totalWins: 98,
    totalLosses: 75,
    winRate: 56.65,
  },
  {
    id: 'user_14',
    rank: 14,
    player: 'Mystic Sage',
    level: 7,
    rating: 2150,
    riskLevel: 'medium',
    winStreak: 9,
    visibility: 'friends-only',
    avatar: '🔮',
    totalWins: 92,
    totalLosses: 78,
    winRate: 54.12,
  },
  {
    id: 'user_15',
    rank: 15,
    player: 'Dragon Tamer',
    clan: 'Dragon Riders',
    level: 7,
    rating: 2100,
    riskLevel: 'high',
    winStreak: 13,
    visibility: 'public',
    avatar: '🐉',
    totalWins: 88,
    totalLosses: 80,
    winRate: 52.38,
  },
  {
    id: 'user_16',
    rank: 16,
    player: 'Forest Elf',
    level: 6,
    rating: 2050,
    riskLevel: 'low',
    winStreak: 2,
    visibility: 'public',
    avatar: '🧝',
    totalWins: 82,
    totalLosses: 85,
    winRate: 49.10,
  },
  {
    id: 'user_17',
    rank: 17,
    player: 'Ocean Waves',
    clan: 'Blue Tides',
    level: 6,
    rating: 2000,
    riskLevel: 'medium',
    winStreak: 6,
    visibility: 'public',
    avatar: '🌊',
    totalWins: 78,
    totalLosses: 88,
    winRate: 46.99,
  },
  {
    id: 'user_18',
    rank: 18,
    player: 'Sky Flyer',
    level: 6,
    rating: 1950,
    riskLevel: 'high',
    winStreak: 10,
    visibility: 'public',
    avatar: '🦅',
    totalWins: 75,
    totalLosses: 92,
    winRate: 44.91,
  },
  {
    id: 'user_19',
    rank: 19,
    player: 'Stone Guardian',
    clan: 'Rock Solid',
    level: 5,
    rating: 1900,
    riskLevel: 'low',
    winStreak: 1,
    visibility: 'friends-only',
    avatar: '🪨',
    totalWins: 70,
    totalLosses: 95,
    winRate: 42.42,
  },
  {
    id: 'user_20',
    rank: 20,
    player: 'Star Gazer',
    level: 5,
    rating: 1850,
    riskLevel: 'medium',
    winStreak: 7,
    visibility: 'public',
    avatar: '⭐',
    totalWins: 65,
    totalLosses: 100,
    winRate: 39.39,
  },
];

export const getRiskLevelColor = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'bg-green-500/20 text-green-700 dark:text-green-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    case 'high':
      return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    case 'extreme':
      return 'bg-red-500/20 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
  }
};

export const getRiskLevelLabel = (level: RiskLevel): string => {
  switch (level) {
    case 'low':
      return 'Safe 🛡️';
    case 'medium':
      return 'Balanced ⚖️';
    case 'high':
      return 'Aggressive 🔥';
    case 'extreme':
      return 'Extreme 💥';
    default:
      return 'Unknown';
  }
};
