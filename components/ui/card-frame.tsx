import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardFrameVariants = cva(
    "relative inline-block outline-none transition-transform duration-200 bg-white",
    {
        variants: {
            variant: {
                default: "hover:scale-[1.02]",
                primary: "hover:scale-[1.02]",
                secondary: "hover:scale-[1.02]",
                accent: "hover:scale-[1.02]",
            },
            size: {
                default:
                    "p-[8px] pb-[10px] rounded-[1.75rem] shadow-[0_4px_0_#d0d0d0,0_14px_22px_-6px_rgba(0,0,0,0.18)]",

                tiny:
                    "p-[3px] pb-[2px] rounded-[0.75rem] shadow-[0_3px_0_#d0d0d0,0_10px_16px_-4px_rgba(0,0,0,0.15)]",

                sm:
                    "p-[4px] pb-[6px] rounded-[1rem] shadow-[0_3px_0_#d0d0d0,0_12px_20px_-6px_rgba(0,0,0,0.16)]",

                md:
                    "p-[4px] pb-[8px] rounded-[1.25rem] shadow-[0_4px_0_#d0d0d0,0_16px_24px_-6px_rgba(0,0,0,0.17)]",

                lg:
                    "p-[10px] pb-[12px] rounded-[2.25rem] shadow-[0_5px_0_#d0d0d0,0_20px_30px_-6px_rgba(0,0,0,0.2)]",

                xl:
                    "p-[12px] pb-[14px] rounded-[2.5rem] shadow-[0_6px_0_#d0d0d0,0_22px_34px_-6px_rgba(0,0,0,0.22)]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const cardInnerVariants = cva("block relative w-full overflow-hidden h-full", {
    variants: {
        variant: {
            default: "bg-white",
            primary: "bg-white",
            secondary: "bg-white",
            accent: "bg-white",
        },
        size: {
            default: "rounded-[1.5rem]",
            tiny: "rounded-[0.625rem]",
            sm: "rounded-[0.875rem]",
            md: "rounded-[1.125rem]",
            lg: "rounded-[2rem]",
            xl: "rounded-[2.25rem]",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

export interface CardFrameProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFrameVariants> {
    children?: React.ReactNode;
}

const CardFrame = React.forwardRef<HTMLDivElement, CardFrameProps>(
    ({ className, variant, size, children, ...props }, ref) => {
        return (
            <div
                className={cn(cardFrameVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                <div className={cn(cardInnerVariants({ variant, size }))}>
                    {children}
                </div>
            </div>
        );
    }
);
CardFrame.displayName = "CardFrame";

export { CardFrame, cardFrameVariants };
