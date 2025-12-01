# Panda Battle Testing Guide

## Overview

The test suite has been reorganized into separate files for better maintainability and clarity. Each file focuses on a specific category of instructions.

## File Structure

```
tests/
├── admin.test.ts       # Admin instruction tests
├── player.test.ts      # Player instruction tests  
├── crank.test.ts       # Crank instruction tests
├── utils.ts            # Shared utilities and helpers
├── index.test.ts       # Main test entry point
└── README.md           # Test documentation
```

## Test Coverage

### Admin Instructions (4 tests)
1. ✅ Initialize game - Sets up global config with token mint
2. ✅ Create round - Creates new round with entry fee, pack price, duration
3. ✅ End round - Marks round as inactive
4. ✅ Update config - Updates global configuration parameters

### Player Instructions (5 tests)
1. ✅ Request join round - Initiates VRF for attribute generation
2. ✅ Buy attack packs - Purchases packs for additional turns
3. ✅ Reroll attributes - Initiates VRF for attribute reroll (max 3x)
4. ✅ Initiate battle - Starts VRF-based battle simulation
5. ✅ Claim prize - Claims calculated prize share after round ends

### Crank Instructions (5 tests)
1. ✅ Regenerate turns - Adds turns after 1-hour cooldown
2. ✅ Reset packs if new hour - Resets hourly pack purchase counter
3. ✅ Reveal leaderboard - Computes and stores top 20 players
4. ✅ Hourly jackpot - Distributes random jackpot to top 20
5. ✅ Distribute prizes - Calculates prize shares (80% top 20, 20% rest)

## Running Tests

### All Tests
```bash
anchor test
```

### Individual Test Suites
```bash
# Admin tests only
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/admin.test.ts

# Player tests only
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/player.test.ts

# Crank tests only
pnpm exec ts-mocha -p ./tsconfig.json -t 1000000 tests/crank.test.ts
```

### With Local Validator
```bash
# Start local validator in one terminal
solana-test-validator

# Run tests in another terminal
anchor test --skip-local-validator
```

## Important Notes

### VRF Requirements
Several instructions use Ephemeral VRF for randomness:
- `request_join_round` - Generates random attributes (STR/AGI/INT)
- `reroll_attributes` - Regenerates attributes
- `initiate_battle` - Resolves battle with random outcomes

**For VRF tests to work:**
1. The Ephemeral VRF oracle must be running on the test network
2. Or mock the VRF callbacks in tests
3. Or use the VRF program's test utilities

### Time-Based Tests
Some operations have time constraints:
- Turn regeneration: Requires 1 hour (3600s) since last regen
- Pack reset: Requires 1 hour since last pack purchase
- Leaderboard reveal: Requires reaching reveal timestamp (12h after start)
- Hourly jackpot: Requires leaderboard to be revealed

**For time-based tests:**
- Use Solana's clock manipulation in tests
- Or wait actual time (not practical)
- Or mock the time checks

### Test Tokens
Tests use mock SPL tokens with 6 decimals (like USDC):
- Entry fee: 1.99 tokens = 1_990_000 (with 6 decimals)
- Pack price: 0.10 tokens = 100_000 (with 6 decimals)
- Players are minted 100 tokens each for testing

## Expected Test Behavior

Some tests may fail under certain conditions (this is expected):

1. **VRF-based tests** - Will fail if VRF oracle is not available
   - Solution: Mock VRF callbacks or run with VRF oracle

2. **Time-based tests** - Will fail if time constraints not met
   - Solution: Use clock manipulation or wait

3. **Claim prize** - Will fail if prizes not distributed yet
   - Solution: Run `distribute_prizes` first

4. **Battle tests** - Will fail if players not joined
   - Solution: Ensure join callbacks complete first

## Debugging Tips

1. **Check logs**: Use `console.log` statements to track execution
2. **Inspect accounts**: Use `program.account.*.fetch()` to check state
3. **Transaction logs**: Add `.rpc({ skipPreflight: false })` for detailed errors
4. **VRF status**: Check if VRF oracle is running and accessible
5. **Time checks**: Log timestamps to verify time-based conditions

## Next Steps

To make tests fully functional:

1. **Mock VRF callbacks** - Create test utilities to simulate VRF responses
2. **Clock manipulation** - Use Solana test utilities to advance time
3. **Integration tests** - Test full game flow from start to finish
4. **Edge cases** - Test error conditions and boundary cases
5. **Performance tests** - Test with many players and battles

## Example: Full Game Flow Test

```typescript
// 1. Admin creates round
await createRound(...)

// 2. Players join (VRF generates attributes)
await requestJoinRound(player1)
await requestJoinRound(player2)
// Wait for VRF callbacks...

// 3. Players battle
await initiateBattle(player1, player2)
// Wait for VRF callback...

// 4. Advance time to reveal period
// ... time manipulation ...

// 5. Reveal leaderboard
await revealLeaderboard()

// 6. Advance time to end
// ... time manipulation ...

// 7. End round
await endRound()

// 8. Distribute prizes
await distributePrizes()

// 9. Players claim
await claimPrize(player1)
await claimPrize(player2)
```
