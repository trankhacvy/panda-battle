'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { OpponentPanda } from '@/lib/mock/battles';

interface OpponentCarouselProps {
  opponents: OpponentPanda[];
  onSelectOpponent: (opponent: OpponentPanda) => void;
  className?: string;
}

export default function OpponentCarousel({
  opponents,
  onSelectOpponent,
  className,
}: OpponentCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedOpponent = opponents[selectedIndex];

  const handleSelectCard = (index: number) => {
    setSelectedIndex(index);
    onSelectOpponent(opponents[index]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bamboo':
        return 'from-black/20 to-gray-800/20';
      case 'red':
        return 'from-red-500/20 to-orange-500/20';
      case 'giant':
        return 'from-amber-700/20 to-yellow-700/20';
      case 'snow':
        return 'from-cyan-400/20 to-blue-500/20';
      default:
        return 'from-gray-500/20 to-gray-700/20';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'bamboo':
        return '🎋';
      case 'red':
        return '🔴';
      case 'giant':
        return '🏔️';
      case 'snow':
        return '❄️';
      default:
        return '🐼';
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Selected Opponent Details */}
      <div
        className={cn(
          'rounded-lg border border-border bg-gradient-to-br',
          getTypeColor(selectedOpponent.type),
          'backdrop-blur-sm p-6'
        )}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Panda Display */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">{getTypeEmoji(selectedOpponent.type)}</div>
            <h2 className="text-2xl font-bold text-center">{selectedOpponent.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Power: {selectedOpponent.power}/100
            </p>
            <p className="text-sm text-muted-foreground">
              Risk: {'⭐'.repeat(selectedOpponent.risk)}
            </p>
          </div>

          {/* Right: Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Attack
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{
                    width: `${selectedOpponent.attributes.attack}%`,
                  }}
                />
              </div>
              <p className="text-sm font-semibold">
                {selectedOpponent.attributes.attack}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Defense
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${selectedOpponent.attributes.defense}%`,
                  }}
                />
              </div>
              <p className="text-sm font-semibold">
                {selectedOpponent.attributes.defense}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Speed
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{
                    width: `${selectedOpponent.attributes.speed}%`,
                  }}
                />
              </div>
              <p className="text-sm font-semibold">
                {selectedOpponent.attributes.speed}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Intellect
              </p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{
                    width: `${selectedOpponent.attributes.intellect}%`,
                  }}
                />
              </div>
              <p className="text-sm font-semibold">
                {selectedOpponent.attributes.intellect}
              </p>
            </div>
          </div>
        </div>

        {/* Last Match Info */}
        {selectedOpponent.lastMatch && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Last match: {selectedOpponent.lastMatch.result === 'win' ? '✅' : '❌'}{' '}
              vs {selectedOpponent.lastMatch.opponentName}
            </p>
          </div>
        )}
      </div>

      {/* Carousel Scroll Container */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">
          Choose your opponent
        </p>
        <div
          className={cn(
            'flex gap-3 overflow-x-auto pb-2',
            'snap-x snap-mandatory scroll-smooth'
          )}
        >
          {opponents.map((opponent, index) => (
            <button
              key={opponent.id}
              onClick={() => handleSelectCard(index)}
              className={cn(
                'flex-shrink-0 p-3 rounded-lg border-2 transition-all',
                'snap-center cursor-pointer',
                'hover:scale-105 active:scale-95',
                selectedIndex === index
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border bg-muted/50 hover:border-primary/50'
              )}
              aria-label={`Select ${opponent.name}`}
              aria-pressed={selectedIndex === index}
            >
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <span className="text-3xl">{getTypeEmoji(opponent.type)}</span>
                <span className="text-xs font-semibold text-center truncate w-full">
                  {opponent.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  PWR {opponent.power}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Button */}
      <button
        onClick={() => onSelectOpponent(selectedOpponent)}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-semibold',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'active:scale-95 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
        )}
        aria-label={`Challenge ${selectedOpponent.name}`}
      >
        Challenge {selectedOpponent.name}
      </button>
    </div>
  );
}
