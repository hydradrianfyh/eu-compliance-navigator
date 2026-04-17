import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const insuranceRegistrationRules = [
  makeSeedRule({
    stable_id: "REG-INS-001",
    title: "Motor Insurance Directive",
    short_label: "MID (2009/103/EC)",
    legal_family: "insurance_registration",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Directive",
        "EUR-Lex",
        "Directive 2009/103/EC on motor insurance",
        "OJ L 263, 7.10.2009",
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
      "Vehicles using EU roads must have compulsory third-party motor liability insurance. Member states implement minimum coverage levels.",
    owner_hint: "legal",
    ui_package: "horizontal",
    process_stage: "sop",
  }),
  makeSeedRule({
    stable_id: "REG-INS-002",
    title: "Green Card System — International Motor Insurance",
    short_label: "Green Card",
    legal_family: "insurance_registration",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "International agreement",
        "Other official",
        "Council of Bureaux — Green Card system",
      ),
    ],
    lifecycle_state: "DRAFT",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [],
      fallback_if_missing: "unknown",
      conditional_reason:
        "Cross-border insurance requirements depend on target markets and bilateral agreements.",
    },
    obligation_text:
      "Vehicles crossing international borders may need Green Card insurance certificates or equivalent electronic proof.",
    owner_hint: "legal",
    ui_package: "horizontal",
    process_stage: "sop",
  }),
  makeSeedRule({
    stable_id: "REG-INS-003",
    title: "CO2-based Vehicle Registration Tax",
    short_label: "CO2 Registration Tax",
    legal_family: "insurance_registration",
    jurisdiction: "EU",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L"],
    sources: [
      makeSource(
        "Member state taxation",
        "National legislation",
        "Various member state CO2-based registration tax schemes",
      ),
    ],
    lifecycle_state: "PLACEHOLDER",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "targetsEU", operator: "is_true", value: true }],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "PLACEHOLDER — Many member states levy registration or ownership taxes based on CO2 emissions. Rates and structures vary by country.",
    owner_hint: "regulatory_affairs",
    ui_package: "country_overlay",
    process_stage: "post_market",
  }),
];
