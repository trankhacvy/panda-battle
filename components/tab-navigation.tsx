"use client";

import { ReactNode } from "react";
import { Home, Swords, Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "home" | "battle" | "world-boss" | "leaderboard";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface TabItem {
  id: TabType;
  label: string;
  icon: ReactNode;
}

const tabs: TabItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "battle",
    label: "Battle",
    icon: <Swords className="w-6 h-6" />,
  },
  {
    id: "world-boss",
    label: "World Boss",
    icon: <Crown className="w-6 h-6" />,
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: <Trophy className="w-6 h-6" />,
  },
];

/**
 * TabNavigation - Bottom tab bar for mobile-first navigation
 *
 * Features:
 * - Mobile-friendly touch targets (min 44px)
 * - Active tab highlighting
 * - Smooth transitions
 * - Icon + label layout
 */
export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg lg:shadow-none"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Center the tab bar on desktop with proper constraints */}
      <div className="mx-auto max-w-md lg:border-x lg:border-border/50">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg px-4 sm:px-6 py-2 transition-all duration-200",
                  "min-w-[72px] sm:min-w-[80px] min-h-[56px]", // Mobile-friendly touch target (44px+ requirement)
                  "hover:bg-accent/50 active:scale-95",
                  isActive && "bg-accent text-accent-foreground"
                )}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "transition-all duration-200",
                    isActive
                      ? "text-emerald-500 scale-110"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.icon}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
