# Solana Smart Contracts - Panda Battle

This directory contains the Solana smart contracts for the Bamboo Panda Battles on-chain implementation.

## Project Structure

```
program/
├── programs/
│   └── panda-battle/              # Main program
│       └── src/
│           ├── lib.rs             # Program entry point
│           ├── constants.rs        # Game constants and limits
│           ├── error.rs            # Error codes
│           ├── instructions/       # Instruction handlers
│           │   ├── mod.rs
│           │   ├── initialize.rs
│           │   ├── initialize_player.rs
│           │   ├── update_progress.rs
│           │   └── record_activity.rs
│           └── state/              # Account state definitions
│               ├── mod.rs
│               ├── player_profile.rs
│               └── player_progress.rs
├── tests/                          # Integration tests
│   ├── panda-battle.ts
│   └── player.ts
├── Anchor.toml                     # Anchor configuration
└── Cargo.toml                      # Workspace dependencies
```

## Building

Ensure you have:
- Rust 1.75+ (via `rustup`)
- Anchor 0.31.0 (via `npm install -g @coral-xyz/anchor-cli`)
- Solana CLI 1.18+

Build the program:

```bash
cd program
anchor build
```

## Testing

Run all tests:

```bash
cd program
anchor test
```

Run specific test file:

```bash
cd program
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/player.ts
```

## Player Account System

### Overview

The player account system provides on-chain state management for player profiles and progress tracking.

### Core Accounts

#### PlayerProfile (PDA)

**Seed:** `["player_profile", player_pubkey]`

Stores immutable and game-critical player data:
- Player identity and authority
- Overall statistics (wins/losses, rating, XP)
- Inventory tracking (pandas owned, active panda)
- Account metadata (creation date, version)

**Space:** ~1000 bytes
**Authority:** Player wallet

#### PlayerProgress (PDA)

**Seed:** `["player_progress", player_pubkey]`

Tracks dynamic progress and activity:
- Battle statistics (win streaks, total battles)
- Forge cooldowns
- Daily activity limits (battles, forges)
- Activity XP earning

**Space:** ~300 bytes
**Authority:** Player wallet

### Instructions

#### 1. initialize_player

Creates a new player profile on-chain.

**Parameters:**
- `name` (String): Player's display name (1-20 chars)

**Accounts:**
- `signer`: Transaction signer (must match player wallet)
- `player_profile`: PDA for player profile
- `player_progress`: PDA for player progress
- `system_program`: SPL System Program

**Effects:**
- Creates PlayerProfile with starting rating (1200)
- Creates PlayerProgress with reset timestamps
- Emits `PlayerInitialized` event

**Errors:**
- `PlayerAlreadyInitialized`: Profile already exists
- `InvalidNameLength`: Name is empty or > 20 chars

#### 2. update_progress

Updates player stats after a battle.

**Parameters:**
- `update`: ProgressUpdate struct
  - `battle_won` (bool): Win/loss result
  - `xp_earned` (u64): Base XP from battle
  - `rating_delta` (i32): Elo rating change

**Accounts:**
- `signer`: Transaction signer
- `player_profile`: Player profile account
- `player_progress`: Player progress account

**Effects:**
- Updates win/loss counts
- Applies rating change (clamped to 1000-3000)
- Updates XP and level
- Resets win streak on loss
- Emits `ProgressUpdated` event

**Errors:**
- `UnauthorizedProfileModification`: Not player's wallet
- `PlayerBanned`: Player account is banned
- `InvalidRating`: Rating outside acceptable range

#### 3. record_activity

Records player activities (forge, achievement, etc.).

**Parameters:**
- `activity`: ActivityRecord struct
  - `activity_type` (ActivityType): Type of activity
  - `xp_earned` (u64): XP from activity

**Accounts:**
- `signer`: Transaction signer
- `player_progress`: Player progress account

**Effects:**
- Tracks daily forge counts
- Enforces forge cooldown
- Updates activity timestamps
- Emits `ActivityRecorded` event

**Errors:**
- `UnauthorizedProfileModification`: Not player's wallet
- `ForgeCooldownActive`: Forge cooldown not expired
- `DailyForgeLimit`: Exceeded max forges per day

## Configuration

### Game Constants

Edit `src/constants.rs` to configure:

- **FORGE_COOLDOWN_SECONDS**: Default forge cooldown (3600 = 1 hour)
- **MAX_DAILY_BATTLES**: Maximum battles per day (50)
- **MAX_DAILY_FORGES**: Maximum forges per day (10)
- **MIN_RATING**: Minimum player rating (1000)
- **MAX_RATING**: Maximum player rating (3000)
- **STARTING_RATING**: Initial rating for new players (1200)
- **ELO_K_FACTOR**: Rating change sensitivity (32)

### Anchor Configuration

Edit `Anchor.toml` for:

- **cluster**: Network (localnet, devnet, testnet, mainnet)
- **provider.wallet**: Keypair path for deployments
- **programs.localnet**: Program ID mapping

## Deployment

### Local Development (Localnet)

```bash
# Start local validator
solana-test-validator

# In another terminal
cd program
anchor test
```

### Devnet

```bash
anchor deploy --provider.cluster devnet
```

### Mainnet (requires multisig)

```bash
anchor deploy --provider.cluster mainnet-beta
```

## Events

### PlayerInitialized

```rust
pub struct PlayerInitialized {
    pub player: Pubkey,
    pub name: String,
    pub timestamp: i64,
}
```

### ProgressUpdated

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

### ActivityRecorded

```rust
pub struct ActivityRecorded {
    pub player: Pubkey,
    pub activity_type: ActivityType,
    pub xp_earned: u64,
    pub timestamp: i64,
}
```

## Integration with Frontend

### Transaction Building Example

```typescript
import * as anchor from "@coral-xyz/anchor";
const program = anchor.workspace.pandaBattle;

// Initialize player
const tx = await program.methods
  .initializePlayer("MyPanda")
  .accounts({
    signer: wallet.publicKey,
    playerProfile: playerProfilePda,
    playerProgress: playerProgressPda,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
```

### Event Subscription

```typescript
program.addEventListener("PlayerInitialized", (event) => {
  console.log("Player created:", event.player.toString());
});
```

## Documentation

For detailed contract architecture and design, see:
- `/docs/SOLANA_CONTRACTS.md` - Complete contract specifications
- `/docs/MOCK_DATA.md` - Data structure examples
- `/docs/SYSTEM_DESIGN.md` - System architecture
