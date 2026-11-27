"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
  label?: string;
  exporting?: boolean;
  className?: string;
}

/**
 * CSV export trigger. Serialisation lives in the export utility so escaping
 * and formula-injection protection exist in exactly one place.
 */
export function ExportButton({
  onExport,
  disabled = false,
  label = "Export CSV",
  exporting = false,
  className,
}: ExportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={disabled || exporting}
      className={className}
    >
      <Download aria-hidden="true" />
      {exporting ? "Exporting…" : label}
    </Button>
  );
}
