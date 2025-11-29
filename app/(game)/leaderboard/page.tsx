"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mockLeaderboardEntries,
  type LeaderboardEntry,
} from "@/lib/mock/leaderboard";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LeaderboardPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto px-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Top players and rankings
        </p>
      </div>

      {/* Top 20 Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm">
            <span>🏆</span>
            <span>Top 20 players have full stats visible</span>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {mockLeaderboardEntries.map((entry) => (
          <Card
            key={entry.id}
            className={entry.isCurrentPlayer ? "border-primary" : ""}
          >
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-center min-w-[40px]">
                      <div className="text-xl font-bold">#{entry.rank}</div>
                    </div>
                    <div className="text-3xl">{entry.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {entry.player}
                        </h3>
                        {entry.isCurrentPlayer && (
                          <Badge variant="default" className="text-xs">
                            YOU
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>⚡ {entry.totalPower}</span>
                        <span>•</span>
                        <span>
                          {entry.totalWins}W - {entry.totalLosses}L
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    {expandedId === entry.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                {expandedId === entry.id && entry.attributes !== null && (
                  <div className="pt-3 border-t space-y-2">
                    {entry.attributes && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {entry.visibility === "full" ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                💪 Strength
                              </span>
                              <span className="font-semibold">
                                {entry.attributes.strength}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                ⚡ Speed
                              </span>
                              <span className="font-semibold">
                                {entry.attributes.speed}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                🛡️ Endurance
                              </span>
                              <span className="font-semibold">
                                {entry.attributes.endurance}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                🍀 Luck
                              </span>
                              <span className="font-semibold">
                                {entry.attributes.luck}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                💪 Strength
                              </span>
                              <span className="font-semibold">
                                {entry.attributes.strength}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                ⚡ Speed
                              </span>
                              <span className="font-semibold">
                                {entry.attributes.speed}
                              </span>
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground text-center">
                              Other stats hidden
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Win Rate
                          </span>
                          <span className="font-semibold">
                            {entry.winRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Total Power
                          </span>
                          <span className="font-semibold">
                            {entry.totalPower}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!entry.isCurrentPlayer &&
                      entry.visibility !== "hidden" && (
                        <Button className="w-full" size="sm">
                          Challenge
                        </Button>
                      )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
