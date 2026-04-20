/**
 * Setup progress logic — pure functions that assess which sections of a
 * VehicleConfig are complete. Extracted from UI so the SetupProgress
 * component and Phase B unit tests share the same source of truth.
 *
 * A section is "complete" iff every required field is non-empty. Optional
 * and Advanced sections are never counted as required.
 *
 * © Yanhao FU
 */

import type { VehicleConfig } from "@/config/schema";

export type SetupSectionId =
  | "program_market"
  | "homologation_basis"
  | "propulsion_energy"
  | "adas_automated"
  | "digital_cockpit"
  | "readiness";

export interface SetupSectionDescriptor {
  id: SetupSectionId;
  label: string;
  /** Only the sections listed here contribute to the "required" count. */
  required: boolean;
}

export const SETUP_SECTIONS: readonly SetupSectionDescriptor[] = [
  {
    id: "program_market",
    label: "Program & Market",
    required: true,
  },
  {
    id: "homologation_basis",
    label: "Homologation Basis",
    required: true,
  },
  {
    id: "propulsion_energy",
    label: "Propulsion & Energy",
    required: true,
  },
  {
    id: "adas_automated",
    label: "ADAS & Automated Driving",
    required: true,
  },
  {
    id: "digital_cockpit",
    label: "Digital & Cockpit",
    required: false,
  },
  {
    id: "readiness",
    label: "Readiness",
    required: false,
  },
];

export interface SectionState {
  id: SetupSectionId;
  label: string;
  required: boolean;
  complete: boolean;
  missingFields: string[];
}

function isNonEmptyString(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function evaluateSetupSection(
  section: SetupSectionDescriptor,
  config: VehicleConfig,
): SectionState {
  const missingFields: string[] = [];

  switch (section.id) {
    case "program_market": {
      if (!isNonEmptyString(config.projectName)) missingFields.push("projectName");
      if (config.targetCountries.length === 0)
        missingFields.push("targetCountries");
      if (!isNonEmptyString(config.sopDate)) missingFields.push("sopDate");
      break;
    }
    case "homologation_basis": {
      if (config.frameworkGroup === null) missingFields.push("frameworkGroup");
      if (!isNonEmptyString(config.vehicleCategory))
        missingFields.push("vehicleCategory");
      // approvalType has a default, always set, so skip
      break;
    }
    case "propulsion_energy": {
      if (config.powertrain === null) missingFields.push("powertrain");
      break;
    }
    case "adas_automated": {
      // automationLevel always has a default ("none"); no hard-required field
      // beyond the default. So this section is complete by default.
      break;
    }
    case "digital_cockpit": {
      // Not required — user opts in.
      break;
    }
    case "readiness": {
      // Not required — user opts in.
      break;
    }
  }

  return {
    id: section.id,
    label: section.label,
    required: section.required,
    complete: missingFields.length === 0,
    missingFields,
  };
}

export interface SetupProgressReport {
  sections: SectionState[];
  requiredTotal: number;
  requiredComplete: number;
  percentage: number;
}

export function buildSetupProgressReport(
  config: VehicleConfig,
): SetupProgressReport {
  const sections = SETUP_SECTIONS.map((section) =>
    evaluateSetupSection(section, config),
  );

  const required = sections.filter((s) => s.required);
  const requiredTotal = required.length;
  const requiredComplete = required.filter((s) => s.complete).length;
  const percentage =
    requiredTotal === 0 ? 100 : Math.round((requiredComplete / requiredTotal) * 100);

  return { sections, requiredTotal, requiredComplete, percentage };
}
