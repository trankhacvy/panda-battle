"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, TrendingDown, Crown } from "lucide-react";

interface RankChangeCelebrationProps {
  currentRank: number;
  previousRank?: number;
  isTop20?: boolean;
  className?: string;
}

export function RankChangeCelebration({
  currentRank,
  previousRank,
  isTop20 = false,
  className,
}: RankChangeCelebrationProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [rankChange, setRankChange] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (previousRank !== undefined && previousRank !== currentRank) {
      // Lower rank number = better position
      const improved = currentRank < previousRank;
      setRankChange(improved ? "up" : "down");
      setShowCelebration(true);

      const timer = setTimeout(() => {
        setShowCelebration(false);
        setRankChange(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentRank, previousRank]);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border-2 p-4 transition-all duration-300",
          isTop20
            ? "border-yellow-500 bg-linear-to-r from-yellow-500/10 to-orange-500/10"
            : "border-border bg-card"
        )}
      >
        {isTop20 ? (
          <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        ) : (
          <Trophy className="h-6 w-6 text-muted-foreground" />
        )}
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Your Rank</div>
          <div className="text-2xl font-bold">#{currentRank}</div>
        </div>
        {isTop20 && (
          <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
            TOP 20
          </div>
        )}
      </div>

      {showCelebration && rankChange === "up" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-linear-to-r from-green-500/20 to-emerald-500/20 animate-in fade-in duration-500" />
          <div className="relative z-10 flex flex-col items-center gap-2 animate-in zoom-in fade-in duration-700">
            <TrendingUp className="h-12 w-12 text-green-500 animate-bounce" />
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              Rank Up!
            </div>
          </div>
          {/* Confetti effect */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-yellow-500 animate-in fade-in zoom-in duration-1000"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 500}ms`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {showCelebration && rankChange === "down" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-linear-to-r from-red-500/10 to-orange-500/10 animate-in fade-in duration-500" />
          <div className="relative z-10 flex flex-col items-center gap-2 animate-in zoom-in fade-in duration-700">
            <TrendingDown className="h-12 w-12 text-red-500" />
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              Rank Down
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
