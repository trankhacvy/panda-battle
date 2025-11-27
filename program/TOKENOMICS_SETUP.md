# Bamboo Tokenomics Setup & Integration Tests

This document provides comprehensive guidance for setting up and running the token economy layer of Bamboo Panda Battles.

---

## Overview

The tokenomics system manages the in-game Bamboo token economy through:
- **Treasury Management**: Central vault for token distribution and collection
- **Reward Distribution**: Battle rewards and seasonal reward pools
- **Token Spending**: Players spend tokens for actions like forging pandas
- **Event Emission**: Complete audit trail of all token transfers

---

## Prerequisites

### Environment Setup

```bash
# Ensure Node.js 18+ is installed
node --version

# Install pnpm (if not already installed)
npm install -g pnpm

# Install Rust & Solana CLI (for building programs)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.0 anchor-cli

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
```

### Local Validator Setup

```bash
# Start a local Solana validator
solana-test-validator

# In another terminal, configure Solana CLI for localnet
solana config set --url http://localhost:8899

# Airdrop initial SOL for testing
solana airdrop 100 ~/.config/solana/id.json
```

---

## Building the Program

### From Project Root

```bash
cd program/

# Build the tokenomics contracts
anchor build

# Build with verbose output (for debugging)
anchor build -- --verbose

# Check for compilation errors without building
cargo check
```

### Expected Output

```
Compiling panda-battle v0.1.0
    Finished release [optimized] target(s) in XX.XXs
    
Built IDL:
  - Target IDL -> idl/panda_battle.json
  - Program ID: 2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG
```

---

## Running Integration Tests

### Test Structure

The test suite (`tests/tokenomics.test.ts`) runs comprehensive end-to-end flows:

1. **Treasury Initialization**
   - Creates TreasuryConfig PDA
   - Sets up vault ATA for Bamboo tokens
   - Verifies initial state

2. **Battle Rewards**
   - Distributes 100 BAMBOO to winners
   - Distributes 25 BAMBOO to losers
   - Validates balance updates

3. **Seasonal Rewards**
   - Creates RewardPool for seasonal rewards
   - Allows players to claim with per-pool limits
   - Prevents duplicate claims

4. **Token Spending**
   - Players spend tokens for actions (forge_panda)
   - Treasury receives deposited tokens
   - Validates spending limits

5. **End-to-End Flow**
   - Multi-step scenario: forge → battle → claim → spend
   - Validates complete token flow

### Running Tests

```bash
cd program/

# Run all tests (including tokenomics)
pnpm test

# Run only tokenomics tests
pnpm exec anchor test -- --testNamePattern="Bamboo Tokenomics"

# Run with verbose output
pnpm test -- --verbose

# Run specific test
pnpm exec anchor test -- --testNamePattern="Should initialize treasury"
```

### Test Output Example

```
Bamboo Tokenomics Integration Tests
  ✓ Creates Bamboo Mint
  ✓ Should initialize treasury with correct configuration
  ✓ Should distribute battle rewards to winner
  ✓ Should distribute battle loss rewards
  ✓ Should allow player to claim seasonal rewards
  ✓ Should prevent duplicate claims in same reward pool
  ✓ Should allow player to spend tokens for action
  ✓ Should prevent spending more tokens than available
  ✓ Should complete end-to-end tokenomics flow

  9 passing (45.2s)
```

---

## Deployment Workflow

### Step 1: Create Bamboo Token Mint

```bash
# Create SPL Token mint (decimals: 9)
spl-token create-mint 9

# Example output:
# Creating token 5kKL...8BZe
# Signature: 5kKL...8BZe

# Store the mint address
export BAMBOO_MINT="5kKL...8BZe"
```

### Step 2: Deploy Program to Localnet

```bash
cd program/

# Deploy
anchor deploy

# Program ID will be displayed:
# Deploying cluster: http://localhost:8899
# Deploy success. Signature: ...
# Program ID: 2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG
```

### Step 3: Initialize Treasury

```bash
# Run initialization script
pnpm ts-node scripts/initialize-treasury.ts

# Or manually via tests:
pnpm test -- --testNamePattern="initialize treasury"
```

### Step 4: Run Full Integration Tests

```bash
# Run complete test suite
pnpm test

# Monitor vault balances (in separate terminal)
spl-token balance <VAULT_ATA>
```

---

## Configuration & Environment Variables

### Anchor.toml

Located at `program/Anchor.toml`:

```toml
[programs.localnet]
panda_battle = "2U6NvgpGn779fBKMziM88UxQqWwstTgQm4LLHyt7JqyG"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
tokenomics_test = "pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/tokenomics.test.ts"
```

### Required Environment Variables

```bash
# Solana RPC Endpoint (default: http://localhost:8899)
export ANCHOR_PROVIDER_URL=http://localhost:8899

# Wallet path (must have SOL for transactions)
export ANCHOR_WALLET=~/.config/solana/id.json

# Optional: Bamboo mint address
export BAMBOO_MINT_ADDRESS=5kKL...8BZe

# Optional: Treasury authority (defaults to wallet)
export TREASURY_AUTHORITY=~/.config/solana/id.json
```

### Setting Environment Variables

```bash
# For current session
export ANCHOR_PROVIDER_URL=http://localhost:8899

# Permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export ANCHOR_PROVIDER_URL=http://localhost:8899' >> ~/.bashrc
source ~/.bashrc
```

