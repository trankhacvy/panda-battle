import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative inline-block outline-none transition-transform duration-200 bg-white",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        destructive: "",
        warning: "",
        info: "",
        pink: "",
      },
      size: {
        sm: "p-[4px] pb-[6px] rounded-[1rem] shadow-[0_3px_0_#d0d0d0,0_12px_20px_-6px_rgba(0,0,0,0.16)]",
        md: "p-[6px] pb-[8px] rounded-[1.25rem] shadow-[0_4px_0_#d0d0d0,0_16px_24px_-6px_rgba(0,0,0,0.17)]",
        lg: "p-[8px] pb-[10px] rounded-[1.75rem] shadow-[0_4px_0_#d0d0d0,0_14px_22px_-6px_rgba(0,0,0,0.18)]",
        xl: "p-[10px] pb-[12px] rounded-[2.25rem] shadow-[0_5px_0_#d0d0d0,0_20px_30px_-6px_rgba(0,0,0,0.2)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

const cardInnerVariants = cva(
  "block relative w-full overflow-hidden h-full bg-white",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        destructive: "",
        warning: "",
        info: "",
        pink: "",
      },
      size: {
        sm: "rounded-[0.875rem]",
        md: "rounded-[1.125rem]",
        lg: "rounded-[1.5rem]",
        xl: "rounded-[2rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      >
        <div className={cn(cardInnerVariants({ variant, size }))}>
          {children}
        </div>
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?:
      | "primary"
      | "secondary"
      | "destructive"
      | "warning"
      | "info"
      | "pink";
    onClose?: () => void;
  }
>(({ className, variant = "info", onClose, children, ...props }, ref) => {
  const variantClasses = {
    primary: "bg-game-primary",
    secondary: "bg-game-secondary shadow-[0_4px_0_var(--game-secondary-dark)]",
    destructive: "bg-game-destructive",
    warning: "bg-game-warning",
    info: "bg-game-info",
    pink: "bg-game-pink",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center justify-center mx-2 mt-2 mb-0 px-6 py-2 rounded-full",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" strokeWidth={3} />
        </button>
      )}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-bold text-white text-lg tracking-wide drop-shadow-sm",
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
  <div ref={ref} className={cn("p-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0", className)}
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
  cardVariants,
};
