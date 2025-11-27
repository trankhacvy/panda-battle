# Panda Breeding Logic - Implementation Guide

## Overview

The panda breeding logic has been implemented as a core Solana smart contract system for the Bamboo Panda Battles game. This system allows players to:

1. **Forge new pandas** - Create generation-0 pandas with custom traits
2. **Initiate breeding** - Start a breeding session between two compatible pandas
3. **Complete breeding** - Finalize breeding and create offspring with inherited traits

## Quick Start

### Building the Program

```bash
cd program

# Build with Anchor
anchor build

# Run tests
anchor test
```

### Program Structure

```
programs/panda-battle/src/
├── lib.rs                    # Main program entry point
├── constants.rs              # Economic parameters and constraints
├── error.rs                  # Custom error codes
├── utils.rs                  # Utility functions (trait inheritance, validation)
├── state/
│   ├── mod.rs
│   ├── panda.rs             # PandaNFT account structure
│   └── breeding.rs          # BreedingSession account structure
└── instructions/
    ├── mod.rs
    ├── initialize.rs        # Program initialization
    ├── forge_panda.rs       # Create new panda instruction
    ├── start_breeding.rs    # Initiate breeding instruction
    └── complete_breeding.rs # Finalize breeding instruction
```

## Core Features

### 1. Panda State (`PandaNFT`)

Comprehensive panda account containing:
- **Identity**: mint, owner, name
- **Traits**: type (bamboo/red/giant/snow), rarity, attack/defense/speed/intellect (0-100)
- **Colors**: RGB palette for visual representation
- **Lineage**: parent references, generation tracking, breed count
- **Breeding Status**: cooldown timers, lock status
- **Battle Stats**: wins, losses, damage tracking
- **Metadata**: creation time, URI for off-chain data

**PDA Seed:** `["panda_metadata", panda_mint]`

### 2. Breeding Session (`BreedingSession`)

Temporary account managing active breeding:
- **Participants**: player, male parent, female parent
- **Status**: Active/Complete/Cancelled
- **Constraints**: 48-hour timeout, Bamboo token cost
- **Offspring**: Reference to created offspring mint

**PDA Seed:** `["breeding_session", breeding_id]`

### 3. Forge Panda Instruction

Create a brand-new panda (generation 0) with specified traits.

```rust
forge_panda(
    name: String,              // 1-20 chars, alphanumeric + spaces
    panda_type: PandaType,     // bamboo | red | giant | snow
    attack: u8,                // 1-100
    defense: u8,               // 1-100
    speed: u8,                 // 1-100
    intellect: u8,             // 1-100
    primary_color: [u8; 3],    // RGB
    secondary_color: [u8; 3],  // RGB
    accent_color: [u8; 3],     // RGB
)
```

**Emits:** `PandaForged` event

**Validation:**
- Name length and characters
- All stats in range [1, 100]

**Computed Fields:**
- `base_hp = 100 + (attack * 0.2) + (defense * 0.3)` (capped at 150)
- `rarity` determined from average stat value
- `generation = 0` (first generation)

### 4. Start Breeding Instruction

Initiate a breeding session between two compatible pandas.

```rust
start_breeding(breeding_id: [u8; 32])
```

**Requirements:**
- Player owns both parent pandas
- Parents are different pandas
- Both parents unlocked
- Both parents past breeding cooldown (7 days)
- Both parents: `breed_count < 5`
- Both parents: `generation < 10`

**Side Effects:**
- Creates BreedingSession (expires in 48 hours)
- Locks both parent pandas
- Emits `BreedingStarted` event

**Error Cases:**
- `NotPandaOwner`: Doesn't own parent
- `SamePandaBreeding`: Parent is same panda
- `PandaLocked`: Parent already breeding
- `CooldownViolation`: Breeding cooldown active
- `MaxBreedCountReached`: Parent bred 5+ times
- `MaxGenerationReached`: Generation >= 10

### 5. Complete Breeding Instruction

Finalize breeding and create offspring.

```rust
complete_breeding(
    offspring_name: String,     // 1-20 chars
    offspring_rarity_boost: u8  // 0-10 (% boost)
)
```

**Trait Inheritance Algorithm:**

1. **Average parent stats:**
   ```
   avg_attack = (male_attack + female_attack) / 2
   ```

2. **Apply mutation (±5 variance):**
   ```
   mutated_attack = avg_attack ± (0-5 random)
   ```

3. **Apply rarity boost (capped at 10%):**
   ```
   final_attack = mutated_attack * (1 + boost/100)
   final_attack = min(final_attack, 100)
   ```

