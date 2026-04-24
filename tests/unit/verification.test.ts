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

// Phase M.0.1 (audit 2026-04-23) closed the prose-ACTIVE-but-runtime-downgraded
// gap by authoring real source gates on REG-TA-002, REG-AD-001, REG-AD-002, and
// REG-DA-001. The "silent runtime downgrade" class is now empty. Tests below use
// genuine SEED_UNVERIFIED rules (REG-MS-001 Market Surveillance Regulation as the
// canonical unverified EUR-Lex fixture — REG-BAT-002 REACH was promoted in Phase
// M.2.B) and a synthetic UNECE rule to test source-family semantics without
// depending on seed-data drift.
const UNVERIFIED_EUR_LEX_ID = "REG-MS-001"; // MSR 2019/1020 — SEED with makeSource fallback (null URL/OJ/date)

function syntheticUneceUnverifiedRule(): import("@/registry/schema").Rule {
  const seed = rawSeedRules.find((rule) => rule.stable_id === "REG-UN-007");
  if (!seed) throw new Error("REG-UN-007 missing from seed; update fixture");
  return {
    ...seed,
    stable_id: "REG-TEST-UNECE-NULL-URL",
    sources: [
      {
        ...seed.sources[0],
        official_url: null,
        oj_reference: null,
        last_verified_on: null,
      },
    ],
  };
}

describe("source verification workflow", () => {
  it("keeps the prose-ACTIVE downgrade queue empty after Phase M.0.1", () => {
    // Pre-Phase-M.0.1, this queue held 4 rules where prose said ACTIVE but runtime
    // governance silently downgraded them to SEED_UNVERIFIED (REG-TA-002 / REG-AD-001
    // / REG-AD-002 / REG-DA-001). Phase M.0.1 authored real source gates on all four.
    // The queue staying at length === 0 is now a regression invariant: any new rule
    // authored as prose-ACTIVE with missing source fields must be caught during review,
    // not silently demoted at runtime.
    expect(sourceVerificationQueue.length).toBe(0);
  });

  it("reports zero source-completeness gaps among ACTIVE rules post-M.0.1", () => {
    const report = validateSourceCompleteness(rawSeedRules);

    expect(report.queue_size).toBe(0);
    expect(report.incomplete_rules).toEqual([]);
  });

  it("confirms verified rules are promotable and SEED_UNVERIFIED rules are blocked", () => {
    const verifiedRule = rawSeedRules.find((rule) => rule.stable_id === "REG-TA-001");
    expect(verifiedRule).toBeDefined();
    expect(assessRulePromotability(verifiedRule!).promotable).toBe(true);

    const unverifiedRule = rawSeedRules.find(
      (rule) => rule.stable_id === UNVERIFIED_EUR_LEX_ID,
    );
    expect(unverifiedRule).toBeDefined();
    expect(unverifiedRule!.lifecycle_state).toBe("SEED_UNVERIFIED");
    expect(assessRulePromotability(unverifiedRule!).promotable).toBe(false);
    expect(assessRulePromotability(unverifiedRule!).missing_source_fields).toContain(
      "official_url",
    );
  });

  it("identifies missing source fields respecting source-family semantics", () => {
    // UNECE semantics: no oj_reference required. Synthetic rule because no production
    // UNECE rule has null URL after the Phase L UNECE_PRIMARY_PORTAL backfill.
    const uneceUnverified = syntheticUneceUnverifiedRule();
    expect(uneceUnverified.sources[0].source_family).toBe("UNECE");
    expect(getMissingSourceFields(uneceUnverified)).not.toContain("oj_reference");
    expect(getMissingSourceFields(uneceUnverified)).toContain("official_url");

    // EUR-Lex semantics: oj_reference required. REG-MS-001 Market Surveillance
    // Regulation uses makeSource fallback so all three gates are null, making it a
    // canonical fixture for the "EUR-Lex missing URL + OJ + date" scenario.
    const eurLexUnverified = rawSeedRules.find(
      (rule) => rule.stable_id === UNVERIFIED_EUR_LEX_ID,
    );
    expect(eurLexUnverified).toBeDefined();
    expect(eurLexUnverified!.sources[0].source_family).toBe("EUR-Lex");
    expect(getMissingSourceFields(eurLexUnverified!)).toContain("official_url");
    expect(getMissingSourceFields(eurLexUnverified!)).toContain("last_verified_on");
  });

  it("exposes verification queue and promotability through the registry", () => {
    const registry = new RuleRegistry(rawSeedRules);

    expect(registry.getVerificationQueue().length).toBe(0);
    expect(
      registry.getPromotabilityAssessment(UNVERIFIED_EUR_LEX_ID)?.promotable,
    ).toBe(false);
  });

  it("rejects unsafe promotion attempts through the registry gate", () => {
    const registry = new RuleRegistry(rawSeedRules);

    expect(() =>
      registry.promoteRuleToActive(UNVERIFIED_EUR_LEX_ID, "reviewer"),
    ).toThrow(/not promotable to ACTIVE/i);
  });

  it("derives blocked / partial / promotable / promoted workflow buckets", () => {
    const rule = rawSeedRules.find(
      (item) => item.stable_id === UNVERIFIED_EUR_LEX_ID,
    )!;
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
