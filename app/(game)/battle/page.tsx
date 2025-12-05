"use client";

import { ArrowDownUp, Filter } from "lucide-react";
import { mockOpponents } from "@/lib/mock/battles";
import { OpponentCard } from "@/components/battle/opponent-card";
import { useSound } from "@/hooks/use-sound";
import { useRouter } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";

export default function BattlePage() {
  const router = useRouter();
  const displayOpponents = mockOpponents.slice(0, 5);
  const { play, SOUNDS } = useSound();

  const handleBattle = (opponentId: string) => {
    play(SOUNDS.GAME_START);
    play(SOUNDS.GAME_START);
    console.log("Battle with opponent:", opponentId);
    // TODO: Navigate to battle screen or start battle
    router.push("/battle-screen");
  };

  const handleSort = () => {
    play(SOUNDS.BUTTON_CLICK);
    console.log("Sort opponents");
  };

  const handleFilter = () => {
    play(SOUNDS.BUTTON_CLICK);
    console.log("Filter opponents");
  };

  return (
    <div className="flex-1 px-4 pb-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-bold text-base sm:text-xl">
          Battle Opponent List
        </h1>
        <div className="flex gap-2">
          <IconButton variant="secondary" size="sm" onClick={handleSort}>
            <ArrowDownUp className="text-white" />
          </IconButton>
          <IconButton variant="secondary" size="sm" onClick={handleFilter}>
            <Filter className="text-white" />
          </IconButton>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {displayOpponents.map((opponent, index) => (
          <OpponentCard
            key={opponent.id}
            opponent={opponent}
            onBattle={() => handleBattle(opponent.id)}
          />
        ))}
      </div>
    </div>
  );
}
