# Design Document

## Overview

Panda Battle is a turn-based PvP mobile game built on Solana blockchain that combines strategic combat mechanics with play-to-earn economics. The system architecture leverages Solana's high-performance blockchain for financial transactions and prize pool management, while utilizing MagicBlock Ephemeral Rollups for real-time game state management to ensure sub-second battle resolution and responsive gameplay.

The game operates on a daily round cycle where players enter by paying fees, receive randomized panda characters with four attributes (Strength, Speed, Endurance, Luck), and compete in battles to steal opponent attributes. A dynamic leaderboard system creates strategic risk/reward decisions, with top-ranked players earning hourly rewards but becoming visible targets. The communal prize pool grows from entry fees and purchases, distributing rewards based on performance and activity.

Key design principles:

- **Short session length**: All interactions complete within 10 minutes
- **Fair competition**: Daily resets prevent permanent advantages
- **Strategic depth**: Multiple viable strategies (aggressive climbing, defensive lurking, alliance coordination)
- **Economic sustainability**: All player spending feeds the prize pool
- **Social engagement**: Chat, alliances, and betting create community

## Architecture

### System Layers

The architecture follows a three-tier model optimized for mobile gaming with blockchain integration:

**Layer 1: Solana On-Chain (Anchor Program)**

- Entry fee collection and validation
- Prize pool account management
- Final battle result verification
- Prize distribution transactions
- Player wallet authentication
- Immutable audit trail

**Layer 2: MagicBlock Ephemeral Rollups (Game State)**

- Real-time battle resolution
- Attribute state management during active rounds
- Turn regeneration tracking
- Leaderboard calculations
- Idle decay processing
- Temporary state (shields, buffs)

**Layer 3: Client Application (React Native/Next.js)**

- UI rendering and animations
- Local state caching
- Notification handling
- Chat interface
- Session management
- Optimistic updates

### Data Flow

**Player Entry Flow:**

```
Client → Wallet Signature → Anchor Program → Entry Fee Transfer →
Prize Pool Update → Ephemeral Rollup → Generate Attributes →
Client State Update
```

**Battle Flow:**

```
Client → Battle Request → Ephemeral Rollup → Calculate Scores →
Determine Winner → Apply Steal → Update Leaderboard →
Anchor Program (Result Hash) → Client Notification
```

**Prize Distribution Flow:**

```
Scheduled Job → Ephemeral Rollup (Calculate Eligibility) →
Anchor Program → Prize Pool Withdrawal → Wallet Transfers →
Transaction Confirmation → Client Notification
```

### Technology Stack

**Blockchain:**

- Solana (mainnet-beta)
- Anchor Framework 0.29+
- @solana/web3.js
- @solana/wallet-adapter

**Game State Management:**

- MagicBlock Ephemeral Rollups
- Redis for session state
- PostgreSQL for persistent records

**Client:**

- Next.js 14+ (web)
- React Native (mobile)
- TailwindCSS + shadcn/ui
- Zustand for state management

**Backend Services:**

- Node.js/TypeScript
- Express.js for API
- WebSocket for real-time updates
- Bull for job queues (turn regen, decay, distributions)

## Components and Interfaces

### Core Components

#### 1. Player Manager

**Responsibilities:**

- Player account creation and initialization
- Attribute generation and validation
- Entry timing calculations
- Activity tracking

**Interface:**

```typescript
interface PlayerManager {
  createPlayer(
    wallet: PublicKey,
    entryFee: number,
    roundTime: number
  ): Promise<Player>;
  getPlayer(wallet: PublicKey): Promise<Player | null>;
  updateAttributes(wallet: PublicKey, attributes: Attributes): Promise<void>;
  trackActivity(wallet: PublicKey, activityType: ActivityType): Promise<void>;
  checkMinimumActivity(wallet: PublicKey): Promise<boolean>;
}

interface Player {
  wallet: PublicKey;
  attributes: Attributes;
  turns: number;
  lastActivity: Date;
  battleCount: number;
  winCount: number;
  lossCount: number;
  entryTime: Date;
  shields: Shield[];
}

interface Attributes {
  strength: number;
  speed: number;
  endurance: number;
  luck: number;
}
```

#### 2. Turn Manager

**Responsibilities:**

