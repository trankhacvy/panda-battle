'use client';

import React, { useState } from 'react';
import { battleStances } from '@/lib/mock/game';

interface QuickBattleCardProps {
  className?: string;
}

export default function QuickBattleCard({ className = '' }: QuickBattleCardProps) {
  const [selectedStance, setSelectedStance] = useState<string>(battleStances[1].id);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSwipeIndex, setActiveSwipeIndex] = useState(1);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleStancePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    stanceId: string
  ) => {
    const startX = e.clientX;
    const containerRect = e.currentTarget.parentElement?.getBoundingClientRect();

    if (!containerRect) return;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentX = moveEvent.clientX;
      const diff = currentX - startX;

      // Limit swipe offset
      const maxOffset = 50;
      const newOffset = Math.max(-maxOffset, Math.min(maxOffset, diff));
      setSwipeOffset(newOffset);

      // Determine which stance to activate based on swipe
      if (Math.abs(diff) > 20) {
        if (diff > 30) {
          // Swiped right - move to previous
          const currentIndex = battleStances.findIndex((s) => s.id === stanceId);
          if (currentIndex > 0) {
            setSelectedStance(battleStances[currentIndex - 1].id);
            setActiveSwipeIndex(currentIndex - 1);
          }
        } else if (diff < -30) {
          // Swiped left - move to next
          const currentIndex = battleStances.findIndex((s) => s.id === stanceId);
          if (currentIndex < battleStances.length - 1) {
            setSelectedStance(battleStances[currentIndex + 1].id);
            setActiveSwipeIndex(currentIndex + 1);
          }
        }
      }
    };

    const handlePointerUp = () => {
      setSwipeOffset(0);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleBattleNow = async () => {
    setIsLoading(true);
    setShowSuccess(false);

    // Simulate 2 second loading
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setShowSuccess(true);

    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const selectedStanceObj = battleStances.find((s) => s.id === selectedStance);

  return (
    <div
      className={`rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8 overflow-hidden ${className}`}
    >
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.5), inset 0 0 20px rgba(76, 175, 80, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(76, 175, 80, 0.8), inset 0 0 30px rgba(76, 175, 80, 0.2);
          }
        }

        .glow-button {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes chip-slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(var(--slide-distance, 0px));
          }
        }

        .chip-container {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stance-chip {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: grab;
          user-select: none;
        }

        .stance-chip:active {
          cursor: grabbing;
        }
      `}</style>

      {/* Hero Text */}
      <div className="mb-6 md:mb-8 text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Ready for Battle?</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Choose your battle stance and enter the arena
        </p>
      </div>

      {/* Stance Selector with Swipe */}
      <div className="mb-8 space-y-3">
        <label className="text-sm font-medium text-muted-foreground block">
          Select Battle Stance
        </label>

        <div className="chip-container" role="group" aria-label="Battle stances">
          {battleStances.map((stance, idx) => (
            <button
              key={stance.id}
              onPointerDown={(e) => handleStancePointerDown(e, stance.id)}
              onClick={() => {
                setSelectedStance(stance.id);
                setActiveSwipeIndex(idx);
              }}
              className={`stance-chip px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                selectedStance === stance.id
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105 border-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
              }`}
              style={{
                transform:
                  activeSwipeIndex === idx ? `translateX(${swipeOffset}px)` : undefined,
              }}
              aria-pressed={selectedStance === stance.id}
            >
              <span className="mr-1">{stance.emoji}</span>
              {stance.label}
            </button>
          ))}
        </div>

        {selectedStanceObj && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm">
            <span className="text-lg">{selectedStanceObj.emoji}</span>
            <span className="text-primary font-medium">
              {selectedStanceObj.label} stance selected
            </span>
          </div>
        )}
      </div>

      {/* Battle Now Button with Glow */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleBattleNow}
          disabled={isLoading || showSuccess}
          className={`glow-button relative w-full md:w-auto px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 ${
            isLoading || showSuccess
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
              Preparing Battle...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <span>✓ Battle Ready!</span>
            </span>
          ) : (
            '⚔️ Battle Now'
          )}
        </button>

        {showSuccess && (
          <p className="text-sm text-primary font-medium animate-pulse">
            Your battle is ready. Check the Battle Arena tab to begin!
          </p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        💡 Tip: Drag stance chips left or right to quickly swap stances
      </p>
    </div>
  );
}
