"use client";

/**
 * CompareToggle — per-tab scoped Compare button (UX Refactor v2 spec §2.Q2).
 *
 * Unlike the old global `pageMode`, compare state is owned by the tab.
 * This component exposes just the button; the tab renders its own
 * 2-column body when `active` is true.
 *
 * © Yanhao FU
 */

interface CompareToggleProps {
  active: boolean;
  onToggle: () => void;
  label?: string;
}

export function CompareToggle({
  active,
  onToggle,
  label = "Compare with…",
}: CompareToggleProps) {
  return (
    <button
      type="button"
      className={`compare-toggle ${active ? "compare-toggle-active" : ""}`}
      aria-pressed={active}
      onClick={onToggle}
    >
      <span aria-hidden="true">⇆</span>{" "}
      {active ? "Close compare" : label}
    </button>
  );
}
