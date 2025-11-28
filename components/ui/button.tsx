import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Game-specific variants
        primary:
          "w-[250px] tracking-[2px] rounded-lg text-[#ffc000] text-lg font-normal [text-shadow:0_1px_3px_#000] bg-[radial-gradient(circle,#8b0000,#8b0000)] border-t-[4px] border-t-[ridge] border-t-[#ffb000] border-l-[4px] border-l-[groove] border-l-[#ffb000] border-r-[4px] border-r-[ridge] border-r-[#ffb000] border-b-[4px] border-b-[groove] border-b-[#ffb000] [box-shadow:inset_0px_0px_5px_3px_rgba(1,1,1,0.3)] hover:bg-[radial-gradient(circle,#e52b2b,#8b0000)] hover:[box-shadow:0px_0_5px_5px_rgba(255,255,255,0.2)] active:bg-[radial-gradient(circle,#ec6a6a,#e52b2b)] active:[box-shadow:0px_0_5px_5px_rgba(255,255,255,0.2)] transition-all duration-200",
        "game-secondary":
          "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-lg hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 border-2 border-indigo-400/50 hover:from-indigo-600 hover:to-purple-600",
        danger:
          "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 border-2 border-red-400/50 hover:from-red-600 hover:to-orange-600",
        game: "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 border-2 border-emerald-400/50",
        attack:
          "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 border-2 border-red-400/50",
        defend:
          "bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95 border-2 border-blue-400/50",
        energy:
          "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95 border-2 border-purple-400/50",
        warning:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold shadow-lg hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 border-2 border-yellow-400/50",
        // 3D Button variants inspired by PlayButton
        "3d-green":
          "relative bg-[#74D700] hover:bg-[#7ce006] text-white font-black rounded-3xl shadow-[0_8px_0_#4ca600] active:shadow-none active:translate-y-[8px] transition-all duration-150 ease-in-out",
        "3d-blue":
          "relative bg-[#00A3FF] hover:bg-[#00B3FF] text-white font-black rounded-3xl shadow-[0_8px_0_#0073B3] active:shadow-none active:translate-y-[8px] transition-all duration-150 ease-in-out",
        "3d-red":
          "relative bg-[#FF4757] hover:bg-[#FF5767] text-white font-black rounded-3xl shadow-[0_8px_0_#CC3946] active:shadow-none active:translate-y-[8px] transition-all duration-150 ease-in-out",
        "3d-purple":
          "relative bg-[#A855F7] hover:bg-[#B865F7] text-white font-black rounded-3xl shadow-[0_8px_0_#7E3FB8] active:shadow-none active:translate-y-[8px] transition-all duration-150 ease-in-out",
        "3d-orange":
          "relative bg-[#FF9500] hover:bg-[#FFA500] text-white font-black rounded-3xl shadow-[0_8px_0_#CC7700] active:shadow-none active:translate-y-[8px] transition-all duration-150 ease-in-out",
        "3d-yellow":
          "relative bg-[#FFD700] hover:bg-[#FFE700] text-white font-black rounded-3xl shadow-[0_8px_0_#CCB000] active:shadow-none active:translate-y-[8px] transition-all duration-150 ease-in-out",
      },
      size: {
        default: "h-11 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 text-xs min-h-[36px]",
        lg: "h-12 rounded-md px-8 text-base min-h-[48px]",
        xl: "h-14 rounded-lg px-10 text-lg min-h-[56px]",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
        // 3D Button sizes
        "3d-sm": "h-12 px-6 text-xl",
        "3d-md": "h-16 px-10 text-2xl",
        "3d-lg": "h-20 px-14 text-3xl",
        "3d-xl": "h-24 px-16 text-4xl",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const is3DVariant = variant?.startsWith("3d-");

    if (is3DVariant) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {/* Glossy Top Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-3xl pointer-events-none" />
          {/* Inner Highlight Ring */}
          <div className="absolute inset-0 rounded-3xl ring-2 ring-inset ring-white/20 pointer-events-none" />
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

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// 3D Button with white shell wrapper (like PlayButton)
export interface Button3DProps extends ButtonProps {
  shellClassName?: string;
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  (
    {
      className,
      shellClassName,
      variant = "3d-green",
      size = "3d-md",
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative inline-block", shellClassName)}>
        {/* White Shell (The "Tub") */}
        <div className="bg-white rounded-[2rem] p-2 pb-4 shadow-xl select-none">
          <Button
            ref={ref}
            variant={variant}
            size={size}
            className={className}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Button3D.displayName = "Button3D";

export { Button, Button3D, buttonVariants };
