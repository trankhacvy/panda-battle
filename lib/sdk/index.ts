/**
 * Panda Battle SDK - Main service class for interacting with the Panda Battle program
 */

import {
  type Address,
  type Rpc,
  type SolanaRpcApi,
  type Instruction,
  type TransactionSigner,
  address,
  getProgramDerivedAddress,
  getAddressEncoder,
} from "@solana/kit";
import {
  getCreateAssociatedTokenInstructionAsync,
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
  getMintToInstruction,
  findAssociatedTokenPda,
} from "@solana-program/token";
import {
  getInitializeGameInstructionAsync,
  getCreateRoundInstructionAsync,
  getConfirmJoinRoundInstructionAsync,
  getGeneratePandaAttributesInstructionAsync,
  getBuyAttackPacksInstructionAsync,
  getRerollAttributesInstructionAsync,
  getInitiateBattleInstructionAsync,
  getClaimPrizeInstructionAsync,
  getDistributePrizesInstructionAsync,
  getRevealLeaderboardInstructionAsync,
  getEndRoundInstruction,
  getUpdateConfigInstruction,
  PANDA_BATTLE_PROGRAM_ADDRESS,
} from "./generated";
import {
  fetchGlobalConfig,
  fetchGameRound,
  fetchPlayerState,
  fetchLeaderboard,
  type GlobalConfig as GeneratedGameConfig,
  type GameRound as GeneratedGameRound,
  type PlayerState as GeneratedPlayerState,
  type Leaderboard as GeneratedLeaderboard,
} from "./generated/accounts";
import {
  getGameConfigPDA,
  getVaultPDA,
  getGameRoundPDA,
  getPlayerStatePDA,
  getLeaderboardPDA,
  getProgramIdentityPDA,
  getTokenVaultPda,
  getGameAuthorityPDA,
} from "./pda";
import {
  type GameConfig,
  type GameRound,
  type PlayerState,
  mapGameConfig,
  mapGameRound,
  mapPlayerState,
} from "./types";
import {
  DEFAULT_QUEUE,
  DELEGATION_PROGRAM_ID,
  PLATFORM_CONFIG,
} from "@/configs/constants";

// ============== TYPES ==============

export interface InitializeGameParams {
  admin: TransactionSigner;
  id: number;
}

export interface CreateRoundParams {
  admin: TransactionSigner;
  tokenMint: Address;
  entryFee: number; // in token units (will be converted to smallest unit)
  attackPackPrice: number; // in token units
  durationSecs: number; // in seconds
  entryHourlyIncPct: number; // percentage (e.g., 1 for 1%)
}

export interface ConfirmJoinRoundParams {
  player: TransactionSigner;
  gameRound: Address;
}

export interface GeneratePandaAttributesParams {
  rpc: Rpc<SolanaRpcApi>;
  player: TransactionSigner;
  gameRound: Address;
}

export interface BuyAttackPacksParams {
  player: TransactionSigner;
  roundNumber: number;
  playerTokenAccount: Address;
  amount: number; // 1-3
}

export interface RerollAttributesParams {
  player: TransactionSigner;
  rpc: Rpc<SolanaRpcApi>;
}

export interface InitiateBattleParams {
  player: TransactionSigner;
  roundNumber: number;
  defenderAddress: Address;
}

export interface ClaimPrizeParams {
  player: TransactionSigner;
  roundNumber: number;
  playerTokenAccount: Address;
}

export interface RegenerateTurnsParams {
  playerAddress: Address;
  roundNumber: number;
}

export interface EndRoundParams {
  admin: TransactionSigner;
  roundNumber: number;
}

export interface DistributePrizesParams {
  admin: TransactionSigner;
  roundNumber: number;
}

export interface RevealLeaderboardParams {
  roundNumber: number;
}

export interface UpdateConfigParams {
  admin: TransactionSigner;
  id?: number;
}

// ============== SDK CLASS ==============

export class PandaBattleSDK {
  constructor() {}

  // ============== ADMIN INSTRUCTIONS ==============

  /**
   * Initialize the game configuration (one-time setup)
   */
  async initializeGameIx(params: InitializeGameParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();

    return await getInitializeGameInstructionAsync({
      admin: params.admin,
      globalConfig: gameConfigPDA,
      id: BigInt(params.id),
    });
  }

  /**
   * Create a new game round
   */
  async createRoundIx(params: CreateRoundParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const gameConfig = await this.getGameConfig();
    const nextRoundNumber = gameConfig.currentRound + 1;
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      nextRoundNumber
    );
    const [vaultPDA] = await getVaultPDA(gameConfigPDA);

