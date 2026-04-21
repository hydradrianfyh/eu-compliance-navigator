import { describe, expect, it } from "vitest";

import {
  applyGovernanceToRule,
  validateRegistryIntegrity,
} from "@/registry/governance";
import { allSeedRules } from "@/registry/seed";

describe("governance", () => {
  it("retains verified rules as ACTIVE and downgrades unverified ones", () => {
    const verified = allSeedRules.filter((rule) =>
      ["REG-TA-001", "REG-GSR-001", "REG-CS-001", "REG-CS-002", "REG-PV-001"].includes(
        rule.stable_id,
      ),
    );
    expect(verified.length).toBe(5);
    expect(verified.every((rule) => rule.lifecycle_state === "ACTIVE")).toBe(true);

    // Rules that remain prose-ACTIVE but lack verified source fields — auto-downgraded
    // by applyGovernanceToRule() to SEED_UNVERIFIED. REG-EM-001 was promoted in
    // Phase 11B.2 batch 2, so we use REG-AD-001 / REG-AD-002 which still use makeSource
    // (deferred to later URL verification batch).
    const unverified = allSeedRules.filter((rule) =>
      ["REG-AD-001", "REG-AD-002"].includes(rule.stable_id),
    );
    expect(unverified.length).toBeGreaterThan(0);
    expect(
      unverified.every((rule) => rule.lifecycle_state === "SEED_UNVERIFIED"),
    ).toBe(true);
  });

  it("flags lifecycle/source integrity issues for ACTIVE rules", () => {
    const report = validateRegistryIntegrity(allSeedRules);

    expect(report.totalRules).toBe(191);
    expect(report.duplicateIds).toEqual([]);
    expect(report.activeWithoutUrl).toEqual([]);
    expect(report.activeWithoutOjReference).toEqual([]);
    expect(report.activeWithoutVerification).toEqual([]);
  });

  it("keeps PLACEHOLDER rules under manual review", () => {
    const placeholderRule = allSeedRules.find(
      (rule) => rule.stable_id === "REG-TA-003",
    );

    expect(placeholderRule).toBeDefined();
    expect(placeholderRule?.lifecycle_state).toBe("PLACEHOLDER");

    const normalized = applyGovernanceToRule(placeholderRule!);

    expect(normalized.manual_review_required).toBe(true);
    expect(normalized.manual_review_reason).toContain("PLACEHOLDER");
  });
});
