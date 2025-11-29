"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockOpponents, OpponentPanda } from "@/lib/mock/battles";
import { mockPlayerData } from "@/lib/mock/game";

type SortOption = "rank" | "power";
type FilterOption = "all" | "top20" | "others";

export default function BattlePage() {
  const [sortBy, setSortBy] = useState<SortOption>("rank");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const player = mockPlayerData;

  const filteredAndSortedOpponents = useMemo(() => {
    let filtered = [...mockOpponents];

    if (filterBy === "top20") {
      filtered = filtered.filter((o) => o.isInTop20);
    } else if (filterBy === "others") {
      filtered = filtered.filter((o) => !o.isInTop20);
    }

    filtered.sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "power") return b.power - a.power;
      return 0;
    });

    return filtered;
  }, [sortBy, filterBy]);

  return (
    <div className="mx-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Battle Arena</h1>
        <p className="text-sm text-muted-foreground">Choose your opponent</p>
      </div>

      {/* Player Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Available Turns
            </span>
            <Badge className="text-lg px-3 py-1">
              {player.turns} / {player.maxTurns}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Show</label>
            <div className="flex gap-2">
              <Button
                variant={filterBy === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy("all")}
              >
                All
              </Button>
              <Button
                variant={filterBy === "top20" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy("top20")}
              >
                Top 20
              </Button>
              <Button
                variant={filterBy === "others" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterBy("others")}
              >
                Others
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Sort by</label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "rank" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rank")}
              >
                Rank
              </Button>
              <Button
                variant={sortBy === "power" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("power")}
              >
                Power
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opponents List */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">
          Opponents ({filteredAndSortedOpponents.length})
        </h2>
        {filteredAndSortedOpponents.map((opponent) => (
          <Card key={opponent.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🐼</span>
                    <div>
                      <h3 className="font-semibold">{opponent.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{opponent.rank}
                        </Badge>
                        {opponent.isInTop20 && (
                          <Badge className="text-xs">Top 20</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span>Power: {opponent.power}</span>
                    <span>•</span>
                    <span>
                      {opponent.wins}W - {opponent.losses}L
                    </span>
                  </div>
                </div>
                <Button size="sm" disabled={player.turns === 0}>
                  Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
