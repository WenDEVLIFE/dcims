import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { DensityProvider } from "@/components/shared/density-provider";
import { GlobalSearch } from "@/features/search/global-search";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex min-h-dvh bg-background">
        <Sidebar />
        <MobileNav />
        <GlobalSearch />
        <DensityProvider />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
