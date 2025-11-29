# Panda Battle SDK

TypeScript SDK for interacting with the Panda Battle Solana program.

## Structure

- `index.ts` - Main SDK class with all instruction builders and fetch methods
- `types.ts` - Frontend-friendly type definitions and mapping functions
- `pda.ts` - PDA (Program Derived Address) utility functions
- `generated/` - Auto-generated code from Codama (DO NOT EDIT)

## Installation

```bash
npm install @solana/kit
```

## Usage

### Initialize SDK

```typescript
import { PandaBattleSDK } from "@/lib/sdk";
import { createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const sdk = new PandaBattleSDK(rpc);
```

### Admin Operations

#### Initialize Game

```typescript
const instruction = await sdk.initializeGameIx({
  admin: adminSigner,
  entryFee: 0.1, // SOL
  turnBasePrice: 0.01, // SOL
  roundDuration: 86400, // 24 hours in seconds
  stealPercentage: 10, // 10%
  idleDecayPercentage: 5, // 5%
});
```

#### Create Round

```typescript
const instruction = await sdk.createRoundIx({
  admin: adminSigner,
});
```

#### End Round

```typescript
const instruction = await sdk.endRoundIx({
  admin: adminSigner,
  roundNumber: 1,
});
```

#### Update Config

```typescript
const instruction = await sdk.updateConfigIx({
  admin: adminSigner,
  entryFee: 0.2, // Update entry fee
  stealPercentage: 15, // Update steal percentage
});
```

### Player Operations

#### Join Round

```typescript
const instruction = await sdk.joinRoundIx({
  player: playerSigner,
  roundNumber: 1,
});
```

#### Purchase Turns

```typescript
const instruction = await sdk.purchaseTurnsIx({
  player: playerSigner,
  roundNumber: 1,
  amount: 3, // Buy 3 turns
});
```

#### Initiate Battle

```typescript
import { AttributeType } from "@/lib/sdk";

const instruction = await sdk.initiateBattleIx({
  player: playerSigner,
  roundNumber: 1,
  defenderAddress: "DefenderPublicKeyHere...",
  stealAttribute: AttributeType.Strength, // or Speed, Endurance, Luck
});
```

#### Claim Reward

```typescript
const instruction = await sdk.claimRewardIx({
  player: playerSigner,
  roundNumber: 1,
});
```

### Crank Operations (Can be called by anyone)

#### Regenerate Turns

```typescript
const instruction = await sdk.regenerateTurnsIx({
  playerAddress: "PlayerPublicKeyHere...",
  roundNumber: 1,
});
```

#### Apply Idle Decay

```typescript
const instruction = await sdk.applyIdleDecayIx({
  playerAddress: "PlayerPublicKeyHere...",
  roundNumber: 1,
});
```

### Fetch Data

#### Get Game Config

```typescript
const config = await sdk.getGameConfig();
console.log(config.entryFee); // number in SOL
console.log(config.currentRound); // number
```

#### Get Game Round

```typescript
const round = await sdk.getGameRound(1);
console.log(round.prizePool); // number in SOL
console.log(round.playerCount); // number
console.log(round.isActive); // boolean
```

#### Get Player State

```typescript
const playerState = await sdk.getPlayerState(1, playerAddress);
console.log(playerState.strength); // number
console.log(playerState.turns); // number
console.log(playerState.wins); // number
console.log(playerState.rewardsEarned); // number in SOL
```

### Get PDA Addresses

```typescript
// Get game config address
const configAddress = await sdk.getGameConfigAddress();

// Get vault address
const vaultAddress = await sdk.getVaultAddress();

// Get game round address
const roundAddress = await sdk.getGameRoundAddress(1);

// Get player state address
const playerStateAddress = await sdk.getPlayerStateAddress(1, playerAddress);
```

## Type Conversions

The SDK automatically converts between Solana's native types and frontend-friendly types:

- `bigint` → `number` (for amounts in lamports → SOL)
- `Address` → `string` (for public keys)
- Unix timestamps remain as `number` (seconds)

### Manual Type Mapping

If you need to manually map types:

```typescript
import { mapGameConfig, mapGameRound, mapPlayerState } from "@/lib/sdk";

// Map generated types to frontend types
const friendlyConfig = mapGameConfig(generatedConfig);
const friendlyRound = mapGameRound(generatedRound);
const friendlyPlayerState = mapPlayerState(generatedPlayerState);
```

## Attribute Types

```typescript
export enum AttributeType {
  Strength = 0,
  Speed = 1,
  Endurance = 2,
  Luck = 3,
}
```

## PDA Seeds

The SDK uses these seeds for deriving PDAs:

- Game Config: `["game_config"]`
- Vault: `["vault", game_config_address]`
- Game Round: `["game_round", game_config_address, round_number]`
- Player State: `["player_state", game_round_address, player_address]`

## Error Handling

```typescript
try {
  const instruction = await sdk.joinRoundIx({
    player: playerSigner,
    roundNumber: 1,
  });
  // Send transaction...
} catch (error) {
  console.error("Failed to create join round instruction:", error);
}
```

## Notes

- All SOL amounts are in SOL units (not lamports)
- All timestamps are Unix timestamps in seconds
- The `generated/` folder is auto-generated by Codama - do not edit manually
- Run `npm run codama` to regenerate the SDK after program changes
