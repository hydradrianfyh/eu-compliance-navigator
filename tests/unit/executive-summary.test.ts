import { describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import type { VehicleConfig } from "@/config/schema";
import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import {
  buildExecutiveSummary,
  type ExecutiveSummary,
} from "@/engine/executive-summary";
import { buildTimeline } from "@/engine/timeline";
import type { EvaluationResult } from "@/engine/types";
import { allSeedRules } from "@/registry/seed";
import type { Rule } from "@/registry/schema";
import { pilotMY2027BEV } from "../../fixtures/pilot-my2027-bev";

function buildRule(overrides: Partial<Rule> = {}): Rule {
  return {
    stable_id: "REG-ES-001",
    title: "Exec summary test rule",
    short_label: "ES-001",
    legal_family: "cybersecurity",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Test",
        source_family: "UNECE",
        reference: "UNECE Regulation No. 999",
        official_url: null,
        oj_reference: null,
        last_verified_on: null,
      },
    ],
    lifecycle_state: "ACTIVE",
    vehicle_scope: "",
    applicability_summary: "",
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
    obligation_text: "test",
    evidence_tasks: [],
    owner_hint: "homologation",
    manual_review_required: false,
    manual_review_reason: null,
    notes: null,
    ui_package: "horizontal",
    process_stage: "type_approval",
    required_documents: ["doc-a"],
    ...overrides,
  };
}

function buildResult(
  rule: Rule,
  applicability: EvaluationResult["applicability"],
): EvaluationResult {
  return {
    rule_id: rule.stable_id,
    title: rule.title,
    short_label: rule.short_label,
    legal_family: rule.legal_family,
    ui_package: rule.ui_package,
    process_stage: rule.process_stage,
    jurisdiction: rule.jurisdiction,
    jurisdiction_level: rule.jurisdiction_level,
    sources: rule.sources,
    lifecycle_state: rule.lifecycle_state,
    applicability,
    explanation: "test",
    matched_conditions: [],
    unmatched_conditions: [],
    missing_inputs: [],
    trigger_path: "declarative",
    applicability_summary: rule.applicability_summary,
    obligation_text: rule.obligation_text,
    evidence_tasks: rule.evidence_tasks,
    owner_hint: rule.owner_hint,
    planning_lead_time_months: rule.planning_lead_time_months,
    exclusions: rule.exclusions,
    temporal: rule.temporal,
    manual_review_required: rule.manual_review_required,
    manual_review_reason: rule.manual_review_reason,
    notes: rule.notes,
    is_future_dated: false,
    is_date_unknown: false,
    months_until_effective: null,
    was_downgraded_from_applicable: false,
    freshness_status: rule.freshness_status,
  };
}

const now = new Date("2026-04-16T00:00:00Z");

const baseVehicleConfig: VehicleConfig = {
  ...defaultVehicleConfig,
  projectName: "Exec Summary Test",
  targetCountries: ["DE"],
  sopDate: "2027-01-15",
  firstRegistrationDate: "2027-04-01",
  approvalType: "new_type",
};

