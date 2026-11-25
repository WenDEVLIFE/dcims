"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-2 px-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Open account menu"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-md bg-secondary text-[0.6875rem] font-semibold text-secondary-foreground"
          >
            DU
          </span>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            Demo user
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium text-foreground">
            Demo user
          </span>
          <span className="block text-xs text-muted-foreground">
            Simulated session
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings">
            <Settings aria-hidden="true" className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
