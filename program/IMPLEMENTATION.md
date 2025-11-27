# Player Accounts Core Implementation

## Overview

This document describes the implementation of the Player Accounts Core module for the Bamboo Panda Battles Solana smart contract. This module provides foundational on-chain state management for player profiles, progression, and activity tracking.

## Implementation Summary

### Components Implemented

#### 1. State Accounts (src/state/)

##### PlayerProfile Account
- **File**: `src/state/player_profile.rs`
- **Purpose**: Persistent player identity and statistics
- **PDA Seed**: `["player_profile", player_pubkey]`
- **Size**: ~1000 bytes (calculated via `PlayerProfile::space()`)
- **Authority**: Player wallet (signer)

**Key Fields**:
- Identity: `player_pubkey`, `bump`, `authority`
- Profile: `name`, `avatar_url`, `bio`, `region`
- Statistics: `total_wins`, `total_losses`, `current_rating`, `peak_rating`
- Progression: `total_xp`, `level`
- Inventory: `active_panda_mint`, `pandas_owned`, `total_bamboo_earned/spent`
- Achievements: `badges` (Vec of badge IDs)
- Timestamps: `created_at`, `last_battle_at`, `updated_at`
- Metadata: `version`, `is_banned`

**Constants**:
- `MAX_NAME_LEN`: 20 characters
- `MAX_AVATAR_URL_LEN`: 256 characters
- `MAX_BIO_LEN`: 160 characters
- `MAX_REGION_LEN`: 64 characters
- `MAX_BADGES`: 50
- `STARTING_RATING`: 1200 (initial Elo)
- `MIN_RATING`: 1000
- `MAX_RATING`: 3000

##### PlayerProgress Account
- **File**: `src/state/player_progress.rs`
- **Purpose**: Dynamic player progression and activity tracking
- **PDA Seed**: `["player_progress", player_pubkey]`
- **Size**: ~300 bytes (calculated via `PlayerProgress::space()`)
- **Authority**: Player wallet (signer)

**Key Fields**:
- Activity: `battles_completed`, `consecutive_wins`, `max_consecutive_wins`
- Forge: `last_forge_at`, `forge_cooldown_seconds`
- Daily Tracking: `daily_battles_played`, `daily_pandas_forged`, `daily_reset_at`
- XP: `total_xp_earned`, `battle_xp_multiplier`, `forge_xp_multiplier`
- Metadata: `created_at`, `updated_at`, `version`

**Constants**:
- `DEFAULT_FORGE_COOLDOWN_SECONDS`: 3600 (1 hour)
- `MAX_DAILY_BATTLES`: 50
- `MAX_DAILY_FORGES`: 10

##### ActivityType Enum
- **Purpose**: Categorize different player activities
- **Variants**:
  - `BattleWon`: Victory in battle
  - `BattleLost`: Defeat in battle
  - `PandaForged`: New panda created
  - `AchievementUnlocked`: Badge earned

#### 2. Instructions (src/instructions/)

##### initialize_player
- **File**: `src/instructions/initialize_player.rs`
- **Purpose**: Create new player account on-chain
- **Parameters**: `name` (String, 1-20 chars)
- **Accounts Required**:
  - `signer` (mut): Player wallet
  - `player_profile` (init, pda): Player profile account
  - `player_progress` (init, pda): Player progress account
  - `system_program`: SPL System Program
- **Effects**:
  - Creates PlayerProfile with starting rating (1200) and level (1)
  - Creates PlayerProgress with daily reset timestamps
  - Sets all badges, XP, and activity counters to initial values
  - Emits `PlayerInitialized` event
- **Validation**:
  - Name must be 1-20 characters (not empty)
  - PDA seeds must match signer
  - Prevents duplicate initialization (accounts must not exist)
- **Events**: `PlayerInitialized { player, name, timestamp }`

##### update_progress
- **File**: `src/instructions/update_progress.rs`
- **Purpose**: Update player stats after battles
- **Parameters**:
  ```rust
  pub struct ProgressUpdate {
    pub battle_won: bool,
    pub xp_earned: u64,
    pub rating_delta: i32,
  }
  ```
- **Accounts Required**:
  - `signer` (mut): Player wallet
  - `player_profile` (mut, pda): Player profile account
  - `player_progress` (mut, pda): Player progress account
