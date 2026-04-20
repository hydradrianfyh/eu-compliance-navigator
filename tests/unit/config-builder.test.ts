import { describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import type { VehicleConfig } from "@/config/schema";
import { buildEngineConfig } from "@/engine/config-builder";

describe("powertrain + fuel flag derivation", () => {
  it("BEV with fuel.tankType 'none' derives no combustion, no tank, no OBD", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "BEV",
      fuel: { tankType: "none" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.fuelType).toBe("none");
    expect(engine.hasCombustionEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(false);
    expect(engine.hasOBD).toBe(false);
    expect(engine.isPlugInHybrid).toBe(false);
    expect(engine.batteryPresent).toBe(true);
  });

  it("ICE with fuel.tankType 'petrol' derives combustion, tank, OBD", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "ICE",
      fuel: { tankType: "petrol" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.fuelType).toBe("petrol");
    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasDieselEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
    expect(engine.isPlugInHybrid).toBe(false);
    expect(engine.batteryPresent).toBe(false);
  });

  it("ICE with fuel.tankType 'diesel' derives diesel-specific flag", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "ICE",
      fuel: { tankType: "diesel" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.fuelType).toBe("diesel");
    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasDieselEngine).toBe(true);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
  });

  it("PHEV with fuel.tankType 'petrol' derives combustion flags + plug-in-hybrid + battery", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "PHEV",
      fuel: { tankType: "petrol" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.fuelType).toBe("petrol");
    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasDieselEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
    expect(engine.isPlugInHybrid).toBe(true);
    expect(engine.batteryPresent).toBe(true);
  });

  it("FCEV with fuel.tankType 'h2' derives tank without combustion or OBD", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "FCEV",
      fuel: { tankType: "h2" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.fuelType).toBe("h2");
    expect(engine.hasCombustionEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(false);
    expect(engine.batteryPresent).toBe(true);
  });

  it("ICE with fuel undefined yields null fuelType and no combustion (defensive)", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "ICE",
      fuel: undefined,
    };

    const engine = buildEngineConfig(config);

    expect(engine.fuelType).toBeNull();
    expect(engine.hasCombustionEngine).toBe(false);
  });

  it("HEV with fuel.tankType 'petrol' derives combustion flags + battery without plug-in-hybrid", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "HEV",
      fuel: { tankType: "petrol" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
    expect(engine.batteryPresent).toBe(true);
    expect(engine.isPlugInHybrid).toBe(false);
  });

  it("ICE with fuel.tankType 'cng' derives combustion, tank, OBD for gaseous fuel", () => {
    const config: VehicleConfig = {
      ...defaultVehicleConfig,
      powertrain: "ICE",
      fuel: { tankType: "cng" },
    };

    const engine = buildEngineConfig(config);

    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
  });
});
