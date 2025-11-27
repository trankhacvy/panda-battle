# Battle Engine Implementation

## Overview

The Bamboo Panda Battles battle engine is a Solana smart contract program built with Anchor 0.31.0 that manages turn-based battle mechanics for panda NFTs. This document outlines the implementation details of the core battle system.

## Architecture

### Program Structure

```
program/programs/panda-battle/src/
├── lib.rs                  # Main program entry point
├── constants.rs            # Battle constants and game parameters
├── error.rs                # Error codes for battle validation
├── events.rs               # Event definitions for analytics
├── utils.rs                # Damage calculation and AI logic
├── state/
│   ├── mod.rs
│   ├── battle.rs           # BattleState, BattleStatus, MoveType
│   ├── queue.rs            # BattleQueue, QueuedPlayer
│   └── record.rs           # BattleRecord for history/analytics
└── instructions/
    ├── mod.rs
    ├── initialize.rs       # Program initialization (stub)
    ├── init_queue.rs       # Initialize battle queue for season
    ├── enqueue.rs          # Queue player for matchmaking
    ├── start_battle.rs     # Start battle between 2 queued players
    ├── submit_turn.rs      # Submit move and update battle state
    └── resolve_battle.rs   # End battle and store results
```

## Account Models

### BattleState Account

**PDA Seed:** `["battle_state", battle_id]`  
**Size:** 4096 bytes  
**Mutability:** Updated during each turn until battle ends

Stores active battle data:
- Participants (player and opponent pubkeys, panda mints)
- Current HP for both pandas
- Turn counter and max turns
- Move cooldown tracking (special moves have 2-turn cooldown)
- Turn log (vector of TurnOutcome)
- Battle seed for deterministic randomness
- Rewards (winner/loser bamboo amounts, rating delta)

### BattleQueue Account

**PDA Seed:** `["battle_queue", season]`  
**Size:** ~10KB (supports ~200 concurrent queued players)  
**Mutability:** Updated when players enqueue/dequeue

Maintains season-based matchmaking pool:
- List of QueuedPlayer entries (player pubkey, panda mint, stake amount, timestamp)
- Season number and creation timestamp
- Version for future schema migrations

### BattleRecord Account

**PDA Seed:** `["battle_record", battle_id]`  
**Size:** ~500 bytes  
**Mutability:** Written once after battle resolution

Stores immutable battle history for analytics:
- Both participants and their pandas
- Battle outcome (winner, status)
- Ratings delta for both players
- Total turns and damage statistics
- Timestamps

## Instructions

### 1. enqueue_for_battle

**Purpose:** Register player and panda for matchmaking

**Parameters:**
- `stake_amount: u64` - SOL or Bamboo tokens staked

**Validation:**
- Stake meets minimum requirement (1000 lamports)
- Player not already in queue (prevents double entry)
- Panda mint is valid

**Effects:**
- Adds player to BattleQueue
- Emits `BattleEnqueued` event

**Guards:** Double entry prevention via loop check

### 2. start_battle

**Purpose:** Match two queued players and initialize battle

**Parameters:**
- `battle_id: [u8; 32]` - Unique identifier for battle
- `player1_hp: u16` - Starting HP for player 1
- `player2_hp: u16` - Starting HP for player 2

**Validation:**
- At least 2 players in queue
- Valid HP values (within 100-150 range)

**Effects:**
- Pops first 2 players from queue
- Creates BattleState account
- Initializes battle seed (deterministic, derived from battle_id)
- Emits `BattleStarted` event

**Key Design:** Battle seed is deterministic to enable replay-protected, deterministic outcomes

### 3. submit_turn

**Purpose:** Player submits move; opponent AI move generated; damage calculated

**Parameters:**
- `player_move: u8` - Move type (0=Attack, 1=Defend, 2=Technique, 3=Special)

**Validation:**
- Battle is InProgress
- Player is participant
- Move is valid (0-3)
- Special move not on cooldown

**Mechanics:**
1. Validate move legality
2. Generate opponent move deterministically from battle seed
3. Calculate damage using:
   - Base damage by move type
   - Attribute bonuses
   - Variance from seed (-10% to +10%)
   - Defense reduction (50% if opponent defends)
