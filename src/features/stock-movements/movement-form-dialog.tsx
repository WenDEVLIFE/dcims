"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { movementActions } from "@/features/stock-movements/movement-types";
import { formatQuantity } from "@/lib/format";
import { parseAmountToCentavos } from "@/lib/currency";
import type { DomainResult } from "@/lib/result";
import type { ConstructionProject, InventoryBalance, Material, ProjectMaterial, StockMovementType, Warehouse } from "@/types/domain";

export type LocalMovement = Exclude<StockMovementType, "transfer">;
const schema = z.object({
  materialId: z.string().min(1, "Choose a material"),
  warehouseId: z.string().min(1, "Choose a warehouse"),
  projectId: z.string(),
  quantity: z.number({ error: "Enter a quantity" }).positive("Quantity must be greater than zero"),
  cost: z.string().trim(),
  direction: z.enum(["increase", "decrease"]),
  reason: z.string().trim().max(200),
  notes: z.string().trim().max(300),
});
export type MovementValues = z.infer<typeof schema>;

const select = "h-9 min-w-0 w-full cursor-pointer rounded-md border border-input bg-background px-2.5 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-sm";
const descriptions: Record<LocalMovement, string> = {
  "stock-in": "Receive material into an active warehouse at its purchase cost.",
  "stock-out": "Release material from a warehouse. Choose a project to allocate it on site.",
  adjustment: "Record a counted gain or loss. The original transaction history stays intact.",
  return: "Return unused material held by a project to an active warehouse.",
};

export function MovementFormDialog({ kind, materials, warehouses, projects, balances, allocations, onClose, onSave }: {
  kind: LocalMovement;
  materials: Material[];
  warehouses: Warehouse[];
  projects: ConstructionProject[];
  balances: InventoryBalance[];
  allocations: ProjectMaterial[];
  onClose: () => void;
  onSave: (values: MovementValues) => DomainResult<void>;
}) {
  const id = useId();
  const formSchema = schema.superRefine((value, ctx) => {
    if (kind === "stock-in") {
      const cents = parseAmountToCentavos(value.cost);
      if (!/^\d+(\.\d{1,2})?$/.test(value.cost) || !Number.isSafeInteger(cents)) {
        ctx.addIssue({ code: "custom", path: ["cost"], message: "Enter a non-negative peso amount, with up to two decimal places" });
      }
    }
    if (kind === "return" && !value.projectId) ctx.addIssue({ code: "custom", path: ["projectId"], message: "Choose a project" });
    if (kind === "adjustment" && !value.reason) ctx.addIssue({ code: "custom", path: ["reason"], message: "An adjustment reason is required" });
  });
  const { register, handleSubmit, control, setError, setValue, formState: { errors, isSubmitting } } =
    useForm<MovementValues>({
      resolver: zodResolver(formSchema),
      defaultValues: { warehouseId: "", projectId: "", materialId: "", cost: "", direction: "increase", reason: "", notes: "" },
    });
  const [warehouseId, materialId, projectId] = useWatch({ control, name: ["warehouseId", "materialId", "projectId"] });
  const projectStock = allocations.filter((row) => row.projectId === projectId && row.quantity > 0);
  const list = kind === "return" ? materials.filter((material) => projectStock.some((row) => row.materialId === material.id)) : materials;
  const material = materials.find((row) => row.id === materialId);
  const available = kind === "return"
    ? projectStock.find((row) => row.materialId === materialId)?.quantity
    : warehouseId && materialId ? balances.find((row) => row.warehouseId === warehouseId && row.materialId === materialId)?.quantity ?? 0 : undefined;

  const projectField = (
    <FormField label={kind === "return" ? "Source project" : "Project"} htmlFor={`${id}-project`} required={kind === "return"} error={errors.projectId?.message}>
      <select id={`${id}-project`} className={select} aria-required={kind === "return"} aria-invalid={Boolean(errors.projectId)} {...register("projectId", {
        onChange: () => { if (kind === "return") setValue("materialId", ""); },
      })}>
        <option value="">{kind === "return" ? "Choose a project" : "No project"}</option>
        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
    </FormField>
  );

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{movementActions[kind]}</DialogTitle>
          <DialogDescription>{descriptions[kind]}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit((values) => {
          const result = onSave(values);
          if (result.ok) onClose();
          else setError("root", { message: result.error });
        })}>
          {kind === "return" && projectField}
          <FormField label="Material" htmlFor={`${id}-material`} required error={errors.materialId?.message}>
            <select id={`${id}-material`} className={select} aria-required aria-invalid={Boolean(errors.materialId)} {...register("materialId")}>
              <option value="">Choose a material</option>
              {list.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>)}
            </select>
          </FormField>
          <FormField label={kind === "stock-out" ? "Source warehouse" : kind === "adjustment" ? "Warehouse" : "Destination warehouse"} htmlFor={`${id}-warehouse`} required error={errors.warehouseId?.message}>
            <select id={`${id}-warehouse`} className={select} aria-required aria-invalid={Boolean(errors.warehouseId)} {...register("warehouseId")}>
              <option value="">Choose a warehouse</option>
              {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </select>
          </FormField>
          {kind === "stock-out" && projectField}
          {kind === "adjustment" && (
            <FormField label="Adjustment type" htmlFor={`${id}-direction`} required>
              <select id={`${id}-direction`} className={select} {...register("direction")}>
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </select>
            </FormField>
          )}
          <FormField label="Quantity" htmlFor={`${id}-quantity`} required error={errors.quantity?.message}
            description={available !== undefined && material ? `${formatQuantity(available, material.unit)} ${kind === "return" ? "held on site" : "on hand"}.` : undefined}>
            <Input id={`${id}-quantity`} type="number" inputMode="decimal" step="any" aria-required aria-invalid={Boolean(errors.quantity)} {...register("quantity", { valueAsNumber: true })} />
          </FormField>
          {kind === "stock-in" && (
            <FormField label="Received unit cost (PHP)" htmlFor={`${id}-cost`} required error={errors.cost?.message}>
              <Input id={`${id}-cost`} inputMode="decimal" className="tabular-nums" aria-required aria-invalid={Boolean(errors.cost)} {...register("cost")} />
            </FormField>
          )}
          {kind === "adjustment" ? (
            <FormField label="Adjustment reason" htmlFor={`${id}-reason`} required error={errors.reason?.message}>
              <Textarea id={`${id}-reason`} maxLength={200} rows={2} placeholder="For example, damaged stock or a cycle-count discrepancy" aria-required aria-invalid={Boolean(errors.reason)} {...register("reason")} />
            </FormField>
          ) : (
            <FormField label="Remarks" htmlFor={`${id}-notes`} error={errors.notes?.message}>
              <Textarea id={`${id}-notes`} maxLength={300} rows={2} {...register("notes")} />
            </FormField>
          )}
          {errors.root?.message && <p role="alert" className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-sm text-error-foreground">{errors.root.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{movementActions[kind]}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
