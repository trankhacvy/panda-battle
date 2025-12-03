import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const roundButtonVariants = cva(
  "group relative flex items-center justify-center box-border transition-transform duration-150 ease-in-out active:shadow-none focus:outline-none hover:scale-105 rounded-full bg-white",
  {
    variants: {
      variant: {
        default: "shadow-[0_4px_0_#9f1d3b] active:translate-y-[8px]",
        red: "shadow-[0_4px_0_#9f1d3b] active:translate-y-[8px]",
        purple: "shadow-[0_4px_0_#7c3aed] active:translate-y-[8px]",
        blue: "shadow-[0_4px_0_#1d4ed8] active:translate-y-[8px]",
        green: "shadow-[0_4px_0_#4ca600] active:translate-y-[8px]",
        orange: "shadow-[0_4px_0_#cc7000] active:translate-y-[8px]",
      },
      size: {
        sm: "p-[4px] active:translate-y-[4px]",
        md: "p-[5px] active:translate-y-[6px]",
        lg: "p-[8px] active:translate-y-[8px]",
        xl: "p-[10px] active:translate-y-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
);

const roundButtonInnerVariants = cva(
  "flex items-center justify-center rounded-full transition-all duration-150",
  {
    variants: {
      variant: {
        default: "bg-[#FF2E63] border-[3px] border-[#FF2E63]",
        red: "bg-[#FF2E63] border-[3px] border-[#FF2E63]",
        purple: "bg-[#A855F7] border-[3px] border-[#A855F7]",
        blue: "bg-[#3B82F6] border-[3px] border-[#3B82F6]",
        green: "bg-[#74D700] border-[3px] border-[#74D700]",
        orange: "bg-[#FF8C00] border-[3px] border-[#FF8C00]",
      },
      size: {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-20 h-20",
        xl: "w-28 h-28",
      },
    },
    defaultVariants: {
      variant: "default",
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
