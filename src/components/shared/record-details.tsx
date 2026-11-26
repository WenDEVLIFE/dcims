import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface RecordDetailItem {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

interface RecordDetailsProps {
  items: RecordDetailItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

const COLUMN_CLASSES: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function RecordDetails({
  items,
  columns = 2,
  className,
}: RecordDetailsProps) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", COLUMN_CLASSES[columns], className)}>
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs leading-4 font-medium text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              "min-w-0 text-sm leading-5",
              item.mono && "font-mono text-[0.8125rem]",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
