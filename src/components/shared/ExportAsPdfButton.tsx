"use client";

/**
 * ExportAsPdfButton — per-tab export action (UX Refactor v2 spec §5.3, §2.Q3).
 *
 * The product decision was to scope "Report mode" to a per-tab print
 * action rather than a global view toggle. This component wraps
 * window.print() with a tab-scoped CSS hook so each tab can tailor its
 * print layout via `.<tab>-tab.print-view`.
 *
 * © Yanhao FU
 */

import { useCallback, useEffect } from "react";

interface ExportAsPdfButtonProps {
  /** CSS root class to tag during printing, e.g. "status-tab". */
  tabClass: string;
  /** Optional extra wrapper class passed through to the button. */
  className?: string;
  label?: string;
}

export function ExportAsPdfButton({
  tabClass,
  className,
  label = "Export as PDF",
}: ExportAsPdfButtonProps) {
  // Toggle a `<html>`-level class so tab-specific print CSS can scope.
  useEffect(() => {
    const root = document.documentElement;
    const handleBefore = () => root.classList.add(`print-${tabClass}`);
    const handleAfter = () => root.classList.remove(`print-${tabClass}`);
    window.addEventListener("beforeprint", handleBefore);
    window.addEventListener("afterprint", handleAfter);
    return () => {
      window.removeEventListener("beforeprint", handleBefore);
      window.removeEventListener("afterprint", handleAfter);
    };
  }, [tabClass]);

  const handleClick = useCallback(() => {
    window.print();
  }, []);

  return (
    <button
      type="button"
      className={`export-pdf-button ${className ?? ""}`}
      onClick={handleClick}
      aria-label={`${label} — opens browser print dialog`}
    >
      <span aria-hidden="true">⬇</span> {label}
    </button>
  );
}
