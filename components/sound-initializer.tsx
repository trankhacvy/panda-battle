"use client";

import { useEffect, useState } from "react";
import {
  useSoundStore,
  selectIsMusicMuted,
  selectIsMasterMuted,
} from "@/lib/store/sound-store";
import { Button } from "./ui/button";
import { Volume2 } from "lucide-react";

export const SoundInitializer = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const playMusic = useSoundStore((state) => state.playMusic);
  const isMusicMuted = useSoundStore(selectIsMusicMuted);
  const isMasterMuted = useSoundStore(selectIsMasterMuted);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMusicMuted && !isMasterMuted) {
        try {
          playMusic("background-music", true);
        } catch (error) {
          setShowPrompt(true);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [playMusic, isMusicMuted, isMasterMuted]);

  const handleStartMusic = () => {
    playMusic("background-music", true);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-lg p-8 max-w-md text-center space-y-6 shadow-2xl">
        <div className="text-6xl mb-4">🎵</div>
        <h2 className="text-2xl font-bold text-yellow-400">
          Enable Background Music?
        </h2>
        <p className="text-gray-300">
          Enhance your Panda Battle experience with epic background music!
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setShowPrompt(false)}
            disableSound
          >
            Maybe Later
          </Button>
          <Button variant="game" onClick={handleStartMusic} disableSound>
            <Volume2 className="mr-2 h-4 w-4" />
            Start Music
          </Button>
        </div>
      </div>
    </div>
  );
};

