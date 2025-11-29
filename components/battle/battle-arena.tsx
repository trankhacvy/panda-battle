"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { OpponentPanda } from "@/lib/mock/battles";
import { BattleStealSelection } from "@/components/battle/battle-steal-selection";
import { BattleResults } from "@/components/battle/battle-results";
import { cn } from "@/lib/utils";

interface BattleArenaProps {
  playerPanda: OpponentPanda;
  opponentPanda: OpponentPanda;
  onBattleComplete: () => void;
}

type BattlePhase = "intro" | "fighting" | "steal" | "results";

interface BattleEvent {
  id: string;
  type: "attack" | "damage" | "critical";
  actor: "player" | "opponent";
  message: string;
  damage?: number;
}

/**
 * BattleArena - Main battle screen component
 *
 * Task 9.1: Create battle arena UI
 * Task 9.2: Implement battle animation sequence
 *
 * Requirements: 3.2, 3.3, 3.5, 3.6
 */
export function BattleArena({
  playerPanda,
  opponentPanda,
  onBattleComplete,
}: BattleArenaProps) {
  const [phase, setPhase] = useState<BattlePhase>("intro");
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<BattleEvent | null>(null);
  const [stolenAttribute, setStolenAttribute] = useState<{
    type: string;
    amount: number;
  } | null>(null);

  // Calculate battle scores based on design spec (Requirement 3.2)
  const calculateBattleScore = (panda: OpponentPanda, isDefender: boolean) => {
    const weights = {
      strength: 0.35,
      speed: 0.25,
      endurance: 0.25,
      luck: 0.15,
    };

    let baseScore =
      panda.attributes.strength * weights.strength +
      panda.attributes.speed * weights.speed +
      panda.attributes.endurance * weights.endurance +
      panda.attributes.luck * weights.luck;

    // Apply Top 20 vulnerability (Requirement 3.6)
    if (isDefender && panda.isInTop20) {
      baseScore *= 0.8; // 20% vulnerability
    }

    // Add randomness for upsets (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;

    return Math.floor(baseScore * randomFactor);
  };

  // Generate battle events
  useEffect(() => {
    if (phase === "intro") {
      const timer = setTimeout(() => {
        // Calculate scores
        const pScore = calculateBattleScore(playerPanda, false);
        const oScore = calculateBattleScore(opponentPanda, true);

        setPlayerScore(pScore);
        setOpponentScore(oScore);

        // Generate battle events
        const battleEvents: BattleEvent[] = [
          {
            id: "event_1",
            type: "attack",
            actor: "player",
            message: `${playerPanda.name} launches an attack!`,
            damage: 15,
          },
          {
            id: "event_2",
            type: "damage",
            actor: "opponent",
            message: `${opponentPanda.name} takes damage!`,
            damage: 15,
          },
          {
            id: "event_3",
            type: "attack",
            actor: "opponent",
            message: `${opponentPanda.name} counterattacks!`,
            damage: 12,
          },
          {
            id: "event_4",
            type: "damage",
            actor: "player",
            message: `${playerPanda.name} takes damage!`,
            damage: 12,
          },
          {
            id: "event_5",
            type: "critical",
            actor: "player",
            message: `${playerPanda.name} uses a powerful technique!`,
            damage: 25,
          },
          {
            id: "event_6",
            type: "damage",
            actor: "opponent",
            message: `Critical hit on ${opponentPanda.name}!`,
            damage: 25,
          },
          {
            id: "event_7",
            type: "attack",
            actor: "opponent",
            message: `${opponentPanda.name} fights back!`,
            damage: 18,
          },
          {
            id: "event_8",
            type: "damage",
            actor: "player",
            message: `${playerPanda.name} takes a hit!`,
            damage: 18,
          },
        ];

        setEvents(battleEvents);
        setPhase("fighting");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, playerPanda, opponentPanda]);

  // Animate battle events
  useEffect(() => {
    if (
      phase === "fighting" &&
      events.length > 0 &&
      currentEventIndex < events.length
    ) {
      const event = events[currentEventIndex];
      setCurrentEvent(event);

      const timer = setTimeout(() => {
        // Show attack animation
        if (event.type === "attack" || event.type === "critical") {
          if (event.actor === "player") {
            setPlayerAttacking(true);
            setTimeout(() => setPlayerAttacking(false), 500);
          } else {
            setOpponentAttacking(true);
            setTimeout(() => setOpponentAttacking(false), 500);
          }
        }

        // Apply damage
        if (event.type === "damage" && event.damage) {
          if (event.actor === "player") {
            setPlayerHP((prev) => Math.max(0, prev - event.damage!));
          } else {
            setOpponentHP((prev) => Math.max(0, prev - event.damage!));
          }
        }

        setCurrentEventIndex((prev) => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (phase === "fighting" && currentEventIndex >= events.length) {
      // Battle complete, determine winner (Requirement 3.3)
      const timer = setTimeout(() => {
        const battleWinner =
          playerScore > opponentScore ? "player" : "opponent";
        setWinner(battleWinner);

        // Set final HP based on winner
        if (battleWinner === "player") {
          setOpponentHP(0);
        } else {
          setPlayerHP(0);
        }

        // Move to steal phase if player wins, otherwise results
        setTimeout(() => {
          setPhase(battleWinner === "player" ? "steal" : "results");
        }, 2000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [phase, events, currentEventIndex, playerScore, opponentScore]);

  const handleStealComplete = (attributeType: string, amount: number) => {
    setStolenAttribute({ type: attributeType, amount });
    setPhase("results");
  };

  const handleSkipSteal = () => {
    setPhase("results");
  };

  // Render steal selection phase
  if (phase === "steal") {
    return (
      <BattleStealSelection
        winner={playerPanda}
        loser={opponentPanda}
        onStealComplete={handleStealComplete}
        onSkip={handleSkipSteal}
      />
    );
  }

  // Render results phase
  if (phase === "results") {
    return (
      <BattleResults
        playerPanda={playerPanda}
        opponentPanda={opponentPanda}
        winner={winner!}
        playerScore={playerScore}
        opponentScore={opponentScore}
        stolenAttribute={stolenAttribute}
        onComplete={onBattleComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex flex-col">
      {/* Battle Progress Indicator */}
      <div className="w-full bg-card/50 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Battle Progress</span>
            <span className="capitalize">{phase}</span>
          </div>
          <div className="flex gap-2">
            <div
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                phase === "intro" ||
                  phase === "fighting" ||
                  phase === "steal" ||
                  phase === "results"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                  : "bg-muted"
              )}
            />
            <div
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                phase === "fighting"
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-muted"
              )}
            />
            {/* <div
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                phase === "steal" || phase === "results"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-muted"
              )}
            /> */}
            {/* <div
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                phase === "results"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                  : "bg-muted"
              )}
            /> */}
          </div>
        </div>
      </div>

      {/* Battle Event Display */}
      {currentEvent && phase === "fighting" && (
        <div className="w-full bg-muted/30 backdrop-blur-sm border-b border-border/50 p-3">
          <div className="max-w-md mx-auto text-center">
            <p className="text-sm font-medium animate-in fade-in duration-300">
              {currentEvent.message}
            </p>
          </div>
        </div>
      )}

      {/* Score Display */}
      {phase === "fighting" && (
        <div className="w-full bg-card/30 backdrop-blur-sm border-b border-border/50 p-3">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Your Score</div>
              <div className="text-2xl font-bold text-emerald-500">
                {playerScore}
              </div>
            </div>
            <div className="text-2xl text-muted-foreground">VS</div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">
                Opponent Score
              </div>
              <div className="text-2xl font-bold text-red-500">
                {opponentScore}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Winner Announcement */}
      {winner && phase === "fighting" && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="text-8xl animate-bounce">
              {winner === "player" ? "🏆" : "💀"}
            </div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              {winner === "player" ? "VICTORY!" : "DEFEAT"}
            </h2>
            <p className="text-xl text-muted-foreground">
              {winner === "player"
                ? `${playerPanda.name} wins!`
                : `${opponentPanda.name} wins!`}
            </p>
          </div>
        </div>
      )}

      {/* Battle Arena */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Split-screen layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative">
            {/* Player Panda (Left/Attacker) */}
            <PandaDisplay
              panda={playerPanda}
              hp={playerHP}
              isPlayer={true}
              label="YOU"
              isAttacking={playerAttacking}
            />

            {/* VS Divider */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block z-10">
              <div className="relative">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse">
                  VS
                </div>
                <div className="absolute inset-0 blur-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-30" />
              </div>
            </div>

            {/* Opponent Panda (Right/Defender) */}
            <PandaDisplay
              panda={opponentPanda}
              hp={opponentHP}
              isPlayer={false}
              label="OPPONENT"
              isAttacking={opponentAttacking}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PandaDisplayProps {
  panda: OpponentPanda;
  hp: number;
  isPlayer: boolean;
  label: string;
  isAttacking?: boolean;
}

function PandaDisplay({
  panda,
  hp,
  isPlayer,
  label,
  isAttacking,
}: PandaDisplayProps) {
  return (
    <Card
      variant="battle"
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isPlayer ? "md:mr-4" : "md:ml-4",
        isAttacking && "scale-110 shadow-2xl"
      )}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant={isPlayer ? "default" : "outline"} className="text-xs">
            {label}
          </Badge>
          <h2 className="text-2xl font-bold">{panda.name}</h2>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              Rank #{panda.rank}
            </Badge>
            {panda.isInTop20 && (
              <Badge variant="default" className="text-xs bg-yellow-500">
                Top 20
              </Badge>
            )}
          </div>
        </div>

        {/* Panda Avatar */}
        <div className="relative">
          <div
            className={cn(
              "w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl transition-all duration-300",
              isAttacking && "animate-pulse"
            )}
            style={{
              background: `linear-gradient(135deg, ${panda.colorPalette.primary}, ${panda.colorPalette.secondary})`,
              boxShadow: `0 0 30px ${panda.colorPalette.accent}40`,
            }}
          >
            🐼
          </div>
          {/* HP Bar */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">HP</span>
              <span className="text-muted-foreground">{hp}%</span>
            </div>
            <Progress value={hp} className="h-4" variant="default" />
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-center text-muted-foreground">
            Attributes
          </div>

          {/* Strength */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span>💪</span>
                <span className="font-semibold">Strength</span>
              </span>
              <span className="text-muted-foreground">
                {panda.attributes.strength}
              </span>
            </div>
            <Progress
              value={(panda.attributes.strength / 40) * 100}
              variant="strength"
              className="h-2"
            />
          </div>

          {/* Speed */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span>⚡</span>
                <span className="font-semibold">Speed</span>
              </span>
              <span className="text-muted-foreground">
                {panda.attributes.speed}
              </span>
            </div>
            <Progress
              value={(panda.attributes.speed / 40) * 100}
              variant="speed"
              className="h-2"
            />
          </div>

          {/* Endurance */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span>🛡️</span>
                <span className="font-semibold">Endurance</span>
              </span>
              <span className="text-muted-foreground">
                {panda.attributes.endurance}
              </span>
            </div>
            <Progress
              value={(panda.attributes.endurance / 40) * 100}
              variant="endurance"
              className="h-2"
            />
          </div>

          {/* Luck */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span>🍀</span>
                <span className="font-semibold">Luck</span>
              </span>
              <span className="text-muted-foreground">
                {panda.attributes.luck}
              </span>
            </div>
            <Progress
              value={(panda.attributes.luck / 40) * 100}
              variant="luck"
              className="h-2"
            />
          </div>
        </div>

        {/* Total Power */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Power</span>
            <Badge variant="default" className="text-base px-3 py-1">
              {panda.power}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
