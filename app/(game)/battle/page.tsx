"use client";

import { ArrowDownUp, Filter } from "lucide-react";
import { mockOpponents } from "@/lib/mock/battles";
import { OpponentCard } from "@/components/battle/opponent-card";
import { useSound } from "@/hooks/use-sound";
import { Button3D } from "@/components/ui/button-3d";
import { useRouter } from "next/navigation";
import { RoundButton } from "@/components/ui/round-button";

const bgColors = [
  "bg-red-900/60",
  "bg-green-900/60",
  "bg-purple-900/60",
  "bg-slate-700/60",
  "bg-teal-900/60",
];

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
          <RoundButton variant="green" size="sm" onClick={handleSort}>
            <ArrowDownUp className="text-white" />
          </RoundButton>
          <RoundButton variant="green" size="sm" onClick={handleFilter}>
            <Filter className="text-white" />
          </RoundButton>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {displayOpponents.map((opponent, index) => (
          <OpponentCard
            key={opponent.id}
            opponent={opponent}
            bgColor={bgColors[index % bgColors.length]}
            onBattle={() => handleBattle(opponent.id)}
          />
        ))}
      </div>
    </div>
  );
}
