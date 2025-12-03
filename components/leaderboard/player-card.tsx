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

  return (
    <div
      className={`${getCardBackground()} backdrop-blur rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 ${borderColor} relative overflow-hidden`}
    >
      {/* Background pattern for top 3 */}
      {rank <= 3 && (
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${getBackgroundImage()})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 w-full">
        {/* Rank */}
        <div className="flex flex-col items-center w-6 sm:w-8">
          <span className="text-white font-bold text-base sm:text-lg">{rank}.</span>
        </div>

        {/* Avatar */}
        <CardFrame size="sm" className="shrink-0">
          <div className="w-12 sm:w-16 h-12 sm:h-16 relative overflow-hidden">
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

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-base sm:text-lg">{name}</h3>
          <p className="text-white/80 text-xs sm:text-sm">
            Points:{" "}
            <span className="text-yellow-400 font-bold">
              {points.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Battle Button */}
        <Button variant="danger" size="sm" onClick={onBattle}>
          Battle
        </Button>
      </div>
    </div>
  );
}
