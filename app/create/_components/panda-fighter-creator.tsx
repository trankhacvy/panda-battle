"use client";

import { useSessionSigners } from "@privy-io/react-auth";
import { useState, useRef, useEffect } from "react";
import { Flame, Dumbbell, Zap, Brain } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
import { AttributeCard } from "./attribute-card";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { sdk } from "@/lib/sdk";
import { useRpc } from "@/components/providers/rpc-provider";
import { address, TransactionSigner, type Address } from "@solana/kit";
import { buildAndSendTransactionWithPrivy } from "@/lib/tx";
import { toast } from "sonner";
import { fetchPlayerState } from "@/lib/sdk/generated/accounts";

interface PandaAttributes {
  sta: number;
  str: number;
  agi: number;
  int: number;
}

export function PandaFighterCreator() {
  const router = useRouter();
  const [isCreated, setIsCreated] = useState(false);
  const [attributes, setAttributes] = useState<PandaAttributes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { wallet } = useWallet();
  const { rpc } = useRpc();
  const { addSessionSigners } = useSessionSigners();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log("wallet", wallet?.address);

  /**
   * Poll the player state to check if attributes have been updated by VRF callback
   * @param playerStateAddress - The address of the player state account
   * @param previousAttributes - Optional previous attributes to compare against (for reroll)
   */
  const pollPlayerState = async (
    playerStateAddress: Address,
    previousAttributes?: PandaAttributes
  ) => {
    const maxAttempts = 60; // Poll for up to 60 seconds
    let attempts = 0;

    return new Promise<void>((resolve, reject) => {
      pollingIntervalRef.current = setInterval(async () => {
        attempts++;

        try {
          const playerState = await fetchPlayerState(rpc, playerStateAddress);

          const currentAttributes: PandaAttributes = {
            sta: 0, // Not used in the current schema
            str: playerState.data.str,
            agi: playerState.data.agi,
            int: playerState.data.int,
          };

          let attributesUpdated = false;

          if (previousAttributes) {
            // For reroll: Check if attributes have changed from previous values
            attributesUpdated =
              currentAttributes.str !== previousAttributes.str ||
              currentAttributes.agi !== previousAttributes.agi ||
              currentAttributes.int !== previousAttributes.int;
          } else {
            // For initial creation: Check if any attribute is greater than 0
            attributesUpdated =
              currentAttributes.str > 0 ||
              currentAttributes.agi > 0 ||
              currentAttributes.int > 0;
          }

          if (attributesUpdated) {
            // Attributes have been updated!
            setAttributes(currentAttributes);
            setIsCreated(true);
            setIsLoading(false);

            // Clear the interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            toast.success(
              previousAttributes
                ? "Panda attributes rerolled successfully!"
                : "Panda created successfully!"
            );
            resolve();
          } else if (attempts >= maxAttempts) {
            // Timeout after max attempts
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setIsLoading(false);
            toast.error(
              "Timeout waiting for panda attributes. Please try again."
            );
            reject(new Error("Timeout waiting for VRF callback"));
          }
        } catch (error) {
          console.error("Error polling player state:", error);

          // Continue polling on error, but stop after max attempts
          if (attempts >= maxAttempts) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setIsLoading(false);
            toast.error("Failed to fetch panda attributes");
            reject(error);
          }
        }
      }, 1000); // Poll every 1 second
    });
  };

  const createPanda = async (): Promise<void> => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);

    try {
      const { playerStateAddress, instruction } =
        await sdk.generatePandaAttributesIx({
          rpc,
          player: { address: address(wallet.address) } as TransactionSigner,
          roundNumber: 0,
        });

      const signature = await buildAndSendTransactionWithPrivy(
        rpc,
        [instruction],
        wallet
      );

      console.log("[createPanda] tx", signature);
      toast.success(
        "Transaction sent! Waiting for VRF to generate attributes..."
      );

      // Start polling for attribute updates
      await pollPlayerState(playerStateAddress);
    } catch (error) {
      console.error("Error creating panda:", error);
      setIsLoading(false);
      toast.error("Failed to create panda");
      throw error;
    }
  };

  // Cleanup polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const handleReroll = async () => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    if (!attributes) {
      toast.error("No attributes to reroll");
      return;
    }

    setIsLoading(true);

    // Store current attributes to compare against after reroll
    const previousAttributes = { ...attributes };

    try {
      const { playerStateAddress, instruction } = await sdk.rerollAttributesIx({
        rpc,
        player: { address: address(wallet.address) } as TransactionSigner,
      });

      const signature = await buildAndSendTransactionWithPrivy(
        rpc,
        [instruction],
        wallet
      );

      console.log("[handleReroll] tx", signature);
      toast.success(
        "Transaction sent! Waiting for VRF to reroll attributes..."
      );

      // Start polling for attribute updates, passing previous attributes for comparison
      await pollPlayerState(playerStateAddress, previousAttributes);
    } catch (error) {
      console.error("Error rerolling panda:", error);
      setIsLoading(false);
      toast.error("Failed to reroll panda");
      throw error;
    }
  };

  const handleDelegateWallet = async () => {
    if (!wallet) {
      toast.error("No game wallet found");
      return;
    }

    try {
      await addSessionSigners({
        address: wallet.address,
        signers: [
          {
            signerId: process.env.NEXT_PUBLIC_PRIVY_AUTH_ID!,
          },
        ],
        //   chainType: "solana",
      });

      toast.success("Game wallet delegated successfully!");
    } catch (error) {
      console.error("Failed to delegate game wallet:", error);
      toast.error("Failed to delegate game wallet. Please try again.");
    }
  };

  const handleStartGame = () => {
    // Navigate to game or handle start game logic
    console.log("Starting game with attributes:", attributes);
    router.push("/home");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 p-4 relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Title Section */}
      <div className="text-center mb-5 relative">
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-wide"
          style={{
            color: "#4dd8ff",
            textShadow: "0 0 10px rgba(77, 216, 255, 0.5), 2px 2px 0 #1a5a7a",
            WebkitTextStroke: "1px #2a8ab0",
          }}
        >
          Create Your
        </h1>
        <h2
          className="text-4xl sm:text-5xl font-black tracking-wide mt-1"
          style={{
            color: "#ffd93d",
            textShadow: "0 4px 0 #c9a227, 0 6px 10px rgba(0,0,0,0.3)",
            WebkitTextStroke: "2px #c9a227",
          }}
        >
          Panda Fighter
        </h2>
      </div>

      {/* Panda Image */}
      <div className="flex flex-1 w-full flex-col items-center justify-center">
        {!isCreated ? (
          <div className="w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden relative z-10 mb-6 border-4 border-[#3a7a5a]/50">
            <img
              src="/images/who-that-panda.png"
              alt="Mystery Panda Fighter"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full">
            <div className="max-w-xs mx-auto mb-6 aspect-square rounded-2xl overflow-hidden relative border-4 border-[#3a7a5a]/50">
              <img
                src="/images/fighter-frame.png"
                alt="Panda Background"
                className="w-full h-full object-cover"
              />
              <img
                src="/images/sample-panda.png"
                alt="Your Panda Fighter"
                className="w-full h-full object-contain absolute inset-0 z-10"
              />
            </div>

            {/* Attributes Display - Only show when panda is created (3 attributes only) */}
            {isCreated && attributes && (
              <div className="w-full grid grid-cols-3 max-w-md mx-auto gap-2 sm:gap-3 relative z-10">
                <AttributeCard
                  label="STR"
                  value={attributes.str}
                  icon="💪"
                  textColor="text-orange-500"
                />
                <AttributeCard
                  label="AGI"
                  value={attributes.agi}
                  icon="⚡"
                  textColor="text-green-500"
                />
                <AttributeCard
                  label="INT"
                  value={attributes.int}
                  icon="🧠"
                  textColor="text-blue-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Button3D onClick={handleDelegateWallet} disabled={isLoading}>
        Delegate
      </Button3D>

      {/* Buttons */}
      {!isCreated ? (
        <Button3D
          onClick={createPanda}
          disabled={isLoading}
          className="w-full max-w-md text-sm sm:text-base"
        >
          {isLoading ? "Creating..." : "Create Panda Fighter"}
        </Button3D>
      ) : (
        <div className="flex w-full max-w-md gap-3 sm:gap-4 relative z-10">
          <Button3D
            onClick={handleReroll}
            disabled={isLoading}
            variant="3d-orange"
            className="w-full text-sm sm:text-base"
          >
            {isLoading ? "Rerolling..." : "Reroll"}
          </Button3D>
          <Button3D
            onClick={handleStartGame}
            disabled={isLoading}
            variant="3d-green"
            className="w-full text-sm sm:text-base"
          >
            Start Game
          </Button3D>
        </div>
      )}
    </div>
  );
}
