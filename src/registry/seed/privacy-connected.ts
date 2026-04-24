import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const privacyConnectedRules = [
  makeSeedRule({
    stable_id: "REG-PV-001",
    title: "General Data Protection Regulation",
    short_label: "GDPR",
    legal_family: "privacy_connected",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Framework regulation",
        source_family: "EUR-Lex" as const,
        reference: "Regulation (EU) 2016/679",
        official_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679",
        oj_reference: "OJ L 119, 4.5.2016",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [
        {
          field: "processesPersonalData",
          operator: "is_true",
          value: true,
          label: "Vehicle processes personal data",
        },
        {
          field: "hasConnectedServices",
          operator: "is_true",
          value: true,
          label: "Connected vehicle likely processes personal data",
        },
      ],
      fallback_if_missing: "unknown",
      conditional_reason:
        "Connected vehicle likely processes personal data — GDPR applicability should be assessed",
    },
    temporal: {
      entry_into_force: "2016-05-24",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2018-05-25",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: null,
    },
    obligation_text:
      "Data controller must comply with GDPR principles including lawfulness, purpose limitation, minimization, and accountability.",
    owner_hint: "privacy_data_protection",
    planning_lead_time_months: 18,
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-PV-002",
    title: "ePrivacy Directive",
    short_label: "ePrivacy",
    legal_family: "privacy_connected",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Directive",
        source_family: "EUR-Lex" as const,
        reference: "Directive 2002/58/EC (as amended by Directive 2009/136/EC)",
        official_url: "https://eur-lex.europa.eu/eli/dir/2002/58/oj",
        oj_reference: "OJ L 201, 31.7.2002, p. 37",
        authoritative_reference: "CELEX:32002L0058",
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
          field: "connectivity",
          operator: "includes_any",
          value: ["telematics", "mobile_app", "remote_control"],
        },
      ],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2002-07-31",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2003-10-31",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Directive — member-state transposition varies. Applies to electronic communications services including connected-vehicle telematics.",
    },
    obligation_text:
      "Confidentiality of electronic communications and cookie/tracker consent rules (as transposed nationally) apply to connected-vehicle services that use public electronic communications networks.",
    owner_hint: "privacy_data_protection",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-PV-003",
    title: "EDPB Guidelines on Connected Vehicles",
    short_label: "EDPB Connected Vehicles",
    legal_family: "privacy_connected",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "EU agency guidance",
        source_family: "EDPB" as const,
        reference:
          "EDPB Guidelines 01/2020 on processing personal data in the context of connected vehicles and mobility related applications (v2.0 adopted 9 March 2021)",
        official_url:
          "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-012020-processing-personal-data-context_en",
        oj_reference: null,
        last_verified_on: "2026-04-24",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-24",
    promoted_by: "phase-m.2.b",
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [
        { field: "hasConnectedServices", operator: "is_true", value: true, label: "Vehicle has connected services" },
        { field: "processesPersonalData", operator: "is_true", value: true, label: "Vehicle processes personal data" },
      ],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: null,
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2021-03-09",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "EDPB guidance (soft law) — not directly binding but authoritative interpretation of GDPR for connected vehicles; national data-protection authorities expect alignment.",
    },
    obligation_text:
      "EDPB guidance establishes specific safeguards for connected-vehicle data processing: data-minimisation by design, purpose-limitation at in-vehicle layer, local-processing preference for location / biometric / cabin-camera data, multi-layer transparency (first-layer information for all recipients), and revocable consent for non-essential processing.",
    evidence_tasks: [
      "Data-minimisation mapping for cabin-camera / location / biometric flows",
      "Multi-layer privacy notice covering first-layer recipients (OEM + TSPs)",
      "Local-vs-remote processing decision log per data category",
      "Consent revocation mechanism evidence (infotainment + app)",
    ],
    owner_hint: "privacy_data_protection",
    ui_package: "horizontal",
    process_stage: "post_market",
    content_provenance: {
      source_type: "manual",
      retrieved_at: "2026-04-24",
      human_reviewer: "yanhao",
    },
    related_rules: [
      { rule_id: "REG-PV-001", relation: "complements" },
      { rule_id: "REG-PV-002", relation: "complements" },
    ],
  }),
];
