"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useSoundStore } from "@/lib/store/sound-store";

const button3DVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-black rounded-lg text-white transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        "3d-green":
          "bg-[#74D700] hover:bg-[#7ce006] shadow-[0_8px_0_#4ca600] active:shadow-none active:translate-y-[8px]",
        "3d-blue":
          "bg-[#00A3FF] hover:bg-[#00B3FF] shadow-[0_8px_0_#0073B3] active:shadow-none active:translate-y-[8px]",
        "3d-red":
          "bg-[#FF4757] hover:bg-[#FF5767] shadow-[0_8px_0_#CC3946] active:shadow-none active:translate-y-[8px]",
        "3d-purple":
          "bg-[#A855F7] hover:bg-[#B865F7] shadow-[0_8px_0_#7E3FB8] active:shadow-none active:translate-y-[8px]",
        "3d-orange":
          "bg-[#FF9500] hover:bg-[#FFA500] shadow-[0_8px_0_#CC7700] active:shadow-none active:translate-y-[8px]",
        "3d-yellow":
          "bg-[#FFD700] hover:bg-[#FFE700] shadow-[0_8px_0_#CCB000] active:shadow-none active:translate-y-[8px]",
      },
      size: {
        "3d-tiny": "h-10 px-2.5 text-sm",
        "3d-sm": "h-12 px-6 text-xl",
        "3d-md": "h-16 px-10 text-2xl",
        "3d-lg": "h-20 px-14 text-3xl",
        "3d-xl": "h-24 px-16 text-4xl",
      },
    },
    defaultVariants: {
      variant: "3d-green",
      size: "3d-md",
    },
  }
);

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3DVariants> {
  asChild?: boolean;
  disableSound?: boolean;
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  (
    {
      className,
      variant = "3d-green",
      size = "3d-md",
      asChild = false,
      disableSound = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const playSound = useSoundStore((state) => state.playSound);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableSound && !props.disabled) {
        playSound("button-click");
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(button3DVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {/* Glossy Top Highlight */}
        {/* <div className="absolute top-0 left-0 right-0 h-1/2 bg-linear-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none" /> */}
        {/* Inner Highlight Ring */}
        {/* <div className="absolute inset-0 rounded-3xl ring-2 ring-inset ring-white/20 pointer-events-none" /> */}
        {/* Content */}
        <span
          className="z-10 drop-shadow-md"
          style={{ textShadow: "0px 2px 0px rgba(0,0,0,0.1)" }}
        >
          {props.children}
        </span>
      </Comp>
    );
  }
);
Button3D.displayName = "Button3D";

export { Button3D, button3DVariants };
