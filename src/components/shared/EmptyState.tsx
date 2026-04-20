"use client";

/**
 * EmptyState — the one-and-only primitive for "no data here yet" panels.
 *
 * Used across Plan / Rules / Status / Coverage to keep wording and layout
 * consistent. Always follows this shape:
 *
 *   [icon]
 *   Title (what's missing)
 *   Description (why, one sentence)
 *   [CTA button]            [secondary link]
 *
 * Accessibility: role="status" aria-live="polite" so screen readers
 * announce empty states when filters change.
 *
 * © Yanhao FU
 */

import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: "neutral" | "info" | "warning";
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  tone = "neutral",
}: EmptyStateProps) {
  return (
    <div
      className={`empty-state empty-state-${tone}`}
      role="status"
      aria-live="polite"
      data-testid="empty-state"
    >
      {icon ? (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h3 className="empty-state-title">{title}</h3>
      {description ? (
        <p className="empty-state-description">{description}</p>
      ) : null}
      {action || secondaryAction ? (
        <div className="empty-state-actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
