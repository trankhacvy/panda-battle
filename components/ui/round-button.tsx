import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const roundButtonVariants = cva(
  "group relative flex items-center justify-center box-border transition-transform duration-150 ease-in-out active:shadow-none focus:outline-none hover:scale-105 rounded-full bg-white",
  {
    variants: {
      variant: {
        primary:
          "shadow-[0_4px_0_var(--game-primary-dark)] active:translate-y-[8px]",
        secondary:
          "shadow-[0_4px_0_var(--game-secondary-dark)] active:translate-y-[8px]",
        destructive:
          "shadow-[0_4px_0_var(--game-destructive-dark)] active:translate-y-[8px]",
        warning:
          "shadow-[0_4px_0_var(--game-warning-dark)] active:translate-y-[8px]",
        info: "shadow-[0_4px_0_var(--game-info-dark)] active:translate-y-[8px]",
        pink: "shadow-[0_4px_0_var(--game-pink-dark)] active:translate-y-[8px]",
      },
      size: {
        sm: "p-[4px] active:translate-y-[4px]",
        md: "p-[5px] active:translate-y-[6px]",
        lg: "p-[8px] active:translate-y-[8px]",
        xl: "p-[10px] active:translate-y-[10px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

const roundButtonInnerVariants = cva(
  "flex items-center justify-center rounded-full transition-all duration-150",
  {
    variants: {
      variant: {
        primary: "bg-game-primary border-[3px] border-game-primary",
        secondary: "bg-game-secondary border-[3px] border-game-secondary",
        destructive: "bg-game-destructive border-[3px] border-game-destructive",
        warning: "bg-game-warning border-[3px] border-game-warning",
        info: "bg-game-info border-[3px] border-game-info",
        pink: "bg-game-pink border-[3px] border-game-pink",
      },
      size: {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-20 h-20",
        xl: "w-28 h-28",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

export interface RoundButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof roundButtonVariants> {
  asChild?: boolean;
}

const RoundButton = React.forwardRef<HTMLButtonElement, RoundButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(roundButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className={cn(roundButtonInnerVariants({ variant, size }))}>
          {children}
        </div>
      </Comp>
    );
  }
);
RoundButton.displayName = "RoundButton";

export { RoundButton, roundButtonVariants };
