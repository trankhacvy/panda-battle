# Bamboo Panda Battles - Solana Program

This directory contains the Solana smart contracts for the Bamboo Panda Battles token economy and game logic.

---

## Directory Structure

```
program/
├── programs/panda-battle/
│   ├── src/
│   │   ├── lib.rs                 # Program entrypoint and instruction routing
│   │   ├── constants.rs           # Token economy constants
│   │   ├── error.rs               # Error code definitions
│   │   ├── state/                 # Account structures
│   │   │   ├── mod.rs
│   │   │   ├── treasury.rs        # TreasuryConfig account schema
│   │   │   └── reward_pool.rs     # RewardPool and event definitions
│   │   └── instructions/          # Instruction handlers
│   │       ├── mod.rs
│   │       ├── initialize.rs      # Initial setup
│   │       └── tokenomics/        # Token economy instructions
│   │           ├── mod.rs
│   │           ├── initialize_treasury.rs
│   │           ├── distribute_bamboo_rewards.rs
│   │           ├── claim_rewards.rs
│   │           └── spend_bamboo_for_action.rs
│   ├── Cargo.toml                 # Rust dependencies
│   └── Xargo.toml
├── tests/
│   ├── panda-battle.ts            # Placeholder tests
│   └── tokenomics.test.ts         # Complete token economy tests
├── migrations/
│   └── deploy.ts                  # Deployment script template
├── Anchor.toml                    # Anchor workspace configuration
├── Cargo.toml                     # Workspace manifest
├── package.json                   # Node.js dependencies
├── tsconfig.json                  # TypeScript configuration
├── TOKENOMICS_SETUP.md            # Tokenomics setup guide
└── README.md                      # This file
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd program/
pnpm install
```

### 2. Build the Program

```bash
anchor build
```

### 3. Run Tests

```bash
# Full test suite
pnpm test

# Only tokenomics tests
pnpm run tokenomics_test

# Watch mode (requires -w flag)
pnpm test -- --watch
```

### 4. Deploy to Localnet

```bash
# Start local validator
solana-test-validator

# In another terminal
anchor deploy
```

---

## Program Architecture

### Core Accounts

#### 1. TreasuryConfig (PDA)
- **Seed:** `["treasury"]`
- **Purpose:** Central state for token vault management
- **Fields:**
  - `vault_ata`: Associated Token Account holding Bamboo tokens
  - `authority`: Treasury authority signer
  - `total_distributed`: Lifetime rewards given out
  - `total_deposited`: Lifetime tokens received

#### 2. RewardPool (PDA)
- **Seed:** `["reward_pool", pool_id]`
- **Purpose:** Manages seasonal reward distributions
- **Fields:**
  - `pool_id`: Unique identifier
  - `total_rewards`: Pool reserve
  - `distributed_rewards`: Cumulative distributed
  - `max_claimable`: Per-player limit
  - `season`: Season number
  - `expires_at`: Claim deadline

#### 3. PlayerRewardClaim (PDA)
- **Seed:** `["player_reward_claim", player, pool_id]`
- **Purpose:** Tracks which rewards a player has claimed
- **Prevents:** Double-claiming from same reward pool

### Instructions

#### initialize_treasury
Creates and configures the treasury vault.

```bash
# Called once during setup
program.methods
  .initializeTreasury()
  .accounts({
    authority: authority.publicKey,
    mint: bambooMint,
    treasuryConfig,
    vaultAta,
    systemProgram,
    tokenProgram,
    associatedTokenProgram,
  })
  .rpc()
```

#### distribute_bamboo_rewards
Authority-only instruction to distribute tokens (used by BattleEngine for rewards).

```bash
program.methods
  .distributeBambooRewards(amount, reason)
  .accounts({
    authority,
    treasuryConfig,
    vaultAta,
    playerTokenAccount,
    tokenProgram,
  })
  .rpc()
```

#### claim_rewards
Players claim seasonal rewards with per-pool limits.

```bash
program.methods
  .claimRewards(claimAmount)
  .accounts({
    player,
    treasuryConfig,
    vaultAta,
    playerTokenAccount,
    rewardClaim,
    rewardPool,
    systemProgram,
    tokenProgram,
  })
  .signers([player])
  .rpc()
```

#### spend_bamboo_for_action
Players spend tokens for in-game actions (forge, breed, etc.).

```bash
program.methods
  .spendBambooForAction(amount, action)
  .accounts({
    player,
    treasuryConfig,
    treasuryAta,
    playerTokenAccount,
    tokenProgram,
  })
  .signers([player])
  .rpc()
```

---

## Token Economy

### Constants (in `src/constants.rs`)

```rust
// Rewards
pub const BATTLE_WIN_REWARD: u64 = 100_000_000;        // 100 BAMBOO
pub const BATTLE_LOSS_REWARD: u64 = 25_000_000;       // 25 BAMBOO

// Costs
pub const PANDA_FORGE_COST: u64 = 50_000_000;         // 50 BAMBOO
pub const CLAIM_REWARD_COST: u64 = 5_000_000;         // 5 BAMBOO

// Limits
pub const MAX_SEASON_REWARDS: u64 = 1_000_000_000_000; // 1B BAMBOO
```

### Token Flows

**Battle Victory:**
```
1. BattleEngine resolves battle
2. If player won: CPI to distribute_bamboo_rewards(100_000_000)
3. Treasury transfers 100 BAMBOO → player_ata
4. Events emitted for audit trail
```

**Forging Panda:**
```
1. Player initiates forge
2. Check balance >= 50_000_000 (50 BAMBOO)
3. Call spend_bamboo_for_action(50_000_000, "forge_panda")
4. Transfer 50 BAMBOO player_ata → treasury_vault
5. Emit events and proceed with minting
```

