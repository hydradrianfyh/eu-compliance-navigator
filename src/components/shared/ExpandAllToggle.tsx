"use client";

/**
 * ExpandAllToggle — one-click "Expand all" ↔ "Collapse all" toggle.
 *
 * Designed for list-like panels where each item has its own local
 * expand/collapse state. Instead of hoisting state up (which would break
 * per-item control), this button emits a broadcast-signal; listeners
 * sync their local state when the tick changes but can still be toggled
 * individually afterwards.
 *
 * © Yanhao FU
 */

interface ExpandAllToggleProps {
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function ExpandAllToggle({
  expanded,
  onToggle,
  className,
}: ExpandAllToggleProps) {
  return (
    <button
      type="button"
      className={`expand-all-toggle ${className ?? ""}`}
      aria-pressed={expanded}
      onClick={onToggle}
      title={
        expanded
          ? "Collapse every section and every rule card"
          : "Expand every section and every rule card"
      }
    >
      <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>{" "}
      {expanded ? "Collapse all" : "Expand all"}
    </button>
  );
}
