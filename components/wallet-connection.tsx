"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WalletProvider = "phantom" | "solflare" | "backpack";

interface WalletOption {
  id: WalletProvider;
  name: string;
  icon: string;
  description: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    description: "A friendly crypto wallet built for DeFi & NFTs",
  },
  {
    id: "solflare",
    name: "Solflare",
    icon: "☀️",
    description: "The safest way to start exploring Solana",
  },
  {
    id: "backpack",
    name: "Backpack",
    icon: "🎒",
    description: "A home for your xNFTs",
  },
];

export function WalletConnection() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConnect = async (walletId: WalletProvider) => {
    setIsConnecting(true);
    setSelectedWallet(walletId);
    setError(null);
    setSuccess(false);

    try {
      // Mock wallet connection - simulates connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock: randomly succeed or fail (90% success rate for demo)
      const shouldSucceed = Math.random() > 0.1;

      if (shouldSucceed) {
        // Show success message
        setSuccess(true);
        setIsConnecting(false);

        // Navigate to panda creation after brief success display
        setTimeout(() => {
          router.push("/create-panda");
        }, 1000);
      } else {
        // Simulate connection failure
        throw new Error("Failed to connect wallet. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const handleRetry = () => {
    setError(null);
    setSelectedWallet(null);
    setSuccess(false);
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4 sm:space-y-6 px-2">
      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent px-2">
          Connect Your Wallet
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
          Choose your preferred wallet to enter the battle arena
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <Card variant="game" className="w-full max-w-md border-emerald-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-emerald-500 text-lg">
                  Wallet Connected!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting to panda creation...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Wallet Options */}
      {!success && (
        <div className="w-full max-w-md space-y-3 sm:space-y-4">
          {walletOptions.map((wallet) => (
            <Card
              key={wallet.id}
              variant="game"
              className={`cursor-pointer transition-all ${
                selectedWallet === wallet.id && isConnecting
                  ? "ring-2 ring-emerald-500 ring-offset-2"
                  : ""
              }`}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-3xl sm:text-4xl">{wallet.icon}</span>
                    <div>
                      <CardTitle className="text-lg sm:text-xl">
                        {wallet.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                        {wallet.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="game"
                  size="lg"
                  className="w-full text-sm sm:text-base"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                >
                  {isConnecting && selectedWallet === wallet.id ? (
                    <span className="flex items-center space-x-2">
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Connecting...</span>
                    </span>
                  ) : (
                    `Connect ${wallet.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Card variant="battle" className="w-full max-w-md border-red-500/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-red-500">
                    Connection Failed
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
              <Button
                variant="game-secondary"
                size="lg"
                className="w-full"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      {!success && (
        <Card variant="stat" className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div className="flex-1 text-sm text-muted-foreground">
                <p>
                  Don&apos;t have a wallet? Download one from the official
                  website of your preferred provider.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
