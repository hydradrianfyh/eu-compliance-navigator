"use client";

/**
 * StatusBar — sticky footer across every workspace tab.
 *
 * Shows project name, target countries, SOP date, and a legal disclaimer.
 * Visible on all tabs so the user always knows which scenario is active
 * and that the tool is not legal advice.
 *
 * © Yanhao FU
 */

import { useAppShellStore } from "@/state/app-shell-store";

function formatCountries(countries: readonly string[]): string {
  if (countries.length === 0) return "no markets selected";
  if (countries.length <= 4) return countries.join(" · ");
  return `${countries.slice(0, 4).join(" · ")} +${countries.length - 4}`;
}

export function StatusBar() {
  const config = useAppShellStore((state) => state.config);
  const hydrated = useAppShellStore((state) => state.hydrated);

  if (!hydrated) {
    return (
      <footer className="status-bar" aria-live="polite">
        <span className="status-bar-loading">Loading project data…</span>
      </footer>
    );
  }

  const { projectName, targetCountries, sopDate } = config;

  return (
    <footer className="status-bar" aria-label="Project summary and disclaimer">
      <div className="status-bar-project">
        <span className="status-bar-project-name">
          {projectName || "Untitled program"}
        </span>
        <span className="status-bar-sep" aria-hidden="true">
          ·
        </span>
        <span>{formatCountries(targetCountries)}</span>
        <span className="status-bar-sep" aria-hidden="true">
          ·
        </span>
        <span>{sopDate ? `SOP ${sopDate}` : "SOP not set"}</span>
      </div>
      <div className="status-bar-disclaimer">
        This tool is a navigation aid, not legal advice. Always validate with
        your homologation partner.
      </div>
    </footer>
  );
}
