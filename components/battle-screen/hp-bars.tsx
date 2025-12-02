interface HPBarsProps {
  playerHP: number;
  opponentHP: number;
}

export function HPBars({ playerHP, opponentHP }: HPBarsProps) {
  return (
    <div className="flex-shrink-0 px-3 sm:px-4 pb-2">
      <div className="flex justify-between items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <span className="text-white text-[10px] sm:text-xs font-bold">YOU</span>
            <span className="text-white text-[10px] sm:text-xs">{playerHP}/100</span>
          </div>
          <div className="h-2 sm:h-2.5 bg-black/50 rounded-full overflow-hidden border border-green-500/50">
            <div
              className="h-full bg-linear-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${playerHP}%` }}
            ></div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 justify-end">
            <span className="text-white text-[10px] sm:text-xs">{opponentHP}/100</span>
            <span className="text-white text-[10px] sm:text-xs font-bold">OPPONENT</span>
          </div>
          <div className="h-2 sm:h-2.5 bg-black/50 rounded-full overflow-hidden border border-red-500/50">
            <div
              className="h-full bg-linear-to-r from-red-600 to-red-400 transition-all duration-500 ml-auto"
              style={{ width: `${opponentHP}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
