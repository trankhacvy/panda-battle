"use client";

import { usePrivy, type WalletWithMetadata } from "@privy-io/react-auth";
import { useMemo } from "react";

/**
 * Hook to get the connected Solana wallet address
 * @returns The Solana wallet address or undefined if not connected
 */
export function useEmbeddedAddress() {
  const { user } = usePrivy();

  const address = useMemo(() => {
    if (!user?.linkedAccounts) return undefined;

    const solanaAccount = user.linkedAccounts.find(
      (account) => (account as WalletWithMetadata).chainType === "solana"
    ) as WalletWithMetadata | undefined;

    return solanaAccount?.address;
  }, [user]);

  return address;
}
