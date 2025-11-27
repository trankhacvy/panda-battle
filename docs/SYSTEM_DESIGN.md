# System Design Document
## Bamboo Panda Battles MVP (UI Phase)

---

## 1. Architecture Overview

### 1.1 Technology Stack
| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Framework** | Next.js | 15 | App Router, built-in optimizations, SSR/SSG support |
| **Runtime** | React | 19 | Latest features, Server Components, concurrent rendering |
| **Language** | TypeScript | 5.9+ | Type safety, better DX, scalability |
| **Styling** | Tailwind CSS | 4 (@tailwindcss/postcss) | Utility-first, CSS variables for theming |
| **Component Library** | shadcn/ui | Latest | Composable, accessible, customizable components |
| **Icons** | Lucide React | 0.555+ | Modern SVG icons, tree-shakeable |
| **Build Tool** | Turbopack | Integrated | Fast bundling, local dev server |
| **Package Manager** | pnpm | Latest | Efficient, monorepo-ready |

### 1.2 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 15 App Router                   │
├─────────────────────────────────────────────────────────────┤
│                  React Server Components                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Home Screen  │  │ Panda Gen    │  │ Battle Arena │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Leaderboard  │  │ User Profile │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              Shared Components (shadcn/ui)                 │
│        Buttons, Cards, Inputs, Dialogs, etc.               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Game State   │  │ Mock API     │  │ Local Store  │     │
│  │ (React)      │  │ (JSON)       │  │ (localStorage)      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│         Styling: Tailwind CSS v4 with CSS Variables        │
│         Theme: Light/Dark mode with global tokens          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. State Management Architecture

### 2.1 State Scope & Persistence
```typescript
// Global Application State
GameState {
  user: UserState
  currentPanda: PandaState
  battle: BattleState
  leaderboard: LeaderboardState
  ui: UIState
}

// Persistence Layers:
// - Session: React Context + useState (temporary)
// - Local: localStorage (survives page refresh)
// - Server: Mock API JSON (read-only for MVP)
```

### 2.2 State Management Pattern
We use a **React Context + Hooks** pattern (no external state library for MVP simplicity):

```typescript
// /app/(context)/GameProvider.tsx
export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(initialGameState);
  
  const updateGameState = (updates) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
    // Auto-persist to localStorage
    localStorage.setItem('gameState', JSON.stringify(gameState));
  };
  
  return (
    <GameContext.Provider value={{ gameState, updateGameState }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
```

### 2.3 Component State Hierarchy
```
RootLayout
├── GameProvider (Global state)
│   ├── Header (Global nav, theme toggle)
│   ├── Page (Route-specific)
│   │   ├── HomeScreen
│   │   │   └── Local state: activeTab
│   │   ├── PandaGeneratorScreen
│   │   │   └── Local state: formValues, preview
│   │   ├── BattleArenaScreen
│   │   │   ├── Global: currentBattle
│   │   │   └── Local state: selectedMove, turnHistory
│   │   ├── LeaderboardScreen
│   │   │   └── Local state: filters, search query
│   │   └── ProfileScreen
│   │       └── Local state: editMode
│   └── Footer
```

---

## 3. Data Flow & Models

### 3.1 Core Data Models

#### User/Player
```typescript
interface User {
  id: string; // UUID
  name: string;
  avatar: string; // URL or emoji
  level: number; // Derived from total wins
  totalWins: number;
  totalLosses: number;
  rating: number; // Elo-style: 1000-3000
  joinedDate: string; // ISO timestamp
  currentPandaId?: string; // Active panda
  profile?: {
    bio?: string;
    region?: string;
    favoriteType?: string;
  };
}
```

#### Panda
```typescript
interface Panda {
  id: string; // UUID
  userId: string;
  name: string;
  type: 'bamboo' | 'red' | 'giant' | 'snow';
  colorPalette: {
    primary: string; // hex color
    secondary: string;
    accent: string;
  };
  attributes: {
    attack: number; // 1-100
    defense: number;
    speed: number;
    intellect: number;
  };
  baseHP: number; // 100-150
  level: number; // Incremented per win
  totalWins: number;
  totalLosses: number;
  createdAt: string; // ISO timestamp
  imageURL?: string; // Generated avatar
}
```

