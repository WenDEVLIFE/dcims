import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataTableToolbarProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function DataTableToolbar({
  children,
  actions,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
