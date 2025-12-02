"use client";

import { useSoundStore } from "@/lib/store/sound-store";
import { useCallback } from "react";

export enum SoundType {
  EFFECT = "effect",
  MUSIC = "music",
  BATTLE = "battle",
}

export const SOUND_VOLUMES = {
  EFFECT: 0.5,
  MUSIC: 0.3,
  BATTLE: 0.7,
  BATTLE_PUNCH: 1.0,  
  BATTLE_SWORD: 0.5,
  BATTLE_HIT: 1.0,    
} as const;

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
  BATTLE_PUNCH: "/sounds/punch.mp3",
  BATTLE_SWORD: "/sounds/sword.mp3",
  BATTLE_HIT: "/sounds/hit.mp3",
  BATTLE_MUSIC: "/sounds/battle-music.mp3",
} as const;

export const SOUND_TYPE_MAP: Record<string, SoundType> = {
  [SOUNDS.BUTTON_CLICK]: SoundType.EFFECT,
  [SOUNDS.WIN]: SoundType.EFFECT,
  [SOUNDS.LOSE]: SoundType.EFFECT,
  [SOUNDS.MONEY_RECEIVE]: SoundType.EFFECT,
  [SOUNDS.MONEY_PAY]: SoundType.EFFECT,
  [SOUNDS.GAME_START]: SoundType.EFFECT,
  [SOUNDS.USER_JOIN]: SoundType.EFFECT,
  [SOUNDS.DICE_ROLL]: SoundType.EFFECT,
  [SOUNDS.DICE_LAND]: SoundType.EFFECT,
  [SOUNDS.PROPERTY_BUY]: SoundType.EFFECT,
  [SOUNDS.BATTLE_PUNCH]: SoundType.BATTLE,
  [SOUNDS.BATTLE_SWORD]: SoundType.BATTLE,
  [SOUNDS.BATTLE_HIT]: SoundType.BATTLE,
  [SOUNDS.BATTLE_MUSIC]: SoundType.MUSIC,
};

export function useSound() {
  const { 
    playSound, 
    isMuted, 
    volume, 
    musicVolume, 
    battleEffectVolume,
    setVolume,
    setMusicVolume,
    setBattleEffectVolume,
  } = useSoundStore();

  const getVolumeForSound = useCallback(
    (soundPath: string): number => {
      const soundType = SOUND_TYPE_MAP[soundPath];
      let baseVolume: number;
      
      switch (soundType) {
        case SoundType.MUSIC:
          baseVolume = musicVolume;
          break;
        case SoundType.BATTLE:
          baseVolume = battleEffectVolume;
          if (soundPath === SOUNDS.BATTLE_SWORD) {
            baseVolume *= SOUND_VOLUMES.BATTLE_SWORD;
          } else if (soundPath === SOUNDS.BATTLE_PUNCH) {
            baseVolume *= SOUND_VOLUMES.BATTLE_PUNCH;
          } else if (soundPath === SOUNDS.BATTLE_HIT) {
            baseVolume *= SOUND_VOLUMES.BATTLE_HIT;
          }
          break;
        case SoundType.EFFECT:
        default:
          baseVolume = volume;
          break;
      }
      
      return baseVolume;
    },
    [volume, musicVolume, battleEffectVolume]
  );

  const play = useCallback(
    (soundPath: string, customVolume?: number) => {
      if (!isMuted) {
        const volumeToUse = customVolume !== undefined ? customVolume : getVolumeForSound(soundPath);
        playSound(soundPath, volumeToUse);
      }
    },
    [playSound, isMuted, getVolumeForSound]
  );

  const playMusic = useCallback(
    (soundPath: string, customVolume?: number) => {
      if (!isMuted) {
        const audio = new Audio(soundPath);
        audio.loop = true;
        const volumeToUse = customVolume !== undefined ? customVolume : getVolumeForSound(soundPath);
        audio.volume = volumeToUse;
        audio.play().catch(() => {});
        return audio;
      }
      return null;
    },
    [isMuted, getVolumeForSound]
  );

  return {
    play,
    playMusic,
    isMuted,
    volume,
    musicVolume,
    battleEffectVolume,
    setVolume,
    setMusicVolume,
    setBattleEffectVolume,
    SOUNDS,
    SOUND_VOLUMES,
    SoundType,
  };
}
