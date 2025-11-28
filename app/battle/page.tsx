"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BattleArena } from "@/components/battle/battle-arena";
import { mockOpponents, OpponentPanda } from "@/lib/mock/battles";
import { mockPlayerData } from "@/lib/mock/game";

/**
 * BattlePage - Battle animation and resolution screen
 *
 * This page handles the complete battle flow:
 * - Battle arena display with both pandas
 * - Battle animation sequence
 * - Attribute steal selection
 * - Battle results display
 *
 * Requirements: 3.2, 3.3, 3.5, 4.1, 4.2, 4.4
 */
export default function BattlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const opponentId = searchParams.get("opponent");

  const [opponent, setOpponent] = useState<OpponentPanda | null>(null);

  useEffect(() => {
    if (opponentId) {
      const foundOpponent = mockOpponents.find((o) => o.id === opponentId);
      if (foundOpponent) {
        setOpponent(foundOpponent);
      } else {
        // Invalid opponent, redirect back to game
        router.push("/game");
      }
    } else {
      // No opponent specified, redirect back to game
      router.push("/game");
    }
  }, [opponentId, router]);

  const handleBattleComplete = () => {
    // Navigate back to game after battle completes
    router.push("/game");
  };

  if (!opponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <p className="text-muted-foreground">Loading battle...</p>
        </div>
      </div>
    );
  }

  return (
    <BattleArena
      playerPanda={{
        id: mockPlayerData.id,
        name: mockPlayerData.pandaName,
        attributes: mockPlayerData.attributes,
        type: "bamboo",
        rank: mockPlayerData.rank,
        visibility: "full",
        power: Object.values(mockPlayerData.attributes).reduce(
          (a, b) => a + b,
          0
        ),
        risk: 5,
        favoriteStance: "balanced",
        baseHP: 120,
        colorPalette: {
          primary: "#000000",
          secondary: "#333333",
          accent: "#4CAF50",
        },
        isInTop20: mockPlayerData.rank <= 20,
        wins: mockPlayerData.wins,
        losses: mockPlayerData.losses,
        winRate:
          (mockPlayerData.wins /
            (mockPlayerData.wins + mockPlayerData.losses)) *
          100,
      }}
      opponentPanda={opponent}
      onBattleComplete={handleBattleComplete}
    />
  );
}
