import { useEffect, useRef } from "react";

interface BattleLogProps {
  logs: string[];
  playerName?: string;
  opponentName?: string;
}

export function BattleLog({ logs, playerName = "I_am_Me", opponentName = "Crisis125" }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (logs.length === 0) return null;

  const formatLog = (log: string) => {
    const parts = log.split(/(I_am_Me|Crisis125)/g);
    
    return parts.map((part, index) => {
      if (part === playerName) {
        return (
          <span key={index} className="text-green-400 font-bold">
            {part}
          </span>
        );
      } else if (part === opponentName) {
        return (
          <span key={index} className="text-red-400 font-bold">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex-shrink-0 h-24 px-4 pb-4 flex justify-center">
      <div className="bg-black/60 backdrop-blur-sm border-2 border-white/40 rounded-lg px-4 py-2 max-w-md w-full">
        <div 
          ref={scrollRef}
          className="h-16 overflow-y-auto space-y-0.5 scroll-smooth"
        >
          {logs.map((log, index) => (
            <p
              key={`${index}-${log}`}
              className="text-white text-xs font-medium text-center transition-all duration-500 ease-out opacity-0 translate-y-2"
              style={{
                animation: 'slideUpFade 0.5s ease-out forwards',
                animationDelay: `${index === logs.length - 1 ? '0ms' : '0ms'}`
              }}
            >
              {formatLog(log)}
            </p>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
