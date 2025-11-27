"use client";

import React from "react";
import BottomNav from "./BottomNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell-container">
      {/* Top Status Bar */}
      <header
        className={cn(
          "border-b border-border bg-background/95 backdrop-blur-sm",
          "h-16 flex items-center justify-between px-4",
          "md:ml-20 lg:ml-20",
          "safe-area-inset-top safe-area-inset-left safe-area-inset-right"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐼</span>
          <h1 className="text-lg font-bold hidden sm:block">Panda Battles</h1>
        </div>

        {/* Wallet Badge (placeholder) */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              "bg-muted text-muted-foreground"
            )}
          >
            💰 Wallet
          </div>

          {/* Daily Streak (placeholder) */}
          <div className="flex items-center gap-1">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-semibold">7</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "app-content",
          "md:ml-20 lg:ml-20",
          "pb-20 md:pb-0" /* Leave space for mobile bottom nav */
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
