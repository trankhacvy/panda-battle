'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  PandaRarity,
  getRarityColor,
  calculateStealChance,
} from '@/lib/mock/pandas';

interface PandaStats {
  attack: number;
  defense: number;
  speed: number;
  intellect: number;
}

interface PandaCardProps {
  name: string;
  type: 'bamboo' | 'red' | 'giant' | 'snow';
  rarity: PandaRarity;
  stats: PandaStats;
  clan: string;
  riskRating: number;
  abilityText: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isUpdating?: boolean;
}

export default function PandaCard({
  name,
  type,
  rarity,
  stats,
  clan,
  riskRating,
  abilityText,
  colorPalette,
  isUpdating = false,
}: PandaCardProps) {
  const rarityColor = getRarityColor(rarity);
  const stealChance = calculateStealChance(riskRating);

  const getTypeEmoji = (pandaType: string) => {
    const emojis: Record<string, string> = {
      bamboo: '🐼',
      red: '🔴',
      giant: '🦅',
      snow: '❄️',
    };
    return emojis[pandaType] || '🐼';
  };

  const formatStat = (value: number) => String(value).padStart(2, '0');

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300',
        'bg-gradient-to-br from-gray-900 to-black',
        isUpdating && 'animate-pulse'
      )}
    >
      {/* Background gradient accent */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${colorPalette.primary} 0%, ${colorPalette.secondary} 100%)`,
        }}
      />

      {/* Animated rarity border */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl border-2 transition-all duration-300"
        style={{ borderColor: rarityColor }}
      />

      {/* Card content */}
      <div className="relative p-8 space-y-6">
        {/* Header with name and rarity */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              {getTypeEmoji(type)} {name}
            </h2>
            <p className="text-sm text-gray-400">{clan}</p>
          </div>
          <div
            className="px-3 py-1 rounded-full font-bold text-sm"
            style={{
              backgroundColor: rarityColor,
              color: rarity === 'legendary' ? '#000' : '#fff',
            }}
          >
            {rarity.toUpperCase()}
          </div>
        </div>

        {/* Visual panda placeholder with emblem area */}
        <div className="flex justify-center">
          <div
            className={cn(
              'w-32 h-32 rounded-full flex items-center justify-center font-bold text-6xl',
              'relative shadow-lg transition-transform duration-300',
              isUpdating && 'animate-pulse scale-110'
            )}
            style={{
              background: `linear-gradient(135deg, ${colorPalette.primary} 0%, ${colorPalette.secondary} 100%)`,
            }}
          >
            {getTypeEmoji(type)}
            {/* Future emblem asset from public/forge would go here */}
          </div>
        </div>

        {/* Ability text */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-semibold text-gray-200 mb-1">Ability:</p>
          <p className="text-gray-300 italic">{abilityText}</p>
        </div>

        {/* Stat meters */}
        <div className="space-y-3">
          {Object.entries(stats).map(([statName, value]) => (
            <div key={statName}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-300 capitalize">
                  {statName}
                </span>
                <span className="text-sm font-bold text-gray-200">
                  {formatStat(value)}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min((value / 100) * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${colorPalette.primary}, ${colorPalette.accent})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Steal chance and risk rating */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-900/30 rounded-lg p-3 border border-red-800">
            <p className="text-xs text-red-300 font-semibold mb-1">STEAL CHANCE</p>
            <p className="text-2xl font-bold text-red-400">
              {stealChance.toFixed(0)}%
            </p>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-800">
            <p className="text-xs text-yellow-300 font-semibold mb-1">RISK RATING</p>
            <p className="text-2xl font-bold text-yellow-400">
              {riskRating.toFixed(0)}/100
            </p>
          </div>
        </div>

        {/* Stat total */}
        <div className="flex items-center justify-between bg-blue-900/30 rounded-lg p-4 border border-blue-800">
          <span className="text-sm font-semibold text-blue-300">TOTAL POWER</span>
          <span className="text-3xl font-bold text-blue-400">
            {(
              (stats.attack + stats.defense + stats.speed + stats.intellect) /
              4
            ).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
