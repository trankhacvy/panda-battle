import { useRpc } from "@/components/providers/rpc-provider";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import {
  fetchGlobalConfig,
  fetchGameRound,
  fetchPlayerState,
  fetchMaybePlayerState,
  type GlobalConfig,
  type GameRound,
  type PlayerState,
} from "@/lib/sdk/generated/accounts";
import { PLATFORM_CONFIG } from "@/configs/constants";
import { getGameRoundPDA, getPlayerStatePDA } from "@/lib/sdk/pda";
import type { Account, Address } from "@solana/kit";
import { getPlayerStateAccounts } from "@/lib/sdk/gpa";

/**
 * Hook to fetch global game configuration
 * This is global data used across the app
 */
export function useGlobalConfig() {
  const { rpc } = useRpc();

  const { data, error, isLoading, mutate } =
    useSWRImmutable<Account<GlobalConfig> | null>(
      "global-config",
      async () => {
        try {
          const config = await fetchGlobalConfig(rpc, PLATFORM_CONFIG);
          return config;
        } catch (error) {
          console.error("Failed to fetch global config:", error);
          throw error;
        }
      },
      {
        shouldRetryOnError: false,
        revalidateOnReconnect: true,
      }
    );

  return {
    globalConfig: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook to fetch the current active game round
 * This is global data used across the app
 */
export function useCurrentGameRound() {
  const { rpc } = useRpc();
  const { globalConfig, isLoading: isLoadingConfig } = useGlobalConfig();

  const { data, error, isLoading, mutate } = useSWR<Account<GameRound> | null>(
    globalConfig ? `game-round-${globalConfig.data.currentRound}` : null,
    async () => {
      if (!globalConfig) return null;

      try {
        const [gameRoundPDA] = await getGameRoundPDA(
          PLATFORM_CONFIG,
          Number(globalConfig.data.currentRound)
        );

        const gameRound = await fetchGameRound(rpc, gameRoundPDA);
        return gameRound;
      } catch (error) {
        console.error("Failed to fetch game round:", error);
        throw error;
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  return {
    gameRound: data,
    isLoading: isLoadingConfig || isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Hook to fetch a specific game round by round number
 * @param roundNumber - The round number to fetch
 */
export function useGameRound(roundNumber?: number | bigint) {
  const { rpc, magicRpc } = useRpc();

  const { data, error, isLoading, mutate } = useSWR<Account<GameRound> | null>(
    roundNumber !== undefined ? `game-round-${roundNumber}` : null,
    async () => {
      if (roundNumber === undefined) return null;

      try {
        const [gameRoundPDA] = await getGameRoundPDA(
          PLATFORM_CONFIG,
          Number(roundNumber)
        );

        const gameRound = await fetchGameRound(rpc, gameRoundPDA);
        return gameRound;
      } catch (error) {
        console.error(`Failed to fetch game round ${roundNumber}:`, error);
        throw error;
      }
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    gameRound: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

/**
 * Combined hook that fetches both global config and current game round
 * Use this when you need both pieces of data
 */
export function useGameData() {
  const globalConfigData = useGlobalConfig();
  const gameRoundData = useCurrentGameRound();

  return {
    globalConfig: globalConfigData.globalConfig,
    gameRound: gameRoundData.gameRound,
    isLoading: globalConfigData.isLoading || gameRoundData.isLoading,
    error: globalConfigData.error || gameRoundData.error,
    refetchGlobalConfig: globalConfigData.refetch,
    refetchGameRound: gameRoundData.refetch,
    refetchAll: async () => {
      await Promise.all([globalConfigData.refetch(), gameRoundData.refetch()]);
    },
  };
}

export function usePlayerState(
  playerAddress?: Address,
  gameRoundAddress?: Address
) {
  const { rpc, magicRpc } = useRpc();
  const { gameRound } = useCurrentGameRound();

  // Use provided gameRoundAddress or fallback to current game round
  const roundAddress = gameRoundAddress || gameRound?.address;

  const { data, error, isLoading, mutate } =
    useSWR<Account<PlayerState> | null>(
      playerAddress && roundAddress
        ? `player-state-${playerAddress}-${roundAddress}`
        : null,
      async () => {
        if (!playerAddress || !roundAddress) return null;

        try {
          const [playerStatePDA] = await getPlayerStatePDA(
            roundAddress,
            playerAddress
          );

          // First try magicRpc for faster response
          try {
            const maybePlayerState = await fetchMaybePlayerState(
              magicRpc,
              playerStatePDA
            );

            // If account exists in magicRpc, return it
            if (maybePlayerState.exists) {
              return maybePlayerState as Account<PlayerState>;
            }
          } catch (magicError) {
            console.log(
              "magicRpc fetch failed, falling back to rpc:",
              magicError
            );
          }

          // Fallback to regular rpc if magicRpc didn't return data or failed
          const maybePlayerState = await fetchMaybePlayerState(
            rpc,
            playerStatePDA
          );

          // Return null if account doesn't exist, otherwise return the account
          return maybePlayerState.exists
            ? (maybePlayerState as Account<PlayerState>)
            : null;
        } catch (error) {
          console.error("Failed to fetch player state:", error);
          // Return null instead of throwing to handle non-existent accounts gracefully
          return null;
        }
      },
      {
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
      }
    );

  return {
    playerState: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function usePlayers() {
  const { magicRpc } = useRpc();
  const { gameRound } = useCurrentGameRound();

  // Use provided gameRoundAddress or fallback to current game round
  const roundAddress = gameRound?.address;

  const { data, error, isLoading, mutate } = useSWR<PlayerState[]>(
    roundAddress ? `player-list-${roundAddress}` : null,
    async () => {
      if (!roundAddress) return [];

      try {
        const playerStateAccounts = await getPlayerStateAccounts(
          magicRpc,
          roundAddress
        );

        return playerStateAccounts;
      } catch (error) {
        console.error("Failed to fetch player state:", error);
        return [];
      }
    },
    {
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  return {
    players: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
