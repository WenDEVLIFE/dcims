import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Presentational field wrapper: label, hint, error, and required marker.
 * It deliberately owns no validation state, so it works with React Hook Form,
 * TanStack Form, or plain controlled inputs.
 */
export function FormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm leading-5 font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-error" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs leading-4 text-muted-foreground">{description}</p>
      )}
      {error && (
        <p role="alert" className="text-xs leading-4 font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
