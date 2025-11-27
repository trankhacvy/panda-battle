import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import {
  PublicKey,
  Keypair,
  SystemProgram,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import assert from "assert";

describe("Bamboo Tokenomics Integration Tests", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.pandaBattle as Program<PandaBattle>;
  const provider = anchor.getProvider();

  let bambooMint: PublicKey;
  let treasuryConfig: PublicKey;
  let treasuryAta: PublicKey;
  let player1: Keypair;
  let player2: Keypair;
  let player1TokenAccount: PublicKey;
  let player2TokenAccount: PublicKey;
  let authority: Keypair;

  const DECIMALS = 9;
  const INITIAL_SUPPLY = new BN(1_000_000_000 * 10 ** DECIMALS); // 1B tokens
  const BATTLE_WIN_REWARD = new BN(100_000_000); // 100 tokens
  const BATTLE_LOSS_REWARD = new BN(25_000_000); // 25 tokens
  const FORGE_COST = new BN(50_000_000); // 50 tokens

  before(async () => {
    // Setup test accounts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authority = (provider as any).wallet.payer;
    player1 = Keypair.generate();
    player2 = Keypair.generate();

    // Airdrop SOL to test players
    const airdropSig1 = await provider.connection.requestAirdrop(
      player1.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    const airdropSig2 = await provider.connection.requestAirdrop(
      player2.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );

    await provider.connection.confirmTransaction(airdropSig1);
    await provider.connection.confirmTransaction(airdropSig2);

    // Create Bamboo mint
    bambooMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      DECIMALS
    );

    console.log("✓ Created Bamboo Mint:", bambooMint.toBase58());

    // Get treasury config PDA
    const [treasuryConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );
    treasuryConfig = treasuryConfigPda;

    // Get treasury ATA
    treasuryAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        authority,
        bambooMint,
        treasuryConfigPda
      )
    ).address;

    console.log("✓ Treasury Config PDA:", treasuryConfig.toBase58());
    console.log("✓ Treasury ATA:", treasuryAta.toBase58());

    // Create token accounts for players
    const player1Account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      bambooMint,
      player1.publicKey
    );
    player1TokenAccount = player1Account.address;

    const player2Account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      bambooMint,
      player2.publicKey
    );
    player2TokenAccount = player2Account.address;

    console.log(
      "✓ Player 1 Token Account:",
      player1TokenAccount.toBase58()
    );
    console.log(
      "✓ Player 2 Token Account:",
      player2TokenAccount.toBase58()
    );

    // Mint tokens to treasury
    await mintTo(
      provider.connection,
      authority,
      bambooMint,
      treasuryAta,
      authority,
      INITIAL_SUPPLY
    );

    console.log("✓ Minted", INITIAL_SUPPLY.toString(), "tokens to treasury");

    // Mint tokens to players for testing
    const playerInitialBalance = new BN(1_000_000_000); // 1000 tokens
    await mintTo(
      provider.connection,
      authority,
      bambooMint,
      player1TokenAccount,
      authority,
      playerInitialBalance
    );

    await mintTo(
      provider.connection,
      authority,
      bambooMint,
      player2TokenAccount,
      authority,
      playerInitialBalance
    );

    console.log(
      "✓ Distributed",
      playerInitialBalance.toString(),
      "tokens to each player"
    );
  });

  it("Should initialize treasury with correct configuration", async () => {
    const tx = await program.methods
      .initializeTreasury()
      .accounts({
        authority: authority.publicKey,
        mint: bambooMint,
        treasuryConfig,
        vaultAta: treasuryAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✓ Initialize Treasury TX:", tx);

    // Fetch and verify treasury config
    const treasuryConfigAccount = await program.account.treasuryConfig.fetch(
      treasuryConfig
    );
    assert.strictEqual(
      treasuryConfigAccount.vaultAta.toBase58(),
      treasuryAta.toBase58(),
      "Treasury ATA mismatch"
    );
    assert.strictEqual(
      treasuryConfigAccount.authority.toBase58(),
      authority.publicKey.toBase58(),
      "Treasury authority mismatch"
    );
    assert.strictEqual(
      treasuryConfigAccount.totalDistributed.toNumber(),
      0,
      "Initial distributed should be 0"
    );
    assert.strictEqual(
      treasuryConfigAccount.totalDeposited.toNumber(),
      0,
      "Initial deposited should be 0"
    );

    console.log("✓ Treasury initialized correctly");
  });

  it("Should distribute battle rewards to winner", async () => {
    // Get initial balance
    const vaultAccountBefore = await provider.connection.getTokenAccountBalance(
      treasuryAta
    );
    const vaultBalanceBefore = new BN(vaultAccountBefore.value.amount);

    const player1AccountBefore =
      await provider.connection.getTokenAccountBalance(player1TokenAccount);
    const player1BalanceBefore = new BN(player1AccountBefore.value.amount);

    // Distribute rewards
    const reason = "battle_victory";
    const tx = await program.methods
      .distributeBambooRewards(BATTLE_WIN_REWARD, reason)
      .accounts({
        authority: authority.publicKey,
        treasuryConfig,
        vaultAta: treasuryAta,
        playerTokenAccount: player1TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✓ Distribute Battle Rewards TX:", tx);

    // Verify balances
    const vaultAccountAfter = await provider.connection.getTokenAccountBalance(
      treasuryAta
    );
    const vaultBalanceAfter = new BN(vaultAccountAfter.value.amount);

    const player1AccountAfter =
      await provider.connection.getTokenAccountBalance(player1TokenAccount);
    const player1BalanceAfter = new BN(player1AccountAfter.value.amount);

    assert(
      vaultBalanceBefore.sub(vaultBalanceAfter).eq(BATTLE_WIN_REWARD),
      "Vault balance should decrease by reward amount"
    );
    assert(
      player1BalanceAfter.sub(player1BalanceBefore).eq(BATTLE_WIN_REWARD),
      "Player balance should increase by reward amount"
    );

    // Verify treasury config updated
    const treasuryConfigAccount = await program.account.treasuryConfig.fetch(
      treasuryConfig
    );
    assert(
      new BN(treasuryConfigAccount.totalDistributed).eq(BATTLE_WIN_REWARD),
      "Total distributed should be updated"
    );

    console.log("✓ Battle rewards distributed correctly");
  });

  it("Should distribute battle loss rewards", async () => {
    const player2AccountBefore =
      await provider.connection.getTokenAccountBalance(player2TokenAccount);
    const player2BalanceBefore = new BN(player2AccountBefore.value.amount);

    // Distribute loss rewards
    const reason = "battle_participation";
    const tx = await program.methods
      .distributeBambooRewards(BATTLE_LOSS_REWARD, reason)
      .accounts({
        authority: authority.publicKey,
        treasuryConfig,
        vaultAta: treasuryAta,
        playerTokenAccount: player2TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✓ Distribute Loss Rewards TX:", tx);

    // Verify balance
    const player2AccountAfter =
      await provider.connection.getTokenAccountBalance(player2TokenAccount);
    const player2BalanceAfter = new BN(player2AccountAfter.value.amount);

    assert(
      player2BalanceAfter.sub(player2BalanceBefore).eq(BATTLE_LOSS_REWARD),
      "Player balance should increase by loss reward amount"
    );

    console.log("✓ Loss rewards distributed correctly");
  });

  it("Should allow player to claim seasonal rewards", async () => {
    // Get pool PDA
    const [rewardPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_pool"), new BN(0).toBuffer("le", 8)],
      program.programId
    );

    // Get claim record PDA
    const [claimRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player_reward_claim"),
        player1.publicKey.toBuffer(),
        new BN(0).toBuffer("le", 8),
      ],
      program.programId
    );

    const player1AccountBefore =
      await provider.connection.getTokenAccountBalance(player1TokenAccount);
    const player1BalanceBefore = new BN(player1AccountBefore.value.amount);

    // Claim rewards
    const claimAmount = new BN(50_000_000); // 50 tokens
    const tx = await program.methods
      .claimRewards(claimAmount)
      .accounts({
        player: player1.publicKey,
        treasuryConfig,
        vaultAta: treasuryAta,
        playerTokenAccount: player1TokenAccount,
        rewardClaim: claimRecordPda,
        rewardPool: rewardPoolPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([player1])
      .rpc();

    console.log("✓ Claim Rewards TX:", tx);

    // Verify balance increased
    const player1AccountAfter =
      await provider.connection.getTokenAccountBalance(player1TokenAccount);
    const player1BalanceAfter = new BN(player1AccountAfter.value.amount);

    assert(
      player1BalanceAfter.sub(player1BalanceBefore).eq(claimAmount),
      "Player should receive claimed amount"
    );

    // Verify reward pool created
    const rewardPoolAccount = await program.account.rewardPool.fetch(
      rewardPoolPda
    );
    assert.strictEqual(rewardPoolAccount.poolId.toNumber(), 0, "Pool ID");
    assert(
      new BN(rewardPoolAccount.distributedRewards).gte(claimAmount),
      "Pool should track distributed rewards"
    );

    console.log("✓ Seasonal rewards claimed successfully");
  });

  it("Should prevent duplicate claims in same reward pool", async () => {
    const [rewardPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_pool"), new BN(0).toBuffer("le", 8)],
      program.programId
    );

    const [claimRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player_reward_claim"),
        player1.publicKey.toBuffer(),
        new BN(0).toBuffer("le", 8),
      ],
      program.programId
    );

    const claimAmount = new BN(10_000_000);

    try {
      await program.methods
        .claimRewards(claimAmount)
        .accounts({
          player: player1.publicKey,
          treasuryConfig,
          vaultAta: treasuryAta,
          playerTokenAccount: player1TokenAccount,
          rewardClaim: claimRecordPda,
          rewardPool: rewardPoolPda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player1])
        .rpc();

      assert.fail("Should have thrown error for duplicate claim");
    } catch (error) {
      assert(
        error.message.includes("Reward already claimed"),
        "Should error on duplicate claim"
      );
      console.log("✓ Duplicate claim prevented correctly");
    }
  });

  it("Should allow player to spend tokens for action", async () => {
    // Use player 2 for this test to have a fresh account
    const player2AccountBefore =
      await provider.connection.getTokenAccountBalance(player2TokenAccount);
    const player2BalanceBefore = new BN(player2AccountBefore.value.amount);

    const vaultAccountBefore = await provider.connection.getTokenAccountBalance(
      treasuryAta
    );
    const vaultBalanceBefore = new BN(vaultAccountBefore.value.amount);

    // Spend tokens
    const spendAmount = FORGE_COST;
    const action = "forge_panda";

    const tx = await program.methods
      .spendBambooForAction(spendAmount, action)
      .accounts({
        player: player2.publicKey,
        treasuryConfig,
        treasuryAta: treasuryAta,
        playerTokenAccount: player2TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([player2])
      .rpc();

    console.log("✓ Spend Bamboo for Action TX:", tx);

    // Verify player balance decreased
    const player2AccountAfter =
      await provider.connection.getTokenAccountBalance(player2TokenAccount);
    const player2BalanceAfter = new BN(player2AccountAfter.value.amount);

    assert(
      player2BalanceBefore.sub(player2BalanceAfter).eq(spendAmount),
      "Player balance should decrease by spent amount"
    );

    // Verify vault balance increased
    const vaultAccountAfter = await provider.connection.getTokenAccountBalance(
      treasuryAta
    );
    const vaultBalanceAfter = new BN(vaultAccountAfter.value.amount);

    assert(
      vaultBalanceAfter.sub(vaultBalanceBefore).eq(spendAmount),
      "Vault balance should increase by spent amount"
    );

    console.log("✓ Tokens spent successfully for action");
  });

  it("Should prevent spending more tokens than available", async () => {
    // Try to spend more than player has
    const excessiveAmount = new BN(10_000_000_000_000); // Way too much

    try {
      await program.methods
        .spendBambooForAction(excessiveAmount, "forge_panda")
        .accounts({
          player: player2.publicKey,
          treasuryConfig,
          treasuryAta: treasuryAta,
          playerTokenAccount: player2TokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([player2])
        .rpc();

      assert.fail("Should have thrown error for insufficient balance");
    } catch (error) {
      assert(
        error.message.includes("insufficient") ||
          error.message.includes("Insufficient"),
        "Should error on insufficient balance"
      );
      console.log("✓ Insufficient balance check working");
    }
  });

  it("Should complete end-to-end tokenomics flow", async () => {
    // Create a fresh player for this test
    const player3 = Keypair.generate();

    // Airdrop SOL
    const airdropSig = await provider.connection.requestAirdrop(
      player3.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    // Create token account
    const player3Account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      authority,
      bambooMint,
      player3.publicKey
    );
    const player3TokenAccount = player3Account.address;

    // Give player initial tokens
    const initialBalance = new BN(500_000_000); // 500 tokens
    await mintTo(
      provider.connection,
      authority,
      bambooMint,
      player3TokenAccount,
      authority,
      initialBalance
    );

    console.log("✓ E2E Flow: Setup complete");

    // Step 1: Player forges panda (costs 50 tokens)
    console.log("  Step 1: Spend tokens for forge_panda...");
    let balanceBefore = await provider.connection.getTokenAccountBalance(
      player3TokenAccount
    );
    const balanceBeforeForge = new BN(balanceBefore.value.amount);

    await program.methods
      .spendBambooForAction(FORGE_COST, "forge_panda")
      .accounts({
        player: player3.publicKey,
        treasuryConfig,
        treasuryAta: treasuryAta,
        playerTokenAccount: player3TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([player3])
      .rpc();

    let balanceAfter = await provider.connection.getTokenAccountBalance(
      player3TokenAccount
    );
    const balanceAfterForge = new BN(balanceAfter.value.amount);
    assert(
      balanceBeforeForge.sub(balanceAfterForge).eq(FORGE_COST),
      "Forge cost deducted"
    );

    // Step 2: Player battles and wins (gains 100 tokens)
    console.log("  Step 2: Distribute battle victory rewards...");
    balanceBefore = await provider.connection.getTokenAccountBalance(
      player3TokenAccount
    );
    const balanceBeforeBattle = new BN(balanceBefore.value.amount);

    await program.methods
      .distributeBambooRewards(BATTLE_WIN_REWARD, "battle_victory")
      .accounts({
        authority: authority.publicKey,
        treasuryConfig,
        vaultAta: treasuryAta,
        playerTokenAccount: player3TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    balanceAfter = await provider.connection.getTokenAccountBalance(
      player3TokenAccount
    );
    const balanceAfterBattle = new BN(balanceAfter.value.amount);
    assert(
      balanceAfterBattle.sub(balanceBeforeBattle).eq(BATTLE_WIN_REWARD),
      "Battle reward added"
    );

    // Step 3: Player claims seasonal rewards
    console.log("  Step 3: Claim seasonal rewards...");
    const [rewardPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_pool"), new BN(0).toBuffer("le", 8)],
      program.programId
    );

    const [claimRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player_reward_claim"),
        player3.publicKey.toBuffer(),
        new BN(0).toBuffer("le", 8),
      ],
      program.programId
    );

    balanceBefore = await provider.connection.getTokenAccountBalance(
      player3TokenAccount
    );
    const balanceBeforeClaim = new BN(balanceBefore.value.amount);

    const claimAmount = new BN(25_000_000); // 25 tokens
    await program.methods
      .claimRewards(claimAmount)
      .accounts({
        player: player3.publicKey,
        treasuryConfig,
        vaultAta: treasuryAta,
        playerTokenAccount: player3TokenAccount,
        rewardClaim: claimRecordPda,
        rewardPool: rewardPoolPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([player3])
      .rpc();

    balanceAfter = await provider.connection.getTokenAccountBalance(
      player3TokenAccount
    );
    const balanceAfterClaim = new BN(balanceAfter.value.amount);
    assert(
      balanceAfterClaim.sub(balanceBeforeClaim).eq(claimAmount),
      "Claim reward added"
    );

    // Verify final balance
    const expectedFinalBalance = initialBalance
      .sub(FORGE_COST)
      .add(BATTLE_WIN_REWARD)
      .add(claimAmount);
    assert(
      balanceAfterClaim.eq(expectedFinalBalance),
      "Final balance matches expected"
    );

    console.log(
      "✓ E2E Flow completed successfully"
    );
    console.log(
      `  Initial: ${initialBalance.toString()}, Final: ${balanceAfterClaim.toString()}`
    );
  });
});