**Claiming Rewards:**
```
1. End of season, RewardPool created
2. Player calls claim_rewards(amount)
3. Check: not expired, not already claimed, amount <= max_claimable
4. Transfer tokens treasury_vault → player_ata
5. Mark player claim record to prevent duplicates
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| `InsufficientBalance` | Balance too low for transfer | Player or vault insufficient funds |
| `TreasuryNotInitialized` | Treasury not set up | initialize_treasury not called |
| `InvalidTreasuryAuthority` | Wrong signer | Caller is not treasury authority |
| `InvalidTokenAccount` | Wrong account provided | Account doesn't match expected |
| `InvalidSigner` | Signer mismatch | Wrong keypair used |
| `RewardPoolNotFound` | Pool doesn't exist | Invalid pool_id |
| `RewardAlreadyClaimed` | Already claimed from pool | Duplicate claim attempt |
| `RewardPoolExpired` | Claim period over | Pool expires_at passed |
| `ExceedsMaxClaimable` | Amount too high | Exceeds per-player limit |
| `InvalidMint` | Wrong token mint | Not Bamboo mint |

---

## Events

All token transfers emit events for complete audit trail:

```rust
#[event]
pub struct TreasuryInitialized {
    pub vault_ata: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RewardsDistributed {
    pub player: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimed {
    pub player: Pubkey,
    pub pool_id: u64,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensSpent {
    pub player: Pubkey,
    pub amount: u64,
    pub action: String,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryTransferred {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub reason: String,
    pub timestamp: i64,
}
```

---

## Testing

### Test Suite Overview

**File:** `tests/tokenomics.test.ts`

Tests cover:
1. Treasury initialization
2. Battle reward distribution (wins & losses)
3. Seasonal reward claiming
4. Duplicate claim prevention
5. Token spending for actions
6. Insufficient balance checking
7. End-to-end flow (forge → battle → claim)

### Running Tests

```bash
# All tests
pnpm test

# Only tokenomics
pnpm run tokenomics_test

# Specific test
pnpm test -- --grep "distribute battle rewards"

# With output
pnpm test 2>&1 | grep -E "✓|✗|error"
```

### Test Requirements

- Local Solana validator running (`solana-test-validator`)
- ~5 SOL in wallet for transactions and rent
- ~30-45 seconds for full suite

---

## Building & Deployment

### Build

```bash
# Check for errors
cargo check

# Full build
anchor build

# With verbose output
anchor build -- --verbose
```

### Deployment Checklist

- [ ] All tests passing
- [ ] No compiler warnings
- [ ] Constants reviewed for mainnet
- [ ] Security audit completed
- [ ] Governor/multisig setup ready
- [ ] Devnet deployment tested

### Deployment Steps

```bash
# 1. Build production bundle
anchor build --release

# 2. Deploy to devnet
anchor deploy --provider.cluster devnet

# 3. Verify deployment
solana program show <PROGRAM_ID> --url devnet

# 4. Run devnet tests
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com pnpm test

# 5. Upgrade to testnet (requires multisig)
anchor upgrade <IDL_PATH> --provider.cluster testnet
```

---

## Troubleshooting

### Build Errors

```bash
# Clean rebuild
cargo clean
anchor build

# Check Rust version
rustc --version  # Should be 1.75.0+

# Update Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.0 anchor-cli
```

### Test Failures

```bash
# Restart validator
pkill solana-test-validator
solana-test-validator

# Check logs
solana logs --url localhost

# Increase timeout in tests
test.timeout(60000)
```

### Account Issues

```bash
# Check account exists
solana account <ACCOUNT_ADDRESS>

# Check token balance
spl-token balance <TOKEN_ACCOUNT>

# Verify mint
spl-token mint-info <MINT_ADDRESS>
```

---

## Development Workflow

### Adding a New Instruction

1. **Create instruction handler** in `src/instructions/tokenomics/new_instruction.rs`
2. **Define Accounts struct** in same file
3. **Add to mod.rs** exports
4. **Add to lib.rs** program module
5. **Add tests** in `tests/tokenomics.test.ts`
6. **Run tests** to verify

### Modifying State

1. **Update struct** in `src/state/`
2. **Update size constant** (e.g., `TreasuryConfig::LEN`)
3. **Add migration** if needed
4. **Update tests** to reflect changes
5. **Rebuild and test**

---

## Security Notes

- **Authority Checks**: All state-modifying operations verify signer
- **CPI Signer Seeds**: Properly derived from PDA seeds
- **Checked Arithmetic**: All additions use `checked_add`
- **Balance Verification**: Checked before all transfers
- **Replay Prevention**: Pool IDs and claim records prevent duplicates
- **Event Emission**: All transfers logged for audit

---

## Dependencies

- `anchor-lang`: Smart contract framework
- `anchor-spl`: SPL Token integration
- `solana-program`: Core Solana SDK
- `ephemeral-vrf-sdk`: VRF randomness (future)
- `bytemuck`: Serialization utilities

---

## Resources

- **Anchor Docs**: https://www.anchor-lang.com/
- **Solana Docs**: https://docs.solana.com/
- **SPL Token**: https://github.com/solana-labs/solana-program-library
- **Cookbook**: https://solanacookbook.com/

---

## Support

For issues:
1. Check `TOKENOMICS_SETUP.md` for detailed setup
2. Review test files for examples
3. Check `docs/SOLANA_CONTRACTS.md` for architecture
4. Open GitHub issue with error details

---

**Program Status:** ✅ Ready for Integration  
**Last Updated:** November 2024  
**Version:** 0.1.0
