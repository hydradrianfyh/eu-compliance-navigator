import { makeSeedRule, makeSource } from "@/registry/seed/shared";
import type { Rule } from "@/registry/schema";

interface WorkflowOverlay {
  country: string;
  countryLabel: string;
  registrationRef: string;
  roadworthinessRef: string;
  insuranceRef: string;
  taxRef: string;
  roadUseRef: string;
  notes?: string;
}

const priorityCountries: WorkflowOverlay[] = [
  // NOTE: DE removed from factory-generated PLACEHOLDERS in Phase 11C (Path C).
  // Germany is now authored as 5 explicit ACTIVE overlay rules below with verified sources.
  {
    country: "FR",
    countryLabel: "France",
    registrationRef: "Carte grise / SIV system",
    roadworthinessRef: "Contrôle technique (every 2 years after 4th year)",
    insuranceRef: "Code des assurances, Art. L211-1",
    taxRef: "Malus écologique / taxe sur les véhicules de société",
    roadUseRef: "ZFE-m (Zones à Faibles Émissions mobilité) / Crit'Air vignette",
  },
  {
    country: "IT",
    countryLabel: "Italy",
    registrationRef: "Motorizzazione Civile — immatricolazione",
    roadworthinessRef: "Revisione (every 2 years after 4th year)",
    insuranceRef: "RCA obbligatoria (Codice delle Assicurazioni Private)",
    taxRef: "Bollo auto (regional vehicle ownership tax)",
    roadUseRef: "ZTL (Zone a Traffico Limitato) / LEZ Milan Area B/C",
  },
  {
    country: "ES",
    countryLabel: "Spain",
    registrationRef: "DGT matriculación",
    roadworthinessRef: "ITV (Inspección Técnica de Vehículos)",
    insuranceRef: "Seguro obligatorio de responsabilidad civil",
    taxRef: "IVTM (Impuesto sobre Vehículos de Tracción Mecánica) + IEDMT",
    roadUseRef: "ZBE (Zonas de Bajas Emisiones) / DGT environmental label",
  },
  {
    country: "NL",
    countryLabel: "Netherlands",
    registrationRef: "RDW kentekenregistratie",
    roadworthinessRef: "APK (Algemene Periodieke Keuring)",
    insuranceRef: "WAM (Wet aansprakelijkheidsverzekering motorrijtuigen)",
    taxRef: "BPM (aanschafbelasting) + MRB (motorrijtuigenbelasting) — CO2-based",
    roadUseRef: "Milieuzones (Amsterdam, Rotterdam, Utrecht, etc.)",
  },
  {
    country: "PL",
    countryLabel: "Poland",
    registrationRef: "Rejestracja pojazdów / CEPiK system",
    roadworthinessRef: "Przegląd techniczny (annual after 3rd year)",
    insuranceRef: "OC (ubezpieczenie OC posiadaczy pojazdów mechanicznych)",
    taxRef: "Akcyza od samochodu osobowego (excise duty)",
    roadUseRef: "Strefy czystego transportu (clean transport zones)",
  },
  {
    country: "BE",
    countryLabel: "Belgium",
    registrationRef: "DIV inschrijving / immatriculation",
    roadworthinessRef: "Technische keuring / Contrôle technique (regional)",
    insuranceRef: "Verplichte BA-verzekering motorrijtuigen",
    taxRef: "BIV + Verkeersbelasting (regional, Flanders/Wallonia/Brussels)",
    roadUseRef: "LEZ Brussels / Antwerp / Ghent",
  },
  {
    country: "AT",
    countryLabel: "Austria",
    registrationRef: "Zulassung per §37 KFG 1967",
    roadworthinessRef: "§57a Überprüfung (Pickerl)",
    insuranceRef: "KFG §59 Haftpflichtversicherung",
    taxRef: "NoVA (Normverbrauchsabgabe) + motorbezogene Versicherungssteuer",
    roadUseRef: "IG-L Maßnahmen / Umweltzonen (limited)",
  },
  {
    country: "SE",
    countryLabel: "Sweden",
    registrationRef: "Transportstyrelsen registrering",
    roadworthinessRef: "Kontrollbesiktning (Bilprovning)",
    insuranceRef: "Trafikförsäkring (mandatory traffic insurance)",
    taxRef: "Fordonsskatt — CO2-based + bonus-malus",
    roadUseRef: "Miljözoner (Stockholm, Gothenburg, Malmö)",
  },
];

