"use client";

import { useToast } from "./use-toast";
import { Trophy, Zap, TrendingUp, TrendingDown, Swords } from "lucide-react";

export function useGameNotifications() {
  const { addToast } = useToast();

  const notifyBattleWin = (opponentName: string, attributeStolen: string) => {
    addToast({
      title: "Victory! 🎉",
      description: `You defeated ${opponentName} and stole their ${attributeStolen}!`,
      variant: "success",
      duration: 6000,
    });
  };

  const notifyBattleLoss = (attackerName: string, attributeLost: string) => {
    addToast({
      title: "Defeated",
      description: `${attackerName} defeated you and stole your ${attributeLost}.`,
      variant: "error",
      duration: 6000,
    });
  };

  const notifyTurnRegeneration = (turnsAdded: number) => {
    addToast({
      title: "Turns Regenerated",
      description: `You received ${turnsAdded} new turns!`,
      variant: "default",
      action: (
        <div className="flex items-center gap-1 text-yellow-500">
          <Zap className="h-4 w-4 fill-yellow-500" />
          <span className="text-sm font-semibold">Ready to battle!</span>
        </div>
      ),
      duration: 4000,
    });
  };

  const notifyRankUp = (newRank: number) => {
    addToast({
      title: "Rank Up! 🚀",
      description: `You've climbed to rank #${newRank}!`,
      variant: "success",
      action: (
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-semibold">Keep climbing!</span>
        </div>
      ),
      duration: 5000,
    });
  };

  const notifyRankDown = (newRank: number) => {
    addToast({
      title: "Rank Changed",
      description: `Your rank is now #${newRank}.`,
      variant: "warning",
      action: (
        <div className="flex items-center gap-1">
          <TrendingDown className="h-4 w-4" />
          <span className="text-sm font-semibold">Fight back!</span>
        </div>
      ),
      duration: 5000,
    });
  };

  const notifyTop20Entry = () => {
    addToast({
      title: "Top 20! 👑",
      description:
        "You've entered the Top 20! You're now visible to all players.",
      variant: "success",
      action: (
        <div className="flex items-center gap-1 text-yellow-500">
          <Trophy className="h-4 w-4 fill-yellow-500" />
          <span className="text-sm font-semibold">Elite status!</span>
        </div>
      ),
      duration: 7000,
    });
  };

  const notifyTop20Exit = () => {
    addToast({
      title: "Dropped from Top 20",
      description:
        "You've fallen out of the Top 20. Battle to reclaim your spot!",
      variant: "warning",
      duration: 6000,
    });
  };

  const notifyAttacked = (attackerName: string) => {
    addToast({
      title: "Under Attack! ⚔️",
      description: `${attackerName} is challenging you to battle!`,
      variant: "warning",
      action: (
        <div className="flex items-center gap-1">
          <Swords className="h-4 w-4" />
          <span className="text-sm font-semibold">View battle</span>
        </div>
      ),
      duration: 5000,
    });
  };

  const notifyTurnsFull = () => {
    addToast({
      title: "Turns Full! ⚡",
      description: "Your turns are at maximum. Time to battle!",
      variant: "default",
      duration: 4000,
    });
  };

  const notifyIdleWarning = (hoursIdle: number) => {
    addToast({
      title: "Idle Warning",
      description: `You've been idle for ${hoursIdle} hour(s). Your attributes will decay soon!`,
      variant: "warning",
      duration: 6000,
    });
  };

  return {
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
  };
}
