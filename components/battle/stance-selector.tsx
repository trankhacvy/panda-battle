"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type BattleStance = "aggressive" | "defensive" | "balanced";

interface StanceOption {
  id: BattleStance;
  name: string;
  icon: string;
  description: string;
  effects: {
    strength: string;
    speed: string;
    endurance: string;
  };
}

const stanceOptions: StanceOption[] = [
  {
    id: "aggressive",
    name: "Aggressive",
    icon: "⚔️",
    description: "High risk, high reward. Maximize damage output.",
    effects: {
      strength: "+20%",
      speed: "+10%",
      endurance: "-15%",
    },
  },
  {
    id: "defensive",
    name: "Defensive",
    icon: "🛡️",
    description: "Minimize damage taken. Focus on survival.",
    effects: {
      strength: "-10%",
      speed: "-5%",
      endurance: "+25%",
    },
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: "⚖️",
    description: "Well-rounded approach. No major bonuses or penalties.",
    effects: {
      strength: "+5%",
      speed: "+5%",
      endurance: "+5%",
    },
  },
];

interface StanceSelectorProps {
  selectedStance: BattleStance;
  onStanceChange: (stance: BattleStance) => void;
}

/**
 * StanceSelector - Battle stance selection UI
 *
 * Task 8.3: Implement stance selector
 * - Create stance selection UI (aggressive, defensive, balanced)
 * - Show stance effects on battle stats
 * - Add visual indicators for selected stance
 *
 * Requirement: 3.2
 */
export function StanceSelector({
  selectedStance,
  onStanceChange,
}: StanceSelectorProps) {
  return (
    <Card variant="game">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Battle Stance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Choose your battle strategy. Each stance affects your combat
          attributes differently.
        </p>

        <div className="space-y-2">
          {stanceOptions.map((stance) => {
            const isSelected = selectedStance === stance.id;

            return (
              <button
                key={stance.id}
                onClick={() => onStanceChange(stance.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-border hover:border-indigo-500/50 bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-2xl">{stance.icon}</div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">{stance.name}</h4>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Selected ✓
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {stance.description}
                    </p>

                    {/* Effects */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="text-xs">
                        <div className="text-muted-foreground">💪 STR</div>
                        <div
                          className={`font-bold ${
                            stance.effects.strength.startsWith("+")
                              ? "text-emerald-500"
                              : stance.effects.strength.startsWith("-")
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {stance.effects.strength}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-muted-foreground">⚡ SPD</div>
                        <div
                          className={`font-bold ${
                            stance.effects.speed.startsWith("+")
                              ? "text-emerald-500"
                              : stance.effects.speed.startsWith("-")
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {stance.effects.speed}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-muted-foreground">🛡️ END</div>
                        <div
                          className={`font-bold ${
                            stance.effects.endurance.startsWith("+")
                              ? "text-emerald-500"
                              : stance.effects.endurance.startsWith("-")
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {stance.effects.endurance}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current selection summary */}
        <div className="pt-2 border-t">
          <div className="text-xs text-center text-muted-foreground">
            Current stance:{" "}
            <span className="font-bold text-foreground">
              {stanceOptions.find((s) => s.id === selectedStance)?.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
