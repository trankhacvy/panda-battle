import { RpcProvider } from "@/components/providers/rpc-provider";
import { PrivyProvider } from "./privy-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RpcProvider>
      <PrivyProvider>{children}</PrivyProvider>
    </RpcProvider>
  );
}
