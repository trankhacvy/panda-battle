'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BattleEvent, ReplayBattle } from '@/lib/mock/battles';

interface BattleReplayProps {
  battle: ReplayBattle;
  onReplayComplete?: () => void;
  autoPlay?: boolean;
  className?: string;
}

export default function BattleReplay({
  battle,
  onReplayComplete,
  autoPlay = true,
  className,
}: BattleReplayProps) {
  const [displayedEvents, setDisplayedEvents] = useState<BattleEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Progress calculation
  useEffect(() => {
    if (!isPlaying) return;

    const totalDuration = battle.duration;
    let elapsedTime = 0;
    const startTime = Date.now();

    const updateProgress = () => {
      elapsedTime = Date.now() - startTime;
      const newProgress = Math.min((elapsedTime / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        setIsPlaying(false);
        if (onReplayComplete) {
          onReplayComplete();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, battle.duration, onReplayComplete]);

  // Event reveal logic
  useEffect(() => {
    if (!isPlaying) return;

    const currentTime = (progress / 100) * battle.duration;
    const newDisplayedEvents = battle.events.filter(
      (event) => event.timestamp <= currentTime
    );

    setDisplayedEvents(newDisplayedEvents);

    // Play sound effect when new event appears (if desired)
    if (newDisplayedEvents.length > displayedEvents.length) {
      // Event revealed sound could go here
    }
  }, [progress, isPlaying, battle.events, battle.duration, displayedEvents.length]);

  const handleReplay = () => {
    cleanup();
    setDisplayedEvents([]);
    setProgress(0);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getEventColor = (eventType: BattleEvent['type']) => {
    switch (eventType) {
      case 'attack':
        return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'defend':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'damage':
        return 'from-red-600/20 to-red-700/20 border-red-600/30';
      case 'stance_change':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'victory':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'defeat':
        return 'from-gray-600/20 to-gray-700/20 border-gray-600/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Battle Replay</h3>
        <p className="text-sm text-muted-foreground">
          {battle.playerPanda.name} vs {battle.opponentPanda.name}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div
          className="h-2 bg-muted rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPercent = ((e.clientX - rect.left) / rect.width) * 100;
            setProgress(clickPercent);
            setIsPlaying(true);
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Battle replay progress"
        >
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handlePlayPause}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg font-semibold transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
            'active:scale-95',
            isPlaying
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={handleReplay}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg font-semibold transition-all',
            'bg-muted text-foreground hover:bg-muted/80 border border-border',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
            'active:scale-95'
          )}
          aria-label="Replay from beginning"
        >
          🔄 Replay
        </button>
      </div>

      {/* Battle Events Timeline */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {displayedEvents.length === 0 && isPlaying && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Battle starting...</p>
          </div>
        )}

        {displayedEvents.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              'p-3 rounded-lg border bg-gradient-to-r animate-in fade-in slide-in-from-bottom-2',
              'transition-all duration-300',
              getEventColor(event.type)
            )}
            role="article"
            aria-label={event.description}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="text-xl flex-shrink-0">{event.icon}</span>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold break-words">
                  {event.description}
                </p>
                {event.damageDealt && event.damageDealt > 0 && (
                  <p
                    className={cn(
                      'text-xs mt-1 font-bold',
                      event.type === 'damage'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-orange-600 dark:text-orange-400'
                    )}
                  >
                    -{event.damageDealt} HP
                  </p>
                )}
              </div>

              {/* Event Counter */}
              <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">
                #{index + 1}
              </span>
            </div>
          </div>
        ))}

        {/* Final Result */}
        {displayedEvents.some((e) => e.type === 'victory' || e.type === 'defeat') && (
          <div
            className={cn(
              'p-4 rounded-lg border-2 bg-gradient-to-r font-semibold text-center',
              'animate-in fade-in scale-in',
              battle.winner === 'player'
                ? 'from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-700 dark:text-green-400'
                : 'from-red-500/20 to-orange-500/20 border-red-500/50 text-red-700 dark:text-red-400'
            )}
            role="status"
            aria-live="assertive"
          >
            {battle.winner === 'player'
              ? `🏆 ${battle.playerPanda.name} Wins!`
              : `💔 ${battle.opponentPanda.name} Wins!`}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {displayedEvents.some((e) => e.type === 'victory' || e.type === 'defeat') && (
        <div className="grid grid-cols-2 gap-2 text-sm p-3 bg-muted/50 rounded-lg border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Total Events</p>
            <p className="font-semibold">{displayedEvents.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-semibold">{(battle.duration / 1000).toFixed(1)}s</p>
          </div>
        </div>
      )}
    </div>
  );
}
