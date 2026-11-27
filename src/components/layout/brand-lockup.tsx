import Link from "next/link";

import { LogoMark } from "@/components/shared/logo-mark";
import { HOME_ROUTE } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface BrandLockupProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Navigation lockup: the approved square brand mark paired with the wordmark
 * set in the brand typeface. The full illustrated logo asset carries a tagline
 * that cannot stay legible inside a 64px rail, so the rail uses this lockup and
 * keeps the original artwork intact for surfaces with room for it.
 */
export function BrandLockup({ collapsed = false, onNavigate }: BrandLockupProps) {
  return (
    <Link
      href={HOME_ROUTE}
      onClick={onNavigate}
      aria-label="DCIMS dashboard"
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-md transition-opacity duration-150 ease-out motion-reduce:transition-none",
        "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none",
        collapsed && "justify-center",
      )}
    >
      <LogoMark size={32} priority onDark />
      <span className={cn("flex min-w-0 flex-col", collapsed && "sr-only")}>
        <span className="truncate font-heading text-sm leading-5 font-bold tracking-tight text-sidebar-foreground">
          DCIMS
        </span>
        <span className="truncate text-[0.6875rem] leading-4 font-medium text-sidebar-muted">
          Construction inventory
        </span>
      </span>
    </Link>
  );
}