- Turn balance tracking
- Hourly regeneration
- Purchase processing
- Cap enforcement

**Interface:**

```typescript
interface TurnManager {
  regenerateTurns(): Promise<void>;
  purchaseTurns(wallet: PublicKey, quantity: number): Promise<PurchaseResult>;
  consumeTurn(wallet: PublicKey): Promise<boolean>;
  getTurnBalance(wallet: PublicKey): Promise<number>;
  calculatePurchasePrice(wallet: PublicKey, quantity: number): Promise<number>;
}

interface PurchaseResult {
  success: boolean;
  turnsAdded: number;
  cost: number;
  newBalance: number;
}
```

#### 3. Battle Engine

**Responsibilities:**

- Battle initiation and validation
- Score calculation
- Winner determination
- Result recording

**Interface:**

```typescript
interface BattleEngine {
  initiateBattle(
    attacker: PublicKey,
    defender: PublicKey
  ): Promise<BattleResult>;
  calculateBattleScore(
    attributes: Attributes,
    isDefender: boolean,
    inTop20: boolean
  ): number;
  determineWinner(
    attackerScore: number,
    defenderScore: number
  ): "attacker" | "defender";
  recordBattle(result: BattleResult): Promise<void>;
}

interface BattleResult {
  attacker: PublicKey;
  defender: PublicKey;
  winner: PublicKey;
  loser: PublicKey;
  attackerScore: number;
  defenderScore: number;
  timestamp: Date;
}
```

#### 4. Steal Manager

**Responsibilities:**

- Attribute selection
- Steal calculation and cap enforcement
- Shield checking
- Attribute transfer

**Interface:**

```typescript
interface StealManager {
  selectAttributeToSteal(
    winner: PublicKey,
    loser: PublicKey,
    attribute: AttributeType
  ): Promise<StealResult>;
  calculateStealAmount(loserValue: number): number;
  checkShield(player: PublicKey, attribute: AttributeType): Promise<boolean>;
  applySteal(
    winner: PublicKey,
    loser: PublicKey,
    attribute: AttributeType,
    amount: number
  ): Promise<void>;
}

interface StealResult {
  success: boolean;
  attribute: AttributeType;
  amountStolen: number;
  shieldBlocked: boolean;
}

type AttributeType = "strength" | "speed" | "endurance" | "luck";
```

#### 5. Leaderboard Manager

**Responsibilities:**

- Ranking calculation
- Top 20 tracking
- Visibility rules
- Position change detection

**Interface:**

```typescript
interface LeaderboardManager {
  updateRankings(): Promise<void>;
  getRankings(viewer: PublicKey): Promise<LeaderboardEntry[]>;
  getPlayerRank(wallet: PublicKey): Promise<number>;
  isInTop20(wallet: PublicKey): Promise<boolean>;
  getTop20(): Promise<PublicKey[]>;
}

interface LeaderboardEntry {
  rank: number;
  wallet: PublicKey;
  displayName: string;
  attributes: Attributes | null; // null if hidden
  totalPower: number;
  visible: boolean;
}
```

#### 6. Prize Pool Manager

**Responsibilities:**

- Pool accumulation
- Hourly distribution
- End-of-round distribution
- Eligibility verification

**Interface:**

```typescript
interface PrizePoolManager {
  addToPool(amount: number, source: PoolSource): Promise<void>;
  distributeHourlyReward(): Promise<DistributionResult>;
  distributeEndOfRound(): Promise<DistributionResult[]>;
  getPoolBalance(): Promise<number>;
  checkEligibility(wallet: PublicKey): Promise<boolean>;
}

interface DistributionResult {
  recipient: PublicKey;
  amount: number;
  distributionType: "hourly" | "daily";
  timestamp: Date;
}

type PoolSource =
  | "entry_fee"
  | "turn_purchase"
  | "upgrade_purchase"
  | "betting_commission"
  | "mini_event"
  | "idle_forfeit";
```

#### 7. Decay Manager

**Responsibilities:**

- Idle time tracking
- Decay calculation and application
- Warning notifications
- Minimum activity enforcement

**Interface:**

