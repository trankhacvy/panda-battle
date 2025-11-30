"use client";

import { ArrowDownUp, Filter } from "lucide-react";
import { mockOpponents } from "@/lib/mock/battles";
import { OpponentCard } from "@/components/battle/opponent-card";

const bgColors = [
  "bg-red-900/60",
  "bg-green-900/60",
  "bg-purple-900/60",
  "bg-slate-700/60",
  "bg-teal-900/60",
];

export default function BattlePage() {
  const displayOpponents = mockOpponents.slice(0, 5);

  const handleBattle = (opponentId: string) => {
    console.log("Battle with opponent:", opponentId);
    // TODO: Navigate to battle screen or start battle
  };

  return (
    <div className="flex-1 px-4 pb-6 relative z-10">
      {/* Title and filters */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-white font-bold text-xl">Battle Opponent List</h1>
        <div className="flex gap-2">
          <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg p-2 flex flex-col items-center transition-colors">
            <ArrowDownUp className="w-5 h-5" />
            <span className="text-xs sr-only">Sort</span>
          </button>
          <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg p-2 flex flex-col items-center transition-colors">
            <Filter className="w-5 h-5" />
            <span className="text-xs sr-only">Filter</span>
          </button>
        </div>
      </div>

      {/* Opponent List */}
      <div className="space-y-3">
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
