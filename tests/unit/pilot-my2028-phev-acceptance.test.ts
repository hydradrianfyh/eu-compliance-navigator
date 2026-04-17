import { describe, expect, it } from "vitest";

import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { allSeedRules } from "@/registry/seed";
import { pilotMY2028PHEV } from "../../fixtures/pilot-my2028-phev";
import { pilotMY2028PHEVExpected } from "../../fixtures/pilot-my2028-phev.expected";

describe("Pilot MY2028 PHEV acceptance", () => {
  const engineConfig = buildEngineConfig(pilotMY2028PHEV);
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
        pilotMY2028PHEVExpected.hardAssertions.total_applicable_min,
      );
    });

    it("includes all expected APPLICABLE rule IDs that are currently ACTIVE", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      const activeExpected =
        pilotMY2028PHEVExpected.hardAssertions.applicable_rule_ids.filter((id) => {
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

    it("REG-AI-004 and REG-BAT-005 are APPLICABLE (no longer FUTURE at SOP 2028)", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      expect(
        applicableIds.has("REG-AI-004"),
        "REG-AI-004 should be APPLICABLE at SOP 2028-06-01 (applies_from_generic 2027-08-02)",
      ).toBe(true);
      expect(
        applicableIds.has("REG-BAT-005"),
        "REG-BAT-005 should be APPLICABLE at SOP 2028-06-01 (applies_from_generic 2027-02-18)",
      ).toBe(true);
    });

    it("PHEV triggers the same battery family rules as BEV", () => {
      const applicableIds = new Set(applicable.map((r) => r.rule_id));
      for (const id of ["REG-BAT-001", "REG-BAT-004", "REG-BAT-005", "REG-UN-100"]) {
        expect(
          applicableIds.has(id),
          `${id} should be APPLICABLE for PHEV (batteryPresent=true)`,
        ).toBe(true);
      }
    });
  });

  describe("Layer 2 — soft assertions", () => {
    it("CONDITIONAL count is within expected range", () => {
      const [min, max] = pilotMY2028PHEVExpected.softAssertions.conditional_count_range;
      expect(conditional.length).toBeGreaterThanOrEqual(min);
      expect(conditional.length).toBeLessThanOrEqual(max);
    });

    it("UNKNOWN count does not exceed the PLACEHOLDER ceiling", () => {
      expect(unknown.length).toBeLessThanOrEqual(
        pilotMY2028PHEVExpected.softAssertions.unknown_count_max,
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
