"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  HardHat,
  Package,
  ShoppingCart,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDomainStore } from "@/stores/domain-store";
import { useUiStore } from "@/stores/ui-store";

interface SearchEntry {
  id: string;
  label: string;
  hint: string;
  href: string;
}

interface SearchGroup {
  label: string;
  icon: typeof Package;
  entries: SearchEntry[];
}

const PER_GROUP_LIMIT = 6;

export function GlobalSearch() {
  const open = useUiStore((state) => state.searchOpen);
  const setOpen = useUiStore((state) => state.setSearchOpen);
  const state = useDomainStore();
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!useUiStore.getState().searchOpen);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  const groups = useMemo<SearchGroup[]>(() => {
    return [
      {
        label: "Materials",
        icon: Package,
        entries: state.materials.map((material) => ({
          id: material.id,
          label: material.name,
          hint: material.sku,
          href: "/materials",
        })),
      },
      {
        label: "Projects",
        icon: HardHat,
        entries: state.projects.map((project) => ({
          id: project.id,
          label: project.name,
          hint: `${project.code} · ${project.client}`,
          href: `/projects/${project.id}`,
        })),
      },
      {
        label: "Material requests",
        icon: ClipboardList,
        entries: state.materialRequests.map((request) => ({
          id: request.id,
          label: request.reference,
          hint:
            state.projects.find((project) => project.id === request.projectId)?.name ??
            request.status,
          href: "/material-requests",
        })),
      },
      {
        label: "Purchase orders",
        icon: ShoppingCart,
        entries: state.purchaseOrders.map((order) => ({
          id: order.id,
          label: order.reference,
          hint:
            state.suppliers.find((supplier) => supplier.id === order.supplierId)?.name ??
            order.status,
          href: "/purchase-orders",
        })),
      },
      {
        label: "Suppliers",
        icon: Truck,
        entries: state.suppliers.map((supplier) => ({
          id: supplier.id,
          label: supplier.name,
          hint: `${supplier.code} · ${supplier.contactPerson}`,
          href: "/suppliers",
        })),
      },
      {
        label: "Equipment",
        icon: Wrench,
        entries: state.equipment.map((asset) => ({
          id: asset.id,
          label: asset.name,
          hint: `${asset.assetCode} · ${asset.status}`,
          href: "/equipment",
        })),
      },
      {
        label: "Warehouses",
        icon: Warehouse,
        entries: state.warehouses.map((warehouse) => ({
          id: warehouse.id,
          label: warehouse.name,
          hint: `${warehouse.code} · ${warehouse.location}`,
          href: `/warehouses/${warehouse.id}`,
        })),
      },
      {
        label: "Categories",
        icon: Building2,
        entries: state.categories.map((category) => ({
          id: category.id,
          label: category.name,
          hint: category.code,
          href: "/categories",
        })),
      },
    ];
  }, [state]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search DCIMS"
      description="Search materials, projects, requests, orders, suppliers, equipment, and warehouses."
    >
      <CommandInput placeholder="Search by name, SKU, code, or reference…" />
      <CommandList>
        <CommandEmpty>
          No matches. Try a material SKU, a project name, or a reference number.
        </CommandEmpty>
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <CommandGroup key={group.label} heading={group.label}>
              {group.entries.slice(0, PER_GROUP_LIMIT).map((entry) => (
                <CommandItem
                  key={`${group.label}-${entry.id}`}
                  value={`${entry.label} ${entry.hint}`}
                  onSelect={() => navigate(entry.href)}
                  className="cursor-pointer"
                >
                  <Icon aria-hidden="true" className="text-muted-foreground" />
                  <span className="truncate">{entry.label}</span>
                  <span className="ml-auto shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                    {entry.hint}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
