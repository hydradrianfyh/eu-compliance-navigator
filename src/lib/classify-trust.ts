/**
 * Trust classification — maps the engine's (lifecycle × applicability ×
 * freshness × missing_inputs) quadruple to the three user-facing trust
 * levels defined in UX Refactor v2 spec §7.1 and the four Rules-tab
 * groups (Verified / Indicative / Pending authoring / Needs input).
 *
 * © Yanhao FU
 */

import type { EvaluationResult } from "@/engine/types";
import type { TrustLevel } from "@/components/shared/TrustBadge";
import type { UnknownSubState } from "@/components/shared/ApplicabilityBadge";

export type RulesGroupId =
  | "verified"
  | "indicative"
  | "pending"
  | "needs_input";

export interface RulesGrouping {
  verified: EvaluationResult[];
  indicative: EvaluationResult[];
  pending: EvaluationResult[];
  needs_input: EvaluationResult[];
}

export function classifyTrust(result: EvaluationResult): TrustLevel {
  if (result.lifecycle_state === "PLACEHOLDER") return "pending";
  if (result.lifecycle_state === "ACTIVE") return "verified";
  return "indicative";
}

export function classifyUnknownSubState(
  result: EvaluationResult,
): UnknownSubState | undefined {
  if (result.applicability !== "UNKNOWN") return undefined;
  if (result.lifecycle_state === "PLACEHOLDER") return "not_authored";
  if (result.missing_inputs.length > 0) return "missing_input";
  if (result.was_downgraded_from_applicable) return "source_not_verified";
  return undefined;
}

/**
 * Group evaluation results into the four Rules-tab sections.
 * "needs_input" pulls rules OUT of their natural trust section so users
 * see a focused "fix your setup" list instead.
 */
export function groupByTrust(
  results: readonly EvaluationResult[],
): RulesGrouping {
  const groups: RulesGrouping = {
    verified: [],
    indicative: [],
    pending: [],
    needs_input: [],
  };

  for (const result of results) {
    if (
      result.applicability === "UNKNOWN" &&
      result.missing_inputs.length > 0 &&
      result.lifecycle_state !== "PLACEHOLDER"
    ) {
      groups.needs_input.push(result);
      continue;
    }

    const trust = classifyTrust(result);
    if (trust === "verified") groups.verified.push(result);
    else if (trust === "indicative") groups.indicative.push(result);
    else groups.pending.push(result);
  }

  return groups;
}

/**
 * Render the "Verified" badge's freshness hint per spec §10.
 * Returns undefined when freshness should be suppressed (e.g. Indicative).
 */
export function freshnessHintFor(
  result: EvaluationResult,
): { hint: string; downgradeToAmber: boolean } | undefined {
  if (classifyTrust(result) !== "verified") return undefined;

  const status = result.freshness_status;
  if (!status) return undefined;

  switch (status) {
    case "fresh":
      return { hint: "Fresh", downgradeToAmber: false };
    case "due_soon":
      return { hint: "Review due soon", downgradeToAmber: false };
    case "overdue":
      return { hint: "Review overdue", downgradeToAmber: false };
    case "critically_overdue":
      return { hint: "Critically stale", downgradeToAmber: true };
    case "never_verified":
      // Should not occur for Verified but be defensive.
      return { hint: "Never verified", downgradeToAmber: true };
    case "drifted":
      // Sprint 5: seed has drifted from golden dataset or upstream source.
      // Stronger signal than critically_overdue — the value itself may be wrong.
      return { hint: "Drifted from source", downgradeToAmber: true };
    default:
      return undefined;
  }
}
