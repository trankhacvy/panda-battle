"use client";

import { useState } from "react";
import { Settings, Volume2, Music } from "lucide-react";
import { useSoundStore } from "@/lib/store/sound-store";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import { RoundButton } from "@/components/ui/round-button";

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
                    className="fixed inset-0 z-[100]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <RoundButton
                onClick={handleToggle}
                variant="purple"
                size="sm"
                className="relative z-[110]"
            >
                <Settings className={cn(
                    "size-4 text-white transition-transform duration-300",
                    isOpen && "rotate-90"
                )} />
            </RoundButton>

            <div
                className={cn(
                    "absolute top-[calc(100%+8px)] right-0 z-[110] flex flex-col gap-2 transition-all duration-300 origin-top",
                    isOpen
                        ? "opacity-100 scale-y-100 translate-y-0"
                        : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none"
                )}
            >
                <RoundButton
                    onClick={handleToggleMute}
                    variant={isMuted ? "red" : "purple"}
                    size="sm"
                >
                    <div className="relative">
                        <Volume2
                            className={cn(
                                "size-4 transition-colors text-white"
                            )}
                        />
                        {isMuted && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-0.5 bg-white rotate-45 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                            </div>
                        )}
                    </div>
                </RoundButton>

                <RoundButton
                    onClick={handleToggleMusic}
                    variant={!isMusicEnabled ? "red" : "purple"}
                    size="sm"
                >
                    <div className="relative">
                        <Music
                            className={cn(
                                "size-4 transition-colors text-white"
                            )}
                        />
                        {!isMusicEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-0.5 bg-white rotate-45 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                            </div>
                        )}
                    </div>
                </RoundButton>
            </div>
        </div>
    );
}

