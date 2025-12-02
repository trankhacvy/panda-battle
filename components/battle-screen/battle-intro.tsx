export function BattleIntro({ show, onStart }: { show: boolean; onStart?: () => void }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="text-6xl animate-bounce">⚔️</div>
        <h1
          className="text-5xl font-black animate-pulse"
          style={{
            color: "#FFD700",
            textShadow: "0 0 30px rgba(255,215,0,0.8), 4px 4px 0 rgba(0,0,0,0.8)",
            WebkitTextStroke: "2px #000",
          }}
        >
          BATTLE START!
        </h1>
        {onStart && (
          <button
            onClick={onStart}
            className="mt-6 px-8 py-3 bg-gradient-to-b from-[#A855F7] to-[#7E3FB8] hover:from-[#B865F7] hover:to-[#8E4FC8] text-white font-bold text-xl rounded-lg shadow-[0_8px_0_#5E1F88] hover:shadow-[0_6px_0_#5E1F88] active:shadow-none active:translate-y-[8px] transition-all duration-150"
          >
            TAP TO START!
          </button>
        )}
      </div>
    </div>
  );
}
