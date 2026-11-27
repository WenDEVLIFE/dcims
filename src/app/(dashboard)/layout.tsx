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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:outline-none"
        >
          Skip to content
        </a>
        <Sidebar />
        <MobileNav />
        <GlobalSearch />
        <DensityProvider />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
