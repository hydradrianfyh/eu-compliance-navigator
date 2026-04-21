import { describe, expect, it } from "vitest";

import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { allSeedRules } from "@/registry/seed";
import { pilotMy2027IceM1Es } from "../../fixtures/pilot-my2027-ice-m1-es";

/**
 * Pilot MY2027 ICE M1 × ES acceptance.
 *
 * Regression anchor for the ICE + ES path:
 *   - Combustion-only evaluation (petrol fuel, no battery).
 *   - ES member-state overlay coverage (13 authored rules).
 *   - Euro 7 rule split: framework (001) + combustion (013), NOT battery
 *     durability (014).
 *
 * Snapshots lock in the applicable-IDs list and the per-applicability counts;
 * vitest will diff on future runs so any regression is caught here.
 */
describe("Pilot MY2027 ICE M1 × ES acceptance", () => {
  const engineConfig = buildEngineConfig(pilotMy2027IceM1Es);
  const results = evaluateAllRules(allSeedRules, engineConfig);

  const applicable = results.filter((r) => r.applicability === "APPLICABLE");
  const conditional = results.filter((r) => r.applicability === "CONDITIONAL");
  const unknown = results.filter((r) => r.applicability === "UNKNOWN");
  const notApplicable = results.filter(
    (r) => r.applicability === "NOT_APPLICABLE",
  );
  const future = results.filter((r) => r.applicability === "FUTURE");

  it("evaluates all seed rules without error", () => {
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBe(allSeedRules.length);
  });

  describe("Layer 1 — hard assertions", () => {
    it("ICE combustion-path rules are not downgraded to NOT_APPLICABLE by battery flag", () => {
      // REG-EM-001 (Euro 7 framework) applies to all M1/N1 regardless of powertrain.
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      expect(
        applicableIds.has("REG-EM-001"),
        "REG-EM-001 (Euro 7 framework) should be APPLICABLE for ICE M1",
      ).toBe(true);
    });

    it("Battery-gated rules are NOT_APPLICABLE for pure ICE (batteryPresent=false)", () => {
      const notApplicableIds = new Set(notApplicable.map((r) => r.rule_id));
      expect(
        notApplicableIds.has("REG-BAT-001"),
        "REG-BAT-001 (Battery Regulation) should be NOT_APPLICABLE for ICE",
      ).toBe(true);
      expect(
        notApplicableIds.has("REG-BAT-004"),
        "REG-BAT-004 should be NOT_APPLICABLE for ICE",
      ).toBe(true);
    });

    it("DE and UK overlay rules are NOT_APPLICABLE (target is ES only)", () => {
      const notApplicableIds = new Set(notApplicable.map((r) => r.rule_id));
      for (const id of ["REG-MS-DE-001", "REG-UK-001"]) {
        expect(
          notApplicableIds.has(id),
          `${id} should be NOT_APPLICABLE for ES-only target`,
        ).toBe(true);
      }
    });
  });

  describe("Layer 2 — snapshot coverage", () => {
    it("applicable IDs snapshot", () => {
      const applicableIds = applicable.map((r) => r.rule_id).sort();
      expect(applicableIds).toMatchSnapshot("applicable_ids");
    });

    it("applicability counts snapshot", () => {
      const counts = {
        applicable: applicable.length,
        conditional: conditional.length,
        not_applicable: notApplicable.length,
        unknown: unknown.length,
        future: future.length,
      };
      expect(counts).toMatchSnapshot("counts");
    });
  });
});