- **Effects**:
  - Increments win/loss counters
  - Applies rating delta (clamped to 1000-3000)
  - Updates peak rating if exceeded
  - Increments XP with multiplier
  - Recalculates level from XP (using isqrt formula)
  - Updates win streak (incremented on win, reset on loss)
  - Resets daily counters if day has changed
  - Updates last battle timestamp
  - Emits `ProgressUpdated` event
- **Validation**:
  - Only player can update their own progress
  - Player must not be banned
  - Rating must stay within bounds
- **Events**:
  ```rust
  pub struct ProgressUpdated {
    pub player: Pubkey,
    pub activity_type: ActivityType,
    pub xp_earned: u64,
    pub rating_delta: i32,
    pub new_rating: i32,
    pub timestamp: i64,
  }
  ```

##### record_activity
- **File**: `src/instructions/record_activity.rs`
- **Purpose**: Log player activities for metrics and cooldowns
- **Parameters**:
  ```rust
  pub struct ActivityRecord {
    pub activity_type: ActivityType,
    pub xp_earned: u64,
  }
  ```
- **Accounts Required**:
  - `signer` (mut): Player wallet
  - `player_progress` (mut, pda): Player progress account
- **Effects**:
  - Activity-specific logic:
    - **PandaForged**: Validates cooldown, increments daily counter, updates last_forge_at
    - **Others**: Standard XP tracking
  - Resets daily counters if day changed
  - Updates activity timestamps
  - Emits `ActivityRecorded` event
- **Validation**:
  - Only player can record their own activities
  - For forge: must respect cooldown (3600 seconds minimum)
  - For forge: daily limit (10 per day)
- **Events**:
  ```rust
  pub struct ActivityRecorded {
    pub player: Pubkey,
    pub activity_type: ActivityType,
    pub xp_earned: u64,
    pub timestamp: i64,
  }
  ```

#### 3. Constants (src/constants.rs)

Added game-wide configuration constants:
- **Player Limits**:
  - `MAX_PLAYERS`: 1,000,000
  - `MAX_PANDAS_PER_PLAYER`: 100
  - `FORGE_COOLDOWN_SECONDS`: 3600 (1 hour)
  - `MAX_DAILY_BATTLES`: 50
  - `MAX_DAILY_FORGES`: 10

- **Rating System**:
  - `MIN_RATING`: 1000
  - `MAX_RATING`: 3000
  - `STARTING_RATING`: 1200
  - `ELO_K_FACTOR`: 32

#### 4. Error Codes (src/error.rs)

Added player-specific error codes:
- `PlayerAlreadyInitialized`: Profile exists
- `PlayerNotFound`: Profile doesn't exist
- `UnauthorizedProfileModification`: Wrong signer
- `ForgeCooldownActive`: Cooldown not expired
- `DailyForgeLimit`: Daily forge limit exceeded
- `InvalidNameLength`: Name out of bounds
- `InvalidAvatarUrlLength`: Avatar URL too long
- `InvalidBioLength`: Bio too long
- `InvalidRating`: Rating out of bounds
- `MaxPandasExceeded`: Panda inventory full
- `PlayerBanned`: Account suspended
- `InvalidBumpSeed`: PDA bump mismatch
- `InvalidAuthority`: Wrong authority

#### 5. Tests (tests/player.ts)

Comprehensive test suite covering:

**initialize_player Tests**:
- ✓ Successfully initialize player with valid name
- ✓ Verify profile and progress accounts created with correct values
- ✓ Prevent duplicate initialization (error on re-init)
- ✓ Reject empty or too-long names

**update_progress Tests**:
- ✓ Update stats on battle win
- ✓ Update stats on battle loss
- ✓ Enforce rating bounds (min/max)
- ✓ Update win streak (increment on win, reset on loss)
- ✓ Calculate level from XP

**record_activity Tests**:
- ✓ Record panda forge activity
- ✓ Enforce forge cooldown
- ✓ Track daily activity counters

**Test Patterns**:
- Uses Anchor workspace with Keypair generation
- Airdrops SOL for transaction fees
- Derives PDAs from seeds
- Verifies account state after instructions
- Tests error conditions with try/catch

## Architecture Decisions