describe("buildExecutiveSummary", () => {
  it("produces a non-trivial summary for the pilot MY2027 BEV fixture", () => {
    const engineConfig = buildEngineConfig(pilotMY2027BEV);
    const results = evaluateAllRules(allSeedRules, engineConfig);
    const timeline = buildTimeline({
      config: pilotMY2027BEV,
      results,
      rules: allSeedRules,
      now,
    });

    const summary = buildExecutiveSummary({
      config: pilotMY2027BEV,
      results,
      rules: allSeedRules,
      timeline,
      now,
    });

    expect(summary.verified_count).toBeGreaterThanOrEqual(11);
    expect(summary.coverageScore).toBeGreaterThan(0);
    expect(summary.coverageScore).toBeLessThanOrEqual(100);

    const activeCount = allSeedRules.filter(
      (r) => r.lifecycle_state === "ACTIVE",
    ).length;
    expect(summary.freshnessOverview.total).toBe(activeCount);

    // FR and NL remain PLACEHOLDER overlays, so they should be at risk.
    expect(summary.countriesAtRisk).toContain("FR");
    expect(summary.countriesAtRisk).toContain("NL");
    // DE has 5 authored ACTIVE overlay rules, so it must NOT be at risk.
    expect(summary.countriesAtRisk).not.toContain("DE");

    expect(summary.topDeadlines.length).toBeLessThanOrEqual(10);
    expect(summary.topBlockers.length).toBeLessThanOrEqual(5);

    expect(["high", "medium", "low"]).toContain(summary.confidence);
    expect(typeof summary.generated_at).toBe("string");
    expect(Number.isNaN(new Date(summary.generated_at).valueOf())).toBe(false);
  });

  it("returns canEnterMarket=true when all APPLICABLE rules have evidence and no country is at risk", () => {
    const rule = buildRule({
      stable_id: "REG-ES-PASS-1",
      lifecycle_state: "ACTIVE",
      third_party_verification_required: true,
      required_documents: ["doc-one"],
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2027-07-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });
    const result = buildResult(rule, "APPLICABLE");
    const timeline = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    const summary = buildExecutiveSummary({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      timeline,
      now,
    });

    expect(summary.canEnterMarket).toBe(true);
    expect(summary.countriesAtRisk).toEqual([]);
  });

  it("returns canEnterMarket=false when an ACTIVE third-party rule has no evidence", () => {
    const rule = buildRule({
      stable_id: "REG-ES-FAIL-1",
      lifecycle_state: "ACTIVE",
      third_party_verification_required: true,
      required_documents: [],
      evidence_tasks: [],
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2026-09-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });
    const result = buildResult(rule, "APPLICABLE");
    const timeline = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    const summary = buildExecutiveSummary({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      timeline,
      now,
    });

    expect(summary.canEnterMarket).toBe(false);
    expect(summary.topBlockers[0]?.reason).toContain(
      "third_party_verification_required",
    );
    expect(summary.topBlockers[0]?.reason).toContain("no evidence");
  });

  it("sorts topBlockers by severity DESC, then deadline ASC", () => {
    // rule A: medium severity, deadline ~11 months ahead (2027-03 from 2026-04).
    const ruleA = buildRule({
      stable_id: "REG-ES-SORT-A",
      lifecycle_state: "SEED_UNVERIFIED",
      third_party_verification_required: false,
      required_documents: ["doc-a"],
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2027-03-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });
    // rule B: high severity (ACTIVE + 3rd-party + within 6 months), deadline 2026-09 (~5 months).
    const ruleB = buildRule({
      stable_id: "REG-ES-SORT-B",
      lifecycle_state: "ACTIVE",
      third_party_verification_required: true,
      required_documents: ["doc-b"],
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2026-09-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });
    // rule C: high severity as well, earlier deadline 2026-07 (~3 months).
    const ruleC = buildRule({
      stable_id: "REG-ES-SORT-C",
      lifecycle_state: "ACTIVE",
      third_party_verification_required: true,
      required_documents: ["doc-c"],
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2026-07-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });

    const rules = [ruleA, ruleB, ruleC];
    const results = rules.map((r) => buildResult(r, "APPLICABLE"));
    const timeline = buildTimeline({
      config: baseVehicleConfig,
      results,
      rules,
      now,
    });

    const summary = buildExecutiveSummary({
      config: baseVehicleConfig,
      results,
      rules,
      timeline,
      now,
    });

    expect(summary.topBlockers.length).toBe(3);
    // high severity blockers come before medium.
    expect(summary.topBlockers[0].severity).toBe("high");
    expect(summary.topBlockers[1].severity).toBe("high");
    expect(summary.topBlockers[2].severity).toBe("medium");
    // between the two high blockers, the earlier deadline wins.
    expect(summary.topBlockers[0].stable_id).toBe("REG-ES-SORT-C");
    expect(summary.topBlockers[1].stable_id).toBe("REG-ES-SORT-B");
    expect(summary.topBlockers[2].stable_id).toBe("REG-ES-SORT-A");
  });

  it("clamps coverageScore to [0, 100] and keeps it an integer", () => {
    const engineConfig = buildEngineConfig(pilotMY2027BEV);
    const results = evaluateAllRules(allSeedRules, engineConfig);
    const timeline = buildTimeline({
      config: pilotMY2027BEV,
      results,
      rules: allSeedRules,
      now,
    });
    const summary = buildExecutiveSummary({
      config: pilotMY2027BEV,
      results,
      rules: allSeedRules,
      timeline,
      now,
    });

    expect(Number.isInteger(summary.coverageScore)).toBe(true);
    expect(summary.coverageScore).toBeGreaterThanOrEqual(0);
    expect(summary.coverageScore).toBeLessThanOrEqual(100);

    // empty registry → coverageScore is 0, not NaN.
    const emptyTimeline = buildTimeline({
      config: baseVehicleConfig,
      results: [],
      rules: [],
      now,
    });
    const emptySummary = buildExecutiveSummary({
      config: baseVehicleConfig,
      results: [],
      rules: [],
      timeline: emptyTimeline,
      now,
    });
    expect(emptySummary.coverageScore).toBe(0);
    expect(emptySummary.confidence).toBe("low");
  });

  it("derives topDeadlines sorted by months_remaining ASC with at most 10 entries", () => {
    // Build 12 rules with different deadlines to verify slicing.
    const rules: Rule[] = [];
    const results: EvaluationResult[] = [];
    for (let i = 0; i < 12; i += 1) {
      // deadlines from 2026-06 .. 2027-05
      const month = ((5 + i) % 12) + 1;
      const year = 2026 + Math.floor((5 + i) / 12);
      const iso = `${year}-${month.toString().padStart(2, "0")}-01`;
      const rule = buildRule({
        stable_id: `REG-ES-DL-${i.toString().padStart(2, "0")}`,
        lifecycle_state: "ACTIVE",
        required_documents: ["doc"],
        temporal: {
          entry_into_force: null,
          applies_to_new_types_from: iso,
          applies_to_all_new_vehicles_from: null,
          applies_to_first_registration_from: null,
          applies_from_generic: null,
          effective_to: null,
          small_volume_derogation_until: null,
          notes: null,
        },
      });
      rules.push(rule);
      results.push(buildResult(rule, "APPLICABLE"));
    }

    const timeline = buildTimeline({
      config: baseVehicleConfig,
      results,
      rules,
      now,
    });
    const summary: ExecutiveSummary = buildExecutiveSummary({
      config: baseVehicleConfig,
      results,
      rules,
      timeline,
      now,
    });

    expect(summary.topDeadlines.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < summary.topDeadlines.length; i += 1) {
      expect(
        summary.topDeadlines[i].months_remaining,
      ).toBeGreaterThanOrEqual(summary.topDeadlines[i - 1].months_remaining);
    }
  });

  it("exposes registry_totals for Status/Coverage reconciliation (UX-002)", () => {
    const rules: Rule[] = [
      buildRule({ stable_id: "REG-A", lifecycle_state: "ACTIVE" }),
      buildRule({ stable_id: "REG-B", lifecycle_state: "ACTIVE" }),
      buildRule({ stable_id: "REG-C", lifecycle_state: "SEED_UNVERIFIED" }),
      buildRule({ stable_id: "REG-D", lifecycle_state: "SEED_UNVERIFIED" }),
      buildRule({ stable_id: "REG-E", lifecycle_state: "SEED_UNVERIFIED" }),
      buildRule({ stable_id: "REG-F", lifecycle_state: "PLACEHOLDER" }),
      buildRule({ stable_id: "REG-G", lifecycle_state: "DRAFT" }),
      buildRule({ stable_id: "REG-H", lifecycle_state: "ARCHIVED" }),
    ];
    const results: EvaluationResult[] = rules.map((r) =>
      buildResult(r, "APPLICABLE"),
    );

    const timeline = buildTimeline({
      config: baseVehicleConfig,
      results,
      rules,
      now,
    });
    const summary = buildExecutiveSummary({
      config: baseVehicleConfig,
      results,
      rules,
      timeline,
      now,
    });

    expect(summary.registry_totals).toEqual({
      active: 2,
      seed_unverified: 3,
      draft: 1,
      placeholder: 1,
      archived: 1,
      total: 8,
    });
  });
});
