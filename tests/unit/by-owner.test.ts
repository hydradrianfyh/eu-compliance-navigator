import { describe, expect, it } from "vitest";

import { buildEngineConfig } from "@/engine/config-builder";
import { buildOwnerDashboard } from "@/engine/by-owner";
import { evaluateAllRules } from "@/engine/evaluator";
import type { EvaluationResult } from "@/engine/types";
import type { Rule } from "@/registry/schema";
import { allSeedRules } from "@/registry/seed";
import { pilotMY2027BEV } from "../../fixtures/pilot-my2027-bev";

function buildRule(overrides: Partial<Rule> = {}): Rule {
  return {
    stable_id: "REG-OWN-001",
    title: "Owner dashboard test rule",
    short_label: "OWN-001",
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
  overrides: Partial<EvaluationResult> = {},
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
    ...overrides,
  };
}

describe("buildOwnerDashboard", () => {
  it("returns empty buckets when there are no results", () => {
    const dashboard = buildOwnerDashboard({ results: [], rules: [] });
    expect(dashboard.buckets).toEqual([]);
    expect(dashboard.total_owners).toBe(0);
    expect(dashboard.total_applicable).toBe(0);
  });

  it("ignores NOT_APPLICABLE rules entirely", () => {
    const naRule = buildRule({ stable_id: "REG-OWN-NA", owner_hint: "legal" });
    const applicableRule = buildRule({
      stable_id: "REG-OWN-OK",
      owner_hint: "homologation",
    });
    const dashboard = buildOwnerDashboard({
      results: [
        buildResult(naRule, "NOT_APPLICABLE"),
        buildResult(applicableRule, "APPLICABLE"),
      ],
      rules: [naRule, applicableRule],
    });

    expect(dashboard.buckets).toHaveLength(1);
    expect(dashboard.buckets[0].owner_hint).toBe("homologation");
    expect(dashboard.total_applicable).toBe(1);
  });

  it("derives owner_label by splitting underscores and capitalizing each word", () => {
    const homologationRule = buildRule({
      stable_id: "REG-H-01",
      owner_hint: "homologation",
    });
    const privacyRule = buildRule({
      stable_id: "REG-P-01",
      owner_hint: "privacy_data_protection",
    });
    const dashboard = buildOwnerDashboard({
      results: [
        buildResult(homologationRule, "APPLICABLE"),
        buildResult(privacyRule, "APPLICABLE"),
      ],
      rules: [homologationRule, privacyRule],
    });

    const byHint = new Map(
      dashboard.buckets.map((b) => [b.owner_hint, b.owner_label]),
    );
    expect(byHint.get("homologation")).toBe("Homologation");
    expect(byHint.get("privacy_data_protection")).toBe(
      "Privacy Data Protection",
    );
  });

  it("sorts items inside a bucket by planning_lead_time_months DESC then title ASC", () => {
    const ruleA = buildRule({
      stable_id: "REG-A",
      title: "Alpha",
      owner_hint: "homologation",
      planning_lead_time_months: 6,
    });
    const ruleB = buildRule({
      stable_id: "REG-B",
      title: "Bravo",
      owner_hint: "homologation",
      planning_lead_time_months: 24,
    });
    const ruleC = buildRule({
      stable_id: "REG-C",
      title: "Charlie",
      owner_hint: "homologation",
      planning_lead_time_months: null,
    });
    const ruleD = buildRule({
      stable_id: "REG-D",
      title: "Alpha Two",
      owner_hint: "homologation",
      planning_lead_time_months: 6,
    });

    const dashboard = buildOwnerDashboard({
      results: [
        buildResult(ruleA, "APPLICABLE"),
        buildResult(ruleB, "APPLICABLE"),
        buildResult(ruleC, "APPLICABLE"),
        buildResult(ruleD, "APPLICABLE"),
      ],
      rules: [ruleA, ruleB, ruleC, ruleD],
    });

    expect(dashboard.buckets).toHaveLength(1);
    const ids = dashboard.buckets[0].items.map((item) => item.stable_id);
    // Bravo (24) → Alpha (6, "Alpha") → Alpha Two (6, "Alpha Two") → Charlie (null=0)
    expect(ids).toEqual(["REG-B", "REG-A", "REG-D", "REG-C"]);
  });

  it("counts blocked items as APPLICABLE + third_party_verification_required + no required_documents", () => {
    const blockedRule = buildRule({
      stable_id: "REG-BLOCKED",
      owner_hint: "homologation",
      third_party_verification_required: true,
      required_documents: [],
    });
    const notBlockedBecauseDocsRule = buildRule({
      stable_id: "REG-HAS-DOCS",
      owner_hint: "homologation",
      third_party_verification_required: true,
      required_documents: ["Doc A"],
    });
    const notBlockedBecauseNoVerifRule = buildRule({
      stable_id: "REG-NO-VERIF",
      owner_hint: "homologation",
      third_party_verification_required: false,
    });
    const notBlockedBecauseConditionalRule = buildRule({
      stable_id: "REG-COND",
      owner_hint: "homologation",
      third_party_verification_required: true,
      required_documents: [],
    });

    const dashboard = buildOwnerDashboard({
      results: [
        buildResult(blockedRule, "APPLICABLE"),
        buildResult(notBlockedBecauseDocsRule, "APPLICABLE"),
        buildResult(notBlockedBecauseNoVerifRule, "APPLICABLE"),
        buildResult(notBlockedBecauseConditionalRule, "CONDITIONAL"),
      ],
      rules: [
        blockedRule,
        notBlockedBecauseDocsRule,
        notBlockedBecauseNoVerifRule,
        notBlockedBecauseConditionalRule,
      ],
    });

    const bucket = dashboard.buckets.find(
      (b) => b.owner_hint === "homologation",
    );
    expect(bucket).toBeDefined();
    expect(bucket!.blocked_count).toBe(1);
    expect(bucket!.applicable_count).toBe(3);
    expect(bucket!.conditional_count).toBe(1);
  });

  it("sorts buckets by applicable_count DESC", () => {
    const h1 = buildRule({ stable_id: "H1", owner_hint: "homologation" });
    const h2 = buildRule({ stable_id: "H2", owner_hint: "homologation" });
    const c1 = buildRule({ stable_id: "C1", owner_hint: "cybersecurity" });

    const dashboard = buildOwnerDashboard({
      results: [
        buildResult(h1, "APPLICABLE"),
        buildResult(h2, "APPLICABLE"),
        buildResult(c1, "APPLICABLE"),
      ],
      rules: [h1, h2, c1],
    });

    expect(dashboard.buckets.map((b) => b.owner_hint)).toEqual([
      "homologation",
      "cybersecurity",
    ]);
  });

  it("builds a non-trivial dashboard from the pilot fixture end-to-end", () => {
    const engineConfig = buildEngineConfig(pilotMY2027BEV);
    const results = evaluateAllRules(allSeedRules, engineConfig);

    const dashboard = buildOwnerDashboard({
      results,
      rules: allSeedRules,
    });

    expect(dashboard.buckets.length).toBeGreaterThan(0);
    expect(dashboard.total_owners).toBe(dashboard.buckets.length);
    expect(dashboard.total_applicable).toBeGreaterThanOrEqual(11);

    const ownerHints = new Set(dashboard.buckets.map((b) => b.owner_hint));
    expect(ownerHints.has("homologation")).toBe(true);
    expect(ownerHints.has("cybersecurity")).toBe(true);

    const homologation = dashboard.buckets.find(
      (b) => b.owner_hint === "homologation",
    );
    expect(homologation).toBeDefined();
    expect(homologation!.items.map((i) => i.stable_id)).toContain("REG-TA-001");

    const cybersecurity = dashboard.buckets.find(
      (b) => b.owner_hint === "cybersecurity",
    );
    expect(cybersecurity).toBeDefined();
    expect(cybersecurity!.items.map((i) => i.stable_id)).toContain("REG-CS-001");

    // Items within each bucket must be sorted by lead time DESC then title ASC.
    for (const bucket of dashboard.buckets) {
      for (let i = 1; i < bucket.items.length; i += 1) {
        const prev = bucket.items[i - 1];
        const curr = bucket.items[i];
        const prevLead = prev.planning_lead_time_months ?? 0;
        const currLead = curr.planning_lead_time_months ?? 0;
        expect(prevLead).toBeGreaterThanOrEqual(currLead);
        if (prevLead === currLead) {
          expect(prev.title <= curr.title).toBe(true);
        }
      }
    }

    // Buckets must be sorted by applicable_count DESC.
    for (let i = 1; i < dashboard.buckets.length; i += 1) {
      expect(dashboard.buckets[i - 1].applicable_count).toBeGreaterThanOrEqual(
        dashboard.buckets[i].applicable_count,
      );
    }
  });
});