#### Battle
```typescript
interface Battle {
  id: string; // UUID
  playerPandaId: string;
  opponentPandaId: string;
  status: 'in-progress' | 'completed';
  turns: Turn[];
  winner: 'player' | 'opponent' | null;
  endedAt?: string;
  reward?: {
    experience: number;
    ratingDelta: number;
  };
}

interface Turn {
  turnNumber: number;
  playerAction: Move;
  opponentAction: Move;
  playerDamage: number;
  opponentDamage: number;
  playerHP: number;
  opponentHP: number;
  timestamp: string;
}

interface Move {
  type: 'attack' | 'defend' | 'technique' | 'special';
  name: string;
  damage?: number;
  defense?: number;
  cooldownRemaining?: number;
}
```

#### Leaderboard Entry
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  playerName: string;
  avatar: string;
  level: number;
  totalWins: number;
  winRate: number; // percentage
  rating: number;
  recentActivity: string; // ISO timestamp
}
```

### 3.2 Mock API Structure

#### Mock Data Source (JSON)
```
/public/mock-data/
├── users.json (array of 200+ User objects)
├── pandas.json (array of 500+ Panda objects)
├── leaderboard.json (array of 100 LeaderboardEntry)
├── moves.json (library of all moves with damage formulas)
├── ai-opponents.json (AI panda configs for battles)
└── battle-results.json (sample completed battles)
```

#### API Service Layer
```typescript
// /lib/api/mockAPI.ts
export const mockAPI = {
  // User
  getUser(userId: string): Promise<User>
  createUser(data: Partial<User>): Promise<User>
  updateUser(userId: string, data: Partial<User>): Promise<User>
  
  // Panda
  getPanda(pandaId: string): Promise<Panda>
  getUserPandas(userId: string): Promise<Panda[]>
  createPanda(data: Partial<Panda>): Promise<Panda>
  
  // Battle
  initiateAIBattle(playerPandaId: string): Promise<Battle>
  submitBattleAction(battleId: string, move: Move): Promise<Turn>
  completeBattle(battleId: string): Promise<Battle>
  getBattleHistory(userId: string, limit?: number): Promise<Battle[]>
  
  // Leaderboard
  getLeaderboard(page?: number): Promise<LeaderboardEntry[]>
  getPlayerRank(userId: string): Promise<LeaderboardEntry>
  searchLeaderboard(query: string): Promise<LeaderboardEntry[]>
};
```

### 3.3 Data Flow Example: Battle Turn Resolution
```
User selects Move
    ↓
onMoveSelect() dispatches to GameContext
    ↓
mockAPI.submitBattleAction(battleId, move)
    ↓
Simulated delay (100-500ms)
    ↓
Calculate opponent counter-move (AI logic)
    ↓
Apply damage/effects to both pandas
    ↓
Return Turn result with new HP values
    ↓
Update BattleState in GameContext
    ↓
Component re-renders with new turn
    ↓
Check if battle is over (HP <= 0)
    ↓
If over: calculateRewards() → updateLeaderboard()
    ↓
Display battle result screen
```

---

## 4. Component Architecture

### 4.1 Component Directory Structure
```
/app
├── layout.tsx                 # RootLayout
├── page.tsx                   # Home screen
├── (context)/
│   ├── GameProvider.tsx       # Global state context
│   └── layout.tsx             # Wraps pages with GameProvider
├── (screens)/
│   ├── home/page.tsx
│   ├── panda-generator/page.tsx
│   ├── battle-arena/page.tsx
│   ├── leaderboard/page.tsx
│   └── profile/page.tsx
├── globals.css               # Global Tailwind styles
└── favicon.ico

/components
├── ui/                        # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── tabs.tsx
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── select.tsx
│   └── ... (more shadcn components as needed)
├── panda/
│   ├── PandaCard.tsx         # Display panda stats
│   ├── PandaPreview.tsx      # Visual preview during generation
│   ├── PandaGenerator.tsx    # Full generation form
│   └── PandaSelector.tsx     # Choose active panda
├── battle/
│   ├── BattleArena.tsx       # Main battle UI
│   ├── BattleStats.tsx       # Both pandas' status
│   ├── MoveSelector.tsx      # 4 move buttons
│   ├── BattleLog.tsx         # Turn-by-turn log
│   ├── BattleReplay.tsx      # Replay animation
│   └── BattleResult.tsx      # Win/loss screen
├── leaderboard/
│   ├── LeaderboardTable.tsx  # Top 100 table
│   ├── LeaderboardFilters.tsx
│   ├── PlayerRankCard.tsx    # Your current rank
│   └── LeaderboardSearch.tsx
├── profile/
│   ├── ProfileHeader.tsx     # User info, avatar
│   ├── ProfileStats.tsx      # Win/loss stats
│   ├── BattleHistory.tsx     # Recent battles list
│   ├── PandaCollection.tsx   # User's pandas
│   └── ProfileEditModal.tsx
├── layout/
│   ├── Header.tsx            # Top navigation
│   ├── Footer.tsx
│   ├── Navigation.tsx        # Mobile/desktop nav
│   └── ThemeSwitcher.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── NotFound.tsx
    └── Skeleton.tsx

