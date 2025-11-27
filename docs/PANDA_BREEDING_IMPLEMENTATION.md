# Panda Breeding Logic Implementation

## Overview

This document details the on-chain implementation of panda breeding mechanics for Bamboo Panda Battles, including state structures, instructions, constraints, and trait inheritance algorithms.

---

## State Structures

### 1. PandaNFT Account

Stores complete metadata for a panda NFT, including traits, lineage, and breeding status.

**PDA Seed:** `["panda_metadata", panda_mint_pubkey]`

```rust
#[account]
pub struct PandaNFT {
    // Mint Reference
    pub panda_mint: Pubkey,                // [32] SPL Token mint account
    pub owner: Pubkey,                     // [32] Current owner's wallet
    pub bump: u8,                          // [1] PDA bump seed

    // Core Traits
    pub panda_type: PandaType,             // [1] bamboo | red | giant | snow
    pub name: String,                      // [4 + 20] Max 20 chars
    pub rarity: Rarity,                    // [1] common | rare | epic | legendary

    // Attributes (0-100 each)
    pub attack: u8,                        // [1]
    pub defense: u8,                       // [1]
    pub speed: u8,                         // [1]
    pub intellect: u8,                     // [1]
    pub base_hp: u16,                      // [2] 100-150

    // Color Palette
    pub primary_color: [u8; 3],            // [3] RGB
    pub secondary_color: [u8; 3],          // [3] RGB
    pub accent_color: [u8; 3],             // [3] RGB

    // Battle Statistics
    pub level: u8,                         // [1] 1-20
    pub total_wins: u32,                   // [4]
    pub total_losses: u32,                 // [4]
    pub total_damage_dealt: u64,           // [8]
    pub total_damage_taken: u64,           // [8]
    pub highest_hp_reached: u16,           // [2]

    // Lineage
    pub parent_male: Option<Pubkey>,       // [33] Father panda mint (or None for generation 0)
    pub parent_female: Option<Pubkey>,     // [33] Mother panda mint (or None for generation 0)
    pub generation: u8,                    // [1] Generation 0 (forged), 1+ (bred)
    pub breed_count: u8,                   // [1] Number of times this panda has bred

    // Breeding Cooldown
    pub last_bred_at: i64,                 // [8] Unix timestamp of last breeding
    pub breeding_cooldown_ends: i64,       // [8] Unix timestamp when breeding is available

    // Metadata & History
    pub created_at: i64,                   // [8] Mint timestamp
    pub last_battle_at: i64,               // [8] Last battle timestamp
    pub uri: String,                       // [4 + 256] Arweave/IPFS URI

    // Flags
    pub is_locked: bool,                   // [1] Locked during active breeding
    pub version: u8,                       // [1] Metadata schema version
}
```

**Enums:**
```rust
#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum PandaType {
    Bamboo,
    Red,
    Giant,
    Snow,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum Rarity {
    Common,    // Average stats 1-35
    Rare,      // Average stats 36-60
    Epic,      // Average stats 61-85
    Legendary, // Average stats 86-100
}
```

**Key Methods:**
- `is_breeding_ready(current_time)`: Checks if breeding cooldown has expired
- `calculate_rarity(stats)`: Determines rarity from average stat value
- `get_rarity_color()`: Returns hex color string for rarity UI display

---

### 2. BreedingSession Account

Manages state for an active breeding session between two pandas.

**PDA Seed:** `["breeding_session", breeding_id]`

```rust
#[account]
pub struct BreedingSession {
    // Session Identity
    pub breeding_id: [u8; 32],             // [32] Unique session identifier
    pub bump: u8,                          // [1] PDA bump seed

    // Participants
    pub player_pubkey: Pubkey,             // [32] Player initiating breeding
    pub parent_male_mint: Pubkey,          // [32] Male parent panda mint
    pub parent_female_mint: Pubkey,        // [32] Female parent panda mint

    // Offspring Info
    pub offspring_mint: Option<Pubkey>,    // [33] Created offspring mint (None until completion)
    pub offspring_created_at: Option<i64>, // [9] Offspring creation timestamp

    // Session State
    pub status: BreedingStatus,            // [1] active | complete | cancelled
    pub started_at: i64,                   // [8] Breeding start time
    pub expires_at: i64,                   // [8] Session expiration (48 hours)
    pub completed_at: Option<i64>,         // [9] Breeding completion time

    // Economic Data
    pub bamboo_cost: u64,                  // [8] Bamboo tokens required
    pub bamboo_paid: bool,                 // [1] Payment status

    // Version
    pub version: u8,                       // [1] Schema version
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize)]
pub enum BreedingStatus {
    Active,
    Complete,
    Cancelled,
}
```

