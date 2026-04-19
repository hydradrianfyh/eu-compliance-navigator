import { makeSeedRule } from "@/registry/seed/shared";

/**
 * Sprint 6 DE-depth fix: each GSR2 delegated act is now a standalone
 * ACTIVE rule with its own CELEX / UNECE reference, verified temporal
 * dates, and a content_provenance record. Previously all 5 rules shared
 * a generic "Delegated act to be verified" source which read as a bug
 * in the 2026-04 pilot PDF. Dates cross-checked against the golden
 * dataset (content/golden-dataset.json).
 */
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
        official_url: "https://eur-lex.europa.eu/eli/reg/2019/2144/oj",
        oj_reference: "OJ L 325, 16.12.2019",
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is MN" }],
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
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [
      { rule_id: "REG-GSR-002", relation: "complements" },
      { rule_id: "REG-GSR-003", relation: "complements" },
      { rule_id: "REG-GSR-004", relation: "complements" },
      { rule_id: "REG-GSR-005", relation: "complements" },
      { rule_id: "REG-GSR-006", relation: "complements" },
    ],
  }),

  // GSR2 delegated act: Intelligent Speed Assistance (ISA)
  makeSeedRule({
    stable_id: "REG-GSR-002",
    title: "GSR2 Intelligent Speed Assistance (ISA)",
    short_label: "ISA (2021/1958)",
    legal_family: "general_safety",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Implementing regulation",
        source_family: "EUR-Lex" as const,
        reference: "Commission Implementing Regulation (EU) 2021/1958",
        official_url: "https://eur-lex.europa.eu/eli/reg_impl/2021/1958/oj",
        oj_reference: "OJ L 409, 17.11.2021",
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is MN" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2021-12-07",
      applies_to_new_types_from: "2022-07-06",
      applies_to_all_new_vehicles_from: "2024-07-07",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes: null,
    },
    obligation_text:
      "ISA must be fitted on M and N category vehicles per GSR2 Art. 6(2)(a). Test protocol per 2021/1958 Annex I.",
    evidence_tasks: [
      "ISA type-approval test report",
      "ISA warning logic validation",
      "Override behaviour test evidence",
    ],
    owner_hint: "safety_engineering",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-GSR-001", relation: "requires" }],
  }),

  // GSR2 delegated act: Event Data Recorder (EDR)
  makeSeedRule({
    stable_id: "REG-GSR-003",
    title: "GSR2 Event Data Recorder (EDR)",
    short_label: "EDR (2022/545)",
    legal_family: "general_safety",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Delegated regulation",
        source_family: "EUR-Lex" as const,
        reference: "Commission Delegated Regulation (EU) 2022/545",
        official_url: "https://eur-lex.europa.eu/eli/reg_del/2022/545/oj",
        oj_reference: "OJ L 107, 6.4.2022",
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is MN" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2022-04-26",
      applies_to_new_types_from: "2022-07-06",
      applies_to_all_new_vehicles_from: "2024-07-07",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "EDR captures a 30-second window around crash events (pre + post).",
    },
    obligation_text:
      "EDR must log a prescribed parameter set per 2022/545 Annex III around crash events for M1/N1 vehicles.",
    evidence_tasks: ["EDR parameter log validation", "Tamper-resistance test report"],
    owner_hint: "safety_engineering",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-GSR-001", relation: "requires" }],
  }),

  // GSR2 delegated act: Driver Drowsiness and Attention Warning (DDAW)
  makeSeedRule({
    stable_id: "REG-GSR-004",
    title: "GSR2 Driver Drowsiness and Attention Warning (DDAW)",
    short_label: "DDAW (2021/1341)",
    legal_family: "general_safety",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Delegated regulation",
        source_family: "EUR-Lex" as const,
        reference: "Commission Delegated Regulation (EU) 2021/1341",
        official_url: "https://eur-lex.europa.eu/eli/reg_del/2021/1341/oj",
        oj_reference: "OJ L 292, 16.8.2021",
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is MN" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2021-09-05",
      applies_to_new_types_from: "2022-07-06",
      applies_to_all_new_vehicles_from: "2024-07-07",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "DDAW does NOT require driver monitoring by camera; steering-sensor or lane-sensor drift detection also qualifies.",
    },
    obligation_text:
      "DDAW must alert the driver when reduced attention is detected, per 2021/1341 Annex I test protocol.",
    evidence_tasks: ["DDAW test report", "Alert escalation logic validation"],
    owner_hint: "safety_engineering",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-GSR-001", relation: "requires" }],
  }),

  // GSR2 delegated act: Advanced Emergency Braking System (AEBS)
  makeSeedRule({
    stable_id: "REG-GSR-005",
    title: "GSR2 Advanced Emergency Braking System (AEBS)",
    short_label: "AEBS (2021/1243)",
    legal_family: "general_safety",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      {
        label: "Implementing regulation",
        source_family: "EUR-Lex" as const,
        reference: "Commission Implementing Regulation (EU) 2021/1243",
        official_url: "https://eur-lex.europa.eu/eli/reg_impl/2021/1243/oj",
        oj_reference: "OJ L 272, 30.7.2021",
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is MN" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2021-08-19",
      applies_to_new_types_from: "2022-07-06",
      applies_to_all_new_vehicles_from: "2024-07-07",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Covers vehicle-to-vehicle and vehicle-to-pedestrian/cyclist scenarios.",
    },
    obligation_text:
      "AEBS must autonomously brake to avoid or mitigate collision with stopped, moving, crossing, and turning targets per 2021/1243 Annex II test scenarios.",
    evidence_tasks: ["AEBS vehicle-target test report", "AEBS pedestrian test report", "AEBS cyclist test report"],
    owner_hint: "safety_engineering",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-GSR-001", relation: "requires" }],
  }),

  // GSR2 delegated act: Tyre Pressure Monitoring System (TPMS)
  makeSeedRule({
    stable_id: "REG-GSR-006",
    title: "GSR2 Tyre Pressure Monitoring System (TPMS)",
    short_label: "TPMS (UN R141)",
    legal_family: "general_safety",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN"],
    sources: [
      {
        label: "UNECE regulation",
        source_family: "UNECE" as const,
        reference: "UNECE Regulation No. 141",
        official_url: "https://unece.org/transport/vehicle-regulations/un-regulation-no-141",
        oj_reference: null,
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is MN" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: null,
      applies_to_new_types_from: "2022-07-06",
      applies_to_all_new_vehicles_from: "2024-07-07",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "GSR2 references UN R141 for TPMS requirements; direct or indirect systems both acceptable.",
    },
    obligation_text:
      "TPMS must warn driver of tyre underinflation per UN R141 detection thresholds and accuracy.",
    evidence_tasks: ["TPMS detection accuracy test", "Warning lamp activation validation"],
    owner_hint: "safety_engineering",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "unece",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-GSR-001", relation: "requires" }],
  }),
];
