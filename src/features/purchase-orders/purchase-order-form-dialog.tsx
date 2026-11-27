"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CurrencyInput } from "@/components/shared/currency-input";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCentavos } from "@/lib/currency";
import { calculatePurchaseOrderTotals } from "@/lib/procurement";
import type {
  Material,
  PurchaseOrder,
  Supplier,
  Warehouse,
} from "@/types/domain";

interface Line {
  key: string;
  materialId: string;
  quantity: string;
  unitCostCentavos: number;
}

export interface PurchaseOrderFormValues {
  supplierId: string;
  warehouseId: string;
  expectedDeliveryDate?: string;
  discountCentavos?: number;
  deliveryFeeCentavos?: number;
  notes?: string;
  items: Array<{
    materialId: string;
    orderedQuantity: number;
    unitCostCentavos: number;
  }>;
}

interface PurchaseOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  warehouses: Warehouse[];
  materials: Material[];
  order?: PurchaseOrder;
  onSubmit: (values: PurchaseOrderFormValues) => { ok: boolean; error?: string };
}

export function PurchaseOrderFormDialog(props: PurchaseOrderFormDialogProps) {
  if (!props.open) return null;
  return <FormContent key={props.order?.id ?? "new"} {...props} />;
}

function FormContent({
  onOpenChange,
  suppliers,
  warehouses,
  materials,
  order,
  onSubmit,
}: PurchaseOrderFormDialogProps) {
  const activeSuppliers = suppliers.filter((supplier) => supplier.status === "active");
  const activeMaterials = materials.filter((material) => material.status === "active");

  const [supplierId, setSupplierId] = useState(order?.supplierId ?? activeSuppliers[0]?.id ?? "");
  const [warehouseId, setWarehouseId] = useState(order?.warehouseId ?? warehouses[0]?.id ?? "");
  const [expected, setExpected] = useState(order?.expectedDeliveryDate ?? "");
  const [discount, setDiscount] = useState(order?.discountCentavos ?? 0);
  const [deliveryFee, setDeliveryFee] = useState(order?.deliveryFeeCentavos ?? 0);
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [lines, setLines] = useState<Line[]>(() =>
    order && order.items.length > 0
      ? order.items.map((item, index) => ({
          key: `line-${index + 1}`,
          materialId: item.materialId,
          quantity: String(item.orderedQuantity),
          unitCostCentavos: item.unitCostCentavos,
        }))
      : [{ key: "line-1", materialId: "", quantity: "1", unitCostCentavos: 0 }],
  );
  const [error, setError] = useState<string | null>(null);

  const totals = calculatePurchaseOrderTotals(
    lines
      .filter((line) => line.materialId !== "")
      .map((line) => ({
        orderedQuantity: Number(line.quantity) || 0,
        unitCostCentavos: line.unitCostCentavos,
      })),
    { discountCentavos: discount, deliveryFeeCentavos: deliveryFee },
  );

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setError(null);
  }

  function selectMaterial(key: string, materialId: string) {
    const material = activeMaterials.find((item) => item.id === materialId);
    updateLine(key, {
      materialId,
      unitCostCentavos: material?.unitCostCentavos ?? 0,
    });
  }

  function submit() {
    setError(null);
    if (!supplierId) return setError("Choose a supplier");
    if (!warehouseId) return setError("Choose a destination warehouse");

    const items = lines
      .filter((line) => line.materialId !== "")
      .map((line) => ({
        materialId: line.materialId,
        orderedQuantity: Number(line.quantity),
        unitCostCentavos: line.unitCostCentavos,
      }));

    if (items.length === 0) return setError("Add at least one material");
    if (items.some((item) => !Number.isFinite(item.orderedQuantity) || item.orderedQuantity <= 0)) {
      return setError("Every line needs an ordered quantity greater than zero");
    }

    const result = onSubmit({
      supplierId,
      warehouseId,
      expectedDeliveryDate: expected || undefined,
      discountCentavos: discount,
      deliveryFeeCentavos: deliveryFee,
      notes: notes.trim() || undefined,
      items,
    });
    if (!result.ok) return setError(result.error ?? "The order could not be saved");
    onOpenChange(false);
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{order ? `Edit ${order.reference}` : "New purchase order"}</DialogTitle>
          <DialogDescription>
            Orders start as drafts. Receiving is the only step that adds stock to the
            destination warehouse.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="po-supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="po-supplier">
                  <SelectValue placeholder="Choose a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {activeSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="po-warehouse">Deliver to</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger id="po-warehouse">
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="po-expected">Expected delivery</Label>
              <Input
                id="po-expected"
                type="date"
                value={expected}
                onChange={(event) => setExpected(event.currentTarget.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Line items</Label>
            {lines.map((line, index) => (
              <div key={line.key} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_7rem_9rem_auto]">
                <Select value={line.materialId} onValueChange={(value) => selectMaterial(line.key, value)}>
                  <SelectTrigger aria-label={`Material ${index + 1}`}>
                    <SelectValue placeholder="Choose a material" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  aria-label={`Ordered quantity ${index + 1}`}
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={line.quantity}
                  onChange={(event) => updateLine(line.key, { quantity: event.currentTarget.value })}
                />
                <CurrencyInput
                  label={`Unit cost ${index + 1}`}
                  value={line.unitCostCentavos}
                  onValueChange={(centavos) => updateLine(line.key, { unitCostCentavos: centavos ?? 0 })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove line ${index + 1}`}
                  disabled={lines.length === 1}
                  onClick={() => setLines((current) => current.filter((entry) => entry.key !== line.key))}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() =>
                setLines((current) => [
                  ...current,
                  { key: `line-${current.length + 1}-${Date.now()}`, materialId: "", quantity: "1", unitCostCentavos: 0 },
                ])
              }
            >
              <Plus aria-hidden="true" />
              Add line
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrencyInput label="Discount" value={discount} onValueChange={(value) => setDiscount(value ?? 0)} />
            <CurrencyInput
              label="Delivery fee"
              value={deliveryFee}
              onValueChange={(value) => setDeliveryFee(value ?? 0)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="po-notes">Notes</Label>
            <Textarea
              id="po-notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-md border border-border px-3 py-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatCentavos(totals.subtotalCentavos)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Discount</dt>
              <dd className="tabular-nums">−{formatCentavos(totals.discountCentavos)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Delivery</dt>
              <dd className="tabular-nums">{formatCentavos(totals.deliveryFeeCentavos)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="font-semibold tabular-nums">{formatCentavos(totals.totalCentavos)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-[0.8125rem] text-error-foreground">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {order ? "Save draft" : "Save as draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
