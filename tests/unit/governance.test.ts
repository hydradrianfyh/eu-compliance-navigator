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

    // Phase M.0.1 (audit 2026-04-23): the previous "prose-ACTIVE but runtime-downgraded"
    // test set — REG-TA-002 / REG-AD-001 / REG-AD-002 / REG-DA-001 — was closed by
    // authoring real URL + OJ (where required) + verification dates on all four primary
    // sources. They are now genuinely ACTIVE at both raw and runtime layers.
    //
    // The remaining SEED_UNVERIFIED population consists of backlog items that were
    // *originally* labelled SEED_UNVERIFIED in prose — not prose-ACTIVE rules that
    // got silently downgraded. We verify one such rule (REG-MS-001 Market Surveillance
    // Regulation — REG-BAT-002 was promoted in Phase M.2.B) to confirm the lifecycle
    // state is preserved. The "silent downgrade at runtime" class stays empty.
    const msr = allSeedRules.find((rule) => rule.stable_id === "REG-MS-001");
    expect(msr?.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("flags lifecycle/source integrity issues for ACTIVE rules", () => {
    const report = validateRegistryIntegrity(allSeedRules);

    expect(report.totalRules).toBe(209);
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
