/**
 * Phase C unit tests for trust classification + Rules grouping.
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import type { EvaluationResult } from "@/engine/types";
import {
  classifyTrust,
  classifyUnknownSubState,
  freshnessHintFor,
  groupByTrust,
} from "@/lib/classify-trust";

function baseResult(overrides: Partial<EvaluationResult> = {}): EvaluationResult {
  return {
    rule_id: "REG-TEST-001",
    title: "Test",
    short_label: "Test",
    legal_family: "vehicle_approval",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    sources: [],
    lifecycle_state: "ACTIVE",
    applicability: "APPLICABLE",
    explanation: "",
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

describe("classifyTrust", () => {
  it("maps ACTIVE → verified", () => {
    expect(classifyTrust(baseResult({ lifecycle_state: "ACTIVE" }))).toBe(
      "verified",
    );
  });

  it("maps PLACEHOLDER → pending", () => {
    expect(
      classifyTrust(baseResult({ lifecycle_state: "PLACEHOLDER" })),
    ).toBe("pending");
  });

  it("maps SEED_UNVERIFIED → indicative", () => {
    expect(
      classifyTrust(baseResult({ lifecycle_state: "SEED_UNVERIFIED" })),
    ).toBe("indicative");
  });

  it("maps DRAFT → indicative", () => {
    expect(classifyTrust(baseResult({ lifecycle_state: "DRAFT" }))).toBe(
      "indicative",
    );
  });
});

describe("classifyUnknownSubState", () => {
  it("returns undefined for non-UNKNOWN applicability", () => {
    expect(
      classifyUnknownSubState(baseResult({ applicability: "APPLICABLE" })),
    ).toBeUndefined();
  });

  it("returns 'not_authored' for PLACEHOLDER + UNKNOWN", () => {
    expect(
      classifyUnknownSubState(
        baseResult({
          applicability: "UNKNOWN",
          lifecycle_state: "PLACEHOLDER",
        }),
      ),
    ).toBe("not_authored");
  });

  it("returns 'missing_input' for UNKNOWN + missing_inputs", () => {
    expect(
      classifyUnknownSubState(
        baseResult({
          applicability: "UNKNOWN",
          lifecycle_state: "SEED_UNVERIFIED",
          missing_inputs: ["sopDate"],
        }),
      ),
    ).toBe("missing_input");
  });

  it("returns 'source_not_verified' for UNKNOWN downgraded from APPLICABLE", () => {
    expect(
      classifyUnknownSubState(
        baseResult({
          applicability: "UNKNOWN",
          lifecycle_state: "SEED_UNVERIFIED",
          was_downgraded_from_applicable: true,
        }),
      ),
    ).toBe("source_not_verified");
  });
});

describe("groupByTrust", () => {
  it("splits rules into four groups", () => {
    const results = [
      baseResult({ rule_id: "A", lifecycle_state: "ACTIVE" }),
      baseResult({
        rule_id: "B",
        lifecycle_state: "SEED_UNVERIFIED",
        applicability: "CONDITIONAL",
      }),
      baseResult({
        rule_id: "C",
        lifecycle_state: "PLACEHOLDER",
        applicability: "UNKNOWN",
      }),
      baseResult({
        rule_id: "D",
        lifecycle_state: "SEED_UNVERIFIED",
        applicability: "UNKNOWN",
        missing_inputs: ["powertrain"],
      }),
    ];

    const groups = groupByTrust(results);
    expect(groups.verified.map((r) => r.rule_id)).toEqual(["A"]);
    expect(groups.indicative.map((r) => r.rule_id)).toEqual(["B"]);
    expect(groups.pending.map((r) => r.rule_id)).toEqual(["C"]);
    expect(groups.needs_input.map((r) => r.rule_id)).toEqual(["D"]);
  });

  it("keeps PLACEHOLDER in pending even when missing_inputs non-empty", () => {
    const groups = groupByTrust([
      baseResult({
        lifecycle_state: "PLACEHOLDER",
        applicability: "UNKNOWN",
        missing_inputs: ["x"],
      }),
    ]);
    expect(groups.pending).toHaveLength(1);
    expect(groups.needs_input).toHaveLength(0);
  });
});

describe("freshnessHintFor", () => {
  it("returns undefined for Indicative rules", () => {
    expect(
      freshnessHintFor(
        baseResult({ lifecycle_state: "SEED_UNVERIFIED" }),
      ),
    ).toBeUndefined();
  });

  it("returns 'Fresh' with no downgrade for fresh Verified rules", () => {
    expect(
      freshnessHintFor(
        baseResult({
          lifecycle_state: "ACTIVE",
          freshness_status: "fresh",
        } as unknown as Partial<EvaluationResult>),
      ),
    ).toEqual({ hint: "Fresh", downgradeToAmber: false });
  });

  it("flags critically_overdue with downgrade", () => {
    expect(
      freshnessHintFor(
        baseResult({
          lifecycle_state: "ACTIVE",
          freshness_status: "critically_overdue",
        } as unknown as Partial<EvaluationResult>),
      ),
    ).toEqual({ hint: "Critically stale", downgradeToAmber: true });
  });
});
