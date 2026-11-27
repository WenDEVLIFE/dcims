"use client";

import { useEffect } from "react";

import { useDomainStore } from "@/stores/domain-store";

/**
 * Applies the persisted table density to the document so table padding can be
 * driven from CSS instead of threaded through every table component.
 */
export function DensityProvider() {
  const density = useDomainStore(
    (state) => state.settings.preferences?.tableDensity ?? "comfortable",
  );

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  return null;
}
