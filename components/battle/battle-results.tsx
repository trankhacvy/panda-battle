"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OpponentPanda } from "@/lib/mock/battles";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

interface BattleResultsProps {
  playerPanda: OpponentPanda;
  opponentPanda: OpponentPanda;
  winner: "player" | "opponent";
  playerScore: number;
  opponentScore: number;
  stolenAttribute: {
    type: string;
    amount: number;
  } | null;
  onComplete: () => void;
}

/**
 * BattleResults - Battle results display screen
 *
 * Task 9.4: Add battle results screen
 * - Display final battle outcome
 * - Show attribute changes for both players
 * - Display updated rank/position
 * - Add "Battle Again" and "Return Home" buttons
 *
 * Requirements: 3.5, 4.4
 */
export function BattleResults({
  playerPanda,
  opponentPanda,
  winner,
  playerScore,
  opponentScore,
  stolenAttribute,
  onComplete,
}: BattleResultsProps) {
  const isVictory = winner === "player";
  const { playWin, playLose, playButtonClick } = useSound();

  // Play win/lose sound when results are shown
  useEffect(() => {
    if (isVictory) {
      playWin();
    } else {
      playLose();
    }
  }, [isVictory, playWin, playLose]);

  // Calculate new attributes if steal occurred
  const getNewPlayerAttributes = () => {
    if (!stolenAttribute) return playerPanda.attributes;

    return {
      ...playerPanda.attributes,
      [stolenAttribute.type]:
        playerPanda.attributes[
          stolenAttribute.type as keyof typeof playerPanda.attributes
        ] + stolenAttribute.amount,
    };
  };

  const getNewOpponentAttributes = () => {
    if (!stolenAttribute) return opponentPanda.attributes;

    return {
      ...opponentPanda.attributes,
      [stolenAttribute.type]:
        opponentPanda.attributes[
          stolenAttribute.type as keyof typeof opponentPanda.attributes
        ] - stolenAttribute.amount,
    };
  };

  const newPlayerAttributes = getNewPlayerAttributes();
  const newOpponentAttributes = getNewOpponentAttributes();

  // Calculate new ranks (mock calculation)
  const newPlayerRank = isVictory
    ? Math.max(1, playerPanda.rank - 1)
    : Math.min(1000, playerPanda.rank + 1);
  const newOpponentRank = isVictory
    ? Math.min(1000, opponentPanda.rank + 1)
    : Math.max(1, opponentPanda.rank - 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-8xl animate-bounce">
            {isVictory ? "🏆" : "💀"}
          </div>
          <h1
            className={cn(
              "text-5xl font-bold text-transparent bg-clip-text",
              isVictory
                ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
                : "bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700"
            )}
          >
            {isVictory ? "VICTORY!" : "DEFEAT"}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isVictory
              ? `${playerPanda.name} has defeated ${opponentPanda.name}!`
              : `${opponentPanda.name} has defeated ${playerPanda.name}!`}
          </p>
        </div>

        {/* Battle Scores */}
        <Card variant="game">
          <CardHeader>
            <CardTitle className="text-center">Battle Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Player Score */}
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">Your Score</div>
                <div
                  className={cn(
                    "text-4xl font-bold",
                    isVictory ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {playerScore}
                </div>
                <Badge variant={isVictory ? "default" : "outline"}>
                  {playerPanda.name}
                </Badge>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">
                  VS
                </div>
              </div>

              {/* Opponent Score */}
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  Opponent Score
                </div>
                <div
                  className={cn(
                    "text-4xl font-bold",
                    !isVictory ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {opponentScore}
                </div>
                <Badge variant={!isVictory ? "default" : "outline"}>
                  {opponentPanda.name}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attribute Changes */}
        {stolenAttribute && (
          <Card variant="highlight">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <span className="text-2xl">✨</span>
                <span>Attribute Stolen!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  You stole{" "}
                  <span className="font-bold text-yellow-500">
                    {stolenAttribute.amount}
                  </span>{" "}
                  points of{" "}
                  <span className="font-bold capitalize">
                    {stolenAttribute.type}
                  </span>{" "}
                  from {opponentPanda.name}!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Player Changes */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-emerald-500">
                    Your Changes
                  </div>
                  <div className="space-y-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{stolenAttribute.type}</span>
                      <span className="font-bold text-emerald-500">
                        {
                          playerPanda.attributes[
                            stolenAttribute.type as keyof typeof playerPanda.attributes
                          ]
                        }{" "}
                        →{" "}
                        {
                          newPlayerAttributes[
                            stolenAttribute.type as keyof typeof newPlayerAttributes
                          ]
                        }
                      </span>
                    </div>
                    <Progress
                      value={
                        (newPlayerAttributes[
                          stolenAttribute.type as keyof typeof newPlayerAttributes
                        ] /
                          40) *
                        100
                      }
                      variant={
                        stolenAttribute.type as
                          | "strength"
                          | "speed"
                          | "endurance"
                          | "luck"
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Opponent Changes */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-red-500">
                    Opponent Changes
                  </div>
                  <div className="space-y-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{stolenAttribute.type}</span>
                      <span className="font-bold text-red-500">
                        {
                          opponentPanda.attributes[
                            stolenAttribute.type as keyof typeof opponentPanda.attributes
                          ]
                        }{" "}
                        →{" "}
                        {
                          newOpponentAttributes[
                            stolenAttribute.type as keyof typeof newOpponentAttributes
                          ]
                        }
                      </span>
                    </div>
                    <Progress
                      value={
                        (newOpponentAttributes[
                          stolenAttribute.type as keyof typeof newOpponentAttributes
                        ] /
                          40) *
                        100
                      }
                      variant={
                        stolenAttribute.type as
                          | "strength"
                          | "speed"
                          | "endurance"
                          | "luck"
                      }
                      className="h-2 opacity-50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rank Changes */}
        <Card variant="game">
          <CardHeader>
            <CardTitle className="text-center">Rank Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Rank */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-center">
                  Your Rank
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Badge variant="outline" className="text-lg">
                    #{playerPanda.rank}
                  </Badge>
                  <span className="text-2xl">{isVictory ? "⬆️" : "⬇️"}</span>
                  <Badge
                    variant={isVictory ? "default" : "outline"}
                    className={cn("text-lg", isVictory && "bg-emerald-500")}
                  >
                    #{newPlayerRank}
                  </Badge>
                </div>
                {isVictory && newPlayerRank <= 20 && playerPanda.rank > 20 && (
                  <div className="text-center">
                    <Badge variant="default" className="bg-yellow-500">
                      🎉 Entered Top 20!
                    </Badge>
                  </div>
                )}
              </div>

              {/* Opponent Rank */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-center">
                  Opponent Rank
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Badge variant="outline" className="text-lg">
                    #{opponentPanda.rank}
                  </Badge>
                  <span className="text-2xl">{!isVictory ? "⬆️" : "⬇️"}</span>
                  <Badge
                    variant={!isVictory ? "default" : "outline"}
                    className={cn("text-lg", !isVictory && "bg-emerald-500")}
                  >
                    #{newOpponentRank}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Battle Statistics */}
        <Card variant="game">
          <CardHeader>
            <CardTitle className="text-center">Battle Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl">⚔️</div>
                <div className="text-xs text-muted-foreground">
                  Total Battles
                </div>
                <div className="text-lg font-bold">
                  {playerPanda.wins + playerPanda.losses + 1}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl">🏆</div>
                <div className="text-xs text-muted-foreground">Wins</div>
                <div className="text-lg font-bold text-emerald-500">
                  {isVictory ? playerPanda.wins + 1 : playerPanda.wins}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl">💀</div>
                <div className="text-xs text-muted-foreground">Losses</div>
                <div className="text-lg font-bold text-red-500">
                  {!isVictory ? playerPanda.losses + 1 : playerPanda.losses}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl">📊</div>
                <div className="text-xs text-muted-foreground">Win Rate</div>
                <div className="text-lg font-bold">
                  {Math.floor(
                    ((isVictory ? playerPanda.wins + 1 : playerPanda.wins) /
                      (playerPanda.wins + playerPanda.losses + 1)) *
                      100
                  )}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              playButtonClick();
              onComplete();
            }}
          >
            <span className="text-xl mr-2">🏠</span>
            Return Home
          </Button>
          <Button
            variant="game"
            size="lg"
            className="flex-1"
            onClick={() => {
              playButtonClick();
              onComplete();
            }}
          >
            <span className="text-xl mr-2">⚔️</span>
            Battle Again
          </Button>
        </div>

        {/* Rewards Info (if victory) */}
        {isVictory && (
          <Card variant="game" className="bg-muted/30">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p className="font-semibold">🎁 Victory Rewards:</p>
                <p>
                  Your win has been recorded and your rank has been updated!
                </p>
                <p>Keep battling to climb the leaderboard and earn prizes.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
