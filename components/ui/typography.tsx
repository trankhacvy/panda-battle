import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      // Headings
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      // Body text
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      // Special variants
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      pre: "overflow-x-auto rounded-lg bg-muted p-4",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      // Game-themed variants
      "game-title":
        "text-4xl sm:text-5xl md:text-6xl font-black bg-linear-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent tracking-wide",
      "game-heading":
        "text-2xl sm:text-3xl font-bold text-foreground tracking-tight",
      "game-body": "text-base sm:text-lg text-foreground leading-relaxed",
      "game-caption":
        "text-xs sm:text-sm text-muted-foreground uppercase tracking-wider",
      "game-label":
        "text-sm font-semibold text-foreground uppercase tracking-wider",
      "page-title": "scroll-m-20 text-2xl font-semibold tracking-tight",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive",
      accent: "text-accent-foreground",
      yellow: "text-yellow-500",
    },
  },
  defaultVariants: {
    variant: "p",
    color: "default",
  },
});

type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label";

// Omit "color" from HTMLAttributes to avoid conflict with variant prop
export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?: TypographyElement;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant,
      size,
      weight,
      align,
      color,
      asChild = false,
      as,
      ...props
    },
    ref
  ) => {
    // Determine the HTML element to use with switch case
    let Component: React.ElementType = "p";

    if (as) {
      Component = as;
    } else {
      switch (variant) {
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          Component = variant;
          break;
        case "code":
          Component = "code";
          break;
        case "pre":
          Component = "pre";
          break;
        case "blockquote":
          Component = "blockquote";
          break;
        case "list":
          Component = "ul";
          break;
        case "lead":
        case "large":
        case "small":
        case "muted":
        case "p":
          Component = "p";
          break;
        case "game-label":
          Component = "label";
          break;
        case "game-title":
        case "game-heading":
        case "game-body":
        case "game-caption":
          Component = "p";
          break;
        case "page-title":
          Component = "h3";
          break;
        default:
          Component = "p";
          break;
      }
    }

    const Comp = asChild ? Slot : Component;

    return (
      <Comp
        className={cn(
          typographyVariants({ variant, size, weight, align, color }),
          className
        )}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

export { Typography, typographyVariants };
