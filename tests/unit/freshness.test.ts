import { describe, expect, it } from "vitest";

import type { Rule } from "@/registry/schema";
import {
  computeFreshnessStatus,
  defaultCadenceDays,
  summarizeFreshness,
  withFreshness,
} from "@/registry/freshness";

function buildRule(overrides: Partial<Rule> = {}): Rule {
  return {
    stable_id: "REG-TEST-FR-001",
    title: "Freshness test rule",
    short_label: "Test",
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

describe("freshness", () => {
  const today = new Date("2026-04-16T00:00:00Z");

  describe("defaultCadenceDays", () => {
    it("gives ACTIVE rules a 180-day cadence", () => {
      expect(defaultCadenceDays("ACTIVE")).toBe(180);
    });

    it("gives non-ACTIVE rules a 365-day cadence", () => {
      expect(defaultCadenceDays("SEED_UNVERIFIED")).toBe(365);
      expect(defaultCadenceDays("PLACEHOLDER")).toBe(365);
    });
  });

  describe("computeFreshnessStatus", () => {
    it("returns never_verified when last_human_review_at is missing", () => {
      const rule = buildRule();
      expect(computeFreshnessStatus(rule, today)).toBe("never_verified");
    });

    it("returns fresh when within 80% of cadence", () => {
      const rule = buildRule({
        last_human_review_at: "2026-03-01",
        review_cadence_days: 180,
      });
      expect(computeFreshnessStatus(rule, today)).toBe("fresh");
    });

    it("returns due_soon when between 80% and 100% of cadence", () => {
      const rule = buildRule({
        last_human_review_at: "2025-10-30",
        review_cadence_days: 180,
      });
      expect(computeFreshnessStatus(rule, today)).toBe("due_soon");
    });

    it("returns overdue when cadence exceeded by up to 50%", () => {
      const rule = buildRule({
        last_human_review_at: "2025-09-01",
        review_cadence_days: 180,
      });
      expect(computeFreshnessStatus(rule, today)).toBe("overdue");
    });

    it("returns critically_overdue beyond 150% of cadence", () => {
      const rule = buildRule({
        last_human_review_at: "2025-01-01",
        review_cadence_days: 180,
      });
      expect(computeFreshnessStatus(rule, today)).toBe("critically_overdue");
    });

    it("uses default cadence when review_cadence_days is missing", () => {
      const rule = buildRule({
        lifecycle_state: "ACTIVE",
        last_human_review_at: "2026-03-01",
      });
      expect(computeFreshnessStatus(rule, today)).toBe("fresh");
    });
  });

  describe("summarizeFreshness", () => {
    it("bucketises a list of rules by freshness", () => {
      const rules = [
        buildRule({ last_human_review_at: "2026-04-01" }),
        buildRule({ last_human_review_at: "2025-11-01" }),
        buildRule(),
        buildRule({ last_human_review_at: "2024-01-01" }),
      ];
      const summary = summarizeFreshness(rules, today);

      expect(summary.total).toBe(4);
      expect(summary.fresh).toBe(1);
      expect(summary.due_soon).toBe(1);
      expect(summary.never_verified).toBe(1);
      expect(summary.critically_overdue).toBe(1);
    });
  });

  describe("withFreshness", () => {
    it("annotates a rule without mutating the input", () => {
      const rule = buildRule({ last_human_review_at: "2026-04-01" });
      const annotated = withFreshness(rule, today);

      expect(annotated).not.toBe(rule);
      expect(annotated.freshness_status).toBe("fresh");
      expect(rule.freshness_status).toBeUndefined();
    });
  });
});
