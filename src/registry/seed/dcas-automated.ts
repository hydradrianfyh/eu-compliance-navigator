import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const dcasAutomatedRules = [
  makeSeedRule({
    stable_id: "REG-AD-001",
    title: "Automated Lane Keeping System",
    short_label: "R157 ALKS",
    legal_family: "dcas_automated",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN"],
    sources: [makeSource("UNECE regulation", "UNECE", "UNECE Regulation No. 157")],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "frameworkGroup", operator: "eq", value: "MN" },
        { field: "isL3Plus", operator: "is_true", value: true },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: null,
      applies_to_new_types_from: "2023-01-01",
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "R157 amendments (speed limit, lane change) need tracking.",
    },
    obligation_text:
      "ALKS system must be type-approved per R157 including dynamic driving task, minimal risk condition, HMI, and DSSAD.",
    evidence_tasks: [
      "ALKS system specification",
      "ODD definition",
      "MRC strategy",
      "DSSAD specification",
      "R157 test reports",
      "ALKS type-approval certificate",
    ],
    owner_hint: "safety_engineering",
    planning_lead_time_months: 36,
    ui_package: "horizontal",
    process_stage: "type_approval",
    prerequisite_standards: [
      "ISO 26262 (functional safety — ASIL D for driving functions)",
      "ISO 21448 (SOTIF — safety of the intended functionality)",
    ],
    related_rules: [
      { rule_id: "REG-UN-079", relation: "requires" },
      { rule_id: "REG-CS-001", relation: "requires" },
    ],
  }),
  makeSeedRule({
    stable_id: "REG-AD-002",
    title: "Driver Control Assistance Systems",
    short_label: "UN R171 DCAS",
    legal_family: "dcas_automated",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN"],
    sources: [
      makeSource(
        "UN Regulation",
        "UNECE",
        "UN Regulation No. 171",
        "OJ L, 2024/2689, 4 November 2024",
      ),
      makeSource(
        "EU transposition into GSR2",
        "EUR-Lex",
        "Commission Delegated Regulation (EU) 2025/1122",
        "OJ L, 2025/1122, 12 August 2025",
      ),
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "custom",
      evaluator_id: "dcas_if_fitted",
      description:
        "Returns applicability when sustained lateral and longitudinal control capability is fitted.",
    },
    temporal: {
      entry_into_force: "2025-09-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2025-09-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "'If fitted' basis — no mandatory fitment. Single application date; no separate phase-in.",
    },
    obligation_text:
      "Where a vehicle is equipped with a DCAS-type system, that system must be type-approved per UN Regulation No. 171.",
    evidence_tasks: [
      "UN R171 type-approval application",
      "DCAS system specification",
      "Driver engagement monitoring documentation",
      "Transition demand documentation",
      "R171 test reports",
    ],
    exclusions: [
      "Vehicles without DCAS-type systems",
      "Systems with only lateral or only longitudinal control",
    ],
    owner_hint: "safety_engineering",
    planning_lead_time_months: 18,
    manual_review_required: true,
    manual_review_reason:
      'EUR-Lex URL verification pending. "If fitted" trigger requires system-level validation.',
    notes:
      'DCAS = Driver Control Assistance Systems. Do not rename it to "Dynamically Commanded Assistive Driving System."',
    ui_package: "horizontal",
    process_stage: "type_approval",
  }),
  makeSeedRule({
    stable_id: "REG-AD-003",
    title: "EU L4/Driverless Framework",
    short_label: "EU L4",
    legal_family: "dcas_automated",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [makeSource("Monitoring item", "Commission guidance", "Future EU L4 framework")],
    lifecycle_state: "PLACEHOLDER",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "PLACEHOLDER — no EU-level regulation for fully driverless vehicles adopted.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "pre_ta",
  }),
];
