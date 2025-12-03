import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "./button";
import { RoundButton } from "./round-button";
import { CardFrame } from "./card-frame";
import { cn } from "@/lib/utils";

const bonusCardVariants = cva("", {
  variants: {
    size: {
      sm: "max-w-[240px]",
      md: "max-w-[320px]",
      lg: "max-w-[380px]",
      xl: "max-w-[440px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface BonusCardProps extends VariantProps<typeof bonusCardVariants> {
  title?: string;
  icon?: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}

export function BonusCard({
  title = "BONUS",
  icon = "🎁",
  size = "md",
  onOpen,
  onClose,
  className,
}: BonusCardProps) {
  const cardFrameSize = size === "sm" ? "md" : size === "md" ? "lg" : "xl";
  const iconSize = size === "sm" ? "text-4xl" : size === "md" ? "text-8xl" : "text-9xl";
  const questionSize = size === "sm" ? "text-3xl" : size === "md" ? "text-6xl" : "text-7xl";
  const sparkleSize = size === "sm" ? "text-xl" : size === "md" ? "text-4xl" : "text-5xl";
  const buttonSize = size === "sm" ? "sm" : size === "md" ? "lg" : "xl";
  const padding = size === "sm" ? "p-3" : size === "md" ? "p-6" : "p-8";
  const headerTextSize = size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-2xl";
  const headerPadding = size === "sm" ? "py-2 px-4" : "py-3 px-6";
  const contentPadding = size === "sm" ? "py-4" : "py-8";
  const marginBottom = size === "sm" ? "mb-3" : "mb-6";
  
  return (
    <CardFrame size={cardFrameSize} className={cn(bonusCardVariants({ size }), "w-full", className)}>
      <div className={cn("relative", padding)}>
        {/* Header with close button */}
        <div className={cn("relative", marginBottom)}>
          <div className={cn("bg-[#00D9FF] rounded-2xl shadow-[0_4px_0_#00A3CC]", headerPadding)}>
            <h2 className={cn("text-white font-black text-center tracking-wider", headerTextSize)}>
              {title}
            </h2>
          </div>
          {onClose && (
            <div className="absolute -top-2 -right-2">
              <RoundButton variant="blue" size="sm" onClick={onClose}>
                <X className="text-white" strokeWidth={3} />
              </RoundButton>
            </div>
          )}
        </div>

        {/* Icon/Content */}
        <div className={cn("flex flex-col items-center justify-center", contentPadding)}>
          {typeof icon === "string" ? (
            <div className={cn(iconSize, "animate-bounce mb-2")}>{icon}</div>
          ) : (
            <div className="mb-2">{icon}</div>
          )}
          <div className={cn(questionSize, "font-black text-[#A855F7] mb-1")}>?</div>
          <div className={cn("flex gap-2", sparkleSize)}>
            <span className="text-[#A855F7] animate-pulse">✨</span>
            <span className="text-[#FFD700] animate-pulse" style={{ animationDelay: "0.2s" }}>⭐</span>
            <span className="text-[#A855F7] animate-pulse" style={{ animationDelay: "0.4s" }}>✨</span>
          </div>
        </div>

        {/* Open Button */}
        {onOpen && (
          <div className="flex justify-center">
            <Button variant="warning" size={buttonSize as any} onClick={onOpen}>
              OPEN
            </Button>
          </div>
        )}
      </div>
    </CardFrame>
  );
}