const workflows = [
  { seq: "001", suffix: "Registration", processStage: "sop" as const, buildObligation: (c: WorkflowOverlay) => `Vehicle registration in ${c.countryLabel}: ${c.registrationRef}. Required before road use.`, buildRef: (c: WorkflowOverlay) => c.registrationRef },
  { seq: "002", suffix: "Roadworthiness", processStage: "post_market" as const, buildObligation: (c: WorkflowOverlay) => `Periodic technical inspection in ${c.countryLabel}: ${c.roadworthinessRef}.`, buildRef: (c: WorkflowOverlay) => c.roadworthinessRef },
  { seq: "003", suffix: "Insurance", processStage: "sop" as const, buildObligation: (c: WorkflowOverlay) => `Compulsory motor insurance in ${c.countryLabel}: ${c.insuranceRef}.`, buildRef: (c: WorkflowOverlay) => c.insuranceRef },
  { seq: "004", suffix: "Tax", processStage: "sop" as const, buildObligation: (c: WorkflowOverlay) => `Vehicle tax/fee in ${c.countryLabel}: ${c.taxRef}.`, buildRef: (c: WorkflowOverlay) => c.taxRef },
  { seq: "005", suffix: "Road-use", processStage: "post_market" as const, buildObligation: (c: WorkflowOverlay) => `Road-use restrictions in ${c.countryLabel}: ${c.roadUseRef}.`, buildRef: (c: WorkflowOverlay) => c.roadUseRef },
] as const;

function buildWorkflowRules(overlay: WorkflowOverlay): Rule[] {
  return workflows.map((wf) =>
    makeSeedRule({
      stable_id: `REG-MS-${overlay.country}-${wf.seq}`,
      title: `${overlay.countryLabel} — ${wf.suffix}`,
      short_label: `${overlay.country} ${wf.suffix}`,
      legal_family: "member_state_overlay",
      jurisdiction: overlay.country,
      jurisdiction_level: "MEMBER_STATE",
      framework_group: ["MN", "L", "O", "AGRI"],
      sources: [
        makeSource(
          "National legislation",
          "National legislation",
          wf.buildRef(overlay),
        ),
      ],
      lifecycle_state: "PLACEHOLDER",
      trigger_logic: {
        mode: "declarative",
        match_mode: "all",
        conditions: [
          { field: "targetCountries", operator: "includes", value: overlay.country },
        ],
        fallback_if_missing: "unknown",
        conditional_reason: `${overlay.countryLabel} selected — ${wf.suffix.toLowerCase()} overlay may apply.`,
      },
      obligation_text: `PLACEHOLDER — ${wf.buildObligation(overlay)}`,
      owner_hint: wf.suffix === "Insurance" || wf.suffix === "Tax" ? "legal" : "homologation",
      notes: overlay.notes ?? null,
      ui_package: "country_overlay",
      process_stage: wf.processStage,
    }),
  );
}

