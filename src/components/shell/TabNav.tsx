"use client";

/**
 * TabNav — five-tab primary navigation for UX Refactor v2.
 *
 * Renders buttons (not anchors) because the active-tab style depends on the
 * current pathname; next/link handles prefetching internally. Using a button
 * also keeps focus rings consistent with the rest of the app.
 *
 * © Yanhao FU
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TAB_IDS, type TabId } from "@/state/app-shell-store";

interface TabDescriptor {
  id: TabId;
  label: string;
  description: string;
}

const TABS: readonly TabDescriptor[] = [
  { id: "setup", label: "Setup", description: "Enter project and vehicle data" },
  { id: "status", label: "Status", description: "Market-entry readiness" },
  { id: "plan", label: "Plan", description: "Timeline and owner tasks" },
  { id: "rules", label: "Rules", description: "Detailed rule evaluation" },
  { id: "coverage", label: "Coverage", description: "Governance and gaps" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="tab-nav" aria-label="Primary">
      <ul className="tab-nav-list">
        {TABS.map((tab) => {
          const href = `/${tab.id}`;
          const isActive =
            pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <li key={tab.id}>
              <Link
                href={href}
                className={`tab-nav-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                title={tab.description}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Re-export so consumers don't have to import from two places.
export { TAB_IDS };
export type { TabId };