4. **Color blending:**
   ```
   offspring_primary[i] = (male_primary[i] + female_primary[i]) / 2
   ```

5. **Generation tracking:**
   ```
   offspring.generation = max(male.generation, female.generation) + 1
   ```

**Side Effects:**
- Creates offspring PandaNFT
- Updates parent breed counts
- Sets parent cooldown to 7 days
- Unlocks parent pandas
- Completes BreedingSession
- Emits `OffspringCreated` event

**Error Cases:**
- `BreedingSessionExpired`: Session past 48 hours
- `BreedingSessionComplete`: Already finalized
- `ParentMintMismatch`: Parent doesn't match session
- `InvalidPandaName`: Offspring name invalid

## Economic Parameters

All defined in `src/constants.rs`:

```rust
// Token Costs (in smallest Bamboo units, 8 decimals)
FORGE_PANDA_COST = 100_000_000       // 100 Bamboo
BREEDING_COST = 50_000_000          // 50 Bamboo
OFFSPRING_MINT_COST = 25_000_000    // 25 Bamboo

// Breeding Cooldowns
PANDA_BREEDING_COOLDOWN = 604800     // 7 days (seconds)
BREEDING_SESSION_TIMEOUT = 172800    // 48 hours (seconds)

// Supply Constraints
MAX_PANDAS_PER_PLAYER = 100
MAX_TOTAL_PANDAS = 10_000
MAX_GENERATIONS = 10
MAX_BREED_COUNT = 5
```

## Error Handling

Comprehensive error codes in `src/error.rs`:

### Panda Errors
- `PandaNotFound` - Panda account missing
- `NotPandaOwner` - Not the panda owner
- `PandaLocked` - Panda in breeding session

### Breeding Errors
- `InvalidBreedingPair` - Incompatible parents
- `CooldownViolation` - Breeding cooldown active
- `SamePandaBreeding` - Attempting self-breed
- `MaxBreedCountReached` - Parent bred 5+ times
- `MaxGenerationReached` - Generation cap hit
- `BreedingSessionNotFound` - Session missing
- `BreedingSessionExpired` - Session timed out
- `BreedingSessionComplete` - Already finalized
- `ParentMintMismatch` - Parent doesn't match

### Supply Errors
- `PandasPerPlayerLimitReached` - Player at limit
- `TotalSupplyCapReached` - Global cap hit
- `GenerationCapReached` - Generation limit

### Token Errors
- `InsufficientFunds` - Not enough Bamboo
- `TokenTransferFailed` - SPL transfer failed
- `InvalidTokenAccount` - Bad token account

### Validation Errors
- `InvalidPandaName` - Name length/chars
- `InvalidStatValue` - Stat outside 1-100
- `TraitInheritanceFailed` - Calculation error

## Events

Three main events emitted by the program:

### PandaForged
```rust
#[event]
pub struct PandaForged {
    pub panda_mint: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub panda_type: PandaType,
    pub rarity: Rarity,
    pub timestamp: i64,
}
```

### BreedingStarted
```rust
#[event]
pub struct BreedingStarted {
    pub breeding_id: [u8; 32],
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,
    pub player: Pubkey,
    pub timestamp: i64,
}
```

### OffspringCreated
```rust
#[event]
pub struct OffspringCreated {
    pub breeding_id: [u8; 32],
    pub offspring_mint: Pubkey,
    pub offspring_name: String,
    pub parent_male_mint: Pubkey,
    pub parent_female_mint: Pubkey,
    pub offspring_generation: u8,
    pub owner: Pubkey,
    pub timestamp: i64,
}
```

## Utility Functions

### Trait Inheritance
```rust
pub fn inherit_traits(
    parent_male_attack: u8,
    parent_male_defense: u8,
    // ... other stats ...
) -> Result<(u8, u8, u8, u8)>
```

Averages parent stats and applies ±5 mutation variance.

### Base HP Calculation
```rust
pub fn calculate_base_hp(attack: u8, defense: u8) -> u16
```

Formula: `100 + (attack * 0.2) + (defense * 0.3)`, capped at 150.

### Validation Functions
```rust
pub fn validate_panda_name(name: &str) -> Result<()>
pub fn validate_stats(attack: u8, defense: u8, speed: u8, intellect: u8) -> Result<()>
```

### Session ID Generation
```rust
pub fn generate_breeding_session_id(
    player: &Pubkey,
    parent_male: &Pubkey,
    parent_female: &Pubkey,
    timestamp: i64,
) -> [u8; 32]
```

Deterministically creates breeding session ID to avoid collisions.

## Testing

Comprehensive test suite in `tests/panda-battle.ts`:

### Test Categories