// ============================================================
// Phase 11C (Path C) -- Germany (DE) authored overlay
// 5 ACTIVE rules with verified sources from gesetze-im-internet.de
// Verified by phase-11c on 2026-04-16
// ============================================================
const germanyOverlayRules: Rule[] = [
  makeSeedRule({
    stable_id: "REG-MS-DE-001",
    title: "Germany — Vehicle Registration (FZV)",
    short_label: "DE Registration (FZV)",
    legal_family: "member_state_overlay",
    jurisdiction: "DE",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Fahrzeug-Zulassungsverordnung (FZV 2023)",
        source_family: "National legislation" as const,
        reference: "FZV vom 20. Juli 2023 (BGBl. 2023 I Nr. 199)",
        official_url: "https://www.gesetze-im-internet.de/fzv_2023/",
        oj_reference: "BGBl. 2023 I Nr. 199",
        authoritative_reference: "FZV §3-§18",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-16",
    promoted_by: "phase-11c-de",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "DE" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2023-09-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "2023-09-01",
      applies_from_generic: "2023-09-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "FZV replaced the earlier FZV 2011 on 2023-09-01.",
    },
    obligation_text:
      "Every vehicle placed in service on German public roads must be registered per FZV: submit EU CoC + Teil II Zulassungsbescheinigung, assign Halter, obtain Kennzeichen (plates) from Zulassungsbehörde. BEV receives E-Kennzeichen (optional) per EmoG for local incentives.",
    owner_hint: "regulatory_affairs",
    owner_hint_detail: "Coordinate with dealer / distributor who handles Zulassungsbehörde submission",
    evidence_tasks: [
      "Prepare EU CoC for each vehicle",
      "Align with local distributor on Zulassungsbehörde submission flow",
      "Consider E-Kennzeichen eligibility for BEV (EmoG §2)",
    ],
    required_documents: [
      "EU Certificate of Conformity (CoC)",
      "Zulassungsbescheinigung Teil I (registration certificate)",
      "Zulassungsbescheinigung Teil II (title document)",
      "eVB number (electronic insurance confirmation)",
      "HU/AU Prüfbericht (if required before first registration)",
    ],
    required_evidence: [
      "Dealer registration process documentation",
      "VIN-to-registration mapping records",
    ],
    submission_timing: "Before first road use — typically handled by dealer at delivery",
    language_or_localization_need: "All documents in German; CoC accepted in English by most Zulassungsbehörden",
    third_party_verification_required: false,
    recurring_post_market_obligation: false,
    planning_lead_time_months: 3,
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    // Sprint 7: eVB artifact is shared with REG-MS-DE-003 (PflVG) —
    // when the UI de-duplicates artifact requirements, this link tells it
    // both rules reference the same document.
    related_rules: [
      { rule_id: "REG-MS-DE-003", relation: "requires" },
    ],
  }),

  makeSeedRule({
    stable_id: "REG-MS-DE-002",
    title: "Germany — Periodic Roadworthiness Inspection (§29 StVZO, HU/AU)",
    short_label: "DE HU/AU (§29 StVZO)",
    legal_family: "member_state_overlay",
    jurisdiction: "DE",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O"],
    sources: [
      {
        label: "Straßenverkehrs-Zulassungs-Ordnung §29",
        source_family: "National legislation" as const,
        reference: "§29 StVZO (Anlage VIII/VIIIa)",
        official_url: "https://www.gesetze-im-internet.de/stvzo_2012/__29.html",
        oj_reference: "BGBl. I 2012 S. 679",
        authoritative_reference: "StVZO §29 + Anlage VIIIa",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-16",
    promoted_by: "phase-11c-de",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "DE" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "1937-11-13",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "1937-11-13",
      applies_from_generic: "1937-11-13",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "HU (Hauptuntersuchung) required: M1 first inspection at 36 months, then every 24 months. AU (Abgasuntersuchung) for ICE only -- BEV exempt but still need HU.",
    },
    obligation_text:
      "Vehicles registered in Germany must undergo periodic technical inspection (Hauptuntersuchung / HU) by TÜV, DEKRA, GTÜ or KÜS. M1 first HU at 36 months, subsequent every 24 months. BEV are exempt from AU (Abgasuntersuchung) but still subject to HU including high-voltage safety checks.",
    owner_hint: "aftersales",
    evidence_tasks: [
      "Integrate HU reminder into vehicle telematics / dealer CRM",
      "Ensure BEV-specific HV safety service procedures are available to HU stations",
      "Coordinate with TÜV/DEKRA for BEV-specific inspection training",
    ],
    required_documents: [
      "HU Prüfbericht (inspection report)",
      "Prüfplakette (inspection sticker on rear plate)",
      "BEV HV system service manual",
    ],
    required_evidence: [
      "Scheduled maintenance logs aligned with HU intervals",
      "Service partner network coverage for HU stations",
    ],
    submission_timing: "Ongoing post-market — M1 at 36 months, then 24-month intervals",
    language_or_localization_need: "All inspection documentation in German",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
    planning_lead_time_months: 24,
    ui_package: "country_overlay",
    process_stage: "post_market",
  }),

  makeSeedRule({
    stable_id: "REG-MS-DE-003",
    title: "Germany — Compulsory Motor Insurance (PflVG)",
    short_label: "DE Insurance (PflVG)",
    legal_family: "member_state_overlay",
    jurisdiction: "DE",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Pflichtversicherungsgesetz",
        source_family: "National legislation" as const,
        reference: "PflVG idF BGBl. I 1965 S. 213",
        official_url: "https://www.gesetze-im-internet.de/pflvg/",
        oj_reference: "BGBl. I 1965 S. 213",
        authoritative_reference: "PflVG §1-§2",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-16",
    promoted_by: "phase-11c-de",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "DE" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "1965-04-05",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "1965-04-05",
      applies_from_generic: "1965-04-05",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Minimum insurance sums: personal injury EUR 7.5m, property EUR 1.22m per event.",
    },
    obligation_text:
      "Every motor vehicle registered in Germany must carry compulsory third-party liability insurance (Kfz-Haftpflichtversicherung). Registration (REG-MS-DE-001) cannot be completed without eVB number (electronic insurance confirmation).",
    owner_hint: "legal",
    evidence_tasks: [
      "Ensure dealer network can guide customers to insurance before delivery",
      "Verify minimum insurance sums stay aligned with PflVG amendments",
    ],
    required_documents: [
      "eVB (elektronische Versicherungsbestätigung) number",
      "Insurance policy certificate",
    ],
    required_evidence: [
      "Dealer handoff documentation confirming customer has insurance",
    ],
    submission_timing: "Before first registration — eVB must be presented to Zulassungsbehörde",
    language_or_localization_need: "Insurance contract in German",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
    ui_package: "country_overlay",
    process_stage: "sop",
  }),

  makeSeedRule({
    stable_id: "REG-MS-DE-004",
    title: "Germany — Motor Vehicle Tax (KraftStG) — BEV exemption",
    short_label: "DE KraftStG",
    legal_family: "member_state_overlay",
    jurisdiction: "DE",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN"],
    sources: [
      {
        label: "Kraftfahrzeugsteuergesetz",
        source_family: "National legislation" as const,
        reference: "KraftStG §3d (BEV exemption)",
        official_url: "https://www.gesetze-im-internet.de/kraftstg/",
        oj_reference: "BGBl. I 2002 S. 3818",
        authoritative_reference: "KraftStG §3d + §9",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-16",
    promoted_by: "phase-11c-de",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "DE" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2002-09-26",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "2002-09-26",
      applies_from_generic: "2002-09-26",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Pure BEV (Elektrofahrzeuge) registered between 18.05.2011 and 31.12.2025 are exempt for 10 years per §3d KraftStG; exemption extended to 31.12.2030 by subsequent amendments. Check current law before SOP.",
    },
    obligation_text:
      "Motor vehicle tax is levied based on CO2 emissions and engine displacement per §9 KraftStG. Pure BEV are exempt for 10 years from first registration per §3d. Hybrid vehicles taxed normally based on CO2.",
    owner_hint: "legal",
    evidence_tasks: [
      "Verify current BEV tax exemption window (check for amendments)",
      "Include tax cost-of-ownership data in customer-facing documentation",
      "Flag hybrid models for CO2-based tax impact in pricing",
    ],
    required_documents: [
      "Tax assessment notice (Steuerbescheid) issued by Hauptzollamt",
    ],
    required_evidence: [
      "VIN-to-powertrain classification (BEV vs HEV/PHEV vs ICE) for tax calculation",
    ],
    submission_timing: "Tax obligation starts from date of registration",
    language_or_localization_need: "Tax communication in German",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
    ui_package: "country_overlay",
    process_stage: "sop",
  }),

  makeSeedRule({
    stable_id: "REG-MS-DE-005",
    title: "Germany — Low-Emission Zones (35. BImSchV / Umweltzonen)",
    short_label: "DE Umweltzonen",
    legal_family: "member_state_overlay",
    jurisdiction: "DE",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN"],
    sources: [
      {
        label: "35. BImSchV — Kennzeichnungsverordnung",
        source_family: "National legislation" as const,
        reference: "35. BImSchV (Plakettenverordnung)",
        official_url: "https://www.gesetze-im-internet.de/bimschv_35/",
        oj_reference: "BGBl. I 2006 S. 2218",
        authoritative_reference: "35. BImSchV Anlage 2",
        last_verified_on: "2026-04-16",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-16",
    promoted_by: "phase-11c-de",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "DE" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2007-03-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "2007-03-01",
      applies_from_generic: "2007-03-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "BEV / FCEV are exempt from Umweltzonen restrictions but still need to display Plakette (green / grüne Plakette) or are outright exempt in some zones.",
    },
    obligation_text:
      "Low-emission zones (Umweltzonen) are enforced in 50+ German cities. Vehicles require an environmental sticker (Feinstaubplakette) per 35. BImSchV Anlage 2 to enter. BEV qualify for grüne Plakette (class 4) and are not restricted; ICE Euro 4 or lower may be banned. Dealer must explain to customer at delivery.",
    owner_hint: "regulatory_affairs",
    evidence_tasks: [
      "Confirm BEV automatic eligibility for grüne Plakette",
      "Include Umweltzonen information in dealer delivery documentation",
      "Monitor city-level tightening (e.g. Stuttgart, Berlin diesel bans)",
    ],
    required_documents: [
      "Feinstaubplakette (environmental sticker) per 35. BImSchV",
    ],
    required_evidence: [
      "Dealer documentation showing customer is informed of Umweltzonen status",
    ],
    submission_timing: "Ongoing — sticker obtained at registration; enforcement continuous",
    language_or_localization_need: "All communication in German",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
    ui_package: "country_overlay",
    process_stage: "post_market",
  }),
];

export const memberStateOverlayRules: Rule[] = [
  ...priorityCountries.flatMap(buildWorkflowRules),
  ...germanyOverlayRules,
  makeSeedRule({
    stable_id: "REG-MS-CZ-001",
    title: "Czech Republic — General Overlay",
    short_label: "CZ overlay",
    legal_family: "member_state_overlay",
    jurisdiction: "CZ",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "National legislation",
        "National legislation",
        "Zákon o podmínkách provozu vozidel na pozemních komunikacích (56/2001 Sb.)",
      ),
    ],
    lifecycle_state: "PLACEHOLDER",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "CZ" },
      ],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "PLACEHOLDER — Czech Republic national requirements need country-specific verification.",
    owner_hint: "homologation",
    ui_package: "country_overlay",
    process_stage: "type_approval",
  }),
];
