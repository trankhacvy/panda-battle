# Mock Data & API Schema
## Bamboo Panda Battles MVP

---

## 1. Core Data Structures

### 1.1 User / Player Object

```typescript
interface User {
  id: string; // UUID v4
  name: string; // 1-20 alphanumeric + spaces
  email?: string; // Optional for MVP
  avatar: string; // URL or data URI
  level: number; // Calculated: floor(totalWins / 5) + 1, range 1-20
  totalWins: number; // Incremented per battle win
  totalLosses: number; // Incremented per battle loss
  rating: number; // Elo-style: 1000-3000, starts at 1200
  joinedDate: string; // ISO 8601 timestamp
  lastActiveAt: string; // ISO 8601 timestamp
  currentPandaId?: string; // ID of active panda for next battle
  profile?: {
    bio?: string; // 0-160 characters
    region?: string; // Optional region tag
    favoriteType?: 'bamboo' | 'red' | 'giant' | 'snow';
  };
}
```

**Example User:**
```json
{
  "id": "user_550e8400-e29b-41d4-a716-446655440000",
  "name": "Panda Master",
  "avatar": "https://api.example.com/avatars/user_550e.png",
  "level": 8,
  "totalWins": 89,
  "totalLosses": 42,
  "rating": 1850,
  "joinedDate": "2024-10-15T08:30:00Z",
  "lastActiveAt": "2024-11-27T10:45:00Z",
  "currentPandaId": "panda_660e8400-e29b-41d4-a716-446655440001",
  "profile": {
    "bio": "Competitive panda enthusiast 🎮",
    "region": "North America",
    "favoriteType": "bamboo"
  }
}
```

---

### 1.2 Panda Object

```typescript
interface Panda {
  id: string; // UUID v4
  userId: string; // Reference to User
  name: string; // 1-20 alphanumeric + spaces
  type: 'bamboo' | 'red' | 'giant' | 'snow';
  colorPalette: {
    primary: string; // Hex color (#000000)
    secondary: string; // Hex color
    accent: string; // Hex color
  };
  attributes: {
    attack: number; // 1-100, affects damage output
    defense: number; // 1-100, affects damage reduction
    speed: number; // 1-100, affects turn order
    intellect: number; // 1-100, affects special move power
  };
  baseHP: number; // 100-150, start value
  level: number; // 1-20, incremented on wins
  totalWins: number; // Panda-specific wins
  totalLosses: number; // Panda-specific losses
  createdAt: string; // ISO 8601 timestamp
  imageURL?: string; // Generated SVG or image URL
  stats?: {
    highestHP: number; // Peak HP reached in battle
    totalDamageDealt: number; // Cumulative damage
    totalDamageTaken: number; // Cumulative damage taken
    favoriteMove?: string; // Most-used move type
  };
}
```

**Calculation Rules:**
- `level = floor(totalWins / 5) + 1`, capped at 20
- `baseHP = 100 + (attack * 0.2) + (defense * 0.3)`
- Current battle HP starts at `baseHP`, range: 100-150

**Example Panda:**
```json
{
  "id": "panda_660e8400-e29b-41d4-a716-446655440001",
  "userId": "user_550e8400-e29b-41d4-a716-446655440000",
  "name": "Bamboo Champion",
  "type": "bamboo",
  "colorPalette": {
    "primary": "#000000",
    "secondary": "#333333",
    "accent": "#4CAF50"
  },
  "attributes": {
    "attack": 72,
    "defense": 65,
    "speed": 80,
    "intellect": 55
  },
  "baseHP": 128,
  "level": 9,
  "totalWins": 45,
  "totalLosses": 18,
  "createdAt": "2024-10-20T14:22:00Z",
  "imageURL": "https://api.example.com/pandas/panda_660e.svg",
  "stats": {
    "highestHP": 128,
    "totalDamageDealt": 1245,
    "totalDamageTaken": 890,
    "favoriteMove": "attack"
  }
}
```

---

### 1.3 Move Object

