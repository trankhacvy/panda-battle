"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mockLeaderboardEntries,
  getRankBadge,
  isTop20,
  type LeaderboardEntry,
} from "@/lib/mock/leaderboard";
import { RefreshCw, Swords } from "lucide-react";

/**
 * LeaderboardTab - Rankings and competitive standings
 *
 * Displays:
 * - Ranked player list with player cards
 * - Top 20 with special styling and cosmetic flair
 * - Player visibility rules (full/partial/hidden)
 * - Challenge buttons for visible players
 * - Current player position highlight
 */
export function LeaderboardTab() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(
    null
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleChallenge = (player: LeaderboardEntry) => {
    // This will be connected to battle flow in Phase 6
    console.log("Challenge player:", player.id);
  };

  const handlePlayerClick = (player: LeaderboardEntry) => {
    if (player.visibility !== "hidden") {
      setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <Button
          variant="game"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="min-w-[44px]"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Top 20 Badge */}
      <Card variant="highlight" className="p-2.5 sm:p-3">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="text-xl sm:text-2xl">🏆</span>
          <span className="font-semibold text-center">
            Top 20 players are fully visible and vulnerable to attacks!
          </span>
        </div>
      </Card>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {mockLeaderboardEntries.map((entry) => (
          <LeaderboardCard
            key={entry.id}
            entry={entry}
            isSelected={selectedPlayer?.id === entry.id}
            onClick={() => handlePlayerClick(entry)}
            onChallenge={() => handleChallenge(entry)}
          />
        ))}
      </div>
    </div>
  );
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isSelected: boolean;
  onClick: () => void;
  onChallenge: () => void;
}

function LeaderboardCard({
  entry,
  isSelected,
  onClick,
  onChallenge,
}: LeaderboardCardProps) {
  const isTopTwenty = isTop20(entry.rank);
  const rankBadge = getRankBadge(entry.rank);
  const canChallenge = entry.visibility !== "hidden" && !entry.isCurrentPlayer;

  return (
    <Card
      variant={
        entry.isCurrentPlayer ? "highlight" : isTopTwenty ? "glow" : "default"
      }
      className={`cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-emerald-500" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className="flex flex-col items-center min-w-[60px]">
            <div
              className={`text-2xl font-bold ${
                isTopTwenty
                  ? "text-yellow-500"
                  : entry.isCurrentPlayer
                  ? "text-emerald-500"
                  : "text-muted-foreground"
              }`}
            >
              #{entry.rank}
            </div>
            {rankBadge && <div className="text-xl">{rankBadge}</div>}
          </div>

          {/* Avatar */}
          <div className="text-4xl">{entry.avatar}</div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-bold truncate ${
                  entry.isCurrentPlayer ? "text-emerald-500" : ""
                }`}
              >
                {entry.player}
              </h3>
              {entry.isCurrentPlayer && (
                <Badge variant="rank" className="text-xs">
                  YOU
                </Badge>
              )}
            </div>

            {/* Total Power */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="strength" className="text-xs">
                ⚡ {entry.totalPower}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {entry.totalWins}W - {entry.totalLosses}L (
                {entry.winRate.toFixed(1)}%)
              </span>
            </div>

            {/* Attributes - Full visibility */}
            {entry.visibility === "full" && entry.attributes && (
              <div className="grid grid-cols-4 gap-1">
                <Badge variant="strength" className="text-xs justify-center">
                  💪 {entry.attributes.strength}
                </Badge>
                <Badge variant="speed" className="text-xs justify-center">
                  ⚡ {entry.attributes.speed}
                </Badge>
                <Badge variant="endurance" className="text-xs justify-center">
                  🛡️ {entry.attributes.endurance}
                </Badge>
                <Badge variant="luck" className="text-xs justify-center">
                  🍀 {entry.attributes.luck}
                </Badge>
              </div>
            )}

            {/* Attributes - Partial visibility */}
            {entry.visibility === "partial" && entry.attributes && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  💪 {entry.attributes.strength}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ⚡ {entry.attributes.speed}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  • Other stats hidden
                </span>
              </div>
            )}

            {/* Hidden visibility */}
            {entry.visibility === "hidden" && (
              <div className="text-xs text-muted-foreground italic">
                Player details hidden
              </div>
            )}

            {/* Expanded details */}
            {isSelected && entry.visibility !== "hidden" && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Wins:</span>
                    <span className="ml-2 font-semibold text-green-500">
                      {entry.totalWins}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Losses:</span>
                    <span className="ml-2 font-semibold text-red-500">
                      {entry.totalLosses}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="ml-2 font-semibold">
                      {entry.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Power:</span>
                    <span className="ml-2 font-semibold text-yellow-500">
                      {entry.totalPower}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Challenge Button */}
          {canChallenge && (
            <Button
              variant={isTopTwenty ? "danger" : "game"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChallenge();
              }}
              className="shrink-0"
            >
              <Swords className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
