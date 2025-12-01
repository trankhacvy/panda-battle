# Phase 5 Quick Reference

## Instructions

### reveal_leaderboard()
- **When**: After `leaderboard_reveal_ts` (12h into round)
- **Who**: Anyone (crank)
- **What**: Computes top 20 players, stores in Leaderboard PDA
- **Input**: Player state accounts via `remaining_accounts`
- **Output**: Leaderboard PDA with top 20 entries

### hourly_jackpot(client_seed: u8)
- **When**: After leaderboard revealed, hourly
- **Who**: Anyone (crank)
- **What**: Transfers 0.5-1% of pool to weighted-random winner
- **Input**: `client_seed` for randomness
- **Output**: Token transfer to winner

## PDAs

### Leaderboard
- **Seeds**: `["leaderboard", game_round]`
- **Data**: Top 20 players with points
- **Created**: On first `reveal_leaderboard` call

## Weighting

| Rank | Weight | Odds (approx) |
|------|--------|---------------|
| 1    | 20     | 9.5%          |
| 2    | 19     | 9.0%          |
| 3    | 18     | 8.6%          |
| ...  | ...    | ...           |
| 20   | 1      | 0.5%          |

Total weight: 210

## Error Handling

| Error | Cause |
|-------|-------|
| `LeaderboardNotReady` | Called before reveal time |
| `LeaderboardAlreadyRevealed` | Reveal called twice |
| `LeaderboardNotRevealed` | Jackpot before reveal |
| `EmptyLeaderboard` | No players in leaderboard |
| `InvalidRound` | Player state wrong round |

## Flow

```
Round Start (0h)
    ↓
12h: leaderboard_reveal_ts reached
    ↓
Crank: reveal_leaderboard()
    ↓
Leaderboard revealed (top 20 stored)
    ↓
Hourly: hourly_jackpot()
    ↓
Random winner receives 0.5-1% of pool
    ↓
Repeat hourly until round ends (24h)
```

## Key Constants

- **Jackpot Range**: 50-100 basis points (0.5-1%)
- **Top Players**: 20
- **Reveal Time**: 12 hours after round start
- **Round Duration**: 24 hours

## Integration Points

- **Phase 4**: Uses battle results (points) for ranking
- **Phase 6**: Leaderboard used for final prize distribution
- **Off-chain**: Query leaderboard for UI display