```typescript
interface DecayManager {
  checkAndApplyDecay(): Promise<void>;
  applyDecayToPlayer(wallet: PublicKey): Promise<DecayResult>;
  getIdleTime(wallet: PublicKey): Promise<number>;
  checkMinimumActivity(wallet: PublicKey): Promise<boolean>;
}

interface DecayResult {
  applied: boolean;
  decayPercentage: number;
  newAttributes: Attributes;
}
```

#### 8. Round Manager

**Responsibilities:**

- Round lifecycle management
- Daily reset coordination
- Prize distribution orchestration
- Historical record keeping

**Interface:**

```typescript
interface RoundManager {
  startNewRound(): Promise<Round>;
  endCurrentRound(): Promise<void>;
  getCurrentRound(): Promise<Round>;
  resetPlayerAttributes(): Promise<void>;
  preserveHistoricalRecords(): Promise<void>;
}

interface Round {
  id: string;
  startTime: Date;
  endTime: Date;
  prizePool: number;
  playerCount: number;
  status: "active" | "ended";
}
```

#### 9. Notification Manager

**Responsibilities:**

- Push notification delivery
- Event-based triggers
- Notification preferences
- Delivery tracking

**Interface:**

```typescript
interface NotificationManager {
  sendNotification(
    wallet: PublicKey,
    notification: Notification
  ): Promise<void>;
  sendBattleNotification(
    defender: PublicKey,
    result: BattleResult
  ): Promise<void>;
  sendLeaderboardNotification(
    wallet: PublicKey,
    event: LeaderboardEvent
  ): Promise<void>;
  sendIdleWarning(wallet: PublicKey, idleHours: number): Promise<void>;
}

interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  priority: "high" | "normal" | "low";
}

type NotificationType =
  | "battle"
  | "leaderboard"
  | "turns"
  | "idle"
  | "prize"
  | "mini_event";
```

#### 10. Upgrade Manager

**Responsibilities:**

- Upgrade purchase processing
- Attribute reroll execution
- Shield application and tracking
- Temporary buff management

**Interface:**

```typescript
interface UpgradeManager {
  purchaseReroll(
    wallet: PublicKey,
    attribute: AttributeType
  ): Promise<RerollResult>;
  purchaseShield(
    wallet: PublicKey,
    attribute: AttributeType,
    duration: number
  ): Promise<Shield>;
  applyTemporaryBuff(wallet: PublicKey, buff: Buff): Promise<void>;
  checkActiveShields(wallet: PublicKey): Promise<Shield[]>;
}

interface RerollResult {
  success: boolean;
  attribute: AttributeType;
  oldValue: number;
  newValue: number;
  cost: number;
}

interface Shield {
  attribute: AttributeType;
  remainingBattles: number;
  expiresAt: Date;
}

interface Buff {
  type: BuffType;
  value: number;
  duration: number;
}

type BuffType = "strength" | "speed" | "endurance" | "luck" | "steal_bonus";
```

## Data Models

### On-Chain Data (Anchor Program)

**GameState Account:**

```rust
#[account]
pub struct GameState {
    pub authority: Pubkey,
    pub prize_pool: u64,
    pub current_round_id: u64,
    pub round_start_time: i64,
    pub total_players: u64,
    pub bump: u8,
}
```

**PlayerAccount:**

```rust
#[account]
pub struct PlayerAccount {
    pub wallet: Pubkey,
    pub entry_fee_paid: u64,
    pub entry_timestamp: i64,
    pub total_battles: u64,
    pub total_wins: u64,
    pub is_active: bool,
    pub bump: u8,
}
```

**PrizeDistribution:**

```rust
#[account]
pub struct PrizeDistribution {
    pub round_id: u64,
    pub recipient: Pubkey,
    pub amount: u64,
    pub distribution_type: DistributionType,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DistributionType {
    Hourly,
    Daily,
}
```

### Off-Chain Data (Ephemeral Rollups / Database)

**Player State:**

```typescript
interface PlayerState {
  wallet: string;
  attributes: {
    strength: number;
    speed: number;
    endurance: number;
    luck: number;
  };
  turns: number;
  lastBattleTime: Date;
  lastActivityTime: Date;
  battleCount: number;
  winCount: number;
  lossCount: number;
  entryTime: Date;
  shields: {
    attribute: string;
    remainingBattles: number;
    expiresAt: Date;
  }[];
  buffs: {
    type: string;
    value: number;
    expiresAt: Date;
  }[];
  rank: number;
  inTop20: boolean;
}
```

