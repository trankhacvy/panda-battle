"use client";

import { useState } from "react";
import { Search, ArrowDownUp, Filter } from "lucide-react";
import { PlayerCard } from "@/components/leaderboard/player-card";
import { useSound } from "@/hooks/use-sound";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";

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
    play(SOUNDS.GAME_START);
    console.log("Battle with player:", playerName);
    // TODO: Navigate to battle screen
  };

  const handleFilter = () => {
    play(SOUNDS.BUTTON_CLICK);
    console.log("Filter players");
  };

  const handleSort = () => {
    play(SOUNDS.BUTTON_CLICK);
    console.log("Sort players");
  };

  return (
    <div className="flex-1 px-3 sm:px-4 py-2 space-y-2 sm:space-y-3 overflow-auto relative z-10 pb-24">
      <Card size="lg" className="w-full">
        <picture>
          <source srcSet="/images/pool-bg.avif" type="image/avif" />
          <source srcSet="/images/pool-bg.webp" type="image/webp" />
          <img
            src="/images/pool-bg.png"
            alt="Prize Pool"
            className="w-full h-auto object-cover"
          />
        </picture>
      </Card>

      {/* Search and Filters */}
      <div className="flex gap-2 py-2.5">
        <div className="flex-1 bg-[#0f2a4a]/80 border border-cyan-500/20 rounded-lg flex items-center px-2.5 sm:px-3 py-2 sm:py-2.5">
          <Search
            className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 mr-2"
            strokeWidth={2.5}
          />
          <input
            type="text"
            placeholder="Search Players..."
            className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <IconButton variant="secondary" size="sm" onClick={handleSort}>
          <ArrowDownUp className="text-white" strokeWidth={2.5} />
        </IconButton>

        <IconButton variant="secondary" size="sm" onClick={handleFilter}>
          <Filter className="text-white" strokeWidth={2.5} />
        </IconButton>
      </div>

      {/* Player List */}
      <div className="space-y-2 sm:space-y-4">
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
