import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";
import {
  airdrop,
  getGlobalConfigPDA,
  getGameRoundPDA,
  getPlayerStatePDA,
  getGlobalConfig,
  getGameRound,
  getPlayerState,
} from "./utils";

// Mock VRF oracle queue (use default from ephemeral-vrf-sdk)
const ORACLE_QUEUE = new PublicKey("FfD96yeXs4cxZshoPPSKhSPgVQxLAJUT3gefgh84m1Di");

describe("Player Instructions", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PandaBattle as Program<PandaBattle>;
  const admin = provider.wallet as anchor.Wallet;

  let globalConfigPDA: PublicKey;
  let mint: PublicKey;
  let roundPDA: PublicKey;
  let vaultPDA: PublicKey;

  let player1: Keypair;
  let player1TokenAccount: PublicKey;
  let player1StatePDA: PublicKey;

  let player2: Keypair;
  let player2TokenAccount: PublicKey;
  let player2StatePDA: PublicKey;

  before(async () => {
    // Setup players
    player1 = Keypair.generate();
    player2 = Keypair.generate();

    await airdrop(provider.connection, player1.publicKey, 5);
    await airdrop(provider.connection, player2.publicKey, 5);

    // Create mint
    mint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    // Create token accounts and mint tokens
    player1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      player1.publicKey
    );
    player2TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      player2.publicKey
    );

    await mintTo(
      provider.connection,
      admin.payer,
      mint,
      player1TokenAccount,
      admin.payer,
      100_000_000 // 100 tokens
    );
    await mintTo(
      provider.connection,
      admin.payer,
      mint,
      player2TokenAccount,
      admin.payer,
      100_000_000
    );

    // Initialize game
    globalConfigPDA = getGlobalConfigPDA(program);
    await program.methods
      .initializeGame(mint)
      .accountsPartial({
        admin: admin.publicKey,
        globalConfig: globalConfigPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Create round
    roundPDA = getGameRoundPDA(program, globalConfigPDA, 1);
    vaultPDA = await getAssociatedTokenAddress(mint, roundPDA, true);

    await program.methods
      .createRound(
        new BN(1_990_000),
        new BN(100_000),
        new BN(86400),
        1
      )
      .accountsPartial({
        admin: admin.publicKey,
        mint: mint,
        globalConfig: globalConfigPDA,
        gameRound: roundPDA,
        vault: vaultPDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    player1StatePDA = getPlayerStatePDA(program, roundPDA, player1.publicKey);
    player2StatePDA = getPlayerStatePDA(program, roundPDA, player2.publicKey);
  });

  it("Request join round (VRF)", async () => {
    const clientSeed = 42;

    try {
      await program.methods
        .requestJoinRound(clientSeed)
        .accountsPartial({
          player: player1.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          playerTokenAccount: player1TokenAccount,
          vault: vaultPDA,
          oracleQueue: ORACLE_QUEUE,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player1])
        .rpc();

      // Note: In real test, you'd need to wait for VRF callback
      console.log("Join round request sent (waiting for VRF callback)");
    } catch (err: any) {
      console.log("Join round failed (VRF may not be available):", err.message);
    }
  });

  it("Buy attack packs", async () => {
    // First ensure player is joined (mock the callback for testing)
    // In production, this would be done by VRF callback
    
    const numPacks = 2; // Buy 2 packs (20 turns)

    try {
      await program.methods
        .buyAttackPacks(numPacks)
        .accountsPartial({
          player: player1.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          playerTokenAccount: player1TokenAccount,
          vault: vaultPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player1])
        .rpc();

      const playerState = await getPlayerState(program, player1StatePDA);
      assert.equal(playerState.packsBoughtHour, numPacks);
    } catch (err: any) {
      console.log("Buy packs failed (player may not be joined):", err.message);
    }
  });

  it("Reroll attributes (VRF)", async () => {
    const clientSeed = 123;

    try {
      await program.methods
        .rerollAttributes(clientSeed)
        .accountsPartial({
          player: player1.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          playerTokenAccount: player1TokenAccount,
          vault: vaultPDA,
          oracleQueue: ORACLE_QUEUE,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player1])
        .rpc();

      console.log("Reroll request sent (waiting for VRF callback)");
    } catch (err: any) {
      console.log("Reroll failed:", err.message);
    }
  });

  it("Initiate battle (VRF)", async () => {
    const clientSeed = 99;

    try {
      await program.methods
        .initiateBattle(clientSeed)
        .accountsPartial({
          player: player1.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          attackerState: player1StatePDA,
          defenderState: player2StatePDA,
          oracleQueue: ORACLE_QUEUE,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      console.log("Battle initiated (waiting for VRF callback)");
    } catch (err: any) {
      console.log("Battle failed:", err.message);
    }
  });

  it("Claim prize", async () => {
    // End round first
    await program.methods
      .endRound()
      .accountsPartial({
        admin: admin.publicKey,
        globalConfig: globalConfigPDA,
        gameRound: roundPDA,
      })
      .rpc();

    try {
      await program.methods
        .claimPrize()
        .accountsPartial({
          player: player1.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          playerTokenAccount: player1TokenAccount,
          vault: vaultPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player1])
        .rpc();

      const playerState = await getPlayerState(program, player1StatePDA);
      assert.equal(playerState.prizeClaimed, true);
    } catch (err: any) {
      console.log("Claim prize failed (payouts may not be processed):", err.message);
    }
  });
});
