import Header from "@/components/header";
import { Navigation } from "@/components/navigation";
import React from "react";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="my-2 h-full min-h-0 grow overflow-auto overscroll-contain bg-background">
        {children}
      </div>
      <Navigation />
    </div>
  );
}
