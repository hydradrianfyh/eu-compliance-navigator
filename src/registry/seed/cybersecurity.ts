import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const cybersecurityRules = [
  makeSeedRule({
    stable_id: "REG-CS-001",
    title: "Cybersecurity Management System",
    short_label: "R155 CSMS",
    legal_family: "cybersecurity",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN"],
    sources: [
      {
        label: "UNECE regulation",
        source_family: "UNECE" as const,
        reference: "UNECE Regulation No. 155",
        official_url: "https://unece.org/transport/documents/2021/03/standards/un-regulation-no-155-cyber-security-and-cyber-security",
        oj_reference: null,
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
      entry_into_force: null,
      applies_to_new_types_from: "2022-07-01",
      applies_to_all_new_vehicles_from: "2024-07-01",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes: null,
    },
    obligation_text:
      "Manufacturer must obtain CSMS certificate and vehicle type-approval for cybersecurity.",
    owner_hint: "cybersecurity",
    planning_lead_time_months: 24,
    ui_package: "horizontal",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "unece",
      retrieved_at: "2026-04-16",
      human_reviewer: "yanhao",
    },
    prerequisite_standards: ["ISO/SAE 21434 (Road vehicles — Cybersecurity engineering)"],
    related_rules: [
      { rule_id: "REG-CS-002", relation: "complements" },
      { rule_id: "REG-AD-001", relation: "requires" },
    ],
  }),
  makeSeedRule({
    stable_id: "REG-CS-002",
    title: "Software Update Management System",
    short_label: "R156 SUMS",
    legal_family: "cybersecurity",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN"],
    sources: [
      {
        label: "UNECE regulation",
        source_family: "UNECE" as const,
        reference: "UNECE Regulation No. 156",
        official_url: "https://unece.org/transport/documents/2021/03/standards/un-regulation-no-156-software-update-and-software-update",
        oj_reference: null,
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
      entry_into_force: null,
      applies_to_new_types_from: "2022-07-01",
      applies_to_all_new_vehicles_from: "2024-07-01",
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes: null,
    },
    obligation_text:
      "Manufacturer must establish SUMS and obtain type-approval for software update processes, including OTA where applicable.",
    owner_hint: "software_ota",
    ui_package: "horizontal",
    process_stage: "type_approval",
    prerequisite_standards: [
      "ISO 24089 (Road vehicles — Software update engineering)",
    ],
    related_rules: [{ rule_id: "REG-CS-001", relation: "complements" }],
  }),
  makeSeedRule({
    stable_id: "REG-CS-003",
    title: "Cyber Resilience Act",
    short_label: "CRA",
    legal_family: "cybersecurity",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2024/2847",
      ),
    ],
    lifecycle_state: "DRAFT",
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [{ field: "hasConnectedServices", operator: "is_true", value: true }],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "CRA applicability to type-approved vehicles remains under review and must not be treated as verified.",
    owner_hint: "cybersecurity",
    manual_review_reason:
      "CRA exclusion scope for type-approved vehicles needs verification.",
    ui_package: "horizontal",
    process_stage: "pre_ta",
  }),

  // Phase M.1 — RED cybersecurity / privacy / fraud-protection (Dir 2014/53 + Del Reg 2022/30 + EN 18031)
  makeSeedRule({
    stable_id: "REG-CS-004",
    title:
      "Radio Equipment Directive — cybersecurity, privacy, and fraud-protection essential requirements",
    short_label: "RED cyber (2014/53 + 2022/30)",
    legal_family: "cybersecurity",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Directive (base)",
        source_family: "EUR-Lex" as const,
        reference:
          "Directive 2014/53/EU on the harmonisation of the laws of the Member States relating to the making available on the market of radio equipment, repealing Directive 1999/5/EC",
        official_url: "https://eur-lex.europa.eu/eli/dir/2014/53/oj",
        oj_reference: "OJ L 153, 22.5.2014, p. 62",
        authoritative_reference: "CELEX:32014L0053",
        last_verified_on: "2026-04-24",
      },
      {
        label: "Delegated regulation (cybersecurity / privacy / fraud-protection)",
        source_family: "EUR-Lex" as const,
        reference:
          "Commission Delegated Regulation (EU) 2022/30 supplementing Dir 2014/53/EU as regards the application of the essential requirements referred to in Article 3(3), points (d), (e) and (f)",
        official_url: "https://eur-lex.europa.eu/eli/reg_del/2022/30/oj",
        oj_reference: "OJ L 7, 12.1.2022, p. 6",
        authoritative_reference: "CELEX:32022R0030",
        last_verified_on: "2026-04-24",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-24",
    promoted_by: "phase-m.1",
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [
        {
          field: "connectivity",
          operator: "includes_any",
          value: ["telematics", "remote_control", "ota", "mobile_app"],
          label: "Vehicle contains internet-connected radio equipment",
        },
      ],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2014-06-11",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2025-08-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Del Reg 2022/30 cybersecurity, privacy and fraud-protection essential requirements (Art 3(3) d/e/f) became mandatory for internet-connected radio equipment placed on the EU market from 1 August 2025 (applicability date extended from 1 August 2024). Base RED has applied to radio equipment generally since 13 June 2016.",
    },
    obligation_text:
      "Radio equipment in the vehicle that can communicate over the internet (telematics modules, Wi-Fi/Bluetooth units, cellular modems) must comply with the cybersecurity (Art 3(3)(d)), privacy (Art 3(3)(e)) and fraud-protection (Art 3(3)(f)) essential requirements of RED as activated by Del Reg (EU) 2022/30. Conformity may be demonstrated against harmonised standards EN 18031-1 / -2 / -3:2024.",
    evidence_tasks: [
      "Inventory of radio equipment modules subject to RED (telematics, Wi-Fi/BT, cellular)",
      "Art 3(3)(d) cybersecurity conformity (EN 18031-1 or technical file)",
      "Art 3(3)(e) privacy conformity (EN 18031-2, where personal data processed)",
      "Art 3(3)(f) fraud-protection conformity (EN 18031-3, where monetary value transferred)",
      "CE marking + EU declaration of conformity covering RED essential requirements",
    ],
    owner_hint: "cybersecurity",
    planning_lead_time_months: 12,
    ui_package: "horizontal",
    process_stage: "pre_ta",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-24",
      human_reviewer: "yanhao",
    },
    related_rules: [
      { rule_id: "REG-CS-001", relation: "complements" },
      { rule_id: "REG-CS-003", relation: "complements" },
    ],
    prerequisite_standards: [
      "EN 18031-1:2024 (Common cybersecurity requirements for internet-connected radio equipment)",
      "EN 18031-2:2024 (Privacy/personal-data requirements)",
      "EN 18031-3:2024 (Fraud-protection requirements for radio equipment transferring monetary value)",
    ],
  }),
];
