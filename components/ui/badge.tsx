import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Game-specific stat badges
        strength:
          "border-transparent bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/30 font-bold hover:shadow-red-500/50 hover:scale-105",
        speed:
          "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/30 font-bold hover:shadow-cyan-500/50 hover:scale-105",
        endurance:
          "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30 font-bold hover:shadow-green-500/50 hover:scale-105",
        luck: "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/30 font-bold hover:shadow-purple-500/50 hover:scale-105",
        rank: "border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/40 font-bold hover:shadow-yellow-500/60 hover:scale-105 animate-pulse-slow",
        win: "border-transparent bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/50",
        loss: "border-transparent bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md shadow-gray-500/30 hover:shadow-gray-500/50",
        turns:
          "border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30 font-bold hover:shadow-indigo-500/50 hover:scale-105",
        prize:
          "border-2 border-amber-500/50 bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/40 font-bold hover:shadow-amber-500/60 hover:scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
