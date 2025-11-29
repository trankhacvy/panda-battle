"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockPlayerData } from "@/lib/mock/game";
import { useEffect, useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Button3D } from "@/components/ui/button-3d";

export default function HomePage() {
  const player = mockPlayerData;
  const [timeUntilNextTurn, setTimeUntilNextTurn] = useState("");

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
    <div className="mx-auto p-4 space-y-4">
      {/* Player Header */}
      <div className="text-center space-y-2">
        <div className="text-7xl">🐼</div>
        <h1 className="text-2xl font-bold">{player.pandaName}</h1>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">Rank #{player.rank}</Badge>
          <span className="text-sm text-muted-foreground">
            of {player.totalPlayers} players
          </span>
        </div>
      </div>

      {/* Turns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Battle Turns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {player.turns} / {player.maxTurns}
            </span>
            <span className="text-sm text-muted-foreground">
              Next: {timeUntilNextTurn}
            </span>
          </div>
          <Progress
            value={(player.turns / player.maxTurns) * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            +3 turns regenerate every hour
          </p>
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {/* Strength */}
            <div className="aspect-square border rounded-lg p-2 flex flex-col items-center justify-center space-y-1 bg-muted/30">
              <div className="text-center">
                <Typography
                  variant="small"
                  color="muted"
                  className="text-[14px] font-semibold"
                >
                  Strength
                </Typography>
                <Typography variant="large" weight="bold" className="text-lg">
                  {player.attributes.strength}
                </Typography>
              </div>
            </div>
            {/* Speed */}
            <div className="aspect-square border rounded-lg p-2 flex flex-col items-center justify-center space-y-1 bg-muted/30">
              <div className="text-center">
                <Typography
                  variant="small"
                  color="muted"
                  className="text-[14px] font-semibold"
                >
                  Speed
                </Typography>
                <Typography variant="large" weight="bold" className="text-lg">
                  {player.attributes.speed}
                </Typography>
              </div>
            </div>
            {/* Endurance */}
            <div className="aspect-square border rounded-lg p-2 flex flex-col items-center justify-center space-y-1 bg-muted/30">
              <div className="text-center">
                <Typography
                  variant="small"
                  color="muted"
                  className="text-[14px] font-semibold"
                >
                  Endurance
                </Typography>
                <Typography variant="large" weight="bold" className="text-lg">
                  {player.attributes.endurance}
                </Typography>
              </div>
            </div>
            {/* Luck */}
            <div className="aspect-square border rounded-lg p-2 flex flex-col items-center justify-center space-y-1 bg-muted/30">
              <div className="text-center">
                <Typography
                  variant="small"
                  color="muted"
                  className="text-[14px] font-semibold"
                >
                  Luck
                </Typography>
                <Typography variant="large" weight="bold" className="text-lg">
                  {player.attributes.luck}
                </Typography>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Power</span>
              <span className="font-bold text-lg">{totalPower}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{player.wins}</div>
              <div className="text-xs text-muted-foreground">Wins</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{player.losses}</div>
              <div className="text-xs text-muted-foreground">Losses</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{winRate}%</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Battles</span>
              <span className="font-semibold">{player.totalBattles}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Earnings</span>
              <span className="font-semibold">
                {player.earnings.toFixed(2)} SOL
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        <Button3D
          className="w-full h-10 text-base"
          variant="3d-red"
          disabled={player.turns === 0}
        >
          Start Battle
        </Button3D>
        <div className="grid grid-cols-2 gap-2 h-14">
          <Button3D variant="3d-green" className="h-10 text-sm">
            Buy Turns
          </Button3D>
          <Button3D variant="3d-green" className="h-10 text-sm">
            View Leaderboard
          </Button3D>
        </div>
      </div>
    </div>
  );
}
