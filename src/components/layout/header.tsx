"use client";

import { Menu } from "lucide-react";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

export function Header() {
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        onClick={() => setMobileNavOpen(true)}
        className="cursor-pointer text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Menu aria-hidden="true" />
      </Button>

      <Suspense fallback={null}>
        <Breadcrumbs />
      </Suspense>

      <div className="ml-auto flex items-center gap-1">
        <ThemeSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}
