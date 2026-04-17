import { describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import type { VehicleConfig } from "@/config/schema";
import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { buildTimeline } from "@/engine/timeline";
import type { EvaluationResult } from "@/engine/types";
import { allSeedRules } from "@/registry/seed";
import type { Rule } from "@/registry/schema";
import { pilotMY2027BEV } from "../../fixtures/pilot-my2027-bev";

function buildRule(overrides: Partial<Rule> = {}): Rule {
  return {
    stable_id: "REG-TL-001",
    title: "Timeline test rule",
    short_label: "TL-001",
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

const baseVehicleConfig: VehicleConfig = {
  ...defaultVehicleConfig,
  projectName: "Timeline Test",
  sopDate: "2027-01-15",
  firstRegistrationDate: "2027-04-01",
  approvalType: "new_type",
};

const now = new Date("2026-04-16T00:00:00Z");

describe("buildTimeline", () => {
  it("returns empty milestones and empty unscheduled when results are empty", () => {
    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [],
      rules: [],
      now,
    });

    expect(output.milestones).toEqual([]);
    expect(output.unscheduled).toEqual([]);
    expect(output.sop_month).toBe("2027-01");
    expect(output.first_registration_month).toBe("2027-04");
    expect(output.range_start <= output.range_end).toBe(true);
  });

  it("places a rule with applies_to_new_types_from into deadline_rules when approvalType=new_type", () => {
    const rule = buildRule({
      stable_id: "REG-TL-DEADLINE",
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

    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    const julyMilestone = output.milestones.find((m) => m.month === "2027-07");
    expect(julyMilestone).toBeDefined();
    expect(julyMilestone!.deadline_rules.map((d) => d.stable_id)).toContain(
      "REG-TL-DEADLINE",
    );
    expect(julyMilestone!.monthLabel).toBe("Jul 2027");
    const deadlineItem = julyMilestone!.deadline_rules[0];
    expect(deadlineItem.reason).toBe("applies_to_new_types_from");
    expect(deadlineItem.owner_hint).toBe(rule.owner_hint);
  });

  it("places evidence_due 12 months before the deadline when planning_lead_time_months=12", () => {
    const rule = buildRule({
      stable_id: "REG-TL-LEAD",
      planning_lead_time_months: 12,
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2027-01-15",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });
    const result = buildResult(rule, "APPLICABLE");

    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    const evidenceMilestone = output.milestones.find(
      (m) => m.month === "2026-01",
    );
    expect(evidenceMilestone).toBeDefined();
    expect(evidenceMilestone!.evidence_due.map((d) => d.stable_id)).toContain(
      "REG-TL-LEAD",
    );
    expect(evidenceMilestone!.evidence_due[0].reason).toBe(
      "evidence_lead_time:12m",
    );
  });

  it("uses the default 6-month lead time when planning_lead_time_months is null", () => {
    const rule = buildRule({
      stable_id: "REG-TL-DEFAULT-LEAD",
      planning_lead_time_months: null,
      temporal: {
        entry_into_force: null,
        applies_to_new_types_from: "2027-08-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
    });
    const result = buildResult(rule, "APPLICABLE");

    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    const evidenceMilestone = output.milestones.find(
      (m) => m.month === "2027-02",
    );
    expect(evidenceMilestone).toBeDefined();
    expect(
      evidenceMilestone!.evidence_due.map((d) => d.stable_id),
    ).toContain("REG-TL-DEFAULT-LEAD");
    expect(evidenceMilestone!.evidence_due[0].reason).toContain(
      "evidence_lead_time_default",
    );
  });

  it("puts APPLICABLE rules with no temporal date into unscheduled", () => {
    const rule = buildRule({ stable_id: "REG-TL-NODATE" });
    const result = buildResult(rule, "APPLICABLE");

    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    expect(output.unscheduled.map((u) => u.stable_id)).toContain(
      "REG-TL-NODATE",
    );
    expect(output.milestones).toEqual([]);
  });

  it("ignores NOT_APPLICABLE and UNKNOWN rules entirely", () => {
    const applicableRule = buildRule({
      stable_id: "REG-TL-IN",
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
    const notApplicableRule = buildRule({ stable_id: "REG-TL-NA" });
    const unknownRule = buildRule({ stable_id: "REG-TL-UK" });

    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [
        buildResult(applicableRule, "APPLICABLE"),
        buildResult(notApplicableRule, "NOT_APPLICABLE"),
        buildResult(unknownRule, "UNKNOWN"),
      ],
      rules: [applicableRule, notApplicableRule, unknownRule],
      now,
    });

    const allScheduledIds = new Set<string>();
    for (const m of output.milestones) {
      for (const item of [
        ...m.deadline_rules,
        ...m.evidence_due,
        ...m.review_due,
      ]) {
        allScheduledIds.add(item.stable_id);
      }
    }
    const unscheduledIds = new Set(output.unscheduled.map((u) => u.stable_id));

    expect(allScheduledIds.has("REG-TL-IN")).toBe(true);
    expect(allScheduledIds.has("REG-TL-NA")).toBe(false);
    expect(allScheduledIds.has("REG-TL-UK")).toBe(false);
    expect(unscheduledIds.has("REG-TL-NA")).toBe(false);
    expect(unscheduledIds.has("REG-TL-UK")).toBe(false);
  });

  it("adds a review_due entry when freshness review falls within range", () => {
    // cadence 180d, 80% = 144d. Reviewed on 2026-02-01 → due around 2026-06-25.
    const rule = buildRule({
      stable_id: "REG-TL-REVIEW",
      lifecycle_state: "ACTIVE",
      last_human_review_at: "2026-02-01",
      review_cadence_days: 180,
    });
    const result = buildResult(rule, "APPLICABLE");

    const output = buildTimeline({
      config: baseVehicleConfig,
      results: [result],
      rules: [rule],
      now,
    });

    const reviewMilestone = output.milestones.find(
      (m) => m.month === "2026-06",
    );
    expect(reviewMilestone).toBeDefined();
    expect(reviewMilestone!.review_due.map((d) => d.stable_id)).toContain(
      "REG-TL-REVIEW",
    );
  });

  it("builds a non-trivial timeline from the pilot fixture end-to-end", () => {
    const engineConfig = buildEngineConfig(pilotMY2027BEV);
    const results = evaluateAllRules(allSeedRules, engineConfig);

    const output = buildTimeline({
      config: pilotMY2027BEV,
      results,
      rules: allSeedRules,
      now,
    });

    expect(output.sop_month).toBe("2027-01");
    expect(output.first_registration_month).toBe("2027-04");

    const rangeStartDate = new Date(`${output.range_start}-01T00:00:00Z`);
    const rangeEndDate = new Date(`${output.range_end}-01T00:00:00Z`);
    const months =
      (rangeEndDate.getUTCFullYear() - rangeStartDate.getUTCFullYear()) * 12 +
      (rangeEndDate.getUTCMonth() - rangeStartDate.getUTCMonth());
    expect(months).toBeGreaterThanOrEqual(12);

    const totalDeadlineEntries = output.milestones.reduce(
      (sum, m) => sum + m.deadline_rules.length,
      0,
    );
    expect(totalDeadlineEntries).toBeGreaterThan(0);
    expect(output.milestones.length).toBeGreaterThan(0);
    expect(Array.isArray(output.unscheduled)).toBe(true);

    for (const milestone of output.milestones) {
      expect(milestone.month).toMatch(/^\d{4}-\d{2}$/);
      expect(milestone.month >= output.range_start).toBe(true);
      expect(milestone.month <= output.range_end).toBe(true);
    }
  });
});
