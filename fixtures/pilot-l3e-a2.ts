import type { VehicleConfig } from "@/config/schema";

/**
 * L3e-A2 electric motorcycle pilot fixture.
 *
 * Exercises the L-category framework path — different from MN. Deliberately
 * minimal config (no ADAS, no AI, minimal connectivity, no driver-facing
 * cameras) to isolate what fires via the L-cat + batteryPresent + targetDE
 * triggers.
 *
 * Key expected outcomes vs. MY2027 BEV / MY2028 PHEV (both MN/M1):
 *   - REG-TA-001 (WVTA MN/O): NOT_APPLICABLE (framework = L, not MN/O).
 *   - REG-GSR-001 (GSR2): NOT_APPLICABLE (framework = MN).
 *   - REG-CS-001 / REG-CS-002 (R155/R156): NOT_APPLICABLE (framework = MN).
 *   - REG-UN-100 (R100 EV safety): NOT_APPLICABLE (framework_group MN only).
 *   - REG-EM-001 / REG-EM-003: NOT_APPLICABLE (M1/N1 only).
 *   - REG-BAT-001 / REG-BAT-004 / REG-BAT-005: APPLICABLE (framework_group
 *     ["MN","L"] + trigger checks only batteryPresent).
 *   - REG-MS-DE-001..005: APPLICABLE (Germany overlay triggers on targetCountries
 *     includes "DE" without framework restriction).
 *   - REG-TA-002 (L-cat framework): still SEED_UNVERIFIED → CONDITIONAL (not
 *     APPLICABLE). Confirms hard gate is still enforced even on matching triggers.
 */
export const pilotL3eA2: VehicleConfig = {
  projectName: "L3e-A2 BEV Pilot",
  vehicleCode: "PILOT-L3E-A2-BEV",
  targetCountries: ["DE"],
  sopDate: "2027-06-01",
  firstRegistrationDate: "2027-09-01",
  consumerOrFleet: "consumer",
  salesModel: "dealer",
  frameworkGroup: "L",
  vehicleCategory: "L3e-A2",
  bodyType: "motorcycle",
  approvalType: "new_type",
  steeringPosition: "LHD",
  completionState: "complete",
  powertrain: "BEV",
  batteryCapacityBand: "small",
  chargingCapability: {
    ac: true,
    dc: false,
    bidirectional: false,
  },
  automationLevel: "none",
  adasFeatures: [],
  parkingAutomation: false,
  motorwayAssistant: false,
  systemInitiatedLaneChange: false,
  connectivity: ["mobile_app"],
  dataFlags: [],
  aiLevel: "none",
  aiInventoryExists: false,
  braking: {
    type: "regen",
    absFitted: true,
    espFitted: false,
  },
  steering: {
    type: "mechanical",
    eps: false,
  },
  cabin: {
    airbagCount: 0,
    isofixAnchors: false,
    seatbeltReminder: false,
  },
  lighting: {
    headlampType: "led",
    avas: true,
  },
  fuel: {
    tankType: "none",
  },
  hmi: {
    touchscreenPrimary: false,
    voiceControl: false,
  },
  readiness: {
    csmsAvailable: false,
    sumsAvailable: false,
    dpiaCompleted: false,
    technicalDocStarted: true,
    evidenceOwnerAssigned: false,
    registrationAssumptionsKnown: true,
    offersPublicChargingInfra: false,
  },
};
