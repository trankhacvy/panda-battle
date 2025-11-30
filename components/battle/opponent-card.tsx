import { Flame, Zap, Wind, Brain } from "lucide-react";
import type { OpponentPanda } from "@/lib/mock/battles";
import { Button3D } from "../ui/button-3d";

interface OpponentCardProps {
  opponent: OpponentPanda;
  bgColor: string;
  onBattle?: () => void;
  index?: number;
}

export function OpponentCard({
  opponent,
  bgColor,
  onBattle,
  index = 0,
}: OpponentCardProps) {
  const rowBgColor = index % 2 === 0 ? "bg-slate-300" : "bg-blue-200";

  return (
    <div className={`${rowBgColor} py-3 px-4 flex items-center gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.15)] transition-shadow`}>
      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
        <img
          src="/images/sample-panda.png"
          alt={opponent.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-black font-bold text-base mb-1">{opponent.name}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
              <Flame className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="text-black font-medium">
              STA: {opponent.attributes.endurance}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-orange-400 rounded flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="text-black font-medium">
              STR: {opponent.attributes.strength}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
              <Wind className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="text-black font-medium">
              AGI: {opponent.attributes.speed}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
              <Brain className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="text-black font-medium">
              INT: {opponent.attributes.luck}
            </span>
          </div>
        </div>
      </div>

      <Button3D size="3d-tiny" onClick={onBattle}>
        Battle
      </Button3D>
    </div>
  );
}
