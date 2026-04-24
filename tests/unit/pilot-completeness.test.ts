import { describe, expect, it } from "vitest";

import type { VehicleConfig } from "@/config/schema";
import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { allSeedRules } from "@/registry/seed";

import { pilotMY2027BEV } from "../../fixtures/pilot-my2027-bev";
import { pilotExpected as bevExpected } from "../../fixtures/pilot-my2027-bev.expected";
import { pilotMY2028PHEV } from "../../fixtures/pilot-my2028-phev";
import { pilotMY2028PHEVExpected as phevExpected } from "../../fixtures/pilot-my2028-phev.expected";
import { pilotMy2027IceM1Es } from "../../fixtures/pilot-my2027-ice-m1-es";
import { pilotMy2027IceM1EsExpected as iceExpected } from "../../fixtures/pilot-my2027-ice-m1-es.expected";

/**
 * Phase M Part C — pilot-completeness KPI (docs/phase-m/plan.md §6).
 *
 * KPI: pilotCompleteness = |applicable ∩ engineerExpectedApplicable|
 *                          / |engineerExpectedApplicable|
 *
 * The engineerExpectedApplicable list (authored per pilot expected fixture)
 * is the denominator — what a homologation engineer running this pilot
 * expects to see APPLICABLE once currently-known backlog items are closed.
 *
 * Thresholds (plan §6.3):
 *   - MY2027 BEV × DE/FR/NL:  ≥ 0.80 coverage
 *   - MY2028 PHEV × DE/FR/NL: ≥ 0.80 coverage
 *   - MY2027 ICE M1 × ES:     ≥ 0.70 coverage
 */

interface PilotUnderTest {
  name: string;
  config: VehicleConfig;
  expected: readonly string[];
  threshold: number;
}

const pilotsUnderTest: PilotUnderTest[] = [
  {
    name: "MY2027 BEV × DE/FR/NL",
    config: pilotMY2027BEV,
    expected: bevExpected.engineerExpectedApplicable,
    threshold: 0.8,
  },
  {
    name: "MY2028 PHEV × DE/FR/NL",
    config: pilotMY2028PHEV,
    expected: phevExpected.engineerExpectedApplicable,
    threshold: 0.8,
  },
  {
    name: "MY2027 ICE M1 × ES",
    config: pilotMy2027IceM1Es,
    expected: iceExpected.engineerExpectedApplicable,
    threshold: 0.7,
  },
];

describe("Phase M Part C — pilot-completeness KPI", () => {
  for (const pilot of pilotsUnderTest) {
    it(`${pilot.name}: APPLICABLE covers ≥ ${(pilot.threshold * 100).toFixed(0)}% of engineer-expected set`, () => {
      const engineCfg = buildEngineConfig(pilot.config);
      const results = evaluateAllRules(allSeedRules, engineCfg);
      const applicableIds = new Set(
        results
          .filter((r) => r.applicability === "APPLICABLE")
          .map((r) => r.rule_id),
      );

      const matched = pilot.expected.filter((id) => applicableIds.has(id));
      const missing = pilot.expected.filter((id) => !applicableIds.has(id));
      const coverage = matched.length / pilot.expected.length;

      if (coverage < pilot.threshold) {
        const sample = missing.slice(0, 20).join(", ");
        throw new Error(
          `${pilot.name} pilotCompleteness ${(coverage * 100).toFixed(1)}% ` +
            `< threshold ${(pilot.threshold * 100).toFixed(0)}%. ` +
            `Matched ${matched.length} / ${pilot.expected.length}. ` +
            `Missing ${missing.length}: ${sample}${missing.length > 20 ? ", ..." : ""}`,
        );
      }

      expect(coverage).toBeGreaterThanOrEqual(pilot.threshold);
    });
  }

  it("each pilot's expected set contains only valid rule stable_ids", () => {
    const allIds = new Set(allSeedRules.map((r) => r.stable_id));
    for (const pilot of pilotsUnderTest) {
      const unknown = pilot.expected.filter((id) => !allIds.has(id));
      if (unknown.length > 0) {
        throw new Error(
          `${pilot.name} engineerExpectedApplicable references unknown rule IDs: ${unknown.join(", ")}`,
        );
      }
    }
  });

  it("each pilot's expected set has no duplicate entries", () => {
    for (const pilot of pilotsUnderTest) {
      const seen = new Set<string>();
      const duplicates: string[] = [];
      for (const id of pilot.expected) {
        if (seen.has(id)) duplicates.push(id);
        seen.add(id);
      }
      if (duplicates.length > 0) {
        throw new Error(
          `${pilot.name} engineerExpectedApplicable has duplicates: ${duplicates.join(", ")}`,
        );
      }
    }
  });
});
