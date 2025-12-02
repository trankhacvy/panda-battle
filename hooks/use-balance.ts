import { useRpc } from "@/components/providers/rpc-provider";
import { address } from "@solana/kit";
import useSWR from "swr";

export function useSolBalance(walletAddress?: string) {
  const { rpc } = useRpc();

  const { data, error, isLoading, mutate } = useSWR(
    walletAddress ? `sol-balance-${walletAddress}` : null,
    async () => {
      if (!walletAddress) return null;

      try {
        const { value } = await rpc.getBalance(address(walletAddress)).send();
        return value;
      } catch (error) {
        console.error("Failed to fetch SOL balance:", error);
        throw error;
      }
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  const balanceInSol = data ? Number(data) / 1_000_000_000 : 0;

  return {
    balance: data,
    balanceInSol,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useSplTokenBalance(
  walletAddress?: string,
  tokenMintAddress?: string
) {
  const { rpc } = useRpc();

  const { data, error, isLoading, mutate } = useSWR(
    walletAddress && tokenMintAddress
      ? `spl-balance-${walletAddress}-${tokenMintAddress}`
      : null,
    async () => {
      if (!walletAddress || !tokenMintAddress) return null;

      try {
        const tokenAccounts = await rpc
          .getTokenAccountsByOwner(
            address(walletAddress),
            {
              mint: address(tokenMintAddress),
            },
            {
              encoding: "jsonParsed",
            }
          )
          .send();

        if (tokenAccounts.value.length === 0) {
          return BigInt(0);
        }

        const accountInfo = tokenAccounts.value[0].account.data;
        const balance =
          accountInfo &&
          typeof accountInfo === "object" &&
          "parsed" in accountInfo
            ? BigInt(accountInfo.parsed.info.tokenAmount.amount)
            : BigInt(0);

        return balance;
      } catch (error) {
        console.error("Failed to fetch SPL token balance:", error);
        throw error;
      }
    },
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    }
  );

  // Assuming USDC has 6 decimals
  const balanceInToken = data ? Number(data) / 1_000_000 : 0;

  return {
    balance: data,
    balanceInToken,
    isLoading,
    error,
    refetch: mutate,
  };
}