    return await getCreateRoundInstructionAsync({
      admin: params.admin,
      mint: params.tokenMint,
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      vault: vaultPDA,
      entryFee: BigInt(Math.floor(params.entryFee * 1e6)), // Assuming 6 decimals
      attackPackPrice: BigInt(Math.floor(params.attackPackPrice * 1e6)),
      durationSecs: BigInt(params.durationSecs),
      entryHourlyIncPct: params.entryHourlyIncPct,
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

    return getEndRoundInstruction({
      admin: params.admin,
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
    });
  }

  /**
   * Distribute prizes to top players after round ends
   */
  async distributePrizesIx(
    params: DistributePrizesParams
  ): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [leaderboardPDA] = await getLeaderboardPDA(gameRoundPDA);
    // const [vaultPDA] = await getVaultPDA(gameConfigPDA);

    return await getDistributePrizesInstructionAsync({
      caller: params.admin,
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      leaderboard: leaderboardPDA,
      // vault: vaultPDA,
    });
  }

  /**
   * Update game configuration parameters
   */
  async updateConfigIx(params: UpdateConfigParams): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();

    return getUpdateConfigInstruction({
      admin: params.admin,
      globalConfig: gameConfigPDA,
      // id: params.id ? BigInt(params.id) : undefined,
      tokenMint: address("123"),
    });
  }

  // ============== PLAYER INSTRUCTIONS ==============

  /**
   * Confirm joining the current round by paying entry fee
   */
  async confirmJoinRoundIx(
    params: ConfirmJoinRoundParams
  ): Promise<Instruction> {
    const [playerStatePDA] = await getPlayerStatePDA(
      params.gameRound,
      params.player.address
    );

    const [buffer] = await getProgramDerivedAddress({
      programAddress: PANDA_BATTLE_PROGRAM_ADDRESS,
      seeds: ["buffer", getAddressEncoder().encode(playerStatePDA)],
    });

    const [delegationRecord] = await getProgramDerivedAddress({
      programAddress: DELEGATION_PROGRAM_ID,
      seeds: ["delegation", getAddressEncoder().encode(playerStatePDA)],
    });

    const [delegationMetadata] = await getProgramDerivedAddress({
      programAddress: DELEGATION_PROGRAM_ID,
      seeds: [
        "delegation-metadata",
        getAddressEncoder().encode(playerStatePDA),
      ],
    });

    return await getConfirmJoinRoundInstructionAsync({
      player: params.player,
      gameRound: params.gameRound,
      playerState: playerStatePDA,
      buffer,
      delegationRecord,
      delegationMetadata,
      delegationProgram: DELEGATION_PROGRAM_ID,
    });
  }

  /**
   * Generate panda attributes for a new player (requires VRF)
   */
  async generatePandaAttributesIx(
    params: GeneratePandaAttributesParams
  ): Promise<{
    instruction: Instruction;
    playerStateAddress: Address;
  }> {
    const gameRound = await fetchGameRound(params.rpc, params.gameRound);

    if (!gameRound) throw new Error("Game round not found");

    const [playerStatePDA] = await getPlayerStatePDA(
      params.gameRound,
      params.player.address
    );

    const [programIdentityPda] = await getProgramIdentityPDA();

    console.log("gameRound mint", gameRound.data.tokenMint);
    console.log("player address", params.player.address);

    // const vaultPDA = await getAssociatedTokenAddress(mint, roundPDA, true);
    const [vaultPDA] = await getTokenVaultPda(
      gameRound.data.tokenMint,
      params.gameRound
    );
    console.log("vaultPDA", vaultPDA);

    const [playerTokenAccount] = await findAssociatedTokenPda({
      mint: gameRound.data.tokenMint,
      owner: params.player.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log("playerTokenAccount", playerTokenAccount);

    const [gameAuthority] = await getGameAuthorityPDA();

    const ix = await getGeneratePandaAttributesInstructionAsync({
      player: params.player,
      gameAuthority: gameAuthority,
      gameRound: params.gameRound,
      playerState: playerStatePDA,
      playerTokenAccount,
      vault: vaultPDA,
      programIdentity: programIdentityPda,
      oracleQueue: DEFAULT_QUEUE,
      clientSeed: Math.floor(Math.random() * 254) + 1,
    });

    return {
      instruction: ix,
      playerStateAddress: playerStatePDA,
    };
  }

  /**
   * Buy attack packs (additional turns)
   */
  async buyAttackPacksIx(params: BuyAttackPacksParams): Promise<Instruction> {
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

    return await getBuyAttackPacksInstructionAsync({
      player: params.player,
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
      playerTokenAccount: params.playerTokenAccount,
      vault: vaultPDA,
      numPacks: params.amount,
    });
  }

  /**
   * Reroll attributes (limited rerolls available)
   */
  async rerollAttributesIx(
    params: RerollAttributesParams
  ): Promise<{ instruction: Instruction; playerStateAddress: Address }> {
    const config = await fetchGlobalConfig(params.rpc, PLATFORM_CONFIG);
    if (!config) throw new Error("Global config not found");

    const [gameRoundPDA] = await getGameRoundPDA(
      PLATFORM_CONFIG,
      Number(config.data.currentRound)
    );

    const gameRound = await fetchGameRound(params.rpc, gameRoundPDA);

    if (!gameRound) throw new Error("Game round not found");

    const [playerStatePDA] = await getPlayerStatePDA(
      gameRoundPDA,
      params.player.address
    );

    const [programIdentityPda] = await getProgramIdentityPDA();

    console.log("gameRound mint", gameRound.data.tokenMint);
    console.log("player address", params.player.address);

    // const vaultPDA = await getAssociatedTokenAddress(mint, roundPDA, true);
    const [vaultPDA] = await getTokenVaultPda(
      gameRound.data.tokenMint,
      gameRoundPDA
    );
    console.log("vaultPDA", vaultPDA);

    const [playerTokenAccount] = await findAssociatedTokenPda({
      mint: gameRound.data.tokenMint,
      owner: params.player.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });
    console.log("playerTokenAccount", playerTokenAccount);

    const [gameAuthority] = await getGameAuthorityPDA();

    const ix = await getRerollAttributesInstructionAsync({
      player: params.player,
      // globalConfig: PLATFORM_CONFIG,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
      playerTokenAccount: playerTokenAccount,
      vault: vaultPDA,
      programIdentity: programIdentityPda,
      oracleQueue: DEFAULT_QUEUE,
      gameAuthority: gameAuthority,
      clientSeed: Math.floor(Math.random() * 254) + 1,
    });

    return { instruction: ix, playerStateAddress: playerStatePDA };
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
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      attackerState: attackerStatePDA,
      defenderState: defenderStatePDA,
    });
  }

  /**
   * Claim prize after round ends
   */
  async claimPrizeIx(params: ClaimPrizeParams): Promise<Instruction> {
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

    return await getClaimPrizeInstructionAsync({
      player: params.player,
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
      playerTokenAccount: params.playerTokenAccount,
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
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      playerState: playerStatePDA,
    });
  }

  /**
   * Reveal the leaderboard for a round (after reveal timestamp)
   */
  async revealLeaderboardIx(
    params: RevealLeaderboardParams
  ): Promise<Instruction> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(
      gameConfigPDA,
      params.roundNumber
    );
    const [leaderboardPDA] = await getLeaderboardPDA(gameRoundPDA);

    return await getRevealLeaderboardInstructionAsync({
      globalConfig: gameConfigPDA,
      gameRound: gameRoundPDA,
      leaderboard: leaderboardPDA,
    });
  }

  // ============== FETCH METHODS ==============

  /**
   * Fetch the game configuration
   */
  async getGameConfig(): Promise<GameConfig> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const account = await fetchGlobalConfig(this.rpc, gameConfigPDA);
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

  /**
   * Fetch the leaderboard for a specific round
   */
  async getLeaderboard(roundNumber: number): Promise<GeneratedLeaderboard> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(gameConfigPDA, roundNumber);
    const [leaderboardPDA] = await getLeaderboardPDA(gameRoundPDA);
    const account = await fetchLeaderboard(this.rpc, leaderboardPDA);
    return account.data;
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

  /**
   * Get a leaderboard PDA address
   */
  async getLeaderboardAddress(roundNumber: number): Promise<Address> {
    const [gameConfigPDA] = await getGameConfigPDA();
    const [gameRoundPDA] = await getGameRoundPDA(gameConfigPDA, roundNumber);
    const [leaderboardPDA] = await getLeaderboardPDA(gameRoundPDA);
    return leaderboardPDA;
  }
}

export const sdk = new PandaBattleSDK();

// Re-export types and utilities
export * from "./types";
export * from "./pda";