**Battle Record:**

```typescript
interface BattleRecord {
  id: string;
  roundId: string;
  attacker: string;
  defender: string;
  winner: string;
  attackerScore: number;
  defenderScore: number;
  attributeStolen: string;
  amountStolen: number;
  timestamp: Date;
}
```

**Round State:**

```typescript
interface RoundState {
  id: string;
  startTime: Date;
  endTime: Date | null;
  prizePool: number;
  playerCount: number;
  status: "active" | "ended";
  hourlyDistributions: number;
  totalDistributed: number;
}
```

### Attribute Generation

Attributes are generated using a weighted random distribution to ensure variety while maintaining balance:

```typescript
function generateAttributes(): Attributes {
  const totalPoints = 100; // Base point pool
  const minPerAttribute = 15;
  const maxPerAttribute = 40;

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
```

### Battle Score Calculation

The battle score formula balances all attributes with configurable weights:

```typescript
function calculateBattleScore(
  attributes: Attributes,
  isDefender: boolean,
  inTop20: boolean
): number {
  const weights = {
    strength: 0.35,
    speed: 0.25,
    endurance: 0.25,
    luck: 0.15,
  };

  let baseScore =
    attributes.strength * weights.strength +
    attributes.speed * weights.speed +
    attributes.endurance * weights.endurance +
    attributes.luck * weights.luck;

  // Apply Top 20 vulnerability
  if (isDefender && inTop20) {
    baseScore *= 0.8; // 20% vulnerability
  }

  // Add randomness for upsets (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;

  return baseScore * randomFactor;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Entry and Initialization Properties

**Property 1: Early entry base fee**
_For any_ player entry within the first 6 hours of a round, the system should charge exactly the base entry fee and create a player account with full starting attributes and bonus turns.
**Validates: Requirements 1.1, 1.6**

**Property 2: Mid-round entry penalty**
_For any_ player entry between 6-12 hours into a round, the system should charge 1.25x the base fee and reduce starting attributes by exactly 10%.
**Validates: Requirements 1.2**

**Property 3: Late entry penalty**
_For any_ player entry after 12 hours into a round, the system should charge 1.5x the base fee, reduce starting attributes by 20%, and reduce starting turns by 1.
**Validates: Requirements 1.3**

**Property 4: Attribute generation bounds**
_For any_ newly created player, all four attributes (Strength, Speed, Endurance, Luck) should be within the defined minimum and maximum ranges.
**Validates: Requirements 1.4**

**Property 5: Entry fee pool contribution**
_For any_ successful player entry, the prize pool should increase by exactly the entry fee amount paid.
**Validates: Requirements 1.5**

### Turn Economy Properties

**Property 6: Hourly turn regeneration**
_For any_ active player when one hour passes, the turn balance should increase by exactly 3 turns, unless the maximum cap is reached.
**Validates: Requirements 2.1**

**Property 7: Turn cap enforcement**
_For any_ turn regeneration event, the resulting turn balance should never exceed the maximum turn storage cap.
**Validates: Requirements 2.2**

**Property 8: Progressive turn purchase pricing**
_For any_ player purchasing turns, the first purchase should cost the base price, the second should cost 1.5x base, and the third or more should cost 2x or more base, with 100% going to the prize pool.
**Validates: Requirements 2.3, 2.4, 2.5**

**Property 9: Battle turn consumption**
_For any_ battle initiation, the attacker's turn balance should decrease by exactly 1.
**Validates: Requirements 3.1**

### Combat Properties

**Property 10: Battle score calculation**
_For any_ battle, both pandas' battle scores should be calculated using the formula: (Strength × weight) + (Speed × weight) + (Endurance × weight) + (Luck modifier), with appropriate weights summing to 1.
**Validates: Requirements 3.2**

**Property 11: Winner determination**
_For any_ battle, the panda with the higher battle score should win in the majority of cases, with randomness allowing occasional upsets.
**Validates: Requirements 3.3**

**Property 12: Battle record updates**
_For any_ completed battle, both the winner's win count and the loser's loss count should increase by exactly 1.
**Validates: Requirements 3.4**

**Property 13: Top 20 vulnerability**
_For any_ battle where the defender is in the Top 20, the defender's battle score should be reduced by 20% compared to the same attributes outside Top 20.
**Validates: Requirements 3.6**

### Attribute Stealing Properties

**Property 14: Steal percentage bounds**
_For any_ attribute steal, the amount transferred should be between 10% and 20% of the loser's attribute value, subject to the maximum steal cap.
**Validates: Requirements 4.2, 4.3**

**Property 15: Steal attribute transfer**
_For any_ attribute steal, the winner's selected attribute should increase and the loser's should decrease by the same amount, maintaining total attribute conservation.
**Validates: Requirements 4.4**

**Property 16: Shield blocks steal**
_For any_ steal attempt on a shielded attribute, the steal should be blocked and no attribute transfer should occur, with the shield's remaining battles decreasing by 1.
**Validates: Requirements 10.2**

### Leaderboard Properties

**Property 17: Ranking recalculation**
_For any_ completed battle, player rankings should be recalculated based on total attribute sum or win/loss ratio, with the winner's rank potentially improving and the loser's potentially declining.
**Validates: Requirements 5.1**

**Property 18: Top 20 visibility**
_For any_ leaderboard view, all Top 20 players should be visible with their full attributes, mid-tier players should have partial visibility, and bottom-tier players should be completely hidden.
**Validates: Requirements 5.5, 5.6, 9.1, 9.2, 9.3**

### Prize Pool Properties

**Property 19: Hourly distribution eligibility**
_For any_ hourly distribution, the selected recipient should be from the current Top 20 players and should receive exactly 0.1% of the prize pool.
**Validates: Requirements 6.1**

**Property 20: Activity requirement for prizes**
_For any_ prize distribution (hourly or daily), only players who have completed at least 5 battles should be eligible to receive rewards.
**Validates: Requirements 6.3**

**Property 21: Prize transfer accuracy**
_For any_ prize distribution, the recipient's wallet balance should increase by exactly the prize amount, and the prize pool should decrease by the same amount.
**Validates: Requirements 6.4**

**Property 22: Pool reset after distribution**
_For any_ round end, after all distributions complete, the prize pool balance should be exactly zero.
**Validates: Requirements 6.5**

### Idle Decay Properties

**Property 23: Hourly idle decay**
_For any_ player who has not initiated a battle for one hour, all four attributes should decrease by exactly 5%.
**Validates: Requirements 7.1**

**Property 24: Minimum activity forfeit**
_For any_ player with fewer than 5 battles at round end, their entry fee should be returned to the prize pool and they should be excluded from prize distribution.
**Validates: Requirements 7.4, 7.5**

### Round Reset Properties

**Property 25: Attribute reset randomization**
_For any_ round end, all players should receive new randomized attributes within the defined ranges, independent of their previous attributes.
**Validates: Requirements 8.1**

**Property 26: Distribution before reset**
_For any_ round end, all prize distributions should complete before any player attributes are reset or the leaderboard is cleared.
**Validates: Requirements 8.2**

**Property 27: Historical record preservation**
_For any_ round reset, all players' win/loss records should be preserved and remain unchanged across the round boundary.
**Validates: Requirements 8.5**

### Upgrade Properties

**Property 28: Reroll bounds**
_For any_ attribute reroll purchase, the new attribute value should be within the defined minimum and maximum ranges, and should be different from the previous value.
**Validates: Requirements 10.1**

**Property 29: Upgrade pool contribution**
_For any_ upgrade purchase (reroll or shield), a defined percentage of the purchase price should be added to the prize pool.
**Validates: Requirements 10.4**

### Social Properties

**Property 30: Poke buff application**
_For any_ poke received by a player, that player's attributes should receive a small positive buff.
**Validates: Requirements 11.3**

### Betting Properties

**Property 31: Bet escrow**
_For any_ bet placed, the wager amount should be deducted from the bettor's wallet and held in escrow until the battle resolves.
**Validates: Requirements 13.1, 13.2**

**Property 32: Bet payout with commission**
_For any_ winning bet, the bettor should receive their winnings minus a commission percentage, with the commission added to the prize pool.
**Validates: Requirements 13.3, 13.4, 13.5**

### Transaction Properties

**Property 33: Transaction atomicity**
_For any_ failed transaction, all partial state changes should be rolled back, leaving the system in the same state as before the transaction was initiated.
**Validates: Requirements 15.5**

**Property 34: Wallet signature verification**
_For any_ wallet connection attempt, the system should verify the signature before establishing a session, rejecting invalid signatures.
**Validates: Requirements 15.1**

## Error Handling

### Error Categories

**1. Validation Errors**

- Insufficient turn balance for battle
- Invalid attribute selection for steal
- Entry fee below minimum
- Wallet signature verification failure
- Bet amount exceeds wallet balance

**2. State Errors**

- Player not found
- Round not active
- Battle already in progress
- Shield already active on attribute
- Opponent not available for battle

**3. Transaction Errors**

- Insufficient SOL for transaction
- Transaction timeout
- Network connectivity issues
- Wallet approval rejected
- Prize pool insufficient for distribution

**4. Timing Errors**

- Action attempted outside valid time window
- Round ended during transaction
- Shield expired during battle
- Turn regeneration conflict

### Error Handling Strategies

**Validation Errors:**

```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string, public value: any) {
    super(message);
    this.name = "ValidationError";
  }
}

