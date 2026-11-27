"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { projectInputSchema, type ProjectInputValues } from "@/schemas/domain";
import type { ConstructionProject } from "@/types/domain";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ConstructionProject;
  onSubmit: (values: ProjectInputValues) => { ok: boolean; error?: string };
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSubmit,
}: ProjectFormDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInputValues>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: defaultsFor(project),
  });

  useEffect(() => {
    if (open) reset(defaultsFor(project));
  }, [open, project, reset]);

  function submit(values: ProjectInputValues) {
    const result = onSubmit(values);
    if (!result.ok) {
      setError("root", { message: result.error ?? "The project could not be saved" });
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Create project"}</DialogTitle>
          <DialogDescription>
            {project
              ? `${project.code} · schedule and budget changes do not alter recorded consumption.`
              : "New projects start as planned with zero progress."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <FormField label="Project name" htmlFor="project-name" required error={errors.name?.message}>
            <Input id="project-name" autoComplete="off" {...register("name")} />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Location" htmlFor="project-location" required error={errors.location?.message}>
              <Input id="project-location" {...register("location")} />
            </FormField>
            <FormField label="Client" htmlFor="project-client" required error={errors.client?.message}>
              <Input id="project-client" {...register("client")} />
            </FormField>
            <FormField
              label="Project manager"
              htmlFor="project-manager"
              required
              error={errors.managerName?.message}
            >
              <Input id="project-manager" {...register("managerName")} />
            </FormField>
            <FormField label="Material budget" required error={errors.budgetCentavos?.message}>
              <Controller
                control={control}
                name="budgetCentavos"
                render={({ field }) => (
                  <CurrencyInput
                    label="Material budget"
                    value={field.value}
                    onValueChange={(centavos) => field.onChange(centavos ?? 0)}
                  />
                )}
              />
            </FormField>
            <FormField label="Start date" htmlFor="project-start" required error={errors.startDate?.message}>
              <Input id="project-start" type="date" {...register("startDate")} />
            </FormField>
            <FormField
              label="Target end date"
              htmlFor="project-end"
              required
              error={errors.targetEndDate?.message}
            >
              <Input id="project-end" type="date" {...register("targetEndDate")} />
            </FormField>
          </div>

          <FormField label="Description" htmlFor="project-description" error={errors.description?.message}>
            <Textarea id="project-description" rows={2} {...register("description")} />
          </FormField>

          {errors.root?.message && (
            <p
              role="alert"
              className="rounded-md border border-error/30 bg-error-background px-3 py-2 text-[0.8125rem] text-error-foreground"
            >
              {errors.root.message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaultsFor(project: ConstructionProject | undefined): ProjectInputValues {
  return {
    name: project?.name ?? "",
    location: project?.location ?? "",
    client: project?.client ?? "",
    managerName: project?.managerName ?? "",
    startDate: project?.startDate ?? "",
    targetEndDate: project?.targetEndDate ?? "",
    budgetCentavos: project?.budgetCentavos ?? 0,
    description: project?.description ?? "",
  };
}
