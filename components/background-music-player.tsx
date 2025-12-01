"use client";

import { useEffect, useRef } from "react";
import { useSoundStore } from "@/lib/store/sound-store";

export function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isMusicEnabled, musicVolume } = useSoundStore();

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/background-music.mp3");
      audioRef.current.loop = true;
    }

    const audio = audioRef.current;

    // Update volume
    audio.volume = musicVolume;

    // Play or pause based on settings
    if (isMusicEnabled) {
      audio.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    } else {
      audio.pause();
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isMusicEnabled, musicVolume]);

  return null; // This component doesn't render anything
}

