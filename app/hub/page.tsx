'use client';

import { useState } from 'react';
import { Trophy, Wallet as WalletIcon } from 'lucide-react';
import LeaderboardTable from '@/components/hub/LeaderboardTable';
import WalletPanel from '@/components/hub/WalletPanel';
import { cn } from '@/lib/utils';

type TabType = 'leaderboard' | 'wallet';

export default function HubPage() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'wallet',
      label: 'Wallet & Profile',
      icon: <WalletIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-6 pb-8 px-4 md:px-8">
      <div className="w-full max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">👥 Panda Hub</h1>
          <p className="text-lg text-muted-foreground">
            Connect with players, climb the leaderboard, and manage your account.
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Home</span>
          <span>/</span>
          <span className="text-foreground font-medium">Hub</span>
        </nav>

        {/* Tab Navigation - Segmented Control Style */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 md:px-6 py-2 md:py-3 rounded-md font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap text-sm md:text-base',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              {/* Quick Stats Banner */}
              <div className="p-6 md:p-8 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 space-y-3">
                <h2 className="text-xl font-bold">Your Ranking</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">#Rank</p>
                    <p className="text-3xl font-bold">27</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-3xl font-bold">1850</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-3xl font-bold">68%</p>
                  </div>
                </div>
              </div>

              <LeaderboardTable />
            </div>
          )}

          {activeTab === 'wallet' && <WalletPanel />}
        </div>
      </div>
    </div>
  );
}
