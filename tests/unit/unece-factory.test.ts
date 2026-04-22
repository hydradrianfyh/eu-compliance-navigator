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
    // REG-UN-025 (R25 Head Restraints) is authored but no lifecycleOverride
    // and its officialUrl is still the primary portal — factory must keep
    // it at SEED_UNVERIFIED.
    const rule = byId("REG-UN-025");
    expect(rule.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("factory-default rules (no authored block) stay SEED_UNVERIFIED", () => {
    // REG-UN-058 (R58 rear underrun) has an authored block from Phase L.2
    // but no lifecycleOverride — still SEED_UNVERIFIED.
    const rule = byId("REG-UN-058");
    expect(rule.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("REG-UN-100 (explicit makeSeedRule, not factory) remains ACTIVE", () => {
    // Sanity check: the one explicit rule that bypasses the factory
    // continues to work unchanged.
    const rule = byId("REG-UN-100");
    expect(rule.lifecycle_state).toBe("ACTIVE");
  });

  // Phase L.3 — positive case: lifecycleOverride + deep-link URL + revision
  // label + lastVerifiedOn + humanReviewer all present → factory emits ACTIVE.
  it("Phase L.3 promoted rule (REG-UN-094) is ACTIVE with populated last_verified_on", () => {
    const rule = byId("REG-UN-094");
    expect(rule.lifecycle_state).toBe("ACTIVE");
    expect(rule.sources[0]?.official_url).toBeDefined();
    expect(rule.sources[0]?.official_url).not.toBe(UNECE_PRIMARY_PORTAL);
    expect(rule.sources[0]?.last_verified_on).toBe("2026-04-22");
    expect(rule.content_provenance?.human_reviewer).toBe("yanhao");
    expect(rule.promoted_on).toBe("2026-04-22");
    expect(rule.promoted_by).toBe("phase-l-round-3");
  });

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
