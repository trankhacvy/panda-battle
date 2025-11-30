"use client";

import { Badge } from "@/components/ui/badge";
import { mockPlayerData } from "@/lib/mock/game";
import { useEffect, useState } from "react";
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
    <div className="h-full flex flex-col p-4 gap-3 max-w-2xl mx-auto overflow-hidden">

      {/* Header Section */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{player.pandaName}</h1>
          <p className="text-base text-muted-foreground mt-0.5">
            Rank #{player.rank} • {winRate}% Win Rate
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-muted-foreground mb-0.5">Power</div>
          <div className="text-4xl font-black text-primary leading-none">{totalPower}</div>
        </div>
      </div>

      {/* Panda Display */}

      <div
        className="relative rounded-3xl overflow-hidden flex-shrink-0 shadow-lg border-4 border-primary/40"
        style={{
          backgroundImage: "url(/images/fighter-frame.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "180px",
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/images/sample-panda.png"
            alt="Panda Warrior"
            className="h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* Stats Section - Clean and Compact */}
      <div className="bg-card rounded-2xl p-4 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground tracking-tight">
            Attributes
          </h2>
          <span className="text-sm text-muted-foreground">Max: 40</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBar label="Stamina" value={player.attributes.endurance} max={40} color="bg-cyan-500" />
          <StatBar label="Strength" value={player.attributes.strength} max={40} color="bg-orange-500" />
          <StatBar label="Agility" value={player.attributes.speed} max={40} color="bg-green-500" />
          <StatBar label="Intelligence" value={player.attributes.luck} max={40} color="bg-purple-500" />
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        <InfoCard
          label="Battles"
          value={player.totalBattles.toString()}
          small
        />
        <InfoCard
          label="Wins"
          value={player.wins.toString()}
          small
          highlight="text-emerald-400"
        />
        <InfoCard
          label="Turns"
          value={`${player.turns}/${player.maxTurns}`}
          small
          highlight="text-primary"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <Button3D className="h-12 text-base">Battle</Button3D>
        <Button3D variant="3d-purple" className="h-12 text-base">
          Upgrade
        </Button3D>
      </div>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-foreground">{label}</span>
        <span className="text-base font-black text-foreground">{value}</span>
      </div>
      <div className="h-2.5 bg-background rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  small,
  highlight,
}: {
  label: string;
  value: string;
  small?: boolean;
  highlight?: string;
}) {
  return (
    <div className="bg-card rounded-xl p-3 text-center">
      <div className="text-xs font-bold text-muted-foreground mb-1">{label}</div>
      <div
        className={`font-black leading-none ${highlight || "text-foreground"} ${small ? "text-lg" : "text-2xl"
          }`}
      >
        {value}
      </div>
    </div>
  );
}
