"use client";

import { useState } from "react";
import { Search, ArrowDownUp, Filter } from "lucide-react";
import { PlayerCard } from "@/components/leaderboard/player-card";
import { useSound } from "@/hooks/use-sound";
import { Button3D } from "@/components/ui/button-3d";

const players = [
  {
    rank: 1,
    name: "Grand Master",
    points: 10500,
    bgColor: "bg-cyan-600",
    borderColor: "ring-yellow-400 ring-2 shadow-[0_0_20px_rgba(234,179,8,0.5)]",
  },
  {
    rank: 2,
    name: "Dragon Warrior",
    points: 9800,
    bgColor: "bg-gray-700",
    borderColor: "ring-gray-400 ring-1",
  },
  {
    rank: 3,
    name: "Bamboo Fury",
    points: 7500,
    bgColor: "bg-teal-700",
    borderColor: "ring-amber-600 ring-1",
  },
  {
    rank: 4,
    name: "Bamboo Paw",
    points: 6600,
    bgColor: "bg-teal-700",
    borderColor: "ring-amber-700 ring-1",
  },
  {
    rank: 5,
    name: "Shadow Claw",
    points: 5200,
    bgColor: "bg-gray-500",
    borderColor: "ring-amber-700 ring-1",
  },
];

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { play, SOUNDS } = useSound();

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBattle = (playerName: string) => {
    play(SOUNDS.GAME_START);
    console.log("Battle with player:", playerName);
    // TODO: Navigate to battle screen
  };

  const handleSort = () => {
    play(SOUNDS.BUTTON_CLICK);
    console.log("Sort players");
  };

  const handleFilter = () => {
    play(SOUNDS.BUTTON_CLICK);
    console.log("Filter players");
  };

  return (
    <div className="flex-1 px-4 py-2 space-y-3 overflow-auto relative z-10 pb-24">
      {/* Prize Pool Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src="/images/attributes/pool-bg.png"
          alt="Prize Pool"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="flex-1 bg-[#0f2a4a]/80 border border-cyan-500/20 rounded-lg flex items-center px-3 py-2.5">
          <Search className="w-5 h-5 text-white/50 mr-2" />
          <input
            type="text"
            placeholder="Search Players..."
            className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button3D className="size-10" size="3d-tiny" onClick={handleSort}>
          <ArrowDownUp />
        </Button3D>

        <Button3D className="size-10" size="3d-tiny" onClick={handleFilter}>
          <Filter />
        </Button3D>

        {/* <button
          onClick={handleSort}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2.5 flex flex-col items-center justify-center min-w-[60px] transition-colors"
        >
          <ArrowDownUp className="w-5 h-5 text-white mb-0.5" />
          <span className="text-white text-xs font-medium">Sort</span>
        </button> */}
        {/* <button
          onClick={handleFilter}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2.5 flex flex-col items-center justify-center min-w-[60px] transition-colors"
        >
          <Filter className="w-5 h-5 text-white mb-0.5" />
          <span className="text-white text-xs font-medium">Filter</span>
        </button> */}
      </div>

      {/* Player List */}
      <div className="space-y-3">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.rank}
            rank={player.rank}
            name={player.name}
            points={player.points}
            bgColor={player.bgColor}
            borderColor={player.borderColor}
            onBattle={() => handleBattle(player.name)}
          />
        ))}
      </div>
    </div>
  );
}
