"use client";

/**
 * LastActiveTabTracker — silent component that listens to pathname changes
 * and writes the active tab into the store (+ localStorage) so returning
 * visits can land on the same tab the user left from.
 *
 * Renders nothing. Drop it at the top of the workspace layout once.
 *
 * © Yanhao FU
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  TAB_IDS,
  useAppShellStore,
  type TabId,
} from "@/state/app-shell-store";

function resolveTabFromPath(path: string | null): TabId | null {
  if (!path) return null;
  const segment = path.split("/").filter(Boolean)[0] ?? "";
  if ((TAB_IDS as readonly string[]).includes(segment)) {
    return segment as TabId;
  }
  return null;
}

export function LastActiveTabTracker() {
  const pathname = usePathname();
  const setLastActiveTab = useAppShellStore((state) => state.setLastActiveTab);

  useEffect(() => {
    const tab = resolveTabFromPath(pathname);
    if (tab) setLastActiveTab(tab);
  }, [pathname, setLastActiveTab]);

  return null;
}
