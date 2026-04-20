"use client";

/**
 * SetupProgress — visual progress bar + per-section checklist.
 * Reads from the app-shell store so every tab can reference the same
 * completeness state if needed. Logic lives in `src/lib/setup-progress.ts`.
 *
 * © Yanhao FU
 */

import { useMemo } from "react";

import { useAppShellStore } from "@/state/app-shell-store";
import { buildSetupProgressReport } from "@/lib/setup-progress";

export function SetupProgress() {
  const config = useAppShellStore((state) => state.config);
  const report = useMemo(() => buildSetupProgressReport(config), [config]);

  return (
    <section className="setup-progress panel" aria-label="Setup progress">
      <header className="setup-progress-header">
        <span className="setup-progress-title">Setup progress</span>
        <span className="setup-progress-count">
          {report.requiredComplete} of {report.requiredTotal} required sections
          complete
        </span>
      </header>
      <div
        className="setup-progress-bar"
        role="progressbar"
        aria-valuenow={report.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="setup-progress-bar-fill"
          style={{ width: `${report.percentage}%` }}
        />
      </div>
      <ul className="setup-progress-list">
        {report.sections.map((section) => (
          <li
            key={section.id}
            className={`setup-progress-item ${section.complete ? "complete" : "incomplete"} ${section.required ? "required" : "optional"}`}
          >
            <span className="setup-progress-item-icon" aria-hidden="true">
              {section.complete ? "✓" : section.required ? "⚠" : "○"}
            </span>
            <span className="setup-progress-item-label">{section.label}</span>
            {section.missingFields.length > 0 ? (
              <span className="setup-progress-item-missing">
                missing: {section.missingFields.join(", ")}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
