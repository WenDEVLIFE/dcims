"use client";

import { Menu, Search } from "lucide-react";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NotificationsMenu } from "@/components/layout/notifications-menu";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

export function Header() {
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);

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

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setSearchOpen(true)}
        className="hidden cursor-pointer gap-2 text-muted-foreground hover:text-foreground sm:flex md:w-64 md:justify-start"
      >
        <Search aria-hidden="true" />
        <span>Search</span>
        <kbd className="ml-auto rounded-sm border border-border px-1 font-mono text-[0.625rem]">
          Ctrl K
        </kbd>
      </Button>

      <div className="ml-auto flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
          className="cursor-pointer text-muted-foreground hover:text-foreground sm:hidden"
        >
          <Search aria-hidden="true" />
        </Button>
        <ThemeSwitcher />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
