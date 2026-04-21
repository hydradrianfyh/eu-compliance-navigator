import type { VehicleConfig } from "@/config/schema";

/**
 * MY2027 ICE M1 × ES pilot fixture.
 *
 * Chinese OEM petrol ICE SUV launching in Spain. Regression anchor for the
 * ICE + ES overlay path, exercising:
 *   - Combustion-engine derived flags (hasCombustionEngine, hasFuelTank,
 *     hasOBD, fuelType = "petrol", isPlugInHybrid = false).
 *   - ES member-state overlay (13 authored rules in Phase I.4; rules that are
 *     petrol-path / non-urban-delivery / non-VTV should be NOT_APPLICABLE
 *     and the remainder CONDITIONAL pending source verification).
 *   - Euro 7 rule split (REG-EM-001 framework + REG-EM-013 combustion
 *     exhaust; NOT REG-EM-014 battery durability because batteryPresent=false).
 *   - UNECE emission rules (R83 exhaust, R51 noise, R85 power) firing on
 *     hasCombustionEngine / fuelType, not BEV.
 *
 * Deliberately minimal config: `basic_adas` automation, `conventional` AI
 * level, no driver-facing cameras — isolates what fires via the ICE / ES path
 * rather than ADAS / privacy / AI triggers already covered by the BEV / PHEV
 * pilots.
 */
export const pilotMy2027IceM1Es: VehicleConfig = {
  projectName: "MY2027 ICE M1 (ES Market Pilot)",
  vehicleCode: "Chinese OEM Petrol SUV",
  targetCountries: ["ES"],
  sopDate: "2027-04-01",
  firstRegistrationDate: "2027-05-01",
  consumerOrFleet: "consumer",
  salesModel: "dealer",
  frameworkGroup: "MN",
  vehicleCategory: "M1",
  bodyType: "suv",
  approvalType: "new_type",
  steeringPosition: "LHD",
  completionState: "complete",
  powertrain: "ICE",
  batteryCapacityBand: null,
  chargingCapability: { ac: false, dc: false, bidirectional: false },
  automationLevel: "basic_adas",
  adasFeatures: ["aeb", "lka", "acc"],
  parkingAutomation: false,
  motorwayAssistant: false,
  systemInitiatedLaneChange: false,
  connectivity: ["telematics", "mobile_app"],
  dataFlags: ["location_tracking"],
  aiLevel: "conventional",
  aiInventoryExists: false,
  fuel: { tankType: "petrol" },
  readiness: {
    csmsAvailable: true,
    sumsAvailable: false,
    dpiaCompleted: false,
    technicalDocStarted: true,
    evidenceOwnerAssigned: true,
    registrationAssumptionsKnown: true,
    offersPublicChargingInfra: false,
  },
};
