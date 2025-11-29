"use client";

import { useState } from "react";
import { TabNavigation, TabType } from "@/components/tab-navigation";
import { TabContainer, TabContent } from "@/components/tab-content";
import { HomeTab } from "@/components/tabs/home-tab";
import { BattleTab } from "@/components/tabs/battle-tab";
import { LeaderboardTab } from "@/components/tabs/leaderboard-tab";

/**
 * GamePage - Main game interface with tabbed navigation
 *
 * This page serves as the primary game interface after player onboarding.
 * It provides access to:
 * - Home: Player stats, panda display, quick actions
 * - Battle: Opponent selection and battle initiation
 * - Leaderboard: Rankings and competitive standings
 */
export default function GamePage() {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  return (
    <div className="flex flex-col h-screen">
      <TabContainer>
        <TabContent activeTab={activeTab} tab="home">
          <HomeTab />
        </TabContent>

        <TabContent activeTab={activeTab} tab="battle">
          <BattleTab />
        </TabContent>

        <TabContent activeTab={activeTab} tab="leaderboard">
          <LeaderboardTab />
        </TabContent>
      </TabContainer>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
