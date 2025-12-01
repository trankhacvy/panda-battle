"use client";

import { useState } from "react";
import { Settings, Volume2, Music } from "lucide-react";
import { useSoundStore } from "@/lib/store/sound-store";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

export function SettingsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { play, SOUNDS } = useSound();
    const {
        isMuted,
        isMusicEnabled,
        toggleMute,
        toggleMusic,
    } = useSoundStore();

    const handleToggle = () => {
        if (!isOpen) {
            play(SOUNDS.BUTTON_CLICK);
        }
        setIsOpen(!isOpen);
    };

    const handleToggleMute = () => {
        play(SOUNDS.BUTTON_CLICK);
        toggleMute();
    };

    const handleToggleMusic = () => {
        play(SOUNDS.BUTTON_CLICK);
        toggleMusic();
    };

    return (
        <div className="relative ml-2">
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <button
                onClick={handleToggle}
                className={cn(
                    "relative z-50 flex items-center justify-center transition-all duration-150 ease-in-out",
                    "bg-[#A855F7] hover:bg-[#B865F7] shadow-[0_8px_0_#7E3FB8]",
                    "active:shadow-none active:translate-y-[8px]",
                    "size-10 rounded-lg"
                )}
            >
                <Settings className={cn(
                    "size-4 text-white transition-transform duration-300",
                    isOpen && "rotate-90"
                )} />
            </button>

            <div
                className={cn(
                    "absolute top-[calc(100%+8px)] right-0 z-50 flex flex-col gap-2 transition-all duration-300 origin-top",
                    isOpen
                        ? "opacity-100 scale-y-100 translate-y-0"
                        : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none"
                )}
            >
                <button
                    onClick={handleToggleMute}
                    className={cn(
                        "relative flex items-center justify-center transition-all duration-150 ease-in-out",
                        "active:shadow-none active:translate-y-[6px]",
                        "size-10 rounded-lg",
                        isMuted
                            ? "bg-[#6B7280] hover:bg-[#7B8390] shadow-[0_6px_0_#4B5563]"
                            : "bg-[#A855F7] hover:bg-[#B865F7] shadow-[0_6px_0_#7E3FB8]"
                    )}
                >
                    <div className="relative">
                        <Volume2
                            className={cn(
                                "size-5 transition-colors",
                                isMuted ? "text-gray-400" : "text-white"
                            )}
                        />
                        {isMuted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-1 bg-red-600 rotate-45 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                            </div>
                        )}
                    </div>
                </button>

                <button
                    onClick={handleToggleMusic}
                    className={cn(
                        "relative flex items-center justify-center transition-all duration-150 ease-in-out",
                        "active:shadow-none active:translate-y-[6px]",
                        "size-10 rounded-lg",
                        !isMusicEnabled
                            ? "bg-[#6B7280] hover:bg-[#7B8390] shadow-[0_6px_0_#4B5563]"
                            : "bg-[#A855F7] hover:bg-[#B865F7] shadow-[0_6px_0_#7E3FB8]"
                    )}
                >
                    <div className="relative">
                        <Music
                            className={cn(
                                "size-5 transition-colors",
                                !isMusicEnabled ? "text-gray-400" : "text-white"
                            )}
                        />
                        {!isMusicEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-1 bg-red-600 rotate-45 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}