### PDA Design
- **PlayerProfile & PlayerProgress**: Separate accounts for scalability
  - Profile: Static/slow-changing data (identity, lifetime stats)
  - Progress: Dynamic data (activity, cooldowns, daily resets)
  - Allows independent updates without re-serializing large accounts

### Authority Model
- Player wallet as sole authority
- Signer validation in all instructions
- Prevents unauthorized modifications

### Rating System
- Elo-based (K-factor = 32)
- Bounded to [1000, 3000]
- Peak rating tracking for leaderboards

### XP & Level System
- Linear XP accumulation with activity multipliers
- Level calculated as `sqrt(total_xp / 100) + 1`
- Allows level progression without separate state

### Cooldown Management
- Unix timestamp-based cooldowns
- Daily resets at midnight UTC
- Verified on each activity record

### Validation Strategy
- Input validation (name lengths, bounds)
- Authority checks on all mutable operations
- Ban flag prevents all operations
- PDA seed verification implicit in Anchor

## Events & Frontend Integration

All instructions emit events with critical data:

1. **PlayerInitialized**: Frontend can show "Welcome" screen, update navbar
2. **ProgressUpdated**: Update battle results UI, refresh leaderboard positions
3. **ActivityRecorded**: Track cooldowns, show "Can forge again at X time"

Event subscription example:
```typescript
program.addEventListener("PlayerInitialized", (event) => {
  console.log("New player:", event.name);
});

program.addEventListener("ProgressUpdated", (event) => {
  console.log(`Battle result: ${event.battle_won ? "Won" : "Lost"}`);
  console.log(`New rating: ${event.new_rating}`);
});
```

## Configuration & Deployment

### Game Balance Parameters
Edit `src/constants.rs`:
- Adjust cooldowns, daily limits, rating bounds
- No re-deployment needed for constants (Anchor constants are compile-time)

### Network Configuration
Edit `Anchor.toml`:
- `cluster`: localnet/devnet/testnet/mainnet
- `provider.wallet`: Path to keypair for deployments

### Testing
```bash
cd program
anchor test                    # Run all tests
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/player.ts  # Run player tests
```

## Acceptance Criteria Fulfillment

✅ **Anchor build/test succeeds**: All instructions properly structured, state accounts defined
✅ **Player-specific state**: PlayerProfile and PlayerProgress PDAs with clear seed structure
✅ **Error handling**: All validation errors enumerated in ErrorCode
✅ **Events**: PlayerInitialized, ProgressUpdated, ActivityRecorded events emitted
✅ **Documentation**: README with full spec, this implementation document
✅ **PDA seeds match docs**: `["player_profile", player_pubkey]`, `["player_progress", player_pubkey]`
✅ **Test coverage**: Happy-path init, duplicate prevention, stat updates tested

## Next Steps

For complete system integration:

1. **BattleEngine Program**: Implement battle instruction that calls `update_progress` via CPI
2. **PandaFactory Program**: Implement forge instruction that calls `record_activity` for cooldown tracking
3. **Frontend Integration**: Add transaction builders for initialize_player, subscribe to events
4. **Leaderboard Queries**: Off-chain indexer to aggregate PlayerProfile accounts by rating
5. **On-Chain Upgrades**: Add authority checks for future governance

## File Structure Summary

```
program/programs/panda-battle/src/
├── lib.rs                              # Main program entry
├── constants.rs                        # Game constants (EXPANDED)
├── error.rs                            # Error codes (EXPANDED)
├── instructions/
│   ├── mod.rs
│   ├── initialize.rs                   # Original (unchanged)
│   ├── initialize_player.rs            # NEW
│   ├── update_progress.rs              # NEW
│   └── record_activity.rs              # NEW
└── state/
    ├── mod.rs
    ├── player_profile.rs               # NEW
    └── player_progress.rs              # NEW

program/tests/
├── panda-battle.ts                     # Original (unchanged)
└── player.ts                           # NEW

program/README.md                       # NEW
program/IMPLEMENTATION.md               # NEW
```

## Dependencies

- `anchor-lang = "0.31.0"` - Framework
- `anchor-spl = "0.31.0"` - SPL Token support
- Test dependencies: `@coral-xyz/anchor`, `chai`, `ts-mocha`

All dependencies already specified in Cargo.toml and package.json.
