import { Flame, Zap, Wind, Brain } from "lucide-react";
import type { OpponentPanda } from "@/lib/mock/battles";
import { Button3D } from "../ui/button-3d";

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
    <div className="bg-[#041e39] rounded-xl p-3 flex items-center gap-3 border border-[#2a4a6c]">
      {/* Character Image */}
      <div
        className={`w-20 h-20 rounded-lg overflow-hidden ${bgColor} shrink-0`}
      >
        <img
          src="/images/sample-panda.png"
          alt={opponent.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Stats */}
      <div className="flex-1">
        <h3 className="text-white font-bold text-lg mb-1">{opponent.name}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
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
      <Button3D size="3d-tiny" onClick={onBattle}>
        Battle
      </Button3D>
    </div>
  );
}
