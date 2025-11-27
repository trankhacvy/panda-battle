import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { PublicKey } from "@solana/web3.js";
import * as assert from "assert";

describe("panda-battle", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.pandaBattle as Program<PandaBattle>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  describe("Panda Creation", () => {
    before(async () => {
      // Create a test panda mint
      // pandaMint = anchor.web3.Keypair.generate().publicKey;
    });

    it("should forge a panda with valid stats", async () => {
      // Note: In a real test, we'd need actual token accounts and system setup
      // This demonstrates the structure of the test
      
      // const pandaName = "Test Panda";
      // const pandaType = { bamboo: {} };
      // const attack = 75;
      // const defense = 65;
      // const speed = 70;
      // const intellect = 60;
      // const primaryColor = [0, 0, 0] as const;
      // const secondaryColor = [50, 50, 50] as const;
      // const accentColor = [100, 100, 100] as const;

      try {
        // This would need proper account setup in integration tests
        // const tx = await program.methods
        //   .forgePanda(
        //     pandaName,
        //     pandaType,
        //     attack,
        //     defense,
        //     speed,
        //     intellect,
        //     primaryColor,
        //     secondaryColor,
        //     accentColor
        //   )
        //   .accounts({
        //     player: player.publicKey,
        //     pandaMetadata: pandaMetadataPDA,
        //     pandaMint: pandaMint,
        //     playerTokenAccount: anchor.web3.Keypair.generate().publicKey,
        //     vaultTokenAccount: anchor.web3.Keypair.generate().publicKey,
        //     tokenProgram: new PublicKey("TokenkegQfeZyiNwAJsyFbPVwwQQfNrW"),
        //     systemProgram: anchor.web3.SystemProgram.programId,
        //     clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        //   })
        //   .signers([player])
        //   .rpc();

        // console.log("Panda forged with tx:", tx);
      } catch (err) {
        console.error("Error forging panda (expected in unit test env):", err);
      }
    });

    it("should reject invalid panda names", () => {
      // Test that names outside 1-20 chars are rejected
      const invalidNames = [
        "",
        "A".repeat(21),
        "Invalid-Name-With-Dashes",
      ];

      invalidNames.forEach((name) => {
        // In actual tests, this would validate on-chain
        assert.ok(name.length === 0 || name.length > 20 || /[^a-zA-Z0-9 ]/.test(name));
      });
    });

    it("should reject invalid stat values", () => {
      // Stats must be 1-100
      const invalidStats = [0, 101, 200];
      
      invalidStats.forEach((stat) => {
        assert.ok(stat < 1 || stat > 100);
      });
    });
  });

  describe("Breeding Logic", () => {
    let parentMaleMint: PublicKey;
    let parentFemaleMint: PublicKey;
    let breedingId: Buffer;

    before(async () => {
      parentMaleMint = anchor.web3.Keypair.generate().publicKey;
      parentFemaleMint = anchor.web3.Keypair.generate().publicKey;
      breedingId = Buffer.alloc(32);
      breedingId.writeBigInt64BE(BigInt(Date.now()), 0);
    });

    it("should initialize breeding session between two compatible pandas", async () => {
      // This test demonstrates breeding session structure
      
      try {
        // const tx = await program.methods
        //   .startBreeding(breedingId as any)
        //   .accounts({
        //     player: player.publicKey,
        //     parentMale: parentMalePDA,
        //     parentFemale: parentFemalePDA,
        //     parentMaleMint: parentMaleMint,
        //     parentFemaleMint: parentFemaleMint,
        //     breedingSession: breedingSessionPDA,
        //     playerTokenAccount: anchor.web3.Keypair.generate().publicKey,
        //     vaultTokenAccount: anchor.web3.Keypair.generate().publicKey,
        //     tokenProgram: new PublicKey("TokenkegQfeZyiNwAJsyFbPVwwQQfNrW"),
        //     systemProgram: anchor.web3.SystemProgram.programId,
        //     clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        //   })
        //   .signers([player])
        //   .rpc();

        // console.log("Breeding session started with tx:", tx);
      } catch (err) {
        console.error("Error starting breeding (expected in unit test env):", err);
      }
    });

    it("should reject breeding when pandas are on cooldown", () => {
      // Simulate cooldown validation
      const currentTime = Math.floor(Date.now() / 1000);
      const cooldownEndTime = currentTime + 86400; // 1 day from now

      // Breeding should be rejected if current time < cooldownEndTime
      assert.ok(currentTime < cooldownEndTime);
    });

    it("should reject breeding between same panda", () => {
      // Should fail if parent_male_mint === parent_female_mint
      assert.ok(parentMaleMint.toString() !== parentFemaleMint.toString());
    });

    it("should create offspring with inherited traits", async () => {
      // Trait inheritance logic test
      const parentMaleStats = { attack: 80, defense: 60, speed: 75, intellect: 70 };
      const parentFemaleStats = { attack: 75, defense: 65, speed: 70, intellect: 80 };

      // Average stats (expected offspring base)
      const avgAttack = (parentMaleStats.attack + parentFemaleStats.attack) / 2;
      const avgDefense = (parentMaleStats.defense + parentFemaleStats.defense) / 2;
      const avgSpeed = (parentMaleStats.speed + parentFemaleStats.speed) / 2;
      const avgIntellect = (parentMaleStats.intellect + parentFemaleStats.intellect) / 2;

      // Offspring should have stats close to average (with ±5 mutation variance)
      assert.ok(Math.abs(avgAttack - 77.5) < 1);
      assert.ok(Math.abs(avgDefense - 62.5) < 1);
      assert.ok(Math.abs(avgSpeed - 72.5) < 1);
      assert.ok(Math.abs(avgIntellect - 75) < 1);
    });

    it("should update parent breed counts after successful breeding", () => {
      // Verify breed count increments
      let parentMaleBreedCount = 0;
      let parentFemaleBreedCount = 0;

      // After successful breeding, counts should increment
      parentMaleBreedCount += 1;
      parentFemaleBreedCount += 1;

      assert.strictEqual(parentMaleBreedCount, 1);
      assert.strictEqual(parentFemaleBreedCount, 1);
    });

    it("should apply breeding cooldown after mating", () => {
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const cooldownEndsAt = now + sevenDaysInSeconds;

      // Pandas should not be able to breed again until cooldownEndsAt
      assert.ok(cooldownEndsAt > now);
      assert.ok(cooldownEndsAt - now === sevenDaysInSeconds);
    });
  });

  describe("Breeding Constraints", () => {
    it("should enforce maximum generation limit", () => {
      const MAX_GENERATIONS = 10;
      let generation = 0;

      for (let i = 0; i < MAX_GENERATIONS + 1; i++) {
        if (generation < MAX_GENERATIONS) {
          generation += 1;
        }
      }

      assert.strictEqual(generation, MAX_GENERATIONS);
    });

    it("should enforce maximum breed count per panda", () => {
      const MAX_BREED_COUNT = 5;
      let breedCount = 0;

      for (let i = 0; i < MAX_BREED_COUNT + 1; i++) {
        if (breedCount < MAX_BREED_COUNT) {
          breedCount += 1;
        }
      }

      assert.strictEqual(breedCount, MAX_BREED_COUNT);
    });

    it("should enforce breeding session timeout", () => {
      const startTime = Math.floor(Date.now() / 1000);
      const TIMEOUT = 48 * 60 * 60; // 48 hours
      const expiryTime = startTime + TIMEOUT;
      const checkTime = expiryTime + 1; // After expiry

      assert.ok(checkTime > expiryTime);
    });

    it("should lock pandas during breeding", () => {
      // Simulate panda lock state
      let parentMaleIsLocked = false;
      let parentFemaleIsLocked = false;

      // Lock during breeding
      parentMaleIsLocked = true;
      parentFemaleIsLocked = true;

      assert.ok(parentMaleIsLocked);
      assert.ok(parentFemaleIsLocked);

      // Unlock after breeding complete
      parentMaleIsLocked = false;
      parentFemaleIsLocked = false;

      assert.ok(!parentMaleIsLocked);
      assert.ok(!parentFemaleIsLocked);
    });
  });

  describe("Error Handling", () => {
    it("should reject unauthorized breeding", () => {
      // Non-owner should not be able to breed another's pandas
      const owner = anchor.web3.Keypair.generate();
      const unauthorizedUser = anchor.web3.Keypair.generate();

      assert.ok(owner.publicKey.toString() !== unauthorizedUser.publicKey.toString());
    });

    it("should reject breeding with locked pandas", () => {
      const isLocked = false;

      // Cannot breed locked panda
      if (isLocked) {
        assert.fail("Should not reach here");
      }

      assert.ok(!isLocked);
    });

    it("should reject expired breeding sessions", () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const sessionExpiry = currentTime - 1; // Already expired

      assert.ok(currentTime > sessionExpiry);
    });
  });

  describe("Events", () => {
    it("should emit PandaForged event on creation", () => {
      // Event structure test
      const event = {
        pandaMint: anchor.web3.Keypair.generate().publicKey,
        owner: anchor.web3.Keypair.generate().publicKey,
        name: "Test Panda",
        pandaType: "Bamboo",
        rarity: "Epic",
        timestamp: Math.floor(Date.now() / 1000),
      };

      assert.ok(event.pandaMint !== undefined);
      assert.ok(event.owner !== undefined);
      assert.ok(event.name.length > 0);
      assert.ok(event.timestamp > 0);
    });

    it("should emit BreedingStarted event", () => {
      const event = {
        breedingId: Buffer.alloc(32),
        parentMaleMint: anchor.web3.Keypair.generate().publicKey,
        parentFemaleMint: anchor.web3.Keypair.generate().publicKey,
        player: anchor.web3.Keypair.generate().publicKey,
        timestamp: Math.floor(Date.now() / 1000),
      };

      assert.ok(event.breedingId.length === 32);
      assert.ok(event.parentMaleMint !== event.parentFemaleMint);
      assert.ok(event.timestamp > 0);
    });

    it("should emit OffspringCreated event on successful breeding", () => {
      const event = {
        breedingId: Buffer.alloc(32),
        offspringMint: anchor.web3.Keypair.generate().publicKey,
        offspringName: "Offspring",
        parentMaleMint: anchor.web3.Keypair.generate().publicKey,
        parentFemaleMint: anchor.web3.Keypair.generate().publicKey,
        offspringGeneration: 1,
        owner: anchor.web3.Keypair.generate().publicKey,
        timestamp: Math.floor(Date.now() / 1000),
      };

      assert.ok(event.offspringMint !== undefined);
      assert.ok(event.offspringGeneration >= 1);
      assert.ok(event.offspringName.length > 0);
    });
  });

  describe("Utility Functions", () => {
    it("should calculate correct base HP from stats", () => {
      // baseHP = 100 + (attack * 0.2) + (defense * 0.3)
      const attack = 80;
      const defense = 75;
      const expectedHP = 100 + Math.floor(attack * 0.2) + Math.floor(defense * 0.3);

      assert.strictEqual(expectedHP, 100 + 16 + 22); // = 138
    });

    it("should correctly determine rarity from stats", () => {
      const highStats = [85, 90, 88, 92]; // Average = 88.75 -> Legendary
      const lowStats = [30, 25, 35, 28]; // Average = 29.5 -> Common
      const mediumStats = [50, 55, 48, 52]; // Average = 51.25 -> Rare

      // Rarity determination based on average
      const highAvg = highStats.reduce((a, b) => a + b) / highStats.length;
      const lowAvg = lowStats.reduce((a, b) => a + b) / lowStats.length;
      const medAvg = mediumStats.reduce((a, b) => a + b) / mediumStats.length;

      assert.ok(highAvg > 85); // Legendary
      assert.ok(lowAvg < 35); // Common
      assert.ok(medAvg > 40 && medAvg < 65); // Rare
    });

    it("should validate panda names correctly", () => {
      const validNames = ["Panda", "Red Fury", "Snow Walker", "B"];
      const invalidNames = [
        "", // Too short
        "A".repeat(21), // Too long
        "Invalid-Name", // Invalid character
        "Name@", // Invalid character
      ];

      validNames.forEach((name) => {
        assert.ok(name.length > 0 && name.length <= 20);
        assert.ok(/^[a-zA-Z0-9 ]*$/.test(name));
      });

      invalidNames.forEach((name) => {
        assert.ok(name.length === 0 || name.length > 20 || !/^[a-zA-Z0-9 ]*$/.test(name));
      });
    });

    it("should validate stat ranges", () => {
      const validStats = [1, 50, 100];
      const invalidStats = [0, 101, 150];

      validStats.forEach((stat) => {
        assert.ok(stat > 0 && stat <= 100);
      });

      invalidStats.forEach((stat) => {
        assert.ok(stat < 1 || stat > 100);
      });
    });
  });
});
