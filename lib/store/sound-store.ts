import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SoundState {
  isMuted: boolean;
  volume: number;
  isMusicEnabled: boolean;
  musicVolume: number;
  battleEffectVolume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  toggleMusic: () => void;
  setMusicVolume: (volume: number) => void;
  setBattleEffectVolume: (volume: number) => void;
  playSound: (soundPath: string, customVolume?: number) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      isMuted: false,
      volume: 0.5,
      isMusicEnabled: true,
      musicVolume: 0.3,
      battleEffectVolume: 0.7,

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      setVolume: (volume: number) => set({ volume }),

      toggleMusic: () =>
        set((state) => ({ isMusicEnabled: !state.isMusicEnabled })),

      setMusicVolume: (musicVolume: number) => set({ musicVolume }),

      setBattleEffectVolume: (battleEffectVolume: number) => set({ battleEffectVolume }),

      playSound: (soundPath: string, customVolume?: number) => {
        const { isMuted, volume } = get();
        if (isMuted) return;

        try {
          const audio = new Audio(soundPath);
          audio.volume = customVolume !== undefined ? customVolume : volume;
          audio.play().catch((error) => {
            console.error("Error playing sound:", error);
          });
        } catch (error) {
          console.error("Error creating audio:", error);
        }
      },
    }),
    {
      name: "panda-battle-sound-storage",
    }
  )
);
