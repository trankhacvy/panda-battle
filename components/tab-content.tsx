"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TabType } from "./tab-navigation";

interface TabContentProps {
  activeTab: TabType;
  children: ReactNode;
  tab: TabType;
}

/**
 * TabContent - Container for individual tab content
 *
 * Features:
 * - Smooth fade transitions between tabs
 * - Proper scroll handling per tab
 * - Padding to account for bottom navigation
 * - Only renders active tab content for performance
 */
export function TabContent({ activeTab, children, tab }: TabContentProps) {
  const isActive = activeTab === tab;

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto pb-20", // pb-20 for bottom nav clearance
        "animate-in fade-in duration-200"
      )}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
    >
      {children}
    </div>
  );
}

interface TabContainerProps {
  children: ReactNode;
}

/**
 * TabContainer - Main container for all tab content
 *
 * Features:
 * - Full height layout
 * - Proper spacing for navigation
 * - Scroll container management
 */
export function TabContainer({ children }: TabContainerProps) {
  return <div className="flex flex-col flex-1 min-h-0">{children}</div>;
}
