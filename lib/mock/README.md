# Mock Data Layer

This directory contains the mock data layer for the Panda Battle game, implementing the data models and game logic from the design document.

## Overview

The mock data layer provides:

- **Mock data structures** for players, battles, and leaderboard
- **Zustand store** for global game state management
- **Battle logic** implementing score calculation and attribute stealing
- **Leaderboard logic** for ranking and visibility rules

## Files

### Core Data (`data.ts`)

- Type definitions matching design.md
- Mock data generation functions
- Helper functions for data conversion

### Battle Logic (`battle-logic.ts`)

- Battle score calculation (Requirement 3.2)
- Winner determination (Requirement 3.3)
- Attribute stealing (Requirement 4.2)
- Battle validation and simulation

### Leaderboard Logic (`leaderboard-logic.ts`)

- Ranking calculations (Requirement 5.1)
- Top 20 management
- Visibility rules (Requirements 5.5, 5.6, 9.1-9.3)
- Leaderboard statistics

### Game Store (`../store/game-store.ts`)

- Zustand store for global state
- Player state management
- Turn regeneration (Requirements 2.1, 2.2)
- Battle orchestration
- Leaderboard updates

## Usage Examples

### Using the Game Store

```typescript
import {
  useGameStore,
  useCurrentPlayer,
  usePlayerTurns,
} from "@/lib/store/game-store";

// In a component
function BattleButton() {
  const turns = usePlayerTurns();
  const initiateBattle = useGameStore((state) => state.initiateBattle);

  const handleBattle = async () => {
    const result = await initiateBattle("opponent_1");
    if (result) {
      console.log("Battle won!", result);
    }
  };

  return (
    <button onClick={handleBattle} disabled={turns <= 0}>
      Battle ({turns} turns)
    </button>
  );
}
```

### Accessing Player Data

```typescript
import { useCurrentPlayer } from "@/lib/store/game-store";

function PlayerStats() {
  const player = useCurrentPlayer();

  return (
    <div>
      <h2>{player.pandaName}</h2>
      <p>Rank: {player.rank}</p>
      <p>Strength: {player.attributes.strength}</p>
      <p>Speed: {player.attributes.speed}</p>
      <p>Endurance: {player.attributes.endurance}</p>
      <p>Luck: {player.attributes.luck}</p>
      <p>
        Wins: {player.winCount} / Losses: {player.lossCount}
      </p>
    </div>
  );
}
```

### Initiating a Battle

```typescript
import { useGameStore } from "@/lib/store/game-store";

function OpponentCard({ opponent }) {
  const initiateBattle = useGameStore((state) => state.initiateBattle);
  const [battleResult, setBattleResult] = useState(null);

  const handleChallenge = async () => {
    const result = await initiateBattle(opponent.wallet);
    if (result) {
      setBattleResult(result);
      // Show battle animation/results
    }
  };

  return (
    <div>
      <h3>{opponent.pandaName}</h3>
      <p>Rank: {opponent.rank}</p>
      <button onClick={handleChallenge}>Challenge</button>
    </div>
  );
}
```

### Viewing Leaderboard

```typescript
import { useGameStore } from "@/lib/store/game-store";

function Leaderboard() {
  const currentPlayer = useGameStore((state) => state.currentPlayer);
  const getLeaderboardWithVisibility = useGameStore(
    (state) => state.getLeaderboardWithVisibility
  );

  const leaderboard = getLeaderboardWithVisibility(currentPlayer.wallet);

  return (
    <div>
      {leaderboard.map((player) => (
        <div key={player.wallet}>
          <span>#{player.rank}</span>
          <span>{player.pandaName}</span>
          {player.rank <= 20 && (
            <span>Power: {calculateTotalPower(player.attributes)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Turn Regeneration

```typescript
import { useGameStore } from "@/lib/store/game-store";
import { useEffect } from "react";

function TurnRegenerator() {
  const regenerateTurns = useGameStore((state) => state.regenerateTurns);

  useEffect(() => {
    // Check for turn regeneration every minute
    const interval = setInterval(() => {
      regenerateTurns();
    }, 60000);

    return () => clearInterval(interval);
  }, [regenerateTurns]);

  return null;
}
```

### Manual Turn Regeneration (for testing)

```typescript
import { useGameStore } from "@/lib/store/game-store";

function DevTools() {
  const simulateTurnRegeneration = useGameStore(
    (state) => state.simulateTurnRegeneration
  );

  return <button onClick={simulateTurnRegeneration}>Add 3 Turns (Dev)</button>;
}
```

## Battle Score Calculation

The battle score is calculated using the formula from the design document:

```
score = (strength × 0.35) + (speed × 0.25) + (endurance × 0.25) + (luck × 0.15)
```

With modifiers:

- **Top 20 Vulnerability**: Defenders in Top 20 get -20% to their score
- **Randomness**: ±10% random factor for upsets

## Attribute Stealing

When a battle is won:

1. Winner selects an attribute (currently randomized in mock)
2. 10-20% of that attribute is stolen from the loser
3. Attributes are updated immediately
4. Leaderboard is recalculated

## Leaderboard Visibility

Based on rank:

- **Top 20 (1-20)**: Full visibility - all attributes shown
- **Mid-tier (21-100)**: Partial visibility - attributes rounded to nearest 5
- **Bottom-tier (101+)**: Hidden - name and attributes hidden

The current player always sees their own full information.

## Requirements Mapping

This mock data layer implements the following requirements:

- **1.4**: Attribute generation with randomized values
- **2.1, 2.2**: Turn regeneration and cap enforcement
- **3.1**: Turn consumption for battles
- **3.2**: Battle score calculation
- **3.3**: Winner determination
- **3.6**: Top 20 vulnerability modifier
- **4.2**: Attribute steal calculation
- **5.1**: Leaderboard ranking recalculation
- **5.5, 5.6**: Leaderboard visibility rules
- **9.1, 9.2, 9.3**: Opponent visibility based on rank

## Testing

To test the mock data layer:

```typescript
import { useGameStore } from "@/lib/store/game-store";
import { calculateBattleScore, simulateBattle } from "@/lib/mock/battle-logic";
import { calculateRankings } from "@/lib/mock/leaderboard-logic";

// Test battle score calculation
const score = calculateBattleScore(
  { strength: 30, speed: 25, endurance: 25, luck: 20 },
  false,
  false
);
console.log("Battle score:", score);

// Test battle simulation
const attacker = {
  /* player object */
};
const defender = {
  /* player object */
};
const result = simulateBattle(attacker, defender, "round_1");
console.log("Battle result:", result);

// Test leaderboard ranking
const players = [
  /* array of players */
];
const ranked = calculateRankings(players);
console.log("Rankings:", ranked);
```

## Future Enhancements

When connecting to the actual Solana program:

1. Replace mock data with blockchain queries
2. Replace `simulateBattle` with actual on-chain battle resolution
3. Replace `calculateRankings` with MagicBlock Ephemeral Rollup queries
4. Add real-time WebSocket updates for battles and leaderboard changes
