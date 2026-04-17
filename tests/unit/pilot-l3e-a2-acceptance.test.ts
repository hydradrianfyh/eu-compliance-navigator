import { describe, expect, it } from "vitest";

import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { allSeedRules } from "@/registry/seed";
import { pilotL3eA2 } from "../../fixtures/pilot-l3e-a2";
import { pilotL3eA2Expected } from "../../fixtures/pilot-l3e-a2.expected";

describe("Pilot L3e-A2 BEV acceptance", () => {
  const engineConfig = buildEngineConfig(pilotL3eA2);
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
    it("returns at least the minimum number of APPLICABLE rules", () => {
      expect(applicable.length).toBeGreaterThanOrEqual(
        pilotL3eA2Expected.hardAssertions.total_applicable_min,
      );
    });

    it("includes all expected APPLICABLE rule IDs that are currently ACTIVE", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      const activeExpected =
        pilotL3eA2Expected.hardAssertions.applicable_rule_ids.filter((id) => {
          const rule = allSeedRules.find((r) => r.stable_id === id);
          return rule?.lifecycle_state === "ACTIVE";
        });

      for (const id of activeExpected) {
        expect(
          applicableIds.has(id),
          `Expected ${id} to be APPLICABLE but it was not`,
        ).toBe(true);
      }
    });

    it("MN-only rules are NOT_APPLICABLE for L-category (framework isolation)", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      for (const id of pilotL3eA2Expected.hardAssertions.must_not_be_applicable_ids) {
        expect(
          applicableIds.has(id),
          `${id} must NOT be APPLICABLE for L-category (framework isolation broken)`,
        ).toBe(false);
      }
    });

    it("cross-framework battery rules fire for L-cat BEV", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      for (const id of ["REG-BAT-001", "REG-BAT-004", "REG-BAT-005"]) {
        expect(
          applicableIds.has(id),
          `${id} should be APPLICABLE for L-cat BEV (framework_group ["MN","L"] + batteryPresent trigger)`,
        ).toBe(true);
      }
    });

    it("Germany overlay applies to L-category vehicles", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      for (const id of ["REG-MS-DE-001", "REG-MS-DE-002", "REG-MS-DE-003", "REG-MS-DE-004", "REG-MS-DE-005"]) {
        expect(
          applicableIds.has(id),
          `${id} should be APPLICABLE for any vehicle registered in DE, including L-cat`,
        ).toBe(true);
      }
    });
  });

  describe("Layer 2 — soft assertions", () => {
    it("CONDITIONAL count is within expected range", () => {
      const [min, max] = pilotL3eA2Expected.softAssertions.conditional_count_range;
      expect(conditional.length).toBeGreaterThanOrEqual(min);
      expect(conditional.length).toBeLessThanOrEqual(max);
    });

    it("UNKNOWN count does not exceed the PLACEHOLDER ceiling", () => {
      expect(unknown.length).toBeLessThanOrEqual(
        pilotL3eA2Expected.softAssertions.unknown_count_max,
      );
    });
  });

  describe("Layer 3 — coverage snapshot", () => {
    it("matches the full evaluation snapshot", () => {
      const snapshot = results.map((r) => ({
        rule_id: r.rule_id,
        applicability: r.applicability,
        lifecycle_state: r.lifecycle_state,
      }));
      expect(snapshot).toMatchSnapshot();
    });
  });

  describe("pilot coverage summary", () => {
    it("prints coverage breakdown", () => {
      const summary = {
        total: results.length,
        applicable: applicable.length,
        conditional: conditional.length,
        unknown: unknown.length,
        not_applicable: notApplicable.length,
        future: future.length,
        applicable_ids: applicable.map((r) => r.rule_id).sort(),
      };

      expect(summary.total).toBeGreaterThan(100);
      expect(summary).toMatchSnapshot();
    });
  });
});
