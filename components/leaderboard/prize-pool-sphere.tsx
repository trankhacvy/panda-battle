"use client";

import { useEffect, useState } from "react";

interface PrizePoolSphereProps {
  totalPrize: number;
  currency?: string;
}

export function PrizePoolSphere({
  totalPrize,
  currency = "SOL",
}: PrizePoolSphereProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      {/* Prize Label */}
      <div className="text-white/80 text-sm font-medium mb-4 tracking-wider">
        TOTAL PRIZE POOL
      </div>

      {/* 3D Sphere Container */}
      <div
        className="relative w-48 h-48"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Main Sphere */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            transform: `rotateY(${rotation}deg) rotateX(${rotation * 0.3}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.05s linear",
          }}
        >
          {/* Outer Ring - Pink */}
          <div
            className="absolute inset-0 rounded-full border-[3px] border-pink-500"
            style={{
              transform: "translateZ(0px)",
            }}
          />

          {/* Middle Layer - Lighter Pink */}
          <div
            className="absolute inset-[10%] rounded-full border-[2px] border-pink-400"
            style={{
              transform: "translateZ(20px)",
            }}
          />

          {/* Inner Core - White/Pink */}
          <div
            className="absolute inset-[20%] rounded-full border-[2px] border-pink-300/80"
            style={{
              transform: "translateZ(40px)",
            }}
          />

          {/* Center Glow Circle */}
          <div
            className="absolute inset-[30%] rounded-full bg-pink-200/30 border border-pink-200"
            style={{
              transform: "translateZ(60px)",
            }}
          />
        </div>

        {/* Static Prize Amount (stays centered) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-5xl font-bold text-white mb-1">
            {totalPrize.toLocaleString()}
          </div>
          <div className="text-xl font-semibold text-pink-300">{currency}</div>
        </div>

        {/* Decorative Rings Around */}
        <div className="absolute -inset-4 rounded-full border border-pink-500/20" />
        <div className="absolute -inset-8 rounded-full border border-pink-500/10" />
      </div>

      {/* Bottom Label */}
      <div className="text-white/60 text-xs font-medium mt-4 tracking-wider">
        Winner Takes All
      </div>
    </div>
  );
}

