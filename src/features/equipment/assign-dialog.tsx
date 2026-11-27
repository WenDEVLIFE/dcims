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
import type { ConstructionProject, Equipment } from "@/types/domain";

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  projects: ConstructionProject[];
  onSubmit: (input: {
    projectId: string;
    assignedTo: string;
  }) => { ok: boolean; error?: string };
}

export function AssignDialog({
  open,
  onOpenChange,
  equipment,
  projects,
  onSubmit,
}: AssignDialogProps) {
  const eligible = projects.filter(
    (project) => !["completed", "cancelled"].includes(project.status),
  );
  const [projectId, setProjectId] = useState(eligible[0]?.id ?? "");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!equipment) return null;

  function submit() {
    if (!projectId) return setError("Choose a project");
    if (!assignedTo.trim()) return setError("Enter who is receiving the equipment");

    const result = onSubmit({ projectId, assignedTo });
    if (!result.ok) return setError(result.error ?? "The equipment could not be assigned");
    onOpenChange(false);
    setAssignedTo("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign {equipment.name}</DialogTitle>
          <DialogDescription>
            {equipment.assetCode} will move to the project site and leave the available pool.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assign-project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="assign-project">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {eligible.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assign-person">Received by</Label>
            <Input
              id="assign-person"
              value={assignedTo}
              onChange={(event) => {
                setAssignedTo(event.currentTarget.value);
                setError(null);
              }}
              placeholder="Site foreman or operator"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-error">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            Assign equipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
