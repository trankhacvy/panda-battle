"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGameNotifications } from "@/lib/hooks/use-game-notifications";

/**
 * Example component demonstrating how to use game notifications
 * This can be used for testing or as a reference for implementation
 */
export function NotificationExamples() {
  const {
    notifyBattleWin,
    notifyBattleLoss,
    notifyTurnRegeneration,
    notifyRankUp,
    notifyRankDown,
    notifyTop20Entry,
    notifyTop20Exit,
    notifyAttacked,
    notifyTurnsFull,
    notifyIdleWarning,
  } = useGameNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Examples</CardTitle>
        <CardDescription>
          Click buttons to test different notification types
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Button
          variant="outline"
          onClick={() => notifyBattleWin("PandaMaster", "Strength")}
        >
          Battle Win
        </Button>
        <Button
          variant="outline"
          onClick={() => notifyBattleLoss("BambooWarrior", "Speed")}
        >
          Battle Loss
        </Button>
        <Button variant="outline" onClick={() => notifyTurnRegeneration(3)}>
          Turn Regeneration
        </Button>
        <Button variant="outline" onClick={() => notifyRankUp(15)}>
          Rank Up
        </Button>
        <Button variant="outline" onClick={() => notifyRankDown(25)}>
          Rank Down
        </Button>
        <Button variant="outline" onClick={() => notifyTop20Entry()}>
          Top 20 Entry
        </Button>
        <Button variant="outline" onClick={() => notifyTop20Exit()}>
          Top 20 Exit
        </Button>
        <Button variant="outline" onClick={() => notifyAttacked("ShadowPanda")}>
          Under Attack
        </Button>
        <Button variant="outline" onClick={() => notifyTurnsFull()}>
          Turns Full
        </Button>
        <Button variant="outline" onClick={() => notifyIdleWarning(2)}>
          Idle Warning
        </Button>
      </CardContent>
    </Card>
  );
}
