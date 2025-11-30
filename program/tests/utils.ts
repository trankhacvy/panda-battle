import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PandaBattle } from "../target/types/panda_battle";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
 * Get Game Round PDA
 */
export function getGameRoundPDA(
  program: Program<PandaBattle>,
  gameConfigPDA: PublicKey,
  roundNumber: number
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("game_round"),
      gameConfigPDA.toBuffer(),
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
 * Get Vault PDA
 */
export function getVaultPDA(
  program: Program<PandaBattle>,
  gameConfigPDA: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), gameConfigPDA.toBuffer()],
    program.programId
  );
  return pda;
}

/**
 * Get Game Config PDA
 */
export function getGameConfigPDA(program: Program<PandaBattle>): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_config")],
    program.programId
  );
  return pda;
}

/**
 * Fetch game config account
 */
export async function getGameConfig(
  program: Program<PandaBattle>,
  gameConfigPDA: PublicKey
) {
  return await program.account.gameConfig.fetch(gameConfigPDA);
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
 * Wait for specified seconds (for time-based tests)
 */
export async function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
