import { Button } from "../ui/button";
import { CardFrame } from "../ui/card-frame";

interface PlayerCardProps {
  rank: number;
  name: string;
  points: number;
  bgColor: string;
  borderColor: string;
  onBattle?: () => void;
}

const CrownIcon = ({ rank }: { rank: number }) => {
  const getColor = () => {
    if (rank === 1) return "#FFD700"; // Gold
    if (rank === 2) return "#C0C0C0"; // Silver
    return "#CD7F32"; // Bronze
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={getColor()}
      className="drop-shadow-lg"
    >
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
    </svg>
  );
};

export function PlayerCard({
  rank,
  name,
  points,
  bgColor,
  borderColor,
  onBattle,
}: PlayerCardProps) {
  const getCardBackground = () => {
    if (rank === 1) return "bg-linear-to-r from-yellow-600/30 via-yellow-500/20 to-yellow-600/30";
    if (rank === 2) return "bg-linear-to-r from-gray-600/30 via-gray-500/20 to-gray-600/30";
    if (rank === 3) return "bg-linear-to-r from-amber-700/30 via-amber-600/20 to-amber-700/30";
    return "bg-[#041e39]";
  };

  const getBackgroundImage = () => {
    if (rank === 1) return "/images/leaderboard/golden-tree.png";
    if (rank === 2) return "/images/leaderboard/silver-tree.png";
    if (rank === 3) return "/images/leaderboard/broze-tree.png";
    return "";
  };

  const getBorderEffect = () => {
    if (rank === 1) return "before:absolute before:inset-[-3px] before:rounded-[1.5rem] before:p-[3px] before:bg-gradient-to-r before:from-yellow-400 before:via-yellow-300 before:to-yellow-400 before:bg-[length:200%_100%] before:animate-[shimmer_2s_linear_infinite] before:-z-10";
    if (rank === 2) return "before:absolute before:inset-[-3px] before:rounded-[1.5rem] before:p-[3px] before:bg-gradient-to-r before:from-gray-400 before:via-gray-200 before:to-gray-400 before:bg-[length:200%_100%] before:animate-[shimmer_2s_linear_infinite] before:-z-10";
    if (rank === 3) return "before:absolute before:inset-[-3px] before:rounded-[1.5rem] before:p-[3px] before:bg-gradient-to-r before:from-amber-500 before:via-amber-300 before:to-amber-500 before:bg-[length:200%_100%] before:animate-[shimmer_2s_linear_infinite] before:-z-10";
    return "";
  };

  return (
    <CardFrame size="md" className={`w-full relative ${getBorderEffect()}`}>
      <div className="rounded-[1.125rem] p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 bg-white relative overflow-hidden">
        {/* Background pattern for top 3 */}
        {rank <= 3 && (
          <div className="absolute inset-0 opacity-80">
            <div className="absolute inset-0" style={{
                          
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
          </div>
        )}

     

        {/* Avatar */}
        <div className="relative z-10 shrink-0">
          {/* Crown icon for top 3 - positioned outside CardFrame */}
          {rank <= 3 && (
            <div className="absolute -top-1 sm:-top-1.5 left-1/2 -translate-x-1/2 z-30">
              <CrownIcon rank={rank} />
            </div>
          )}
          <CardFrame 
            size="sm" 
            className={
              rank === 1 ? "!bg-yellow-400 ring-2 ring-yellow-400" :
              rank === 2 ? "!bg-gray-300 ring-2 ring-gray-300" :
              rank === 3 ? "!bg-amber-500 ring-2 ring-amber-500" : ""
            }
          >
            <div className="w-10 sm:w-14 h-10 sm:h-14 relative">
              <img
                src="/images/reated-panda-bg.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src="/images/sample-panda.png"
                alt={name}
                className="relative z-10 w-full h-full object-cover"
              />
            </div>
          </CardFrame>
        </div>

        {/* Info */}
        <div className="relative z-10 flex-1">
          <h3 className="text-gray-900 font-bold text-sm sm:text-base">{name}</h3>
          <p className="text-gray-600 text-[10px] sm:text-xs">
            Points:{" "}
            <span className="text-yellow-600 font-bold">
              {points.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Battle Button */}
        <div className="relative z-10">
          <Button variant="danger" size="sm" onClick={onBattle}>
            Battle
          </Button>
        </div>
      </div>
    </CardFrame>
  );
}
