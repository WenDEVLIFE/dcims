"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { HOME_ROUTE, NAV_GROUPS } from "@/constants/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();

  const group = NAV_GROUPS.find((candidate) =>
    candidate.items.some((item) => item.href === pathname),
  );
  const item = group?.items.find((candidate) => candidate.href === pathname);

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className="flex items-center gap-1.5 text-[0.8125rem] leading-5">
        <li>
          <Link
            href={HOME_ROUTE}
            className="rounded-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
          >
            DCIMS
          </Link>
        </li>
        {group && (
          <li className="flex items-center gap-1.5">
            <ChevronRight aria-hidden="true" className="size-3.5 text-border" />
            <span className="text-muted-foreground">{group.label}</span>
          </li>
        )}
        {item && (
          <li className="flex items-center gap-1.5">
            <ChevronRight aria-hidden="true" className="size-3.5 text-border" />
            <span aria-current="page" className="font-medium text-foreground">
              {item.label}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
