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
    <CardFrame size="md" className="w-full">
      <div className="rounded-[1.125rem] p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 bg-white">
        {/* Avatar */}
        <CardFrame size="sm" className="shrink-0">
          <div className="w-14 sm:w-16 h-14 sm:h-16 relative overflow-hidden">
            <img
              src="/images/reated-panda-bg.png"
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
        <div className="flex-1">
          <h3 className="text-gray-900 font-bold text-sm sm:text-base mb-0.5">{opponent.name}</h3>
          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 gap-y-0.5 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                <Flame className="w-2.5 h-2.5 text-white" />
              </span>
              <span className="text-gray-700 font-medium">
                STA: {opponent.attributes.endurance}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-orange-400 rounded flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </span>
              <span className="text-gray-700 font-medium">
                STR: {opponent.attributes.strength}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                <Wind className="w-2.5 h-2.5 text-white" />
              </span>
              <span className="text-gray-700 font-medium">
                AGI: {opponent.attributes.speed}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                <Brain className="w-2.5 h-2.5 text-white" />
              </span>
              <span className="text-gray-700 font-medium">
                INT: {opponent.attributes.luck}
              </span>
            </div>
          </div>
        </div>

        {/* Battle Button */}
        <div>
          <Button size="sm" variant="danger" onClick={onBattle}>
            Battle
          </Button>
        </div>
      </div>
    </CardFrame>
  );
}