1. **Panda Creation**
   - Forge panda with valid stats
   - Reject invalid names
   - Reject invalid stats

2. **Breeding Logic**
   - Initialize breeding session
   - Reject cooldown violations
   - Create offspring with inherited traits
   - Update parent stats

3. **Constraints**
   - Generation limits
   - Breed count limits
   - Session timeouts
   - Panda locking

4. **Error Handling**
   - Authorization checks
   - State validation
   - Session expiration

5. **Events**
   - PandaForged event structure
   - BreedingStarted event structure
   - OffspringCreated event structure

6. **Utilities**
   - HP calculation
   - Rarity determination
   - Name validation
   - Stat validation

### Running Tests

```bash
cd program
anchor test
```

## Frontend Integration

### Event Listeners

```typescript
// Subscribe to panda creation
program.addEventListener('PandaForged', (event) => {
  console.log(`New panda: ${event.name}`);
  updateUI(event);
});

// Subscribe to breeding start
program.addEventListener('BreedingStarted', (event) => {
  lockPandas(event.parent_male_mint, event.parent_female_mint);
  showBreedingTimer(event.breeding_id);
});

// Subscribe to offspring creation
program.addEventListener('OffspringCreated', (event) => {
  addOffspringToCollection(event.offspring_mint);
  showBreedingSuccess(event);
});
```

### Transaction Building

```typescript
// Forge a panda
const tx = await program.methods
  .forgePanda(
    name,
    pandaType,
    attack,
    defense,
    speed,
    intellect,
    primaryColor,
    secondaryColor,
    accentColor
  )
  .accounts({
    player: wallet.publicKey,
    pandaMetadata: pandaMetadataPDA,
    pandaMint: pandaMint,
    // ... other accounts
  })
  .signers([wallet])
  .rpc();

// Start breeding
const tx = await program.methods
  .startBreeding(breedingId)
  .accounts({
    player: wallet.publicKey,
    parentMale: parentMalePDA,
    parentFemale: parentFemalePDA,
    // ... other accounts
  })
  .signers([wallet])
  .rpc();

// Complete breeding
const tx = await program.methods
  .completeBreeding(offspringName, rarityBoost)
  .accounts({
    player: wallet.publicKey,
    breedingSession: breedingSessionPDA,
    offspring: offspringPDA,
    // ... other accounts
  })
  .signers([wallet])
  .rpc();
```

## Documentation

Detailed documentation available:

- **[PANDA_BREEDING_IMPLEMENTATION.md](./docs/PANDA_BREEDING_IMPLEMENTATION.md)** - Complete technical specification
- **[SOLANA_CONTRACTS.md](./docs/SOLANA_CONTRACTS.md)** - Architecture overview
- **[MOCK_DATA.md](./docs/MOCK_DATA.md)** - Data structure definitions
- **[UI_SPECS.md](./docs/UI_SPECS.md)** - Frontend specification

## Deployment Flow

1. **Local Testing:**
   ```bash
   anchor test
   ```

2. **Devnet Deployment:**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

3. **Testnet Deployment:**
   ```bash
   anchor deploy --provider.cluster testnet
   ```

4. **Mainnet Deployment:**
   - Security audit required
   - Multisig governance setup
   - Mainnet launch

## Key Design Decisions

1. **Trait Inheritance:** Average stats + ±5 mutation creates natural variation while preserving parent quality
2. **Breeding Cooldown:** 7-day cooldown prevents spam breeding and encourages collection diversity
3. **Generation Limits:** Cap at 10 generations prevents trait degradation
4. **Breed Count Limits:** Max 5 breeds per panda maintains genetic diversity
5. **PDAs:** Use program-derived addresses for deterministic account derivation
6. **Events:** Structured events enable real-time UI updates via event listeners

## Future Enhancements

1. **Cross-Type Hybrids:** Allow breeding between different panda types
2. **Genetic Traits:** Carry genetic markers across generations
3. **Breeding Economy:** Marketplace for breeding services
4. **Dynamic Cooldowns:** Reduce cooldown based on player level/reputation
5. **Trait Combinations:** Special bonuses for rare parent combinations
6. **Breeding Guilds:** Shared breeding pools with governance

## Acceptance Criteria Met

- ✅ Panda-related state and instructions compile
- ✅ Breeding flows enforce documented rules (cooldowns, lineage, costs)
- ✅ Instructions emit structured events usable by UI layer
- ✅ Trait inheritance with randomization implemented
- ✅ Custom errors for all failure cases
- ✅ Constants for economic parameters
- ✅ Comprehensive test suite with multiple scenarios
- ✅ Documentation cross-referenced with architecture docs
