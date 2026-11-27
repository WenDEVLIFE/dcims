"use client";

import { Plus, Trash2 } from "lucide-react";
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
import type { ConstructionProject, Material, RequestPriority } from "@/types/domain";
import { formatQuantity } from "@/lib/format";

interface Line {
  key: string;
  materialId: string;
  quantity: string;
}

interface RequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ConstructionProject[];
  materials: Material[];
  onSubmit: (input: {
    projectId: string;
    priority: RequestPriority;
    requiredDate: string;
    notes?: string;
    items: Array<{ materialId: string; requestedQuantity: number }>;
  }) => { ok: boolean; error?: string };
}

/**
 * Multi-line request form. Lines are local state rather than RHF field arrays:
 * the shape is an arbitrary-length list and the service validates every line
 * again, so a schema resolver would duplicate that without adding safety.
 */
export function RequestFormDialog({
  open,
  onOpenChange,
  projects,
  materials,
  onSubmit,
}: RequestFormDialogProps) {
  const activeProjects = projects.filter(
    (project) => !["completed", "cancelled"].includes(project.status),
  );
  const requestableMaterials = materials.filter(
    (material) => material.status === "active",
  );

  const [projectId, setProjectId] = useState(activeProjects[0]?.id ?? "");
  const [priority, setPriority] = useState<RequestPriority>("normal");
  const [requiredDate, setRequiredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { key: "line-1", materialId: "", quantity: "1" },
  ]);
  const [error, setError] = useState<string | null>(null);

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setError(null);
  }

  function addLine() {
    setLines((current) => [
      ...current,
      { key: `line-${current.length + 1}-${Date.now()}`, materialId: "", quantity: "1" },
    ]);
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function submit() {
    setError(null);

    if (!projectId) return setError("Choose a project");
    if (!requiredDate) return setError("Enter the date the site needs this material");

    const items = lines
      .filter((line) => line.materialId !== "")
      .map((line) => ({
        materialId: line.materialId,
        requestedQuantity: Number(line.quantity),
      }));

    if (items.length === 0) return setError("Add at least one material");
    if (items.some((item) => !Number.isFinite(item.requestedQuantity) || item.requestedQuantity <= 0)) {
      return setError("Every line needs a quantity greater than zero");
    }

    const result = onSubmit({
      projectId,
      priority,
      requiredDate,
      notes: notes.trim() || undefined,
      items,
    });

    if (!result.ok) {
      setError(result.error ?? "The request could not be created");
      return;
    }
    onOpenChange(false);
    setLines([{ key: "line-1", materialId: "", quantity: "1" }]);
    setNotes("");
    setRequiredDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New material request</DialogTitle>
          <DialogDescription>
            Requests do not touch stock. Approval authorises release; fulfilment deducts it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <Label htmlFor="request-project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="request-project">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="request-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as RequestPriority)}
              >
                <SelectTrigger id="request-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="request-required">Required by</Label>
              <Input
                id="request-required"
                type="date"
                value={requiredDate}
                onChange={(event) => setRequiredDate(event.currentTarget.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Materials</Label>
            {lines.map((line, index) => {
              const material = requestableMaterials.find(
                (item) => item.id === line.materialId,
              );
              return (
                <div key={line.key} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      value={line.materialId}
                      onValueChange={(value) => updateLine(line.key, { materialId: value })}
                    >
                      <SelectTrigger aria-label={`Material ${index + 1}`}>
                        <SelectValue placeholder="Choose a material" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestableMaterials.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({formatQuantity(0, item.unit).split(" ")[1]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28">
                    <Input
                      aria-label={`Quantity ${index + 1}`}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.key, { quantity: event.currentTarget.value })
                      }
                    />
                  </div>
                  <span className="w-14 pb-2 text-xs text-muted-foreground">
                    {material ? formatQuantity(0, material.unit).split(" ")[1] : "unit"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove line ${index + 1}`}
                    disabled={lines.length === 1}
                    onClick={() => removeLine(line.key)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="self-start">
              <Plus aria-hidden="true" />
              Add material
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-notes">Remarks</Label>
            <Textarea
              id="request-notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.currentTarget.value)}
              placeholder="Optional context for the warehouse"
            />
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
            Submit request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
