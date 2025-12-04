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
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
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
  return (
    <CardFrame size="md" className={`w-full relative`}>
      <div className="rounded-[1.125rem] p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 bg-white relative overflow-hidden">
        {/* Background pattern for top 3 */}
        {rank <= 3 && (
          <div className="absolute inset-0 opacity-80">
            <div
              className="absolute inset-0"
              style={{
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
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
          <div className="w-10 sm:w-14 h-10 sm:h-14 relative">
            <img
              src="/images/sample-panda.png"
              alt={name}
              className="relative z-10 w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="relative z-10 flex-1">
          <h3 className="text-gray-900 font-bold text-sm sm:text-base">
            {name}
          </h3>
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
