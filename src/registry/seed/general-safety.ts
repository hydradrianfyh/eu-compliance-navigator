import { makeSeedRule, makeSource } from "@/registry/seed/shared";

const gsrFeatureIds = [
  ["REG-GSR-002", "Intelligent Speed Assistance", "ISA"],
  ["REG-GSR-003", "Event Data Recorder", "EDR"],
  ["REG-GSR-004", "Driver Monitoring / Drowsiness", "DMS/DDW"],
  ["REG-GSR-005", "Advanced Emergency Braking", "AEB"],
  ["REG-GSR-006", "Tyre Pressure Monitoring", "TPMS"],
] as const;

export const generalSafetyRules = [
  makeSeedRule({
    stable_id: "REG-GSR-001",
    title: "General Safety Regulation 2",
    short_label: "GSR2 (2019/2144)",
    legal_family: "general_safety",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Framework regulation",
        source_family: "EUR-Lex" as const,
        reference: "Regulation (EU) 2019/2144",
        official_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32019R2144",
        oj_reference: "OJ L 325, 16.12.2019",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2020-01-05",
      applies_to_new_types_from: "2022-07-06",
      applies_to_all_new_vehicles_from: "2024-07-07",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Individual features have different phase-in dates per delegated acts.",
    },
    obligation_text:
      "Mandates advanced safety features for M and N category vehicles. Specific system requirements are in delegated acts with individual phase-in dates.",
    owner_hint: "safety_engineering",
    ui_package: "wvta_core",
    process_stage: "type_approval",
  }),
  ...gsrFeatureIds.map(([stable_id, title, short_label]) =>
    makeSeedRule({
      stable_id,
      title,
      short_label,
      legal_family: "general_safety",
      jurisdiction: "EU",
      jurisdiction_level: "EU",
      framework_group: ["MN"],
      sources: [
        makeSource(
          "Delegated act to be verified",
          "Commission legal act",
          `${title} delegated act`,
        ),
      ],
      lifecycle_state: "SEED_UNVERIFIED",
      trigger_logic: {
        mode: "declarative",
        match_mode: "all",
        conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }],
        fallback_if_missing: "unknown",
      },
      obligation_text: `${title} mandatory feature trigger and exact delegated-act dates still require verification.`,
      owner_hint: "safety_engineering",
      manual_review_reason:
        "Exact delegated act reference and per-feature phase-in dates need verification.",
      ui_package: "wvta_core",
      process_stage: "type_approval",
    }),
  ),
];
