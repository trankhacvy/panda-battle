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
import { Brain, Dumbbell, Flame, Zap } from "lucide-react";

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
    <div className="p-4">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <StatBadge
          icon={<Flame className="w-5 h-5" />}
          label="STA"
          value={85}
          color="bg-[#ff6b35]"
        />
        <StatBadge
          icon={<Dumbbell className="w-5 h-5" />}
          label="STR"
          value={92}
          color="bg-[#ff9500]"
        />
        <StatBadge
          icon={<Zap className="w-5 h-5" />}
          label="AGI"
          value={78}
          color="bg-[#34c759]"
        />
        <StatBadge
          icon={<Brain className="w-5 h-5" />}
          label="INT"
          value={64}
          color="bg-[#007aff]"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button3D>Upgrade</Button3D>
        <Button3D variant="3d-purple">Equip</Button3D>
      </div>
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white/95 rounded-xl px-2 py-1.5 flex items-center gap-2 shadow-md">
      <div className={`${color} text-white p-1.5 rounded-lg`}>{icon}</div>
      <span className="font-bold text-gray-800 text-sm">
        {label}: {value}
      </span>
    </div>
  );
}
