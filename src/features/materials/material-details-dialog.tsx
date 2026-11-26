"use client";

import { RecordDetails } from "@/components/shared/record-details";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InventoryBalance, Material, StockMovement, Warehouse } from "@/types/domain";
import { formatCentavos } from "@/lib/currency";
import { formatQuantity, formatDateTime, unitLabel } from "@/lib/format";

interface MaterialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material | null;
  balances: InventoryBalance[];
  warehouses: Warehouse[];
  movements: StockMovement[];
}

export function MaterialDetailsDialog({
  open,
  onOpenChange,
  material,
  balances,
  warehouses,
  movements,
}: MaterialDetailsDialogProps) {
  if (!material) return null;

  const totalQuantity = balances
    .filter((balance) => balance.materialId === material.id)
    .reduce((total, balance) => total + balance.quantity, 0);

  const byWarehouse = balances
    .filter((balance) => balance.materialId === material.id)
    .map((balance) => ({
      warehouse: warehouses.find((item) => item.id === balance.warehouseId),
      quantity: balance.quantity,
    }))
    .sort((left, right) => right.quantity - left.quantity);

  const recent = movements
    .filter((movement) => movement.materialId === material.id)
    .slice(-5)
    .reverse();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {material.name}
            <StatusBadge
              status={
                material.status === "discontinued" ? "Archived" : "Active"
              }
              tone={material.status === "discontinued" ? "neutral" : "success"}
            />
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {material.sku}
          </DialogDescription>
        </DialogHeader>

        <RecordDetails
          columns={2}
          items={[
            { label: "Measurement unit", value: unitLabel(material.unit) },
            {
              label: "Average unit cost",
              value: formatCentavos(material.unitCostCentavos),
            },
            { label: "Reorder point", value: formatQuantity(material.reorderPoint, material.unit) },
            {
              label: "Total on hand",
              value: formatQuantity(totalQuantity, material.unit),
            },
          ]}
        />

        <div>
          <h3 className="text-sm font-semibold">Stock by warehouse</h3>
          {byWarehouse.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              No stock recorded in any warehouse.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border rounded-md border border-border">
              {byWarehouse.map(({ warehouse, quantity }) => (
                <li
                  key={warehouse?.id ?? quantity}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span>{warehouse?.name ?? "Unknown warehouse"}</span>
                  <span className="tabular-nums">
                    {formatQuantity(quantity, material.unit)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold">Recent movements</h3>
          {recent.length === 0 ? (
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              No transactions recorded for this material.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {recent.map((movement) => (
                <li
                  key={movement.id}
                  className="flex items-center justify-between gap-3 text-[0.8125rem]"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {movement.reference}
                  </span>
                  <span className="tabular-nums">
                    {formatQuantity(movement.quantity, material.unit)} ·{" "}
                    {movement.type.replace("-", " ")}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(movement.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
