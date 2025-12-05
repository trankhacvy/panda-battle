"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttributeCard } from "./attribute-card";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "motion/react";

interface PandaAttributes {
  sta: number;
  str: number;
  agi: number;
  int: number;
}

type GameState = "idle" | "minting" | "revealed";

// Animation variants defined outside component to avoid recreation
const cardVariants: Variants = {
  idle: {
    y: [0, -15, 0],
    rotate: [0, 1, -1, 0],
  },
  minting: {
    rotate: [-3, 3, -3, 3, 0],
    scale: [1, 1.02, 0.98, 1.02, 1],
    y: [0, -5, 0],
    transition: { duration: 0.4, repeat: Infinity },
  },
  revealed: {
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.6, type: "spring", bounce: 0.5 },
  },
};

export function PandaFighterCreator() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [attributes, setAttributes] = useState<PandaAttributes | null>(null);

  const isCreated = gameState === "revealed";
  const isLoading = gameState === "minting";

  const createPanda = async () => {
    setGameState("minting");

    // Mock API call to create panda
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate random attributes
    const newAttributes: PandaAttributes = {
      sta: Math.floor(Math.random() * 50) + 50, // 50-99
      str: Math.floor(Math.random() * 50) + 50,
      agi: Math.floor(Math.random() * 50) + 50,
      int: Math.floor(Math.random() * 50) + 50,
    };

    setAttributes(newAttributes);
    setGameState("revealed");
  };

  const handleReroll = async () => {
    setGameState("minting");

    // Mock API call to reroll
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate new random attributes
    const newAttributes: PandaAttributes = {
      sta: Math.floor(Math.random() * 50) + 50,
      str: Math.floor(Math.random() * 50) + 50,
      agi: Math.floor(Math.random() * 50) + 50,
      int: Math.floor(Math.random() * 50) + 50,
    };

    setAttributes(newAttributes);
    setGameState("revealed");
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

      <motion.div
        className="text-center relative"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
      >
        <h1 className="text-3xl sm:text-4xl tracking-wide font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] game-title-text">
          Create Your
        </h1>
        <h2 className="text-3xl sm:text-4xl tracking-wide mt-1 font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] game-title-text">
          Panda Fighter
        </h2>
      </motion.div>

      <div className="flex flex-1 w-full flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {gameState !== "revealed" ? (
            <motion.div
              key="mystery-box"
              variants={cardVariants}
              initial={{ scale: 0.8, opacity: 1 }}
              animate={gameState === "minting" ? "minting" : "idle"}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
              className="w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden relative z-10 border-4 border-[#3a7a5a]/50"
            >
              <img
                src="/images/who-that-panda.png"
                alt="Mystery Panda Fighter"
                className="w-full h-full object-cover"
              />

              {/* Sparkles during minting */}
              {gameState === "minting" && (
                <>
                  <motion.div
                    className="absolute top-1/4 left-1/4 text-yellow-300"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Sparkles size={24} fill="currentColor" />
                  </motion.div>
                  <motion.div
                    className="absolute bottom-1/3 right-1/4 text-pink-300"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                  >
                    <Sparkles size={32} fill="currentColor" />
                  </motion.div>
                  <motion.div
                    className="absolute top-1/3 right-1/3 text-cyan-300"
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  >
                    <Sparkles size={20} fill="currentColor" />
                  </motion.div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="revealed-card"
              variants={cardVariants}
              initial={{ scale: 0.8, opacity: 1, y: 50 }}
              animate="revealed"
              className="w-full"
            >
              <div className="max-w-xs mx-auto mb-4 aspect-square rounded-2xl overflow-hidden relative border-4 border-[#3a7a5a]/50">
                <img
                  src="/images/fighter-frame.png"
                  alt="Panda Background"
                  className="w-full h-full object-cover"
                />
                <motion.img
                  src="/images/sample-panda.png"
                  alt="Your Panda Fighter"
                  className="w-full h-full object-contain absolute inset-0 z-10"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />

                {/* Flash effect on reveal */}
                <motion.div
                  className="absolute inset-0 pointer-events-none bg-white z-20"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {attributes && (
                <motion.div
                  className="w-full grid grid-cols-3 max-w-xs mx-auto gap-2 sm:gap-3 relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <AttributeCard
                    label="STR"
                    value={attributes.str}
                    icon="💪"
                    variant="secondary"
                  />
                  <AttributeCard
                    label="AGI"
                    value={attributes.agi}
                    icon="⚡"
                    variant="secondary"
                  />
                  <AttributeCard
                    label="INT"
                    value={attributes.int}
                    icon="🧠"
                    variant="secondary"
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soft Shadow Base */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 max-w-xs h-4 bg-black/10 blur-lg rounded-[100%] z-0" />
      </div>

      <motion.div
        className="w-full flex justify-center"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
      >
        {!isCreated ? (
          <Button
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
              variant="secondary"
              size="lg"
              className="w-full text-sm sm:text-base"
            >
              {isLoading ? "Rerolling..." : "Reroll"}
            </Button>
            <Button
              onClick={handleStartGame}
              disabled={isLoading}
              size="lg"
              className="w-full text-sm sm:text-base"
            >
              Start Game
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
