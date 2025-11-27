'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import OpponentCarousel from '@/components/battle/OpponentCarousel';
import StanceSelector from '@/components/battle/StanceSelector';
import BattleReplay from '@/components/battle/BattleReplay';
import {
  mockOpponents,
  generateMockBattleReplay,
  OpponentPanda,
  ReplayBattle,
} from '@/lib/mock/battles';
import type { BattleStance } from '@/components/battle/StanceSelector';

type BattlePhase = 'opponent-select' | 'stance-select' | 'battle-replay' | 'battle-complete';

const DEFAULT_PLAYER_PANDA: OpponentPanda = {
  id: 'player_panda_1',
  name: 'Your Panda',
  type: 'bamboo',
  power: 50,
  risk: 5,
  favoriteStance: 'offensive',
  baseHP: 125,
  attributes: {
    attack: 70,
    defense: 65,
    speed: 75,
    intellect: 60,
  },
  colorPalette: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#4CAF50',
  },
};

export default function BattlePage() {
  const [phase, setPhase] = useState<BattlePhase>('opponent-select');
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentPanda | null>(null);
  const [selectedStance, setSelectedStance] = useState<BattleStance | null>(null);
  const [currentBattle, setCurrentBattle] = useState<ReplayBattle | null>(null);
  const [isStartingBattle, setIsStartingBattle] = useState(false);

  const handleSelectOpponent = (opponent: OpponentPanda) => {
    setSelectedOpponent(opponent);
  };

  const handleSelectStance = (stance: BattleStance) => {
    setSelectedStance(stance);
  };

  const handleStartBattle = () => {
    if (!selectedOpponent || !selectedStance) return;

    setIsStartingBattle(true);

    // Simulate battle start delay
    const timeoutId = setTimeout(() => {
      const battle = generateMockBattleReplay(DEFAULT_PLAYER_PANDA, selectedOpponent);
      setCurrentBattle(battle);
      setPhase('battle-replay');
      setIsStartingBattle(false);
    }, 1500);

    return () => clearTimeout(timeoutId);
  };

  const handleBattleComplete = () => {
    setPhase('battle-complete');
  };

  const handleBattleAgain = () => {
    setPhase('opponent-select');
    setSelectedOpponent(null);
    setSelectedStance(null);
    setCurrentBattle(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">⚔️ Battle Arena</h1>
          <p className="text-muted-foreground">
            {phase === 'opponent-select' && 'Choose your opponent'}
            {phase === 'stance-select' &&
              selectedOpponent &&
              `Face ${selectedOpponent.name} - Select your stance`}
            {phase === 'battle-replay' && 'Watch the battle unfold'}
            {phase === 'battle-complete' &&
              currentBattle &&
              (currentBattle.winner === 'player'
                ? '🏆 Victory!'
                : '💔 Defeat')}
          </p>
        </div>

        {/* Phase: Opponent Selection */}
        {phase === 'opponent-select' && (
          <div className="space-y-6">
            <OpponentCarousel
              opponents={mockOpponents}
              onSelectOpponent={(opponent) => {
                handleSelectOpponent(opponent);
                setPhase('stance-select');
              }}
            />
          </div>
        )}

        {/* Phase: Stance Selection */}
        {phase === 'stance-select' && selectedOpponent && (
          <div className="space-y-6">
            {/* Selected Opponent Info */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                ← Back to opponent selection:{' '}
                <button
                  onClick={() => setPhase('opponent-select')}
                  className="text-primary font-semibold hover:underline"
                  aria-label="Go back to opponent selection"
                >
                  Choose different opponent
                </button>
              </p>
            </div>

            {/* Stance Selector */}
            <StanceSelector
              onSelectStance={handleSelectStance}
              disabled={isStartingBattle}
            />

            {/* Start Battle Button */}
            {selectedStance && (
              <div className="space-y-3">
                <button
                  onClick={handleStartBattle}
                  disabled={isStartingBattle || !selectedStance}
                  className={cn(
                    'w-full py-4 px-4 rounded-lg font-bold text-lg',
                    'transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
                    isStartingBattle
                      ? 'bg-primary/50 text-primary-foreground cursor-wait'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 active:scale-95'
                  )}
                  aria-label="Start battle with selected stance"
                >
                  {isStartingBattle ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block animate-spin">⚡</span>
                      Initializing Battle...
                    </span>
                  ) : (
                    'Start Battle'
                  )}
                </button>

                {selectedStance && (
                  <p className="text-xs text-muted-foreground text-center">
                    Stance: {selectedStance.charAt(0).toUpperCase() + selectedStance.slice(1)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phase: Battle Replay */}
        {phase === 'battle-replay' && currentBattle && (
          <div className="space-y-6">
            <BattleReplay
              battle={currentBattle}
              onReplayComplete={handleBattleComplete}
              autoPlay={true}
            />
          </div>
        )}

        {/* Phase: Battle Complete */}
        {phase === 'battle-complete' && currentBattle && (
          <div className="space-y-6">
            {/* Result Card */}
            <div
              className={cn(
                'p-8 rounded-lg border-2 bg-gradient-to-br text-center space-y-4',
                currentBattle.winner === 'player'
                  ? 'from-green-500/20 to-emerald-500/20 border-green-500/50'
                  : 'from-red-500/20 to-orange-500/20 border-red-500/50'
              )}
            >
              <div className="text-5xl">
                {currentBattle.winner === 'player' ? '🏆' : '💔'}
              </div>
              <h2
                className={cn(
                  'text-3xl font-bold',
                  currentBattle.winner === 'player'
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                )}
              >
                {currentBattle.winner === 'player' ? 'Victory!' : 'Defeat'}
              </h2>
              <p className="text-muted-foreground">
                vs {currentBattle.opponentPanda.name}
              </p>

              {/* Rewards Info */}
              {currentBattle.winner === 'player' && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-lg font-bold">+50 XP</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      +25
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleBattleAgain}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-semibold transition-all',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
                )}
                aria-label="Start another battle"
              >
                Battle Again
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-semibold transition-all',
                  'bg-muted text-foreground hover:bg-muted/80 border border-border',
                  'active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
                )}
                aria-label="Return to home"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
