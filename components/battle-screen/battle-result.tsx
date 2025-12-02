import { Button3D } from "@/components/ui/button-3d";

interface BattleResultProps {
  isPlayerWin: boolean;
  onBackToHome: () => void;
}

export function BattleResult({ isPlayerWin, onBackToHome }: BattleResultProps) {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="text-center space-y-4 animate-in zoom-in-95 duration-500 px-4">
        <div className="text-7xl animate-bounce">{isPlayerWin ? "🏆" : "💀"}</div>
        <h2
          className="text-4xl font-black drop-shadow-lg"
          style={{
            color: isPlayerWin ? "#FFD700" : "#FF4757",
            textShadow: "0 0 20px rgba(255,215,0,0.8), 4px 4px 0 rgba(0,0,0,0.8)",
            WebkitTextStroke: "2px #000",
          }}
        >
          {isPlayerWin ? "VICTORY!" : "DEFEAT!"}
        </h2>
        <p className="text-white text-lg font-semibold">
          {isPlayerWin ? "You Won the Battle!" : "Better Luck Next Time!"}
        </p>
        <div className="pt-2">
          <Button3D onClick={onBackToHome} size="3d-sm">
            Back to Home
          </Button3D>
        </div>
      </div>
    </div>
  );
}
