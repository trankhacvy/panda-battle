'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { PANDA_ARCHETYPES } from '@/lib/mock/pandas';

interface PandaStats {
  attack: number;
  defense: number;
  speed: number;
  intellect: number;
}

interface AttributePanelProps {
  stats: PandaStats;
  stance: 'offensive' | 'balanced' | 'defensive';
  clanAffinity: string;
  lockedAttributes: Set<string>;
  onStanceChange: (stance: 'offensive' | 'balanced' | 'defensive') => void;
  onClanAffinityChange: (clan: string) => void;
  onAttributeLockToggle: (attribute: string) => void;
  onRandomize: () => void;
  rollHistory: PandaStats[];
}

export default function AttributePanel({
  stance,
  clanAffinity,
  lockedAttributes,
  onStanceChange,
  onClanAffinityChange,
  onAttributeLockToggle,
  onRandomize,
  rollHistory,
}: AttributePanelProps) {
  const [isRandomizing, setIsRandomizing] = useState(false);

  const handleRandomize = async () => {
    setIsRandomizing(true);
    // Simulate randomization animation
    await new Promise((resolve) => setTimeout(resolve, 300));
    onRandomize();
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsRandomizing(false);
  };

  const uniqueClans = Array.from(
    new Set(Object.values(PANDA_ARCHETYPES).map((a) => a.clan))
  ).sort();

  const stances = [
    { value: 'offensive', label: 'Offensive', emoji: '⚔️' },
    { value: 'balanced', label: 'Balanced', emoji: '⚖️' },
    { value: 'defensive', label: 'Defensive', emoji: '🛡️' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Stance Selector */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">BATTLE STANCE</h3>
        <div className="flex gap-2">
          {stances.map((s) => (
            <button
              key={s.value}
              onClick={() => onStanceChange(s.value)}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200',
                'border-2 text-center',
                stance === s.value
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200'
                  : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
              )}
            >
              <span className="text-lg mr-1">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clan Affinity Selector */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">CLAN AFFINITY</h3>
        <div className="grid grid-cols-2 gap-2">
          {uniqueClans.map((clan) => (
            <button
              key={clan}
              onClick={() => onClanAffinityChange(clan)}
              className={cn(
                'py-2 px-3 rounded-lg font-semibold transition-all duration-200',
                'border-2 text-sm text-center',
                clanAffinity === clan
                  ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                  : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
              )}
            >
              {clan}
            </button>
          ))}
        </div>
      </div>

      {/* Attribute Lock Controls */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">LOCK ATTRIBUTES</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['attack', 'defense', 'speed', 'intellect'] as const).map((attr) => (
            <button
              key={attr}
              onClick={() => onAttributeLockToggle(attr)}
              className={cn(
                'py-2 px-3 rounded-lg font-semibold transition-all duration-200',
                'border-2 text-sm text-center',
                lockedAttributes.has(attr)
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-200'
                  : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
              )}
            >
              {lockedAttributes.has(attr) ? '🔒' : '🔓'} {attr}
            </button>
          ))}
        </div>
      </div>

      {/* Randomize Button */}
      <button
        onClick={handleRandomize}
        disabled={isRandomizing}
        className={cn(
          'w-full py-4 px-6 rounded-lg font-bold text-lg',
          'transition-all duration-300 transform',
          'bg-gradient-to-r from-cyan-600 to-blue-600',
          'hover:from-cyan-500 hover:to-blue-500',
          'text-white shadow-lg',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isRandomizing && 'scale-95'
        )}
      >
        <span className="inline-block mr-2">🎲</span>
        {isRandomizing ? 'RANDOMIZING...' : 'RANDOMIZE STATS'}
      </button>

      {/* History Carousel */}
      {rollHistory.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">
            ROLL HISTORY ({rollHistory.length})
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
            {rollHistory.slice(0, 3).map((roll, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gray-800/50 rounded-lg p-3 border border-gray-700 snap-start"
              >
                <p className="text-xs text-gray-400 mb-2">
                  #{rollHistory.length - index}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">ATK</span>
                    <span className="text-blue-400 font-bold">
                      {roll.attack.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">DEF</span>
                    <span className="text-green-400 font-bold">
                      {roll.defense.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">SPD</span>
                    <span className="text-yellow-400 font-bold">
                      {roll.speed.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">INT</span>
                    <span className="text-purple-400 font-bold">
                      {roll.intellect.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
