import React from 'react';
import PoolTicker from './PoolTicker';
import TurnCounter from './TurnCounter';
import QuickBattleCard from './QuickBattleCard';
import { mockUserStats } from '@/lib/mock/game';

interface HomeScreenProps {
  className?: string;
}

export default function HomeScreen({ className = '' }: HomeScreenProps) {
  return (
    <div className={`flex-1 ${className}`}>
      {/* Welcome Hero Section */}
      <section className="px-4 md:px-6 py-6 md:py-8 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back! 🐼
          </h1>
          <p className="text-lg text-muted-foreground">
            Your panda is ready to battle. Check the pools below and pick your strategy.
          </p>
        </div>
      </section>

      {/* Pool Ticker Section */}
      <section className="px-4 md:px-6 py-6 md:py-8 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Live Prize Pools</h2>
            <span className="text-xs text-muted-foreground animate-pulse">
              ● Live
            </span>
          </div>
          <PoolTicker />
        </div>
      </section>

      {/* Battle Stats Section */}
      <section className="px-4 md:px-6 py-6 md:py-8 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-3">
          <h2 className="text-xl font-semibold">Battle Status</h2>
          <TurnCounter />
        </div>
      </section>

      {/* Stats Overview Cards */}
      <section className="px-4 md:px-6 py-6 md:py-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Wins Card */}
            <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Total Wins
              </p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {mockUserStats.totalWins}
              </p>
              <p className="text-xs text-muted-foreground mt-1">vs {mockUserStats.totalLosses} losses</p>
            </div>

            {/* Win Rate Card */}
            <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Win Rate
              </p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {mockUserStats.winRate}%
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${mockUserStats.winRate}%` }}
                />
              </div>
            </div>

            {/* Level Card */}
            <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Level
              </p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {mockUserStats.level}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Rank Master</p>
            </div>

            {/* Rating Card */}
            <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Rating
              </p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {mockUserStats.rating}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Elo Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Battle CTA Section */}
      <section className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Ready for Action?</h2>
          <QuickBattleCard />
        </div>
      </section>
    </div>
  );
}
