"use client";

import { useState } from "react";
import { Flame, Dumbbell, Zap, Brain } from "lucide-react";
import { Button3D } from "@/components/ui/button-3d";
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
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      <div className="text-center mb-6 relative z-10">
        <h1
          className="text-4xl font-extrabold tracking-wide"
          style={{
            color: "#4dd8ff",
            textShadow: "0 0 10px rgba(77, 216, 255, 0.5), 2px 2px 0 #1a5a7a",
            WebkitTextStroke: "1px #2a8ab0",
          }}
        >
          Create Your
        </h1>
        <h2
          className="text-5xl font-black tracking-wide mt-1"
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
      <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden relative z-10 mb-6 border-4 border-[#3a7a5a]/50">
        {!isCreated ? (
          <img
            src="/images/who-that-panda.png"
            alt="Mystery Panda Fighter"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full relative">
            <img
              src="/images/reated-panda-bg.png"
              alt="Panda Background"
              className="w-full h-full object-cover absolute inset-0"
            />
            <img
              src="/images/sample-panda.png"
              alt="Your Panda Fighter"
              className="w-full h-full object-contain absolute inset-0 z-10"
            />
          </div>
        )}
      </div>

      {/* Attributes Display - Only show when panda is created (3 attributes only) */}
      {isCreated && attributes && (
        <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-6 relative z-10">
          <AttributeCard
            label="STR"
            value={attributes.str}
            icon="/images/attributes/str-att.png"
            color="orange"
          />
          <AttributeCard
            label="AGI"
            value={attributes.agi}
            icon="/images/attributes/agt-att.png"
            color="green"
          />
          <AttributeCard
            label="INT"
            value={attributes.int}
            icon="/images/attributes/int-att.png"
            color="blue"
          />
        </div>
      )}

      {/* Buttons */}
      {!isCreated ? (
        <Button3D onClick={createPanda} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Panda Fighter"}
        </Button3D>
      ) : (
        <div className="flex gap-4 relative z-10">
          <Button3D
            onClick={handleReroll}
            disabled={isLoading}
            variant="3d-orange"
          >
            {isLoading ? "Rerolling..." : "Reroll"}
          </Button3D>
          <Button3D
            onClick={handleStartGame}
            disabled={isLoading}
            variant="3d-green"
          >
            Start Game
          </Button3D>
        </div>
      )}
    </div>
  );
}
