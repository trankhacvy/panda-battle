import { Flame, Zap, Wind, Brain } from "lucide-react";
import type { OpponentPanda } from "@/lib/mock/battles";
import { Button } from "../ui/button";
import { CardFrame } from "../ui/card-frame";

interface OpponentCardProps {
  opponent: OpponentPanda;
  bgColor: string;
  onBattle?: () => void;
}

export function OpponentCard({
  opponent,
  bgColor,
  onBattle,
}: OpponentCardProps) {
  return (
    <div className="rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 border border-[#2a4a6c] bg-black/60">
      {/* Avatar */}
      <CardFrame size="sm" className="shrink-0">
        <div className="w-16 sm:w-20 h-16 sm:h-20 relative overflow-hidden">
          <img
            src="/images/reated-panda-bg"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            src="/images/sample-panda.png"
            alt={opponent.name}
            className="relative z-10 w-full h-full object-cover"
          />
        </div>
      </CardFrame>

      {/* Stats */}
      <div className="flex-1 relative z-10">
        <h3 className="text-white font-bold text-base sm:text-lg mb-1">{opponent.name}</h3>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
              <Flame className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">
              STA: {opponent.attributes.endurance}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-orange-400 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">
              STR: {opponent.attributes.strength}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <Wind className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">
              AGI: {opponent.attributes.speed}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </span>
            <span className="text-white font-medium">
              INT: {opponent.attributes.luck}
            </span>
          </div>
        </div>
      </div>

      {/* Battle Button */}
      <div className="relative z-10">
        <Button size="sm" variant="danger" onClick={onBattle}>
          Battle
        </Button>
      </div>
    </div>
  );
}
