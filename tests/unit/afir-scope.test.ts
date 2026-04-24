import { describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateRule } from "@/engine/evaluator";
import { allSeedRules } from "@/registry/seed";

/**
 * REG-DA-002 AFIR — vehicle-facing scope regression.
 *
 * Finding (post-Phase-M audit 2026-04-24): the original Phase M.1 trigger
 * keyed on `batteryPresent` alone. `batteryPresent` is derived from
 * `batteryPowertrains = {HEV, PHEV, BEV, FCEV}` (see config-builder.ts),
 * so the rule falsely returned APPLICABLE for FCEVs with no grid-charging
 * capability and no public-charging-infrastructure role. AFIR's vehicle-
 * facing surface is charging-infrastructure interaction only (Type 2 AC,
 * CCS2 DC, Plug & Charge, public-charging data/payment). A vehicle with
 * no AC/DC charging capability AND no public-charging-infra role has no
 * AFIR vehicle-facing obligations and must evaluate NOT_APPLICABLE.
 *
 * This file is a regression anchor per ai-regression-testing guidance:
 * name the test after the bug it prevents; assert both the false-positive
 * we fixed and the positive cases we must preserve.
 */

const afirRule = allSeedRules.find((rule) => rule.stable_id === "REG-DA-002");
if (!afirRule) {
  throw new Error("REG-DA-002 missing from seed registry");
}

describe("REG-DA-002 AFIR — vehicle-facing scope", () => {
  it("NOT_APPLICABLE for FCEV with no AC/DC charging and no public-charging-infra role", () => {
    // BUG-AFIR-01 regression: FCEV + chargingCapability {ac:false, dc:false}
    // + offersPublicChargingInfra:false previously returned APPLICABLE because
    // the trigger only checked batteryPresent (FCEV ∈ batteryPowertrains).
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      vehicleCategory: "M1",
      powertrain: "FCEV",
      chargingCapability: { ac: false, dc: false, bidirectional: false },
      targetCountries: ["DE"],
      sopDate: "2027-01-15",
      readiness: {
        ...defaultVehicleConfig.readiness,
        offersPublicChargingInfra: false,
      },
    });

    const result = evaluateRule(afirRule!, config);

    expect(result.applicability).toBe("NOT_APPLICABLE");
  });

  it("APPLICABLE for BEV with AC + DC charging in EU market", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      vehicleCategory: "M1",
      powertrain: "BEV",
      chargingCapability: { ac: true, dc: true, bidirectional: false },
      targetCountries: ["DE"],
      sopDate: "2027-01-15",
    });

    const result = evaluateRule(afirRule!, config);

    expect(result.applicability).toBe("APPLICABLE");
  });

  it("APPLICABLE for PHEV with AC-only charging", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      vehicleCategory: "M1",
      powertrain: "PHEV",
      chargingCapability: { ac: true, dc: false, bidirectional: false },
      targetCountries: ["DE"],
      sopDate: "2027-01-15",
      fuel: { tankType: "petrol" },
    });

    const result = evaluateRule(afirRule!, config);

    expect(result.applicability).toBe("APPLICABLE");
  });

  it("APPLICABLE when vehicle operator offers public charging infra, even with no own charging capability", () => {
    // OEMs that run public charging networks take on AFIR obligations even
    // for programs where the vehicle itself has no grid-charging interface
    // (e.g., ICE programs whose parent OEM operates a public charging
    // network in-scope for AFIR).
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      vehicleCategory: "M1",
      powertrain: "ICE",
      chargingCapability: { ac: false, dc: false, bidirectional: false },
      targetCountries: ["DE"],
      sopDate: "2027-01-15",
      fuel: { tankType: "petrol" },
      readiness: {
        ...defaultVehicleConfig.readiness,
        offersPublicChargingInfra: true,
      },
    });

    const result = evaluateRule(afirRule!, config);

    expect(result.applicability).toBe("APPLICABLE");
  });

  it("NOT_APPLICABLE for ICE with no charging capability and no public-charging-infra role", () => {
    const config = buildEngineConfig({
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      vehicleCategory: "M1",
      powertrain: "ICE",
      chargingCapability: { ac: false, dc: false, bidirectional: false },
      targetCountries: ["DE"],
      sopDate: "2027-01-15",
      fuel: { tankType: "petrol" },
    });

    const result = evaluateRule(afirRule!, config);

    expect(result.applicability).toBe("NOT_APPLICABLE");
  });
});
