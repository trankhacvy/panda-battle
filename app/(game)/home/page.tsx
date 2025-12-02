"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockPlayerData } from "@/lib/mock/game";
import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Button3D } from "@/components/ui/button-3d";
import { useWallet } from "@/hooks/use-wallet";

export default function HomePage() {
  const { logout } = useWallet();
  const player = mockPlayerData;
  const [timeUntilNextTurn, setTimeUntilNextTurn] = useState("");
  useWallet();

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = player.nextTurnRegenTime.getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeUntilNextTurn("Ready!");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeUntilNextTurn(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [player.nextTurnRegenTime]);

  const totalPower =
    player.attributes.strength +
    player.attributes.speed +
    player.attributes.endurance +
    player.attributes.luck;

  const winRate =
    player.totalBattles > 0
      ? Math.round((player.wins / player.totalBattles) * 100)
      : 0;

  return (
    <div className="p-4 pb-24">
      {/* Panda Image */}
      <div
        className="rounded-xl flex items-center justify-center aspect-video overflow-hidden mb-4"
        style={{
          backgroundImage: "url(/images/fighter-frame.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img
          src="/images/sample-panda.png"
          alt="Panda Warrior"
          className="w-auto h-full object-cover"
        />
      </div>

      {/* Level and XP Section */}
      <div
        className="backdrop-blur-sm rounded-2xl p-6 mb-4 border border-cyan-500/30 relative overflow-hidden"
        style={{
          backgroundImage: "url(/images/attributes/lv-bg.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#0a1628]/60"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Level: {player.level}
          </h2>

          {/* XP Progress Bar */}
          <div className="mb-3">
            <div className="relative bg-gray-700/50 rounded-full h-10 overflow-hidden border-2 border-white/20">
              <div
                className="absolute inset-0 bg-linear-to-r from-blue-500 to-blue-400 transition-all duration-300 flex items-center justify-center"
                style={{ width: `${(player.experience / player.experienceToNextLevel) * 100}%` }}
              >
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  XP: {player.experience.toLocaleString()} / {player.experienceToNextLevel.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        
        </div>
      </div>

      {/* Stats Grid - 3 Attributes */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBadge
          icon="💪"
          label="STR"
          value={92}
          textColor="text-orange-500"
        />
        <StatBadge
          icon="⚡"
          label="AGI"
          value={78}
          textColor="text-green-500"
        />
        <StatBadge
          icon="🧠"
          label="INT"
          value={64}
          textColor="text-blue-500"
        />
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
  textColor,
}: {
  icon: string;
  label: string;
  value: number;
  textColor: string;
}) {
  return (
    <div className="bg-[#0a1628]/80 backdrop-blur-sm rounded-2xl px-2 py-2 flex items-center justify-center gap-1.5 border border-white/10">
      <div className="text-lg grayscale opacity-80">
        {icon}
      </div>
      <span className="font-bold text-xs whitespace-nowrap text-white">
        {label}: <span className={textColor}>{value}</span>
      </span>
    </div>
  );
}
