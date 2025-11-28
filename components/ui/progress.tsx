import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "strength" | "speed" | "endurance" | "luck";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-primary",
    strength:
      "bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/50",
    speed:
      "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50",
    endurance:
      "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50",
    luck: "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-primary/20 border border-primary/30 transition-all duration-200",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out animate-in",
          variantClasses[variant]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
