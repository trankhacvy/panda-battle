import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { assert } from "chai";
import {
  getGlobalConfigPDA,
  getGameRoundPDA,
  getGlobalConfig,
  getGameRound,
} from "./utils";

describe("Admin Instructions", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PandaBattle as Program<PandaBattle>;
  const admin = provider.wallet as anchor.Wallet;

  let globalConfigPDA: PublicKey;
  let mint: PublicKey;

  before(async () => {
    // Create test mint (simulating USDC)
    mint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6 // USDC decimals
    );

    globalConfigPDA = getGlobalConfigPDA(program);
  });

  it("Initialize game", async () => {
    await program.methods
      .initializeGame(mint)
      .accountsPartial({
        admin: admin.publicKey,
        globalConfig: globalConfigPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const globalConfig = await getGlobalConfig(program, globalConfigPDA);
    assert.equal(globalConfig.admin.toString(), admin.publicKey.toString());
    assert.equal(globalConfig.tokenMint.toString(), mint.toString());
    assert.equal(globalConfig.currentRound.toString(), "0");
    assert.equal(globalConfig.totalRounds.toString(), "0");
  });

  it("Create round", async () => {
    const entryFee = new BN(1_990_000); // $1.99 with 6 decimals
    const attackPackPrice = new BN(100_000); // $0.10 with 6 decimals
    const durationSecs = new BN(86400); // 24 hours
    const entryHourlyIncPct = 1;

    const roundPDA = getGameRoundPDA(program, globalConfigPDA, 1);
    const vaultPDA = await getAssociatedTokenAddress(mint, roundPDA, true);

    await program.methods
      .createRound(entryFee, attackPackPrice, durationSecs, entryHourlyIncPct)
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

    const gameRound = await getGameRound(program, roundPDA);
    assert.equal(gameRound.roundNumber.toString(), "1");
    assert.equal(gameRound.isActive, true);
    assert.equal(gameRound.playerCount, 0);
    assert.equal(gameRound.entryFee.toString(), entryFee.toString());
    assert.equal(gameRound.attackPackPrice.toString(), attackPackPrice.toString());
    assert.equal(gameRound.payoutsProcessed, false);
  });

  it("End round", async () => {
    const roundPDA = getGameRoundPDA(program, globalConfigPDA, 1);

    await program.methods
      .endRound()
      .accountsPartial({
        admin: admin.publicKey,
        globalConfig: globalConfigPDA,
        gameRound: roundPDA,
      })
      .rpc();

    const gameRound = await getGameRound(program, roundPDA);
    assert.equal(gameRound.isActive, false);
  });

  it("Update config", async () => {
    const newMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    await program.methods
      .updateConfig(newMint)
      .accountsPartial({
        admin: admin.publicKey,
        globalConfig: globalConfigPDA,
      })
      .rpc();

    const globalConfig = await getGlobalConfig(program, globalConfigPDA);
    assert.equal(globalConfig.tokenMint.toString(), newMint.toString());
  });
});