4. Apply damage to both pandas (using saturating_sub to prevent underflow)
5. Update cooldowns
6. Record TurnOutcome in turn_log
7. Increment turn counter
8. Check win conditions:
   - If either HP = 0: battle ends
   - If turn count >= max_turns: draw condition

**Effects:**
- Updates BattleState HP and turn counter
- Adds entry to turn_log
- Emits `TurnSubmitted` event

### 4. resolve_battle

**Purpose:** Finalize completed battle and record results

**Parameters:** None (uses BattleState)

**Validation:**
- Battle status is not InProgress

**Effects:**
- Creates BattleRecord with battle outcome
- Calculates rating deltas using Elo formula (K=32)
- Aggregates damage statistics from turn log
- Emits `BattleResolved` event

**Rating Delta Calculation:**
```
Expected Score = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
RatingDelta = 32 * (Actual - Expected)
```

## Move System

### Move Types

1. **Attack** (0)
   - Base Damage: 20
   - Cooldown: 0
   - Scales with: Attack attribute
   - Use case: Standard damage

2. **Defend** (1)
   - Base Damage: 0
   - Cooldown: 0
   - Scales with: Defense attribute
   - Effect: Reduces incoming damage by 50%
   - Use case: Reduce damage on next turn

3. **Technique** (2)
   - Base Damage: 30
   - Cooldown: 0
   - Scales with: Speed attribute
   - Use case: Medium damage alternative

4. **Special** (3)
   - Base Damage: 50
   - Cooldown: 2 turns
   - Scales with: Intellect attribute
   - Use case: High-risk, high-reward move

### Damage Formula

```
baseDamage = move_base_damage[move_type]
attributeBonus = (attribute / 100) * (baseDamage / 2)
variance = random(-10%, +10%) [deterministic from seed]
totalDamage = floor((baseDamage + attributeBonus) * (1 + variance))
if opponent_move == Defend:
    totalDamage = floor(totalDamage * 0.5)
```

## Deterministic AI & Randomness

The opponent's move is generated deterministically based on:
1. Battle seed (derived from battle_id)
2. Current turn number
3. Current HP values
4. Cooldown states

**AI Strategy:**
- 25% chance to use Special (if available)
- More likely to Defend if low HP (<40%)
- Otherwise: Attack or Technique with equal probability

This ensures:
- Reproducible battles for replay
- No external randomness dependency
- Replay protection via unique battle_id

## Constants

```rust
MAX_TURNS_PER_BATTLE = 10
INITIAL_HP_BASE = 100
INITIAL_HP_MAX = 150
SPECIAL_MOVE_COOLDOWN = 2 turns
MIN_STAKE_AMOUNT = 1000 lamports
WINNER_REWARD_BAMBOO = 50000 tokens
LOSER_REWARD_BAMBOO = 10000 tokens
QUEUE_SEASON_LENGTH_SECONDS = 3600 (1 hour)
PLAYER_BATTLE_COOLDOWN_SECONDS = 60 (1 minute)
```

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| InvalidBattleState | Invalid battle state | Battle in unexpected state |
| PlayerNotInQueue | Player not in queue | Player lookup failed |
| PandaNotEligible | Panda not eligible | Panda validation failed |
| InsufficientStake | Insufficient stake | Below MIN_STAKE_AMOUNT |
| DoubleEntry | Player already in queue | Duplicate queue entry |
| BattleOnCooldown | Player on battle cooldown | Too soon after last battle |
| InvalidMove | Invalid move selection | Move type out of range |
| MoveOnCooldown | Move is on cooldown | Special move just used |
| InvalidBattleId | Invalid battle ID | Malformed ID |
| BattleNotInProgress | Battle not in progress | Battle already ended |
| BattleAlreadyCompleted | Battle already completed | Redundant completion |
| Unauthorized | Not authorized | Wrong signer |
| QueueNotFound | Queue not found | Season queue missing |
| BattleRecordNotFound | Battle record not found | Record lookup failed |
| InvalidOpponent | Invalid opponent | Bad opponent reference |
| MaxTurnsReached | Maximum turns reached | Draw condition |
| QueueFull | Battle already has both players | Queue capacity |
| NotEnoughPlayersInQueue | Need at least 2 players | Insufficient matchmaking |

## Events

