import type { VehicleConfig } from "@/config/schema";

/**
 * MY2028 PHEV M1 pilot fixture.
 *
 * Complements pilot-my2027-bev.ts. Two deliberate deltas:
 *   1. Powertrain PHEV (not BEV) — confirms Battery Regulation family triggers on
 *      the generic `batteryPresent` derived flag, not BEV specifically.
 *   2. SOP 2028-06-01 (not 2027-01-15) — moves two ACTIVE rules from FUTURE to
 *      APPLICABLE:
 *        - REG-AI-004 (applies_from_generic 2027-08-02)
 *        - REG-BAT-005 (applies_from_generic 2027-02-18)
 *
 * Everything else mirrors MY2027 BEV to isolate the two deltas in the expected
 * output.
 */
export const pilotMY2028PHEV: VehicleConfig = {
  projectName: "MY2028 PHEV Pilot",
  vehicleCode: "PILOT-MY28-PHEV",
  targetCountries: ["DE", "FR", "NL"],
  sopDate: "2028-06-01",
  firstRegistrationDate: "2028-09-01",
  consumerOrFleet: "consumer",
  salesModel: "dealer",
  frameworkGroup: "MN",
  vehicleCategory: "M1",
  bodyType: "sedan",
  approvalType: "new_type",
  steeringPosition: "LHD",
  completionState: "complete",
  powertrain: "PHEV",
  batteryCapacityBand: "medium",
  chargingCapability: {
    ac: true,
    dc: true,
    bidirectional: false,
  },
  automationLevel: "l2plus",
  adasFeatures: [
    "lane_keeping",
    "adaptive_cruise",
    "blind_spot",
    "cross_traffic",
    "traffic_sign",
  ],
  parkingAutomation: false,
  motorwayAssistant: true,
  systemInitiatedLaneChange: false,
  connectivity: ["telematics", "mobile_app", "remote_control", "ota"],
  dataFlags: ["cabin_camera", "driver_profiling", "biometric_data", "location_tracking"],
  aiLevel: "ai_safety",
  aiInventoryExists: true,
  braking: {
    type: "mixed",
    absFitted: true,
    espFitted: true,
  },
  steering: {
    type: "electric",
    eps: true,
  },
  cabin: {
    airbagCount: 8,
    isofixAnchors: true,
    seatbeltReminder: true,
  },
  lighting: {
    headlampType: "matrix_led",
    avas: true,
  },
  fuel: {
    tankType: "petrol",
  },
  hmi: {
    touchscreenPrimary: true,
    voiceControl: true,
  },
  readiness: {
    csmsAvailable: true,
    sumsAvailable: true,
    dpiaCompleted: true,
    technicalDocStarted: true,
    evidenceOwnerAssigned: true,
    registrationAssumptionsKnown: true,
    offersPublicChargingInfra: false,
  },
};