**Key Methods:**
- `is_expired(current_time)`: Checks if session has timed out
- `can_complete(current_time)`: Checks if breeding can be finalized

---

## Instructions

### 1. forge_panda

Creates a new panda from scratch without breeding parents.

**Instruction Parameters:**
```rust
pub fn forge_panda(
    ctx: Context<ForgePanda>,
    name: String,                      // Max 20 alphanumeric + spaces
    panda_type: PandaType,            // bamboo | red | giant | snow
    attack: u8,                        // 1-100
    defense: u8,                       // 1-100
    speed: u8,                         // 1-100
    intellect: u8,                     // 1-100
    primary_color: [u8; 3],           // RGB color values
    secondary_color: [u8; 3],         // RGB color values
    accent_color: [u8; 3],            // RGB color values
) -> Result<()>
```

**Validation:**
- Panda name must be 1-20 characters, alphanumeric + spaces
- All stats must be 1-100
- Colors must be valid RGB values

**Side Effects:**
- Creates new PandaNFT account (generation 0)
- Base HP calculated: `100 + (attack * 0.2) + (defense * 0.3)`
- Rarity determined from average stat value
- Emits `PandaForged` event

**Error Cases:**
- `InvalidPandaName`: Name length or characters invalid
- `InvalidStatValue`: Stats outside 1-100 range
- `InvalidTokenAccount`: Player token account invalid

**Event:**
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

---

### 2. start_breeding

Initiates a breeding session between two compatible pandas owned by the same player.

**Instruction Parameters:**
```rust
pub fn start_breeding(
    ctx: Context<StartBreeding>,
    breeding_id: [u8; 32],  // Deterministic hash of session details
) -> Result<()>
```

**Validation:**
- Player owns both parent pandas
- Parent pandas are different (not same mint)
- Both pandas are unlocked
- Both pandas have passed breeding cooldown
- Parent male: `breed_count < 5`
- Parent female: `breed_count < 5`
- Parent male: `generation < 10`
- Parent female: `generation < 10`

**Side Effects:**
- Creates new BreedingSession account with status = Active
- Locks both parent pandas (`is_locked = true`)
- Session expires in 48 hours
- Emits `BreedingStarted` event

**Error Cases:**
- `NotPandaOwner`: Player doesn't own a parent panda
- `SamePandaBreeding`: Trying to breed panda with itself
- `PandaLocked`: Parent already in breeding session
- `CooldownViolation`: Parent breeding cooldown not yet passed
- `MaxBreedCountReached`: Parent has bred maximum times (5)
- `MaxGenerationReached`: Parent generation at cap (10)

**Event:**
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

---

### 3. complete_breeding

Finalizes a breeding session and creates offspring panda.

**Instruction Parameters:**
```rust
pub fn complete_breeding(
    ctx: Context<CompleteBreeding>,
    offspring_name: String,            // Max 20 alphanumeric + spaces
    offspring_rarity_boost: u8,        // 0-10 (% bonus)
) -> Result<()>
```

**Validation:**
- Breeding session exists and is active
- Session has not expired
- Parent mints match session records
- Player ownership verified
- Offspring name valid (1-20 chars, alphanumeric + spaces)

**Trait Inheritance Algorithm:**

1. **Average Parent Stats:**
   ```
   avg_attack = (parent_male.attack + parent_female.attack) / 2
   avg_defense = (parent_male.defense + parent_female.defense) / 2
   avg_speed = (parent_male.speed + parent_female.speed) / 2
   avg_intellect = (parent_male.intellect + parent_female.intellect) / 2
   ```

2. **Apply Mutation (±5 variance):**
   ```
   stat = apply_mutation(avg_stat, variance=5)
   Result: stat ± 0-5 points (random)
   ```

3. **Apply Rarity Boost (capped at 10%):**
   ```
   boost_factor = ((offspring_rarity_boost.min(10) * 100) + 1000) / 1000
   final_stat = (avg_stat * boost_factor).min(100)
   ```

