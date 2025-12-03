import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-block outline-none focus:outline-none transition-transform duration-200",
  {
    variants: {
      variant: {
        default: "bg-white hover:scale-[1.02]",
        primary: "bg-white hover:scale-[1.02]",
        game: "bg-white hover:scale-[1.02]",
        "game-secondary": "bg-white hover:scale-[1.02]",
        danger: "bg-white hover:scale-[1.02]",
        attack: "bg-white hover:scale-[1.02]",
        defend: "bg-white hover:scale-[1.02]",
        energy: "bg-white hover:scale-[1.02]",
        warning: "bg-white hover:scale-[1.02]",
        destructive: "bg-white hover:scale-[1.02]",
        outline: "bg-white hover:scale-[1.02]",
        secondary: "bg-white hover:scale-[1.02]",
        ghost: "bg-white hover:scale-[1.02]",
        link: "bg-white hover:scale-[1.02]",
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
      variant: "default",
      size: "default",
    },
  }
);

const innerVariants = cva(
  "block relative w-full transition-all duration-150 ease-out overflow-hidden flex items-center justify-center px-4",
  {
    variants: {
      variant: {
        default: "bg-[#75E536] shadow-[0_8px_0_#4CA322] group-active:shadow-[0_0px_0_#4CA322] group-active:translate-y-[8px]",
        primary: "bg-[#75E536] shadow-[0_8px_0_#4CA322] group-active:shadow-[0_0px_0_#4CA322] group-active:translate-y-[8px]",
        game: "bg-[#75E536] shadow-[0_8px_0_#4CA322] group-active:shadow-[0_0px_0_#4CA322] group-active:translate-y-[8px]",
        "game-secondary": "bg-[#A855F7] shadow-[0_8px_0_#7E3FB8] group-active:shadow-[0_0px_0_#7E3FB8] group-active:translate-y-[8px]",
        danger: "bg-[#FF4757] shadow-[0_8px_0_#CC3946] group-active:shadow-[0_0px_0_#CC3946] group-active:translate-y-[8px]",
        attack: "bg-[#FF4757] shadow-[0_8px_0_#CC3946] group-active:shadow-[0_0px_0_#CC3946] group-active:translate-y-[8px]",
        defend: "bg-[#00A3FF] shadow-[0_8px_0_#0073B3] group-active:shadow-[0_0px_0_#0073B3] group-active:translate-y-[8px]",
        energy: "bg-[#A855F7] shadow-[0_8px_0_#7E3FB8] group-active:shadow-[0_0px_0_#7E3FB8] group-active:translate-y-[8px]",
        warning: "bg-[#FFD700] shadow-[0_8px_0_#CCB000] group-active:shadow-[0_0px_0_#CCB000] group-active:translate-y-[8px]",
        destructive: "bg-[#FF4757] shadow-[0_8px_0_#CC3946] group-active:shadow-[0_0px_0_#CC3946] group-active:translate-y-[8px]",
        outline: "bg-gray-500 shadow-[0_8px_0_#6B7280] group-active:shadow-[0_0px_0_#6B7280] group-active:translate-y-[8px]",
        secondary: "bg-[#A855F7] shadow-[0_8px_0_#7E3FB8] group-active:shadow-[0_0px_0_#7E3FB8] group-active:translate-y-[8px]",
        ghost: "bg-gray-500 shadow-[0_8px_0_#6B7280] group-active:shadow-[0_0px_0_#6B7280] group-active:translate-y-[8px]",
        link: "bg-[#00A3FF] shadow-[0_8px_0_#0073B3] group-active:shadow-[0_0px_0_#0073B3] group-active:translate-y-[8px]",
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
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
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
        {...props}
      >
        <span className={cn(innerVariants({ variant, size }))}>
          {/* Shine Highlight */}
          <span 
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(255,255,255,1) 40%, rgba(255,255,255,0) 40%)'
            }}
          />
          {/* Text Label */}
          <span className={cn(
            "relative z-10 font-black tracking-widest text-white drop-shadow-[0_4px_1px_rgba(0,0,0,0.15)] select-none uppercase",
            textSizeMap[size || "default"]
          )}>
            {children}
          </span>
        </span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
