"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AttributeChangeAnimationProps {
  value: number;
  previousValue?: number;
  label: string;
  className?: string;
}

export function AttributeChangeAnimation({
  value,
  previousValue,
  label,
  className,
}: AttributeChangeAnimationProps) {
  const [showChange, setShowChange] = useState(false);
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      const diff = value - previousValue;
      setChange(diff);
      setShowChange(true);

      const timer = setTimeout(() => {
        setShowChange(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const isIncrease = change > 0;
  const isDecrease = change < 0;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-lg font-bold">{value}</span>
      </div>

      {showChange && (
        <div
          className={cn(
            "absolute -top-2 right-0 flex items-center gap-1 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300",
            isIncrease && "text-green-500",
            isDecrease && "text-red-500"
          )}
        >
          {isIncrease && <TrendingUp className="h-3 w-3" />}
          {isDecrease && <TrendingDown className="h-3 w-3" />}
          <span>
            {isIncrease && "+"}
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
