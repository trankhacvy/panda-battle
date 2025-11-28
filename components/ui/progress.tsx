import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "strength" | "speed" | "endurance" | "luck" | "game";
  showShell?: boolean; // Enable white border container
}

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    { className, value, variant = "default", showShell = false, ...props },
    ref
  ) => {
    const variantClasses = {
      default: "bg-primary",
      strength:
        "bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/50",
      speed:
        "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50",
      endurance:
        "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50",
      luck: "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50",
      game: "bg-yellow-400",
    };

    const progressBar = (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-primary/20 border border-primary/30 transition-all duration-200",
          showShell && "h-5 bg-[#3b0764] border-0",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out animate-in rounded-full",
            variantClasses[variant]
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    );

    if (showShell) {
      return (
        <div className="relative">
          {/* Outer White Container - Creates thick white border effect */}
          <div className="bg-white p-1.5 rounded-full shadow-md">
            {progressBar}
          </div>
        </div>
      );
    }

    return progressBar;
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

// Simple progress bar component (non-Radix version for more flexibility)
interface SimpleProgressProps {
  value: number; // 0 to 100
  colorClass?: string; // Tailwind class for fill color
  className?: string;
  showShell?: boolean;
}

const SimpleProgress: React.FC<SimpleProgressProps> = ({
  value,
  colorClass = "bg-yellow-400",
  className = "",
  showShell = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const progressBar = (
    <div
      className={cn(
        "w-full h-5 bg-[#3b0764] rounded-full overflow-hidden relative",
        !showShell && "border border-primary/30",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          colorClass
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );

  if (showShell) {
    return (
      <div className="relative">
        <div className="bg-white p-1.5 rounded-full shadow-md">
          {progressBar}
        </div>
      </div>
    );
  }

  return progressBar;
};

export { Progress, SimpleProgress };
