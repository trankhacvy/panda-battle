'use client';

import React from 'react';
import { mockPoolData } from '@/lib/mock/game';

interface PoolTickerProps {
  className?: string;
}

export default function PoolTicker({ className = '' }: PoolTickerProps) {

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  };

  const tickerItems = [...mockPoolData, ...mockPoolData]; // Repeat for seamless loop

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg border border-primary/20 py-4 ${className}`}>
      <style>{`
        @keyframes scroll-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-container {
          animation: scroll-ticker 60s linear infinite;
        }

        .ticker-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="ticker-container flex gap-6 px-4 whitespace-nowrap"
        role="region"
        aria-live="polite"
        aria-label="Live pool ticker"
      >
        {tickerItems.map((pool, idx) => (
          <div
            key={`${pool.id}-${idx}`}
            className="flex-shrink-0 inline-flex items-center gap-4 px-4 py-2 bg-background/50 rounded-full border border-border hover:border-primary/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-primary">{pool.name}</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                🏦 {formatNumber(pool.rewardPool)}
              </span>
              <span className="hidden md:inline text-xs text-muted-foreground">
                👥 {pool.participantCount}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
