/**
 * PDA (Program Derived Address) utility functions for Panda Battle
 */

import {
  getProgramDerivedAddress,
  getAddressEncoder,
  type Address,
  type ProgramDerivedAddress,
  getU64Encoder,
} from "@solana/kit";
import { PANDA_BATTLE_PROGRAM_ADDRESS } from "./generated";

// PDA Seeds (must match the Rust program constants)
const GAME_CONFIG_SEED = "game_config";
const GAME_ROUND_SEED = "game_round";
const PLAYER_STATE_SEED = "player_state";
const VAULT_SEED = "vault";

/**
 * Get the PDA for the game config account
 * Seeds: ["game_config"]
 */
export async function getGameConfigPDA(): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_BATTLE_PROGRAM_ADDRESS,
    seeds: [GAME_CONFIG_SEED],
  });
}

/**
 * Get the PDA for the vault account
 * Seeds: ["vault", game_config_address]
 */
export async function getVaultPDA(
  gameConfigAddress: Address
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_BATTLE_PROGRAM_ADDRESS,
    seeds: [VAULT_SEED, getAddressEncoder().encode(gameConfigAddress)],
  });
}

/**
 * Get the PDA for a game round account
 * Seeds: ["game_round", game_config_address, round_number]
 */
export async function getGameRoundPDA(
  gameConfigAddress: Address,
  roundNumber: number | bigint
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_BATTLE_PROGRAM_ADDRESS,
    seeds: [
      GAME_ROUND_SEED,
      getAddressEncoder().encode(gameConfigAddress),
      getU64Encoder().encode(BigInt(roundNumber)),
    ],
  });
}

/**
 * Get the PDA for a player state account
 * Seeds: ["player_state", game_round_address, player_address]
 */
export async function getPlayerStatePDA(
  gameRoundAddress: Address,
  playerAddress: Address
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: PANDA_BATTLE_PROGRAM_ADDRESS,
    seeds: [
      PLAYER_STATE_SEED,
      getAddressEncoder().encode(gameRoundAddress),
      getAddressEncoder().encode(playerAddress),
    ],
  });
}
