"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber, unitLabel } from "@/lib/format";
import type { DomainResult } from "@/lib/result";
import { warehouseTransferInputSchema, type WarehouseTransferValues } from "@/schemas/domain";
import type { InventoryBalance, Material, Warehouse } from "@/types/domain";

const selectClass = "h-9 w-full cursor-pointer rounded-md border border-input bg-background px-2.5 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-sm";

export function WarehouseTransferDialog({ source, destinations, stock, onClose, onTransfer }: {
  source: Warehouse;
  destinations: Warehouse[];
  stock: { material: Material; balance: InventoryBalance }[];
  onClose: () => void;
  onTransfer: (values: WarehouseTransferValues) => DomainResult<void>;
}) {
  const id = useId();
  const { control, register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<WarehouseTransferValues>({
      resolver: zodResolver(warehouseTransferInputSchema),
      defaultValues: { materialId: "", destinationWarehouseId: "", notes: "" },
    });
  const materialId = useWatch({ control, name: "materialId" });
  const selected = stock.find(({ material }) => material.id === materialId);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer stock</DialogTitle>
          <DialogDescription>Move material out of {source.name}. Both balances update together.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit((values) => {
          const result = onTransfer(values);
          if (result.ok) onClose();
          else setError("root", { message: result.error });
        })}>
          <FormField label="Material" htmlFor={`${id}-material`} required error={errors.materialId?.message}>
            <select id={`${id}-material`} className={selectClass} aria-required aria-invalid={Boolean(errors.materialId)} {...register("materialId")}>
              <option value="">Choose a material</option>
              {stock.map(({ material }) => <option key={material.id} value={material.id}>{material.name}</option>)}
            </select>
          </FormField>
          <FormField label="Destination warehouse" htmlFor={`${id}-destination`} required error={errors.destinationWarehouseId?.message}>
            <select id={`${id}-destination`} className={selectClass} aria-required aria-invalid={Boolean(errors.destinationWarehouseId)} {...register("destinationWarehouseId")}>
              <option value="">Choose a destination</option>
              {destinations.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </FormField>
          <FormField
            label="Quantity"
            htmlFor={`${id}-quantity`}
            description={selected ? `${formatNumber(selected.balance.quantity)} ${unitLabel(selected.material.unit)} available at source.` : undefined}
            required
            error={errors.quantity?.message}
          >
            <Input id={`${id}-quantity`} type="number" inputMode="decimal" step="any" aria-required aria-invalid={Boolean(errors.quantity)} {...register("quantity", { valueAsNumber: true })} />
          </FormField>
          <FormField label="Notes" htmlFor={`${id}-notes`} error={errors.notes?.message}>
            <Textarea id={`${id}-notes`} rows={2} maxLength={300} {...register("notes")} />
          </FormField>
          {errors.root?.message && (
            <p role="alert" className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-sm text-error-foreground">{errors.root.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Transfer stock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
