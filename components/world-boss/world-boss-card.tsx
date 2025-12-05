"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorldBoss } from "./world-boss-list";
import { useRouter } from "next/navigation";
import { useSound } from "@/hooks/use-sound";
import { 
  Clock, 
  Users, 
  Trophy, 
  Sword,
  Crown,
  Sparkles
} from "lucide-react";

interface WorldBossCardProps {
  boss: WorldBoss;
}

const tierVariants = {
  LEGENDARY: "warning" as const,
  EPIC: "pink" as const,
  RARE: "info" as const,
};

export function WorldBossCard({ boss }: WorldBossCardProps) {
  const router = useRouter();
  const { play, SOUNDS } = useSound();
  const hpPercentage = (boss.hp / boss.maxHp) * 100;
  const tierVariant = tierVariants[boss.tier];

  const handleBattleClick = () => {
    play(SOUNDS.BUTTON_CLICK);
    router.push(`/battle?worldBoss=${boss.id}`);
  };

  return (
    <Card size="md" className="relative overflow-hidden w-full">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-center">
          <Badge variant={tierVariant} size="sm">
            <Crown className="w-3 h-3 mr-1" />
            {boss.tier}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white ">
            <img
              src={boss.image}
              alt={boss.name}
              className="w-full h-full object-cover"
            />
            {boss.tier === "LEGENDARY" && (
              <Sparkles className="absolute top-0 right-0 w-3 h-3 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base leading-tight">
              {boss.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Level {boss.level}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Card size="sm" className="w-[40%] h-24">
            <CardContent className="p-0 relative w-full h-full">
              <img
                src={boss.image}
                alt={boss.name}
                className="w-full h-full object-cover"
              />
            </CardContent>
          </Card>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1 p-1 ">
              <img src="/images/gold-icon.png" alt="Gold" className="w-5 h-5" />
              <span className="font-bold text-xs">+{boss.reward.gold}</span>
            </div>
            <div className="flex items-center gap-1 p-1 ">
              <img src="/images/battle-icon.png" alt="Cards" className="w-5 h-5" />
              <span className="font-bold text-xs">+{boss.reward.cards} Cards</span>
            </div>
            {boss.reward.mount ? (
              <div className="flex items-center gap-1 p-1 ">
                <Crown className="w-5 h-5" />
                <span className="font-bold text-xs line-clamp-1">{boss.reward.mount}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded">
                <Users className="w-5 h-5" />
                <span className="font-bold text-xs">{boss.participants.toLocaleString()} fighters</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{boss.timeRemaining}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Users className="w-3 h-3" />
            <span>{boss.participants.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">Boss HP</span>
            <span className="font-bold">
              {hpPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={hpPercentage} className="h-3" />
        </div>

        <Button
          onClick={handleBattleClick}
          variant={tierVariant}
          size="md"
          className="w-full"
        >
          <Sword className="w-4 h-4 mr-2" />
          CHALLENGE BOSS
        </Button>
      </CardContent>
    </Card>
  );
}
