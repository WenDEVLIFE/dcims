"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCentavos } from "@/lib/currency";
import { formatQuantity } from "@/lib/format";
import type { Material, ProjectMaterial } from "@/types/domain";

interface ConsumptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocations: Array<{ allocation: ProjectMaterial; material: Material }>;
  onSubmit: (input: {
    materialId: string;
    quantity: number;
  }) => { ok: boolean; error?: string };
}

export function ConsumptionDialog({
  open,
  onOpenChange,
  allocations,
  onSubmit,
}: ConsumptionDialogProps) {
  const [materialId, setMaterialId] = useState(allocations[0]?.material.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const selected = allocations.find((entry) => entry.material.id === materialId);
  const parsed = Number(quantity);
  const valid =
    selected !== undefined &&
    Number.isFinite(parsed) &&
    parsed > 0 &&
    parsed <= selected.allocation.quantity;

  function submit() {
    setError(null);
    const result = onSubmit({ materialId, quantity: parsed });
    if (!result.ok) {
      setError(result.error ?? "The consumption could not be recorded");
      return;
    }
    onOpenChange(false);
    setQuantity("1");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record material consumption</DialogTitle>
          <DialogDescription>
            Quantity is deducted from material already on site. Warehouse balances are
            untouched — that stock left the warehouse when it was released.
          </DialogDescription>
        </DialogHeader>

        {allocations.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-[0.8125rem] text-muted-foreground">
            This project holds no allocated materials yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="consumption-material">Allocated material</Label>
              <Select
                value={materialId}
                onValueChange={(value) => {
                  setMaterialId(value);
                  setError(null);
                }}
              >
                <SelectTrigger id="consumption-material">
                  <SelectValue placeholder="Choose a material" />
                </SelectTrigger>
                <SelectContent>
                  {allocations.map(({ allocation, material }) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} — {formatQuantity(allocation.quantity, material.unit)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selected && (
                <p className="text-xs text-muted-foreground">
                  On site: {formatQuantity(selected.allocation.quantity, selected.material.unit)} ·
                  Unit cost {formatCentavos(selected.material.unitCostCentavos)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="consumption-quantity">Consumed quantity</Label>
              <Input
                id="consumption-quantity"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.currentTarget.value);
                  setError(null);
                }}
                aria-invalid={error ? true : undefined}
              />
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-error">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!valid}>
            Record consumption
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
