"use client";

import { useState } from "react";
import { Flame, Dumbbell, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttributeCard } from "./attribute-card";
import { useRouter } from "next/navigation";

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

  const createPanda = async () => {
    setIsLoading(true);

    // Mock API call to create panda
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate random attributes
    const newAttributes: PandaAttributes = {
      sta: Math.floor(Math.random() * 50) + 50, // 50-99
      str: Math.floor(Math.random() * 50) + 50,
      agi: Math.floor(Math.random() * 50) + 50,
      int: Math.floor(Math.random() * 50) + 50,
    };

    setAttributes(newAttributes);
    setIsCreated(true);
    setIsLoading(false);
  };

  const handleReroll = async () => {
    setIsLoading(true);

    // Mock API call to reroll
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate new random attributes
    const newAttributes: PandaAttributes = {
      sta: Math.floor(Math.random() * 50) + 50,
      str: Math.floor(Math.random() * 50) + 50,
      agi: Math.floor(Math.random() * 50) + 50,
      int: Math.floor(Math.random() * 50) + 50,
    };

    setAttributes(newAttributes);
    setIsLoading(false);
  };

  const handleStartGame = () => {
    // Navigate to game or handle start game logic
    console.log("Starting game with attributes:", attributes);
    router.push("/home");
  };

  return (
    <div className="size-full flex flex-col items-center gap-6 px-4 py-8 relative">
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

      <div className="text-center relative">
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
          className="text-3xl sm:text-4xl font-black tracking-wide mt-1"
          style={{
            color: "#ffd93d",
            textShadow: "0 4px 0 #c9a227, 0 6px 10px rgba(0,0,0,0.3)",
            WebkitTextStroke: "2px #c9a227",
          }}
        >
          Panda Fighter
        </h2>
      </div>

      <div className="flex flex-1 w-full flex-col items-center justify-center">
        {!isCreated ? (
          <div className="w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden relative z-10 border-4 border-[#3a7a5a]/50">
            <img
              src="/images/who-that-panda.png"
              alt="Mystery Panda Fighter"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full">
            <div className="max-w-xs mx-auto mb-4 aspect-square rounded-2xl overflow-hidden relative border-4 border-[#3a7a5a]/50">
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

            {isCreated && attributes && (
              <div className="w-full grid grid-cols-3 max-w-xs mx-auto gap-2 sm:gap-3 relative z-10">
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

      {!isCreated ? (
        <Button
          variant="game"
          size="lg"
          onClick={createPanda}
          disabled={isLoading}
          className="w-full max-w-md text-sm sm:text-base"
        >
          {isLoading ? "Creating..." : "Create Panda Fighter"}
        </Button>
      ) : (
        <div className="flex w-full max-w-md gap-3 sm:gap-4 relative z-10">
          <Button
            onClick={handleReroll}
            disabled={isLoading}
            variant="warning"
            size="lg"
            className="w-full text-sm sm:text-base"
          >
            {isLoading ? "Rerolling..." : "Reroll"}
          </Button>
          <Button
            onClick={handleStartGame}
            disabled={isLoading}
            variant="game"
            size="lg"
            className="w-full text-sm sm:text-base"
          >
            Start Game
          </Button>
        </div>
      )}
    </div>
  );
}
