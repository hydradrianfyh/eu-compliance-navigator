import { describe, expect, it } from "vitest";

import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateRule } from "@/engine/evaluator";
import { defaultVehicleConfig } from "@/config/defaults";
import type { Rule } from "@/registry/schema";

const baseRule: Rule = {
  stable_id: "REG-TEST-001",
  title: "Test rule",
  short_label: "Test",
  legal_family: "cybersecurity",
  jurisdiction: "UNECE",
  jurisdiction_level: "UNECE",
  framework_group: ["MN"],
  sources: [
    {
      label: "Test source",
      source_family: "UNECE",
      reference: "UNECE Regulation No. 999",
      official_url: null,
      oj_reference: null,
      last_verified_on: null,
    },
  ],
  lifecycle_state: "SEED_UNVERIFIED",
  vehicle_scope: "Test scope",
  applicability_summary: "Test summary",
  exclusions: [],
  trigger_logic: {
    mode: "declarative",
    match_mode: "all",
    conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }],
    fallback_if_missing: "unknown",
  },
  temporal: {
    entry_into_force: null,
    applies_to_new_types_from: null,
    applies_to_all_new_vehicles_from: null,
    applies_to_first_registration_from: null,
    applies_from_generic: "2020-01-01",
    effective_to: null,
    small_volume_derogation_until: null,
    notes: null,
  },
  planning_lead_time_months: null,
  output_kind: "obligation",
  obligation_text: "Test obligation",
  evidence_tasks: [],
  owner_hint: "cybersecurity",
  manual_review_required: true,
  manual_review_reason: "Verification pending",
  notes: null,
  ui_package: "horizontal",
  process_stage: "type_approval",
};

describe("evaluateRule", () => {
  it("downgrades a matching non-ACTIVE rule so it never returns APPLICABLE", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      sopDate: "2026-01-01",
    });

    const result = evaluateRule(baseRule, config);

    expect(result.applicability).toBe("CONDITIONAL");
    expect(result.was_downgraded_from_applicable).toBe(true);
    expect(result.explanation).toContain("Rule source not yet verified");
    expect(result.matched_conditions.length).toBeGreaterThan(0);
    expect(result.unmatched_conditions).toEqual([]);
    expect(result.trigger_path).toBe("declarative");
  });

  it("forces PLACEHOLDER rules to UNKNOWN", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      sopDate: "2026-01-01",
    });

    const result = evaluateRule(
      {
        ...baseRule,
        stable_id: "REG-TEST-002",
        lifecycle_state: "PLACEHOLDER",
        obligation_text: "PLACEHOLDER - pending authoring",
      },
      config,
    );

    expect(result.applicability).toBe("UNKNOWN");
    expect(result.explanation).toContain("PLACEHOLDER");
    expect(result.was_downgraded_from_applicable).toBe(false);
  });

  it("reports missing inputs when trigger fields are absent", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: null,
      sopDate: "2026-01-01",
    });

    const result = evaluateRule(baseRule, config);

    expect(result.applicability).toBe("UNKNOWN");
    expect(result.missing_inputs).toContain("frameworkGroup");
    expect(result.explanation).toContain("missing input");
  });

  it("treats rules past effective_to as not applicable", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      sopDate: "2026-01-01",
    });

    const result = evaluateRule(
      {
        ...baseRule,
        stable_id: "REG-TEST-003",
        lifecycle_state: "ACTIVE",
        sources: [
          {
            ...baseRule.sources[0],
            official_url: "https://official.example.test/rule",
            oj_reference: "OJ TEST",
            last_verified_on: "2026-04-14",
          },
        ],
        temporal: {
          ...baseRule.temporal,
          effective_to: "2024-12-31",
        },
      },
      config,
    );

    expect(result.applicability).toBe("NOT_APPLICABLE");
    expect(result.explanation).toContain("expired");
  });
});
