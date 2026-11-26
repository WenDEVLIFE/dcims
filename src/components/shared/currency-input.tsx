"use client";

import { useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { formatCentavos, parseAmountToCentavos } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  /** Current value in integer centavos. */
  value: number | null;
  onValueChange: (centavos: number | null) => void;
  label: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Peso input that keeps the caller on integer centavos. The visible string is
 * formatted on blur and left as typed while focused, so editing never fights
 * the formatter.
 */
export function CurrencyInput({
  value,
  onValueChange,
  label,
  description,
  error,
  disabled,
  className,
}: CurrencyInputProps) {
  const id = useId();
  const describedBy = description || error ? `${id}-hint` : undefined;
  const [draft, setDraft] = useState<string | null>(null);

  const display = draft ?? (value === null ? "" : formatCentavos(value));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm leading-5 font-medium">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground"
        >
          ₱
        </span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={display}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="pl-6 text-right tabular-nums"
          onChange={(event) => {
            const next = event.currentTarget.value;
            setDraft(next);
            onValueChange(parseAmountToCentavos(next));
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
      {description && !error && (
        <p id={`${id}-hint`} className="text-xs leading-4 text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-hint`} className="text-xs leading-4 font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
