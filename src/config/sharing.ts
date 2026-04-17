import { defaultVehicleConfig } from "@/config/defaults";
import { deserializeVehicleConfig, serializeVehicleConfig } from "@/config/persistence";
import type { VehicleConfig } from "@/config/schema";

const syncedVehicleConfigKeys = [
  "projectName",
  "frameworkGroup",
  "vehicleCategory",
  "approvalType",
  "sopDate",
  "firstRegistrationDate",
  "powertrain",
  "automationLevel",
  "aiLevel",
  "targetCountries",
  "connectivity",
  "dataFlags",
  "motorwayAssistant",
  "parkingAutomation",
  "readiness.csmsAvailable",
] as const;

export function encodeVehicleConfig(config: VehicleConfig): string {
  return encodeURIComponent(serializeVehicleConfig(config));
}

export function decodeVehicleConfig(payload: string): VehicleConfig {
  return deserializeVehicleConfig(decodeURIComponent(payload));
}

function parseList(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) {
    return undefined;
  }

  return value === "1";
}

export function hasVehicleConfigInUrl(search: string = window.location.search): boolean {
  const params = new URLSearchParams(search);

  return syncedVehicleConfigKeys.some((key) => params.has(key));
}

export function loadVehicleConfigFromUrl(
  search: string = window.location.search,
): VehicleConfig | null {
  const params = new URLSearchParams(search);

  if (!hasVehicleConfigInUrl(search)) {
    return null;
  }

  return {
    ...defaultVehicleConfig,
    projectName: params.get("projectName") ?? defaultVehicleConfig.projectName,
    frameworkGroup:
      (params.get("frameworkGroup") as VehicleConfig["frameworkGroup"]) ??
      defaultVehicleConfig.frameworkGroup,
    vehicleCategory:
      params.get("vehicleCategory") ?? defaultVehicleConfig.vehicleCategory,
    approvalType:
      (params.get("approvalType") as VehicleConfig["approvalType"]) ??
      defaultVehicleConfig.approvalType,
    sopDate: params.get("sopDate") ?? defaultVehicleConfig.sopDate,
    firstRegistrationDate:
      params.get("firstRegistrationDate") ?? defaultVehicleConfig.firstRegistrationDate,
    powertrain:
      (params.get("powertrain") as VehicleConfig["powertrain"]) ??
      defaultVehicleConfig.powertrain,
    automationLevel:
      (params.get("automationLevel") as VehicleConfig["automationLevel"]) ??
      defaultVehicleConfig.automationLevel,
    aiLevel:
      (params.get("aiLevel") as VehicleConfig["aiLevel"]) ??
      defaultVehicleConfig.aiLevel,
    targetCountries:
      parseList(params.get("targetCountries")) ?? defaultVehicleConfig.targetCountries,
    connectivity:
      parseList(params.get("connectivity")) ?? defaultVehicleConfig.connectivity,
    dataFlags: parseList(params.get("dataFlags")) ?? defaultVehicleConfig.dataFlags,
    motorwayAssistant:
      parseBoolean(params.get("motorwayAssistant")) ??
      defaultVehicleConfig.motorwayAssistant,
    parkingAutomation:
      parseBoolean(params.get("parkingAutomation")) ??
      defaultVehicleConfig.parkingAutomation,
    readiness: {
      ...defaultVehicleConfig.readiness,
      csmsAvailable:
        parseBoolean(params.get("readiness.csmsAvailable")) ??
        defaultVehicleConfig.readiness.csmsAvailable,
    },
  };
}

export function buildVehicleConfigSearchParams(config: VehicleConfig): URLSearchParams {
  const params = new URLSearchParams();

  if (config.projectName) params.set("projectName", config.projectName);
  if (config.frameworkGroup) params.set("frameworkGroup", config.frameworkGroup);
  if (config.vehicleCategory) params.set("vehicleCategory", config.vehicleCategory);
  if (config.approvalType) params.set("approvalType", config.approvalType);
  if (config.sopDate) params.set("sopDate", config.sopDate);
  if (config.firstRegistrationDate) {
    params.set("firstRegistrationDate", config.firstRegistrationDate);
  }
  if (config.powertrain) params.set("powertrain", config.powertrain);
  if (config.automationLevel) params.set("automationLevel", config.automationLevel);
  if (config.aiLevel) params.set("aiLevel", config.aiLevel);
  if (config.targetCountries.length > 0) {
    params.set("targetCountries", config.targetCountries.join(","));
  }
  if (config.connectivity.length > 0) {
    params.set("connectivity", config.connectivity.join(","));
  }
  if (config.dataFlags.length > 0) {
    params.set("dataFlags", config.dataFlags.join(","));
  }
  if (config.motorwayAssistant) params.set("motorwayAssistant", "1");
  if (config.parkingAutomation) params.set("parkingAutomation", "1");
  if (config.readiness.csmsAvailable) {
    params.set("readiness.csmsAvailable", "1");
  }

  return params;
}

export function syncVehicleConfigToUrl(config: VehicleConfig) {
  if (typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  const nextParams = buildVehicleConfigSearchParams(config);

  syncedVehicleConfigKeys.forEach((key) => currentUrl.searchParams.delete(key));
  nextParams.forEach((value, key) => currentUrl.searchParams.set(key, value));

  const nextSearch = currentUrl.searchParams.toString();
  const nextUrl = `${currentUrl.pathname}${nextSearch ? `?${nextSearch}` : ""}`;

  window.history.replaceState({}, "", nextUrl);
}
