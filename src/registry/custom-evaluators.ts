import type { EngineConfig } from "@/config/schema";
import type { TriggerResult } from "@/engine/types";

export type CustomEvaluator = (config: EngineConfig) => TriggerResult;

export const customEvaluators: Record<string, CustomEvaluator> = {
  dcas_if_fitted(config) {
    if (!config.frameworkGroup) {
      return {
        match: false,
        reason: "frameworkGroup is missing.",
        matched_conditions: [],
        unmatched_conditions: ["frameworkGroup present"],
      };
    }

    if (config.frameworkGroup !== "MN") {
      return {
        match: false,
        reason: "DCAS rule applies only to MN framework vehicles.",
        matched_conditions: [],
        unmatched_conditions: ["MN framework vehicle"],
      };
    }

    if (!["l2plus", "l3", "l4", "l4_driverless"].includes(config.automationLevel)) {
      return {
        match: false,
        reason: "Vehicle does not expose a DCAS-capable automation level.",
        matched_conditions: ["MN framework vehicle"],
        unmatched_conditions: ["Sustained lateral and longitudinal control capability"],
      };
    }

    if (config.motorwayAssistant) {
      return {
        match: true,
        reason: "Motorway assistant indicates a DCAS-type sustained control system.",
        matched_conditions: [
          "MN framework vehicle",
          "Automation level is l2plus or above",
          "Motorway assistant fitted",
        ],
        unmatched_conditions: [],
      };
    }

    if (config.parkingAutomation) {
      return {
        match: "conditional",
        reason:
          "Parking automation is present, but system-level sustained control evidence still requires manual confirmation.",
        matched_conditions: [
          "MN framework vehicle",
          "Automation level is l2plus or above",
          "Parking automation fitted",
        ],
        unmatched_conditions: [],
      };
    }

    return {
      match: "conditional",
      reason:
        "Automation level suggests possible DCAS capability, but fitted-system details are ambiguous.",
      matched_conditions: [
        "MN framework vehicle",
        "Automation level is l2plus or above",
      ],
      unmatched_conditions: ["Concrete fitted DCAS feature evidence"],
    };
  },
};
