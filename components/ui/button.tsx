import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

const buttonVariants = cva(
  "group relative inline-block cursor-pointer outline-none focus:outline-none transition-transform duration-200",
  {
    variants: {
      variant: {
        primary: "bg-white",
        secondary: "bg-white",
        destructive: "bg-white",
        warning: "bg-white",
        info: "bg-white",
        pink: "bg-white",
      },
      size: {
        default: "p-[4px] pb-[12px] rounded-[1.25rem]",
        sm: "p-[4px] pb-[12px] rounded-[1.25rem]",
        md: "p-[5px] pb-[13px] rounded-[1.75rem]",
        lg: "p-[6px] pb-[14px] rounded-[2.25rem]",
        xl: "p-[8px] pb-[16px] rounded-[2.5rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const innerVariants = cva(
  "block relative w-full transition-all duration-150 ease-out overflow-hidden flex items-center justify-center px-4",
  {
    variants: {
      variant: {
        primary:
          "bg-game-primary shadow-[0_8px_0_var(--game-primary-dark)] group-active:shadow-[0_0px_0_var(--game-primary-dark)] group-active:translate-y-[8px]",
        secondary:
          "bg-game-secondary shadow-[0_8px_0_var(--game-secondary-dark)] group-active:shadow-[0_0px_0_var(--game-secondary-dark)] group-active:translate-y-[8px]",
        destructive:
          "bg-game-destructive shadow-[0_8px_0_var(--game-destructive-dark)] group-active:shadow-[0_0px_0_var(--game-destructive-dark)] group-active:translate-y-[8px]",
        warning:
          "bg-game-warning shadow-[0_8px_0_var(--game-warning-dark)] group-active:shadow-[0_0px_0_var(--game-warning-dark)] group-active:translate-y-[8px]",
        info: "bg-game-info shadow-[0_8px_0_var(--game-info-dark)] group-active:shadow-[0_0px_0_var(--game-info-dark)] group-active:translate-y-[8px]",
        pink: "bg-game-pink shadow-[0_8px_0_var(--game-pink-dark)] group-active:shadow-[0_0px_0_var(--game-pink-dark)] group-active:translate-y-[8px]",
      },
      size: {
        default: "h-10 rounded-[1rem]",
        sm: "h-10 rounded-[1rem]",
        md: "h-12 rounded-[1.5rem]",
        lg: "h-16 rounded-[2rem]",
        xl: "h-20 rounded-[2.25rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      disabled: disabledProp,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const disabled = disabledProp || loading;

    // Text size mapping based on button size
    const textSizeMap = {
      default: "text-sm",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <span className={cn(innerVariants({ variant, size }))}>
          <span
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 40%)",
            }}
          />
          <div
            className={cn(
              "relative flex items-center gap-2 z-10 font-black tracking-widest text-white drop-shadow-[0_4px_1px_rgba(0,0,0,0.15)] select-none uppercase",
              textSizeMap[size || "default"]
            )}
          >
            {loading ? (
              <Loader2Icon
                className={cn(
                  "text-white aabsolute animate-spin font-bold",
                  "loading"
                )}
              />
            ) : (
              <Slottable>{children}</Slottable>
            )}
          </div>
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