4. **Color Blending:**
   ```
   offspring_primary = [(parent_male_primary[i] + parent_female_primary[i]) / 2 for i in 0..3]
   // Same for secondary and accent colors
   ```

5. **Lineage Tracking:**
   ```
   offspring.parent_male = Some(parent_male.panda_mint)
   offspring.parent_female = Some(parent_female.panda_mint)
   offspring.generation = max(parent_male.generation, parent_female.generation) + 1
   ```

**Side Effects:**
- Creates new PandaNFT account (offspring)
- Offspring inherits parent type
- Offspring generation = max(parent generations) + 1
- Parent stats updated:
  - `breed_count += 1`
  - `breeding_cooldown_ends = now + 7 days`
  - `is_locked = false`
- BreedingSession status = Complete
- Emits `OffspringCreated` event

**Error Cases:**
- `BreedingSessionComplete`: Session already finished
- `BreedingSessionExpired`: Session timed out (48 hour limit)
- `ParentMintMismatch`: Parent mints don't match session
- `InvalidPandaName`: Offspring name invalid
- `TraitInheritanceFailed`: Error during stat calculation

**Event:**
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

---

## Constants

All constants defined in `src/constants.rs`:

### Seeds
- `PANDA_METADATA_SEED = "panda_metadata"`
- `BREEDING_SESSION_SEED = "breeding_session"`

### Economic Parameters
- `FORGE_PANDA_COST = 100_000_000` (100 Bamboo tokens)
- `BREEDING_COST = 50_000_000` (50 Bamboo tokens)
- `OFFSPRING_MINT_COST = 25_000_000` (25 Bamboo tokens)

### Breeding Cooldowns
- `PANDA_BREEDING_COOLDOWN = 604800` seconds (7 days)
- `BREEDING_SESSION_TIMEOUT = 172800` seconds (48 hours)

### Supply Caps
- `MAX_PANDAS_PER_PLAYER = 100`
- `MAX_TOTAL_PANDAS = 10_000`
- `MAX_GENERATIONS = 10`
- `MAX_BREED_COUNT = 5` per panda

---

## Error Codes

Complete error enum in `src/error.rs`:

### Panda-Related Errors
- `PandaNotFound`: Specified panda not found
- `NotPandaOwner`: Caller not panda owner
- `PandaLocked`: Panda currently locked (breeding)

### Breeding Errors
- `InvalidBreedingPair`: Parents incompatible for breeding
- `CooldownViolation`: Breeding cooldown not elapsed
- `SamePandaBreeding`: Attempting self-breeding
- `MaxBreedCountReached`: Panda at breed limit
- `MaxGenerationReached`: Generation cap exceeded
- `BreedingSessionNotFound`: Session account missing
- `BreedingSessionExpired`: Session past timeout
- `BreedingSessionComplete`: Session already finished
- `ParentMintMismatch`: Parent mints don't match session

### Supply Limit Errors
- `PandasPerPlayerLimitReached`: Player at panda cap
- `TotalSupplyCapReached`: Global panda cap hit
- `GenerationCapReached`: Generation limit reached

### Economic Errors
- `InsufficientFunds`: Player lacks Bamboo tokens
- `TokenTransferFailed`: SPL token transfer failed
- `InvalidTokenAccount`: Token account invalid

### Account Setup Errors
- `InvalidPDA`: PDA derivation failed
- `AccountMismatch`: Account doesn't match expected
- `MetadataAccountRequired`: Metadata account missing

### Input Validation Errors
- `InvalidPandaName`: Name length or characters invalid
- `InvalidPandaType`: Unknown panda type
- `InvalidStatValue`: Stats outside 1-100 range

### Trait Errors
- `TraitInheritanceFailed`: Trait calculation failed
- `RandomizationFailed`: RNG operation failed

---

## Utility Functions

### Trait Inheritance

```rust
pub fn inherit_traits(
    parent_male_attack: u8,
    parent_male_defense: u8,
    parent_male_speed: u8,
    parent_male_intellect: u8,
    parent_female_attack: u8,
    parent_female_defense: u8,
    parent_female_speed: u8,
    parent_female_intellect: u8,
) -> Result<(u8, u8, u8, u8)>
```

Returns offspring stats as `(attack, defense, speed, intellect)` tuple.

### Stat Mutation

```rust
fn apply_mutation(stat: u8, variance: u8) -> Result<u8>
```

Applies ±variance mutations to stat values, clamped to [1, 100].