```typescript
interface Move {
  id: string; // 'attack', 'defend', 'technique', 'special'
  type: 'attack' | 'defend' | 'technique' | 'special';
  name: string; // "Attack", "Defend", "Bamboo Strike", "Ultimate Combo"
  description: string; // "Deal damage to opponent"
  baseDamage?: number; // For damage moves
  defenseMultiplier?: number; // For defense moves (0.5 = 50% reduction)
  cooldown: number; // Turns before reusable (0 = always available)
  requiresAttribute?: keyof Panda['attributes']; // Which attr affects power
  power: number; // 0-100, affects damage/defense calculation
}
```

**Default Moves (4 per panda):**
```json
[
  {
    "id": "attack",
    "type": "attack",
    "name": "Attack",
    "description": "Deal direct damage based on Attack attribute",
    "baseDamage": 20,
    "cooldown": 0,
    "requiresAttribute": "attack",
    "power": 25
  },
  {
    "id": "defend",
    "type": "defend",
    "name": "Defend",
    "description": "Reduce next turn's incoming damage by 50%",
    "defenseMultiplier": 0.5,
    "cooldown": 0,
    "requiresAttribute": "defense",
    "power": 60
  },
  {
    "id": "technique",
    "type": "technique",
    "name": "Technique",
    "description": "Medium damage attack with speed bonus",
    "baseDamage": 30,
    "cooldown": 0,
    "requiresAttribute": "speed",
    "power": 40
  },
  {
    "id": "special",
    "type": "special",
    "name": "Special",
    "description": "High damage attack, 2-turn cooldown",
    "baseDamage": 50,
    "cooldown": 2,
    "requiresAttribute": "intellect",
    "power": 80
  }
]
```

---

### 1.4 Battle Object

```typescript
interface Battle {
  id: string; // UUID v4
  playerPandaId: string; // User's panda
  opponentPandaId: string; // AI opponent panda
  playerUserId: string; // Reference to User
  status: 'in-progress' | 'completed';
  turns: Turn[];
  winner: 'player' | 'opponent' | null;
  startedAt: string; // ISO 8601 timestamp
  endedAt?: string; // ISO 8601 timestamp
  reward?: {
    experience: number; // 0-50 EXP
    ratingDelta: number; // -50 to +50 Elo points
    message?: string; // "Excellent victory!" or "Close match"
  };
  battleLog?: string; // Markdown summary
}
```

**Example Battle (In Progress):**
```json
{
  "id": "battle_770e8400-e29b-41d4-a716-446655440002",
  "playerPandaId": "panda_660e8400-e29b-41d4-a716-446655440001",
  "opponentPandaId": "panda_880e8400-e29b-41d4-a716-446655440003",
  "playerUserId": "user_550e8400-e29b-41d4-a716-446655440000",
  "status": "in-progress",
  "turns": [],
  "winner": null,
  "startedAt": "2024-11-27T10:45:00Z",
  "battleLog": ""
}
```

---

### 1.5 Turn Object

```typescript
interface Turn {
  turnNumber: number; // 1, 2, 3, ...
  playerAction: Move; // Move object or action details
  opponentAction: Move; // AI opponent's move
  playerDamage: number; // Damage dealt to opponent
  opponentDamage: number; // Damage taken from opponent
  playerHP: number; // Player panda HP after turn
  opponentHP: number; // Opponent panda HP after turn
  effectsApplied: string[]; // ["defend_active", "critical_hit", etc.]
  timestamp: string; // ISO 8601
}
```

**Damage Calculation Formula:**
```
baseDamage = move.baseDamage || 20
attributeBonus = (panda.attributes[move.requiresAttribute] / 100) * 0.5
variance = random(-10%, +10%)
totalDamage = floor((baseDamage + attributeBonus) * (1 + variance))

// If opponent defending:
totalDamage = floor(totalDamage * 0.5)
```

