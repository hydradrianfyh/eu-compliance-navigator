import type { VehicleConfig } from "@/config/schema";

export function diffVehicleConfigs(base: VehicleConfig, candidate: VehicleConfig) {
  return Object.entries(candidate).filter(([key, value]) => {
    return JSON.stringify(base[key as keyof VehicleConfig]) !== JSON.stringify(value);
  });
}