### BattleEnqueued
```rust
{
    player_pubkey: Pubkey,
    panda_mint: Pubkey,
    stake_amount: u64,
    timestamp: i64,
}
```

### BattleStarted
```rust
{
    battle_id: [u8; 32],
    player1_pubkey: Pubkey,
    player1_panda: Pubkey,
    player2_pubkey: Pubkey,
    player2_panda: Pubkey,
    timestamp: i64,
}
```

### TurnSubmitted
```rust
{
    battle_id: [u8; 32],
    turn_number: u32,
    player_move: u8,
    opponent_move: u8,
    player_damage: u16,
    opponent_damage: u16,
    player_hp: u16,
    opponent_hp: u16,
    timestamp: i64,
}
```

### BattleResolved
```rust
{
    battle_id: [u8; 32],
    winner_pubkey: Pubkey,
    winner_reward: u64,
    loser_reward: u64,
    player_rating_delta: i32,
    opponent_rating_delta: i32,
    total_turns: u32,
    timestamp: i64,
}
```

### BattleForfeited
```rust
{
    battle_id: [u8; 32],
    forfeiter_pubkey: Pubkey,
    winner_pubkey: Pubkey,
    timestamp: i64,
}
```

## Testing

Run tests from the `program/` directory:

```bash
cd program/
pnpm install
pnpm exec anchor test
```

### Test Coverage

1. **Initialization**
   - Program init succeeds
   - Queue init succeeds

2. **Queueing**
   - Player 1 enqueues
   - Double entry prevented
   - Player 2 enqueues
   - Queue has both players

3. **Battle Start**
   - Battle state created
   - Queue emptied
   - Initial HP set correctly
   - Status is InProgress

4. **Turn Submission**
   - Valid moves process
   - Turn log populated
   - Damage calculated
   - HP updated

5. **Validation**
   - Invalid moves rejected
   - Unauthorized access prevented
   - Cooldowns enforced
   - HP capped at 0 (no negative)

6. **Resolution**
   - Battle record created
   - Winner determined
   - Rewards calculated
   - Ratings delta computed

## Future Enhancements

1. **Token Staking:**
   - SPL token transfers for stakes
   - Reward distribution via token account transfers

2. **Panda Stats Integration:**
   - Load actual panda stats from PandaFactory
   - Scale base damage by panda type/rarity

3. **Player Rating:**
   - Fetch actual player Elo from PlayerRegistry
   - Update ratings after battle resolution

4. **Advanced AI:**
   - Machine learning-based opponent strategy
   - Adaptive difficulty scaling

5. **Battle Events UI:**
   - Subscribe to events for real-time turn animations
   - Leaderboard data aggregation

6. **Replay System:**
   - Store compressed turn log
   - Deterministic replay of battles
   - Verification of reported scores

## Integration Points

### With PlayerRegistry
- Fetch player current rating
- Update player stats (wins/losses)
- Check player cooldown

### With PandaFactory
- Load panda base stats
- Load panda type/rarity
- Update panda battle history

### With RewardVault
- Distribute Bamboo token rewards
- Update seasonal reward pools
- Track treasury usage

## Security Considerations

1. **Replay Protection:**
   - Unique battle_id prevents re-execution
   - Battle seed immutable after creation
   - Turn outcomes append-only

2. **State Transitions:**
   - Battles start in InProgress
   - Only valid moves allowed
   - Winner determination ensures one end state

3. **Arithmetic Safety:**
   - HP uses saturating_sub (no underflow)
   - Damage calculations checked
   - Cooldown counters guarded

4. **Authorization:**
   - Only active participants can submit turns
   - Only battle authority can resolve
   - Signer verification enforced

## Performance Notes

- Turn submission: ~500-1000 compute units
- Battle state: 4096 bytes (well within account limits)
- Turn log: Supports 10+ turns (max ~1000 bytes)
- PDA derivation: O(1) using seeds

## Compliance with Documentation

This implementation aligns with:
- **SOLANA_CONTRACTS.md**: Section 3.3 (BattleEngine Program)
- **MOCK_DATA.md**: Battle turn mechanics and damage formulas
- **UI_SPECS.md**: Move types and battle display data
- **System Design**: Game balance and state management

All battle state machines, instruction guards, and outcome logic follow the documented specifications for on-chain determinism and replay prevention.