// Example usage
function validateTurnBalance(player: Player, required: number): void {
  if (player.turns < required) {
    throw new ValidationError(
      `Insufficient turns: have ${player.turns}, need ${required}`,
      "turns",
      player.turns
    );
  }
}
```

**Transaction Rollback:**

```typescript
async function executeWithRollback<T>(
  operation: () => Promise<T>,
  rollback: () => Promise<void>
): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    await rollback();
    throw error;
  }
}

// Example usage
async function purchaseTurns(
  wallet: PublicKey,
  quantity: number
): Promise<void> {
  const snapshot = await capturePlayerState(wallet);

  await executeWithRollback(
    async () => {
      await deductPayment(wallet, calculatePrice(quantity));
      await addTurns(wallet, quantity);
      await addToPrizePool(calculatePrice(quantity));
    },
    async () => {
      await restorePlayerState(wallet, snapshot);
    }
  );
}
```

**Retry Logic:**

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, attempt));
      }
    }
  }

  throw lastError!;
}
```

**User-Friendly Error Messages:**

```typescript
function formatErrorForUser(error: Error): string {
  if (error instanceof ValidationError) {
    return `Invalid ${error.field}: ${error.message}`;
  }

  if (error.message.includes("insufficient funds")) {
    return "Not enough SOL in your wallet for this transaction";
  }

  if (error.message.includes("timeout")) {
    return "Transaction timed out. Please try again.";
  }

  return "An unexpected error occurred. Please try again or contact support.";
}
```

