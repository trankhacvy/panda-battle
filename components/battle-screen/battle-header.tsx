type BattlePhase = "intro" | "ready" | "fighting" | "playerWin" | "opponentWin";

export function BattleHeader({ phase }: { phase: BattlePhase }) {
  return (
    <div className="flex-shrink-0 py-2 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl">⚔️</span>
        <h1 className="text-xl font-black text-white drop-shadow-lg">
          BATTLE
        </h1>
        <span className="text-xl">⚔️</span>
      </div>
      {phase === "ready" && (
        <p className="text-white text-base font-bold animate-pulse mt-0.5">
          FIGHT!
        </p>
      )}
    </div>
  );
}
