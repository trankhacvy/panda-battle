export type PandaType = 'bamboo' | 'red' | 'giant' | 'snow';
export type PandaRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PandaArchetype {
  name: string;
  type: PandaType;
  rarity: PandaRarity;
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
    intellect: number;
  };
  abilityText: string;
  clan: string;
  riskRating: number; // 0-100, higher = harder playstyle
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const PANDA_ARCHETYPES: Record<string, PandaArchetype> = {
  bamboo_warrior: {
    name: 'Bamboo Warrior',
    type: 'bamboo',
    rarity: 'common',
    baseStats: { attack: 70, defense: 75, speed: 60, intellect: 50 },
    abilityText: 'Focused strikes. High defense, steady damage output.',
    clan: 'Forest Clan',
    riskRating: 25,
    colorPalette: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#4CAF50',
    },
  },
  bamboo_striker: {
    name: 'Bamboo Striker',
    type: 'bamboo',
    rarity: 'rare',
    baseStats: { attack: 85, defense: 60, speed: 75, intellect: 55 },
    abilityText: 'Aggressive offense. Quick strikes with moderate defense.',
    clan: 'Forest Clan',
    riskRating: 45,
    colorPalette: {
      primary: '#1a1a1a',
      secondary: '#4CAF50',
      accent: '#81C784',
    },
  },
  bamboo_sage: {
    name: 'Bamboo Sage',
    type: 'bamboo',
    rarity: 'epic',
    baseStats: { attack: 65, defense: 70, speed: 70, intellect: 85 },
    abilityText: 'Tactical mind. High intellect grants powerful techniques.',
    clan: 'Forest Clan',
    riskRating: 35,
    colorPalette: {
      primary: '#000000',
      secondary: '#2196F3',
      accent: '#1976D2',
    },
  },
  red_fury: {
    name: 'Red Fury',
    type: 'red',
    rarity: 'rare',
    baseStats: { attack: 88, defense: 58, speed: 82, intellect: 52 },
    abilityText: 'Blazing speed. Lightning-fast attacks with high risk.',
    clan: 'Crimson Clan',
    riskRating: 55,
    colorPalette: {
      primary: '#D32F2F',
      secondary: '#E53935',
      accent: '#FF6F00',
    },
  },
  red_guardian: {
    name: 'Red Guardian',
    type: 'red',
    rarity: 'epic',
    baseStats: { attack: 75, defense: 80, speed: 65, intellect: 70 },
    abilityText: 'Protective shield. Excellent defense and balanced offense.',
    clan: 'Crimson Clan',
    riskRating: 30,
    colorPalette: {
      primary: '#C62828',
      secondary: '#D32F2F',
      accent: '#FF6F00',
    },
  },
  red_mystic: {
    name: 'Red Mystic',
    type: 'red',
    rarity: 'legendary',
    baseStats: { attack: 78, defense: 68, speed: 75, intellect: 92 },
    abilityText: 'Arcane wisdom. Masters ancient panda techniques.',
    clan: 'Crimson Clan',
    riskRating: 40,
    colorPalette: {
      primary: '#B71C1C',
      secondary: '#9C27B0',
      accent: '#CE93D8',
    },
  },
  giant_colossus: {
    name: 'Giant Colossus',
    type: 'giant',
    rarity: 'epic',
    baseStats: { attack: 92, defense: 85, speed: 50, intellect: 48 },
    abilityText: 'Immense strength. Devastating attacks with solid defense.',
    clan: 'Mountain Clan',
    riskRating: 50,
    colorPalette: {
      primary: '#8D6E63',
      secondary: '#795548',
      accent: '#D7CCC8',
    },
  },
  giant_stalwart: {
    name: 'Giant Stalwart',
    type: 'giant',
    rarity: 'rare',
    baseStats: { attack: 78, defense: 88, speed: 55, intellect: 58 },
    abilityText: 'Unyielding defense. Nearly impenetrable wall.',
    clan: 'Mountain Clan',
    riskRating: 20,
    colorPalette: {
      primary: '#795548',
      secondary: '#5D4037',
      accent: '#BCAAA4',
    },
  },
  snow_frostbite: {
    name: 'Snow Frostbite',
    type: 'snow',
    rarity: 'rare',
    baseStats: { attack: 72, defense: 70, speed: 78, intellect: 80 },
    abilityText: 'Icy precision. Balanced attacker with high intellect.',
    clan: 'Frost Clan',
    riskRating: 35,
    colorPalette: {
      primary: '#81C784',
      secondary: '#66BB6A',
      accent: '#2196F3',
    },
  },
  snow_blizzard: {
    name: 'Snow Blizzard',
    type: 'snow',
    rarity: 'epic',
    baseStats: { attack: 80, defense: 75, speed: 85, intellect: 75 },
    abilityText: 'Frozen vortex. Swift and devastating techniques.',
    clan: 'Frost Clan',
    riskRating: 45,
    colorPalette: {
      primary: '#4DB8FF',
      secondary: '#81D4FA',
      accent: '#01579B',
    },
  },
  snow_sage: {
    name: 'Snow Sage',
    type: 'snow',
    rarity: 'legendary',
    baseStats: { attack: 70, defense: 75, speed: 72, intellect: 95 },
    abilityText: 'Ancient wisdom. Master of all magical arts.',
    clan: 'Frost Clan',
    riskRating: 38,
    colorPalette: {
      primary: '#B3E5FC',
      secondary: '#81D4FA',
      accent: '#0277BD',
    },
  },
};

export function rollRandomStats(): {
  attack: number;
  defense: number;
  speed: number;
  intellect: number;
} {
  const getRandomStat = () => {
    return Math.floor(Math.random() * 50) + 25; // 25-75 range
  };

  return {
    attack: getRandomStat(),
    defense: getRandomStat(),
    speed: getRandomStat(),
    intellect: getRandomStat(),
  };
}

export function calculateRarity(stats: {
  attack: number;
  defense: number;
  speed: number;
  intellect: number;
}): PandaRarity {
  const total = stats.attack + stats.defense + stats.speed + stats.intellect;
  const average = total / 4;

  if (average >= 70) return 'legendary';
  if (average >= 60) return 'epic';
  if (average >= 45) return 'rare';
  return 'common';
}

export function getRarityColor(rarity: PandaRarity): string {
  const colors: Record<PandaRarity, string> = {
    common: '#808080',
    rare: '#4169E1',
    epic: '#9932CC',
    legendary: '#FFD700',
  };
  return colors[rarity];
}

export function getArchetypeByName(name: string): PandaArchetype | null {
  return PANDA_ARCHETYPES[name.toLowerCase().replace(/\s+/g, '_')] || null;
}

export function rollRandomArchetype(): PandaArchetype {
  const archetypes = Object.values(PANDA_ARCHETYPES);
  
  try {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return archetypes[buffer[0] % archetypes.length];
  } catch {
    // Fallback to Math.random if crypto is not available
    return archetypes[Math.floor(Math.random() * archetypes.length)];
  }
}

export function calculateStealChance(riskRating: number): number {
  // Higher risk rating = higher steal chance
  return Math.min(riskRating * 1.5, 100);
}
