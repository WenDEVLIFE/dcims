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
import { Textarea } from "@/components/ui/textarea";
import type { Supplier, SupplierStatus } from "@/types/domain";

export interface SupplierFormValues {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms?: string;
  status: SupplierStatus;
}

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
  onSubmit: (values: SupplierFormValues) => { ok: boolean; error?: string };
}

export function SupplierFormDialog(props: SupplierFormDialogProps) {
  // Remount keyed by supplier so defaults are fresh without an effect.
  if (!props.open) return null;
  return (
    <SupplierFormContent key={props.supplier?.id ?? "new"} {...props} />
  );
}

function SupplierFormContent({
  onOpenChange,
  supplier,
  onSubmit,
}: SupplierFormDialogProps) {
  const [values, setValues] = useState<SupplierFormValues>(defaultsFor(supplier));
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof SupplierFormValues>(
    key: K,
    value: SupplierFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function submit() {
    if (!values.name.trim()) return setError("Supplier name is required");
    if (!values.contactPerson.trim()) return setError("Contact person is required");
    if (!values.phone.trim()) return setError("Phone number is required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
      return setError("Enter a valid email address");
    }
    if (!values.address.trim()) return setError("Address is required");

    const result = onSubmit(values);
    if (!result.ok) return setError(result.error ?? "The supplier could not be saved");
    onOpenChange(false);
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit supplier" : "New supplier"}</DialogTitle>
          <DialogDescription>
            {supplier
              ? `Update ${supplier.code}. Deactivating a supplier blocks new purchase orders but keeps its history.`
              : "Records are fictional demo data; do not enter real contact details."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="supplier-name">Company name</Label>
              <Input
                id="supplier-name"
                value={values.name}
                onChange={(event) => update("name", event.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier-contact">Contact person</Label>
              <Input
                id="supplier-contact"
                value={values.contactPerson}
                onChange={(event) => update("contactPerson", event.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier-phone">Phone</Label>
              <Input
                id="supplier-phone"
                value={values.phone}
                onChange={(event) => update("phone", event.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier-email">Email</Label>
              <Input
                id="supplier-email"
                type="email"
                value={values.email}
                onChange={(event) => update("email", event.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier-terms">Payment terms</Label>
              <Input
                id="supplier-terms"
                value={values.paymentTerms ?? ""}
                onChange={(event) => update("paymentTerms", event.currentTarget.value)}
                placeholder="30 days"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="supplier-address">Address</Label>
              <Textarea
                id="supplier-address"
                rows={2}
                value={values.address}
                onChange={(event) => update("address", event.currentTarget.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier-status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(value) => update("status", value as SupplierStatus)}
              >
                <SelectTrigger id="supplier-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
            {supplier ? "Save changes" : "Create supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function defaultsFor(supplier: Supplier | undefined): SupplierFormValues {
  return {
    name: supplier?.name ?? "",
    contactPerson: supplier?.contactPerson ?? "",
    phone: supplier?.phone ?? "",
    email: supplier?.email ?? "",
    address: supplier?.address ?? "",
    paymentTerms: supplier?.paymentTerms,
    status: supplier?.status ?? "active",
  };
}
