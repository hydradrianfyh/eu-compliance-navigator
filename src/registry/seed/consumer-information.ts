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
      {
        label: "Directive",
        source_family: "EUR-Lex" as const,
        reference:
          "Directive 1999/94/EC relating to the availability of consumer information on fuel economy and CO2 emissions in respect of the marketing of new passenger cars",
        official_url: "https://eur-lex.europa.eu/eli/dir/1999/94/oj",
        oj_reference: "OJ L 12, 18.1.2000, p. 16",
        authoritative_reference: "CELEX:31999L0094",
        last_verified_on: "2026-04-24",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-24",
    promoted_by: "phase-m.2.b",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "frameworkGroup", operator: "eq", value: "MN", label: "Framework group is M/N" },
        { field: "vehicleCategory", operator: "in", value: ["M1"], label: "Vehicle category is M1" },
      ],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2000-02-07",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2001-01-18",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Directive — transposed into national legislation by member states. Member states must ensure each new M1 car has a CO2 / fuel-economy label at point of sale, a fuel-economy guide, dealer posters, and promotional-literature disclosure.",
    },
    obligation_text:
      "New M1 passenger cars offered for sale in the EU must carry a visible label at point of sale stating official fuel consumption (L/100km) and CO2 emissions (g/km). Promotional literature must include the same data. Member states also publish an annual fuel-economy guide drawn from manufacturer inputs.",
    evidence_tasks: [
      "Point-of-sale label template validated against Annex I",
      "Promotional-literature CO2/FC disclosure audit",
      "Annual data submission to national fuel-economy-guide body",
    ],
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-24",
      human_reviewer: "yanhao",
    },
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
      {
        label: "Framework regulation",
        source_family: "EUR-Lex" as const,
        reference:
          "Regulation (EU) 2020/740 on the labelling of tyres with respect to fuel efficiency and other parameters, amending Reg (EU) 2017/1369 and repealing Reg (EC) 1222/2009",
        official_url: "https://eur-lex.europa.eu/eli/reg/2020/740/oj",
        oj_reference: "OJ L 177, 5.6.2020, p. 1",
        authoritative_reference: "CELEX:32020R0740",
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
      entry_into_force: "2020-06-25",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2021-05-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "OEM obligation is narrower than tyre-manufacturer obligation: OEM ensures that only R117-approved tyres bearing a valid tyre-label entry in the EPREL database are fitted as OE and that the CoC tyre-size entries are consistent.",
    },
    obligation_text:
      "Tyres sold or fitted in the EU (C1 passenger, C2 van, C3 truck) must carry an EU tyre label showing fuel-efficiency class, wet-grip class, external noise class, and where applicable snow / ice grip. OE tyre suppliers register products in the EPREL database; OEMs verify tyre-label class at bill-of-materials level.",
    evidence_tasks: [
      "OE tyre EPREL registration references in vehicle BOM",
      "Tyre-label class disclosure in owner manual and promotional material",
      "Consistency check between CoC tyre-size entries and EPREL records",
    ],
    owner_hint: "regulatory_affairs",
    ui_package: "horizontal",
    process_stage: "post_market",
    content_provenance: {
      source_type: "eur_lex",
      retrieved_at: "2026-04-24",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-UN-117", relation: "complements" }],
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
