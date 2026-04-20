import type { VehicleConfig } from "@/config/schema";

/**
 * Initial values for each Advanced sub-section. Used when a user opts in
 * to populate an otherwise-optional section from the Setup tab.
 * Values chosen to reflect a typical modern M1 / BEV configuration so the
 * first-time user gets something reasonable instead of a blank form.
 */
export const advancedSectionDefaults = {
  braking: { type: "conventional", absFitted: true, espFitted: true },
  steering: { type: "electric", eps: true },
  cabin: { airbagCount: 6, isofixAnchors: true, seatbeltReminder: true },
  lighting: { headlampType: "led", avas: true },
  fuel: { tankType: "none" },
  hmi: { touchscreenPrimary: true, voiceControl: false },
} as const;

export const defaultVehicleConfig: VehicleConfig = {
  projectName: "",
  vehicleCode: "",
  targetCountries: [],
  sopDate: null,
  firstRegistrationDate: null,
  consumerOrFleet: "consumer",
  salesModel: "dealer",
  frameworkGroup: null,
  vehicleCategory: null,
  bodyType: "",
  approvalType: "new_type",
  steeringPosition: "LHD",
  completionState: "complete",
  powertrain: null,
  batteryCapacityBand: null,
  chargingCapability: {
    ac: false,
    dc: false,
    bidirectional: false,
  },
  automationLevel: "none",
  adasFeatures: [],
  parkingAutomation: false,
  motorwayAssistant: false,
  systemInitiatedLaneChange: false,
  connectivity: [],
  dataFlags: [],
  aiLevel: "none",
  aiInventoryExists: false,
  braking: undefined,
  steering: undefined,
  cabin: undefined,
  lighting: undefined,
  fuel: undefined,
  hmi: undefined,
  readiness: {
    csmsAvailable: false,
    sumsAvailable: false,
    dpiaCompleted: false,
    technicalDocStarted: false,
    evidenceOwnerAssigned: false,
    registrationAssumptionsKnown: false,
    offersPublicChargingInfra: false,
  },
};
