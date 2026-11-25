"use client";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { DemoBadge } from "@/components/shared/demo-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed, useUiStore } from "@/stores/ui-store";

export function Sidebar() {
  const collapsed = useSidebarCollapsed();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex",
        "transition-[width] duration-200 ease-out motion-reduce:transition-none",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <BrandLockup collapsed={collapsed} />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className="flex flex-col gap-3 border-t border-sidebar-border p-3">
        <DemoBadge collapsed={collapsed} />
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md px-1 py-1",
            collapsed && "justify-center px-0",
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground"
          >
            DU
          </span>
          <div className={cn("min-w-0", collapsed && "sr-only")}>
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              Demo user
            </p>
            <p className="truncate text-xs text-sidebar-muted">
              Simulated session
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          className={cn(
            "cursor-pointer justify-start text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" />
          ) : (
            <PanelLeftClose aria-hidden="true" />
          )}
          <span className={cn(collapsed && "sr-only")}>
            {collapsed ? "Expand" : "Collapse"} sidebar
          </span>
        </Button>
      </div>
    </aside>
  );
}
