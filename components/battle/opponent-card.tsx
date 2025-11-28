"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpponentPanda } from "@/lib/mock/battles";
import { StatCard } from "@/components/ui/stat-card";

interface OpponentCardProps {
  opponent: OpponentPanda;
  onChallenge: (opponent: OpponentPanda) => void;
  playerTurns: number;
}

/**
 * OpponentCard - Displays opponent information with visibility rules
 *
 * Requirements 9.1, 9.2, 9.3:
 * - Top 20: Full visibility (all attributes shown)
 * - Mid-tier: Partial visibility (limited info)
 * - Bottom-tier: Hidden (minimal info)
 */
export function OpponentCard({
  opponent,
  onChallenge,
  playerTurns,
}: OpponentCardProps) {
  const {
    visibility,
    rank,
    name,
    power,
    risk,
    attributes,
    isInTop20,
    wins,
    losses,
    winRate,
  } = opponent;

  // Determine what to show based on visibility
  const showFullDetails = visibility === "full";
  const showPartialDetails = visibility === "partial";
  const showMinimalDetails = visibility === "hidden";

  const getRiskColor = (risk: number) => {
    if (risk >= 9) return "text-red-500";
    if (risk >= 7) return "text-orange-500";
    if (risk >= 5) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 9) return "Extreme";
    if (risk >= 7) return "High";
    if (risk >= 5) return "Medium";
    return "Low";
  };

  return (
    <Card variant="game" className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header with rank and name */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="rank" className="text-xs">
                #{rank}
              </Badge>
              {isInTop20 && (
                <Badge
                  variant="default"
                  className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400"
                >
                  Top 20 ⚠️
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold">
              {showMinimalDetails ? "???" : name}
            </h3>
          </div>

          {/* Panda type indicator */}
          <div className="text-3xl">
            {opponent.type === "red" && "🔴"}
            {opponent.type === "bamboo" && "🎋"}
            {opponent.type === "giant" && "⛰️"}
            {opponent.type === "snow" && "❄️"}
          </div>
        </div>

        {/* Power and Risk indicators */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Power</div>
            <Badge variant="default" className="text-sm font-bold">
              {showMinimalDetails ? "???" : power}
            </Badge>
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Risk</div>
            <Badge
              variant="outline"
              className={`text-sm font-bold ${getRiskColor(risk)}`}
            >
              {getRiskLabel(risk)}
            </Badge>
          </div>
        </div>

        {/* Attributes - Full visibility only */}
        {showFullDetails && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Attributes
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">💪 Strength</span>
                  <span className="font-bold">{attributes.strength}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">⚡ Speed</span>
                  <span className="font-bold">{attributes.speed}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">🛡️ Endurance</span>
                  <span className="font-bold">{attributes.endurance}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">🍀 Luck</span>
                  <span className="font-bold">{attributes.luck}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Win/Loss record - Full and Partial visibility */}
        {(showFullDetails || showPartialDetails) && (
          <div className="flex items-center justify-between text-xs pt-2 border-t">
            <span className="text-muted-foreground">Record:</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 font-semibold">{wins}W</span>
              <span className="text-gray-500">-</span>
              <span className="text-gray-500 font-semibold">{losses}L</span>
              <span className="text-muted-foreground">
                ({winRate.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}

        {/* Partial visibility message */}
        {showPartialDetails && (
          <div className="text-xs text-center text-muted-foreground italic py-2 border-t">
            Limited info available for mid-tier players
          </div>
        )}

        {/* Hidden visibility message */}
        {showMinimalDetails && (
          <div className="text-xs text-center text-muted-foreground italic py-2 border-t">
            Player details hidden
          </div>
        )}

        {/* Challenge button */}
        <Button
          variant="game"
          size="sm"
          className="w-full"
          onClick={() => onChallenge(opponent)}
          disabled={playerTurns === 0}
        >
          <span className="text-lg mr-2">⚔️</span>
          Challenge
          {playerTurns === 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              No Turns
            </Badge>
          )}
        </Button>

        {/* Top 20 warning */}
        {isInTop20 && (
          <div className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Top 20 players have 20% vulnerability
          </div>
        )}
      </CardContent>
    </Card>
  );
}
