"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BattleIntro } from "@/components/battle-screen/battle-intro";
import { BattleHeader } from "@/components/battle-screen/battle-header";
import { PandaFighter } from "@/components/battle-screen/panda-fighter";
import { BattleResult } from "@/components/battle-screen/battle-result";
import { HPBars } from "@/components/battle-screen/hp-bars";
import { BattleLog } from "@/components/battle-screen/battle-log";


type BattlePhase = "intro" | "ready" | "fighting" | "playerWin" | "opponentWin";

interface PandaStats {
  name: string;
  level: number;
  str: number;
  agi: number;
  int: number;
}

export default function BattleScreenPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<BattlePhase>("intro");
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isOpponentAttacking, setIsOpponentAttacking] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showOpponentStats, setShowOpponentStats] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);

  const playerStats: PandaStats = {
    name: "I_am_Me",
    level: 5,
    str: 85,
    agi: 72,
    int: 68,
  };

  const opponentStats: PandaStats = {
    name: "Crisis125",
    level: 6,
    str: 78,
    agi: 88,
    int: 74,
  };

  useEffect(() => {
    if (phase === "intro") {
      const timer1 = setTimeout(() => setShowIntroText(false), 1500);
      const timer2 = setTimeout(() => setPhase("ready"), 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "ready") {
      const timer = setTimeout(() => {
        setPhase("fighting");
        startBattleSequence();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const startBattleSequence = () => {
    let currentPlayerHP = 100;
    let currentOpponentHP = 100;
    let turn = 0;

    setBattleLogs(["⚔️ Battle begins!"]);

    const battleInterval = setInterval(() => {
      turn++;

      if (turn % 2 === 1) {
        setIsPlayerAttacking(true);
        setTimeout(() => {
          setIsPlayerAttacking(false);
          const damage = Math.floor(Math.random() * 20) + 10;
          currentOpponentHP = Math.max(0, currentOpponentHP - damage);
          setOpponentHP(currentOpponentHP);
          setBattleLogs(prev => [...prev, `${playerStats.name} attacks! Dealt ${damage} damage!`]);

          if (currentOpponentHP <= 0) {
            clearInterval(battleInterval);
            setBattleLogs(prev => [...prev, `🏆 ${playerStats.name} wins!`]);
            setTimeout(() => setPhase("playerWin"), 1000);
          }
        }, 500);
      } else {
        setIsOpponentAttacking(true);
        setTimeout(() => {
          setIsOpponentAttacking(false);
          const damage = Math.floor(Math.random() * 20) + 10;
          currentPlayerHP = Math.max(0, currentPlayerHP - damage);
          setPlayerHP(currentPlayerHP);
          setBattleLogs(prev => [...prev, `${opponentStats.name} attacks! Dealt ${damage} damage!`]);

          if (currentPlayerHP <= 0) {
            clearInterval(battleInterval);
            setBattleLogs(prev => [...prev, `💀 ${opponentStats.name} wins!`]);
            setTimeout(() => setPhase("opponentWin"), 1000);
          }
        }, 500);
      }

      if (turn >= 10) {
        clearInterval(battleInterval);
        if (currentPlayerHP > currentOpponentHP) {
          setBattleLogs(prev => [...prev, `🏆 ${playerStats.name} wins by HP!`]);
          setPhase("playerWin");
        } else {
          setBattleLogs(prev => [...prev, `💀 ${opponentStats.name} wins by HP!`]);
          setPhase("opponentWin");
        }
      }
    }, 2000);
  };

  const handleBackToHome = () => router.push("/home");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.panda-card') && !target.closest('.stats-popup')) {
        setShowPlayerStats(false);
        setShowOpponentStats(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="h-[calc(100vh-80px-80px)] w-full flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/images/game-bg.png)" }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <BattleIntro show={phase === "intro" && showIntroText} />

      <div className="relative z-10 h-full flex flex-col">
        <BattleHeader phase={phase} />
        <HPBars playerHP={playerHP} opponentHP={opponentHP} />

        <div className="flex-1 flex items-center justify-center px-3 py-2 relative min-h-0 overflow-hidden">
          <div className="w-full h-full flex items-center justify-between max-w-xl">
            <PandaFighter
              stats={playerStats}
              isAttacking={isPlayerAttacking}
              showStats={showPlayerStats}
              onToggleStats={() => {
                setShowPlayerStats(!showPlayerStats);
                setShowOpponentStats(false);
              }}
              side="left"
              color="green"
            />

            <div className="flex items-center justify-center flex-shrink-0">
              <div className="relative">
                <div className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
                  VS
                </div>
                {phase === "fighting" && (
                  <>
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl animate-bounce">💥</div>
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-2xl animate-bounce" style={{ animationDelay: "0.3s" }}>💥</div>
                  </>
                )}
              </div>
            </div>

            <PandaFighter
              stats={opponentStats}
              isAttacking={isOpponentAttacking}
              showStats={showOpponentStats}
              onToggleStats={() => {
                setShowOpponentStats(!showOpponentStats);
                setShowPlayerStats(false);
              }}
              side="right"
              color="red"
            />
          </div>

          {isPlayerAttacking && (
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 text-3xl animate-ping pointer-events-none">👊</div>
          )}
          {isOpponentAttacking && (
            <div className="absolute right-1/3 top-1/2 -translate-y-1/2 text-3xl animate-ping pointer-events-none">💥</div>
          )}
        </div>

        <BattleLog 
          logs={battleLogs}
          playerName={playerStats.name}
          opponentName={opponentStats.name}
        />

        {(phase === "playerWin" || phase === "opponentWin") && (
          <BattleResult
            isPlayerWin={phase === "playerWin"}
            onBackToHome={handleBackToHome}
          />
        )}
      </div>
    </div>
  );
}
