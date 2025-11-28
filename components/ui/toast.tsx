"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

interface ToastProps extends Omit<Toast, "id"> {
  onClose: () => void;
}

export function Toast({
  title,
  description,
  action,
  variant = "default",
  onClose,
}: ToastProps) {
  const variantStyles = {
    default: "bg-card border-border",
    success:
      "bg-green-500/10 border-green-500/50 text-green-900 dark:text-green-100",
    error: "bg-red-500/10 border-red-500/50 text-red-900 dark:text-red-100",
    warning:
      "bg-yellow-500/10 border-yellow-500/50 text-yellow-900 dark:text-yellow-100",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full max-w-md items-start gap-3 overflow-hidden rounded-lg border-2 p-4 shadow-lg transition-all",
        "animate-in slide-in-from-right-full duration-300",
        variantStyles[variant]
      )}
    >
      <div className="flex-1 space-y-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      <button
        onClick={onClose}
        className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}