**Example Turn:**
```json
{
  "turnNumber": 1,
  "playerAction": {
    "id": "attack",
    "type": "attack",
    "name": "Attack",
    "baseDamage": 20,
    "requiresAttribute": "attack"
  },
  "opponentAction": {
    "id": "defend",
    "type": "defend",
    "name": "Defend",
    "defenseMultiplier": 0.5
  },
  "playerDamage": 15,
  "opponentDamage": 0,
  "playerHP": 128,
  "opponentHP": 85,
  "effectsApplied": ["attack_landed", "defend_active"],
  "timestamp": "2024-11-27T10:45:15Z"
}
```

---

### 1.6 Leaderboard Entry Object

```typescript
interface LeaderboardEntry {
  rank: number; // 1-100
  userId: string; // Reference to User
  playerName: string; // Display name
  avatar: string; // User's avatar URL
  level: number; // User's level
  totalWins: number; // Lifetime wins
  totalLosses?: number; // Lifetime losses
  winRate: number; // Percentage (0-100)
  rating: number; // Elo rating
  recentActivity: string; // ISO 8601 timestamp of last battle
  trending?: number; // Rating change in last 24h
  badge?: string; // "🏆" for top 10, "⭐" for top 50
}
```

**Example Leaderboard Entry:**
```json
{
  "rank": 1,
  "userId": "user_990e8400-e29b-41d4-a716-446655440010",
  "playerName": "🏆 Panda Pro",
  "avatar": "https://api.example.com/avatars/user_990e.png",
  "level": 15,
  "totalWins": 245,
  "totalLosses": 68,
  "winRate": 78.27,
  "rating": 2850,
  "recentActivity": "2024-11-27T09:15:00Z",
  "trending": 35,
  "badge": "🏆"
}
```

---

## 2. Mock Data Files (JSON)

### 2.1 Directory Structure
```
/public/mock-data/
├── users.json             # Array of 200+ User objects
├── pandas.json            # Array of 500+ Panda objects
├── leaderboard.json       # Array of 100 LeaderboardEntry
├── moves.json             # Move definitions
├── ai-opponents.json      # AI panda configs
└── battle-results.json    # Sample completed battles (optional)
```

### 2.2 Sample users.json (First 3 entries)
```json
[
  {
    "id": "user_550e8400-e29b-41d4-a716-446655440000",
    "name": "Panda Master",
    "avatar": "https://api.example.com/avatars/user_550e.png",
    "level": 8,
    "totalWins": 89,
    "totalLosses": 42,
    "rating": 1850,
    "joinedDate": "2024-10-15T08:30:00Z",
    "lastActiveAt": "2024-11-27T10:45:00Z",
    "currentPandaId": "panda_660e8400-e29b-41d4-a716-446655440001",
    "profile": {
      "bio": "Competitive panda enthusiast 🎮",
      "region": "North America",
      "favoriteType": "bamboo"
    }
  },
  {
    "id": "user_660e8400-e29b-41d4-a716-446655440001",
    "name": "Red Fury",
    "avatar": "https://api.example.com/avatars/user_660e.png",
    "level": 6,
    "totalWins": 64,
    "totalLosses": 35,
    "rating": 1620,
    "joinedDate": "2024-10-22T14:10:00Z",
    "lastActiveAt": "2024-11-26T16:20:00Z",
    "currentPandaId": "panda_770e8400-e29b-41d4-a716-446655440002",
    "profile": {
      "bio": "Love red pandas!",
      "region": "Europe"
    }
  },
  {
    "id": "user_770e8400-e29b-41d4-a716-446655440002",
    "name": "Snow Walker",
    "avatar": "https://api.example.com/avatars/user_770e.png",
    "level": 5,
    "totalWins": 45,
    "totalLosses": 28,
    "rating": 1480,
    "joinedDate": "2024-11-01T09:00:00Z",
    "lastActiveAt": "2024-11-27T07:30:00Z",
    "currentPandaId": "panda_880e8400-e29b-41d4-a716-446655440003"
  }
]
```

