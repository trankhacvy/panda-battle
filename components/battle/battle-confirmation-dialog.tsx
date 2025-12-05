"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpponentPanda } from "@/lib/mock/battles";

interface BattleConfirmationDialogProps {
  opponent: OpponentPanda | null;
  playerTurns: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BattleConfirmationDialog({
  opponent,
  playerTurns,
  onConfirm,
  onCancel,
}: BattleConfirmationDialogProps) {
  if (!opponent) return null;

  const canBattle = playerTurns >= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-2xl">⚔️</span> Challenge Opponent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opponent Info */}
          <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl">
              {opponent.type === "red" && "🔴"}
              {opponent.type === "bamboo" && "🎋"}
              {opponent.type === "giant" && "⛰️"}
              {opponent.type === "snow" && "❄️"}
            </div>
            <h3 className="text-xl font-bold">{opponent.name}</h3>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Rank #{opponent.rank}</Badge>
              <Badge variant="primary">Power: {opponent.power}</Badge>
            </div>
          </div>

          {/* Turn Cost */}
          <div className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="text-sm font-medium">Turn Cost</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              1 Turn
            </Badge>
          </div>

          {/* Current Turns */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your turns:</span>
            <Badge
              variant={canBattle ? "secondary" : "destructive"}
              className="text-base"
            >
              {playerTurns} / 10
            </Badge>
          </div>

          {/* Top 20 Warning */}
          {opponent.isInTop20 && (
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="text-xl">⚠️</span>
                <span>Top 20 Player Warning</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Top 20 players have a 20% defensive vulnerability, making them
                easier to defeat. However, they are highly skilled opponents!
              </p>
            </div>
          )}

          {/* High Risk Warning */}
          {opponent.risk >= 8 && (
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                <span className="text-xl">🔥</span>
                <span>High Risk Opponent</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This opponent has a high risk rating. Proceed with caution!
              </p>
            </div>
          )}

          {/* Insufficient Turns Warning */}
          {!canBattle && (
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                <span className="text-xl">❌</span>
                <span>Insufficient Turns</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You need at least 1 turn to initiate a battle. Wait for
                regeneration or purchase more turns.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onConfirm}
              disabled={!canBattle}
            >
              <span className="text-xl mr-2">⚔️</span>
              {canBattle ? "Start Battle" : "No Turns"}
            </Button>
          </div>

          {/* Info text */}
          <p className="text-xs text-center text-muted-foreground">
            Battle results will be displayed immediately after combat resolution
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
