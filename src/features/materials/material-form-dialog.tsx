"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { FormField } from "@/components/shared/form-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { materialInputSchema, type MaterialInputValues } from "@/schemas/domain";
import type { Material, MaterialCategory, MaterialUnit } from "@/types/domain";
import { unitLabel } from "@/lib/format";

const UNIT_OPTIONS: MaterialUnit[] = [
  "bag",
  "piece",
  "cubic-meter",
  "square-meter",
  "kilogram",
  "liter",
  "roll",
  "sheet",
  "length",
  "set",
];

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MaterialCategory[];
  material?: Material;
  onSubmit: (values: MaterialInputValues) => { ok: boolean; error?: string };
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  categories,
  material,
  onSubmit,
}: MaterialFormDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MaterialInputValues>({
    resolver: zodResolver(materialInputSchema),
    defaultValues: defaultsFor(material, categories),
  });

  useEffect(() => {
    if (open) reset(defaultsFor(material, categories));
  }, [open, material, categories, reset]);

  function submit(values: MaterialInputValues) {
    const result = onSubmit(values);
    if (!result.ok) {
      setError("root", { message: result.error ?? "The material could not be saved" });
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{material ? "Edit material" : "Add material"}</DialogTitle>
          <DialogDescription>
            {material
              ? `Update ${material.sku}. Catalogue cost changes do not revalue existing stock.`
              : "New materials start with zero stock in every warehouse."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <FormField
            label="Material name"
            htmlFor="material-name"
            required
            error={errors.name?.message}
          >
            <Input
              id="material-name"
              autoComplete="off"
              aria-invalid={errors.name ? true : undefined}
              {...register("name")}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Category"
              htmlFor="material-category"
              required
              error={errors.categoryId?.message}
            >
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="material-category" aria-invalid={errors.categoryId ? true : undefined}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter((category) => category.status !== "archived" || category.id === material?.categoryId).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Measurement unit"
              htmlFor="material-unit"
              required
              error={errors.unit?.message}
            >
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="material-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unitLabel(unit)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Catalogue unit cost"
              required
              error={errors.unitCostCentavos?.message}
            >
              <Controller
                control={control}
                name="unitCostCentavos"
                render={({ field }) => (
                  <CurrencyInput
                    label="Catalogue unit cost"
                    value={field.value}
                    onValueChange={(centavos) => field.onChange(centavos ?? 0)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Reorder point"
              htmlFor="material-reorder"
              required
              description="Stock at or below this level is flagged as low."
              error={errors.reorderPoint?.message}
            >
              <Input
                id="material-reorder"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                aria-invalid={errors.reorderPoint ? true : undefined}
                {...register("reorderPoint", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            htmlFor="material-description"
            error={errors.description?.message}
          >
            <Textarea
              id="material-description"
              rows={2}
              placeholder="Optional specification or usage note"
              {...register("description")}
            />
          </FormField>

          {errors.root?.message && (
            <p role="alert" className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-[0.8125rem] text-error-foreground">
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {material ? "Save changes" : "Create material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaultsFor(
  material: Material | undefined,
  categories: MaterialCategory[],
): MaterialInputValues {
  return {
    name: material?.name ?? "",
    categoryId: material?.categoryId ?? categories.find((category) => category.status !== "archived")?.id ?? "",
    unit: material?.unit ?? "bag",
    unitCostCentavos: material?.unitCostCentavos ?? 0,
    reorderPoint: material?.reorderPoint ?? 0,
    description: material?.description ?? "",
  };
}
