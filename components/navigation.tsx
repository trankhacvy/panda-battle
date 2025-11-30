"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSoundStore, selectMasterVolume, selectMusicVolume, selectSfxVolume, selectIsMasterMuted, selectIsMusicMuted, selectIsSfxMuted } from "@/lib/store/sound-store";
import { Settings, Volume2, VolumeX, Music, Volume1 } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/home",
    icon: "/images/home-icon.png",
  },
  {
    id: "battle",
    label: "Battle",
    path: "/battle",
    icon: "/images/battle-icon.png",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    path: "/leaderboard",
    icon: "/images/leaderboard-icon.png",
  },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const playSound = useSoundStore((state) => state.playSound);
  const [showSettings, setShowSettings] = useState(false);

  // Sound settings
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

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleNavClick = (path: string) => {
    playSound("button-click");
    router.push(path);
    setShowSettings(false);
  };

  const handleSettingsClick = () => {
    playSound("button-click");
    setShowSettings(!showSettings);
  };

  if (pathname === "/") {
    return null;
  }

  return (
    <nav
      className="relative h-20 flex items-center justify-center gap-6 px-4 py-2"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Settings Dropdown */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSettings(false)}
          />
          <div className="absolute bottom-full mb-2 right-4 z-50 bg-gradient-to-br from-gray-900 to-gray-950 rounded-md p-3 w-64 shadow-2xl">
            <h3 className="text-base font-black text-white mb-2.5">🎵 Settings</h3>
            
            <div className="space-y-2">
              {/* Master Volume */}
              <div className="bg-orange-500/10 rounded-sm p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isMasterMuted ? (
                      <VolumeX className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-xs font-bold text-white">Master</span>
                    <span className="text-xs font-bold text-orange-500 ml-auto">
                      {Math.round(masterVolume * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={toggleMasterMute}
                    className="text-xs font-bold bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 px-2 py-0.5 rounded-sm"
                  >
                    {isMasterMuted ? "On" : "Off"}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-800 rounded-sm appearance-none cursor-pointer accent-orange-500"
                  disabled={isMasterMuted}
                />
              </div>

              {/* Music Volume */}
              <div className="bg-cyan-500/10 rounded-sm p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isMusicMuted ? (
                      <VolumeX className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Music className="w-4 h-4 text-cyan-500" />
                    )}
                    <span className="text-xs font-bold text-white">Music</span>
                    <span className="text-xs font-bold text-cyan-500 ml-auto">
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={toggleMusicMute}
                    className="text-xs font-bold bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30 px-2 py-0.5 rounded-sm"
                  >
                    {isMusicMuted ? "On" : "Off"}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume * 100}
                  onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-800 rounded-sm appearance-none cursor-pointer accent-cyan-500"
                  disabled={isMusicMuted || isMasterMuted}
                />
              </div>

              {/* SFX Volume */}
              <div className="bg-green-500/10 rounded-sm p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isSfxMuted ? (
                      <VolumeX className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Volume1 className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-xs font-bold text-white">Effects</span>
                    <span className="text-xs font-bold text-green-500 ml-auto">
                      {Math.round(sfxVolume * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={toggleSfxMute}
                    className="text-xs font-bold bg-green-500/20 text-green-500 hover:bg-green-500/30 px-2 py-0.5 rounded-sm"
                  >
                    {isSfxMuted ? "On" : "Off"}
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume * 100}
                  onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-800 rounded-sm appearance-none cursor-pointer accent-green-500"
                  disabled={isSfxMuted || isMasterMuted}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {navItems.map((item) => {
        const active = isActive(item.path);

        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.path)}
            className={cn(
              "relative transition-all duration-200 flex flex-col items-center justify-center flex-1",
              "active:scale-95"
            )}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            {/* Icon container */}
            <div className={cn(
              "mb-1 transition-all duration-200",
              active && "scale-110 brightness-110"
            )}>
              <img
                src={item.icon}
                width={40}
                height={40}
                alt={item.label}
                className="object-cover"
              />
            </div>
            
            {/* Label */}
            <span
              className={cn(
                "transition-all duration-200 text-sm font-black uppercase tracking-wide",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Settings Button */}
      <button
        onClick={handleSettingsClick}
        className={cn(
          "relative transition-all duration-200 flex flex-col items-center justify-center flex-1",
          "active:scale-95"
        )}
        aria-label="Settings"
      >
        <div className={cn(
          "mb-1 transition-all duration-200",
          showSettings && "scale-110 rotate-90"
        )}>
          <Settings className="w-10 h-10 text-muted-foreground" />
        </div>
        <span
          className={cn(
            "transition-all duration-200 text-sm font-black uppercase tracking-wide",
            showSettings 
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          Settings
        </span>
      </button>
    </nav>
  );
}
