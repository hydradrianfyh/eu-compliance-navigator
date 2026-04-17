import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/AppShell";

/**
 * Workspace route-group layout. Wraps every tab in the AppShell so the
 * sticky nav, tab nav, and status bar render consistently.
 *
 * The parenthesized group name "(workspace)" does NOT appear in the URL.
 *
 * © Yanhao FU
 */
export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
