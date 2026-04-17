import { describe, expect, it } from "vitest";

import { RuleRegistry } from "@/registry/registry";
import { rawSeedRules } from "@/registry/seed";
import { sourceVerificationQueue } from "@/registry/verification-queue";
import {
  assessRulePromotability,
  buildDefaultReviewEntry,
  deriveWorkflowStatus,
  getMissingSourceFields,
  mergeReviewEntryIntoRule,
  tryPromoteReviewedRule,
  validateSourceCompleteness,
} from "@/registry/verification";

describe("source verification workflow", () => {
  it("builds a machine-readable queue for all downgraded prose-ACTIVE rules", () => {
    // Queue size shrinks as URL verification batches complete. After Phase 11B.2
    // batch 2, remaining prose-ACTIVE-but-unverified rules: REG-TA-002, REG-AD-001,
    // REG-AD-002, REG-DA-001 (all still use makeSource and require URL verification).
    expect(sourceVerificationQueue.length).toBe(4);
    expect(
      sourceVerificationQueue.every(
        (item) => item.current_lifecycle_state === "SEED_UNVERIFIED",
      ),
    ).toBe(true);
    expect(
      sourceVerificationQueue.every((item) =>
        item.missing_source_fields.includes("official_url"),
      ),
    ).toBe(true);
    expect(
      sourceVerificationQueue.every((item) =>
        item.missing_source_fields.includes("last_verified_on"),
      ),
    ).toBe(true);
  });

  it("reports source completeness gaps for downgraded rules", () => {
    const report = validateSourceCompleteness(rawSeedRules);

    expect(report.queue_size).toBe(4);
    expect(report.incomplete_rules.length).toBe(4);
    expect(report.incomplete_rules[0]?.stable_id).toBeDefined();
  });

  it("confirms verified rules are promotable and unverified are blocked", () => {
    const verifiedRule = rawSeedRules.find((rule) => rule.stable_id === "REG-TA-001");
    expect(verifiedRule).toBeDefined();
    expect(assessRulePromotability(verifiedRule!).promotable).toBe(true);

    const unverifiedRule = rawSeedRules.find((rule) => rule.stable_id === "REG-AD-001");
    expect(unverifiedRule).toBeDefined();
    expect(assessRulePromotability(unverifiedRule!).promotable).toBe(false);
    expect(assessRulePromotability(unverifiedRule!).missing_source_fields).toContain("official_url");
  });

  it("identifies missing source fields respecting source-family semantics", () => {
    const uneceUnverified = rawSeedRules.find((rule) => rule.stable_id === "REG-AD-001");
    expect(uneceUnverified).toBeDefined();
    expect(uneceUnverified!.sources[0].source_family).toBe("UNECE");
    expect(getMissingSourceFields(uneceUnverified!)).not.toContain("oj_reference");
    expect(getMissingSourceFields(uneceUnverified!)).toContain("official_url");

    // REG-EM-001 was promoted in Phase 11B.2 batch 2. Use REG-DA-001 (Data Act)
    // which still uses makeSource and remains SEED_UNVERIFIED after governance.
    const eurLexUnverified = rawSeedRules.find((rule) => rule.stable_id === "REG-DA-001");
    expect(eurLexUnverified).toBeDefined();
    expect(eurLexUnverified!.sources[0].source_family).toBe("EUR-Lex");
    expect(getMissingSourceFields(eurLexUnverified!)).toContain("official_url");
    expect(getMissingSourceFields(eurLexUnverified!)).toContain("last_verified_on");
  });

  it("exposes verification queue and promotability through the registry", () => {
    const registry = new RuleRegistry(rawSeedRules);

    expect(registry.getVerificationQueue().length).toBe(4);
    expect(registry.getPromotabilityAssessment("REG-AD-002")?.promotable).toBe(false);
  });

  it("rejects unsafe promotion attempts through the registry gate", () => {
    const registry = new RuleRegistry(rawSeedRules);

    expect(() => registry.promoteRuleToActive("REG-AD-001", "reviewer")).toThrow(
      /not promotable to ACTIVE/i,
    );
  });

  it("derives blocked / partial / promotable / promoted workflow buckets", () => {
    const rule = rawSeedRules.find((item) => item.stable_id === "REG-AD-001")!;
    const blocked = buildDefaultReviewEntry(rule);
    const partial = {
      ...blocked,
      official_url: "https://example.test",
    };
    const promotable = {
      ...blocked,
      official_url: "https://example.test",
      oj_reference: "OJ TEST",
      last_verified_on: "2026-04-14",
    };

    expect(
      deriveWorkflowStatus(assessRulePromotability(mergeReviewEntryIntoRule(rule, blocked)), blocked),
    ).toBe("blocked");
    expect(
      deriveWorkflowStatus(assessRulePromotability(mergeReviewEntryIntoRule(rule, partial)), partial),
    ).toBe("partially_verified");
    expect(
      deriveWorkflowStatus(
        assessRulePromotability(mergeReviewEntryIntoRule(rule, promotable)),
        promotable,
      ),
    ).toBe("promotable");
    expect(
      deriveWorkflowStatus(
        assessRulePromotability(
          mergeReviewEntryIntoRule(rule, {
            ...promotable,
            reviewer_identity: "reviewer@example.com",
            reviewer_decision: "promote_now",
          }),
        ),
        {
          ...promotable,
          reviewer_identity: "reviewer@example.com",
          reviewer_decision: "promote_now",
        },
      ),
    ).toBe("promoted");
  });

  it("only promotes when review state and governance gates both pass", () => {
    const rule = rawSeedRules.find((item) => item.stable_id === "REG-TA-001")!;
    const reviewEntry = {
      ...buildDefaultReviewEntry(rule),
      official_url: "https://example.test",
      oj_reference: "OJ TEST",
      last_verified_on: "2026-04-14",
      reviewer_identity: "reviewer@example.com",
      reviewer_decision: "promote_now" as const,
      workflow_status: "promotable" as const,
    };

    const { promotedRule, assessment } = tryPromoteReviewedRule(rule, reviewEntry);

    expect(assessment.promotable).toBe(true);
    expect(promotedRule?.lifecycle_state).toBe("ACTIVE");
  });

  it("returns a rebuilt registry instead of mutating the existing one during promotion", () => {
    const promotableRule = {
      ...rawSeedRules[0],
      stable_id: "REG-TEST-PROMOTABLE",
      lifecycle_state: "SEED_UNVERIFIED" as const,
      sources: [
        {
          ...rawSeedRules[0].sources[0],
          official_url: "https://official.example.test/rule",
          oj_reference: "OJ TEST 1",
          last_verified_on: "2026-04-14",
        },
      ],
    };

    const registry = new RuleRegistry([promotableRule]);
    const nextRegistry = registry.promoteRuleToActive(
      "REG-TEST-PROMOTABLE",
      "reviewer",
    );

    expect(registry.getRuleById("REG-TEST-PROMOTABLE")?.lifecycle_state).toBe(
      "SEED_UNVERIFIED",
    );
    expect(nextRegistry.getRuleById("REG-TEST-PROMOTABLE")?.lifecycle_state).toBe(
      "ACTIVE",
    );
    expect(nextRegistry).not.toBe(registry);
  });
});
