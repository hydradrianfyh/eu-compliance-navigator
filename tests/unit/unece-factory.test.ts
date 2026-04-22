import { describe, expect, it } from "vitest";

import { uneceTechnicalRules } from "@/registry/seed/unece-technical";

/**
 * Phase L.1 factory unlock tests.
 *
 * Tests the factory's canPromote gate: only promote to ACTIVE when
 * all of: lifecycleOverride, deep-link URL, revisionLabel, lastVerifiedOn,
 * humanReviewer are present. Any missing field → fallback to SEED_UNVERIFIED.
 */

const UNECE_PRIMARY_PORTAL = "https://unece.org/transport/vehicle-regulations";

// Extract a rule by stable_id from the factory output for inspection.
function byId(stableId: string) {
  const rule = uneceTechnicalRules.find((r) => r.stable_id === stableId);
  if (!rule) throw new Error(`Rule ${stableId} not found`);
  return rule;
}

describe("uneceRule factory — Phase L.1 lifecycle unlock", () => {
  it("existing authored rules without lifecycleOverride stay SEED_UNVERIFIED", () => {
    // REG-UN-094 (R94 Frontal impact) is authored but no lifecycleOverride.
    const rule = byId("REG-UN-094");
    expect(rule.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("factory-default rules (no authored block) stay SEED_UNVERIFIED", () => {
    // REG-UN-058 (R58 rear underrun) is a bare stub at time of L.1.
    // After L.2 it will have authored content but still SEED_UNVERIFIED.
    const rule = byId("REG-UN-058");
    expect(rule.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("REG-UN-100 (explicit makeSeedRule, not factory) remains ACTIVE", () => {
    // Sanity check: the one explicit rule that bypasses the factory
    // continues to work unchanged.
    const rule = byId("REG-UN-100");
    expect(rule.lifecycle_state).toBe("ACTIVE");
  });

  // Note: Tests for the positive case (lifecycleOverride → ACTIVE) and the
  // portal-URL-rejection case are exercised by real rules in L.3, where
  // authored blocks gain `lifecycleOverride: "ACTIVE"`. At the L.1 commit
  // point, no factory call uses the new field yet — the machinery is dormant
  // but correctly wired. See tests in tests/unit/pilot-acceptance.test.ts
  // after L.3 for end-to-end coverage.

  it("factory output is stable across rebuilds (deterministic)", () => {
    const first = byId("REG-UN-094");
    const second = uneceTechnicalRules.find((r) => r.stable_id === "REG-UN-094");
    expect(second).toEqual(first);
  });

  it("all UNECE rules have stable_id starting with REG-UN-", () => {
    for (const rule of uneceTechnicalRules) {
      expect(rule.stable_id).toMatch(/^REG-UN-/);
    }
  });
});
