import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

const iconButtonVariants = cva(
  "relative inline-flex items-center justify-center rounded-full text-white transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      color: {
        red: "bg-[#FF4757] hover:bg-[#FF5767] shadow-[0_6px_0_#CC3946,0_0_0_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(255,71,87,0.4)] active:shadow-[0_0_0_4px_rgba(255,255,255,0.3)] active:translate-y-[6px]",
        green:
          "bg-[#74D700] hover:bg-[#7ce006] shadow-[0_6px_0_#4ca600,0_0_0_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(116,215,0,0.4)] active:shadow-[0_0_0_4px_rgba(255,255,255,0.3)] active:translate-y-[6px]",
        purple:
          "bg-[#A855F7] hover:bg-[#B865F7] shadow-[0_6px_0_#7E3FB8,0_0_0_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(168,85,247,0.4)] active:shadow-[0_0_0_4px_rgba(255,255,255,0.3)] active:translate-y-[6px]",
        yellow:
          "bg-[#FFD700] hover:bg-[#FFE700] shadow-[0_6px_0_#CCB000,0_0_0_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(255,215,0,0.4)] active:shadow-[0_0_0_4px_rgba(255,255,255,0.3)] active:translate-y-[6px]",
        cyan: "bg-[#00D4FF] hover:bg-[#00E4FF] shadow-[0_6px_0_#00A3CC,0_0_0_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(0,212,255,0.4)] active:shadow-[0_0_0_4px_rgba(255,255,255,0.3)] active:translate-y-[6px]",
        pink: "bg-[#FF69B4] hover:bg-[#FF79C4] shadow-[0_6px_0_#CC5490,0_0_0_4px_rgba(255,255,255,0.3),0_10px_20px_rgba(255,105,180,0.4)] active:shadow-[0_0_0_4px_rgba(255,255,255,0.3)] active:translate-y-[6px]",
      },
      size: {
        sm: "size-12 [&_svg]:size-5",
        md: "size-16 [&_svg]:size-7",
        lg: "size-20 [&_svg]:size-9",
        xl: "size-24 [&_svg]:size-11",
      },
    },
    defaultVariants: {
      color: "green",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean;
  disableSound?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      color = "green",
      size = "md",
      asChild = false,
      disableSound = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { play, SOUNDS } = useSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disableSound) {
        play(SOUNDS.BUTTON_CLICK);
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(iconButtonVariants({ color, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        <span className="z-10 drop-shadow-md flex items-center justify-center">
          {props.children}
        </span>
      </Comp>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
