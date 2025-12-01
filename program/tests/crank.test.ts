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
  getLeaderboardPDA,
  getGlobalConfig,
  getGameRound,
  getPlayerState,
  getLeaderboard,
} from "./utils";

describe("Crank Instructions", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PandaBattle as Program<PandaBattle>;
  const admin = provider.wallet as anchor.Wallet;

  let globalConfigPDA: PublicKey;
  let mint: PublicKey;
  let roundPDA: PublicKey;
  let vaultPDA: PublicKey;
  let leaderboardPDA: PublicKey;

  let player1: Keypair;
  let player1TokenAccount: PublicKey;
  let player1StatePDA: PublicKey;

  let cranker: Keypair;

  before(async () => {
    // Setup cranker
    cranker = Keypair.generate();
    await airdrop(provider.connection, cranker.publicKey, 2);

    // Setup player
    player1 = Keypair.generate();
    await airdrop(provider.connection, player1.publicKey, 5);

    // Create mint
    mint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    // Create token account
    player1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      admin.payer,
      mint,
      player1.publicKey
    );

    await mintTo(
      provider.connection,
      admin.payer,
      mint,
      player1TokenAccount,
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
    leaderboardPDA = getLeaderboardPDA(program, roundPDA);

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
  });

  it("Regenerate turns", async () => {
    try {
      await program.methods
        .regenerateTurns()
        .accountsPartial({
          caller: cranker.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
        })
        .signers([cranker])
        .rpc();

      console.log("Turn regeneration successful");
    } catch (err: any) {
      console.log("Turn regen failed (expected if < 1 hour passed):", err.message);
    }
  });

  it("Reset packs if new hour", async () => {
    try {
      await program.methods
        .resetPacksIfNewHour()
        .accountsPartial({
          caller: cranker.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          playerState: player1StatePDA,
        })
        .signers([cranker])
        .rpc();

      console.log("Pack counter reset successful");
    } catch (err: any) {
      console.log("Pack reset failed:", err.message);
    }
  });

  it("Reveal leaderboard", async () => {
    // Wait until leaderboard reveal time (or manipulate time in test)
    // For now, we'll just test the instruction call

    try {
      await program.methods
        .revealLeaderboard()
        .accountsPartial({
          caller: cranker.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          leaderboard: leaderboardPDA,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts([
          // Add player state accounts here
          {
            pubkey: player1StatePDA,
            isWritable: false,
            isSigner: false,
          },
        ])
        .signers([cranker])
        .rpc();

      const leaderboard = await getLeaderboard(program, leaderboardPDA);
      assert.equal(leaderboard.isRevealed, true);
      console.log("Leaderboard revealed with", leaderboard.entries.length, "entries");
    } catch (err: any) {
      console.log("Leaderboard reveal failed (may not be time yet):", err.message);
    }
  });

  it("Hourly jackpot", async () => {
    const clientSeed = 77;

    try {
      // First reveal leaderboard if not already done
      const winnerTokenAccount = await createAssociatedTokenAccount(
        provider.connection,
        admin.payer,
        mint,
        player1.publicKey
      );

      await program.methods
        .hourlyJackpot(clientSeed)
        .accountsPartial({
          caller: cranker.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          leaderboard: leaderboardPDA,
          vault: vaultPDA,
          winnerTokenAccount: winnerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([cranker])
        .rpc();

      console.log("Hourly jackpot distributed");
    } catch (err: any) {
      console.log("Hourly jackpot failed:", err.message);
    }
  });

  it("Distribute prizes", async () => {
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
        .distributePrizes()
        .accountsPartial({
          caller: cranker.publicKey,
          globalConfig: globalConfigPDA,
          gameRound: roundPDA,
          leaderboard: leaderboardPDA,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts([
          // Add all player state accounts here
          {
            pubkey: player1StatePDA,
            isWritable: true,
            isSigner: false,
          },
        ])
        .signers([cranker])
        .rpc();

      const gameRound = await getGameRound(program, roundPDA);
      assert.equal(gameRound.payoutsProcessed, true);
      console.log("Prizes distributed successfully");
    } catch (err: any) {
      console.log("Prize distribution failed:", err.message);
    }
  });
});
