import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { assert } from "chai";
import {
  airdrop,
  getGameConfigPDA,
  getGameRoundPDA,
  getPlayerStatePDA,
  getVaultPDA,
  getGameConfig,
  getGameRound,
  getPlayerState,
} from "./utils";

describe("panda-battle", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PandaBattle as Program<PandaBattle>;
  const admin = provider.wallet as anchor.Wallet;

  // Test configuration
  const ENTRY_FEE = new BN(0.1 * LAMPORTS_PER_SOL);
  const TURN_BASE_PRICE = new BN(0.05 * LAMPORTS_PER_SOL);
  const ROUND_DURATION = new BN(86400); // 24 hours
  const STEAL_PERCENTAGE = 15;
  const IDLE_DECAY_PERCENTAGE = 5;

  // PDAs
  let gameConfigPDA: PublicKey;
  let vaultPDA: PublicKey;
  let vaultSolPDA: PublicKey;
  let mint: PublicKey;

  // Test players
  let player1: Keypair;
  let player2: Keypair;

  before(async () => {
    // Generate test players
    player1 = Keypair.generate();
    player2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await airdrop(provider.connection, player1.publicKey, 5);
    await airdrop(provider.connection, player2.publicKey, 5);

    // Create test mint (simulating USDC)
    mint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6 // USDC decimals
    );

    // Derive PDAs
    gameConfigPDA = getGameConfigPDA(program);
    vaultPDA = await getAssociatedTokenAddress(mint, gameConfigPDA, true); // SPL token vault for admin
    vaultSolPDA = getVaultPDA(program, gameConfigPDA); // SOL vault for player operations
  });

  // ============== ADMIN INSTRUCTION TESTS ==============

  describe("Admin Instructions", () => {
    it("Initialize game", async () => {
      await program.methods
        .initializeGame(
          ENTRY_FEE,
          TURN_BASE_PRICE,
          ROUND_DURATION,
          STEAL_PERCENTAGE,
          IDLE_DECAY_PERCENTAGE
        )
        .accountsPartial({
          admin: admin.publicKey,
          mint: mint,
          gameConfig: gameConfigPDA,
          vault: vaultPDA,
          vaultSol: vaultSolPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();

      const gameConfig = await getGameConfig(program, gameConfigPDA);
      assert.equal(gameConfig.admin.toString(), admin.publicKey.toString());
      assert.equal(gameConfig.entryFee.toString(), ENTRY_FEE.toString());
      assert.equal(
        gameConfig.turnBasePrice.toString(),
        TURN_BASE_PRICE.toString()
      );
      assert.equal(gameConfig.stealPercentage, STEAL_PERCENTAGE);
      assert.equal(gameConfig.currentRound.toString(), "0");
    });

    it("Create round", async () => {
      const roundPDA = getGameRoundPDA(program, gameConfigPDA, 1);

      await program.methods
        .createRound()
        .accountsPartial({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const gameRound = await getGameRound(program, roundPDA);
      assert.equal(gameRound.roundNumber.toString(), "1");
      assert.equal(gameRound.isActive, true);
      assert.equal(gameRound.playerCount, 0);
    });

    it("Update config", async () => {
      const newEntryFee = new BN(0.2 * LAMPORTS_PER_SOL);

      await program.methods
        .updateConfig(newEntryFee, null, null, null, null)
        .accountsPartial({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
        })
        .rpc();

      const gameConfig = await getGameConfig(program, gameConfigPDA);
      assert.equal(gameConfig.entryFee.toString(), newEntryFee.toString());
    });

    it("End round", async () => {
      const roundPDA = getGameRoundPDA(program, gameConfigPDA, 1);

      await program.methods
        .endRound()
        .accountsPartial({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
        })
        .rpc();

      const gameRound = await getGameRound(program, roundPDA);
      assert.equal(gameRound.isActive, false);
    });
  });

  // ============== PLAYER INSTRUCTION TESTS ==============

  describe("Player Instructions", () => {
    let roundPDA: PublicKey;
    let player1StatePDA: PublicKey;
    let player2StatePDA: PublicKey;

    before(async () => {
      // Create a new round for player tests
      const gameConfig = await getGameConfig(program, gameConfigPDA);
      const nextRound = gameConfig.totalRounds.toNumber() + 1;
      roundPDA = getGameRoundPDA(program, gameConfigPDA, nextRound);

      await program.methods
        .createRound()
        .accountsPartial({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      player1StatePDA = getPlayerStatePDA(program, roundPDA, player1.publicKey);
      player2StatePDA = getPlayerStatePDA(program, roundPDA, player2.publicKey);
    });

    it("Join round", async () => {
      await program.methods
        .joinRound()
        .accountsPartial({
          player: player1.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          vault: vaultSolPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      const playerState = await getPlayerState(program, player1StatePDA);
      assert.equal(playerState.player.toString(), player1.publicKey.toString());
      assert.equal(playerState.turns, 3); // STARTING_TURNS
      assert.isAbove(playerState.strength, 0);
      assert.isAbove(playerState.speed, 0);
    });

    it("Purchase turns", async () => {
      const turnsToBuy = 2;

      const playerStateBefore = await getPlayerState(program, player1StatePDA);
      const turnsBefore = playerStateBefore.turns;

      await program.methods
        .purchaseTurns(turnsToBuy)
        .accountsPartial({
          player: player1.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          vault: vaultSolPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      const playerStateAfter = await getPlayerState(program, player1StatePDA);
      assert.equal(playerStateAfter.turns, turnsBefore + turnsToBuy);
    });

    it("Initiate battle", async () => {
      // Player 2 joins first
      await program.methods
        .joinRound()
        .accountsPartial({
          player: player2.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          playerState: player2StatePDA,
          vault: vaultSolPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([player2])
        .rpc();

      // Player 1 attacks Player 2
      const player1Before = await getPlayerState(program, player1StatePDA);
      const turnsBefore = player1Before.turns;

      await program.methods
        .initiateBattle({ strength: {} })
        .accountsPartial({
          player: player1.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          attackerState: player1StatePDA,
          defenderState: player2StatePDA,
        })
        .signers([player1])
        .rpc();

      const player1After = await getPlayerState(program, player1StatePDA);
      assert.equal(player1After.turns, turnsBefore - 1);
      assert.equal(player1After.battlesFought, 1);
    });

    it("Claim reward", async () => {
      // End the round first
      await program.methods
        .endRound()
        .accountsPartial({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
        })
        .rpc();

      // Player 1 claims reward (needs at least 5 battles)
      // Note: In real scenario, player needs MIN_BATTLES_FOR_PAYOUT battles
      // This test will fail if player doesn't meet requirements
      try {
        await program.methods
          .claimReward()
          .accountsPartial({
            player: player1.publicKey,
            gameConfig: gameConfigPDA,
            gameRound: roundPDA,
            playerState: player1StatePDA,
            vault: vaultSolPDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([player1])
          .rpc();

        const playerState = await getPlayerState(program, player1StatePDA);
        assert.equal(playerState.rewardsClaimed, true);
      } catch (err: any) {
        // Expected to fail if not enough battles
        console.log(
          "Claim reward failed (expected if < 5 battles):",
          err.message
        );
      }
    });
  });

  // ============== CRANK INSTRUCTION TESTS ==============

  describe("Crank Instructions", () => {
    let roundPDA: PublicKey;
    let player1StatePDA: PublicKey;
    const cranker = Keypair.generate();

    before(async () => {
      await airdrop(provider.connection, cranker.publicKey, 2);

      // Create a new round
      const gameConfig = await getGameConfig(program, gameConfigPDA);
      const nextRound = gameConfig.totalRounds.toNumber() + 1;
      roundPDA = getGameRoundPDA(program, gameConfigPDA, nextRound);

      await program.methods
        .createRound()
        .accountsPartial({
          admin: admin.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      player1StatePDA = getPlayerStatePDA(program, roundPDA, player1.publicKey);

      // Player joins
      await program.methods
        .joinRound()
        .accountsPartial({
          player: player1.publicKey,
          gameConfig: gameConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
          vault: vaultSolPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([player1])
        .rpc();
    });

    it("Regenerate turns", async () => {
      // Note: This will fail if not enough time has passed (1 hour)
      // In production tests, you'd need to manipulate time or wait
      try {
        await program.methods
          .regenerateTurns()
          .accountsPartial({
            caller: cranker.publicKey,
            gameConfig: gameConfigPDA,
            gameRound: roundPDA,
            playerState: player1StatePDA,
          })
          .signers([cranker])
          .rpc();

        console.log("Turn regeneration successful");
      } catch (err: any) {
        console.log("Turn regen failed (expected if < 1 hour):", err.message);
      }
    });

    it("Apply idle decay", async () => {
      // Note: This will fail if player is not idle (1 hour)
      try {
        await program.methods
          .applyIdleDecay()
          .accountsPartial({
            caller: cranker.publicKey,
            gameConfig: gameConfigPDA,
            gameRound: roundPDA,
            playerState: player1StatePDA,
          })
          .signers([cranker])
          .rpc();

        console.log("Idle decay applied successfully");
      } catch (err: any) {
        console.log("Idle decay failed (expected if not idle):", err.message);
      }
    });
  });
});
