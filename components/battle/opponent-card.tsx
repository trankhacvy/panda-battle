import { Flame, Zap, Wind, Brain } from "lucide-react";
import type { OpponentPanda } from "@/lib/mock/battles";
import { Button3D } from "../ui/button-3d";
import { PlayerState } from "@/lib/sdk/generated";
import { formatAddress } from "@/lib/utils";
// import { StatBadge } from "@/app/(game)/home/page";

interface OpponentCardProps {
  opponent: PlayerState;
  bgColor: string;
  onBattle?: () => void;
}

export function OpponentCard({
  opponent,
  bgColor,
  onBattle,
}: OpponentCardProps) {
  return (
    <div className="rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 border border-[#2a4a6c] bg-black/60 bg-cover bg-center relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden shrink-0 backdrop-blur-sm bg-black/20">
        <img
          src="/images/sample-panda.png"
          alt={opponent.player.toString()}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Stats */}
      <div className="flex-1 relative z-10">
        <h3 className="text-white font-bold text-base sm:text-lg mb-1">
          {formatAddress(opponent.player)}
        </h3>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-orange-400 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">STR: {opponent.str}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <Wind className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">AGI: {opponent.agi}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">INT: {opponent.int}</span>
          </div>
        </div>
      </div>

      {/* Battle Button */}
      <div className="relative z-10">
        <Button3D size="3d-tiny" variant="3d-red" onClick={onBattle}>
          Battle
        </Button3D>
      </div>
    </div>
  );
}