---

## Token Economy Constants

Edit `programs/panda-battle/src/constants.rs` to adjust:

```rust
// Token rewards (in lamports, 9 decimals = 10^9)
pub const BATTLE_WIN_REWARD: u64 = 100_000_000;        // 100 BAMBOO
pub const BATTLE_LOSS_REWARD: u64 = 25_000_000;       // 25 BAMBOO

// Token costs
pub const PANDA_FORGE_COST: u64 = 50_000_000;         // 50 BAMBOO
pub const CLAIM_REWARD_COST: u64 = 5_000_000;         // 5 BAMBOO (not charged, info only)

// Pool limits
pub const MAX_SEASON_REWARDS: u64 = 1_000_000_000_000; // 1B BAMBOO cap
```

After editing, rebuild:

```bash
anchor build
```

---

## Instruction Reference

### 1. initialize_treasury

Initializes the tokenomics system.

**Command:**
```bash
pnpm exec ts-node -e "
  const program = require('./target/types/panda_battle').default;
  // Implementation in test
"
```

**Test:**
```bash
pnpm test -- --testNamePattern="initialize treasury"
```

### 2. distribute_bamboo_rewards

Authority distributes tokens from treasury to player.

**Parameters:**
- `amount` (u64): Tokens in lamports
- `reason` (String): "battle_victory", "battle_participation", etc.

### 3. claim_rewards

Player claims seasonal rewards.

**Parameters:**
- `claim_amount` (u64): Requested tokens

**Validation:**
- Pool must not be expired
- Player cannot claim twice from same pool
- Claim must not exceed max_claimable

### 4. spend_bamboo_for_action

Player spends tokens for in-game actions.

**Parameters:**
- `amount` (u64): Tokens to spend
- `action` (String): "forge_panda", "breed_panda", etc.

---

## Troubleshooting

### "RPC Error: Invalid Account"

**Cause:** Account doesn't exist or wrong address provided  
**Solution:** Check account addresses and ensure ATA is created

```bash
spl-token account-info <ACCOUNT_ADDRESS>
```

### "InsufficientBalance"

**Cause:** Treasury or player doesn't have enough tokens  
**Solution:** Check balance and mint more if needed

```bash
spl-token balance <ACCOUNT_ADDRESS>
spl-token mint <MINT_ADDRESS> 1000000000 <ACCOUNT_ADDRESS>
```

### "InvalidTreasuryAuthority"

**Cause:** Wrong signer attempting to distribute  
**Solution:** Ensure correct authority keypair is used in wallet

```bash
solana address  # Check current keypair
```

### Test Timeout

**Cause:** Local validator is slow or not running  
**Solution:** Restart validator and increase timeout

```bash
# Kill old validator
pkill solana-test-validator

# Start new validator
solana-test-validator

# Increase test timeout in test file
test("...", async function() {
    this.timeout(60000); // 60 seconds
})
```

### "Unknown program"

**Cause:** Program not deployed  
**Solution:** Deploy program first

```bash
anchor build
anchor deploy
```

---

## Security Checklist

Before production deployment, verify:

- [ ] All authority checks are enforced
- [ ] No hardcoded addresses except program IDs
- [ ] All transfers emit events
- [ ] Balance checks before transfers
- [ ] PDA seeds properly derived
- [ ] No integer overflows (using checked arithmetic)
- [ ] CPI calls properly validated
- [ ] Rent exemption for all accounts
- [ ] Governance model defined for upgrades
- [ ] Audit completed and verified

---

## Integration with BattleEngine

When BattleEngine resolves a battle, it calls RewardVault via CPI:

```rust
// In BattleEngine::submit_turn() or resolve_battle()
if battle_finished {
    let reward_ix = panda_battle::instruction::distribute_bamboo_rewards(
        reward_vault_program_id,
        treasury_config_pda,
        reward_amount,
        reason.to_string(),
    );
    
    invoke_signed(
        &reward_ix,
        &[treasury_config, vault_ata, player_token_account, token_program],
        &[treasury_pda_signer_seeds],
    )?;
}
```

---

## Next Steps

### Phase 2: Player Registry Integration

```rust
// Update PlayerProfile with token tracking
pub struct PlayerProfile {
    pub total_bamboo_earned: u64,
    pub total_bamboo_spent: u64,
    pub current_balance: u64, // Cached for quick access
}
```

### Phase 3: PandaFactory Integration

```rust
// Forge instruction charges tokens
pub fn forge_panda(ctx: Context<ForgePanda>, cost: u64) -> Result<()> {
    // First: spend tokens
    spend_bamboo_for_action(cost, "forge_panda")?;
    // Then: mint panda NFT
    ...
}
```

### Phase 4: Leaderboard & Staking

- Seasonal leaderboard resets
- Staking pools for additional rewards
- Governance token distribution

---

## Resources

- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Solana Program Examples](https://github.com/solana-labs/solana-program-library)
- [SPL Token Program](https://github.com/solana-labs/solana-program-library/tree/master/token)
- [Solana Cookbook](https://solanacookbook.com/)

---

## Support & Questions

For issues or questions about tokenomics:

1. Check this document's troubleshooting section
2. Review test files for implementation examples
3. Consult SOLANA_CONTRACTS.md for architecture details
4. Open an issue with detailed error logs

---

**Last Updated:** November 2024  
**Status:** Production Ready (after security audit)
