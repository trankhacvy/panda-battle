"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface TurnRegenerationAnimationProps {
  turns: number;
  maxTurns: number;
  className?: string;
}

export function TurnRegenerationAnimation({
  turns,
  maxTurns,
  className,
}: TurnRegenerationAnimationProps) {
  const [showRegen, setShowRegen] = useState(false);
  const [previousTurns, setPreviousTurns] = useState(turns);

  useEffect(() => {
    if (turns > previousTurns) {
      setShowRegen(true);
      const timer = setTimeout(() => {
        setShowRegen(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
    setPreviousTurns(turns);
  }, [turns, previousTurns]);

  const isFull = turns >= maxTurns;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border-2 p-3 transition-all duration-300",
          isFull
            ? "border-yellow-500 bg-yellow-500/10 animate-pulse-slow"
            : "border-border bg-card"
        )}
      >
        <Zap
          className={cn(
            "h-5 w-5 transition-colors duration-300",
            isFull ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
          )}
        />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Turns</div>
          <div className="text-lg font-bold">
            {turns} / {maxTurns}
          </div>
        </div>
      </div>

      {showRegen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-in zoom-in fade-in duration-500">
            <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-glow" />
          </div>
        </div>
      )}
    </div>
  );
}
