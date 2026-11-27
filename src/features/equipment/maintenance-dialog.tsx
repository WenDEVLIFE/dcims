"use client";

import { useState } from "react";

import { CurrencyInput } from "@/components/shared/currency-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Equipment } from "@/types/domain";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSubmit: (input: {
    description: string;
    costCentavos: number;
    performedBy: string;
    completed: boolean;
  }) => { ok: boolean; error?: string };
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  equipment,
  onSubmit,
}: MaintenanceDialogProps) {
  const [description, setDescription] = useState("");
  const [costCentavos, setCostCentavos] = useState(0);
  const [performedBy, setPerformedBy] = useState("");
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!equipment) return null;

  function submit() {
    if (!description.trim()) return setError("Describe the maintenance work");
    const result = onSubmit({ description, costCentavos, performedBy, completed });
    if (!result.ok) return setError(result.error ?? "The maintenance could not be recorded");
    onOpenChange(false);
    setDescription("");
    setCostCentavos(0);
    setPerformedBy("");
    setCompleted(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record maintenance</DialogTitle>
          <DialogDescription>
            {equipment.assetCode} · starting maintenance marks it unavailable; completing it
            returns the asset to service.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maintenance-description">Work performed</Label>
            <Input
              id="maintenance-description"
              value={description}
              onChange={(event) => {
                setDescription(event.currentTarget.value);
                setError(null);
              }}
              placeholder="Replace hydraulic hose"
            />
          </div>

          <CurrencyInput
            label="Cost"
            value={costCentavos}
            onValueChange={(centavos) => setCostCentavos(centavos ?? 0)}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maintenance-by">Performed by</Label>
            <Input
              id="maintenance-by"
              value={performedBy}
              onChange={(event) => setPerformedBy(event.currentTarget.value)}
              placeholder="Service provider"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked === true)}
            />
            Mark this maintenance as completed now
          </label>

          {error && (
            <p role="alert" className="text-xs font-medium text-error">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            Save record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
