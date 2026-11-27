"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import type { DomainResult } from "@/lib/result";
import { categoryInputSchema, type CategoryInputValues } from "@/schemas/domain";
import { CATEGORY_COLORS, CATEGORY_ICONS, type MaterialCategory } from "@/types/domain";

interface CategoryFormDialogProps {
  category?: MaterialCategory;
  onClose: () => void;
  onSave: (values: CategoryInputValues) => DomainResult<void>;
}

const selectClass = "h-9 cursor-pointer rounded-md border border-input bg-background px-2.5 text-base capitalize focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-sm";

export function CategoryFormDialog({ category, onClose, onSave }: CategoryFormDialogProps) {
  const id = useId();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<CategoryInputValues>({
      resolver: zodResolver(categoryInputSchema),
      defaultValues: {
        name: category?.name ?? "",
        description: category?.description ?? "",
        icon: category?.icon ?? "package",
        color: category?.color ?? "neutral",
      },
    });

  function submit(values: CategoryInputValues) {
    const result = onSave(values);
    if (!result.ok) {
      setError("root", { message: result.error });
      return;
    }
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            {category ? `Update the catalogue grouping ${category.code}.` : "Create a grouping for related materials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          <FormField label="Category name" htmlFor={`${id}-name`} error={errors.name?.message} required>
            <Input id={`${id}-name`} maxLength={80} aria-required aria-invalid={Boolean(errors.name)} {...register("name")} />
          </FormField>
          <FormField label="Description" htmlFor={`${id}-description`} error={errors.description?.message}>
            <Textarea id={`${id}-description`} rows={3} maxLength={300} aria-invalid={Boolean(errors.description)} {...register("description")} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Icon" htmlFor={`${id}-icon`} error={errors.icon?.message}>
              <select id={`${id}-icon`} aria-invalid={Boolean(errors.icon)} className={selectClass} {...register("icon")}>
                {CATEGORY_ICONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
            <FormField label="Color" htmlFor={`${id}-color`} error={errors.color?.message}>
              <select id={`${id}-color`} aria-invalid={Boolean(errors.color)} className={selectClass} {...register("color")}>
                {CATEGORY_COLORS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FormField>
          </div>
          {errors.root?.message && (
            <p role="alert" className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-sm text-error-foreground">
              {errors.root.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{category ? "Save changes" : "Create category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
