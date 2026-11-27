"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionMounted, useSessionUser } from "@/stores/session-store";

/**
 * Client-side route guard for the simulated session.
 *
 * This is a redirect for demo continuity, not access control: the data lives in
 * LocalStorage and is readable regardless. It exists so the app opens on the
 * login screen instead of dropping a visitor into a half-explained dashboard.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const user = useSessionUser();
  const mounted = useSessionMounted();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) router.replace("/login");
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="mx-auto w-full max-w-[88rem] px-4 py-10 md:px-6 lg:px-8">
        <LoadingState rows={6} />
      </div>
    );
  }

  return <>{children}</>;
}
