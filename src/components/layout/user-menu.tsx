"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSessionStore, useSessionUser } from "@/stores/session-store";

export function UserMenu() {
  const user = useSessionUser();
  const signOut = useSessionStore((state) => state.signOut);
  const router = useRouter();

  const name = user?.name ?? "Account";
  const initials = user?.initials ?? "DU";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-2 px-1.5 text-muted-foreground hover:text-foreground"
          aria-label={`Open account menu for ${name}`}
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-md bg-secondary text-[0.6875rem] font-semibold text-secondary-foreground"
          >
            {initials}
          </span>
          <span className="hidden max-w-28 truncate text-sm font-medium text-foreground sm:inline">
            {name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-medium text-foreground">
            {name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user?.role ?? "Signed in"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings">
            <Settings aria-hidden="true" className="mr-2 size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => {
            signOut();
            router.replace("/login");
          }}
        >
          <LogOut aria-hidden="true" className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
