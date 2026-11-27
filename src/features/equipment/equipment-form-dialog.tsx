"use client";

import { useState } from "react";

import { CurrencyInput } from "@/components/shared/currency-input";
import { FormField } from "@/components/shared/form-field";
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
import type { Equipment, EquipmentCondition } from "@/types/domain";

export interface EquipmentFormValues {
  name: string;
  category: string;
  condition: EquipmentCondition;
  purchaseDate: string;
  purchaseCostCentavos: number;
  location: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment;
  onSubmit: (values: EquipmentFormValues) => { ok: boolean; error?: string };
}

export function EquipmentFormDialog(props: EquipmentFormDialogProps) {
  // Remounting on open keyed by asset gives fresh defaults without an effect.
  if (!props.open) return null;
  return (
    <EquipmentFormContent
      key={props.equipment?.id ?? "new"}
      {...props}
    />
  );
}

function EquipmentFormContent({
  onOpenChange,
  equipment,
  onSubmit,
}: EquipmentFormDialogProps) {
  const [values, setValues] = useState<EquipmentFormValues>(defaultsFor(equipment));
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof EquipmentFormValues>(
    key: K,
    value: EquipmentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function submit() {
    if (!values.name.trim()) return setError("Equipment name is required");
    if (!values.category.trim()) return setError("Category is required");
    if (!values.location.trim()) return setError("Location is required");
    if (!values.purchaseDate) return setError("Purchase date is required");

    const result = onSubmit(values);
    if (!result.ok) return setError(result.error ?? "The equipment could not be saved");
    onOpenChange(false);
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{equipment ? "Edit equipment" : "Register equipment"}</DialogTitle>
          <DialogDescription>
            {equipment
              ? `Update ${equipment.assetCode}. Availability is controlled by assignment and return.`
              : "New assets start as available. Asset codes are generated automatically."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Equipment name" htmlFor="equipment-name" required>
              <Input
                id="equipment-name"
                value={values.name}
                onChange={(event) => update("name", event.currentTarget.value)}
              />
            </FormField>
            <FormField label="Category" htmlFor="equipment-category" required>
              <Input
                id="equipment-category"
                value={values.category}
                onChange={(event) => update("category", event.currentTarget.value)}
                placeholder="Concrete, Power, Survey…"
              />
            </FormField>

            <FormField label="Condition" htmlFor="equipment-condition" required>
              <Select
                value={values.condition}
                onValueChange={(value) =>
                  update("condition", value as EquipmentCondition)
                }
              >
                <SelectTrigger id="equipment-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="needs-repair">Needs repair</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Current location" htmlFor="equipment-location" required>
              <Input
                id="equipment-location"
                value={values.location}
                onChange={(event) => update("location", event.currentTarget.value)}
              />
            </FormField>

            <FormField label="Purchase date" htmlFor="equipment-purchase" required>
              <Input
                id="equipment-purchase"
                type="date"
                value={values.purchaseDate}
                onChange={(event) => update("purchaseDate", event.currentTarget.value)}
              />
            </FormField>

            <FormField label="Purchase cost">
              <CurrencyInput
                label="Purchase cost"
                value={values.purchaseCostCentavos}
                onValueChange={(centavos) => update("purchaseCostCentavos", centavos ?? 0)}
              />
            </FormField>

            <FormField label="Next maintenance" htmlFor="equipment-maintenance">
              <Input
                id="equipment-maintenance"
                type="date"
                value={values.nextMaintenanceDate ?? ""}
                onChange={(event) =>
                  update("nextMaintenanceDate", event.currentTarget.value || undefined)
                }
              />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="equipment-notes">
            <Textarea
              id="equipment-notes"
              rows={2}
              value={values.notes ?? ""}
              onChange={(event) => update("notes", event.currentTarget.value || undefined)}
            />
          </FormField>

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
            {equipment ? "Save changes" : "Register equipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function defaultsFor(equipment: Equipment | undefined): EquipmentFormValues {
  return {
    name: equipment?.name ?? "",
    category: equipment?.category ?? "",
    condition: equipment?.condition ?? "good",
    purchaseDate: equipment?.purchaseDate ?? "",
    purchaseCostCentavos: equipment?.purchaseCostCentavos ?? 0,
    location: equipment?.location ?? "Central Warehouse",
    nextMaintenanceDate: equipment?.nextMaintenanceDate,
    notes: equipment?.notes,
  };
}
