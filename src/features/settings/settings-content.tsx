"use client";

import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Download, RotateCcw, Upload } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { DemoUserRole, MaterialUnit } from "@/types/domain";
import type { DomainData } from "@/types/state";
import { formatDateTime, unitLabel } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";
import { useSidebarCollapsed, useUiStore } from "@/stores/ui-store";

const subscribeToMount = () => () => {};
const APP_VERSION = "0.1.0";
const ROLES: DemoUserRole[] = [
  "Warehouse supervisor",
  "Procurement officer",
  "Project engineer",
  "Inventory clerk",
];
const UNITS: MaterialUnit[] = [
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

export function SettingsContent() {
  const state = useDomainStore();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const sidebarCollapsed = useSidebarCollapsed();
  const toggleSidebar = useUiStore((store) => store.toggleSidebar);

  const [draft, setDraft] = useState<DomainData["settings"]>(state.settings);
  const [resetOpen, setResetOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  if (!mounted) {
    return (
      <PageContainer>
        <PageHeader title="Settings" description="Application preferences and demo data." />
        <div className="mt-6">
          <LoadingState rows={6} />
        </div>
      </PageContainer>
    );
  }

  function save(patch: Partial<DomainData["settings"]>) {
    const next: DomainData["settings"] = {
      ...draft,
      ...patch,
      notifications: { ...draft.notifications, ...patch.notifications },
      preferences: { ...draft.preferences, ...patch.preferences },
    };
    const result = state.updateSettings(next);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDraft(next);
    toast.success("Settings saved");
  }

  function exportJson() {
    const data = state.exportDemoData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dcims-demo-data-${data.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("Demo data exported");
  }

  async function importJson(file: File) {
    const text = await file.text();
    const result = state.importDemoData(text);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDraft(state.settings);
    toast.success("Demo data imported");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Company profile, appearance, inventory defaults, notifications, and demo data."
      />

      <Tabs defaultValue="company" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Demo data</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <Card className="gap-3 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="company-name">Company name</Label>
                <Input
                  id="company-name"
                  value={draft.company.name}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      company: { ...draft.company, name: event.currentTarget.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  rows={2}
                  value={draft.company.address}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      company: { ...draft.company, address: event.currentTarget.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-phone">Phone</Label>
                <Input
                  id="company-phone"
                  value={draft.company.phone}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      company: { ...draft.company, phone: event.currentTarget.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={draft.company.email}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      company: { ...draft.company, email: event.currentTarget.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={() => save({ company: draft.company })}>
                Save company profile
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <Card className="gap-3 p-4">
            <p className="text-[0.8125rem] text-muted-foreground">
              The demo user is simulated. Roles are presentation-only and grant no access
              control.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-name">Display name</Label>
                <Input
                  id="user-name"
                  value={draft.demoUser.name}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      demoUser: { ...draft.demoUser, name: event.currentTarget.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-role">Role label</Label>
                <Select
                  value={draft.demoUser.role}
                  onValueChange={(value) =>
                    setDraft({
                      ...draft,
                      demoUser: { ...draft.demoUser, role: value as DemoUserRole },
                    })
                  }
                >
                  <SelectTrigger id="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={draft.demoUser.email}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      demoUser: { ...draft.demoUser, email: event.currentTarget.value },
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="user-initials">Initials</Label>
                <Input
                  id="user-initials"
                  maxLength={3}
                  value={draft.demoUser.initials}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      demoUser: { ...draft.demoUser, initials: event.currentTarget.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => save({ demoUser: draft.demoUser })}
              >
                Save profile
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card className="gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-[0.8125rem] text-muted-foreground">
                  Light, dark, or follow the operating system.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <Select value={theme ?? "system"} onValueChange={setTheme}>
                  <SelectTrigger className="w-32" aria-label="Theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium">Sidebar</p>
                <p className="text-[0.8125rem] text-muted-foreground">
                  Currently {sidebarCollapsed ? "collapsed" : "expanded"}. The preference
                  persists.
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={toggleSidebar}>
                {sidebarCollapsed ? "Expand" : "Collapse"} sidebar
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium">Table density</p>
                <p className="text-[0.8125rem] text-muted-foreground">
                  Compact reduces row padding across data tables.
                </p>
              </div>
              <Select
                value={draft.preferences?.tableDensity ?? "comfortable"}
                onValueChange={(value) =>
                  save({
                    preferences: {
                      ...draft.preferences,
                      tableDensity: value as "comfortable" | "compact",
                    },
                  })
                }
              >
                <SelectTrigger className="w-40" aria-label="Table density">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card className="gap-3 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default-reorder">Default reorder level</Label>
                <Input
                  id="default-reorder"
                  type="number"
                  min={0}
                  value={draft.defaultReorderPoint}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      defaultReorderPoint: Number(event.currentTarget.value),
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default-warehouse">Default warehouse</Label>
                <Select
                  value={draft.preferences?.defaultWarehouseId ?? ""}
                  onValueChange={(value) =>
                    setDraft({
                      ...draft,
                      preferences: { ...draft.preferences, defaultWarehouseId: value },
                    })
                  }
                >
                  <SelectTrigger id="default-warehouse">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default-unit">Default unit</Label>
                <Select
                  value={draft.preferences?.defaultUnit ?? "piece"}
                  onValueChange={(value) =>
                    setDraft({
                      ...draft,
                      preferences: {
                        ...draft.preferences,
                        defaultUnit: value as MaterialUnit,
                      },
                    })
                  }
                >
                  <SelectTrigger id="default-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unitLabel(unit)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  save({
                    defaultReorderPoint: draft.defaultReorderPoint,
                    preferences: draft.preferences,
                  })
                }
              >
                Save inventory preferences
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="gap-3 p-4">
            {(
              [
                ["lowStock", "Low-stock alerts", "Warn when stock falls to the reorder point."],
                ["pendingRequests", "Request alerts", "Notify when a request needs approval."],
                [
                  "overduePurchaseOrders",
                  "Purchase order alerts",
                  "Flag outstanding deliveries.",
                ],
                [
                  "maintenanceReminders",
                  "Maintenance reminders",
                  "Warn when equipment enters maintenance.",
                ],
              ] as const
            ).map(([key, title, description]) => (
              <label
                key={key}
                className="flex items-start gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <Checkbox
                  checked={Boolean(draft.notifications[key])}
                  onCheckedChange={(checked) =>
                    save({
                      notifications: {
                        ...draft.notifications,
                        [key]: checked === true,
                      },
                    })
                  }
                />
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-[0.8125rem] text-muted-foreground">
                    {description}
                  </span>
                </span>
              </label>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card className="gap-4 p-4">
            <div>
              <p className="text-sm font-medium">Export</p>
              <p className="text-[0.8125rem] text-muted-foreground">
                Download every record as a JSON backup. Import validates the schema and
                rejects data that would break references.
              </p>
              <Button type="button" size="sm" variant="outline" className="mt-2" onClick={exportJson}>
                <Download aria-hidden="true" />
                Export demo data
              </Button>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium">Import</p>
              <p className="text-[0.8125rem] text-muted-foreground">
                Existing data is replaced only when the file validates completely.
              </p>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) await importJson(file);
                  event.currentTarget.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => importRef.current?.click()}
              >
                <Upload aria-hidden="true" />
                Import JSON
              </Button>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium">Reset</p>
              <p className="text-[0.8125rem] text-muted-foreground">
                Restores the original seed dataset. This discards every change made in
                this browser.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 border-error/40 text-error hover:bg-error-background"
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw aria-hidden="true" />
                Reset demo data
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Last updated {formatDateTime(state.exportDemoData().settings.updatedAt)}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <Card className="gap-4 p-4">
            <div className="flex items-center gap-3">
              <Image
                src="/dcims-icon.png"
                alt=""
                width={48}
                height={48}
                className="rounded-md"
              />
              <div>
                <p className="text-sm font-semibold">DCIMS</p>
                <p className="text-[0.8125rem] text-muted-foreground">
                  Davao Construction Inventory Management System 路 v{APP_VERSION}
                </p>
              </div>
            </div>

            <p className="text-[0.8125rem] leading-5 text-muted-foreground">
              A frontend-only construction inventory demonstration covering materials,
              warehouses, projects, procurement, and equipment using simulated records
              stored in this browser.
            </p>

            <dl className="grid grid-cols-1 gap-2 border-t border-border pt-3 text-[0.8125rem] sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Stack</dt>
                <dd>Next.js App Router, React, TypeScript, Tailwind CSS v4</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">State</dt>
                <dd>Zustand with LocalStorage persistence</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Locale</dt>
                <dd>en-PH 路 PHP 路 Asia/Manila</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Data</dt>
                <dd>Fictional; no external services</dd>
              </div>
            </dl>

            <p className="rounded-md border border-warning/30 bg-warning-background px-3 py-2 text-[0.8125rem] text-warning-foreground">
              Portfolio demonstration only. Not a production system: data is local to this
              browser, not synchronised, not tamper-proof, and access control is simulated.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset demo data"
        description="Every change made in this browser will be replaced by the original seed dataset. Export a backup first if you want to keep it."
        confirmLabel="Reset everything"
        destructive
        onConfirm={() => {
          state.resetDemoData();
          setDraft(state.exportDemoData().settings);
          setResetOpen(false);
          toast.success("Demo data reset to seed");
        }}
      />
    </PageContainer>
  );
}
