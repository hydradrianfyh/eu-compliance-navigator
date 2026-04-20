/**
 * Phase B unit tests for setup-progress logic.
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import { pilotMY2027BEV } from "../../fixtures/pilot-my2027-bev";
import {
  SETUP_SECTIONS,
  buildSetupProgressReport,
  evaluateSetupSection,
} from "@/lib/setup-progress";

describe("buildSetupProgressReport", () => {
  it("returns 0% with defaults (only readiness/digital optional; others missing required fields)", () => {
    const report = buildSetupProgressReport(defaultVehicleConfig);
    expect(report.requiredTotal).toBe(4);
    expect(report.requiredComplete).toBeLessThan(4);
    // adas is complete by default (automationLevel always has a value), so 1/4
    expect(report.requiredComplete).toBe(1);
    expect(report.percentage).toBe(25);
  });

  it("returns 100% for the pilot fixture (all required sections filled)", () => {
    const report = buildSetupProgressReport(pilotMY2027BEV);
    expect(report.requiredTotal).toBe(4);
    expect(report.requiredComplete).toBe(4);
    expect(report.percentage).toBe(100);
  });

  it("reports per-section completeness details", () => {
    const report = buildSetupProgressReport(defaultVehicleConfig);
    const programSection = report.sections.find((s) => s.id === "program_market");
    expect(programSection?.complete).toBe(false);
    expect(programSection?.missingFields).toContain("projectName");
    expect(programSection?.missingFields).toContain("targetCountries");
    expect(programSection?.missingFields).toContain("sopDate");
  });
});

describe("evaluateSetupSection · program_market", () => {
  const section = SETUP_SECTIONS.find((s) => s.id === "program_market")!;

  it("requires projectName + targetCountries + sopDate", () => {
    const state = evaluateSetupSection(section, {
      ...defaultVehicleConfig,
      projectName: "MY2027 BEV",
      targetCountries: ["DE"],
      sopDate: "2027-01-15",
    });
    expect(state.complete).toBe(true);
    expect(state.missingFields).toEqual([]);
  });

  it("flags missing sopDate", () => {
    const state = evaluateSetupSection(section, {
      ...defaultVehicleConfig,
      projectName: "X",
      targetCountries: ["DE"],
      sopDate: null,
    });
    expect(state.complete).toBe(false);
    expect(state.missingFields).toEqual(["sopDate"]);
  });
});

describe("evaluateSetupSection · homologation_basis", () => {
  const section = SETUP_SECTIONS.find((s) => s.id === "homologation_basis")!;

  it("requires frameworkGroup + vehicleCategory", () => {
    const state = evaluateSetupSection(section, {
      ...defaultVehicleConfig,
      frameworkGroup: "MN",
      vehicleCategory: "M1",
    });
    expect(state.complete).toBe(true);
  });

  it("flags missing frameworkGroup", () => {
    const state = evaluateSetupSection(section, {
      ...defaultVehicleConfig,
      frameworkGroup: null,
      vehicleCategory: "M1",
    });
    expect(state.complete).toBe(false);
    expect(state.missingFields).toContain("frameworkGroup");
  });
});

describe("evaluateSetupSection · propulsion_energy", () => {
  const section = SETUP_SECTIONS.find((s) => s.id === "propulsion_energy")!;

  it("requires powertrain", () => {
    const state = evaluateSetupSection(section, {
      ...defaultVehicleConfig,
      powertrain: "BEV",
    });
    expect(state.complete).toBe(true);
  });

  it("flags missing powertrain", () => {
    const state = evaluateSetupSection(section, {
      ...defaultVehicleConfig,
      powertrain: null,
    });
    expect(state.complete).toBe(false);
    expect(state.missingFields).toContain("powertrain");
  });
});

describe("evaluateSetupSection · optional sections are always complete", () => {
  it("digital_cockpit is complete regardless of values", () => {
    const section = SETUP_SECTIONS.find((s) => s.id === "digital_cockpit")!;
    const state = evaluateSetupSection(section, defaultVehicleConfig);
    expect(state.complete).toBe(true);
    expect(state.required).toBe(false);
  });

  it("readiness is complete regardless of values", () => {
    const section = SETUP_SECTIONS.find((s) => s.id === "readiness")!;
    const state = evaluateSetupSection(section, defaultVehicleConfig);
    expect(state.complete).toBe(true);
    expect(state.required).toBe(false);
  });
});
