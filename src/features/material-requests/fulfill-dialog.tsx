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
import { formatQuantity } from "@/lib/format";
import type { InventoryBalance, Material, MaterialRequest, Warehouse } from "@/types/domain";

interface FulfillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaterialRequest | null;
  materials: Material[];
  warehouses: Warehouse[];
  balances: InventoryBalance[];
  onSubmit: (input: {
    warehouseId: string;
    quantities: Record<string, number>;
  }) => { ok: boolean; error?: string };
}

export function FulfillDialog({
  open,
  onOpenChange,
  request,
  materials,
  warehouses,
  balances,
  onSubmit,
}: FulfillDialogProps) {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  function availableFor(materialId: string): number {
    return (
      balances.find(
        (balance) =>
          balance.materialId === materialId && balance.warehouseId === warehouseId,
      )?.quantity ?? 0
    );
  }

  function outstandingFor(itemId: string, approved: number, fulfilled: number): number {
    return Math.max(0, approved - fulfilled);
  }

  function submit() {
    if (!request) return;
    setError(null);
    const payload: Record<string, number> = {};

    for (const item of request.items) {
      const outstanding = outstandingFor(item.id, item.approvedQuantity, item.fulfilledQuantity);
      if (outstanding <= 0) continue;

      const raw = quantities[item.id];
      const requested = raw === undefined ? outstanding : Number(raw);
      if (!Number.isFinite(requested) || requested < 0) {
        return setError("Quantities must be zero or greater");
      }
      if (requested > outstanding) {
        return setError("A line exceeds the remaining approved quantity");
      }
      if (requested > availableFor(item.materialId)) {
        return setError("A line exceeds the stock in the selected warehouse");
      }
      if (requested > 0) payload[item.id] = requested;
    }

    if (Object.keys(payload).length === 0) {
      return setError("Enter a quantity for at least one line");
    }

    const result = onSubmit({ warehouseId, quantities: payload });
    if (!result.ok) {
      setError(result.error ?? "The request could not be fulfilled");
      return;
    }
    onOpenChange(false);
    setQuantities({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Fulfil {request.reference}</DialogTitle>
          <DialogDescription>
            Releasing stock deducts the warehouse balance and places the material on the
            project site. Partial fulfilment is allowed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fulfil-warehouse">Source warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger id="fulfil-warehouse">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            {request.items.map((item) => {
              const material = materials.find((entry) => entry.id === item.materialId);
              const outstanding = outstandingFor(
                item.id,
                item.approvedQuantity,
                item.fulfilledQuantity,
              );
              const available = availableFor(item.materialId);

              return (
                <div
                  key={item.id}
                  className="flex items-end justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{material?.name ?? "Material"}</p>
                    <p className="text-[0.6875rem] text-muted-foreground">
                      Outstanding {formatQuantity(outstanding, material?.unit ?? "piece")} ·
                      available here {formatQuantity(available, material?.unit ?? "piece")}
                    </p>
                  </div>
                  <div className="w-24">
                    <Input
                      aria-label={`Quantity to release for ${material?.name ?? "material"}`}
                      type="number"
                      min={0}
                      max={Math.min(outstanding, available)}
                      step="any"
                      inputMode="decimal"
                      placeholder={`${Math.min(outstanding, available)}`}
                      value={quantities[item.id] ?? ""}
                      onChange={(event) => {
                        setQuantities((current) => ({
                          ...current,
                          [item.id]: event.currentTarget.value,
                        }));
                        setError(null);
                      }}
                      disabled={outstanding <= 0 || available <= 0}
                    />
                  </div>
                </div>
              );
            })}
          </div>

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
            Release stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
