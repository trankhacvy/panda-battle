'use client';

import React, { useState, useEffect } from 'react';
import { mockTurnData, mockUserStats } from '@/lib/mock/game';

interface TurnCounterProps {
  className?: string;
}

export default function TurnCounter({ className = '' }: TurnCounterProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const diff = mockTurnData.nextResetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeRemaining({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const turnPercentage = (mockTurnData.remainingTurns / mockTurnData.maxTurns) * 100;
  const isCritical = mockTurnData.remainingTurns <= 2;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 ${className}`}
    >
      {/* Remaining Turns Card */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-5 hover:border-primary/50 transition-colors duration-200">
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Battle Turns
          </p>
          <p className="text-2xl md:text-3xl font-bold text-primary">
            {mockTurnData.remainingTurns}/{mockTurnData.maxTurns}
          </p>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCritical ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${turnPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isCritical && '⚠️ Low turns! '}
          Use wisely
        </p>
      </div>

      {/* Next Reset Timer Card */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-5 hover:border-primary/50 transition-colors duration-200">
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Next Reset In
          </p>
          <div className="text-2xl md:text-3xl font-bold text-primary">
            <span className="tabular-nums">
              {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Gains {mockTurnData.turnsRegeneratePerHour} turns/hour
        </p>
      </div>

      {/* Streak Pill Card */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-5 hover:border-primary/50 transition-colors duration-200">
        <div className="mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Win Streak
          </p>
          <p className="text-2xl md:text-3xl font-bold">
            <span className="text-yellow-500">🔥</span> {mockUserStats.currentStreak}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Keep it up! {mockUserStats.totalWins} total wins
        </p>
      </div>
    </div>
  );
}
