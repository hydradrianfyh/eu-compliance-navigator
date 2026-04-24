import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const consumerLiabilityRules = [
  makeSeedRule({
    stable_id: "REG-CL-001",
    title: "Product Liability Directive (revised)",
    short_label: "PLD (2024/2853)",
    legal_family: "consumer_liability",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Directive",
        source_family: "EUR-Lex" as const,
        reference: "Directive (EU) 2024/2853 on liability for defective products",
        official_url: "https://eur-lex.europa.eu/eli/dir/2024/2853/oj",
        oj_reference: "OJ L, 2024/2853, 18 November 2024",
        authoritative_reference: "CELEX:32024L2853",
        last_verified_on: "2026-04-17",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      // UX-004 fix: PLD applies to every product placed on the EU market,
      // so the trigger is `targetsEU is_true`. Previously conditions was
      // an empty array, which produced an empty "Why it applies" list in
      // the RuleCardV2 UI (observed in the 2026-04 pilot PDF).
      mode: "declarative",
      match_mode: "all",
      conditions: [
        {
          field: "targetsEU",
          operator: "is_true",
          value: true,
          label: "Market includes at least one EU country",
        },
      ],
      fallback_if_missing: "not_applicable",
      conditional_reason:
        "Product liability applies to all products placed on the EU market. Feature-level implications (software updates, AI components, cybersecurity) still require legal review.",
    },
    temporal: {
      entry_into_force: "2024-12-08",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2026-12-09",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Directive requires member-state transposition by 9 December 2026. Repeals Directive 85/374/EEC; old directive continues to apply to products placed on the market before that date.",
    },
    obligation_text:
      "Manufacturer liability extends to software, AI systems, and cybersecurity-related defects under the revised PLD. Disclosure obligations for technical documentation in litigation.",
    evidence_tasks: [
      "Product safety documentation",
      "Defect reporting mechanisms",
      "Software update and cybersecurity lifecycle documentation",
      "Insurance / risk assessment",
      "Member-state transposition monitoring",
    ],
    owner_hint: "legal",
    planning_lead_time_months: 18,
    ui_package: "horizontal",
    process_stage: "post_market",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-17",
      human_reviewer: "yanhao",
    },
    prerequisite_standards: ["ISO 26262 (FuSa)", "ISO/SAE 21434 (Cyber)"],
  }),
  makeSeedRule({
    stable_id: "REG-CL-002",
    title: "General Product Safety Regulation",
    short_label: "GPSR",
    legal_family: "consumer_liability",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Framework regulation",
        source_family: "EUR-Lex" as const,
        reference: "Regulation (EU) 2023/988 on general product safety",
        official_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R0988",
        oj_reference: "OJ L 135, 23.5.2023, p. 1",
        authoritative_reference: "CELEX:32023R0988",
        last_verified_on: "2026-04-24",
      },
    ],
    lifecycle_state: "DRAFT",
    // Phase M.0.2 — audit 2026-04-23 finding:
    // Previous `conditions: []` + empty temporal evaluated to UNKNOWN today,
    // but was a latent over-broad-applicability bug — if a future author
    // populated temporal without scope, match_mode:"all" over [] evaluates
    // as satisfied and the rule would match every EU-market vehicle. Fix
    // order is scope conditions BEFORE any temporal authoring.
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        {
          field: "targetsEU",
          operator: "is_true",
          value: true,
          label: "Placed on EU market",
        },
        {
          field: "salesModel",
          operator: "in",
          value: ["direct", "dealer", "leasing", "subscription", "mixed"],
          label: "Consumer-facing sales channel (not pure fleet)",
        },
      ],
      fallback_if_missing: "unknown",
      conditional_reason:
        "GPSR applies to products placed on the EU market for consumer use. Type-approved vehicles as a whole are largely out of GPSR scope (Article 2 — covered by 2018/858), but aftermarket parts, accessories, and consumer-facing digital components may still fall under GPSR. Legal review required per-feature.",
    },
    obligation_text:
      "GPSR sets general safety obligations for products placed on the EU market for consumer use. Type-approved vehicles are largely out of scope per Article 2 (covered by Regulation (EU) 2018/858), but aftermarket parts, accessories, infotainment add-ons, and consumer-facing digital components may still fall under GPSR's traceability, risk-assessment, and market-surveillance obligations.",
    owner_hint: "legal",
    manual_review_reason:
      "Per-feature applicability to aftermarket parts, accessories, and digital add-ons still needs legal review before promotion to ACTIVE.",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-CL-003",
    title: "Sale of Goods Directive",
    short_label: "Sale of Goods",
    legal_family: "consumer_liability",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Directive",
        source_family: "EUR-Lex" as const,
        reference: "Directive (EU) 2019/771 on certain aspects concerning contracts for the sale of goods",
        official_url: "https://eur-lex.europa.eu/eli/dir/2019/771/oj",
        oj_reference: "OJ L 136, 22.5.2019, p. 28",
        authoritative_reference: "CELEX:32019L0771",
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
        {
          field: "salesModel",
          operator: "in",
          value: ["direct", "dealer", "leasing", "subscription", "mixed"],
        },
      ],
      fallback_if_missing: "unknown",
      conditional_reason:
        "Consumer sales trigger conformity and remedy obligations under Sale of Goods Directive as transposed.",
    },
    temporal: {
      entry_into_force: "2019-06-11",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2022-01-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Member-state transposition deadline: 1 July 2021; applies to contracts from 1 January 2022.",
    },
    obligation_text:
      "Conformity requirements and consumer remedies apply to consumer sales contracts for goods with digital elements, including continuous update obligations (Art. 7(3)).",
    owner_hint: "legal",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-CL-004",
    title: "Digital Content and Services Directive",
    short_label: "Digital Content (2019/770)",
    legal_family: "consumer_liability",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [makeSource("Directive", "EUR-Lex", "Directive (EU) 2019/770")],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "hasConnectedServices", operator: "is_true", value: true },
      ],
      fallback_if_missing: "not_applicable",
    },
    obligation_text:
      "Connected vehicle digital services must meet conformity requirements including continued update obligations for the contract duration.",
    owner_hint: "legal",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-CL-005",
    title: "Legal Guarantee and Commercial Warranty Obligations",
    short_label: "Warranty / Guarantee",
    legal_family: "consumer_liability",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Directive",
        "EUR-Lex",
        "Directive (EU) 2019/771, Articles 10-17 (legal guarantee)",
      ),
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        {
          field: "salesModel",
          operator: "in",
          value: ["direct", "dealer", "leasing", "subscription", "mixed"],
        },
      ],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "Minimum 2-year legal guarantee for consumer goods. For vehicles with digital elements, guarantee covers updates necessary to maintain conformity.",
    owner_hint: "aftersales",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-CL-006",
    title: "Consumer Rights for Distance / Online Vehicle Sales",
    short_label: "Distance Sales (2011/83)",
    legal_family: "consumer_liability",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Directive",
        "EUR-Lex",
        "Directive 2011/83/EU on consumer rights (distance and off-premises contracts)",
      ),
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [
        { field: "salesModel", operator: "in", value: ["direct", "subscription"] },
      ],
      fallback_if_missing: "unknown",
      conditional_reason: "Direct-to-consumer and subscription models may trigger distance-sales obligations.",
    },
    obligation_text:
      "Vehicles sold via distance/online channels may trigger pre-contractual information, right of withdrawal (14 days), and delivery conformity obligations.",
    owner_hint: "legal",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
];
