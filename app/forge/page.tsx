'use client';

import React, { useState, useCallback } from 'react';
import PandaCard from '@/components/forge/PandaCard';
import AttributePanel from '@/components/forge/AttributePanel';
import {
  rollRandomStats,
  rollRandomArchetype,
  calculateRarity,
  PandaRarity,
} from '@/lib/mock/pandas';

interface PandaStats {
  attack: number;
  defense: number;
  speed: number;
  intellect: number;
}

export default function ForgePage() {
  // Initialize with random archetype
  const randomArchetype = rollRandomArchetype();

  const [pandaName, setPandaName] = useState('');
  const [stats, setStats] = useState<PandaStats>(() => ({
    ...randomArchetype.baseStats,
    ...rollRandomStats(),
  }));
  const [stance, setStance] = useState<'offensive' | 'balanced' | 'defensive'>(
    'balanced'
  );
  const [clanAffinity, setClanAffinity] = useState(randomArchetype.clan);
  const [lockedAttributes, setLockedAttributes] = useState<Set<string>>(
    new Set()
  );
  const [rollHistory, setRollHistory] = useState<PandaStats[]>([]);

  const currentRarity: PandaRarity = calculateRarity(stats);

  const handleRandomize = useCallback(() => {
    setRollHistory((prev) => [stats, ...prev.slice(0, 2)]);

    const newStats = rollRandomStats();
    const finalStats: PandaStats = {
      attack: lockedAttributes.has('attack') ? stats.attack : newStats.attack,
      defense: lockedAttributes.has('defense')
        ? stats.defense
        : newStats.defense,
      speed: lockedAttributes.has('speed') ? stats.speed : newStats.speed,
      intellect: lockedAttributes.has('intellect')
        ? stats.intellect
        : newStats.intellect,
    };

    setStats(finalStats);
  }, [stats, lockedAttributes]);

  const handleAttributeLockToggle = (attribute: string) => {
    setLockedAttributes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attribute)) {
        newSet.delete(attribute);
      } else {
        newSet.add(attribute);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-2">
          🔨 Forge Your Panda
        </h1>
        <p className="text-lg text-gray-400">
          Create a unique panda with custom traits and powerful abilities.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Panda Card */}
        <div className="lg:col-span-1">
          <PandaCard
            name={pandaName || randomArchetype.name}
            type={randomArchetype.type}
            rarity={currentRarity}
            stats={stats}
            clan={clanAffinity}
            riskRating={randomArchetype.riskRating}
            abilityText={randomArchetype.abilityText}
            colorPalette={randomArchetype.colorPalette}
          />
        </div>

        {/* Right Column: Controls */}
        <div className="lg:col-span-2">
          {/* Name Input */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              PANDA NAME
            </label>
            <input
              type="text"
              value={pandaName}
              onChange={(e) => setPandaName(e.target.value.slice(0, 20))}
              placeholder={randomArchetype.name}
              maxLength={20}
              className={
                'w-full px-4 py-3 rounded-lg bg-gray-800 border-2 border-gray-700 ' +
                'text-white placeholder-gray-500 font-semibold ' +
                'focus:outline-none focus:border-cyan-500 focus:bg-gray-800 transition-colors'
              }
            />
            <p className="text-xs text-gray-500 mt-2">
              {pandaName.length}/20 characters
            </p>
          </div>

          {/* Attribute Panel */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <AttributePanel
              stats={stats}
              stance={stance}
              clanAffinity={clanAffinity}
              lockedAttributes={lockedAttributes}
              onStanceChange={setStance}
              onClanAffinityChange={setClanAffinity}
              onAttributeLockToggle={handleAttributeLockToggle}
              onRandomize={handleRandomize}
              rollHistory={rollHistory}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 border-t border-gray-800 p-4">
        <button
          onClick={handleRandomize}
          className={
            'w-full py-3 px-4 rounded-lg font-bold text-lg ' +
            'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 ' +
            'text-white shadow-lg'
          }
        >
          🎲 RANDOMIZE
        </button>
      </div>
    </div>
  );
}
