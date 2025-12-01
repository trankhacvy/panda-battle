# Panda Battle Tests

This directory contains the test suite for the Panda Battle Solana program.

## Test Structure

Tests are organized into three main categories:

### 1. Admin Tests (`admin.test.ts`)
Tests for administrative operations:
- `initialize_game` - Initialize the global game configuration
- `create_round` - Create a new game round with parameters
- `end_round` - End the current round
- `update_config` - Update global configuration

### 2. Player Tests (`player.test.ts`)
Tests for player-facing operations:
- `request_join_round` - Join a round (VRF-based attribute generation)
- `buy_attack_packs` - Purchase attack packs for turns
- `reroll_attributes` - Reroll player attributes (VRF-based)
- `initiate_battle` - Start a battle with another player (VRF-based resolution)
- `claim_prize` - Claim prize after round ends

### 3. Crank Tests (`crank.test.ts`)
Tests for automated maintenance operations:
- `regenerate_turns` - Regenerate player turns after cooldown
- `reset_packs_if_new_hour` - Reset hourly pack purchase counter
- `reveal_leaderboard` - Reveal top 20 players after reveal time
- `hourly_jackpot` - Distribute hourly jackpot to random top 20 player
- `distribute_prizes` - Calculate and distribute final prizes

## Utilities (`utils.ts`)

Helper functions for tests:
- PDA derivation functions
- Account fetching functions
- Token setup utilities
- Airdrop helpers

## Running Tests

```bash
# Run all tests
anchor test

# Run specific test file
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/admin.test.ts
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/player.test.ts
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/crank.test.ts
```

## Notes

- VRF-based instructions (join, reroll, battle) require the Ephemeral VRF oracle to be running
- Time-based tests (turn regeneration, hourly operations) may need time manipulation or waiting
- Some tests are expected to fail in certain conditions (e.g., claiming prize before distribution)
- Tests use mock tokens with 6 decimals (like USDC)

## Test Data

- Entry Fee: 1.99 tokens (1_990_000 with 6 decimals)
- Attack Pack Price: 0.10 tokens (100_000 with 6 decimals)
- Round Duration: 24 hours (86400 seconds)
- Entry Hourly Increase: 1%
