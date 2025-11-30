"use client";

import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { createContext, ReactNode, useContext } from "react";

type Props = Readonly<{
  children: ReactNode;
}>;

interface RpcContextType {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  magicRpc: Rpc<SolanaRpcApi>;
  magicRpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}

export const RpcContext = createContext<RpcContextType | undefined>(undefined);

export const useRpc = () => {
  const context = useContext(RpcContext);
  if (context === undefined) {
    throw new Error("useRpc must be used within a RpcProvider");
  }
  return context;
};

export function RpcProvider({ children }: Props) {
  return (
    <RpcContext.Provider
      value={{
        rpc: createSolanaRpc(process.env.NEXT_PUBLIC_RPC_URL!),
        rpcSubscriptions: createSolanaRpcSubscriptions(
          process.env.NEXT_PUBLIC_RPC_SUBSCRIPTIONS_URL!
        ),
        magicRpc: createSolanaRpc(process.env.NEXT_PUBLIC_MAGIC_RPC_URL!),
        magicRpcSubscriptions: createSolanaRpcSubscriptions(
          process.env.NEXT_PUBLIC_MAGIC_RPC_SUBSCRIPTIONS_URL!
        ),
      }}
    >
      {children}
    </RpcContext.Provider>
  );
}
