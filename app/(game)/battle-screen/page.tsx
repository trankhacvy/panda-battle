"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSound } from "@/hooks/use-sound";
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
  const { play, playMusic, SOUNDS } = useSound();
  const [phase, setPhase] = useState<BattlePhase>("intro");
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isOpponentAttacking, setIsOpponentAttacking] = useState(false);
  const [showIntroText, setShowIntroText] = useState(true);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showOpponentStats, setShowOpponentStats] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [flashEffect, setFlashEffect] = useState<"player" | "opponent" | null>(
    null
  );
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [isOpponentHit, setIsOpponentHit] = useState(false);
  const [playerAttackIcon, setPlayerAttackIcon] = useState("👊");
  const [opponentAttackIcon, setOpponentAttackIcon] = useState("👊");
  const [musicStarted, setMusicStarted] = useState(false);

  const battleMusicRef = useRef<HTMLAudioElement | null>(null);

  const attackIcons = ["👊", "⚔️"];

  useEffect(() => {
    return () => {
      if (battleMusicRef.current) {
        battleMusicRef.current.pause();
        battleMusicRef.current = null;
      }
    };
  }, []);

  const handleStartBattle = () => {
    if (!musicStarted) {
      battleMusicRef.current = playMusic(SOUNDS.BATTLE_MUSIC);
      if (battleMusicRef.current) {
        battleMusicRef.current.play().catch(() => {});
      }
      setMusicStarted(true);
      setPhase("ready");
    }
  };

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
      return;
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "ready") {
      const timer1 = setTimeout(() => setShowIntroText(false), 1500);
      const timer2 = setTimeout(() => {
        setPhase("fighting");
        startBattleSequence();
      }, 2000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
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
        const selectedIcon =
          attackIcons[Math.floor(Math.random() * attackIcons.length)];
        setPlayerAttackIcon(selectedIcon);

        const soundPath =
          selectedIcon === "👊" ? SOUNDS.BATTLE_PUNCH : SOUNDS.BATTLE_SWORD;
        play(soundPath);

        setTimeout(() => {
          setIsPlayerAttacking(false);
          const damage = Math.floor(Math.random() * 20) + 10;
          currentOpponentHP = Math.max(0, currentOpponentHP - damage);
          setOpponentHP(currentOpponentHP);
          setBattleLogs((prev) => [
            ...prev,
            `${playerStats.name} attacks! Dealt ${damage} damage!`,
          ]);

          setIsOpponentHit(true);
          play(SOUNDS.BATTLE_HIT);
          setTimeout(() => {
            setIsOpponentHit(false);
          }, 300);

          if (currentOpponentHP <= 0) {
            clearInterval(battleInterval);
            setBattleLogs((prev) => [...prev, `🏆 ${playerStats.name} wins!`]);
            if (battleMusicRef.current) battleMusicRef.current.pause();
            setTimeout(() => setPhase("playerWin"), 1000);
          }
        }, 500);
      } else {
        setIsOpponentAttacking(true);
        const selectedIcon =
          attackIcons[Math.floor(Math.random() * attackIcons.length)];
        setOpponentAttackIcon(selectedIcon);

        const soundPath =
          selectedIcon === "👊" ? SOUNDS.BATTLE_PUNCH : SOUNDS.BATTLE_SWORD;
        play(soundPath);

        setTimeout(() => {
          setIsOpponentAttacking(false);
          const damage = Math.floor(Math.random() * 20) + 10;
          currentPlayerHP = Math.max(0, currentPlayerHP - damage);
          setPlayerHP(currentPlayerHP);
          setBattleLogs((prev) => [
            ...prev,
            `${opponentStats.name} attacks! Dealt ${damage} damage!`,
          ]);

          setIsPlayerHit(true);
          setFlashEffect("player");
          play(SOUNDS.BATTLE_HIT);
          setTimeout(() => {
            setIsPlayerHit(false);
            setFlashEffect(null);
          }, 300);

          if (currentPlayerHP <= 0) {
            clearInterval(battleInterval);
            setBattleLogs((prev) => [
              ...prev,
              `💀 ${opponentStats.name} wins!`,
            ]);
            if (battleMusicRef.current) battleMusicRef.current.pause();
            setTimeout(() => setPhase("opponentWin"), 1000);
          }
        }, 500);
      }

      if (turn >= 10) {
        clearInterval(battleInterval);
        if (battleMusicRef.current) battleMusicRef.current.pause();
        if (currentPlayerHP > currentOpponentHP) {
          setBattleLogs((prev) => [
            ...prev,
            `🏆 ${playerStats.name} wins by HP!`,
          ]);
          setPhase("playerWin");
        } else {
          setBattleLogs((prev) => [
            ...prev,
            `💀 ${opponentStats.name} wins by HP!`,
          ]);
          setPhase("opponentWin");
        }
      }
    }, 2000);
  };

  const handleBackToHome = () => router.push("/home");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".panda-card") && !target.closest(".stats-popup")) {
        setShowPlayerStats(false);
        setShowOpponentStats(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="h-[calc(100vh-80px-80px)] w-full flex flex-col relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/images/game-bg.png)" }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      {flashEffect === "player" && (
        <div className="absolute inset-0 bg-red-500/40 animate-in fade-in duration-100 pointer-events-none z-50" />
      )}
      {flashEffect === "opponent" && (
        <div className="absolute inset-0 bg-red-500/40 animate-in fade-in duration-100 pointer-events-none z-50" />
      )}

      <BattleIntro show={phase === "intro"} onStart={handleStartBattle} />

      <div className="relative z-10 h-full flex flex-col">
        <BattleHeader phase={phase} />
        <HPBars playerHP={playerHP} opponentHP={opponentHP} />

        <div className="flex-1 flex items-center justify-center px-3 py-2 relative min-h-0 overflow-hidden">
          <div className="w-full h-full flex items-center justify-between max-w-xl">
            <PandaFighter
              stats={playerStats}
              isAttacking={isPlayerAttacking}
              isHit={isPlayerHit}
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
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl animate-bounce">
                      💥
                    </div>
                    <div
                      className="absolute -right-8 top-1/2 -translate-y-1/2 text-2xl animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    >
                      💥
                    </div>
                  </>
                )}
              </div>
            </div>

            <PandaFighter
              stats={opponentStats}
              isAttacking={isOpponentAttacking}
              isHit={isOpponentHit}
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
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 text-6xl pointer-events-none animate-punch-right">
              {playerAttackIcon}
            </div>
          )}
          {isOpponentAttacking && (
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 text-6xl pointer-events-none animate-punch-left">
              {opponentAttackIcon}
            </div>
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
