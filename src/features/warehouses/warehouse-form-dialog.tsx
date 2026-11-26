"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DomainResult } from "@/lib/result";
import { warehouseInputSchema, type WarehouseInputValues } from "@/schemas/domain";
import type { Warehouse } from "@/types/domain";

const fields = [
  { key: "name", label: "Warehouse name", required: true, max: 80 },
  { key: "location", label: "Area", required: true, max: 80 },
  { key: "address", label: "Street address", required: true, max: 200 },
  { key: "managerName", label: "Assigned manager", max: 80 },
  { key: "contactNumber", label: "Contact number", max: 30, type: "tel" },
  { key: "storageCapacity", label: "Storage capacity", max: 80 },
] as const satisfies ReadonlyArray<{ key: keyof WarehouseInputValues; label: string; required?: boolean; max: number; type?: "tel" }>;

export function WarehouseFormDialog({ warehouse, onClose, onSave }: {
  warehouse?: Warehouse;
  onClose: () => void;
  onSave: (values: WarehouseInputValues) => DomainResult<void>;
}) {
  const id = useId();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<WarehouseInputValues>({
      resolver: zodResolver(warehouseInputSchema),
      defaultValues: {
        name: warehouse?.name ?? "",
        location: warehouse?.location ?? "",
        address: warehouse?.address ?? "",
        managerName: warehouse?.managerName ?? "",
        contactNumber: warehouse?.contactNumber ?? "",
        storageCapacity: warehouse?.storageCapacity ?? "",
      },
    });

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{warehouse ? "Edit warehouse" : "Add warehouse"}</DialogTitle>
          <DialogDescription>
            {warehouse ? `The code ${warehouse.code} stays fixed when details change.` : "A warehouse code is assigned automatically. New warehouses start with no stock."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((values) => {
          const result = onSave(values);
          if (result.ok) onClose();
          else setError("root", { message: result.error });
        })}>
          {fields.map((field) => {
            const fieldId = `${id}-${field.key}`;
            const required = "required" in field && field.required;
            return (
              <FormField key={field.key} label={field.label} htmlFor={fieldId} required={required} error={errors[field.key]?.message}>
                <Input
                  id={fieldId}
                  type={"type" in field ? field.type : "text"}
                  maxLength={field.max}
                  aria-required={required}
                  aria-invalid={Boolean(errors[field.key])}
                  {...register(field.key)}
                />
              </FormField>
            );
          })}
          {errors.root?.message && (
            <p role="alert" className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-sm text-error-foreground sm:col-span-2">{errors.root.message}</p>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{warehouse ? "Save changes" : "Create warehouse"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
