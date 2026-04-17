"use client";

/**
 * OptionalSection — shared wrapper for Advanced sub-forms (and the HMI
 * sub-block inside Digital & Cockpit). Handles the opt-in UX:
 *
 *   - When the sub-object is undefined: shows an "Add {label}" button.
 *   - When populated: renders children + a "Clear {label}" reset button.
 *
 * Keeps every sub-form visually consistent and centralizes the enable
 * logic so the per-field sub-components can focus on field-level rendering.
 *
 * © Yanhao FU
 */

import type { ReactNode } from "react";

interface OptionalSectionProps {
  title: string;
  hint?: string;
  populated: boolean;
  onEnable: () => void;
  onClear: () => void;
  children: ReactNode;
}

export function OptionalSection({
  title,
  hint,
  populated,
  onEnable,
  onClear,
  children,
}: OptionalSectionProps) {
  return (
    <section className="optional-section">
      <header className="optional-section-header">
        <h4 className="optional-section-title">{title}</h4>
        {populated ? (
          <button
            type="button"
            className="optional-section-clear"
            onClick={onClear}
          >
            Clear
          </button>
        ) : null}
      </header>
      {hint ? <p className="optional-section-hint">{hint}</p> : null}
      {populated ? (
        <div className="optional-section-fields">{children}</div>
      ) : (
        <button
          type="button"
          className="optional-section-enable secondary-button"
          onClick={onEnable}
        >
          Add {title.toLowerCase()} detail
        </button>
      )}
    </section>
  );
}
