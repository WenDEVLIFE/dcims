import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  neutral: "border-neutral/25 bg-neutral-background text-neutral-foreground",
  info: "border-info/25 bg-info-background text-info-foreground",
  success: "border-success/25 bg-success-background text-success-foreground",
  warning: "border-warning/25 bg-warning-background text-warning-foreground",
  error: "border-error/25 bg-error-background text-error-foreground",
} as const;

export type StatusTone = keyof typeof TONE_CLASSES;

/**
 * Common domain statuses mapped to a semantic tone. Unknown statuses fall back
 * to neutral rather than inventing a colour, and the label always carries the
 * meaning so the badge never relies on colour alone.
 */
const STATUS_TONES: Record<string, StatusTone> = {
  draft: "neutral",
  pending: "warning",
  approved: "info",
  ordered: "info",
  "partially fulfilled": "warning",
  "partially received": "warning",
  fulfilled: "success",
  received: "success",
  completed: "success",
  available: "success",
  "in stock": "success",
  assigned: "info",
  "low stock": "warning",
  "under maintenance": "warning",
  rejected: "error",
  cancelled: "neutral",
  damaged: "error",
  retired: "neutral",
  "out of stock": "error",
};

export function statusTone(status: string): StatusTone {
  return STATUS_TONES[status.trim().toLowerCase()] ?? "neutral";
}

interface StatusBadgeProps {
  status: string;
  tone?: StatusTone;
  className?: string;
  children?: ReactNode;
}

export function StatusBadge({
  status,
  tone,
  className,
  children,
}: StatusBadgeProps) {
  const resolved = tone ?? statusTone(status);

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-md border px-2 text-xs leading-4 font-semibold whitespace-nowrap",
        TONE_CLASSES[resolved],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          resolved === "success" && "bg-success",
          resolved === "warning" && "bg-warning",
          resolved === "error" && "bg-error",
          resolved === "info" && "bg-info",
          resolved === "neutral" && "bg-neutral",
        )}
      />
      {children ?? status}
    </span>
  );
}
