import * as React from "react";
import { cn } from "@/lib/utils";

export interface LevelBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: number;
}

function LevelBadge({ level, className, ...props }: LevelBadgeProps) {
  // Format level to always be at least 2 digits (e.g., 01, 09, 10)
  const formattedLevel = level.toString().padStart(2, "0");

  return (
    <div
      className={cn(
        "inline-block bg-white p-[3px] pb-[6px] rounded-full",
        className
      )}
      aria-label={`Level ${level}`}
      {...props}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          "bg-[#A855F7] shadow-[0_3px_0_#7E3FB8]",
          "rounded-full",
          "px-3 py-0.5"
        )}
      >
        <span className="font-bold text-white text-xs tracking-wide">
          LEVEL {formattedLevel}
        </span>
      </div>
    </div>
  );
}

export { LevelBadge };