### Critical Error Recovery

**Prize Pool Inconsistency:**

- Pause all distributions
- Audit all transactions since last known good state
- Recalculate pool from source transactions
- Resume operations with corrected state

**Leaderboard Corruption:**

- Rebuild rankings from battle records
- Verify attribute sums match battle history
- Notify affected players of corrections
- Resume normal operations

**Orphaned Transactions:**

- Identify incomplete transactions via timeout
- Attempt completion with idempotency checks
- Rollback if completion fails
- Notify users of transaction status

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and component integration:

**Core Logic Tests:**

- Attribute generation produces valid distributions
- Battle score calculation with known inputs
- Steal percentage calculation edge cases (very low/high attributes)
- Turn cap enforcement at boundary conditions
- Entry fee multiplier calculation for each time window
- Prize pool arithmetic (additions, distributions, resets)

**Edge Case Tests:**

- Player with zero turns attempts battle
- Steal from player with minimum attribute value
- Turn regeneration when already at cap
- Battle between players with identical scores
- Prize distribution with exactly 5 battles (minimum)
- Round reset with zero players
- Shield expiration during active battle

**Integration Tests:**

- Complete battle flow from initiation to steal
- Entry → Battle → Steal → Leaderboard update sequence
- Turn purchase → Prize pool update → Distribution chain
- Round end → Distribution → Reset → New round start
- Wallet connection → Transaction → Balance update

**Error Condition Tests:**

