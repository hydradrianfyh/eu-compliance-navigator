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
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2018/858, Articles 52-53 (recall procedures)",
        "OJ L 151, 14.6.2018",
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
      "Manufacturers must notify approval authorities and take corrective measures for non-compliant vehicles. Recall procedures include notification to owners, free-of-charge remedy, and reporting to the Commission via RAPEX.",
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
  }),
];
