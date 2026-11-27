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
import { formatCentavos } from "@/lib/currency";
import { formatQuantity } from "@/lib/format";
import type { Material, PurchaseOrder } from "@/types/domain";

interface ReceiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: PurchaseOrder | null;
  materials: Material[];
  onSubmit: (receipts: Record<string, number>) => { ok: boolean; error?: string };
}

export function ReceiveDialog({
  open,
  onOpenChange,
  order,
  materials,
  onSubmit,
}: ReceiveDialogProps) {
  const [receipts, setReceipts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const warehouseId = order.warehouseId;

  function submit() {
    setError(null);
    const payload: Record<string, number> = {};

    for (const item of order!.items) {
      const remaining = item.orderedQuantity - item.receivedQuantity;
      if (remaining <= 0) continue;

      const raw = receipts[item.id];
      const quantity = raw === undefined ? remaining : Number(raw);

      if (!Number.isFinite(quantity) || quantity < 0) {
        return setError("Received quantities must be zero or greater");
      }
      if (quantity > remaining) {
        return setError("A line exceeds the outstanding quantity");
      }
      if (quantity > 0) payload[item.id] = quantity;
    }

    if (Object.keys(payload).length === 0) {
      return setError("Enter a received quantity for at least one line");
    }

    const result = onSubmit(payload);
    if (!result.ok) return setError(result.error ?? "The delivery could not be received");
    onOpenChange(false);
    setReceipts({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Receive {order.reference}</DialogTitle>
          <DialogDescription>
            Received quantities increase stock in the destination warehouse and update the
            weighted-average cost. Partial deliveries are supported; over-receiving is not.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {order.items.map((item) => {
            const material = materials.find((entry) => entry.id === item.materialId);
            const remaining = item.orderedQuantity - item.receivedQuantity;

            return (
              <div
                key={item.id}
                className="flex items-end justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {material?.name ?? "Material"}
                  </p>
                  <p className="text-[0.6875rem] text-muted-foreground">
                    Ordered {formatQuantity(item.orderedQuantity, material?.unit ?? "piece")} ·
                    received {formatQuantity(item.receivedQuantity, material?.unit ?? "piece")} ·
                    remaining {formatQuantity(remaining, material?.unit ?? "piece")} ·{" "}
                    {formatCentavos(item.unitCostCentavos)} each
                  </p>
                  <p className="text-[0.6875rem] text-muted-foreground">
                    Into {warehouseId === order.warehouseId ? "the destination warehouse" : "warehouse"}
                  </p>
                </div>
                <div className="w-24">
                  <Input
                    aria-label={`Received quantity for ${material?.name ?? "material"}`}
                    type="number"
                    min={0}
                    max={remaining}
                    step="any"
                    inputMode="decimal"
                    placeholder={`${remaining}`}
                    value={receipts[item.id] ?? ""}
                    disabled={remaining <= 0}
                    onChange={(event) => {
                      setReceipts((current) => ({
                        ...current,
                        [item.id]: event.currentTarget.value,
                      }));
                      setError(null);
                    }}
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            Receive stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