### 2.3 Sample pandas.json (First 3 entries)
```json
[
  {
    "id": "panda_660e8400-e29b-41d4-a716-446655440001",
    "userId": "user_550e8400-e29b-41d4-a716-446655440000",
    "name": "Bamboo Champion",
    "type": "bamboo",
    "colorPalette": {
      "primary": "#000000",
      "secondary": "#333333",
      "accent": "#4CAF50"
    },
    "attributes": {
      "attack": 72,
      "defense": 65,
      "speed": 80,
      "intellect": 55
    },
    "baseHP": 128,
    "level": 9,
    "totalWins": 45,
    "totalLosses": 18,
    "createdAt": "2024-10-20T14:22:00Z",
    "imageURL": "https://api.example.com/pandas/panda_660e.svg",
    "stats": {
      "highestHP": 128,
      "totalDamageDealt": 1245,
      "totalDamageTaken": 890,
      "favoriteMove": "attack"
    }
  },
  {
    "id": "panda_770e8400-e29b-41d4-a716-446655440002",
    "userId": "user_660e8400-e29b-41d4-a716-446655440001",
    "name": "Scarlet Strike",
    "type": "red",
    "colorPalette": {
      "primary": "#D32F2F",
      "secondary": "#E53935",
      "accent": "#FF6F00"
    },
    "attributes": {
      "attack": 80,
      "defense": 55,
      "speed": 75,
      "intellect": 60
    },
    "baseHP": 125,
    "level": 7,
    "totalWins": 32,
    "totalLosses": 14,
    "createdAt": "2024-10-25T10:15:00Z"
  },
  {
    "id": "panda_880e8400-e29b-41d4-a716-446655440003",
    "userId": "user_770e8400-e29b-41d4-a716-446655440002",
    "name": "Frostbite",
    "type": "snow",
    "colorPalette": {
      "primary": "#81C784",
      "secondary": "#66BB6A",
      "accent": "#2196F3"
    },
    "attributes": {
      "attack": 68,
      "defense": 70,
      "speed": 65,
      "intellect": 75
    },
    "baseHP": 130,
    "level": 6,
    "totalWins": 28,
    "totalLosses": 12,
    "createdAt": "2024-11-05T11:45:00Z"
  }
]
```

### 2.4 Sample leaderboard.json (First 5 entries)
```json
[
  {
    "rank": 1,
    "userId": "user_990e8400-e29b-41d4-a716-446655440010",
    "playerName": "🏆 Panda Pro",
    "avatar": "https://api.example.com/avatars/user_990e.png",
    "level": 15,
    "totalWins": 245,
    "totalLosses": 68,
    "winRate": 78.27,
    "rating": 2850,
    "recentActivity": "2024-11-27T09:15:00Z",
    "trending": 35,
    "badge": "🏆"
  },
  {
    "rank": 2,
    "userId": "user_aa0e8400-e29b-41d4-a716-446655440011",
    "playerName": "Battle King",
    "avatar": "https://api.example.com/avatars/user_aa0e.png",
    "level": 14,
    "totalWins": 212,
    "totalLosses": 66,
    "winRate": 76.26,
    "rating": 2790,
    "recentActivity": "2024-11-27T08:45:00Z",
    "trending": 25,
    "badge": "🏆"
  },
  {
    "rank": 3,
    "userId": "user_bb0e8400-e29b-41d4-a716-446655440012",
    "playerName": "Red Fury",
    "avatar": "https://api.example.com/avatars/user_bb0e.png",
    "level": 13,
    "totalWins": 198,
    "totalLosses": 72,
    "winRate": 73.33,
    "rating": 2750,
    "recentActivity": "2024-11-27T11:20:00Z",
    "trending": 40,
    "badge": "🏆"
  },
  {
    "rank": 4,
    "userId": "user_cc0e8400-e29b-41d4-a716-446655440013",
    "playerName": "⭐ Snow Master",
    "avatar": "https://api.example.com/avatars/user_cc0e.png",
    "level": 12,
    "totalWins": 178,
    "totalLosses": 65,
    "winRate": 73.22,
    "rating": 2680,
    "recentActivity": "2024-11-27T10:05:00Z",
    "trending": -15,
    "badge": "⭐"
  },
  {
    "rank": 5,
    "userId": "user_dd0e8400-e29b-41d4-a716-446655440014",
    "playerName": "Giant Slayer",
    "avatar": "https://api.example.com/avatars/user_dd0e.png",
    "level": 11,
    "totalWins": 156,
    "totalLosses": 58,
    "winRate": 72.90,
    "rating": 2620,
    "recentActivity": "2024-11-27T09:30:00Z",
    "trending": 10,
    "badge": "⭐"
  }
]
```