### Base HP Calculation

```rust
pub fn calculate_base_hp(attack: u8, defense: u8) -> u16
```

Formula: `100 + (attack * 0.2) + (defense * 0.3)`, capped at 150.

### Session ID Generation

```rust
pub fn generate_breeding_session_id(
    player: &Pubkey,
    parent_male: &Pubkey,
    parent_female: &Pubkey,
    timestamp: i64,
) -> [u8; 32]
```

Deterministically hashes participants to create unique session ID.

### Validation

```rust
pub fn validate_panda_name(name: &str) -> Result<()>
pub fn validate_stats(attack: u8, defense: u8, speed: u8, intellect: u8) -> Result<()>
```

---

## Test Coverage

Comprehensive test suite in `program/tests/panda-battle.ts`:

### Panda Creation Tests
- ✓ Forge panda with valid stats
- ✓ Reject invalid panda names
- ✓ Reject invalid stat values

### Breeding Logic Tests
- ✓ Initialize breeding session between compatible pandas
- ✓ Reject breeding during cooldown
- ✓ Reject same-panda breeding
- ✓ Create offspring with inherited traits
- ✓ Update parent breed counts
- ✓ Apply breeding cooldown after mating

### Constraint Tests
- ✓ Enforce maximum generation limit (10)
- ✓ Enforce maximum breed count per panda (5)
- ✓ Enforce breeding session timeout (48 hours)
- ✓ Lock/unlock pandas during breeding

### Error Handling Tests
- ✓ Reject unauthorized breeding
- ✓ Reject breeding with locked pandas
- ✓ Reject expired breeding sessions

### Event Tests
- ✓ Emit PandaForged event on creation
- ✓ Emit BreedingStarted event on breeding start
- ✓ Emit OffspringCreated event on breeding completion

### Utility Function Tests
- ✓ Calculate correct base HP from stats
- ✓ Determine rarity from stats
- ✓ Validate panda names
- ✓ Validate stat ranges

---

## Integration with Frontend

### Event Subscription

The UI layer subscribes to three main events:

```typescript
// Listen for new pandas
program.addEventListener('PandaForged', (event) => {
  updateUserPandaList(event.panda_mint, event.name);
  showNotification(`New panda forged: ${event.name}!`);
});

// Listen for breeding initiation
program.addEventListener('BreedingStarted', (event) => {
  lockPandaUI(event.parent_male_mint);
  lockPandaUI(event.parent_female_mint);
  showBreedingTimer(event.breeding_id);
});

// Listen for offspring creation
program.addEventListener('OffspringCreated', (event) => {
  addPandaToCollection(event.offspring_mint, event.offspring_name);
  displayBreedingResult(event);
});
```

### Transaction Builder Pattern

```typescript
// Start breeding
const tx = await program.methods
  .startBreeding(breedingId)
  .accounts({
    player: wallet.publicKey,
    parentMale: parentMalePDA,
    parentFemale: parentFemalePDA,
    ...otherAccounts
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
    ...otherAccounts
  })
  .signers([wallet])
  .rpc();
```

---

## Future Enhancements

1. **Advanced Trait Combinations:** Allow cross-type pandas to produce hybrid offspring
2. **Trait Bonuses:** Special stat bonuses for rare parent combinations
3. **Breeding NFT Marketplace:** Trade breeding sessions or offspring rights
4. **Generational Bonuses:** Stat scaling based on generation depth
5. **Breeding Guilds:** Shared breeding pools and cooperative offspring
6. **Dynamic Cooldowns:** Reduce cooldown with player reputation/level

---

## Deployment Checklist

- [x] PandaNFT and BreedingSession state structs
- [x] forge_panda, start_breeding, complete_breeding instructions
- [x] Trait inheritance algorithm with mutation
- [x] Breeding constraints (cooldown, generation, breed count)
- [x] Economic parameters (token costs)
- [x] Custom error codes
- [x] Structured events
- [x] Utility functions
- [x] Comprehensive test suite
- [ ] Integration tests with token program
- [ ] Mainnet audit
- [ ] UI integration

---

## References

- [SOLANA_CONTRACTS.md](./SOLANA_CONTRACTS.md) - Architecture overview
- [MOCK_DATA.md](./MOCK_DATA.md) - Data structure definitions
- [UI_SPECS.md](./UI_SPECS.md) - Frontend specification
