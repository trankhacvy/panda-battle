"use client";

import { toast } from "sonner";

export function useGameNotifications() {
  const notifyBattleWin = (opponentName: string, attributeStolen: string) => {
    toast.success("Victory! 🎉", {
      description: `You defeated ${opponentName} and stole their ${attributeStolen}!`,
    });
  };

  const notifyBattleLoss = (attackerName: string, attributeLost: string) => {
    toast.error("Defeated", {
      description: `${attackerName} defeated you and stole your ${attributeLost}.`,
    });
  };

  const notifyTurnRegeneration = (turnsAdded: number) => {
    toast.info("Turns Regenerated", {
      description: `You received ${turnsAdded} new turns!`,
    });
  };

  const notifyRankUp = (newRank: number) => {
    toast.success("Rank Up! 🚀", {
      description: `You've climbed to rank #${newRank}!`,
    });
  };

  const notifyRankDown = (newRank: number) => {
    toast.warning("Rank Changed", {
      description: `Your rank is now #${newRank}.`,
    });
  };

  const notifyTop20Entry = () => {
    toast.success("Top 20! 👑", {
      description:
        "You've entered the Top 20! You're now visible to all players.",
    });
  };

  const notifyTop20Exit = () => {
    toast.warning("Dropped from Top 20", {
      description:
        "You've fallen out of the Top 20. Battle to reclaim your spot!",
    });
  };

  const notifyAttacked = (attackerName: string) => {
    toast.warning("Under Attack! ⚔️", {
      description: `${attackerName} is challenging you to battle!`,
    });
  };

  const notifyTurnsFull = () => {
    toast.info("Turns Full! ⚡", {
      description: "Your turns are at maximum. Time to battle!",
    });
  };

  const notifyIdleWarning = (hoursIdle: number) => {
    toast.warning("Idle Warning", {
      description: `You've been idle for ${hoursIdle} hour(s). Your attributes will decay soon!`,
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
