"use client";

import { ReactNode } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverContentProps } from "@radix-ui/react-popover";
import { TooltipContentProps } from "@radix-ui/react-tooltip";
import { Typography } from "../ui/typography";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";

const renderContent = (content: ReactNode) => {
  if (typeof content === "string") {
    return (
      <Typography variant="p" className="text-foreground text-center text-sm">
        {content}
      </Typography>
    );
  }
  return content;
};

type CommonContentProps = Pick<PopoverContentProps, keyof TooltipContentProps>;

export const AdaptiveHint = ({
  content,
  children,
  contentProps,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  contentProps?: CommonContentProps;
}) => {
  const isCoarse = useCoarsePointer();

  if (isCoarse) {
    return (
      <Popover>
        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
          {children}
        </PopoverTrigger>
        <PopoverContent {...contentProps}>
          {renderContent(content)}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger onClick={(e) => e.stopPropagation()}>
        {children}
      </TooltipTrigger>
      <TooltipContent {...contentProps}>
        {renderContent(content)}
      </TooltipContent>
    </Tooltip>
  );
};
