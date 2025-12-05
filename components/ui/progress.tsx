import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full transition-all duration-200",
  {
    variants: {
      variant: {
        primary: "bg-game-primary/20",
        secondary: "bg-game-secondary/20",
        destructive: "bg-game-destructive/20",
        warning: "bg-game-warning/20",
        info: "bg-game-info/20",
        pink: "bg-game-pink/20",
      },
      size: {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      variant: {
        primary: "bg-game-primary",
        secondary: "bg-game-secondary",
        destructive: "bg-game-destructive",
        warning: "bg-game-warning",
        info: "bg-game-info",
        pink: "bg-game-pink",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  showShell?: boolean;
}

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      variant = "primary",
      size = "md",
      showShell = false,
      ...props
    },
    ref
  ) => {
    const progressBar = (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          progressVariants({ variant, size }),
          showShell && "bg-gray-200",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant }))}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    );

    if (showShell) {
      return (
        <div className="relative">
          <div className="bg-white p-[3px] rounded-full shadow-[0_2px_0_#d0d0d0]">
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
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "warning"
    | "info"
    | "pink";
  size?: "sm" | "md" | "lg";
  className?: string;
  showShell?: boolean;
}

const SimpleProgress: React.FC<SimpleProgressProps> = ({
  value,
  variant = "primary",
  size = "md",
  className = "",
  showShell = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const variantBgClasses = {
    primary: "bg-game-primary/20",
    secondary: "bg-game-secondary/20",
    destructive: "bg-game-destructive/20",
    warning: "bg-game-warning/20",
    info: "bg-game-info/20",
    pink: "bg-game-pink/20",
  };

  const variantFillClasses = {
    primary: "bg-game-primary",
    secondary: "bg-game-secondary",
    destructive: "bg-game-destructive",
    warning: "bg-game-warning",
    info: "bg-game-info",
    pink: "bg-game-pink",
  };

  const progressBar = (
    <div
      className={cn(
        "w-full rounded-full overflow-hidden relative",
        sizeClasses[size],
        showShell ? "bg-gray-200" : variantBgClasses[variant],
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          variantFillClasses[variant]
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );

  if (showShell) {
    return (
      <div className="relative">
        <div className="bg-white p-[3px] rounded-full shadow-[0_2px_0_#d0d0d0]">
          {progressBar}
        </div>
      </div>
    );
  }

  return progressBar;
};

export { Progress, SimpleProgress };
