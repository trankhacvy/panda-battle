"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Skull, Swords } from "lucide-react";
import { WorldBossCard } from "./world-boss-card";

export interface WorldBoss {
  id: string;
  name: string;
  tier: "LEGENDARY" | "EPIC" | "RARE";
  image: string;
  hp: number;
  maxHp: number;
  level: number;
  reward: {
    gold: number;
    cards: number;
    mount?: string;
  };
  description: string;
  participants: number;
  timeRemaining: string;
}

// Mock data for world bosses
const worldBosses: WorldBoss[] = [
  {
    id: "1",
    name: "Grizzlemaw, the Ferocious",
    tier: "LEGENDARY",
    image: "/images/fighter-frame.png",
    hp: 450000,
    maxHp: 500000,
    level: 50,
    reward: {
      gold: 1000,
      cards: 5,
      mount: "Grizzlemaw Mount",
    },
    description: "A legendary bear boss that terrorizes the northern wilderness",
    participants: 1247,
    timeRemaining: "23h 45m",
  },
  {
    id: "2",
    name: "Arachnix, the Sanguine",
    tier: "EPIC",
    image: "/images/fighter-frame.png",
    hp: 280000,
    maxHp: 350000,
    level: 40,
    reward: {
      gold: 500,
      cards: 3,
      mount: "Arachnix Mount",
    },
    description: "A venomous spider queen from the depths of the dark forest",
    participants: 892,
    timeRemaining: "15h 20m",
  },
  {
    id: "3",
    name: "Frostclaw, the Eternal",
    tier: "LEGENDARY",
    image: "/images/fighter-frame.png",
    hp: 520000,
    maxHp: 600000,
    level: 60,
    reward: {
      gold: 1500,
      cards: 7,
      mount: "Frostclaw Mount",
    },
    description: "Ancient ice dragon that guards the frozen peaks",
    participants: 2156,
    timeRemaining: "47h 12m",
  },
  {
    id: "4",
    name: "Shadowmane, the Cursed",
    tier: "EPIC",
    image: "/images/fighter-frame.png",
    hp: 310000,
    maxHp: 400000,
    level: 45,
    reward: {
      gold: 750,
      cards: 4,
      mount: "Shadowmane Mount",
    },
    description: "A corrupted lion king cursed by dark magic",
    participants: 1034,
    timeRemaining: "31h 58m",
  },
  {
    id: "5",
    name: "Thunderhoof, the Storm Bringer",
    tier: "RARE",
    image: "/images/fighter-frame.png",
    hp: 180000,
    maxHp: 250000,
    level: 35,
    reward: {
      gold: 300,
      cards: 2,
    },
    description: "A massive buffalo charged with lightning energy",
    participants: 645,
    timeRemaining: "12h 35m",
  },
];

export function WorldBossList() {
  const [selectedTier, setSelectedTier] = useState<"ALL" | "LEGENDARY" | "EPIC" | "RARE">("ALL");

  const filteredBosses = worldBosses.filter(
    (boss) => selectedTier === "ALL" || boss.tier === selectedTier
  );

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center space-y-2 py-3">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold pixel-font text-white" style={{
            textShadow: '0 4px 0 rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)'
          }}>
            WORLD BOSSES
          </h1>
        </div>
        <p className="text-sm text-white">
          Challenge powerful bosses and earn legendary rewards!
        </p>
      </div>

      {/* Stats Overview */}
      <Card size="md" className="w-full">
        <CardContent className="p-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">Active Bosses</p>
              </div>
              <p className="text-2xl font-bold">{worldBosses.length}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">Total Battles</p>
              </div>
              <p className="text-2xl font-bold">
                {worldBosses.reduce((sum, boss) => sum + boss.participants, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <p className="text-xs text-muted-foreground">Your Rank</p>
              </div>
              <p className="text-2xl font-bold">#42</p>
            </div>
          </div>
        </CardContent>
      </Card>

        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
        {(["ALL", "LEGENDARY", "EPIC", "RARE"] as const).map((tier) => (
          <Button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            variant={selectedTier === tier ? "primary" : "secondary"}
            size="sm"
            className="whitespace-nowrap"
          >
            {tier}
          </Button>
        ))}
      </div>

      {/* Boss List */}
      <div className="space-y-4">
        {filteredBosses.map((boss) => (
          <WorldBossCard key={boss.id} boss={boss} />
        ))}
      </div>

      {filteredBosses.length === 0 && (
        <div className="text-center py-12">
          <Skull className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bosses available in this tier</p>
        </div>
      )}
    </div>
  );
}