/lib
├── api/
│   ├── mockAPI.ts            # API service layer
│   └── mock-data-loader.ts   # Load JSON mock data
├── hooks/
│   ├── useGame.ts            # Access GameContext
│   ├── useBattle.ts          # Battle-specific logic
│   ├── usePanda.ts           # Panda generation logic
│   └── useLeaderboard.ts     # Leaderboard queries
├── utils/
│   ├── cn.ts                 # className utility
│   ├── calculations.ts       # Battle damage formulas
│   ├── validators.ts         # Input validation
│   └── formatters.ts         # Date/number formatting
├── constants/
│   ├── moves.ts              # Move definitions
│   ├── pandaTypes.ts         # Panda type configs
│   └── gameConfig.ts         # Game balance settings
├── types/
│   └── index.ts              # All TypeScript interfaces
└── utils.ts                  # Basic utilities

/public
├── mock-data/                # JSON mock data files
│   ├── users.json
│   ├── pandas.json
│   ├── leaderboard.json
│   ├── moves.json
│   └── ai-opponents.json
├── images/
│   ├── logo.svg
│   ├── panda-types/          # Panda type illustrations
│   └── icons/
└── favicon.ico
```

### 4.2 Component Responsibilities

#### Screen Components (Pages)
- Compose layout with Header, main content, and Footer
- Fetch route-specific data
- Handle route-level state and navigation
- Delegate to feature-specific sub-components

#### Feature Components (Panda, Battle, Leaderboard)
- Manage feature-level state (if complex)
- Compose sub-components (Cards, Forms, Tables)
- Handle user interactions (clicks, form submissions)
- Call API/mock services and update global context

#### Shared UI Components (shadcn)
- Reusable, unstyled building blocks
- Consistent design language via Tailwind
- Accessibility built-in
- No business logic

---

## 5. Styling & Theme System

### 5.1 Tailwind CSS v4 Configuration
```typescript
// tailwind.config.ts
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        secondary: 'hsl(var(--color-secondary) / <alpha-value>)',
        
        // Game-specific colors
        panda: {
          bamboo: '#000000',
          red: '#D32F2F',
          giant: '#8D6E63',
          snow: '#F5F5F5',
        },
      },
      animation: {
        'battle-hit': 'battleHit 0.3s ease-out',
        'battle-heal': 'battleHeal 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        battleHit: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '50%': { transform: 'translateX(-10px)', opacity: '0.8' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // ... more keyframes
      },
    },
  },
  plugins: [],
};
```

### 5.2 CSS Variables (Light/Dark Theme)
```css
/* app/globals.css */
@layer base {
  :root {
    --color-primary: 0 0% 100%; /* Light mode */
    --color-secondary: 200 14% 97%;
    --text-primary: 0 0% 0%;
    --text-secondary: 0 0% 40%;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-primary: 0 0% 9%; /* Dark mode */
      --color-secondary: 200 14% 15%;
      --text-primary: 0 0% 100%;
      --text-secondary: 0 0% 60%;
    }
  }

  /* Panda-specific CSS variables */
  :root {
    --panda-bamboo-bg: #f0f0f0;
    --panda-red-bg: #fce4ec;
    --panda-giant-bg: #efebe9;
    --panda-snow-bg: #f1f8e9;
  }
}

