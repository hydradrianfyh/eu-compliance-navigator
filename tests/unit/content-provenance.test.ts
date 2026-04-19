/**
 * Sprint 3 regression: content_provenance + related_rules +
 * prerequisite_standards schema fields on Rule.
 *
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import { ruleSchema } from "@/registry/schema";

const MINIMAL_RULE = {
  stable_id: "REG-TEST-001",
  title: "Test rule",
  short_label: "TEST-001",
  legal_family: "vehicle_approval" as const,
  jurisdiction: "EU",
  jurisdiction_level: "EU" as const,
  framework_group: ["MN" as const],
  sources: [
    {
      label: "Test",
      source_family: "EUR-Lex" as const,
      reference: "Test ref",
      official_url: null,
      oj_reference: null,
      last_verified_on: null,
    },
  ],
  lifecycle_state: "ACTIVE" as const,
  vehicle_scope: "MN",
  applicability_summary: "Test",
  exclusions: [],
  trigger_logic: {
    mode: "declarative" as const,
    match_mode: "all" as const,
    conditions: [],
    fallback_if_missing: "unknown" as const,
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
  output_kind: "obligation" as const,
  obligation_text: "Test",
  evidence_tasks: [],
  owner_hint: "homologation" as const,
  manual_review_required: false,
  manual_review_reason: null,
  notes: null,
  ui_package: "horizontal" as const,
  process_stage: "type_approval" as const,
};

describe("Rule schema · Sprint 3 new optional fields", () => {
  it("accepts a rule without any of the new fields (backward compat)", () => {
    const parsed = ruleSchema.parse(MINIMAL_RULE);
    expect(parsed.content_provenance).toBeUndefined();
    expect(parsed.related_rules).toBeUndefined();
    expect(parsed.prerequisite_standards).toBeUndefined();
  });

  it("accepts content_provenance with all 5 fields", () => {
    const parsed = ruleSchema.parse({
      ...MINIMAL_RULE,
      content_provenance: {
        source_type: "eur_lex",
        retrieved_at: "2026-04-18",
        human_reviewer: "yanhao",
        source_query: "CELEX:32018R0858",
        source_hash: "sha256:abc123",
      },
    });
    expect(parsed.content_provenance?.source_type).toBe("eur_lex");
    expect(parsed.content_provenance?.human_reviewer).toBe("yanhao");
  });

  it("accepts all 5 source_type values", () => {
    const types = [
      "manual",
      "eur_lex",
      "unece",
      "national_gazette",
      "llm_draft",
    ] as const;
    for (const t of types) {
      const parsed = ruleSchema.parse({
        ...MINIMAL_RULE,
        content_provenance: { source_type: t },
      });
      expect(parsed.content_provenance?.source_type).toBe(t);
    }
  });

  it("rejects invalid source_type", () => {
    expect(() =>
      ruleSchema.parse({
        ...MINIMAL_RULE,
        content_provenance: { source_type: "invalid" },
      }),
    ).toThrow();
  });

  it("accepts related_rules with all 4 relation kinds", () => {
    const relations = [
      "requires",
      "supersedes",
      "complements",
      "conflicts",
    ] as const;
    for (const rel of relations) {
      const parsed = ruleSchema.parse({
        ...MINIMAL_RULE,
        related_rules: [{ rule_id: "REG-X-1", relation: rel }],
      });
      expect(parsed.related_rules?.[0].relation).toBe(rel);
    }
  });

  it("accepts prerequisite_standards as string array", () => {
    const parsed = ruleSchema.parse({
      ...MINIMAL_RULE,
      prerequisite_standards: ["ISO 26262", "ISO/SAE 21434"],
    });
    expect(parsed.prerequisite_standards).toEqual([
      "ISO 26262",
      "ISO/SAE 21434",
    ]);
  });
});
