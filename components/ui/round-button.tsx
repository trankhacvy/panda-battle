import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const roundButtonVariants = cva(
  "group flex items-center justify-center box-border transition-transform duration-150 ease-in-out active:shadow-none focus:outline-none hover:scale-105 rounded-full border-white",
  {
    variants: {
      variant: {
        default: "bg-[#FF2E63] shadow-[0_8px_0_#9f1d3b] active:translate-y-[8px]",
        red: "bg-[#FF2E63] shadow-[0_8px_0_#9f1d3b] active:translate-y-[8px]",
        purple: "bg-[#A855F7] shadow-[0_8px_0_#7c3aed] active:translate-y-[8px]",
        blue: "bg-[#3B82F6] shadow-[0_8px_0_#1d4ed8] active:translate-y-[8px]",
        green: "bg-[#74D700] shadow-[0_8px_0_#4ca600] active:translate-y-[8px]",
        orange: "bg-[#FF8C00] shadow-[0_8px_0_#cc7000] active:translate-y-[8px]",
      },
      size: {
        sm: "w-12 h-12 border-[4px] shadow-[0_4px_0_#9f1d3b] active:translate-y-[4px]",
        md: "w-16 h-16 border-[5px] shadow-[0_6px_0_#9f1d3b] active:translate-y-[6px]",
        lg: "w-24 h-24 border-[8px] shadow-[0_8px_0_#9f1d3b] active:translate-y-[8px]",
        xl: "w-32 h-32 border-[10px] shadow-[0_10px_0_#9f1d3b] active:translate-y-[10px]",
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
        {children}
      </Comp>
    );
  }
);
RoundButton.displayName = "RoundButton";

export { RoundButton, roundButtonVariants };
