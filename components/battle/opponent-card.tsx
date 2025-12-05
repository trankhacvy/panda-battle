import type { OpponentPanda } from "@/lib/mock/battles";
import { Button } from "../ui/button";
import { CardFrame } from "../ui/card-frame";
import { Badge } from "../ui/badge";

interface OpponentCardProps {
  opponent: OpponentPanda;
  onBattle?: () => void;
}

export function OpponentCard({ opponent, onBattle }: OpponentCardProps) {
  return (
    <CardFrame size="md" className="w-full">
      <div className="rounded-[1.125rem] p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 bg-white">
        {/* Avatar */}
        <div className="w-14 sm:w-16 h-14 sm:h-16 relative overflow-hidden">
          <img
            src="/images/sample-panda.png"
            alt={opponent.name}
            className="relative w-full h-auto object-cover"
          />
        </div>

        {/* Stats */}
        <div className="flex-1">
          <h3 className="text-gray-900 font-bold text-sm sm:text-base mb-1">
            {opponent.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            <Badge variant="destructive" size="sm">
              💪 {opponent.attributes.strength}
            </Badge>
            <Badge variant="info" size="sm">
              ⚡ {opponent.attributes.speed}
            </Badge>
            <Badge variant="secondary" size="sm">
              🧠 {opponent.attributes.luck}
            </Badge>
          </div>
        </div>

        <Button size="sm" variant="destructive" onClick={onBattle}>
          Battle
        </Button>
      </div>
    </CardFrame>
  );
}
