import { makeSeedRule } from "@/registry/seed/shared";

export const nonEuMarketRules = [
  makeSeedRule({
    stable_id: "REG-UK-001",
    title: "UK Automated Vehicles Act 2024",
    short_label: "UK AV Act",
    legal_family: "non_eu_market",
    jurisdiction: "UK",
    jurisdiction_level: "NON_EU_MARKET",
    framework_group: ["MN"],
    sources: [
      {
        label: "UK primary legislation",
        source_family: "UK Parliament" as const,
        reference: "Automated Vehicles Act 2024 (c. 10)",
        official_url: "https://www.legislation.gov.uk/ukpga/2024/10/contents",
        oj_reference: null,
        authoritative_reference: "UKPGA/2024/10",
        last_verified_on: "2026-04-17",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-17",
    promoted_by: "phase-11b2-batch2",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "UK" },
        { field: "isL3Plus", operator: "is_true", value: true },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2024-05-20",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2024-05-20",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Primary legislation enacted 20 May 2024. Secondary legislation (authorisation procedures, NUIC/user-in-charge duties, reporting) still being consulted on by DfT — monitor 2025-2026 SIs for operational gates.",
    },
    obligation_text:
      "Authorisation of self-driving vehicles in Great Britain requires an Authorisation Certificate under Part 1; ASDEs and licensed no-user-in-charge (NUIC) operators carry ongoing duties including reporting and statement of safety principles compliance.",
    evidence_tasks: [
      "Self-driving feature safety case",
      "Authorisation Certificate application pack",
      "Statement of Safety Principles compliance evidence",
      "In-use reporting and incident-response procedure",
      "NUIC operator licence documentation (where applicable)",
    ],
    owner_hint: "regulatory_affairs",
    planning_lead_time_months: 24,
    ui_package: "market_access",
    process_stage: "pre_ta",
  }),
];
