import { useCallback, useEffect } from "react";
import { useSoundStore, SoundType, MusicType } from "@/lib/store/sound-store";

export const useSound = () => {
  const playSound = useSoundStore((state) => state.playSound);
  const playMusic = useSoundStore((state) => state.playMusic);
  const stopMusic = useSoundStore((state) => state.stopMusic);
  const stopAllSounds = useSoundStore((state) => state.stopAllSounds);
  const preloadSounds = useSoundStore((state) => state.preloadSounds);

  useEffect(() => {
    preloadSounds();
  }, [preloadSounds]);

  const playButtonClick = useCallback(() => {
    playSound("button-click");
  }, [playSound]);

  const playDiceRoll = useCallback(() => {
    playSound("dice-roll");
  }, [playSound]);

  const playDiceLand = useCallback(() => {
    playSound("dice-land");
  }, [playSound]);

  const playDiceShort = useCallback(() => {
    playSound("dice-short");
  }, [playSound]);

  const playMoneyReceive = useCallback(() => {
    playSound("money-receive");
  }, [playSound]);

  const playMoneyPay = useCallback(() => {
    playSound("money-pay");
  }, [playSound]);

  const playPropertyBuy = useCallback(() => {
    playSound("property-buy");
  }, [playSound]);

  const playGameStart = useCallback(() => {
    playSound("game-start");
  }, [playSound]);

  const playJail = useCallback(() => {
    playSound("jail");
  }, [playSound]);

  const playWin = useCallback(() => {
    playSound("win", 0.8);
  }, [playSound]);

  const playLose = useCallback(() => {
    playSound("lose", 0.6);
  }, [playSound]);

  const playUserJoin = useCallback(() => {
    playSound("user-join");
  }, [playSound]);

  const playUserOff = useCallback(() => {
    playSound("user-off");
  }, [playSound]);

  const playGlassBreak = useCallback(() => {
    playSound("glass-break");
  }, [playSound]);

  const playUpHouse = useCallback(() => {
    playSound("up-house");
  }, [playSound]);

  const startBackgroundMusic = useCallback(() => {
    playMusic("background-music", true);
  }, [playMusic]);

  const stopBackgroundMusic = useCallback(() => {
    stopMusic();
  }, [stopMusic]);

  const play = useCallback(
    (sound: SoundType, volume?: number) => {
      playSound(sound, volume);
    },
    [playSound]
  );

  return {
    play,
    playSound,
    stopAllSounds,
    playButtonClick,
    playDiceRoll,
    playDiceLand,
    playDiceShort,
    playMoneyReceive,
    playMoneyPay,
    playPropertyBuy,
    playGameStart,
    playJail,
    playWin,
    playLose,
    playUserJoin,
    playUserOff,
    playGlassBreak,
    playUpHouse,
    startBackgroundMusic,
    stopBackgroundMusic,
  };
};
