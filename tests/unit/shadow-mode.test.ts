/**
 * Sprint 7 regression: SHADOW lifecycle state for 4-week gray release.
 *
 * Contract:
 *   - SHADOW is valid in ruleLifecycleStates enum.
 *   - Engine downgrades SHADOW rules the same as SEED_UNVERIFIED (capped
 *     at CONDITIONAL).
 *   - classifyTrust groups SHADOW under "indicative", NOT "verified".
 *   - classifyTrust groups SHADOW under "indicative" even if rule would
 *     otherwise be APPLICABLE — no shadow content leaks into Verified UI.
 *
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import { classifyTrust } from "@/lib/classify-trust";
import { ruleLifecycleStates } from "@/shared/constants";
import type { EvaluationResult } from "@/engine/types";

function shadowResult(overrides: Partial<EvaluationResult> = {}): EvaluationResult {
  return {
    rule_id: "REG-SHADOW-TEST",
    title: "Shadow test rule",
    short_label: "Shadow",
    legal_family: "vehicle_approval",
    ui_package: "horizontal",
    process_stage: "type_approval",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    sources: [],
    lifecycle_state: "SHADOW",
    applicability: "CONDITIONAL",
    explanation: "shadow",
    matched_conditions: [],
    unmatched_conditions: [],
    missing_inputs: [],
    trigger_path: "declarative",
    applicability_summary: "",
    obligation_text: "",
    evidence_tasks: [],
    owner_hint: "homologation",
    planning_lead_time_months: null,
    exclusions: [],
    temporal: {
      entry_into_force: null,
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes: null,
    },
    manual_review_required: false,
    manual_review_reason: null,
    notes: null,
    is_future_dated: false,
    is_date_unknown: false,
    months_until_effective: null,
    was_downgraded_from_applicable: false,
    ...overrides,
  };
}

describe("SHADOW lifecycle state (Sprint 7)", () => {
  it("is a valid ruleLifecycleStates enum value", () => {
    expect(ruleLifecycleStates).toContain("SHADOW");
  });

  it("is positioned between SEED_UNVERIFIED and ACTIVE in the order", () => {
    const idxSeed = ruleLifecycleStates.indexOf("SEED_UNVERIFIED");
    const idxShadow = ruleLifecycleStates.indexOf("SHADOW");
    const idxActive = ruleLifecycleStates.indexOf("ACTIVE");
    expect(idxShadow).toBeGreaterThan(idxSeed);
    expect(idxShadow).toBeLessThan(idxActive);
  });

  it("classifyTrust returns 'indicative' for SHADOW rules", () => {
    expect(classifyTrust(shadowResult())).toBe("indicative");
  });

  it("even an APPLICABLE shadow rule is still classified 'indicative' (no leak into Verified)", () => {
    const result = shadowResult({ applicability: "APPLICABLE" });
    expect(classifyTrust(result)).toBe("indicative");
  });
});
