"use client";

import {
  usePrivy,
  type PrivyInterface,
  type WalletWithMetadata,
} from "@privy-io/react-auth";
import {
  useWallets,
  ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";
import { TransactionSigner } from "@solana/kit";
import { useMemo } from "react";

export function useWallet() {
  const { user, ...rest } = usePrivy();

  const { wallets } = useWallets();

  const embededWallet = useMemo(() => {
    const linkedAccount = user?.linkedAccounts?.find(
      (account) =>
        (account as WalletWithMetadata).chainType === "solana" &&
        (account as WalletWithMetadata).connectorType === "embedded"
    ) as WalletWithMetadata | undefined;

    return linkedAccount;
  }, [user]);

  const standardWallet = useMemo(() => {
    if (!embededWallet) return undefined;

    const wallet = wallets?.find((w) => w.address === embededWallet.address);

    return wallet;
  }, [wallets, embededWallet]);

  return {
    wallet: embededWallet,
    standardWallet,
    user,
    ...rest,
  } as PrivyInterface & {
    wallet: WalletWithMetadata | undefined;
    standardWallet: ConnectedStandardSolanaWallet | undefined;
    signer?: TransactionSigner;
  };
}