### 2.5 Sample moves.json
```json
[
  {
    "id": "attack",
    "type": "attack",
    "name": "Attack",
    "description": "Deal direct damage based on Attack attribute",
    "baseDamage": 20,
    "cooldown": 0,
    "requiresAttribute": "attack",
    "power": 25
  },
  {
    "id": "defend",
    "type": "defend",
    "name": "Defend",
    "description": "Reduce next turn's incoming damage by 50%",
    "defenseMultiplier": 0.5,
    "cooldown": 0,
    "requiresAttribute": "defense",
    "power": 60
  },
  {
    "id": "technique",
    "type": "technique",
    "name": "Technique",
    "description": "Medium damage attack with speed bonus",
    "baseDamage": 30,
    "cooldown": 0,
    "requiresAttribute": "speed",
    "power": 40
  },
  {
    "id": "special",
    "type": "special",
    "name": "Special",
    "description": "High damage attack, 2-turn cooldown",
    "baseDamage": 50,
    "cooldown": 2,
    "requiresAttribute": "intellect",
    "power": 80
  }
]
```

### 2.6 Sample ai-opponents.json
```json
[
  {
    "id": "ai_bamboo_easy",
    "name": "Bamboo Beginner",
    "type": "bamboo",
    "difficulty": "easy",
    "attributes": {
      "attack": 45,
      "defense": 40,
      "speed": 50,
      "intellect": 35
    },
    "aiStrategy": "random"
  },
  {
    "id": "ai_red_medium",
    "name": "Red Challenger",
    "type": "red",
    "difficulty": "medium",
    "attributes": {
      "attack": 60,
      "defense": 55,
      "speed": 65,
      "intellect": 50
    },
    "aiStrategy": "balanced"
  },
  {
    "id": "ai_giant_hard",
    "name": "Giant Guardian",
    "type": "giant",
    "difficulty": "hard",
    "attributes": {
      "attack": 75,
      "defense": 80,
      "speed": 55,
      "intellect": 65
    },
    "aiStrategy": "defensive"
  },
  {
    "id": "ai_snow_expert",
    "name": "Snow Phantom",
    "type": "snow",
    "difficulty": "expert",
    "attributes": {
      "attack": 70,
      "defense": 70,
      "speed": 85,
      "intellect": 80
    },
    "aiStrategy": "aggressive"
  }
]
```

---

## 3. Mock API Response Examples

### 3.1 Initialize Game / Get Current User
```
GET /api/user/me
Response:
{
  "success": true,
  "data": {
    "id": "user_550e8400-e29b-41d4-a716-446655440000",
    "name": "Panda Master",
    ...
  },
  "timestamp": "2024-11-27T10:45:00Z"
}
```

### 3.2 Fetch Leaderboard
```
GET /api/leaderboard?page=1&limit=100
Response:
{
  "success": true,
  "data": [
    { "rank": 1, "playerName": "🏆 Panda Pro", ... },
    { "rank": 2, "playerName": "Battle King", ... },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5000
  },
  "timestamp": "2024-11-27T10:45:00Z"
}
```

### 3.3 Initiate Battle
```
POST /api/battle/initiate
Request:
{
  "playerPandaId": "panda_660e8400-e29b-41d4-a716-446655440001",
  "difficulty": "medium"
}

Response:
{
  "success": true,
  "data": {
    "battleId": "battle_770e8400-e29b-41d4-a716-446655440002",
    "playerPanda": { ... },
    "opponentPanda": { ... },
    "status": "in-progress"
  },
  "timestamp": "2024-11-27T10:45:00Z"
}
```

