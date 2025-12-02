"use client";

import { useRouter } from "next/navigation";
import { Button3D } from "@/components/ui/button-3d";
import { useWallet } from "@/hooks/use-wallet";
import { useLogin, type WalletWithMetadata } from "@privy-io/react-auth";
import { useSolBalance, useSplTokenBalance } from "@/hooks/use-balance";
import { useEffect, useState } from "react";
import { USDC_MINT_ADDRESS } from "@/configs/constants";
import { usePlayerState } from "@/hooks/use-game-data";
import { address } from "@solana/kit";

const MIN_SOL_BALANCE = 0.001; // Minimum SOL required
const MIN_USDC_BALANCE = 0.01; // Minimum USDC required

export default function Home() {
  const router = useRouter();
  const { ready, user } = useWallet();
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  const embededWallet = user?.linkedAccounts?.find(
    (account) =>
      (account as WalletWithMetadata).chainType === "solana" &&
      (account as WalletWithMetadata).connectorType === "embedded"
  ) as WalletWithMetadata | undefined;

  const { balanceInSol, isLoading: isLoadingSol } = useSolBalance(
    embededWallet?.address
  );
  const { balanceInToken: usdcBalance, isLoading: isLoadingUsdc } =
    useSplTokenBalance(embededWallet?.address, USDC_MINT_ADDRESS);

  const { playerState, isLoading: isLoadingPlayerState } = usePlayerState(
    embededWallet?.address ? address(embededWallet.address) : undefined
  );
  console.log("playerState", playerState);
  useEffect(() => {
    if (!user || !embededWallet) return;

    if (isLoadingPlayerState) return;

    if (
      playerState &&
      playerState.data.delegated &&
      (playerState.data.str > 0 ||
        playerState.data.agi > 0 ||
        playerState.data.int > 0)
    ) {
      router.push("/home");
      return;
    }

    if (!isLoadingSol && !isLoadingUsdc && !isCheckingBalance) {
      setIsCheckingBalance(true);

      // const hasSufficientBalance =
      //   balanceInSol >= MIN_SOL_BALANCE && usdcBalance >= MIN_USDC_BALANCE;
      const hasSufficientBalance = balanceInSol >= MIN_SOL_BALANCE;

      if (!hasSufficientBalance) {
        router.push("/top-up");
      } else {
        router.push("/create");
      }
    }
  }, [
    user,
    embededWallet,
    balanceInSol,
    usdcBalance,
    isLoadingSol,
    isLoadingUsdc,
    isLoadingPlayerState,
    playerState,
    isCheckingBalance,
    router,
  ]);

  const { login } = useLogin({
    onComplete: ({ user }) => {
      const embededWallet = user?.linkedAccounts?.find(
        (account) =>
          (account as WalletWithMetadata).chainType === "solana" &&
          (account as WalletWithMetadata).connectorType === "embedded"
      ) as WalletWithMetadata | undefined;

      if (!embededWallet) {
        alert(
          "Error: No embedded wallet found. Please try again or contact support."
        );
        return;
      }
    },
  });

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-20 right-20 w-2 h-2 bg-yellow-300 rounded-full animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 right-32 w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
        {/* Logo Text */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]"
            style={{
              textShadow:
                "4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(255,255,255,0.3)",
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke fill",
            }}
          >
            PANDA
          </h1>
          <h2
            className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            style={{
              textShadow:
                "4px 4px 0px rgba(0,0,0,0.8), -2px -2px 0px rgba(200,200,200,0.3)",
              WebkitTextStroke: "3px #000",
              paintOrder: "stroke fill",
            }}
          >
            CHAOS
          </h2>
        </div>

        {/* Panda Character */}
        <div className="relative animate-bounce-slow">
          <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full"></div>
          <img
            src="/images/sample-panda.png"
            alt="Panda Warrior"
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10 drop-shadow-2xl"
          />
        </div>

        <Button3D className="max-w-md w-full" disabled={!ready} onClick={login}>
          Play
        </Button3D>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
