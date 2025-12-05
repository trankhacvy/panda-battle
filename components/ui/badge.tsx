import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-block bg-white rounded-full", {
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
      sm: "p-[2px] pb-[4px]",
      md: "p-[3px] pb-[6px]",
      lg: "p-[4px] pb-[8px]",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const badgeInnerVariants = cva(
  "flex items-center justify-center rounded-full font-bold text-white tracking-wide",
  {
    variants: {
      variant: {
        primary: "bg-game-primary shadow-[0_3px_0_var(--game-primary-dark)]",
        secondary:
          "bg-game-secondary shadow-[0_3px_0_var(--game-secondary-dark)]",
        destructive:
          "bg-game-destructive shadow-[0_3px_0_var(--game-destructive-dark)]",
        warning: "bg-game-warning shadow-[0_3px_0_var(--game-warning-dark)]",
        info: "bg-game-info shadow-[0_3px_0_var(--game-info-dark)]",
        pink: "bg-game-pink shadow-[0_3px_0_var(--game-pink-dark)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] shadow-[0_2px_0_var(--game-primary-dark)]",
        md: "px-3 py-0.5 text-xs shadow-[0_3px_0_var(--game-primary-dark)]",
        lg: "px-4 py-1 text-sm shadow-[0_4px_0_var(--game-primary-dark)]",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        size: "sm",
        class: "shadow-[0_2px_0_var(--game-primary-dark)]",
      },
      {
        variant: "primary",
        size: "md",
        class: "shadow-[0_3px_0_var(--game-primary-dark)]",
      },
      {
        variant: "primary",
        size: "lg",
        class: "shadow-[0_4px_0_var(--game-primary-dark)]",
      },
      {
        variant: "secondary",
        size: "sm",
        class: "shadow-[0_2px_0_var(--game-secondary-dark)]",
      },
      {
        variant: "secondary",
        size: "md",
        class: "shadow-[0_3px_0_var(--game-secondary-dark)]",
      },
      {
        variant: "secondary",
        size: "lg",
        class: "shadow-[0_4px_0_var(--game-secondary-dark)]",
      },
      {
        variant: "destructive",
        size: "sm",
        class: "shadow-[0_2px_0_var(--game-destructive-dark)]",
      },
      {
        variant: "destructive",
        size: "md",
        class: "shadow-[0_3px_0_var(--game-destructive-dark)]",
      },
      {
        variant: "destructive",
        size: "lg",
        class: "shadow-[0_4px_0_var(--game-destructive-dark)]",
      },
      {
        variant: "warning",
        size: "sm",
        class: "shadow-[0_2px_0_var(--game-warning-dark)]",
      },
      {
        variant: "warning",
        size: "md",
        class: "shadow-[0_3px_0_var(--game-warning-dark)]",
      },
      {
        variant: "warning",
        size: "lg",
        class: "shadow-[0_4px_0_var(--game-warning-dark)]",
      },
      {
        variant: "info",
        size: "sm",
        class: "shadow-[0_2px_0_var(--game-info-dark)]",
      },
      {
        variant: "info",
        size: "md",
        class: "shadow-[0_3px_0_var(--game-info-dark)]",
      },
      {
        variant: "info",
        size: "lg",
        class: "shadow-[0_4px_0_var(--game-info-dark)]",
      },
      {
        variant: "pink",
        size: "sm",
        class: "shadow-[0_2px_0_var(--game-pink-dark)]",
      },
      {
        variant: "pink",
        size: "md",
        class: "shadow-[0_3px_0_var(--game-pink-dark)]",
      },
      {
        variant: "pink",
        size: "lg",
        class: "shadow-[0_4px_0_var(--game-pink-dark)]",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      <div className={cn(badgeInnerVariants({ variant, size }))}>
        {children}
      </div>
    </div>
  );
}

export { Badge, badgeVariants };
