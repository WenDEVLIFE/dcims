"use client";

import type { ReactElement, ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

interface ChartContainerProps {
  title: string;
  description?: string;
  height?: number;
  /**
   * A single Recharts element. ResponsiveContainer measures one child, so the
   * prop is typed narrowly instead of accepting arbitrary nodes.
   */
  children: ReactElement;
  className?: string;
  action?: ReactNode;
}

/**
 * Chart frame. Recharts needs measured height, so the container owns it and
 * children stay pure chart primitives that read the --chart-* tokens.
 */
export function ChartContainer({
  title,
  description,
  height = 280,
  children,
  className,
  action,
}: ChartContainerProps) {
  return (
    <figure
      className={cn("rounded-card border border-border bg-card p-4", className)}
    >
      <figcaption className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base leading-6 font-semibold">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[0.8125rem] leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </figcaption>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