- Invalid wallet signature rejection
- Insufficient funds handling
- Transaction rollback verification
- Concurrent battle attempt prevention
- Network failure recovery

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (TypeScript/JavaScript property testing library).

**Configuration:**

- Minimum 100 iterations per property test
- Configurable seed for reproducibility
- Shrinking enabled for minimal failing examples

**Property Test Requirements:**

- Each property test MUST be tagged with a comment referencing the design document property
- Tag format: `// Feature: panda-battle-game, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test
- Tests should use smart generators that constrain inputs to valid ranges

**Example Property Test Structure:**

```typescript
import fc from "fast-check";

// Feature: panda-battle-game, Property 4: Attribute generation bounds
test("generated attributes are within defined ranges", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 1000 }), // seed for randomness
      (seed) => {
        const attributes = generateAttributes(seed);

        expect(attributes.strength).toBeGreaterThanOrEqual(MIN_ATTRIBUTE);
        expect(attributes.strength).toBeLessThanOrEqual(MAX_ATTRIBUTE);
        expect(attributes.speed).toBeGreaterThanOrEqual(MIN_ATTRIBUTE);
        expect(attributes.speed).toBeLessThanOrEqual(MAX_ATTRIBUTE);
        expect(attributes.endurance).toBeGreaterThanOrEqual(MIN_ATTRIBUTE);
        expect(attributes.endurance).toBeLessThanOrEqual(MAX_ATTRIBUTE);
        expect(attributes.luck).toBeGreaterThanOrEqual(MIN_ATTRIBUTE);
        expect(attributes.luck).toBeLessThanOrEqual(MAX_ATTRIBUTE);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: panda-battle-game, Property 15: Steal attribute transfer
test("attribute steal conserves total attributes", () => {
  fc.assert(
    fc.property(
      attributesArbitrary(),
      attributesArbitrary(),
      fc.constantFrom("strength", "speed", "endurance", "luck"),
      (winnerAttrs, loserAttrs, stealAttr) => {
        const totalBefore =
          sumAttributes(winnerAttrs) + sumAttributes(loserAttrs);

        const result = performSteal(winnerAttrs, loserAttrs, stealAttr);

        const totalAfter =
          sumAttributes(result.winner) + sumAttributes(result.loser);

        expect(totalAfter).toBe(totalBefore);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Custom Generators:**

```typescript
// Generate valid attribute sets
function attributesArbitrary() {
  return fc.record({
    strength: fc.integer({ min: MIN_ATTRIBUTE, max: MAX_ATTRIBUTE }),
    speed: fc.integer({ min: MIN_ATTRIBUTE, max: MAX_ATTRIBUTE }),
    endurance: fc.integer({ min: MIN_ATTRIBUTE, max: MAX_ATTRIBUTE }),
    luck: fc.integer({ min: MIN_ATTRIBUTE, max: MAX_ATTRIBUTE }),
  });
}

// Generate valid player states
function playerArbitrary() {
  return fc.record({
    wallet: fc.hexaString({ minLength: 64, maxLength: 64 }),
    attributes: attributesArbitrary(),
    turns: fc.integer({ min: 0, max: MAX_TURNS }),
    battleCount: fc.nat(),
    winCount: fc.nat(),
    lossCount: fc.nat(),
  });
}

// Generate entry times for different windows
function entryTimeArbitrary() {
  return fc.oneof(
    fc.integer({ min: 0, max: 6 * 3600 - 1 }), // Early window
    fc.integer({ min: 6 * 3600, max: 12 * 3600 - 1 }), // Mid window
    fc.integer({ min: 12 * 3600, max: 24 * 3600 }) // Late window
  );
}
```

### Test Coverage Goals

- **Unit Test Coverage**: 80%+ of core logic functions
- **Property Test Coverage**: 100% of correctness properties
- **Integration Test Coverage**: All critical user flows
- **Edge Case Coverage**: All boundary conditions and error paths

### Testing Workflow

1. **Implementation-First Development**: Implement features before writing tests
2. **Unit Tests**: Write unit tests for specific examples and edge cases
3. **Property Tests**: Write property tests for universal behaviors
4. **Integration Tests**: Verify end-to-end flows
5. **Regression Tests**: Add tests for any discovered bugs

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests nightly
- Monitor test execution time and optimize slow tests
- Track flaky tests and fix root causes

## Performance Considerations

### Scalability Targets

- **Concurrent Players**: 10,000+ active players per round
- **Battle Resolution**: <500ms average, <1s p99
- **Leaderboard Update**: <100ms after battle completion
- **Turn Regeneration**: Process all players within 1 minute of hour boundary
- **Prize Distribution**: Complete within 5 minutes of round end

### Optimization Strategies

**Ephemeral Rollups for Hot Path:**

- All battle calculations in rollup (sub-second latency)
- Leaderboard calculations in rollup (real-time updates)
- Turn regeneration in rollup (batch processing)
- Only final results committed to Solana

**Caching Strategy:**

```typescript
// Cache leaderboard for 30 seconds
const leaderboardCache = new TTLCache<string, LeaderboardEntry[]>({
  ttl: 30_000,
  max: 100,
});

// Cache player state for 10 seconds
const playerCache = new TTLCache<string, Player>({
  ttl: 10_000,
  max: 10_000,
});
```

**Database Indexing:**

```sql
-- Fast leaderboard queries
CREATE INDEX idx_player_rank ON players(total_power DESC, wallet);

-- Fast battle history queries
CREATE INDEX idx_battles_player ON battles(attacker, timestamp DESC);
CREATE INDEX idx_battles_round ON battles(round_id, timestamp DESC);

-- Fast activity queries
CREATE INDEX idx_player_activity ON players(last_activity_time, battle_count);
```

**Batch Processing:**

- Turn regeneration: Process in batches of 1000 players
- Idle decay: Process in batches of 500 players
- Notifications: Queue and send in batches of 100

**Connection Pooling:**

```typescript
const pool = new Pool({
  max: 20, // Maximum connections
  min: 5, // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Monitoring and Alerts

**Key Metrics:**

- Battle resolution time (p50, p95, p99)
- Leaderboard update latency
- Prize pool balance accuracy
- Transaction success rate
- WebSocket connection count
- Database query performance

**Alert Thresholds:**

- Battle resolution >2s for 5 minutes
- Prize pool discrepancy >0.1%
- Transaction failure rate >5%
- Database connection pool exhaustion
- Memory usage >80%

## Security Considerations

### Wallet Security

- All transactions require explicit wallet approval
- Signature verification on every authenticated action
- Session tokens expire after 24 hours
- No private keys stored on server

### Transaction Security

- Idempotency keys prevent duplicate transactions
- Atomic operations with rollback on failure
- Prize pool balance verification before distributions
- Transaction amount limits to prevent errors

### Game State Security

- Battle results verified with cryptographic hashes
- Leaderboard calculations auditable from battle history
- Attribute changes logged with timestamps
- Admin actions require multi-signature approval

### Anti-Cheating Measures

- Battle score calculations server-side only
- Attribute values validated against history
- Rate limiting on battle initiation (max 1 per 10 seconds)
- Suspicious activity flagging (impossible attribute gains)
- IP-based rate limiting on entry fees

### Data Privacy

- Wallet addresses are public (blockchain nature)
- Chat messages encrypted in transit
- Personal data (if any) encrypted at rest
- GDPR compliance for EU users

## Deployment Architecture

### Infrastructure

**Solana Program:**

- Deployed to mainnet-beta
- Upgradeable with multi-sig authority
- Program-derived addresses for prize pool
- Rent-exempt accounts

**MagicBlock Ephemeral Rollups:**

- Dedicated rollup instance for game state
- Periodic state snapshots to Solana
- Automatic failover to backup instance
- State recovery from Solana if needed

**Backend Services:**

- Kubernetes cluster with auto-scaling
- Redis cluster for session state
- PostgreSQL with read replicas
- Load balancer with health checks

**Client Deployment:**

- Web: Vercel/Netlify with CDN
- Mobile: App Store and Google Play
- Progressive Web App support

### Monitoring and Observability

- Application logs aggregated in Datadog/CloudWatch
- Distributed tracing with OpenTelemetry
- Real-time dashboards for key metrics
- On-call rotation for critical alerts

### Disaster Recovery

- Database backups every 6 hours
- Point-in-time recovery capability
- Solana state as source of truth for finances
- Documented recovery procedures
- Regular disaster recovery drills
