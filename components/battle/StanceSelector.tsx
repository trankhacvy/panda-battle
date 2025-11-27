'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export type BattleStance = 'offensive' | 'defensive' | 'stealth';

interface StanceOption {
  id: BattleStance;
  label: string;
  emoji: string;
  description: string;
  attributeBonus: {
    attack: number;
    defense: number;
    speed: number;
  };
  color: string;
  bonusLabel: string;
}

const STANCE_OPTIONS: StanceOption[] = [
  {
    id: 'offensive',
    label: 'Offensive',
    emoji: '🔥',
    description: 'Increase attack power',
    attributeBonus: {
      attack: 25,
      defense: -10,
      speed: 0,
    },
    color: 'from-red-500 to-orange-500',
    bonusLabel: '+25% ATK, -10% DEF',
  },
  {
    id: 'defensive',
    label: 'Defensive',
    emoji: '🛡️',
    description: 'Increase defense',
    attributeBonus: {
      attack: -10,
      defense: 30,
      speed: -5,
    },
    color: 'from-blue-500 to-cyan-500',
    bonusLabel: '-10% ATK, +30% DEF',
  },
  {
    id: 'stealth',
    label: 'Stealth',
    emoji: '👻',
    description: 'Increase speed',
    attributeBonus: {
      attack: 0,
      defense: 0,
      speed: 25,
    },
    color: 'from-purple-500 to-pink-500',
    bonusLabel: '+25% SPD',
  },
];

interface StanceSelectorProps {
  onSelectStance: (stance: BattleStance) => void;
  disabled?: boolean;
  className?: string;
}

export default function StanceSelector({
  onSelectStance,
  disabled = false,
  className,
}: StanceSelectorProps) {
  const [selectedStance, setSelectedStance] = useState<BattleStance | null>(null);

  const handleStanceSelect = (stance: BattleStance) => {
    if (!disabled) {
      setSelectedStance(stance);
      onSelectStance(stance);
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Battle Stance</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Each stance modifies your attributes. Choose wisely!
        </p>
      </div>

      {/* Stance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STANCE_OPTIONS.map((stance) => (
          <button
            key={stance.id}
            onClick={() => handleStanceSelect(stance.id)}
            disabled={disabled}
            className={cn(
              'relative group p-6 rounded-lg border-2 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selectedStance === stance.id
                ? 'border-primary bg-gradient-to-br ' + stance.color + '/20 scale-105'
                : 'border-border bg-muted/50 hover:border-primary/50 hover:scale-[1.02]',
              'active:scale-95'
            )}
            aria-label={`${stance.label} stance - ${stance.description}`}
            aria-pressed={selectedStance === stance.id}
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{stance.emoji}</span>
              {selectedStance === stance.id && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                  ✓
                </span>
              )}
            </div>

            {/* Title and Description */}
            <h4 className="font-semibold text-left">{stance.label}</h4>
            <p className="text-xs text-muted-foreground mt-1 text-left">
              {stance.description}
            </p>

            {/* Attribute Modifications */}
            <div className="mt-4 space-y-2 text-left">
              {/* Attack Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Attack
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      stance.attributeBonus.attack > 0
                        ? 'text-green-600 dark:text-green-400'
                        : stance.attributeBonus.attack < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {stance.attributeBonus.attack > 0 ? '+' : ''}
                    {stance.attributeBonus.attack}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      stance.attributeBonus.attack > 0
                        ? 'bg-red-500'
                        : 'bg-red-200 dark:bg-red-900'
                    )}
                    style={{
                      width: `${50 + (stance.attributeBonus.attack / 2)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Defense Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Defense
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      stance.attributeBonus.defense > 0
                        ? 'text-green-600 dark:text-green-400'
                        : stance.attributeBonus.defense < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {stance.attributeBonus.defense > 0 ? '+' : ''}
                    {stance.attributeBonus.defense}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      stance.attributeBonus.defense > 0
                        ? 'bg-blue-500'
                        : 'bg-blue-200 dark:bg-blue-900'
                    )}
                    style={{
                      width: `${50 + (stance.attributeBonus.defense / 2)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Speed Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Speed
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      stance.attributeBonus.speed > 0
                        ? 'text-green-600 dark:text-green-400'
                        : stance.attributeBonus.speed < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {stance.attributeBonus.speed > 0 ? '+' : ''}
                    {stance.attributeBonus.speed}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      stance.attributeBonus.speed > 0
                        ? 'bg-yellow-500'
                        : 'bg-yellow-200 dark:bg-yellow-900'
                    )}
                    style={{
                      width: `${50 + (stance.attributeBonus.speed / 2)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bonus Label */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p
                className={cn(
                  'text-xs font-semibold text-center',
                  selectedStance === stance.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {stance.bonusLabel}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selectedStance && (
        <div
          className={cn(
            'p-3 rounded-lg bg-primary/10 border border-primary/20',
            'text-sm text-primary font-medium'
          )}
          role="status"
          aria-live="polite"
        >
          ✓ Stance selected: {STANCE_OPTIONS.find((s) => s.id === selectedStance)?.label}
        </div>
      )}
    </div>
  );
}
