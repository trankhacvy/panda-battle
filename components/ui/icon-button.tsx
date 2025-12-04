import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "group relative inline-flex items-center justify-center rounded-full transition-all duration-150 ease-in-out focus:outline-none active:shadow-none disabled:pointer-events-none disabled:shadow-[0_8px_0_#6B7280]",
  {
    variants: {
      variant: {
        primary:
          "bg-white shadow-[0_8px_0_#B8234D] active:translate-y-[8px] hover:shadow-[0_8px_0_#9f1d3b]",
        secondary:
          "bg-white shadow-[0_8px_0_#2350CC] active:translate-y-[8px] hover:shadow-[0_8px_0_#1a3d99]",
        success:
          "bg-white shadow-[0_8px_0_#25CC4F] active:translate-y-[8px] hover:shadow-[0_8px_0_#1a993b]",
        error:
          "bg-white shadow-[0_8px_0_#B8234D] active:translate-y-[8px] hover:shadow-[0_8px_0_#9f1d3b]",
        warning:
          "bg-white shadow-[0_8px_0_#CC9225] active:translate-y-[8px] hover:shadow-[0_8px_0_#99701a]",
      },
      size: {
        sm: "w-12 h-12 p-1.5 active:translate-y-[4px]",
        md: "w-16 h-16 p-2 active:translate-y-[6px]",
        lg: "w-24 h-24 p-3 active:translate-y-[8px]",
        xl: "w-32 h-32 p-4 active:translate-y-[10px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
);

const iconButtonInnerVariants = cva(
  "w-full h-full rounded-full flex items-center justify-center transition-transform group-enabled:group-hover:scale-105",
  {
    variants: {
      variant: {
        primary: "bg-[#FF2E63] group-disabled:bg-[#9CA3AF]",
        secondary: "bg-[#2E63FF] group-disabled:bg-[#9CA3AF]",
        success: "bg-[#2EFF63] group-disabled:bg-[#9CA3AF]",
        error: "bg-[#FF2E63] group-disabled:bg-[#9CA3AF]",
        warning: "bg-[#FFB82E] group-disabled:bg-[#9CA3AF]",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

const iconSizeMap = {
  sm: { className: "w-5 h-5", stroke: 3 },
  md: { className: "w-7 h-7", stroke: 3.5 },
  lg: { className: "w-10 h-10", stroke: 4 },
  xl: { className: "w-14 h-14", stroke: 5 },
} as const;

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const currentSize = size || "lg";
    const iconSize = iconSizeMap[currentSize];

    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <div className={cn(iconButtonInnerVariants({ variant }))}>
          {typeof children === "function" ? (
            // @ts-expect-error
            children(iconSize)
          ) : React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement<any>, {
              className: cn(
                "text-white drop-shadow-sm",
                iconSize.className,
                (children as React.ReactElement<any>).props?.className
              ),
              strokeWidth:
                (children as React.ReactElement<any>).props?.strokeWidth ||
                iconSize.stroke,
            })
          ) : (
            <span
              className={cn("text-white drop-shadow-sm", iconSize.className)}
            >
              {children}
            </span>
          )}
        </div>
      </Comp>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
