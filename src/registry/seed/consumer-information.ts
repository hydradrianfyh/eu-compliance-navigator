import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const consumerInformationRules = [
  makeSeedRule({
    stable_id: "REG-CI-001",
    title: "Passenger Car CO2 and Fuel Economy Labelling",
    short_label: "Car CO2 Label",
    legal_family: "consumer_information",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN"],
    sources: [
      makeSource(
        "Directive",
        "EUR-Lex",
        "Directive 1999/94/EC on car labelling (CO2 emissions information)",
        "OJ L 12, 18.1.2000",
      ),
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "frameworkGroup", operator: "eq", value: "MN" },
        { field: "vehicleCategory", operator: "in", value: ["M1"] },
      ],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "New passenger cars offered for sale must display a label showing official fuel consumption and CO2 emission values. Promotional literature must also include this data.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-CI-002",
    title: "Tyre Labelling Regulation",
    short_label: "Tyre Label (2020/740)",
    legal_family: "consumer_information",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2020/740 on tyre labelling",
        "OJ L 177, 5.6.2020",
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
      "Tyres sold in the EU must carry a label showing fuel efficiency, wet grip, and noise ratings. Applies to C1 (passenger), C2 (van), and C3 (truck) tyres.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
  makeSeedRule({
    stable_id: "REG-CI-003",
    title: "Energy Labelling Framework",
    short_label: "Energy Label (2017/1369)",
    legal_family: "consumer_information",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2017/1369 on energy labelling framework",
        "OJ L 198, 28.7.2017",
      ),
    ],
    lifecycle_state: "DRAFT",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "targetsEU", operator: "is_true", value: true }],
      fallback_if_missing: "unknown",
      conditional_reason:
        "Energy labelling framework primarily covers energy-related products. Vehicle-specific delegated acts may apply to charging equipment.",
    },
    obligation_text:
      "Energy labelling framework regulation sets common rules for product labels and information sheets. Vehicle charging infrastructure and related products may fall under delegated acts.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
];