### 3.4 Submit Battle Turn
```
POST /api/battle/{battleId}/turn
Request:
{
  "moveId": "attack"
}

Response (Simulated 100-500ms delay):
{
  "success": true,
  "data": {
    "turn": {
      "turnNumber": 1,
      "playerAction": { "id": "attack", ... },
      "opponentAction": { "id": "defend", ... },
      "playerDamage": 15,
      "opponentDamage": 0,
      "playerHP": 128,
      "opponentHP": 85,
      "effectsApplied": ["attack_landed", "defend_active"]
    },
    "battleStatus": "in-progress",
    "winner": null
  },
  "timestamp": "2024-11-27T10:45:15Z"
}
```

### 3.5 Complete Battle (Victory)
```
GET /api/battle/{battleId}/result
Response:
{
  "success": true,
  "data": {
    "battleId": "battle_770e8400-e29b-41d4-a716-446655440002",
    "winner": "player",
    "turns": [
      { "turnNumber": 1, ... },
      { "turnNumber": 2, ... },
      { "turnNumber": 3, ... }
    ],
    "reward": {
      "experience": 45,
      "ratingDelta": 25,
      "message": "Excellent victory! You dominated this match."
    }
  },
  "timestamp": "2024-11-27T10:46:00Z"
}
```

---

## 4. Data Validation Rules

### 4.1 User
- `name`: 1-20 characters, alphanumeric + spaces only
- `rating`: 1000-3000 (Elo range)
- `level`: 1-20 (calculated, not editable)
- `totalWins`: >= 0
- `totalLosses`: >= 0

### 4.2 Panda
- `name`: 1-20 characters, alphanumeric + spaces only
- `type`: one of ['bamboo', 'red', 'giant', 'snow']
- `attributes`: each 1-100
- `baseHP`: 100-150
- Color palette: valid hex colors (#RRGGBB format)

### 4.3 Battle / Turn
- `playerDamage`: >= 0
- `opponentDamage`: >= 0
- `playerHP`: >= 0 (capped at baseHP)
- `opponentHP`: >= 0 (capped at baseHP)
- Battle ends when either HP <= 0

---

## 5. Mock Data Generation & Persistence

### 5.1 Initial Setup
```typescript
// lib/api/mockDataLoader.ts
export async function loadMockData() {
  const users = await fetch('/mock-data/users.json').then(r => r.json());
  const pandas = await fetch('/mock-data/pandas.json').then(r => r.json());
  const leaderboard = await fetch('/mock-data/leaderboard.json').then(r => r.json());
  const moves = await fetch('/mock-data/moves.json').then(r => r.json());
  const aiOpponents = await fetch('/mock-data/ai-opponents.json').then(r => r.json());
  
  // Cache in memory
  mockDataCache = { users, pandas, leaderboard, moves, aiOpponents };
}
```

### 5.2 Session Persistence
```typescript
// User-generated data (new panda, battle results) stored in:
// - React Context (in-memory, for this session)
// - localStorage (survives page refresh, single browser)
// Post-MVP: Move to backend database

const saveGameState = (state: GameState) => {
  localStorage.setItem('bamboo_panda_gamestate', JSON.stringify(state));
};

const loadGameState = (): GameState => {
  const saved = localStorage.getItem('bamboo_panda_gamestate');
  return saved ? JSON.parse(saved) : initialGameState;
};
```

---

## 6. Appendix: TypeScript Interfaces

All interfaces defined in `/lib/types/index.ts`:

```typescript
export interface User { ... }
export interface Panda { ... }
export interface Move { ... }
export interface Battle { ... }
export interface Turn { ... }
export interface LeaderboardEntry { ... }
export interface GameState { ... }
export interface GameAPI { ... }
```

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Active
