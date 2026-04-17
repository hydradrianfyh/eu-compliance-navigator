import type { ArtifactType, RuleDomain } from "@/shared/constants";

interface RuleClassification {
  domain: RuleDomain;
  artifact_type: ArtifactType;
}

export const ruleClassifications: Record<string, RuleClassification> = {
  // vehicle_approval
  "REG-TA-001": { domain: "type_approval_framework", artifact_type: "framework_regulation" },
  "REG-TA-002": { domain: "type_approval_framework", artifact_type: "framework_regulation" },
  "REG-TA-003": { domain: "type_approval_framework", artifact_type: "placeholder_gap" },

  // general_safety
  "REG-GSR-001": { domain: "vehicle_safety_active", artifact_type: "framework_regulation" },
  "REG-GSR-002": { domain: "vehicle_safety_active", artifact_type: "delegated_implementing_act" },
  "REG-GSR-003": { domain: "vehicle_safety_active", artifact_type: "delegated_implementing_act" },
  "REG-GSR-004": { domain: "vehicle_safety_active", artifact_type: "delegated_implementing_act" },
  "REG-GSR-005": { domain: "vehicle_safety_active", artifact_type: "delegated_implementing_act" },
  "REG-GSR-006": { domain: "vehicle_safety_active", artifact_type: "delegated_implementing_act" },

  // cybersecurity
  "REG-CS-001": { domain: "cybersecurity_software", artifact_type: "technical_requirement" },
  "REG-CS-002": { domain: "cybersecurity_software", artifact_type: "technical_requirement" },
  "REG-CS-003": { domain: "cybersecurity_software", artifact_type: "horizontal_obligation" },

  // dcas_automated
  "REG-AD-001": { domain: "automated_driving", artifact_type: "technical_requirement" },
  "REG-AD-002": { domain: "automated_driving", artifact_type: "technical_requirement" },
  "REG-AD-003": { domain: "automated_driving", artifact_type: "placeholder_gap" },

  // privacy_connected
  "REG-PV-001": { domain: "privacy_data", artifact_type: "horizontal_obligation" },
  "REG-PV-002": { domain: "privacy_data", artifact_type: "horizontal_obligation" },
  "REG-PV-003": { domain: "privacy_data", artifact_type: "guidance_standard" },

  // data_access
  "REG-DA-001": { domain: "privacy_data", artifact_type: "horizontal_obligation" },

  // ai_governance
  "REG-AI-001": { domain: "ai_ml", artifact_type: "horizontal_obligation" },
  "REG-AI-002": { domain: "ai_ml", artifact_type: "horizontal_obligation" },
  "REG-AI-003": { domain: "ai_ml", artifact_type: "horizontal_obligation" },
  "REG-AI-004": { domain: "ai_ml", artifact_type: "horizontal_obligation" },

  // materials_chemicals
  "REG-BAT-001": { domain: "materials_chemicals_circular", artifact_type: "horizontal_obligation" },
  "REG-BAT-002": { domain: "materials_chemicals_circular", artifact_type: "horizontal_obligation" },
  "REG-BAT-003": { domain: "materials_chemicals_circular", artifact_type: "placeholder_gap" },

  // emissions_co2
  "REG-EM-001": { domain: "emissions_environment", artifact_type: "framework_regulation" },
  "REG-EM-002": { domain: "emissions_environment", artifact_type: "framework_regulation" },
  "REG-EM-003": { domain: "emissions_environment", artifact_type: "horizontal_obligation" },
  "REG-EM-004": { domain: "emissions_environment", artifact_type: "delegated_implementing_act" },
  "REG-EM-005": { domain: "emissions_environment", artifact_type: "delegated_implementing_act" },

  // consumer_liability
  "REG-CL-001": { domain: "consumer_protection", artifact_type: "horizontal_obligation" },
  "REG-CL-002": { domain: "consumer_protection", artifact_type: "horizontal_obligation" },
  "REG-CL-003": { domain: "consumer_protection", artifact_type: "horizontal_obligation" },
  "REG-CL-004": { domain: "consumer_protection", artifact_type: "horizontal_obligation" },
  "REG-CL-005": { domain: "consumer_protection", artifact_type: "horizontal_obligation" },

  // insurance_registration
  "REG-INS-001": { domain: "insurance_registration_tax", artifact_type: "horizontal_obligation" },
  "REG-INS-002": { domain: "insurance_registration_tax", artifact_type: "horizontal_obligation" },
  "REG-INS-003": { domain: "insurance_registration_tax", artifact_type: "placeholder_gap" },

  // market_surveillance
  "REG-MS-001": { domain: "market_surveillance_enforcement", artifact_type: "framework_regulation" },
  "REG-MS-002": { domain: "market_surveillance_enforcement", artifact_type: "framework_regulation" },

  // import_customs
  "REG-IMP-001": { domain: "market_access_import", artifact_type: "framework_regulation" },
  "REG-IMP-002": { domain: "market_access_import", artifact_type: "framework_regulation" },
  "REG-IMP-003": { domain: "market_access_import", artifact_type: "horizontal_obligation" },

  // consumer_information
  "REG-CI-001": { domain: "consumer_information_labelling", artifact_type: "horizontal_obligation" },
  "REG-CI-002": { domain: "consumer_information_labelling", artifact_type: "horizontal_obligation" },
  "REG-CI-003": { domain: "consumer_information_labelling", artifact_type: "horizontal_obligation" },

  // non_eu_market
  "REG-UK-001": { domain: "non_eu_jurisdiction", artifact_type: "framework_regulation" },

  // UNECE technical (all 35 rules)
  "REG-UN-001": { domain: "type_approval_framework", artifact_type: "placeholder_gap" },
  "REG-UN-010": { domain: "emc", artifact_type: "technical_requirement" },
  "REG-UN-013": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-013H": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-014": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-016": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-017": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-021": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-025": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-034": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-043": { domain: "lighting_visibility", artifact_type: "technical_requirement" },
  "REG-UN-044": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-046": { domain: "lighting_visibility", artifact_type: "technical_requirement" },
  "REG-UN-048": { domain: "lighting_visibility", artifact_type: "technical_requirement" },
  "REG-UN-051": { domain: "noise", artifact_type: "technical_requirement" },
  "REG-UN-058": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-066": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-079": { domain: "vehicle_safety_active", artifact_type: "technical_requirement" },
  "REG-UN-083": { domain: "emissions_environment", artifact_type: "technical_requirement" },
  "REG-UN-094": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-095": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-100": { domain: "ev_battery_safety", artifact_type: "technical_requirement" },
  "REG-UN-110": { domain: "ev_battery_safety", artifact_type: "technical_requirement" },
  "REG-UN-118": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-127": { domain: "vehicle_safety_active", artifact_type: "technical_requirement" },
  "REG-UN-129": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-134": { domain: "ev_battery_safety", artifact_type: "technical_requirement" },
  "REG-UN-135": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-137": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-140": { domain: "vehicle_safety_active", artifact_type: "technical_requirement" },
  "REG-UN-141": { domain: "vehicle_safety_active", artifact_type: "technical_requirement" },
  "REG-UN-142": { domain: "vehicle_safety_active", artifact_type: "technical_requirement" },
  "REG-UN-145": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },
  "REG-UN-149": { domain: "lighting_visibility", artifact_type: "technical_requirement" },
  "REG-UN-153": { domain: "vehicle_safety_passive", artifact_type: "technical_requirement" },

  // member_state_overlay — workflow-based (9 countries × 5 workflows + CZ generic)
  ...Object.fromEntries(
    ["DE", "FR", "IT", "ES", "NL", "PL", "BE", "AT", "SE"].flatMap((cc) => [
      [`REG-MS-${cc}-001`, { domain: "member_state_national" as const, artifact_type: "national_overlay" as const }],
      [`REG-MS-${cc}-002`, { domain: "member_state_national" as const, artifact_type: "national_overlay" as const }],
      [`REG-MS-${cc}-003`, { domain: "insurance_registration_tax" as const, artifact_type: "national_overlay" as const }],
      [`REG-MS-${cc}-004`, { domain: "insurance_registration_tax" as const, artifact_type: "national_overlay" as const }],
      [`REG-MS-${cc}-005`, { domain: "member_state_national" as const, artifact_type: "national_overlay" as const }],
    ]),
  ),
  "REG-MS-CZ-001": { domain: "member_state_national", artifact_type: "national_overlay" },

  // Phase 8 gap-fill rules
  "REG-MS-003": { domain: "market_surveillance_enforcement", artifact_type: "framework_regulation" },
  "REG-IMP-004": { domain: "market_access_import", artifact_type: "framework_regulation" },
  "REG-IMP-005": { domain: "market_access_import", artifact_type: "framework_regulation" },
  "REG-BAT-004": { domain: "materials_chemicals_circular", artifact_type: "horizontal_obligation" },
  "REG-BAT-005": { domain: "materials_chemicals_circular", artifact_type: "horizontal_obligation" },
  "REG-BAT-006": { domain: "materials_chemicals_circular", artifact_type: "horizontal_obligation" },
  "REG-BAT-007": { domain: "materials_chemicals_circular", artifact_type: "horizontal_obligation" },
  "REG-CL-006": { domain: "consumer_protection", artifact_type: "horizontal_obligation" },
};
