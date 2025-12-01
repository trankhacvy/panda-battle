import { Program, BN } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, mintTo, createMint } from "@solana/spl-token";

/**
 * Airdrop SOL to an account
 */
export async function airdrop(
  connection: Connection,
  publicKey: PublicKey,
  amount: number
): Promise<void> {
  const sig = await connection.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(sig);
}

/**
 * Get Global Config PDA
 */
export function getGlobalConfigPDA(program: Program<PandaBattle>): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_config")],
    program.programId
  );
  return pda;
}

/**
 * Get Game Round PDA
 */
export function getGameRoundPDA(
  program: Program<PandaBattle>,
  globalConfigPDA: PublicKey,
  roundNumber: number
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("game_round"),
      globalConfigPDA.toBuffer(),
      new BN(roundNumber).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );
  return pda;
}

/**
 * Get Player State PDA
 */
export function getPlayerStatePDA(
  program: Program<PandaBattle>,
  roundPDA: PublicKey,
  playerPubkey: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("player_state"), roundPDA.toBuffer(), playerPubkey.toBuffer()],
    program.programId
  );
  return pda;
}

/**
 * Get Leaderboard PDA
 */
export function getLeaderboardPDA(
  program: Program<PandaBattle>,
  roundPDA: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("leaderboard"), roundPDA.toBuffer()],
    program.programId
  );
  return pda;
}

/**
 * Fetch global config account
 */
export async function getGlobalConfig(
  program: Program<PandaBattle>,
  globalConfigPDA: PublicKey
) {
  return await program.account.globalConfig.fetch(globalConfigPDA);
}

/**
 * Fetch game round account
 */
export async function getGameRound(
  program: Program<PandaBattle>,
  roundPDA: PublicKey
) {
  return await program.account.gameRound.fetch(roundPDA);
}

/**
 * Fetch player state account
 */
export async function getPlayerState(
  program: Program<PandaBattle>,
  playerStatePDA: PublicKey
) {
  return await program.account.playerState.fetch(playerStatePDA);
}

/**
 * Fetch leaderboard account
 */
export async function getLeaderboard(
  program: Program<PandaBattle>,
  leaderboardPDA: PublicKey
) {
  return await program.account.leaderboard.fetch(leaderboardPDA);
}

/**
 * Wait for specified seconds (for time-based tests)
 */
export async function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Create a test token mint and fund accounts
 */
export async function setupTestToken(
  connection: Connection,
  payer: any,
  recipients: PublicKey[],
  amount: number = 1000_000_000 // 1000 tokens with 6 decimals
) {
  // Create mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6 // USDC decimals
  );

  // Mint tokens to recipients
  for (const recipient of recipients) {
    const ata = await getAssociatedTokenAddress(mint, recipient);
    await mintTo(connection, payer, mint, ata, payer, amount);
  }

  return mint;
}
