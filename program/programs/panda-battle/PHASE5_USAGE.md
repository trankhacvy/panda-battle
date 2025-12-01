# Phase 5: Advanced Features - Usage Guide

## Overview
Phase 5 implements the leaderboard reveal and hourly jackpot distribution system for the Panda Battle game.

## Features Implemented

### 1. Reveal Leaderboard (`reveal_leaderboard`)

**Purpose**: After the leaderboard reveal timestamp (12 hours into the round), this crank computes and stores the top 20 players.

**How it works**:
- Can be called by anyone (crank operation)
- Requires the round to be active and past the `leaderboard_reveal_ts`
- Accepts player state accounts via `remaining_accounts`
- Deserializes each player state, verifies they belong to the current round
- Sorts all players by points (descending)
- Stores top 20 in the Leaderboard PDA
- Marks leaderboard as revealed

**Usage**:
```rust
// Call with player state accounts passed as remaining_accounts
reveal_leaderboard(ctx)
```

**Accounts Required**:
- `caller`: Signer (anyone, pays for account creation if needed)
- `global_config`: GlobalConfig PDA
- `game_round`: GameRound PDA
- `leaderboard`: Leaderboard PDA (auto-created if needed)
- `system_program`: System program
- `remaining_accounts`: Vec of PlayerState accounts to scan

### 2. Hourly Jackpot (`hourly_jackpot`)

**Purpose**: Distributes a random percentage (0.5-1%) of the prize pool to a weighted-random winner from the top 20.

**How it works**:
- Can be called by anyone (crank operation)
- Requires leaderboard to be revealed
- Uses pseudo-random selection weighted by inverse rank (rank 1 has highest odds)
- Randomly selects 0.5-1% of prize pool (50-100 basis points)
- Transfers tokens from vault to winner's token account

**Weighting System**:
- Rank 1: weight 20
- Rank 2: weight 19
- ...
- Rank 20: weight 1
- Higher ranks have better odds of winning

**Usage**:
```rust
// Call with a client seed for randomness
hourly_jackpot(ctx, client_seed)
```

**Accounts Required**:
- `caller`: Signer (anyone)
- `global_config`: GlobalConfig PDA
- `game_round`: GameRound PDA (mut - prize pool may be updated)
- `leaderboard`: Leaderboard PDA
- `vault`: Token vault PDA (mut)
- `winner_token_account`: Winner's token account (mut)
- `token_program`: SPL Token program

**Parameters**:
- `client_seed: u8` - Random seed for entropy

## Off-Chain Leaderboard Query

For off-chain applications, you can query the leaderboard by:

1. **Option A**: Read the Leaderboard PDA directly
   - Fetch the Leaderboard account for the round
   - Access the `entries` field containing top 20 players

2. **Option B**: Scan all PlayerState PDAs
   - Query all PlayerState accounts for a given round
   - Sort by points client-side
   - This is useful before leaderboard reveal

## Error Codes

New error codes added for Phase 5:
- `LeaderboardNotReady`: Reveal timestamp not reached yet
- `LeaderboardAlreadyRevealed`: Leaderboard already revealed
- `LeaderboardNotRevealed`: Trying to run jackpot before reveal
- `EmptyLeaderboard`: No entries in leaderboard
- `InvalidRound`: Player state doesn't belong to this round

## Notes

- The `hourly_jackpot` uses pseudo-random selection based on `client_seed`, `clock.unix_timestamp`, and `clock.slot`
- In production, consider using VRF (similar to battles) for true randomness
- The jackpot doesn't reduce the final prize pool significantly (max 1% per hour)
- Leaderboard can only be revealed once per round
- The vault must have sufficient balance for jackpot transfers
