"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const UI_STORE_VERSION = 1;

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (open: boolean) => set({ mobileNavOpen: open }),
    }),
    {
      name: "dcims-ui-v1",
      version: UI_STORE_VERSION,
      // Only durable layout preferences belong in storage. Transient
      // interface state such as an open mobile drawer must not persist.
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);

const subscribeToMount = () => () => {};

/**
 * The collapsed width depends on persisted state that the server cannot see.
 * Reading it only after mount keeps the first client render identical to the
 * server markup, then applies the stored preference without a mismatch.
 */
export function useSidebarCollapsed(): boolean {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  return mounted ? collapsed : false;
}
