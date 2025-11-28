"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPlayerData } from "@/lib/mock/game";
import { useEffect, useState } from "react";

/**
 * HomeTab - Main player dashboard
 *
 * Displays:
 * - Player's panda with attributes (Task 7.1)
 * - Turn counter (Task 7.2)
 * - Quick stats (wins/losses, earnings) (Task 7.3)
 * - Quick action buttons (Task 7.4)
 *
 * Requirements: 1.4, 2.1, 2.2, 2.3, 3.1, 3.4, 5.1, 6.1
 */
export function HomeTab() {
  const player = mockPlayerData;
  const [timeUntilNextTurn, setTimeUntilNextTurn] = useState("");

  // Calculate time until next turn regeneration
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

  const isTurnsFull = player.turns === player.maxTurns;

  return (
    <div className="space-y-3 pb-4 sm:space-y-4">
      {/* Task 7.1: Main Panda Display */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
          {player.pandaName}
        </h1>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="rank" className="text-xs sm:text-sm">
            Rank #{player.rank}
          </Badge>
          <span className="text-xs text-muted-foreground">
            of {player.totalPlayers} players
          </span>
        </div>
      </div>

      {/* Panda Visual Representation */}
      <Card variant="game" className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            {/* Panda Avatar */}
            <div className="relative">
              <div className="text-6xl sm:text-8xl animate-bounce-slow">🐼</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="text-xs whitespace-nowrap">
                  Power: {totalPower}
                </Badge>
              </div>
            </div>

            {/* Attributes Display */}
            <div className="w-full space-y-2 sm:space-y-3">
              <StatCard
                label="Strength"
                value={player.attributes.strength}
                maxValue={40}
                variant="strength"
                icon="💪"
              />
              <StatCard
                label="Speed"
                value={player.attributes.speed}
                maxValue={40}
                variant="speed"
                icon="⚡"
              />
              <StatCard
                label="Endurance"
                value={player.attributes.endurance}
                maxValue={40}
                variant="endurance"
                icon="🛡️"
              />
              <StatCard
                label="Luck"
                value={player.attributes.luck}
                maxValue={40}
                variant="luck"
                icon="🍀"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task 7.2: Turn Counter Display */}
      <Card variant="game">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Battle Turns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="turns"
                className={`text-2xl px-4 py-2 ${
                  isTurnsFull ? "animate-pulse" : ""
                }`}
              >
                {player.turns} / {player.maxTurns}
              </Badge>
              {isTurnsFull && (
                <span className="text-xs text-emerald-500 font-semibold animate-pulse">
                  Full!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next turn in:</span>
            <span className="font-mono font-semibold text-indigo-500">
              {timeUntilNextTurn}
            </span>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            +3 turns regenerate every hour
          </div>
        </CardContent>
      </Card>

      {/* Task 7.3: Quick Stats Panel */}
      <Card variant="game">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Battle Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Win/Loss Record */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-emerald-500">
                {player.wins}
              </div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-gray-500">
                {player.losses}
              </div>
              <div className="text-xs text-muted-foreground">Losses</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-cyan-500">{winRate}%</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
          </div>

          {/* Total Battles */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Total Battles</span>
            <Badge variant="outline" className="text-base font-bold">
              {player.totalBattles}
            </Badge>
          </div>

          {/* Prize Pool & Earnings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-linear-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/30">
              <span className="text-sm font-medium">Your Earnings</span>
              <Badge variant="prize" className="text-base">
                {player.earnings.toFixed(2)} SOL
              </Badge>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Prize pool updates hourly
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task 7.4: Quick Action Buttons */}
      <div className="space-y-2.5 sm:space-y-3 pt-2">
        <Button
          variant="game"
          size="lg"
          className="w-full text-sm sm:text-base"
          disabled={player.turns === 0}
        >
          <span className="text-lg sm:text-xl mr-2">⚔️</span>
          Quick Battle
          {player.turns === 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              No Turns
            </Badge>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <Button
            variant="game-secondary"
            size="default"
            className="w-full text-xs sm:text-sm"
          >
            <span className="text-base sm:text-lg mr-1">💰</span>
            <span className="hidden xs:inline">Buy Turns</span>
            <span className="xs:hidden">Turns</span>
          </Button>
          <Button
            variant="outline"
            size="default"
            className="w-full text-xs sm:text-sm"
          >
            <span className="text-base sm:text-lg mr-1">🏆</span>
            <span className="hidden xs:inline">Leaderboard</span>
            <span className="xs:hidden">Ranks</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
