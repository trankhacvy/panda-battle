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
      className={`${getCardBackground()} backdrop-blur rounded-xl p-3 flex items-center gap-3 ${borderColor} relative overflow-hidden`}
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
      <div className="relative z-10 flex items-center gap-3 w-full">
        {/* Rank */}
        <div className="flex flex-col items-center w-8">
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
    </div>
  );
}
