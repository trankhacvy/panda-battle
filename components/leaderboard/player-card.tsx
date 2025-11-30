import { Crown } from "lucide-react";
import { Button3D } from "../ui/button-3d";

interface PlayerCardProps {
  rank: number;
  name: string;
  points: number;
  bgColor: string;
  borderColor: string;
  onBattle?: () => void;
}

export function PlayerCard({
  rank,
  name,
  points,
  bgColor,
  borderColor,
  onBattle,
}: PlayerCardProps) {
  const getCrownColor = () => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "";
  };

  return (
    <div
      className={`bg-[#041e39] backdrop-blur rounded-xl p-3 flex items-center gap-3 ${borderColor}`}
    >
      {/* Rank */}
      <div className="flex flex-col items-center w-8">
        {rank <= 3 && <Crown className={`w-4 h-4 ${getCrownColor()}`} />}
        <span className="text-white font-bold text-lg">{rank}.</span>
      </div>

      {/* Avatar */}
      <div
        className={`w-16 h-16 rounded-lg ${bgColor} overflow-hidden shrink-0`}
      >
        <img
          src="/images/sample-panda.png"
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-white font-bold text-lg">{name}</h3>
        <p className="text-white/80">
          Points:{" "}
          <span className="text-yellow-400 font-bold">
            {points.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Battle Button */}
      <Button3D variant="3d-red" size="3d-tiny" onClick={onBattle}>
        Battle
      </Button3D>
    </div>
  );
}
