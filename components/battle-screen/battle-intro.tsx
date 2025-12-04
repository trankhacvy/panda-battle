import { Button } from "@/components/ui/button";

export function BattleIntro({
  show,
  onStart,
}: {
  show: boolean;
  onStart?: () => void;
}) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="text-6xl animate-bounce">⚔️</div>
        <h1
          className="text-5xl font-black animate-pulse"
          style={{
            color: "#FFD700",
            textShadow:
              "0 0 30px rgba(255,215,0,0.8), 4px 4px 0 rgba(0,0,0,0.8)",
            WebkitTextStroke: "2px #000",
          }}
        >
          BATTLE START!
        </h1>
        {onStart && (
          <Button
            onClick={onStart}
            variant="secondary"
            size="lg"
            className="mt-6"
          >
            TAP TO START!
          </Button>
        )}
      </div>
    </div>
  );
}
