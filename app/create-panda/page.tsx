"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  rollRandomStats,
  calculateRarity,
  getRarityColor,
} from "@/lib/mock/pandas";
import { Sparkles, RefreshCw, Coins } from "lucide-react";

const ENTRY_FEE = 0.1; // SOL

export default function CreatePandaPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState(() => rollRandomStats());
  const [isRolling, setIsRolling] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const rarity = calculateRarity(attributes);
  const rarityColor = getRarityColor(rarity);
  const totalPower =
    attributes.strength +
    attributes.speed +
    attributes.endurance +
    attributes.luck;

  const handleReroll = () => {
    setIsRolling(true);
    // Simulate rolling animation
    setTimeout(() => {
      setAttributes(rollRandomStats());
      setIsRolling(false);
    }, 500);
  };

  const handleMint = async () => {
    setIsMinting(true);
    // Simulate minting transaction
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Store panda data in localStorage for mock
    localStorage.setItem(
      "playerPanda",
      JSON.stringify({
        attributes,
        rarity,
        mintedAt: new Date().toISOString(),
      })
    );

    // Navigate to game screen with tabs
    router.push("/game");
  };

  return (
    <div className="container max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent px-2">
            Create Your Panda
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Roll your panda&apos;s attributes and enter the battle arena
          </p>
        </div>

        {/* Panda Visual Representation */}
        <Card variant="game" className="overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              {/* Panda Avatar Placeholder */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-linear-to-br from-emerald-500/20 to-cyan-500/20 border-4 border-emerald-500/30 flex items-center justify-center overflow-hidden">
                <div className="text-6xl sm:text-7xl md:text-8xl animate-bounce">
                  🐼
                </div>
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                  <Badge
                    variant="rank"
                    className="text-xs"
                    style={{
                      backgroundColor: rarityColor,
                      borderColor: rarityColor,
                    }}
                  >
                    {rarity.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Total Power */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                  Total Power
                </p>
                <p className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  {totalPower}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attributes Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            label="Strength"
            value={attributes.strength}
            maxValue={40}
            variant="strength"
            icon="💪"
            className={isRolling ? "animate-pulse" : ""}
          />
          <StatCard
            label="Speed"
            value={attributes.speed}
            maxValue={40}
            variant="speed"
            icon="⚡"
            className={isRolling ? "animate-pulse" : ""}
          />
          <StatCard
            label="Endurance"
            value={attributes.endurance}
            maxValue={40}
            variant="endurance"
            icon="🛡️"
            className={isRolling ? "animate-pulse" : ""}
          />
          <StatCard
            label="Luck"
            value={attributes.luck}
            maxValue={40}
            variant="luck"
            icon="🍀"
            className={isRolling ? "animate-pulse" : ""}
          />
        </div>

        {/* Entry Fee Information */}
        <Card variant="highlight">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              Entry Fee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cost:</span>
              <span className="text-xl font-bold">{ENTRY_FEE} SOL</span>
            </div>
            <div className="text-xs text-muted-foreground">
              • 100% goes to prize pool
              <br />
              • Early entry bonus: +2 starting turns
              <br />• Attributes range: 15-40 per stat
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            variant="game-secondary"
            size="lg"
            onClick={handleReroll}
            disabled={isRolling || isMinting}
            className="flex-1 text-sm sm:text-base"
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isRolling ? "animate-spin" : ""
              }`}
            />
            Reroll Attributes
          </Button>
          <Button
            variant="game"
            size="lg"
            onClick={handleMint}
            disabled={isRolling || isMinting}
            className="flex-1 text-sm sm:text-base"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            {isMinting ? "Minting..." : "Mint Panda"}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-center text-xs text-muted-foreground px-2">
          You can reroll as many times as you want before minting
        </p>
      </div>
    </div>
  );
}
