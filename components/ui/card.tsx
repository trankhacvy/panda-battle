import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?:
      | "default"
      | "game"
      | "glow"
      | "battle"
      | "stat"
      | "highlight"
      | "3d";
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
    "3d": "relative bg-white rounded-[2rem] shadow-[0_6px_0_#d1d5db,0_20px_25px_-5px_rgba(0,0,0,0.1)] mb-3 select-none",
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
  React.HTMLAttributes<HTMLDivElement> & {
    colorClass?: string; // For 3D card header background color
  }
>(({ className, colorClass, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      colorClass &&
        "h-12 rounded-t-[1.8rem] flex items-center justify-center relative mt-1 mx-1",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "3d";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      variant === "3d" &&
        "text-white font-black text-xl tracking-widest drop-shadow-sm uppercase",
      className
    )}
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

// 3D Game-style Card Component (like BonusCard)
interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  headerColor?: string; // Tailwind class for header background
  headerTitle?: string;
  width?: string; // Tailwind width class
  onClose?: () => void; // Close button handler
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  (
    {
      className,
      headerColor = "bg-gradient-to-r from-purple-500 to-purple-600",
      headerTitle,
      width = "w-full max-w-4xl",
      onClose,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-gradient-to-b from-gray-100 to-white rounded-[3rem] shadow-[0_20px_0_rgba(200,200,220,0.4),0_25px_50px_-12px_rgba(0,0,0,0.25)] select-none border-[12px] border-white",
          width,
          className
        )}
        {...props}
      >
        {/* Header Section */}
        {headerTitle && (
          <div
            className={cn(
              "h-16 rounded-[2rem] flex items-center justify-center relative mx-4 mt-4 shadow-lg",
              headerColor
            )}
          >
            <h2 className="text-white font-black text-3xl tracking-[0.3em] drop-shadow-md uppercase">
              {headerTitle}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center transition-all duration-200 hover:scale-110"
                aria-label="Close"
              >
                <svg
                  className="w-7 h-7 text-white font-bold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-8 pb-10">{children}</div>
      </div>
    );
  }
);
Card3D.displayName = "Card3D";

export {
  Card,
  Card3D,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
