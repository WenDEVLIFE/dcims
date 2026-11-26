"use client";

import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Manila",
});

function formatRange(range: DateRange | undefined): string {
  if (!range?.from) return "Any date";
  const from = DATE_FORMATTER.format(range.from);
  if (!range.to) return from;
  return `${from} – ${DATE_FORMATTER.format(range.to)}`;
}

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onValueChange: (range: DateRange | undefined) => void;
  label?: string;
  className?: string;
}

export function DateRangeFilter({
  value,
  onValueChange,
  label = "Date range",
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value?.from);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("gap-2", hasValue && "border-ring/60")}
            aria-label={`${label}: ${formatRange(value)}`}
          >
            <CalendarDays aria-hidden="true" />
            <span className="tabular-nums">{formatRange(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            numberOfMonths={1}
            selected={value}
            onSelect={onValueChange}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear date range"
          onClick={() => onValueChange(undefined)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
