"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockPlayerData } from "@/lib/mock/game";
import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { useWallet } from "@/hooks/use-wallet";
import { CardFrame } from "@/components/ui/card-frame";
import { BonusCard } from "@/components/ui/bonus-card";

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
    <div className="p-4 pb-24 space-y-4">
      {/* Panda Image */}
      <CardFrame size="lg">
        <div
          className="aspect-video flex items-center justify-center relative overflow-hidden"
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
      </CardFrame>

      {/* Level and XP Section */}
      <div
        className="rounded-2xl p-4 relative overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.15)]"
        style={{
          backgroundImage: "url(/images/attributes/lv-bg.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* <div className="absolute inset-0 bg-[#0a1628]/70"></div> */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Level: {player.level}
          </h2>

          {/* XP Progress Bar */}
          <div className="relative">
            <Progress
              value={(player.experience / player.experienceToNextLevel) * 100}
              variant="game"
              showShell
              className="h-8"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white font-bold text-sm drop-shadow-lg z-10">
                XP: {player.experience.toLocaleString()} /{" "}
                {player.experienceToNextLevel.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <h3 className="text-xl font-bold text-white mb-3">Daily Quests</h3>
        <div className="grid grid-cols-3 gap-2">
          <QuestCard
            icon="🎋"
            title="Collect 50 Bamboo"
            progress={2}
            total={50}
            color="bg-yellow-400"
          />
          <QuestCard
            icon="⚔️"
            title="Defeat 3 Enemies"
            progress={3}
            total={3}
            color="bg-yellow-400"
            completed
          />
          <QuestCard
            icon="🏃"
            title="Train Agility"
            progress={1}
            total={1}
            color="bg-green-500"
            completed
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <ActionButton icon="⚔️" label="Train" />
        <ActionButton icon="🏪" label="Shop" />
        <ActionButton icon="👥" label="Social" />
      </div>

      {/* News Feed */}
      <div>
        <h3 className="text-xl font-bold text-white mb-3">News Feed</h3>
        <div className="bg-[#0a1628]/80 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
          <CardFrame size="sm" className="flex-shrink-0">
            <div className="w-12 h-12 relative overflow-hidden">
              <img
                src="/images/reated-panda-bg.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src="/images/sample-panda.png"
                alt="Event"
                className="relative z-10 w-full h-full object-cover"
              />
            </div>
          </CardFrame>
          <div>
            <p className="text-white font-bold text-sm">
              New Event: Bamboo Festival
            </p>
          </div>
        </div>
      </div>

      <BonusCard
        size="sm"
        title="BONUS"
        icon="🎁"
        onOpen={() => console.log("Open bonus")}
        onClose={() => console.log("Close")}
      />
    </div>
  );
}

function QuestCard({
  icon,
  title,
  progress,
  total,
  color,
  completed = false,
}: {
  icon: string;
  title: string;
  progress: number;
  total: number;
  color: string;
  completed?: boolean;
}) {
  const isFull = progress >= total;
  return (
    <div className="bg-[#0a1628]/80 backdrop-blur-sm rounded-xl p-3">
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl">{icon}</div>
        <p className="text-white text-xs font-medium text-center leading-tight min-h-[2rem]">
          {title}
        </p>
        <div className="w-full relative">
          <Progress
            value={(progress / total) * 100}
            variant="game"
            showShell
            className="h-5"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white text-xs font-bold drop-shadow-lg z-10">
              {isFull ? "100%" : `${progress} / ${total}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button className="bg-[#0a1628]/90 backdrop-blur-sm rounded-xl p-4 hover:bg-[#0a1628]/100 transition-all active:scale-95">
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl">{icon}</div>
        <p className="text-white font-bold text-sm">{label}</p>
      </div>
    </button>
  );
}
