"use client";

/**
 * AppShell — the single layout for the 5-tab workspace.
 *
 * Responsibilities:
 *   - Hydrate the store on first client mount (reads persisted localStorage).
 *   - Run LastActiveTabTracker so every navigation updates the store.
 *   - Render the sticky header (GlobalNav + TabNav), the tab content, and
 *     the sticky footer (StatusBar).
 *
 * Marked `"use client"` because the store and usePathname cannot run during
 * server rendering.
 *
 * © Yanhao FU
 */

import { useEffect, type ReactNode } from "react";

import { useAppShellStore } from "@/state/app-shell-store";
import { GlobalNav } from "@/components/shell/GlobalNav";
import { LastActiveTabTracker } from "@/components/shell/LastActiveTabTracker";
import { StatusBar } from "@/components/shell/StatusBar";
import { TabNav } from "@/components/shell/TabNav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Hydrate once per module load. `hydrate()` is idempotent.
  useEffect(() => {
    useAppShellStore.getState().hydrate();
  }, []);

  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <GlobalNav />
        <TabNav />
      </header>
      <LastActiveTabTracker />
      <main className="app-shell-main">{children}</main>
      <StatusBar />
    </div>
  );
}
