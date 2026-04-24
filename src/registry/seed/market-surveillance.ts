import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const marketSurveillanceRules = [
  makeSeedRule({
    stable_id: "REG-MS-001",
    title: "Market Surveillance Regulation",
    short_label: "MSR (2019/1020)",
    legal_family: "market_surveillance",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2019/1020 on market surveillance and compliance of products",
        "OJ L 169, 25.6.2019",
      ),
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "targetsEU", operator: "is_true", value: true }],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "Economic operators placing products on the EU market must comply with market surveillance obligations including traceability, corrective measures, and cooperation with authorities.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-MS-002",
    title: "Economic Operator Obligations under 2018/858",
    short_label: "Economic Operator (TA)",
    legal_family: "market_surveillance",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "O"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2018/858, Chapter XII",
        "OJ L 151, 14.6.2018",
      ),
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [
        { field: "frameworkGroup", operator: "in", value: ["MN", "O"] },
      ],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "Manufacturers, importers, and distributors have specific obligations for vehicles placed on the EU market including recall procedures, compliance verification, and authority notification.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-MS-003",
    title: "Vehicle Recall Notification and Execution",
    short_label: "Recall (2018/858)",
    legal_family: "market_surveillance",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Framework regulation",
        source_family: "EUR-Lex" as const,
        reference:
          "Regulation (EU) 2018/858, Articles 52-53 (non-compliance and corrective measures, including recall procedures)",
        official_url: "https://eur-lex.europa.eu/eli/reg/2018/858/oj",
        oj_reference: "OJ L 151, 14.6.2018, p. 1",
        authoritative_reference: "CELEX:32018R0858",
        last_verified_on: "2026-04-24",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-24",
    promoted_by: "phase-m.2.b",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "targetsEU", operator: "is_true", value: true, label: "Vehicle targets EU market" }],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2018-09-01",
      applies_to_new_types_from: "2020-09-01",
      applies_to_all_new_vehicles_from: "2022-09-01",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Manufacturer recall obligation tied to the WVTA framework (2018/858 Art 52-53). National approval authorities lead the compliance action; Commission is notified for cross-border impact. Safety Gate / RAPEX system used for serious-risk consumer-safety recalls.",
    },
    obligation_text:
      "When a vehicle, system, component or separate technical unit is found not to conform with type-approval or poses a serious risk, the manufacturer must (a) notify the approval authority that granted type-approval, (b) take all corrective measures necessary to bring the products into conformity, withdraw them from the market or recall them, (c) inform owners and fleet operators of the defect and remedy free of charge, (d) cooperate with market-surveillance and customs authorities.",
    evidence_tasks: [
      "Written recall notification to the lead national approval authority",
      "Corrective-action plan with scope, remedy, timeline and cost responsibility",
      "Owner-notification records (letter / email / app push)",
      "Post-remedy verification reports and closure notice to authority",
      "Safety Gate / RAPEX notification where serious-risk applies",
    ],
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-24",
      human_reviewer: "yanhao",
    },
    related_rules: [
      { rule_id: "REG-TA-001", relation: "requires" },
      { rule_id: "REG-CL-001", relation: "complements" },
    ],
  }),
];
