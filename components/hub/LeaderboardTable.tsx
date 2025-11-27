'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, Eye, EyeOff } from 'lucide-react';
import {
  getRiskLevelColor,
  getRiskLevelLabel,
  mockLeaderboardEntries,
  RiskLevel,
} from '@/lib/mock/leaderboard';
import { cn } from '@/lib/utils';

interface LeaderboardTableProps {
  className?: string;
}

type FilterClan = 'all' | string;

export default function LeaderboardTable({ className }: LeaderboardTableProps) {
  const [filterClan, setFilterClan] = useState<FilterClan>('all');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [showPrivate, setShowPrivate] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'streak' | 'wins'>('rating');

  // Get unique clans for filtering
  const uniqueClans = useMemo(() => {
    const clans = new Set(mockLeaderboardEntries.map((e) => e.clan).filter(Boolean));
    return Array.from(clans).sort();
  }, []);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    const filtered = mockLeaderboardEntries.filter((entry) => {
      // Filter by clan
      if (filterClan !== 'all' && entry.clan !== filterClan) {
        return false;
      }

      // Filter by risk level
      if (filterRisk !== 'all' && entry.riskLevel !== filterRisk) {
        return false;
      }

      // Filter by visibility
      if (!showPrivate && entry.visibility === 'private') {
        return false;
      }

      return true;
    });

    // Sort entries
    filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'streak') {
        return b.winStreak - a.winStreak;
      } else {
        return b.totalWins - a.totalWins;
      }
    });

    return filtered;
  }, [filterClan, filterRisk, showPrivate, sortBy]);

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getSortIcon = (column: 'rating' | 'streak' | 'wins') => {
    if (sortBy !== column) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return <ChevronUp className="w-4 h-4" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-wrap">
        {/* Clan Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Clan</label>
          <select
            value={filterClan}
            onChange={(e) => setFilterClan(e.target.value as FilterClan)}
            className="px-3 py-2 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Clans</option>
            {uniqueClans.map((clan) => (
              <option key={clan} value={clan}>
                {clan}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Tier Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Risk Tier</label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
            className="px-3 py-2 rounded-md bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Tiers</option>
            <option value="low">Safe</option>
            <option value="medium">Balanced</option>
            <option value="high">Aggressive</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-end">
          <button
            onClick={() => setShowPrivate(!showPrivate)}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
              showPrivate
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground border border-border'
            )}
          >
            {showPrivate ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            {showPrivate ? 'Showing Private' : 'Hiding Private'}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Player</th>
                <th className="px-4 py-3 text-left font-semibold">Level</th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/70 transition-colors flex items-center gap-2"
                  onClick={() => setSortBy('rating')}
                >
                  Rating {getSortIcon('rating')}
                </th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/70 transition-colors flex items-center gap-2"
                  onClick={() => setSortBy('wins')}
                >
                  Wins {getSortIcon('wins')}
                </th>
                <th className="px-4 py-3 text-left font-semibold">Win Rate</th>
                <th
                  className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-muted/70 transition-colors flex items-center gap-2"
                  onClick={() => setSortBy('streak')}
                >
                  Streak {getSortIcon('streak')}
                </th>
                <th className="px-4 py-3 text-left font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="hover:bg-muted/50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="text-lg font-bold">{getMedalEmoji(idx + 1)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{entry.avatar}</span>
                      <div>
                        <p className="font-semibold">{entry.player}</p>
                        {entry.clan && (
                          <p className="text-xs text-muted-foreground">{entry.clan}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{entry.level}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-primary">{entry.rating}</span>
                  </td>
                  <td className="px-4 py-3">{entry.totalWins}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-muted text-xs font-semibold">
                      {entry.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      🔥 {entry.winStreak}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold inline-block',
                        getRiskLevelColor(entry.riskLevel)
                      )}
                    >
                      {getRiskLevelLabel(entry.riskLevel)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Rows */}
        <div className="md:hidden divide-y divide-border">
          {filteredEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className="p-4 hover:bg-muted/50 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{getMedalEmoji(idx + 1)}</span>
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <span>{entry.avatar}</span>
                      {entry.player}
                    </p>
                    {entry.clan && (
                      <p className="text-xs text-muted-foreground">{entry.clan}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-primary text-lg">{entry.rating}</span>
              </div>

              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground">
                  LVL {entry.level} • {entry.totalWins}W
                </span>
                <span className="px-2 py-1 rounded bg-muted font-semibold">
                  {entry.winRate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs gap-2">
                <span className="flex items-center gap-1">
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full font-semibold inline-block',
                      getRiskLevelColor(entry.riskLevel)
                    )}
                  >
                    {getRiskLevelLabel(entry.riskLevel)}
                  </span>
                </span>
                <span className="text-muted-foreground">🔥 {entry.winStreak}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>No players match the selected filters.</p>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredEntries.length} of {mockLeaderboardEntries.length} players
      </div>
    </div>
  );
}
