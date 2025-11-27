export interface BattleEvent {
  id: string;
  type: 'attack' | 'defend' | 'damage' | 'heal' | 'stance_change' | 'victory' | 'defeat';
  actor: 'player' | 'opponent';
  description: string;
  damageDealt?: number;
  timestamp: number;
  icon?: string;
}

export interface OpponentPanda {
  id: string;
  name: string;
  type: 'bamboo' | 'red' | 'giant' | 'snow';
  power: number; // 1-100
  risk: number; // 1-10 (difficulty)
  favoriteStance: 'offensive' | 'defensive' | 'stealth';
  baseHP: number;
  attributes: {
    attack: number;
    defense: number;
    speed: number;
    intellect: number;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  lastMatch?: {
    opponentName: string;
    result: 'win' | 'loss' | 'draw';
    timestamp: string;
  };
}

export interface ReplayBattle {
  id: string;
  playerPanda: OpponentPanda;
  opponentPanda: OpponentPanda;
  events: BattleEvent[];
  duration: number; // in milliseconds
  winner: 'player' | 'opponent';
}

// Mock opponent roster
export const mockOpponents: OpponentPanda[] = [
  {
    id: 'opponent_1',
    name: 'Scarlet Strike',
    type: 'red',
    power: 45,
    risk: 3,
    favoriteStance: 'offensive',
    baseHP: 125,
    attributes: {
      attack: 78,
      defense: 52,
      speed: 75,
      intellect: 58,
    },
    colorPalette: {
      primary: '#D32F2F',
      secondary: '#E53935',
      accent: '#FF6F00',
    },
    lastMatch: {
      opponentName: 'Bamboo Champion',
      result: 'loss',
      timestamp: '2024-11-26T14:30:00Z',
    },
  },
  {
    id: 'opponent_2',
    name: 'Frostbite',
    type: 'snow',
    power: 52,
    risk: 4,
    favoriteStance: 'defensive',
    baseHP: 130,
    attributes: {
      attack: 65,
      defense: 72,
      speed: 62,
      intellect: 78,
    },
    colorPalette: {
      primary: '#81C784',
      secondary: '#66BB6A',
      accent: '#2196F3',
    },
    lastMatch: {
      opponentName: 'Red Fury',
      result: 'win',
      timestamp: '2024-11-27T08:15:00Z',
    },
  },
  {
    id: 'opponent_3',
    name: 'Shadow Dancer',
    type: 'bamboo',
    power: 58,
    risk: 5,
    favoriteStance: 'stealth',
    baseHP: 122,
    attributes: {
      attack: 72,
      defense: 68,
      speed: 85,
      intellect: 70,
    },
    colorPalette: {
      primary: '#1A1A1A',
      secondary: '#333333',
      accent: '#9C27B0',
    },
    lastMatch: {
      opponentName: 'Swift Striker',
      result: 'win',
      timestamp: '2024-11-27T09:45:00Z',
    },
  },
  {
    id: 'opponent_4',
    name: 'Gentle Giant',
    type: 'giant',
    power: 65,
    risk: 6,
    favoriteStance: 'defensive',
    baseHP: 140,
    attributes: {
      attack: 75,
      defense: 80,
      speed: 45,
      intellect: 65,
    },
    colorPalette: {
      primary: '#8D6E63',
      secondary: '#A1887F',
      accent: '#795548',
    },
    lastMatch: {
      opponentName: 'Scarlet Strike',
      result: 'win',
      timestamp: '2024-11-27T10:20:00Z',
    },
  },
  {
    id: 'opponent_5',
    name: 'Swift Striker',
    type: 'red',
    power: 72,
    risk: 7,
    favoriteStance: 'offensive',
    baseHP: 118,
    attributes: {
      attack: 85,
      defense: 58,
      speed: 88,
      intellect: 62,
    },
    colorPalette: {
      primary: '#C62828',
      secondary: '#E53935',
      accent: '#FF9800',
    },
    lastMatch: {
      opponentName: 'Shadow Dancer',
      result: 'loss',
      timestamp: '2024-11-27T09:45:00Z',
    },
  },
  {
    id: 'opponent_6',
    name: 'Mystic Sage',
    type: 'snow',
    power: 78,
    risk: 8,
    favoriteStance: 'stealth',
    baseHP: 128,
    attributes: {
      attack: 68,
      defense: 70,
      speed: 70,
      intellect: 90,
    },
    colorPalette: {
      primary: '#4DB8FF',
      secondary: '#66BB6A',
      accent: '#2196F3',
    },
    lastMatch: {
      opponentName: 'Gentle Giant',
      result: 'win',
      timestamp: '2024-11-27T11:00:00Z',
    },
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
      id: 'event_0',
      type: 'attack',
      actor: 'player',
      description: `${playerPanda.name} uses Quick Attack!`,
      damageDealt: 18,
      timestamp: 0,
      icon: '⚡',
    },
    {
      id: 'event_1',
      type: 'damage',
      actor: 'opponent',
      description: `${opponentPanda.name} takes 18 damage!`,
      damageDealt: 18,
      timestamp: 500,
      icon: '💥',
    },
    {
      id: 'event_2',
      type: 'defend',
      actor: 'opponent',
      description: `${opponentPanda.name} takes a defensive stance!`,
      timestamp: 1200,
      icon: '🛡️',
    },
    {
      id: 'event_3',
      type: 'attack',
      actor: 'opponent',
      description: `${opponentPanda.name} counterattacks!`,
      damageDealt: 12,
      timestamp: 2000,
      icon: '🥊',
    },
    {
      id: 'event_4',
      type: 'damage',
      actor: 'player',
      description: `${playerPanda.name} takes 12 damage!`,
      damageDealt: 12,
      timestamp: 2500,
      icon: '💢',
    },
    {
      id: 'event_5',
      type: 'attack',
      actor: 'player',
      description: `${playerPanda.name} uses Power Strike!`,
      damageDealt: 28,
      timestamp: 3200,
      icon: '💫',
    },
    {
      id: 'event_6',
      type: 'damage',
      actor: 'opponent',
      description: `${opponentPanda.name} takes 28 damage!`,
      damageDealt: 28,
      timestamp: 3800,
      icon: '💥',
    },
    {
      id: 'event_7',
      type: 'stance_change',
      actor: 'opponent',
      description: `${opponentPanda.name} switches to aggressive stance!`,
      timestamp: 4500,
      icon: '🔥',
    },
    {
      id: 'event_8',
      type: 'attack',
      actor: 'opponent',
      description: `${opponentPanda.name} launches ultimate attack!`,
      damageDealt: 35,
      timestamp: 5300,
      icon: '⚔️',
    },
    {
      id: 'event_9',
      type: 'damage',
      actor: 'player',
      description: `${playerPanda.name} takes 35 damage!`,
      damageDealt: 35,
      timestamp: 5900,
      icon: '💢',
    },
    {
      id: 'event_10',
      type: playerWins ? 'victory' : 'defeat',
      actor: playerWins ? 'player' : 'opponent',
      description: playerWins
        ? `${playerPanda.name} is victorious!`
        : `${opponentPanda.name} wins the battle!`,
      timestamp: 7000,
      icon: playerWins ? '🏆' : '💀',
    },
  ];

  return {
    id: `battle_${Date.now()}`,
    playerPanda,
    opponentPanda,
    events,
    duration: 7000,
    winner: playerWins ? 'player' : 'opponent',
  };
};
