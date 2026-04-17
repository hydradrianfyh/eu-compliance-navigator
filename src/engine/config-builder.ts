import { engineConfigSchema, type EngineConfig, type VehicleConfig } from "@/config/schema";

const euCountryCodes = new Set([
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
]);

const batteryPowertrains = new Set(["HEV", "PHEV", "BEV", "FCEV"]);
const connectedFlags = new Set(["telematics", "mobile_app", "remote_control", "ota"]);
const personalDataFlags = new Set([
  "cabin_camera",
  "driver_profiling",
  "biometric_data",
  "location_tracking",
]);
const safetyAiLevels = new Set(["ai_dms", "ai_safety", "ai_perception"]);

export function buildEngineConfig(config: VehicleConfig): EngineConfig {
  const targetsMemberStates = config.targetCountries.filter((country) =>
    euCountryCodes.has(country),
  );
  const targetsNonEU = config.targetCountries.filter(
    (country) => !euCountryCodes.has(country),
  );

  return engineConfigSchema.parse({
    frameworkGroup: config.frameworkGroup,
    vehicleCategory: config.vehicleCategory,
    powertrain: config.powertrain,
    automationLevel: config.automationLevel,
    adasFeatures: config.adasFeatures,
    parkingAutomation: config.parkingAutomation,
    motorwayAssistant: config.motorwayAssistant,
    systemInitiatedLaneChange: config.systemInitiatedLaneChange,
    connectivity: config.connectivity,
    dataFlags: config.dataFlags,
    aiLevel: config.aiLevel,
    targetCountries: config.targetCountries,
    sopDate: config.sopDate,
    firstRegistrationDate: config.firstRegistrationDate,
    salesModel: config.salesModel,
    approvalType: config.approvalType,
    batteryPresent:
      config.powertrain !== null && batteryPowertrains.has(config.powertrain),
    hasOTA:
      config.connectivity.includes("ota") || config.readiness.sumsAvailable,
    hasConnectedServices: config.connectivity.some((item) => connectedFlags.has(item)),
    processesPersonalData: config.dataFlags.some((item) => personalDataFlags.has(item)),
    hasAI: !["none", "conventional"].includes(config.aiLevel),
    hasSafetyRelevantAI: safetyAiLevels.has(config.aiLevel),
    isL3Plus: ["l3", "l4", "l4_driverless"].includes(config.automationLevel),
    isDriverless: config.automationLevel === "l4_driverless",
    hasRegen: config.braking?.type === "regen" || config.braking?.type === "mixed",
    hasEPS: config.steering?.eps ?? false,
    hasAVAS: config.lighting?.avas ?? false,
    hasMatrixLED: config.lighting?.headlampType === "matrix_led",
    hasABS: config.braking?.absFitted ?? true,
    hasESP: config.braking?.espFitted ?? true,
    targetsEU: targetsMemberStates.length > 0,
    targetsUK: config.targetCountries.includes("UK"),
    targetsMemberStates,
    targetsNonEU,
    readiness: config.readiness,
  });
}
