"use client";

import { useSoundStore } from "@/lib/store/sound-store";
import { useCallback } from "react";

export const SOUNDS = {
  BUTTON_CLICK: "/sounds/button-click.mp3",
  WIN: "/sounds/win.mp3",
  LOSE: "/sounds/lose.wav",
  MONEY_RECEIVE: "/sounds/money-receive.mp3",
  MONEY_PAY: "/sounds/money-pay.mp3",
  GAME_START: "/sounds/game-start.mp3",
  USER_JOIN: "/sounds/user-join.mp3",
  DICE_ROLL: "/sounds/dice-roll.mp3",
  DICE_LAND: "/sounds/dice-land.mp3",
  PROPERTY_BUY: "/sounds/property-buy.mp3",
} as const;

export function useSound() {
  const { playSound, isMuted, volume } = useSoundStore();

  const play = useCallback(
    (soundPath: string) => {
      if (!isMuted) {
        playSound(soundPath);
      }
    },
    [playSound, isMuted]
  );

  return {
    play,
    isMuted,
    volume,
    SOUNDS,
  };
}
