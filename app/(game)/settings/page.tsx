"use client";

import { ArrowLeft, Volume2, VolumeX, Music, Volume1 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSoundStore, selectMasterVolume, selectMusicVolume, selectSfxVolume, selectIsMasterMuted, selectIsMusicMuted, selectIsSfxMuted } from "@/lib/store/sound-store";

export default function SettingsPage() {
  const router = useRouter();

  const masterVolume = useSoundStore(selectMasterVolume);
  const musicVolume = useSoundStore(selectMusicVolume);
  const sfxVolume = useSoundStore(selectSfxVolume);
  const isMasterMuted = useSoundStore(selectIsMasterMuted);
  const isMusicMuted = useSoundStore(selectIsMusicMuted);
  const isSfxMuted = useSoundStore(selectIsSfxMuted);

  const setMasterVolume = useSoundStore((state) => state.setMasterVolume);
  const setMusicVolume = useSoundStore((state) => state.setMusicVolume);
  const setSfxVolume = useSoundStore((state) => state.setSfxVolume);
  const toggleMasterMute = useSoundStore((state) => state.toggleMasterMute);
  const toggleMusicMute = useSoundStore((state) => state.toggleMusicMute);
  const toggleSfxMute = useSoundStore((state) => state.toggleSfxMute);
  const playSound = useSoundStore((state) => state.playSound);

  const handleBack = () => {
    playSound("button-click");
    router.back();
  };

  return (
    <div className="flex-1 relative overflow-auto">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0" />

      <div className="relative z-10 px-4 py-4 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-8 h-8 text-black" />
          </button>
          <h1 className="text-5xl font-black text-black">Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎵</span>
            <h2 className="text-3xl font-black text-black">Audio Settings</h2>
          </div>

          <div className="rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {isMasterMuted ? (
                  <VolumeX className="w-8 h-8 text-gray-400" />
                ) : (
                  <Volume2 className="w-8 h-8 text-orange-500" />
                )}
                <div>
                  <h3 className="text-xl font-black text-black">Master Volume</h3>
                  <p className="text-base font-bold text-black">Control all sounds</p>
                </div>
              </div>
              <button
                onClick={toggleMasterMute}
                className="text-lg font-black text-orange-500 hover:bg-orange-500/10 px-6 py-3 rounded-lg transition-colors"
              >
                {isMasterMuted ? "Unmute" : "Mute"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume * 100}
                onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
                className="flex-1 h-4 bg-orange-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                disabled={isMasterMuted}
              />
              <span className="text-2xl font-black text-orange-500 min-w-[70px] text-right">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {isMusicMuted ? (
                  <VolumeX className="w-8 h-8 text-gray-400" />
                ) : (
                  <Music className="w-8 h-8 text-cyan-500" />
                )}
                <div>
                  <h3 className="text-xl font-black text-black">Music Volume</h3>
                  <p className="text-base font-bold text-black">Background music</p>
                </div>
              </div>
              <button
                onClick={toggleMusicMute}
                className="text-lg font-black text-cyan-500 hover:bg-cyan-500/10 px-6 py-3 rounded-lg transition-colors"
                disabled={isMasterMuted}
              >
                {isMusicMuted ? "Unmute" : "Mute"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume * 100}
                onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                className="flex-1 h-4 bg-cyan-200 rounded-full appearance-none cursor-pointer accent-cyan-500"
                disabled={isMusicMuted || isMasterMuted}
              />
              <span className="text-2xl font-black text-cyan-500 min-w-[70px] text-right">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {isSfxMuted ? (
                  <VolumeX className="w-8 h-8 text-gray-400" />
                ) : (
                  <Volume1 className="w-8 h-8 text-green-500" />
                )}
                <div>
                  <h3 className="text-xl font-black text-black">Sound Effects</h3>
                  <p className="text-base font-bold text-black">Button clicks & game sounds</p>
                </div>
              </div>
              <button
                onClick={toggleSfxMute}
                className="text-lg font-black text-green-500 hover:bg-green-500/10 px-6 py-3 rounded-lg transition-colors"
                disabled={isMasterMuted}
              >
                {isSfxMuted ? "Unmute" : "Mute"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume * 100}
                onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                className="flex-1 h-4 bg-green-200 rounded-full appearance-none cursor-pointer accent-green-500"
                disabled={isSfxMuted || isMasterMuted}
              />
              <span className="text-2xl font-black text-green-500 min-w-[70px] text-right">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚙️</span>
            <h2 className="text-3xl font-black text-black">General</h2>
          </div>

          <div className="rounded-xl p-6">
            <p className="text-black text-lg font-bold text-center">More settings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

