"use client";

import { useTheme } from "next-themes";
import { useId, useSyncExternalStore } from "react";

const subscribeToMount = () => () => {};

export function ThemeSwitcher() {
  const id = useId();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Theme
      </label>
      <select
        id={id}
        className="min-h-11 rounded-md border border-muted-foreground bg-card px-3 text-base text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 sm:text-sm"
        disabled={!mounted}
        value={mounted ? theme ?? "system" : "system"}
        onChange={(event) => setTheme(event.currentTarget.value)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
