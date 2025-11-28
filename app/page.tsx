"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simulate splash screen - auto-navigate to wallet connection after 2 seconds
    const timer = setTimeout(() => {
      router.push("/connect-wallet");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 sm:space-y-6 animate-pulse">
        <div className="text-6xl sm:text-8xl">🐼</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent px-2">
          Bamboo Panda Battles
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">Loading...</p>
      </div>
    </div>
  );
}
