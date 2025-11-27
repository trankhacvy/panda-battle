export interface Badge {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  icon: string;
  equippedAt?: string;
}

export interface WalletBalance {
  solAmount: number;
  stakedPandas: number;
  totalValue: number;
  currency: 'SOL';
}

export interface WalletProfile {
  address: string;
  isConnected: boolean;
  balance: WalletBalance;
  equippedBadges: Badge[];
  totalBadges: number;
  joinedDate: string;
  verified: boolean;
}

export const mockWalletProfile: WalletProfile = {
  address: 'GK...7UaJ',
  isConnected: true,
  balance: {
    solAmount: 2.45,
    stakedPandas: 5,
    totalValue: 150.75,
    currency: 'SOL',
  },
  equippedBadges: [
    {
      id: 'badge_legendary_warrior',
      name: 'Legendary Warrior',
      description: 'Won 100+ battles',
      rarity: 'legendary',
      icon: '⚔️',
      equippedAt: '2024-11-20T10:30:00Z',
    },
    {
      id: 'badge_collector',
      name: 'Collector',
      description: 'Owned 10+ pandas',
      rarity: 'rare',
      icon: '🎁',
      equippedAt: '2024-11-15T15:45:00Z',
    },
    {
      id: 'badge_streak_master',
      name: 'Streak Master',
      description: '20+ win streak',
      rarity: 'rare',
      icon: '🔥',
      equippedAt: '2024-11-10T08:20:00Z',
    },
  ],
  totalBadges: 12,
  joinedDate: '2024-10-15T08:30:00Z',
  verified: true,
};

export const mockAllBadges: Badge[] = [
  {
    id: 'badge_legendary_warrior',
    name: 'Legendary Warrior',
    description: 'Won 100+ battles',
    rarity: 'legendary',
    icon: '⚔️',
  },
  {
    id: 'badge_collector',
    name: 'Collector',
    description: 'Owned 10+ pandas',
    rarity: 'rare',
    icon: '🎁',
  },
  {
    id: 'badge_streak_master',
    name: 'Streak Master',
    description: '20+ win streak',
    rarity: 'rare',
    icon: '🔥',
  },
  {
    id: 'badge_first_win',
    name: 'First Victory',
    description: 'Won your first battle',
    rarity: 'common',
    icon: '🎯',
  },
  {
    id: 'badge_speed_demon',
    name: 'Speed Demon',
    description: 'Won a battle in under 2 minutes',
    rarity: 'uncommon',
    icon: '⚡',
  },
  {
    id: 'badge_underdog',
    name: 'Underdog',
    description: 'Won against a higher rated opponent',
    rarity: 'uncommon',
    icon: '🐕',
  },
  {
    id: 'badge_leaderboard',
    name: 'Leaderboard Champion',
    description: 'Reached top 10 on leaderboard',
    rarity: 'legendary',
    icon: '👑',
  },
  {
    id: 'badge_grinder',
    name: 'Grinder',
    description: 'Played 500+ battles',
    rarity: 'rare',
    icon: '⚙️',
  },
  {
    id: 'badge_perfect_defense',
    name: 'Perfect Defense',
    description: 'Won without taking damage',
    rarity: 'rare',
    icon: '🛡️',
  },
  {
    id: 'badge_trader',
    name: 'Trader',
    description: 'Made 10+ trades',
    rarity: 'uncommon',
    icon: '💱',
  },
  {
    id: 'badge_early_adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    rarity: 'rare',
    icon: '🚀',
  },
  {
    id: 'badge_community_hero',
    name: 'Community Hero',
    description: 'Referred 5+ players',
    rarity: 'uncommon',
    icon: '🦸',
  },
];

export const getRarityColor = (rarity: Badge['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-500 dark:text-gray-400';
    case 'uncommon':
      return 'text-green-600 dark:text-green-400';
    case 'rare':
      return 'text-blue-600 dark:text-blue-400';
    case 'legendary':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-gray-500';
  }
};

export const getRarityBgColor = (rarity: Badge['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 dark:bg-gray-800';
    case 'uncommon':
      return 'bg-green-100 dark:bg-green-900';
    case 'rare':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'legendary':
      return 'bg-purple-100 dark:bg-purple-900';
    default:
      return 'bg-gray-100';
  }
};
