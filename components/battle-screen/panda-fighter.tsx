import { cn } from "@/lib/utils";

interface PandaStats {
  name: string;
  level: number;
  str: number;
  agi: number;
  int: number;
}

interface PandaFighterProps {
  stats: PandaStats;
  isAttacking: boolean;
  showStats: boolean;
  onToggleStats: () => void;
  side: "left" | "right";
  color: "green" | "red";
  isHit?: boolean;
}

export function PandaFighter({
  stats,
  isAttacking,
  showStats,
  onToggleStats,
  side,
  color,
  isHit = false,
}: PandaFighterProps) {
  const borderColor = color === "green" ? "border-green-500/50" : "border-red-500/50";
  const shadowColor =
    color === "green"
      ? "shadow-[0_0_30px_rgba(34,197,94,0.5)]"
      : "shadow-[0_0_30px_rgba(239,68,68,0.5)]";
  const bgColor = color === "green" ? "bg-green-500" : "bg-red-500";
  const slideAnimation =
    side === "left" ? "animate-in slide-in-from-left duration-700" : "animate-in slide-in-from-right duration-700";

  const attackAnimation = isAttacking 
    ? (side === "left" ? "translate-x-16 scale-125" : "-translate-x-16 scale-125")
    : "";
  
  const hitAnimation = isHit ? "animate-shake" : "";

  return (
    <div className={`panda-card flex flex-col items-center cursor-pointer ${slideAnimation}`} onClick={onToggleStats}>
      <div className={cn("relative transition-all duration-300", attackAnimation, hitAnimation)}>
        <div className={`w-36 h-36 rounded-2xl overflow-hidden border-4 ${borderColor} ${shadowColor} bg-cover bg-center relative`}>
          <img src="/images/fighter-frame.png" alt="Fighter" className="w-full h-full object-cover absolute inset-0" />
          <img src="/images/sample-panda.png" alt="Panda" className="w-full h-full object-contain relative z-10" />
        </div>
        <div
          className={`absolute ${side === "left" ? "-top-1.5 -left-1.5" : "-top-1.5 -right-1.5"} bg-white text-black px-2 py-0.5 rounded-full text-xs font-bold `}
        >
          Lv {stats.level}
        </div>
      </div>
      <div className={`mt-2 ${bgColor} text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap`}>
        {stats.name}
      </div>

      {showStats && (
        <div
          className={`stats-popup absolute ${side === "left" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-sm border-2 border-${color}-500 rounded-xl p-3 z-20 animate-in zoom-in-95 duration-200`}
        >
          <div className="space-y-2 min-w-[110px]">
            <div className={`text-white font-bold text-xs border-b border-${color}-500/50 pb-1`}>{stats.name}</div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-orange-400 font-semibold">STR:</span>
              <span className="text-white font-bold">{stats.str}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-green-400 font-semibold">AGI:</span>
              <span className="text-white font-bold">{stats.agi}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-blue-400 font-semibold">INT:</span>
              <span className="text-white font-bold">{stats.int}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
