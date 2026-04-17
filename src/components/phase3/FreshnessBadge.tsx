"use client";

/**
 * FreshnessBadge — visual marker for the 5-state freshness model
 * (fresh / due_soon / overdue / critically_overdue / never_verified).
 *
 * Upgraded in Phase E to:
 *   1. Use semantic tokens via `.freshness-badge-*` classes (not raw Tailwind)
 *      so forced-colors + grayscale print degrade gracefully.
 *   2. Render icon + text + color (spec §B5 / §11.2 badge construction rule).
 *   3. Carry an actionable tooltip via `title`.
 *
 * Kept under `phase3/` path for import-stability with legacy consumers
 * (OwnerDashboardPanel, RuleCard). New RuleCardV2 does not use this;
 * it uses the TrustBadge's freshnessHint string instead.
 *
 * © Yanhao FU
 */

import type { FreshnessStatus } from "@/registry/schema";

interface BadgeMeta {
  icon: string;
  label: string;
  tooltip: string;
}

const META: Record<FreshnessStatus, BadgeMeta> = {
  fresh: {
    icon: "✓",
    label: "Fresh",
    tooltip: "Verified recently. No action required.",
  },
  due_soon: {
    icon: "⏱",
    label: "Review due soon",
    tooltip: "Within the review cadence window — schedule a review.",
  },
  overdue: {
    icon: "⚠",
    label: "Overdue",
    tooltip: "Review cadence exceeded. Re-verify the source.",
  },
  critically_overdue: {
    icon: "✕",
    label: "Critical",
    tooltip: "Critically overdue — do not rely on this rule without re-verification.",
  },
  never_verified: {
    icon: "○",
    label: "Never verified",
    tooltip: "This rule has no human review record.",
  },
};

interface FreshnessBadgeProps {
  status?: FreshnessStatus;
  /** Optional override tooltip. Defaults to status-specific copy. */
  title?: string;
}

export function FreshnessBadge({ status, title }: FreshnessBadgeProps) {
  if (!status) return null;
  const meta = META[status];
  return (
    <span
      className={`freshness-badge freshness-badge-${status}`}
      title={title ?? meta.tooltip}
      data-testid={`freshness-badge-${status}`}
    >
      <span className="freshness-badge-icon" aria-hidden="true">
        {meta.icon}
      </span>
      <span className="freshness-badge-text">{meta.label}</span>
    </span>
  );
}
