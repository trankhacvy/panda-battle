export type PandaType = "bamboo" | "red" | "giant" | "snow";
export type PandaRarity = "common" | "rare" | "epic" | "legendary";

export interface PandaArchetype {
  name: string;
  type: PandaType;
  rarity: PandaRarity;
  baseStats: {
    strength: number;
    speed: number;
    endurance: number;
    luck: number;
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
    name: "Bamboo Warrior",
    type: "bamboo",
    rarity: "common",
    baseStats: { strength: 70, speed: 60, endurance: 75, luck: 50 },
    abilityText: "Focused strikes. High endurance, steady damage output.",
    clan: "Forest Clan",
    riskRating: 25,
    colorPalette: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#4CAF50",
    },
  },
  bamboo_striker: {
    name: "Bamboo Striker",
    type: "bamboo",
    rarity: "rare",
    baseStats: { strength: 85, speed: 75, endurance: 60, luck: 55 },
    abilityText: "Aggressive offense. Quick strikes with moderate endurance.",
    clan: "Forest Clan",
    riskRating: 45,
    colorPalette: {
      primary: "#1a1a1a",
      secondary: "#4CAF50",
      accent: "#81C784",
    },
  },
  bamboo_sage: {
    name: "Bamboo Sage",
    type: "bamboo",
    rarity: "epic",
    baseStats: { strength: 65, speed: 70, endurance: 70, luck: 85 },
    abilityText: "Tactical mind. High luck grants powerful techniques.",
    clan: "Forest Clan",
    riskRating: 35,
    colorPalette: {
      primary: "#000000",
      secondary: "#2196F3",
      accent: "#1976D2",
    },
  },
  red_fury: {
    name: "Red Fury",
    type: "red",
    rarity: "rare",
    baseStats: { strength: 88, speed: 82, endurance: 58, luck: 52 },
    abilityText: "Blazing speed. Lightning-fast attacks with high risk.",
    clan: "Crimson Clan",
    riskRating: 55,
    colorPalette: {
      primary: "#D32F2F",
      secondary: "#E53935",
      accent: "#FF6F00",
    },
  },
  red_guardian: {
    name: "Red Guardian",
    type: "red",
    rarity: "epic",
    baseStats: { strength: 75, speed: 65, endurance: 80, luck: 70 },
    abilityText: "Protective shield. Excellent endurance and balanced offense.",
    clan: "Crimson Clan",
    riskRating: 30,
    colorPalette: {
      primary: "#C62828",
      secondary: "#D32F2F",
      accent: "#FF6F00",
    },
  },
  red_mystic: {
    name: "Red Mystic",
    type: "red",
    rarity: "legendary",
    baseStats: { strength: 78, speed: 75, endurance: 68, luck: 92 },
    abilityText: "Arcane wisdom. Masters ancient panda techniques.",
    clan: "Crimson Clan",
    riskRating: 40,
    colorPalette: {
      primary: "#B71C1C",
      secondary: "#9C27B0",
      accent: "#CE93D8",
    },
  },
  giant_colossus: {
    name: "Giant Colossus",
    type: "giant",
    rarity: "epic",
    baseStats: { strength: 92, speed: 50, endurance: 85, luck: 48 },
    abilityText: "Immense strength. Devastating attacks with solid endurance.",
    clan: "Mountain Clan",
    riskRating: 50,
    colorPalette: {
      primary: "#8D6E63",
      secondary: "#795548",
      accent: "#D7CCC8",
    },
  },
  giant_stalwart: {
    name: "Giant Stalwart",
    type: "giant",
    rarity: "rare",
    baseStats: { strength: 78, speed: 55, endurance: 88, luck: 58 },
    abilityText: "Unyielding endurance. Nearly impenetrable wall.",
    clan: "Mountain Clan",
    riskRating: 20,
    colorPalette: {
      primary: "#795548",
      secondary: "#5D4037",
      accent: "#BCAAA4",
    },
  },
  snow_frostbite: {
    name: "Snow Frostbite",
    type: "snow",
    rarity: "rare",
    baseStats: { strength: 72, speed: 78, endurance: 70, luck: 80 },
    abilityText: "Icy precision. Balanced attacker with high luck.",
    clan: "Frost Clan",
    riskRating: 35,
    colorPalette: {
      primary: "#81C784",
      secondary: "#66BB6A",
      accent: "#2196F3",
    },
  },
  snow_blizzard: {
    name: "Snow Blizzard",
    type: "snow",
    rarity: "epic",
    baseStats: { strength: 80, speed: 85, endurance: 75, luck: 75 },
    abilityText: "Frozen vortex. Swift and devastating techniques.",
    clan: "Frost Clan",
    riskRating: 45,
    colorPalette: {
      primary: "#4DB8FF",
      secondary: "#81D4FA",
      accent: "#01579B",
    },
  },
  snow_sage: {
    name: "Snow Sage",
    type: "snow",
    rarity: "legendary",
    baseStats: { strength: 70, speed: 72, endurance: 75, luck: 95 },
    abilityText: "Ancient wisdom. Master of all magical arts.",
    clan: "Frost Clan",
    riskRating: 38,
    colorPalette: {
      primary: "#B3E5FC",
      secondary: "#81D4FA",
      accent: "#0277BD",
    },
  },
};

export function rollRandomStats(): {
  strength: number;
  speed: number;
  endurance: number;
  luck: number;
} {
  // Generate attributes according to design spec (Requirements 1.4)
  // Each attribute: 15-40 range, normalized to 100 total points
  const totalPoints = 100;
  const minPerAttribute = 15;
  const maxPerAttribute = 40;

  const randomInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Distribute points randomly with constraints
  const strength = randomInRange(minPerAttribute, maxPerAttribute);
  const speed = randomInRange(minPerAttribute, maxPerAttribute);
  const endurance = randomInRange(minPerAttribute, maxPerAttribute);
  const luck = randomInRange(minPerAttribute, maxPerAttribute);

  // Normalize to total points
  const sum = strength + speed + endurance + luck;
  const factor = totalPoints / sum;

  return {
    strength: Math.floor(strength * factor),
    speed: Math.floor(speed * factor),
    endurance: Math.floor(endurance * factor),
    luck: Math.floor(luck * factor),
  };
}

export function calculateRarity(stats: {
  strength: number;
  speed: number;
  endurance: number;
  luck: number;
}): PandaRarity {
  const total = stats.strength + stats.speed + stats.endurance + stats.luck;
  const average = total / 4;

  if (average >= 70) return "legendary";
  if (average >= 60) return "epic";
  if (average >= 45) return "rare";
  return "common";
}

export function getRarityColor(rarity: PandaRarity): string {
  const colors: Record<PandaRarity, string> = {
    common: "#808080",
    rare: "#4169E1",
    epic: "#9932CC",
    legendary: "#FFD700",
  };
  return colors[rarity];
}

export function getArchetypeByName(name: string): PandaArchetype | null {
  return PANDA_ARCHETYPES[name.toLowerCase().replace(/\s+/g, "_")] || null;
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