@layer components {
  .panda-card {
    @apply rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow;
  }
  
  .battle-arena {
    @apply grid grid-cols-2 gap-4 md:gap-8;
  }
  
  .leaderboard-row {
    @apply border-b py-3 px-4 hover:bg-muted/50 transition-colors;
  }
}
```

### 5.3 Responsive Breakpoints
| Breakpoint | Size | Usage |
|-----------|------|-------|
| sm | 640px | Mobile optimized |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large screens |
| 2xl | 1536px | Ultra-wide |

```typescript
// Example responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-stacks on mobile, 2 cols on tablet, 3 on desktop */}
</div>
```

---

## 6. Performance Considerations

### 6.1 Optimization Strategies
- **Code Splitting:** Each screen lazy-loaded via Next.js dynamic imports
- **Image Optimization:** Use next/image for panda avatars
- **CSS-in-JS:** Tailwind for zero-JS styling
- **Bundle Size:** ~150KB gzipped (target)
  - React 19: ~42KB
  - Next.js: ~70KB
  - Tailwind: ~15KB
  - Components: ~20KB

### 6.2 Caching Strategy
```typescript
// Mock data: Static, cached for session lifetime
const useMockData = (endpoint: string) => {
  const cache = useRef(new Map());
  
  return async () => {
    if (cache.current.has(endpoint)) {
      return cache.current.get(endpoint);
    }
    
    const data = await mockAPI.fetch(endpoint);
    cache.current.set(endpoint, data);
    return data;
  };
};

// Game state: Updated in real-time, debounced localStorage sync
useEffect(() => {
  const timer = debounce(() => {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, 500);
  
  return timer.cancel;
}, [gameState]);
```

### 6.3 Critical Rendering Path
1. **Preload:** Fonts (Geist), app shell
2. **Render:** Hero + navigation (FCP < 1.5s)
3. **Interactive:** Buttons clickable (TTI < 3s)
4. **Full Load:** All data, images (LCP < 2.5s)

---

## 7. Error Handling & Edge Cases

### 7.1 Error Boundaries
```typescript
// /components/common/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
    // Send to analytics
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <button onClick={() => window.location.reload()}>
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7.2 Mock API Error Simulation
```typescript
// Simulated API errors for robustness testing
const mockAPIWithErrors = {
  async submitBattleAction(battleId, move) {
    // 1% chance of "network error"
    if (Math.random() < 0.01) {
      throw new Error('Network error: Please retry');
    }
    
    // Simulated 100-500ms delay
    await new Promise(resolve => 
      setTimeout(resolve, Math.random() * 400 + 100)
    );
    
    // Return turn data
    return calculateTurn(battleId, move);
  }
};
```

### 7.3 Edge Cases Handled
- User navigates away during battle → save state
- localStorage full → graceful degradation
- Invalid panda attributes (out of range) → clamp to valid
- Battle HP goes negative → treat as 0, end battle
- Opponent action takes > 5s → timeout, default action

---

## 8. Future Architecture Considerations

### 8.1 Blockchain Integration Points
- **Wallet Connection:** injected via context provider (Phase 2)
- **Transaction Submission:** Wrap battle completion with tx (Phase 2)
- **Smart Contract ABI:** Loaded and type-safe (Phase 3)
- **Event Listeners:** Real-time updates from chain (Phase 3)

### 8.2 Backend Migration Path
```typescript
// Current MVP (Mock)
const api = mockAPI;

// Phase 2: Hybrid
const api = useEnvironment() === 'dev' ? mockAPI : backendAPI;

// Phase 3: Production
const api = backendAPI;

// Identical interface, easy migration
interface GameAPI {
  getUser(id: string): Promise<User>;
  submitBattleAction(battleId, move): Promise<Turn>;
  // ... same methods
}
```

### 8.3 Scalability Considerations
- **Monorepo:** Separate packages for shared types, UI, logic (later)
- **API Pagination:** Implement early (e.g., leaderboard pages)
- **WebSocket:** Plan for real-time battles (multiplayer)
- **CDN:** Static assets and JSON files (mock data)

---

## 9. Security & Data Validation

### 9.1 Input Validation
```typescript
// Panda name: 1-20 chars, alphanumeric + spaces
const isPandaNameValid = (name: string) => /^[a-zA-Z0-9 ]{1,20}$/.test(name);

// Attributes: 1-100 range
const isAttributeValid = (value: number) => value >= 1 && value <= 100;

// Move selection: only valid moves for current turn
const isMoveValid = (move: Move, battle: Battle) => {
  const lastTurn = battle.turns[battle.turns.length - 1];
  return move.cooldownRemaining === 0;
};
```

### 9.2 Data Integrity
- All mock data validates against TypeScript interfaces
- Battle results calculated server-side (mock) to prevent cheating
- User stats are read-only in client, updated only via API

---

## Appendix A: TypeScript Type Definitions

See `/lib/types/index.ts` for complete type definitions.

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Active
