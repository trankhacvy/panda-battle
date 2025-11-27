# Solana Smart Contracts Architecture
## Bamboo Panda Battles On-Chain Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Program Modules](#program-modules)
4. [Account Schemas](#account-schemas)
5. [Program-Derived Addresses (PDAs)](#program-derived-addresses-pdas)
6. [Instruction Specifications](#instruction-specifications)
7. [State Flows & Diagrams](#state-flows--diagrams)
8. [Cross-Program Interactions](#cross-program-interactions)
9. [Error Handling & Events](#error-handling--events)
10. [Security Considerations](#security-considerations)
11. [Upgrade & Authority Strategy](#upgrade--authority-strategy)
12. [Testing Philosophy](#testing-philosophy)
13. [Integration with Frontend](#integration-with-frontend)

---

## Executive Summary

Bamboo Panda Battles is transitioning from a mock UI-only MVP to a blockchain-enabled ecosystem with on-chain state management, asset ownership, and tokenized rewards. This document outlines the complete Solana smart contract architecture, including program design, account models, instruction flows, and security considerations.

### Key Components

- **PlayerRegistry Program**: Manages user profiles, stats, and on-chain identity
- **PandaFactory Program**: Mints and manages Panda NFTs with trait metadata
- **BattleEngine Program**: Resolves turn-based battles and calculates outcomes
- **RewardVault Program**: Distributes Bamboo tokens and manages treasury
- **Bamboo Token**: SPL Token for in-game rewards and marketplace transactions

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Runtime** | Solana (Devnet → Testnet → Mainnet) | High throughput, low fees |
| **Framework** | Anchor 0.31.0 | Type safety, simplified CPI, IDL generation |
| **Language** | Rust | Performance, memory safety |
| **NFT Standard** | SPL Token + Metaplex Metadata | Composable, marketplace compatible |
| **Token Standard** | SPL Token | Interoperable, widely supported |

---

## Architecture Overview

### System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        Solana Blockchain                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Program Cluster (Authority-Controlled)     │   │
│  │  ┌───────────────┐  ┌───────────────┐             │   │
│  │  │PlayerRegistry │  │ PandaFactory  │             │   │
│  │  │   Program     │  │   Program     │             │   │
│  │  └───────────────┘  └───────────────┘             │   │
│  │  ┌───────────────┐  ┌───────────────┐             │   │
│  │  │ BattleEngine  │  │ RewardVault   │             │   │
│  │  │   Program     │  │   Program     │             │   │
│  │  └───────────────┘  └───────────────┘             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                    (Cross-Program Calls)                    │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              State Accounts (PDAs)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │PlayerProfile │  │  Panda NFT   │               │   │
│  │  │   Accounts   │  │  Mint/Account│               │   │
│  │  └──────────────┘  └──────────────┘               │   │
│  │  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │ Battle State │  │PlayerVault   │               │   │
│  │  │   Accounts   │  │  (Token ATA) │               │   │
│  │  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Token Accounts (SPL Standard)              │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ Bamboo Token Mint + Associated Token Acct.  │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
         ▲                                           ▲
         │                                           │
    ┌────┴────────────────────────────────────────────────┐
    │          Next.js Frontend Application               │
    │  ┌────────────────────────────────────────────┐   │
    │  │ Transaction Builder & RPC Client           │   │
    │  │ - Wallet: Phantom, Glow, etc.             │   │
    │  │ - Simulate & Execute Transactions         │   │
    │  │ - Subscribe to Account Changes            │   │
    │  └────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────┘
```

### Data Flow Example: Battle Outcome

```
Player selects Move
    ↓
Frontend calls BattleEngine::submit_turn
    ↓
    ├─ Validate: player owns panda, battle is active
    ├─ Calculate damage (on-chain)
    ├─ Update BattleState PDA
    ├─ CPI to PlayerRegistry: fetch opponent stats (read-only)
    ├─ Check if battle is over
    │
    └─ If battle complete:
        ├─ CPI to RewardVault: distribute rewards
        ├─ Update PlayerProfile: stats delta
        ├─ Transfer Bamboo tokens
        └─ Emit Battle Completed event
    ↓
Frontend listens for event
    ↓
Update local UI with result
```

---

## Program Modules

### 1. PlayerRegistry Program

**Program Address (Example):** `PReg1111111111111111111111111111111111111111`

**Purpose:** Manages player profiles, statistics, and on-chain identity. Acts as the "player database" for Bamboo Panda Battles.

**Responsibilities:**
- Create/initialize player profiles (first-time onboarding)
- Store and update player statistics (wins, losses, rating)
- Track player inventory (pandas owned, items)
- Manage player authority and signing permissions
- Query player stats for leaderboard and battle matchmaking

**Key Instructions:**
```rust
pub mod player_registry {
    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()>
    pub fn update_player_stats(ctx: Context<UpdatePlayerStats>, stats_delta: StatsDelta) -> Result<()>
    pub fn set_active_panda(ctx: Context<SetActivePanda>, panda_mint: Pubkey) -> Result<()>
    pub fn get_player_stats(player: Pubkey) -> Result<PlayerStats>
    pub fn transfer_player_authority(ctx: Context<TransferAuthority>) -> Result<()>
}
```

---

### 2. PandaFactory Program

**Program Address (Example):** `PndaF11111111111111111111111111111111111111`

**Purpose:** Mints and manages Panda NFTs with trait metadata. Integrates with Metaplex Metadata Program for standard NFT compatibility.

**Responsibilities:**
- Mint new Panda NFTs with unique traits
- Generate and store trait metadata (on-chain and off-chain)
- Manage trait randomization (VRF integration via ephemeral-vrf-sdk)
- Track panda ownership and transfer rights
- Support secondary marketplace transactions (future)

**Key Instructions:**
```rust
pub mod panda_factory {
    pub fn forge_panda(ctx: Context<ForgePanda>, panda_data: PandaTraits) -> Result<()>
    pub fn randomize_traits(ctx: Context<RandomizeTraits>, seed: [u8; 32]) -> Result<()>
    pub fn transfer_panda(ctx: Context<TransferPanda>, recipient: Pubkey) -> Result<()>
    pub fn burn_panda(ctx: Context<BurnPanda>) -> Result<()>
}
```

---

### 3. BattleEngine Program

**Program Address (Example):** `Battl1111111111111111111111111111111111111111`

**Purpose:** Resolves turn-based battles with on-chain damage calculation and outcome determination.

**Responsibilities:**
- Initialize and manage battle state
- Validate move selections and cooldowns
- Calculate damage based on panda stats and RNG
- Update battle state after each turn
- Determine winner and trigger reward distribution
- Maintain battle history and replay data

**Key Instructions:**
```rust
pub mod battle_engine {
    pub fn initiate_battle(ctx: Context<InitiateBattle>, opponent_panda: Pubkey) -> Result<()>
    pub fn submit_turn(ctx: Context<SubmitTurn>, move_type: MoveType) -> Result<()>
    pub fn resolve_battle(ctx: Context<ResolveBattle>) -> Result<()>
    pub fn forfeit_battle(ctx: Context<ForfeitBattle>) -> Result<()>
}
```

---

### 4. RewardVault Program

**Program Address (Example):** `Rewrd11111111111111111111111111111111111111`

**Purpose:** Manages token rewards, treasury, and distributes Bamboo tokens to winners and seasonal rewards.

**Responsibilities:**
- Hold and distribute Bamboo tokens
- Calculate and distribute battle rewards
- Manage treasury and price feeds
- Handle seasonal reward pools
- Support staking and yield generation (future)

**Key Instructions:**
```rust
pub mod reward_vault {
    pub fn distribute_battle_rewards(ctx: Context<DistributeRewards>, amount: u64) -> Result<()>
    pub fn claim_seasonal_rewards(ctx: Context<ClaimSeasonalRewards>) -> Result<()>
    pub fn deposit_treasury(ctx: Context<DepositTreasury>, amount: u64) -> Result<()>
    pub fn set_reward_schedule(ctx: Context<SetRewardSchedule>, schedule: RewardSchedule) -> Result<()>
}
```

---

## Account Schemas

### 1. PlayerProfile Account

**PDA Seed:** `["player_profile", player_pubkey]`  
**Authority:** Player wallet  
**Size:** ~512 bytes

```rust
#[account]
pub struct PlayerProfile {
    // Identity & Auth
    pub player_pubkey: Pubkey,           // [32] Player's wallet
    pub bump: u8,                         // [1] PDA bump seed
    pub authority: Pubkey,                // [32] Authority signer (usually = player)
    
    // Profile Data
    pub name: String,                     // [4 + 20] Max 20 chars
    pub avatar_url: String,               // [4 + 256] IPFS/CDN URL
    pub bio: String,                      // [4 + 160] Max 160 chars
    pub region: Option<String>,           // [1 + 4 + 64] Optional region tag
    
    // Statistics (Updated after each battle)
    pub total_wins: u32,                  // [4] Lifetime wins
    pub total_losses: u32,                // [4] Lifetime losses
    pub current_rating: i32,              // [4] Current Elo rating (1000-3000)
    pub peak_rating: i32,                 // [4] Highest rating achieved
    
    // Inventory
    pub active_panda_mint: Option<Pubkey>, // [1 + 32] Current battle panda NFT mint
    pub pandas_owned: u32,                 // [4] Count of panda NFTs owned
    pub total_bamboo_earned: u64,         // [8] Lifetime Bamboo tokens earned
    pub total_bamboo_spent: u64,          // [8] Lifetime Bamboo tokens spent
    
    // Timestamps
    pub created_at: i64,                  // [8] Unix timestamp (account creation)
    pub last_battle_at: i64,              // [8] Unix timestamp (last battle)
    pub updated_at: i64,                  // [8] Last profile update
    
    // Flags & Versioning
    pub version: u8,                      // [1] Account schema version
    pub is_banned: bool,                  // [1] Suspension flag
}
```

**Invariants:**
- `total_wins >= 0`, `total_losses >= 0`
- `current_rating` in range `[1000, 3000]`
- `peak_rating >= current_rating`
- `created_at <= updated_at`

---

### 2. Panda Account (NFT Metadata)

**PDA Seed:** `["panda_metadata", panda_mint_pubkey]`  
**Authority:** Player wallet (owner of NFT)  
**Size:** ~1024 bytes

```rust
#[account]
pub struct PandaMetadata {
    // Mint Reference
    pub panda_mint: Pubkey,               // [32] SPL Token mint account
    pub owner: Pubkey,                    // [32] Current owner's wallet
    pub bump: u8,                         // [1] PDA bump seed
    
    // Core Traits
    pub panda_type: PandaType,            // [1] bamboo | red | giant | snow
    pub name: String,                     // [4 + 20] Max 20 chars
    pub rarity: Rarity,                   // [1] common | rare | epic | legendary
    
    // Attributes (0-100 each)
    pub attack: u8,                       // [1]
    pub defense: u8,                      // [1]
    pub speed: u8,                        // [1]
    pub intellect: u8,                    // [1]
    pub base_hp: u16,                     // [2] 100-150
    
    // Color Palette
    pub primary_color: [u8; 3],           // [3] RGB
    pub secondary_color: [u8; 3],         // [3] RGB
    pub accent_color: [u8; 3],            // [3] RGB
    
    // Battle Statistics
    pub level: u8,                        // [1] 1-20 (derived from wins)
    pub total_wins: u32,                  // [4] Panda-specific wins
    pub total_losses: u32,                // [4] Panda-specific losses
    pub total_damage_dealt: u64,          // [8] Career damage
    pub total_damage_taken: u64,          // [8] Career damage received
    pub highest_hp_reached: u16,          // [2] Peak HP in single battle
    
    // Metadata & History
    pub created_at: i64,                  // [8] Mint timestamp
    pub last_battle_at: i64,              // [8] Last battle timestamp
    pub uri: String,                      // [4 + 256] Arweave/IPFS URI
    
    // Flags
    pub is_locked: bool,                  // [1] Can't be transferred (battle lock)
    pub version: u8,                      // [1] Metadata schema version
}
```

**Enums:**
```rust
#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum PandaType {
    Bamboo,  // #000000, balanced
    Red,     // #D32F2F, high attack
    Giant,   // #8D6E63, high defense
    Snow,    // #81C784, high intellect
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum Rarity {
    Common,    // Common stats (1-100)
    Rare,      // 25% boost
    Epic,      // 50% boost
    Legendary, // 100% boost
}
```

---

### 3. BattleState Account

**PDA Seed:** `["battle_state", battle_id]`  
**Authority:** BattleEngine Program  
**Size:** ~4096 bytes (dynamic, grows with turns)

```rust
#[account]
pub struct BattleState {
    // Battle Identity
    pub battle_id: [u8; 32],              // [32] Unique battle identifier (hash)
    pub bump: u8,                         // [1] PDA bump seed
    
    // Participants
    pub player_pubkey: Pubkey,            // [32] Player wallet
    pub player_panda_mint: Pubkey,        // [32] Player's panda NFT mint
    pub opponent_panda_mint: Pubkey,      // [32] Opponent panda mint
    
    // Battle State
    pub status: BattleStatus,             // [1] in_progress | player_won | opponent_won | forfeit
    pub current_turn: u32,                // [4] Turn number (0-indexed)
    pub max_turns: u32,                   // [4] Battle duration limit (e.g., 10)
    
    // HP Tracking
    pub player_current_hp: u16,           // [2] Player panda current HP
    pub opponent_current_hp: u16,         // [2] Opponent panda current HP
    pub player_base_hp: u16,              // [2] Starting HP
    pub opponent_base_hp: u16,            // [2] Starting HP
    
    // Move Cooldowns
    pub player_special_cooldown: u32,     // [4] Turns remaining for special move
    pub opponent_special_cooldown: u32,   // [4] Turns remaining for special move
    
    // Turn History (Vec of turn outcomes)
    pub turn_log: Vec<TurnOutcome>,       // Dynamic, ~100 bytes per turn
    
    // Rewards (populated when battle ends)
    pub winner_reward_bamboo: u64,        // [8] Tokens for winner
    pub loser_reward_bamboo: u64,         // [8] Tokens for loser (if enabled)
    pub rating_delta: i32,                // [4] Elo points delta
    
    // Timestamps
    pub created_at: i64,                  // [8] Battle start
    pub ended_at: i64,                    // [8] Battle end (0 if in-progress)
    pub version: u8,                      // [1] Account schema version
}

pub struct TurnOutcome {
    pub turn_number: u32,                 // [4]
    pub player_move: MoveType,            // [1]
    pub opponent_move: MoveType,          // [1]
    pub player_damage_dealt: u16,         // [2]
    pub opponent_damage_dealt: u16,       // [2]
    pub effects_applied: u8,              // [1] Bitmask: critical_hit | defend_active | etc.
    pub player_hp_after: u16,             // [2]
    pub opponent_hp_after: u16,           // [2]
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum BattleStatus {
    InProgress,  // Battle ongoing
    PlayerWon,   // Player panda won
    OpponentWon, // Opponent panda won
    Forfeit,     // One player forfeited
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum MoveType {
    Attack,     // Standard damage (cooldown: 0)
    Defend,     // Reduce damage by 50% (cooldown: 0)
    Technique,  // Medium damage + speed bonus (cooldown: 0)
    Special,    // High damage + intellect bonus (cooldown: 2)
}
```

**Size Calculation:**
```
Fixed fields: ~500 bytes
Turn log (worst case, 10 turns): ~1000 bytes
Total: ~1500 bytes
Increased to 4096 for safety margin
```

---

### 4. PlayerVault Account

**Account Type:** Associated Token Account (ATA)  
**Token Mint:** Bamboo Token SPL Mint  
**Owner:** Player's wallet  
**Purpose:** Holds player's Bamboo token balance

```rust
// Standard SPL Token Account structure
// Created via Associated Token Program
// Path: [player_wallet, token_program, bamboo_token_mint]
```

---

### 5. Treasury Account

**PDA Seed:** `["treasury", program_id]`  
**Authority:** Program signer (upgrade authority)  
**Account Type:** Associated Token Account (ATA)  
**Purpose:** Holds vault reserves for reward distribution

```rust
#[account]
pub struct TreasuryConfig {
    pub vault_ata: Pubkey,                // [32] ATA for Bamboo tokens
    pub authority: Pubkey,                // [32] Program upgrade authority
    pub bump: u8,                         // [1] PDA bump seed
    pub total_distributed: u64,           // [8] Lifetime rewards distributed
    pub total_deposited: u64,             // [8] Lifetime tokens deposited
}
```

---

## Program-Derived Addresses (PDAs)

PDAs are deterministic accounts derived from seeds, eliminating the need for separate private keys while maintaining security through program authority checks.

### PDA Seed Specifications

| Account Type | Seed Components | Program | Authority | Writable |
|--------------|-----------------|---------|-----------|----------|
| **PlayerProfile** | `["player_profile", player_pubkey]` | PlayerRegistry | Player | Yes (only player) |
| **PandaMetadata** | `["panda_metadata", panda_mint]` | PandaFactory | Program | Yes (only on update) |
| **BattleState** | `["battle_state", battle_id]` | BattleEngine | Program | Yes (during battle) |
| **Treasury** | `["treasury"]` | RewardVault | Authority | Yes (only authority) |
| **PlayerVault** | SPL ATA standard | Token Program | Player | Yes (for transfers) |

### PDA Generation Examples

```rust
// PlayerProfile PDA
let (player_profile_pda, bump) = Pubkey::find_program_address(
    &[b"player_profile", player_pubkey.as_ref()],
    &player_registry_program_id,
);

// PandaMetadata PDA
let (panda_metadata_pda, bump) = Pubkey::find_program_address(
    &[b"panda_metadata", panda_mint.as_ref()],
    &panda_factory_program_id,
);

// BattleState PDA
let battle_id = hash(&[player_panda, opponent_panda, timestamp]);
let (battle_state_pda, bump) = Pubkey::find_program_address(
    &[b"battle_state", battle_id.as_ref()],
    &battle_engine_program_id,
);
```

### Authority & Signature Model

```
┌─ Player (Signer: Private Key)
│
├─ Owns: PlayerProfile PDA (derived address)
│  └─ Authority check: signer == player_pubkey in PlayerProfile
│
├─ Owns: Panda NFT (SPL Token)
│  └─ Authority check: token.owner == player_wallet
│
├─ Initiates: BattleState PDA (program-controlled)
│  └─ Authority check: BattleEngine validates player_pubkey, not modifiable by player
│
└─ Holds: PlayerVault ATA (SPL Token Account)
   └─ Authority check: ata.owner == player_wallet

┌─ Program Authority (Signer: Program PDA)
│
├─ Controls: Program upgrade
├─ Signs: CPI calls between programs
├─ Manages: Treasury account
└─ Authority check: ctx.accounts.authority.key() == stored_authority
```

---

## Instruction Specifications

### Phase 1 Instructions (MVP)

#### 1. PlayerRegistry::InitializePlayer

**Purpose:** Onboard new player and create PlayerProfile PDA  
**Signers Required:** Player wallet  
**Accounts Required:**
```rust
#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + std::mem::size_of::<PlayerProfile>(),
        seeds = [b"player_profile", player.key().as_ref()],
        bump,
    )]
    pub player_profile: Account<'info, PlayerProfile>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

**Parameters:**
```rust
pub fn initialize_player(
    ctx: Context<InitializePlayer>,
    name: String,
    avatar_url: String,
) -> Result<()> { }
```

**State Changes:**
- Creates new PlayerProfile PDA with:
  - `name`: Validated (1-20 chars)
  - `avatar_url`: Stored for frontend rendering
  - `total_wins`: 0
  - `total_losses`: 0
  - `current_rating`: 1200 (default starter rating)
  - `created_at`: Current block time

**Validation:**
```
✓ name is 1-20 characters
✓ avatar_url is valid UTF-8 and ≤256 chars
✓ player is signer
✓ Player doesn't already have profile
```

**Error Cases:**
```
InvalidName: Name outside 1-20 char range
InvalidAvatarUrl: URL exceeds 256 characters
PlayerAlreadyInitialized: Profile exists for this player
```

---

## Testing Philosophy

### Anchor Test Framework

The project uses Anchor's built-in testing framework with BanksClient for transaction simulation on Devnet.

```bash
# Run all tests
anchor test

# Run specific test file
anchor test --run unit/test_player.rs

# Run with specific network
anchor test --provider.cluster devnet
```

### Test Organization

```
program/tests/
├── unit/
│  ├── test_player.rs
│  ├── test_panda.rs
│  ├── test_battle.rs
│  └── test_rewards.rs
├── integration/
│  ├── test_full_game_flow.rs
│  ├── test_cross_program_calls.rs
│  └── test_error_handling.rs
└── fixtures/
   ├── player_fixtures.rs
   └── panda_fixtures.rs
```

### Testing Best Practices

1. **Isolated Unit Tests**: Test individual functions and state transitions
2. **Integration Tests**: Verify cross-program calls and CPI flows
3. **End-to-End Tests**: Simulate complete user journeys (onboarding → battle → rewards)
4. **Property-Based Tests**: Use quickcheck for randomized invariant verification
5. **Security Tests**: Verify authorization checks and error conditions

---

## Integration with Frontend

### Transaction Builder Pattern

The Next.js frontend uses `@coral-xyz/anchor` to build and sign transactions:

```typescript
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";

async function initializePlayer(playerName: string, avatarUrl: string) {
    const provider = new AnchorProvider(connection, wallet);
    const program = new Program(IDL, PROGRAM_ID, provider);
    
    const [playerProfilePda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("player_profile"), provider.publicKey.toBuffer()],
        PROGRAM_ID,
    );
    
    const tx = await program.methods
        .initializePlayer(playerName, avatarUrl)
        .accounts({
            playerProfile: playerProfilePda,
            player: provider.publicKey,
            systemProgram: SystemProgram.programId,
        })
        .rpc();
    
    return tx;
}
```

### Event Subscription

The frontend subscribes to on-chain events for real-time updates:

```typescript
program.addEventListener("BattleResolved", (event) => {
    console.log("Battle completed with winner:", event.winner);
    updateUI(event);
});
```

### State Queries

Read-only queries for leaderboard and player stats:

```typescript
async function getLeaderboard(limit: number = 100) {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
            { dataSize: 8 + PlayerProfile.SIZE },
        ],
    });
    
    return accounts
        .map(({ account }) => PlayerProfile.deserialize(account.data))
        .sort((a, b) => b.current_rating - a.current_rating)
        .slice(0, limit);
}
```

---

## Deployment Strategy

### Devnet (Development)
- Deploy with single-signer upgrade authority
- Test all programs and integrations
- Run full test suite (100% coverage)

### Testnet (Staging)
- Deploy with 3-of-5 multisig upgrade authority
- Community testing and feedback
- Performance benchmarking
- Security audit preparation

### Mainnet (Production)
- Immutable programs (no future upgrades without new deployment)
- Multisig: 3-of-5 signers (core team + DAO + auditor)
- 72-hour governance voting before any changes
- Comprehensive monitoring and alerting

---

## Security Model

### Key Security Principles

1. **Authority Verification**: All state-modifying operations verify signer authority
2. **Account Derivation**: PDAs provide deterministic, unforgeable account identification
3. **CPI Safety**: Cross-program calls verify expected program ownership
4. **Rent Exemption**: All accounts funded to remain rent-exempt
5. **Integer Safety**: Use checked arithmetic for all stat calculations
6. **Replay Prevention**: Battle states are single-use and immutable once resolved

### Audit Checklist

- [ ] All authority checks verified
- [ ] Integer overflow handling complete
- [ ] CPI calls properly validated
- [ ] No hardcoded addresses (except program IDs)
- [ ] Error codes documented
- [ ] Event emissions complete
- [ ] Gas optimization verified
- [ ] External audit completed

---

## Panda Breeding System (Phase 1 Implementation)

The panda breeding logic has been fully implemented in the PandaFactory program with comprehensive support for genetic trait inheritance, breeding constraints, and economic parameters. For detailed implementation documentation, refer to [PANDA_BREEDING_IMPLEMENTATION.md](./PANDA_BREEDING_IMPLEMENTATION.md).

### Key Breeding Features

1. **Three Core Instructions:**
   - `forge_panda`: Create generation-0 pandas with custom traits
   - `start_breeding`: Initiate breeding session between two compatible parents
   - `complete_breeding`: Finalize breeding and create offspring with inherited traits

2. **Trait Inheritance Algorithm:**
   - Parents' stats averaged
   - ±5 mutation variance applied
   - Optional rarity boost (0-10%)
   - Color blending from both parents
   - Generation tracking for lineage

3. **Breeding Constraints:**
   - 7-day cooldown between breedings
   - Maximum 5 breedings per panda
   - Maximum 10 generations allowed
   - 48-hour session timeout
   - Pandas locked during breeding

4. **Economic Model:**
   - Forge cost: 100 Bamboo tokens
   - Breeding cost: 50 Bamboo tokens
   - Offspring mint cost: 25 Bamboo tokens
   - Supply caps: 100 pandas/player, 10,000 total

5. **Events for UI Integration:**
   - `PandaForged`: New panda creation
   - `BreedingStarted`: Breeding session initiated
   - `OffspringCreated`: Offspring birth with full lineage tracking

### Testing Coverage

Comprehensive test suite covering:
- Panda creation with trait validation
- Breeding session management
- Constraint enforcement (cooldowns, generation limits, breed counts)
- Trait inheritance accuracy
- Error handling for all failure modes
- Event emission verification
- Utility function validation

See `program/tests/panda-battle.ts` for full test implementation.

---

## Conclusion

This architecture provides a secure, scalable foundation for Bamboo Panda Battles' on-chain future. With the complete panda breeding system implemented in Phase 1, players can now create, breed, and manage digital panda collections on-chain. The modular program design enables independent upgrades and third-party integrations via public IDL. By leveraging Solana's speed and low fees with Anchor's safety, the game delivers seamless Web3 integration while maintaining robust security through careful account authority management and comprehensive testing.

---

**Document Version:** 1.0  
**Status:** Ready for Phase 1 Implementation  
**Last Updated:** November 2024
