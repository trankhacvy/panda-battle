import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "game" | "glow" | "battle" | "stat" | "highlight";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default:
      "rounded-xl border bg-card text-card-foreground shadow transition-all duration-200",
    game: "rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-card to-card/80 text-card-foreground shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm",
    glow: "rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-card to-card/80 text-card-foreground shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm animate-pulse-slow",
    battle:
      "rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-card to-card/80 text-card-foreground shadow-lg shadow-red-500/10 hover:shadow-red-500/30 hover:border-red-500/50 hover:scale-[1.02] transition-all duration-300",
    stat: "rounded-lg border-2 border-cyan-500/20 bg-gradient-to-br from-card/90 to-card/70 text-card-foreground shadow-md shadow-cyan-500/5 hover:shadow-cyan-500/15 hover:border-cyan-500/40 transition-all duration-200 backdrop-blur-sm",
    highlight:
      "rounded-xl border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 text-card-foreground shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300",
  };

  return (
    <div
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
