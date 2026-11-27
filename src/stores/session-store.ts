"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { findAccount } from "@/constants/demo-accounts";
import type { DemoUser } from "@/types/domain";

const SESSION_KEY = "dcims-session-v1";
const SESSION_VERSION = 1;

interface SessionState {
  user: DemoUser | null;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  setUser: (user: DemoUser) => void;
}

/**
 * Simulated session. It decides which demo identity the UI shows and who is
 * recorded on activity entries — nothing more. Clearing it in devtools grants
 * exactly the same access as using the login form.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (email, password) => {
        const account = findAccount(email, password);
        if (!account) return false;
        set({ user: account.user });
        return true;
      },
      signOut: () => set({ user: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: SESSION_KEY,
      version: SESSION_VERSION,
    },
  ),
);

const subscribeToMount = () => () => {};

/** Session state that is safe to read during server rendering. */
export function useSessionUser(): DemoUser | null {
  const user = useSessionStore((state) => state.user);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  return mounted ? user : null;
}

export function useSessionMounted(): boolean {
  return useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
}
