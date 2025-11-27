import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { expect } from "chai";

describe("player", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.pandaBattle as Program<PandaBattle>;
  const provider = anchor.getProvider();

  let playerKeypair: anchor.web3.Keypair;
  let playerProfilePda: anchor.web3.PublicKey;
  let playerProfileBump: number;
  let playerProgressPda: anchor.web3.PublicKey;
  let playerProgressBump: number;

  before(async () => {
    // Generate a new keypair for the player
    playerKeypair = anchor.web3.Keypair.generate();

    // Airdrop SOL to the player
    const airdropSignature = await provider.connection.requestAirdrop(
      playerKeypair.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Find PDAs
    [playerProfilePda, playerProfileBump] = 
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("player_profile"),
          playerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );

    [playerProgressPda, playerProgressBump] = 
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("player_progress"),
          playerKeypair.publicKey.toBuffer(),
        ],
        program.programId
      );
  });

  describe("initialize_player", () => {
    it("should initialize a new player with valid name", async () => {
      const playerName = "TestPanda";

      const tx = await program.methods
        .initializePlayer(playerName)
        .accounts({
          signer: playerKeypair.publicKey,
          playerProfile: playerProfilePda,
          playerProgress: playerProgressPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([playerKeypair])
        .rpc();

      console.log("✓ Player initialized with tx:", tx);

      // Verify the profile was created
      const profile = await program.account.playerProfile.fetch(playerProfilePda);
      expect(profile.playerPubkey).to.eql(playerKeypair.publicKey);
      expect(profile.name).to.equal(playerName);
      expect(profile.bump).to.equal(playerProfileBump);
      expect(profile.totalWins).to.equal(0);
      expect(profile.totalLosses).to.equal(0);
      expect(profile.currentRating).to.equal(1200); // Starting rating
      expect(profile.peakRating).to.equal(1200);
      expect(profile.totalXp).to.equal(0);
      expect(profile.level).to.equal(1);
      expect(profile.pandasOwned).to.equal(0);
      expect(profile.totalBambooEarned).to.equal(0);
      expect(profile.version).to.equal(1);
      expect(profile.isBanned).to.equal(false);

      // Verify the progress was created
      const progress = await program.account.playerProgress.fetch(playerProgressPda);
      expect(progress.playerPubkey).to.eql(playerKeypair.publicKey);
      expect(progress.bump).to.equal(playerProgressBump);
      expect(progress.battlesCompleted).to.equal(0);
      expect(progress.consecutiveWins).to.equal(0);
      expect(progress.maxConsecutiveWins).to.equal(0);
      expect(progress.dailyBattlesPlayed).to.equal(0);
      expect(progress.dailyPandasForged).to.equal(0);
      expect(progress.totalXpEarned).to.equal(0);
      expect(progress.version).to.equal(1);
    });

    it("should prevent duplicate player initialization", async () => {
      const anotherPlayerKeypair = anchor.web3.Keypair.generate();
      
      const airdropSignature = await provider.connection.requestAirdrop(
        anotherPlayerKeypair.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      const [anotherProfilePda] = 
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("player_profile"),
            anotherPlayerKeypair.publicKey.toBuffer(),
          ],
          program.programId
        );

      const [anotherProgressPda] = 
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("player_progress"),
            anotherPlayerKeypair.publicKey.toBuffer(),
          ],
          program.programId
        );

      // Initialize once
      await program.methods
        .initializePlayer("Player1")
        .accounts({
          signer: anotherPlayerKeypair.publicKey,
          playerProfile: anotherProfilePda,
          playerProgress: anotherProgressPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([anotherPlayerKeypair])
        .rpc();

      // Try to initialize again - should fail
      try {
        await program.methods
          .initializePlayer("Player2")
          .accounts({
            signer: anotherPlayerKeypair.publicKey,
            playerProfile: anotherProfilePda,
            playerProgress: anotherProgressPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([anotherPlayerKeypair])
          .rpc();
        
        throw new Error("Should have failed on duplicate initialization");
      } catch (err) {
        expect(err.error.errorCode.code).to.equal("AccountAlreadyInitialized");
      }
    });

    it("should reject invalid name lengths", async () => {
      const invalidPlayerKeypair = anchor.web3.Keypair.generate();
      
      const airdropSignature = await provider.connection.requestAirdrop(
        invalidPlayerKeypair.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      const [invalidProfilePda] = 
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("player_profile"),
            invalidPlayerKeypair.publicKey.toBuffer(),
          ],
          program.programId
        );

      const [invalidProgressPda] = 
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("player_progress"),
            invalidPlayerKeypair.publicKey.toBuffer(),
          ],
          program.programId
        );

      // Try with empty name
      try {
        await program.methods
          .initializePlayer("")
          .accounts({
            signer: invalidPlayerKeypair.publicKey,
            playerProfile: invalidProfilePda,
            playerProgress: invalidProgressPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([invalidPlayerKeypair])
          .rpc();
        
        throw new Error("Should have failed with empty name");
      } catch (err) {
        expect(err.error.errorCode.code).to.equal("InvalidNameLength");
      }
    });
  });

  describe("update_progress", () => {
    let testPlayerKeypair: anchor.web3.Keypair;
    let testProfilePda: anchor.web3.PublicKey;
    let testProgressPda: anchor.web3.PublicKey;

    before(async () => {
      testPlayerKeypair = anchor.web3.Keypair.generate();
      
      const airdropSignature = await provider.connection.requestAirdrop(
        testPlayerKeypair.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      [testProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("player_profile"), testPlayerKeypair.publicKey.toBuffer()],
        program.programId
      );

      [testProgressPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("player_progress"), testPlayerKeypair.publicKey.toBuffer()],
        program.programId
      );

      // Initialize player
      await program.methods
        .initializePlayer("ProgressTester")
        .accounts({
          signer: testPlayerKeypair.publicKey,
          playerProfile: testProfilePda,
          playerProgress: testProgressPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([testPlayerKeypair])
        .rpc();
    });

    it("should update player progress on battle win", async () => {
      const progressUpdate = {
        battleWon: true,
        xpEarned: 100,
        ratingDelta: 25,
      };

      const tx = await program.methods
        .updateProgress(progressUpdate)
        .accounts({
          signer: testPlayerKeypair.publicKey,
          playerProfile: testProfilePda,
          playerProgress: testProgressPda,
        })
        .signers([testPlayerKeypair])
        .rpc();

      console.log("✓ Progress updated on win with tx:", tx);

      const profile = await program.account.playerProfile.fetch(testProfilePda);
      const progress = await program.account.playerProgress.fetch(testProgressPda);

      expect(profile.totalWins).to.equal(1);
      expect(profile.totalLosses).to.equal(0);
      expect(profile.currentRating).to.equal(1225); // 1200 + 25
      expect(profile.peakRating).to.equal(1225);
      expect(progress.battlesCompleted).to.equal(1);
      expect(progress.consecutiveWins).to.equal(1);
      expect(progress.maxConsecutiveWins).to.equal(1);
    });

    it("should update player progress on battle loss", async () => {
      const progressUpdate = {
        battleWon: false,
        xpEarned: 50,
        ratingDelta: -10,
      };

      const tx = await program.methods
        .updateProgress(progressUpdate)
        .accounts({
          signer: testPlayerKeypair.publicKey,
          playerProfile: testProfilePda,
          playerProgress: testProgressPda,
        })
        .signers([testPlayerKeypair])
        .rpc();

      console.log("✓ Progress updated on loss with tx:", tx);

      const profile = await program.account.playerProfile.fetch(testProfilePda);
      const progress = await program.account.playerProgress.fetch(testProgressPda);

      expect(profile.totalWins).to.equal(1);
      expect(profile.totalLosses).to.equal(1);
      expect(profile.currentRating).to.equal(1215); // 1225 - 10
      expect(progress.battlesCompleted).to.equal(2);
      expect(progress.consecutiveWins).to.equal(0); // Reset on loss
    });

    it("should respect rating bounds (min/max)", async () => {
      // Try to set rating very high
      const highRatingUpdate = {
        battleWon: true,
        xpEarned: 100,
        ratingDelta: 2000, // Should be capped at max
      };

      await program.methods
        .updateProgress(highRatingUpdate)
        .accounts({
          signer: testPlayerKeypair.publicKey,
          playerProfile: testProfilePda,
          playerProgress: testProgressPda,
        })
        .signers([testPlayerKeypair])
        .rpc();

      let profile = await program.account.playerProfile.fetch(testProfilePda);
      expect(profile.currentRating).to.equal(3000); // MAX_RATING

      // Try to set rating very low
      const lowRatingUpdate = {
        battleWon: false,
        xpEarned: 50,
        ratingDelta: -3000, // Should be capped at min
      };

      await program.methods
        .updateProgress(lowRatingUpdate)
        .accounts({
          signer: testPlayerKeypair.publicKey,
          playerProfile: testProfilePda,
          playerProgress: testProgressPda,
        })
        .signers([testPlayerKeypair])
        .rpc();

      profile = await program.account.playerProfile.fetch(testProfilePda);
      expect(profile.currentRating).to.equal(1000); // MIN_RATING
    });
  });

  describe("record_activity", () => {
    let activityPlayerKeypair: anchor.web3.Keypair;
    let activityProgressPda: anchor.web3.PublicKey;

    before(async () => {
      activityPlayerKeypair = anchor.web3.Keypair.generate();
      
      const airdropSignature = await provider.connection.requestAirdrop(
        activityPlayerKeypair.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("player_profile"), activityPlayerKeypair.publicKey.toBuffer()],
        program.programId
      );

      [activityProgressPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("player_progress"), activityPlayerKeypair.publicKey.toBuffer()],
        program.programId
      );

      // Initialize player
      await program.methods
        .initializePlayer("ActivityRecorder")
        .accounts({
          signer: activityPlayerKeypair.publicKey,
          playerProfile: profilePda,
          playerProgress: activityProgressPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([activityPlayerKeypair])
        .rpc();
    });

    it("should record panda forge activity", async () => {
      const activity = {
        activityType: { pandaForged: {} }, // PandaForged variant
        xpEarned: 50,
      };

      const tx = await program.methods
        .recordActivity(activity)
        .accounts({
          signer: activityPlayerKeypair.publicKey,
          playerProgress: activityProgressPda,
        })
        .signers([activityPlayerKeypair])
        .rpc();

      console.log("✓ Activity recorded with tx:", tx);

      const progress = await program.account.playerProgress.fetch(activityProgressPda);
      expect(progress.totalXpEarned).to.equal(50);
      expect(progress.dailyPandasForged).to.equal(1);
    });

    it("should enforce forge cooldown", async () => {
      const activity = {
        activityType: { pandaForged: {} },
        xpEarned: 50,
      };

      // Try to forge immediately after previous forge - should fail
      try {
        await program.methods
          .recordActivity(activity)
          .accounts({
            signer: activityPlayerKeypair.publicKey,
            playerProgress: activityProgressPda,
          })
          .signers([activityPlayerKeypair])
          .rpc();
        
        throw new Error("Should have failed due to cooldown");
      } catch (err) {
        expect(err.error.errorCode.code).to.equal("ForgeCooldownActive");
      }
    });
  });
});
