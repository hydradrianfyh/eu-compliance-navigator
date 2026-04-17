"use client";

/**
 * ApplicabilityBadge — translates the engine's ApplicabilityResult into
 * user-facing wording per UX Refactor v2 §9.2.
 *
 * For UNKNOWN we accept an optional `subState` because the raw UNKNOWN
 * masks three distinct situations (authoring-pending, source unverified,
 * missing input).
 *
 * © Yanhao FU
 */

import type { ApplicabilityResult } from "@/shared/constants";

export type UnknownSubState =
  | "not_authored"
  | "source_not_verified"
  | "missing_input";

interface ApplicabilityBadgeProps {
  applicability: ApplicabilityResult;
  subState?: UnknownSubState;
  effectiveDate?: string | null;
}

const BADGE_META: Record<
  ApplicabilityResult,
  { icon: string; cls: string; label: string }
> = {
  APPLICABLE: { icon: "●", cls: "applicability-applies", label: "Applies" },
  NOT_APPLICABLE: {
    icon: "—",
    cls: "applicability-not-applies",
    label: "Does not apply",
  },
  CONDITIONAL: {
    icon: "◐",
    cls: "applicability-may-apply",
    label: "May apply",
  },
  UNKNOWN: {
    icon: "?",
    cls: "applicability-unknown",
    label: "Unknown",
  },
  FUTURE: {
    icon: "◷",
    cls: "applicability-future",
    label: "Applies from",
  },
};

const UNKNOWN_SUB_LABELS: Record<UnknownSubState, string> = {
  not_authored: "Not authored yet",
  source_not_verified: "Source not verified",
  missing_input: "Missing project input",
};

export function ApplicabilityBadge({
  applicability,
  subState,
  effectiveDate,
}: ApplicabilityBadgeProps) {
  const meta = BADGE_META[applicability];

  let label = meta.label;
  if (applicability === "UNKNOWN" && subState) {
    label = UNKNOWN_SUB_LABELS[subState];
  } else if (applicability === "FUTURE" && effectiveDate) {
    label = `Applies from ${effectiveDate}`;
  }

  return (
    <span className={`applicability-badge ${meta.cls}`}>
      <span className="applicability-badge-icon" aria-hidden="true">
        {meta.icon}
      </span>
      <span className="applicability-badge-text">{label}</span>
    </span>
  );
}
