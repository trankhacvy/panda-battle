"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OpponentPanda } from "@/lib/mock/battles";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

interface BattleStealSelectionProps {
  winner: OpponentPanda;
  loser: OpponentPanda;
  onStealComplete: (attributeType: string, amount: number) => void;
  onSkip: () => void;
}

type AttributeType = "strength" | "speed" | "endurance" | "luck";

interface AttributeOption {
  type: AttributeType;
  icon: string;
  label: string;
  currentValue: number;
  stealPercentage: number;
  stealAmount: number;
  newWinnerValue: number;
  newLoserValue: number;
  variant: "strength" | "speed" | "endurance" | "luck";
}

/**
 * BattleStealSelection - Attribute steal selection UI
 *
 * Task 9.3: Create attribute steal selection
 * - Show steal selection UI after battle win
 * - Display loser's attributes with steal percentages
 * - Allow winner to select attribute to steal
 * - Show before/after attribute comparison
 *
 * Requirements: 4.1, 4.2
 */
export function BattleStealSelection({
  winner,
  loser,
  onStealComplete,
  onSkip,
}: BattleStealSelectionProps) {
  const [selectedAttribute, setSelectedAttribute] =
    useState<AttributeType | null>(null);
  const { playUpHouse, playPropertyBuy, playButtonClick } = useSound();

  const handleSelectAttribute = (type: AttributeType) => {
    playButtonClick();
    setSelectedAttribute(type);
  };

  // Calculate steal amounts (10-20% of loser's attribute) - Requirement 4.2
  const calculateStealAmount = (value: number): number => {
    const percentage = 0.1 + Math.random() * 0.1; // 10-20%
    return Math.floor(value * percentage);
  };

  // Generate attribute options
  const attributeOptions: AttributeOption[] = [
    {
      type: "strength",
      icon: "💪",
      label: "Strength",
      currentValue: loser.attributes.strength,
      stealPercentage: Math.floor(
        (calculateStealAmount(loser.attributes.strength) /
          loser.attributes.strength) *
          100
      ),
      stealAmount: calculateStealAmount(loser.attributes.strength),
      newWinnerValue:
        winner.attributes.strength +
        calculateStealAmount(loser.attributes.strength),
      newLoserValue:
        loser.attributes.strength -
        calculateStealAmount(loser.attributes.strength),
      variant: "strength",
    },
    {
      type: "speed",
      icon: "⚡",
      label: "Speed",
      currentValue: loser.attributes.speed,
      stealPercentage: Math.floor(
        (calculateStealAmount(loser.attributes.speed) /
          loser.attributes.speed) *
          100
      ),
      stealAmount: calculateStealAmount(loser.attributes.speed),
      newWinnerValue:
        winner.attributes.speed + calculateStealAmount(loser.attributes.speed),
      newLoserValue:
        loser.attributes.speed - calculateStealAmount(loser.attributes.speed),
      variant: "speed",
    },
    {
      type: "endurance",
      icon: "🛡️",
      label: "Endurance",
      currentValue: loser.attributes.endurance,
      stealPercentage: Math.floor(
        (calculateStealAmount(loser.attributes.endurance) /
          loser.attributes.endurance) *
          100
      ),
      stealAmount: calculateStealAmount(loser.attributes.endurance),
      newWinnerValue:
        winner.attributes.endurance +
        calculateStealAmount(loser.attributes.endurance),
      newLoserValue:
        loser.attributes.endurance -
        calculateStealAmount(loser.attributes.endurance),
      variant: "endurance",
    },
    {
      type: "luck",
      icon: "🍀",
      label: "Luck",
      currentValue: loser.attributes.luck,
      stealPercentage: Math.floor(
        (calculateStealAmount(loser.attributes.luck) / loser.attributes.luck) *
          100
      ),
      stealAmount: calculateStealAmount(loser.attributes.luck),
      newWinnerValue:
        winner.attributes.luck + calculateStealAmount(loser.attributes.luck),
      newLoserValue:
        loser.attributes.luck - calculateStealAmount(loser.attributes.luck),
      variant: "luck",
    },
  ];

  const handleConfirmSteal = () => {
    if (selectedAttribute) {
      const option = attributeOptions.find((o) => o.type === selectedAttribute);
      if (option) {
        playUpHouse();
        onStealComplete(selectedAttribute, option.stealAmount);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🏆</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
            Victory Spoils!
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose an attribute to steal from {loser.name}
          </p>
        </div>

        {/* Attribute Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributeOptions.map((option) => (
            <Card
              key={option.type}
              variant={selectedAttribute === option.type ? "highlight" : "game"}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-105",
                selectedAttribute === option.type &&
                  "ring-2 ring-yellow-500 shadow-2xl"
              )}
              onClick={() => handleSelectAttribute(option.type)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{option.icon}</span>
                    <span>{option.label}</span>
                  </span>
                  <Badge variant="default" className="text-sm">
                    {option.stealPercentage}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Value */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current ({loser.name})</span>
                    <span>{option.currentValue}</span>
                  </div>
                  <Progress
                    value={(option.currentValue / 40) * 100}
                    variant={option.variant}
                    className="h-2"
                  />
                </div>

                {/* Steal Amount */}
                <div className="flex items-center justify-center gap-2 py-2 bg-muted/50 rounded-lg">
                  <span className="text-2xl">⬇️</span>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      Steal Amount
                    </div>
                    <div className="text-xl font-bold text-yellow-500">
                      +{option.stealAmount}
                    </div>
                  </div>
                </div>

                {/* Before/After Comparison */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  {/* Winner's New Value */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-500 font-semibold">
                        Your New Value
                      </span>
                      <span className="text-emerald-500 font-bold">
                        {winner.attributes[option.type]} →{" "}
                        {option.newWinnerValue}
                      </span>
                    </div>
                    <Progress
                      value={(option.newWinnerValue / 40) * 100}
                      variant={option.variant}
                      className="h-2"
                    />
                  </div>

                  {/* Loser's New Value */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-500 font-semibold">
                        Opponent's New Value
                      </span>
                      <span className="text-red-500 font-bold">
                        {option.currentValue} → {option.newLoserValue}
                      </span>
                    </div>
                    <Progress
                      value={(option.newLoserValue / 40) * 100}
                      variant={option.variant}
                      className="h-2 opacity-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onSkip}
          >
            Skip Steal
          </Button>
          <Button
            variant="game"
            size="lg"
            className="flex-1"
            onClick={handleConfirmSteal}
            disabled={!selectedAttribute}
            disableSound
          >
            <span className="text-xl mr-2">✨</span>
            {selectedAttribute
              ? `Steal ${selectedAttribute}`
              : "Select Attribute"}
          </Button>
        </div>

        {/* Info */}
        <Card variant="game" className="bg-muted/30">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">Steal Mechanics:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  You can steal 10-20% of one attribute from your opponent
                </li>
                <li>
                  The stolen amount is added to your corresponding attribute
                </li>
                <li>
                  Choose wisely - this decision affects your future battles!
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
