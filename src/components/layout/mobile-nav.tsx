"use client";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { DemoBadge } from "@/components/shared/demo-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui-store";

export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen);
  const setOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="w-[17rem] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-3">
          <SheetTitle className="sr-only">DCIMS navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Application modules grouped by function.
          </SheetDescription>
          <BrandLockup onNavigate={() => setOpen(false)} />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <DemoBadge />
        </div>
      </SheetContent>
    </Sheet>
  );
}
