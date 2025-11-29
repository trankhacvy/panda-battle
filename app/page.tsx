"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button3D } from "@/components/ui/button-3d";
import { useSolana } from "@/components/providers/solana-provider";
import { useConnect, type UiWallet } from "@wallet-standard/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function WalletIcon({
  wallet,
  className,
}: {
  wallet: UiWallet;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {wallet.icon && (
        <AvatarImage src={wallet.icon} alt={`${wallet.name} icon`} />
      )}
      <AvatarFallback>{wallet.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

function WalletOption({
  wallet,
  onConnect,
}: {
  wallet: UiWallet;
  onConnect: () => void;
}) {
  const { setWalletAndAccount } = useSolana();
  const [isConnecting, connect] = useConnect(wallet);

  const handleConnect = async () => {
    if (isConnecting) return;

    try {
      const accounts = await connect();

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setWalletAndAccount(wallet, account);
        onConnect();
      }
    } catch (err) {
      console.error(`Failed to connect ${wallet.name}:`, err);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto py-4"
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <WalletIcon wallet={wallet} className="h-8 w-8 mr-3" />
      <span className="text-base font-medium">
        {isConnecting ? "Connecting..." : wallet.name}
      </span>
    </Button>
  );
}

export default function Home() {
  const router = useRouter();
  const { wallets, isConnected } = useSolana();
  const [showWalletDialog, setShowWalletDialog] = useState(false);

  // Navigate to game if already connected
  useEffect(() => {
    if (isConnected) {
      router.push("/home");
    }
  }, [isConnected, router]);

  const handlePlayClick = () => {
    if (isConnected) {
      router.push("/home");
    } else {
      setShowWalletDialog(true);
    }
  };

  const handleWalletConnected = () => {
    setShowWalletDialog(false);
    // Navigation will happen automatically via useEffect when isConnected becomes true
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 sm:space-y-6">
        {/* todo : replace with logo */}
        <div className="text-6xl sm:text-8xl">🐼</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent px-2">
          Bamboo Panda Battles
        </h1>
        <Button3D onClick={handlePlayClick}>Play</Button3D>
      </div>

      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect your wallet to start playing Bamboo Panda Battles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No wallets detected. Please install a Solana wallet extension.
              </p>
            ) : (
              wallets.map((wallet, index) => (
                <WalletOption
                  key={`${wallet.name}-${index}`}
                  wallet={wallet}
                  onConnect={handleWalletConnected}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
