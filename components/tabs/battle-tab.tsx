"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OpponentCard } from "@/components/battle/opponent-card";
import { BattleConfirmationDialog } from "@/components/battle/battle-confirmation-dialog";
import {
  StanceSelector,
  BattleStance,
} from "@/components/battle/stance-selector";
import { mockOpponents, OpponentPanda } from "@/lib/mock/battles";
import { mockPlayerData } from "@/lib/mock/game";

type SortOption = "rank" | "power" | "risk";
type FilterOption = "all" | "top20" | "midtier" | "hidden";

/**
 * BattleTab - Opponent selection and battle initiation
 *
 * Task 8.1: Create opponent selection interface
 * - Design opponent list/carousel with cards
 * - Show opponent attributes and rank
 * - Display opponent visibility based on rank (Top 20, mid-tier, hidden)
 * - Add filter/sort options for opponents
 *
 * Task 8.2: Add battle initiation UI
 * - Create "Challenge" button for each opponent
 * - Show turn cost indicator
 * - Add confirmation dialog before battle
 * - Display warning if challenging Top 20 player
 *
 * Task 8.3: Implement stance selector
 * - Create stance selection UI (aggressive, defensive, balanced)
 * - Show stance effects on battle stats
 * - Add visual indicators for selected stance
 *
 * Requirements: 3.1, 3.2, 9.1, 9.2, 9.3, 9.4
 */
export function BattleTab() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("rank");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedOpponent, setSelectedOpponent] =
    useState<OpponentPanda | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStance, setSelectedStance] =
    useState<BattleStance>("balanced");

  const player = mockPlayerData;

  // Filter and sort opponents
  const filteredAndSortedOpponents = useMemo(() => {
    let filtered = [...mockOpponents];

    // Apply filter
    if (filterBy === "top20") {
      filtered = filtered.filter((o) => o.isInTop20);
    } else if (filterBy === "midtier") {
      filtered = filtered.filter((o) => o.visibility === "partial");
    } else if (filterBy === "hidden") {
      filtered = filtered.filter((o) => o.visibility === "hidden");
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === "rank") {
        return a.rank - b.rank;
      } else if (sortBy === "power") {
        return b.power - a.power;
      } else if (sortBy === "risk") {
        return b.risk - a.risk;
      }
      return 0;
    });

    return filtered;
  }, [sortBy, filterBy]);

  const handleChallenge = (opponent: OpponentPanda) => {
    setSelectedOpponent(opponent);
    setShowConfirmation(true);
  };

  const handleConfirmBattle = () => {
    if (selectedOpponent && player.turns >= 1) {
      // Navigate to battle animation screen
      router.push(`/battle?opponent=${selectedOpponent.id}`);
      setShowConfirmation(false);
      setSelectedOpponent(null);
    }
  };

  const handleStanceChange = (stance: BattleStance) => {
    setSelectedStance(stance);
  };

  const handleCancelBattle = () => {
    setShowConfirmation(false);
    setSelectedOpponent(null);
  };

  const top20Count = mockOpponents.filter((o) => o.isInTop20).length;
  const midTierCount = mockOpponents.filter(
    (o) => o.visibility === "partial"
  ).length;
  const hiddenCount = mockOpponents.filter(
    (o) => o.visibility === "hidden"
  ).length;

  return (
    <>
      {/* Battle Confirmation Dialog */}
      {showConfirmation && (
        <BattleConfirmationDialog
          opponent={selectedOpponent}
          playerTurns={player.turns}
          onConfirm={handleConfirmBattle}
          onCancel={handleCancelBattle}
        />
      )}

      <div className="space-y-3 sm:space-y-4 pb-4">
        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Battle Arena
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Choose your opponent wisely
          </p>
        </div>

        {/* Player turns indicator */}
        <Card variant="game">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🎯</span>
                <div>
                  <div className="text-xs sm:text-sm font-semibold">
                    Available Turns
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Each battle costs 1 turn
                  </div>
                </div>
              </div>
              <Badge
                variant="turns"
                className="text-lg sm:text-2xl px-3 sm:px-4 py-1.5 sm:py-2"
              >
                {player.turns} / {player.maxTurns}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stance Selector */}
        <StanceSelector
          selectedStance={selectedStance}
          onStanceChange={handleStanceChange}
        />

        {/* Filter and Sort Controls */}
        <Card variant="game">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">
              Filter & Sort
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3">
            {/* Filter buttons */}
            <div>
              <div className="text-xs text-muted-foreground mb-1.5 sm:mb-2">
                Filter by visibility:
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={filterBy === "all" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("all")}
                  className="text-xs"
                >
                  All ({mockOpponents.length})
                </Button>
                <Button
                  variant={filterBy === "top20" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("top20")}
                  className="text-xs"
                >
                  Top 20 ({top20Count})
                </Button>
                <Button
                  variant={filterBy === "midtier" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("midtier")}
                  className="text-xs"
                >
                  Mid-Tier ({midTierCount})
                </Button>
                <Button
                  variant={filterBy === "hidden" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setFilterBy("hidden")}
                  className="text-xs"
                >
                  Hidden ({hiddenCount})
                </Button>
              </div>
            </div>

            {/* Sort buttons */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Sort by:</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === "rank" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("rank")}
                >
                  Rank
                </Button>
                <Button
                  variant={sortBy === "power" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("power")}
                >
                  Power
                </Button>
                <Button
                  variant={sortBy === "risk" ? "game" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("risk")}
                >
                  Risk
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility Legend */}
        <Card variant="game" className="bg-muted/30">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="font-semibold mb-2">Visibility Rules:</div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Top 20
                </Badge>
                <span className="text-muted-foreground">
                  Full details visible
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Mid-Tier
                </Badge>
                <span className="text-muted-foreground">
                  Partial details visible
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Hidden
                </Badge>
                <span className="text-muted-foreground">
                  Minimal details visible
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opponents List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Available Opponents ({filteredAndSortedOpponents.length})
            </h2>
          </div>

          {filteredAndSortedOpponents.length === 0 ? (
            <Card variant="game">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-muted-foreground">
                  No opponents match your filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedOpponents.map((opponent) => (
                <OpponentCard
                  key={opponent.id}
                  opponent={opponent}
                  onChallenge={handleChallenge}
                  playerTurns={player.turns}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
