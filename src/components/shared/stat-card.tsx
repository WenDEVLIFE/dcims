import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Single KPI surface. Values arrive pre-formatted so this stays free of
 * currency or date logic.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("gap-2 px-4 py-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] leading-5 font-medium text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        )}
      </div>
      <p className="font-heading text-2xl leading-8 font-bold tabular-nums text-foreground md:text-[1.75rem] md:leading-9">
        {value}
      </p>
      {hint && (
        <p className="text-xs leading-4 text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}
