import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Progress } from "./progress";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  maxValue?: number;
  variant?: "destructive" | "warning" | "primary" | "secondary";
  showProgress?: boolean;
  icon?: React.ReactNode;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      maxValue = 100,
      variant = "destructive",
      showProgress = true,
      icon,
      ...props
    },
    ref
  ) => {
    const percentage = (value / maxValue) * 100;

    const variantColors = {
      destructive: "from-red-500/10 to-orange-500/10 border-red-500/30",
      warning: "from-cyan-500/10 to-blue-500/10 border-cyan-500/30",
      primary: "from-green-500/10 to-emerald-500/10 border-green-500/30",
      secondary: "from-purple-500/10 to-pink-500/10 border-purple-500/30",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 bg-linear-to-br p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm",
          variantColors[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-lg animate-pulse">{icon}</div>}
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
          </div>
          <Badge variant={variant} className="text-base px-3 py-1">
            {value}
          </Badge>
        </div>

        {showProgress && (
          <Progress
            value={percentage}
            variant={variant}
            showShell
            className="h-2"
          />
        )}
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard };
