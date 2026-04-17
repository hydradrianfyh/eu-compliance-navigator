import { makeSeedRule, makeSource } from "@/registry/seed/shared";

export const importCustomsRules = [
  makeSeedRule({
    stable_id: "REG-IMP-001",
    title: "Third-Country Vehicle Import — CoC and Type-Approval Recognition",
    short_label: "Import / CoC",
    legal_family: "import_customs",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2018/858, Articles 42-50 (individual approval, small series)",
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
      "Vehicles manufactured outside the EU require either EU WVTA, national individual approval, or small-series approval. Certificate of Conformity must accompany the vehicle at customs.",
    owner_hint: "homologation",
    ui_package: "market_access",
    process_stage: "type_approval",
  }),
  makeSeedRule({
    stable_id: "REG-IMP-002",
    title: "Union Customs Code — Vehicle Import Procedures",
    short_label: "UCC Import",
    legal_family: "import_customs",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) No 952/2013 (Union Customs Code)",
        "OJ L 269, 10.10.2013",
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
      "Imported vehicles are subject to customs declaration, duties, and border checks. Customs clearance requires valid type-approval or individual approval documentation.",
    owner_hint: "regulatory_affairs",
    ui_package: "market_access",
    process_stage: "pre_ta",
  }),
  makeSeedRule({
    stable_id: "REG-IMP-003",
    title: "Rules of Origin — Preferential Tariff Agreements",
    short_label: "Origin / Tariff",
    legal_family: "import_customs",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Rules of origin under EU trade agreements",
      ),
    ],
    lifecycle_state: "DRAFT",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [{ field: "targetsEU", operator: "is_true", value: true }],
      fallback_if_missing: "unknown",
      conditional_reason:
        "Applicable tariff rates depend on country of origin and specific trade agreements.",
    },
    obligation_text:
      "Vehicle origin determines applicable customs duty rates. Preferential tariffs may apply under FTA agreements (e.g. EU-UK TCA, EU-Japan EPA). Rules of origin for automotive typically require significant local content.",
    owner_hint: "regulatory_affairs",
    ui_package: "market_access",
    process_stage: "pre_ta",
  }),
  makeSeedRule({
    stable_id: "REG-IMP-004",
    title: "Importer Obligations for Non-EU Manufacturers",
    short_label: "Importer Duties",
    legal_family: "import_customs",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2018/858, Articles 13-14 (importer obligations)",
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
      "Importers must verify type-approval, ensure CoC accompanies the vehicle, keep documentation for 10 years, and cooperate with market surveillance authorities.",
    owner_hint: "regulatory_affairs",
    ui_package: "market_access",
    process_stage: "pre_ta",
  }),
  makeSeedRule({
    stable_id: "REG-IMP-005",
    title: "Distributor Obligations",
    short_label: "Distributor Duties",
    legal_family: "import_customs",
    jurisdiction: "EU",
    jurisdiction_level: "EU",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework regulation",
        "EUR-Lex",
        "Regulation (EU) 2018/858, Article 15 (distributor obligations)",
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
      "Distributors must verify statutory plate, CoC, and labelling before making a vehicle available on the market.",
    owner_hint: "regulatory_affairs",
    ui_package: "market_access",
    process_stage: "sop",
  }),
];
