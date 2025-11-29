/**
 * Panda Battle SDK - Main service class for interacting with the Panda Battle program
 */

import {
  type Address,
  type Rpc,
  type SolanaRpcApi,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";
import {
  getInitializeGameInstructionAsync,
  getCreateRoundInstructionAsync,
  getJoinRoundInstructionAsync,
  getPurchaseTurnsInstructionAsync,
  getInitiateBattleInstructionAsync,
  getClaimRewardInstructionAsync,
  getRegenerateTurnsInstructionAsync,
  getApplyIdleDecayInstructionAsync,
  getEndRoundInstructionAsync,
  getUpdateConfigInstructionAsync,
} from "./generated";
import {
  fetchGameConfig,
  fetchGameRound,
  fetchPlayerState,
  type GameConfig as GeneratedGameConfig,
  type GameRound as GeneratedGameRound,
  type PlayerState as GeneratedPlayerState,
} from "./generated/accounts";
import {
  getGameConfigPDA,
  getVaultPDA,
  getGameRoundPDA,
  getPlayerStatePDA,
} from "./pda";
import {
  type GameConfig,
  type GameRound,
  type PlayerState,
  type AttributeType,
  mapGameConfig,
  mapGameRound,
  mapPlayerState,
} from "./types";

// ============== TYPES ==============

export interface InitializeGameParams {
  admin: TransactionSigner;
  entryFee: number; // in SOL
  turnBasePrice: number; // in SOL
  roundDuration: number; // in seconds
  stealPercentage: number; // 0-25
  idleDecayPercentage: number; // 0-10
}

export interface CreateRoundParams {
  admin: TransactionSigner;
}

export interface JoinRoundParams {
  player: TransactionSigner;
  roundNumber: number;
}

export interface PurchaseTurnsParams {
  player: TransactionSigner;
  roundNumber: number;
  amount: number; // 1-5
}

export interface InitiateBattleParams {
  player: TransactionSigner;
  roundNumber: number;
  defenderAddress: Address;
  stealAttribute: AttributeType;
}

export interface ClaimRewardParams {
  player: TransactionSigner;
  roundNumber: number;
}

export interface RegenerateTurnsParams {
  playerAddress: Address;
  roundNumber: number;
}

export interface ApplyIdleDecayParams {
  playerAddress: Address;
  roundNumber: number;
}

export interface EndRoundParams {
  admin: TransactionSigner;
  roundNumber: number;
}

export interface UpdateConfigParams {
  admin: TransactionSigner;
  entryFee?: number; // in SOL
  turnBasePrice?: number; // in SOL
  roundDuration?: number; // in seconds
  stealPercentage?: number; // 0-25
  idleDecayPercentage?: number; // 0-10
}

// ============== SDK CLASS ==============

export class PandaBattleSDK {
  constructor(private rpc: Rpc<SolanaRpcApi>) {}

  // ============== ADMIN INSTRUCTIONS ==============

  /**
   * Initialize the game configuration (one-time setup)
   */
  async initializeGameIx(params: InitializeGameParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [vaultPDA] = await getVaultPDA(gameConfigPDA);

    return await getInitializeGameInstructionAsync({
      admin: params.admin,
      gameConfig: gameConfigPDA,
      vault: vaultPDA,
      entryFee: BigInt(Math.floor(params.entryFee * 1e9)),
      turnBasePrice: BigInt(Math.floor(params.turnBasePrice * 1e9)),
      roundDuration: BigInt(params.roundDuration),
      stealPercentage: params.stealPercentage,
      idleDecayPercentage: params.idleDecayPercentage,
    });
  }

  /**
   * Create a new game round
   */
  async createRoundIx(params: CreateRoundParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const gameConfig = await fetchGameConfig(this.rpc, gameConfigPDA);
    const nextRoundNumber = Number(gameConfig.data.totalRounds) + 1;
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      nextRoundNumber
    );

    return await getCreateRoundInstructionAsync({
      admin: params.admin,
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
    });
  }

  /**
   * End the current round
   */
  async endRoundIx(params: EndRoundParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );

    return await getEndRoundInstructionAsync({
      admin: params.admin,
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
    });
  }

  /**
   * Update game configuration parameters
   */
  async updateConfigIx(params: UpdateConfigParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();

    return await getUpdateConfigInstructionAsync({
      admin: params.admin,
      gameConfig: gameConfigPDA,
      entryFee: params.entryFee
        ? BigInt(Math.floor(params.entryFee * 1e9))
        : undefined,
      turnBasePrice: params.turnBasePrice
        ? BigInt(Math.floor(params.turnBasePrice * 1e9))
        : undefined,
      roundDuration: params.roundDuration
        ? BigInt(params.roundDuration)
        : undefined,
      stealPercentage: params.stealPercentage,
      idleDecayPercentage: params.idleDecayPercentage,
    });
  }

  // ============== PLAYER INSTRUCTIONS ==============

  /**
   * Join the current round by paying entry fee
   */
  async joinRoundIx(params: JoinRoundParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.player.address
    );
    const [vaultPDA] = await getVaultPDA(gameConfigPDA);

    return await getJoinRoundInstructionAsync({
      player: params.player,
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
      vault: vaultPDA,
    });
  }

  /**
   * Purchase additional turns
   */
  async purchaseTurnsIx(params: PurchaseTurnsParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.player.address
    );
    const [vaultPDA] = await getVaultPDA(gameConfigPDA);

    return await getPurchaseTurnsInstructionAsync({
      player: params.player,
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
      vault: vaultPDA,
      amount: params.amount,
    });
  }

  /**
   * Initiate a battle against another player
   */
  async initiateBattleIx(params: InitiateBattleParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [attackerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.player.address
    );
    const [defenderStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.defenderAddress
    );

    return await getInitiateBattleInstructionAsync({
      player: params.player,
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      attackerState: attackerStatePDA,
      defenderState: defenderStatePDA,
      stealAttribute: { __kind: getAttributeTypeKind(params.stealAttribute) },
    });
  }

  /**
   * Claim rewards after round ends
   */
  async claimRewardIx(params: ClaimRewardParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.player.address
    );
    const [vaultPDA] = await getVaultPDA(gameConfigPDA);

    return await getClaimRewardInstructionAsync({
      player: params.player,
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
      vault: vaultPDA,
    });
  }

  // ============== CRANK INSTRUCTIONS ==============

  /**
   * Regenerate turns for a player (can be called by anyone)
   */
  async regenerateTurnsIx(params: RegenerateTurnsParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.playerAddress
    );

    return await getRegenerateTurnsInstructionAsync({
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
    });
  }

  /**
   * Apply idle decay to inactive player (can be called by anyone)
   */
  async applyIdleDecayIx(params: ApplyIdleDecayParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.playerAddress
    );

    return await getApplyIdleDecayInstructionAsync({
      gameConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
    });
  }

  // ============== FETCH METHODS ==============

  /**
   * Fetch the game configuration
   */
  async getGameConfig(): Promise<GameConfig> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const account = await fetchGameConfig(this.rpc, gameConfigPDA);
    return mapGameConfig(account.data);
  }

  /**
   * Fetch a game round
   */
  async getGameRound(roundNumber: number): Promise<GameRound> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(gameConfigPDA, roundNumber);
    const account = await fetchGameRound(this.rpc, gameRoundPDA);
    return mapGameRound(account.data);
  }

  /**
   * Fetch a player's state for a specific round
   */
  async getPlayerState(
    roundNumber: number,
    playerAddress: Address
  ): Promise<PlayerState> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(gameConfigPDA, roundNumber);
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      playerAddress
    );
    const account = await fetchPlayerState(this.rpc, playerStatePDA);
    return mapPlayerState(account.data);
  }

  // ============== UTILITY METHODS ==============

  /**
   * Get the game config PDA address
   */
  async getGameConfigAddress(): Promise<Address> {
    const [pda] = await getGameConfigPDA();
    return pda;
  }

  /**
   * Get the vault PDA address
   */
  async getVaultAddress(): Promise<Address> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [vaultPDA] = await getVaultPDA(gameConfigPDA);
    return vaultPDA;
  }

  /**
   * Get a game round PDA address
   */
  async getGameRoundAddress(roundNumber: number): Promise<Address> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(gameConfigPDA, roundNumber);
    return gameRoundPDA;
  }

  /**
   * Get a player state PDA address
   */
  async getPlayerStateAddress(
    roundNumber: number,
    playerAddress: Address
  ): Promise<Address> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(gameConfigPDA, roundNumber);
    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      playerAddress
    );
    return playerStatePDA;
  }
}

// ============== HELPER FUNCTIONS ==============

function getAttributeTypeKind(
  attr: AttributeType
): "Strength" | "Speed" | "Endurance" | "Luck" {
  switch (attr) {
    case 0:
      return "Strength";
    case 1:
      return "Speed";
    case 2:
      return "Endurance";
    case 3:
      return "Luck";
    default:
      throw new Error(`Invalid attribute type: ${attr}`);
  }
}

// Re-export types and utilities
export * from "./types";
export * from "./pda";
export * from "./generated";
