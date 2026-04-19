/**
 * Sprint 5 regression: freshness 'drifted' 6th state overrides
 * time-based cadence when the seed's freshness_status is explicitly
 * set to 'drifted' by CI / drift-alert.
 *
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import { computeFreshnessStatus, summarizeFreshness } from "@/registry/freshness";
import type { Rule } from "@/registry/schema";

function baseRule(overrides: Partial<Rule> = {}): Rule {
  return {
    stable_id: "REG-TEST-001",
    title: "Test",
    short_label: "Test",
    legal_family: "vehicle_approval",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Test",
        source_family: "EUR-Lex",
        reference: "Test ref",
        official_url: null,
        oj_reference: null,
        last_verified_on: null,
      },
    ],
    lifecycle_state: "ACTIVE",
    vehicle_scope: "MN",
    applicability_summary: "Test",
    exclusions: [],
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [],
      fallback_if_missing: "unknown",
    },
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
    planning_lead_time_months: null,
    output_kind: "obligation",
    obligation_text: "Test",
    evidence_tasks: [],
    owner_hint: "homologation",
    manual_review_required: false,
    manual_review_reason: null,
    notes: null,
    ui_package: "horizontal",
    process_stage: "type_approval",
    ...overrides,
  };
}

describe("computeFreshnessStatus · drifted 6th state (Sprint 5)", () => {
  const now = new Date("2026-04-19T00:00:00Z");

  it("returns 'drifted' when rule.freshness_status is explicitly 'drifted'", () => {
    const rule = baseRule({
      last_human_review_at: "2026-04-10", // fresh by time
      freshness_status: "drifted", // but CI flagged drift
    });
    expect(computeFreshnessStatus(rule, now)).toBe("drifted");
  });

  it("'drifted' override beats 'fresh' time cadence", () => {
    const rule = baseRule({
      last_human_review_at: "2026-04-18", // 1 day ago, well within fresh
      review_cadence_days: 180,
      freshness_status: "drifted",
    });
    expect(computeFreshnessStatus(rule, now)).toBe("drifted");
  });

  it("without explicit drift, time cadence still governs", () => {
    const rule = baseRule({
      last_human_review_at: "2026-04-10",
      review_cadence_days: 180,
    });
    expect(computeFreshnessStatus(rule, now)).toBe("fresh");
  });

  it("summarizeFreshness now counts a 'drifted' bucket", () => {
    const rules: Rule[] = [
      baseRule({
        stable_id: "R-A",
        last_human_review_at: "2026-04-10",
      }),
      baseRule({
        stable_id: "R-B",
        last_human_review_at: "2026-04-10",
        freshness_status: "drifted",
      }),
      baseRule({
        stable_id: "R-C",
        last_human_review_at: null as unknown as string,
      }),
    ];
    const summary = summarizeFreshness(rules, now);
    expect(summary.drifted).toBe(1);
    expect(summary.fresh).toBe(1);
    expect(summary.never_verified).toBe(1);
    expect(summary.total).toBe(3);
  });
});
