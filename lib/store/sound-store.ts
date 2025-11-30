/**
 * Zustand Store for Sound Management with Persist
 * Manages sound effects, background music, and volume settings
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================================================
// Types
// ============================================================================

export type SoundType =
  | "button-click"
  | "dice-roll"
  | "dice-land"
  | "dice-short"
  | "money-receive"
  | "money-pay"
  | "property-buy"
  | "game-start"
  | "jail"
  | "win"
  | "lose"
  | "user-join"
  | "user-off"
  | "glass-break"
  | "up-house";

export type MusicType = "background-music";

interface SoundState {
  // Volume settings (0-1)
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;

  // Mute toggles
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  isMasterMuted: boolean;

  // Audio instances
  audioInstances: Map<string, HTMLAudioElement>;
  backgroundMusic: HTMLAudioElement | null;

  // Actions - Volume
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;

  // Actions - Mute
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;
  toggleMasterMute: () => void;

  // Actions - Playback
  playSound: (sound: SoundType, volume?: number) => void;
  playMusic: (music: MusicType, loop?: boolean) => void;
  stopMusic: () => void;
  stopAllSounds: () => void;

  // Utility
  preloadSounds: () => void;
  cleanup: () => void;
}

// ============================================================================
// Sound Configuration
// ============================================================================

const SOUND_PATHS: Record<SoundType, string> = {
  "button-click": "/sounds/button-click.mp3",
  "dice-roll": "/sounds/dice-roll.mp3",
  "dice-land": "/sounds/dice-land.mp3",
  "dice-short": "/sounds/dice-short.mp3",
  "money-receive": "/sounds/money-receive.mp3",
  "money-pay": "/sounds/money-pay.mp3",
  "property-buy": "/sounds/property-buy.mp3",
  "game-start": "/sounds/game-start.mp3",
  jail: "/sounds/jail.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.wav",
  "user-join": "/sounds/user-join.mp3",
  "user-off": "/sounds/user-off.mp3",
  "glass-break": "/sounds/thin-glass-break-gfx-sounds-2-2-00-00.mp3",
  "up-house": "/sounds/up-house.wav",
};

const MUSIC_PATHS: Record<MusicType, string> = {
  "background-music": "/sounds/background-music.mp3",
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      // Initial State
      masterVolume: 0.7,
      musicVolume: 0.4,
      sfxVolume: 0.6,
      isMusicMuted: false,
      isSfxMuted: false,
      isMasterMuted: false,
      audioInstances: new Map(),
      backgroundMusic: null,

      // ============================================================================
      // Volume Actions
      // ============================================================================

      setMasterVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ masterVolume: clampedVolume });

        // Update background music volume if playing
        const { backgroundMusic, musicVolume, isMusicMuted, isMasterMuted } =
          get();
        if (backgroundMusic) {
          backgroundMusic.volume =
            clampedVolume *
            musicVolume *
            (isMusicMuted || isMasterMuted ? 0 : 1);
        }
      },

      setMusicVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ musicVolume: clampedVolume });

        // Update background music volume if playing
        const { backgroundMusic, masterVolume, isMusicMuted, isMasterMuted } =
          get();
        if (backgroundMusic) {
          backgroundMusic.volume =
            masterVolume *
            clampedVolume *
            (isMusicMuted || isMasterMuted ? 0 : 1);
        }
      },

      setSfxVolume: (volume: number) => {
        set({ sfxVolume: Math.max(0, Math.min(1, volume)) });
      },

      // ============================================================================
      // Mute Actions
      // ============================================================================

      toggleMusicMute: () => {
        const newMuted = !get().isMusicMuted;
        set({ isMusicMuted: newMuted });

        // Update background music volume
        const { backgroundMusic, masterVolume, musicVolume, isMasterMuted } =
          get();
        if (backgroundMusic) {
          backgroundMusic.volume =
            masterVolume * musicVolume * (newMuted || isMasterMuted ? 0 : 1);
        }
      },

      toggleSfxMute: () => {
        set({ isSfxMuted: !get().isSfxMuted });
      },

      toggleMasterMute: () => {
        const newMuted = !get().isMasterMuted;
        set({ isMasterMuted: newMuted });

        // Update background music volume
        const { backgroundMusic, masterVolume, musicVolume, isMusicMuted } =
          get();
        if (backgroundMusic) {
          backgroundMusic.volume =
            masterVolume * musicVolume * (newMuted || isMusicMuted ? 0 : 1);
        }
      },

      // ============================================================================
      // Playback Actions
      // ============================================================================

      playSound: (sound: SoundType, customVolume?: number) => {
        const {
          sfxVolume,
          masterVolume,
          isSfxMuted,
          isMasterMuted,
          audioInstances,
        } = get();

        if (isSfxMuted || isMasterMuted) return;

        const path = SOUND_PATHS[sound];
        if (!path) {
          console.warn(`Sound not found: ${sound}`);
          return;
        }

        try {
          // Create new audio instance
          const audio = new Audio(path);
          const finalVolume = customVolume ?? sfxVolume;
          audio.volume = masterVolume * finalVolume;

          // Play sound
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Add to instances for cleanup
                audioInstances.set(`${sound}-${Date.now()}`, audio);

                // Remove from instances when finished
                audio.addEventListener("ended", () => {
                  audio.remove();
                });
              })
              .catch((error) => {
                console.warn(`Failed to play sound ${sound}:`, error);
              });
          }
        } catch (error) {
          console.warn(`Error creating audio for ${sound}:`, error);
        }
      },

      playMusic: (music: MusicType, loop = true) => {
        const {
          musicVolume,
          masterVolume,
          isMusicMuted,
          isMasterMuted,
          backgroundMusic,
        } = get();

        // Stop current music if playing
        if (backgroundMusic) {
          backgroundMusic.pause();
          backgroundMusic.currentTime = 0;
        }

        const path = MUSIC_PATHS[music];
        if (!path) {
          console.warn(`Music not found: ${music}`);
          return;
        }

        try {
          const audio = new Audio(path);
          audio.loop = loop;
          audio.volume =
            masterVolume * musicVolume * (isMusicMuted || isMasterMuted ? 0 : 1);

          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                set({ backgroundMusic: audio });
              })
              .catch((error) => {
                console.warn(`Failed to play music ${music}:`, error);
              });
          }
        } catch (error) {
          console.warn(`Error creating audio for ${music}:`, error);
        }
      },

      stopMusic: () => {
        const { backgroundMusic } = get();
        if (backgroundMusic) {
          backgroundMusic.pause();
          backgroundMusic.currentTime = 0;
          set({ backgroundMusic: null });
        }
      },

      stopAllSounds: () => {
        const { audioInstances, backgroundMusic } = get();

        // Stop all sound effects
        audioInstances.forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
        audioInstances.clear();

        // Stop background music
        if (backgroundMusic) {
          backgroundMusic.pause();
          backgroundMusic.currentTime = 0;
        }

        set({ audioInstances: new Map(), backgroundMusic: null });
      },

      // ============================================================================
      // Utility
      // ============================================================================

      preloadSounds: () => {
        // Preload commonly used sounds
        const commonSounds: SoundType[] = [
          "button-click",
          "dice-roll",
          "win",
          "lose",
        ];

        commonSounds.forEach((sound) => {
          const audio = new Audio(SOUND_PATHS[sound]);
          audio.preload = "auto";
        });

        // Preload background music
        const music = new Audio(MUSIC_PATHS["background-music"]);
        music.preload = "auto";
      },

      cleanup: () => {
        get().stopAllSounds();
      },
    }),
    {
      name: "panda-battle-sound-storage", // Storage key
      storage: createJSONStorage(() => localStorage),
      // Only persist volume and mute settings, not audio instances
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        isMusicMuted: state.isMusicMuted,
        isSfxMuted: state.isSfxMuted,
        isMasterMuted: state.isMasterMuted,
      }),
    }
  )
);

// ============================================================================
// Selectors for use with useSoundStore
// ============================================================================

/**
 * Selector to get master volume
 */
export const selectMasterVolume = (state: SoundState) => state.masterVolume;

/**
 * Selector to get music volume
 */
export const selectMusicVolume = (state: SoundState) => state.musicVolume;

/**
 * Selector to get sfx volume
 */
export const selectSfxVolume = (state: SoundState) => state.sfxVolume;

/**
 * Selector to get master mute status
 */
export const selectIsMasterMuted = (state: SoundState) => state.isMasterMuted;

/**
 * Selector to get music mute status
 */
export const selectIsMusicMuted = (state: SoundState) => state.isMusicMuted;

/**
 * Selector to get sfx mute status
 */
export const selectIsSfxMuted = (state: SoundState) => state.isSfxMuted;

