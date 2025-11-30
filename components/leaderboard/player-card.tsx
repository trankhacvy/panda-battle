import { Crown } from "lucide-react";
import { Button3D } from "../ui/button-3d";

interface PlayerCardProps {
  rank: number;
  name: string;
  points: number;
  bgColor: string;
  borderColor: string;
  onBattle?: () => void;
  index?: number;
}

export function PlayerCard({
  rank,
  name,
  points,
  bgColor,
  borderColor,
  onBattle,
  index = 0,
}: PlayerCardProps) {
  const getCrownColor = () => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "";
  };

  const rowBgColor = index % 2 === 0 ? "bg-slate-300" : "bg-blue-200";

  return (
    <div className={`${rowBgColor} py-3 px-4 flex items-center gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_3px_6px_rgba(0,0,0,0.15)] transition-shadow`}>
      <div className="flex flex-col items-center w-8">
        {rank <= 3 && <Crown className={`w-3 h-3 ${getCrownColor()}`} />}
        <span className="text-black font-bold text-base">{rank}.</span>
      </div>

      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
        <img
          src="/images/sample-panda.png"
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h3 className="text-black font-bold text-base">{name}</h3>
        <p className="text-gray-700 text-sm">
          Points:{" "}
          <span className="text-orange-600 font-bold">
            {points.toLocaleString()}
          </span>
        </p>
      </div>

      <Button3D variant="3d-red" size="3d-tiny" onClick={onBattle}>
        Battle
      </Button3D>
    </div>
  );
}
