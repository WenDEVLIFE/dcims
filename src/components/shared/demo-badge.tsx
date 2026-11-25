import { cn } from "@/lib/utils";

interface DemoBadgeProps {
  collapsed?: boolean;
  className?: string;
}

/**
 * DCIMS is a portfolio demonstration. The marker stays visible in the shell
 * so no screen implies production data or a real session.
 */
export function DemoBadge({ collapsed = false, className }: DemoBadgeProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 rounded-md border border-sidebar-border bg-white/[0.04] px-2.5 py-1.5 text-[0.6875rem] leading-4 font-medium text-sidebar-muted",
        collapsed && "justify-center px-0 py-2",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-sidebar-active"
      />
      <span className={cn(collapsed && "sr-only")}>
        Demo data · stored locally
      </span>
      {collapsed && <span className="sr-only">Demo data, stored locally</span>}
    </p>
  );
}
