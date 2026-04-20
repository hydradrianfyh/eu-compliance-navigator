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
  // NOTE: FR and NL removed from factory-generated PLACEHOLDERS in Phase H.3 / H.4.
  // France and Netherlands are now authored as 5 SEED_UNVERIFIED overlay rules each
  // below, sourced from Légifrance (FR) and wetten.overheid.nl (NL) respectively.
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

// ============================================================
// Phase H.3 — France (FR) authored overlay
// 5 SEED_UNVERIFIED rules, sources from Légifrance (verified URLs).
// Kept SEED_UNVERIFIED (not ACTIVE like DE) because:
//   - Bonus écologique barème subject to Q1 2026 parliamentary review
//   - ZFE-m legislation under government proposal to narrow scope
//   - human_reviewer null → awaiting ratification
// ============================================================
const franceOverlayRules: Rule[] = [
  makeSeedRule({
    stable_id: "REG-MS-FR-001",
    title: "France — Vehicle Registration (Carte grise / Certificat d'immatriculation)",
    short_label: "FR Registration (Carte grise)",
    legal_family: "member_state_overlay",
    jurisdiction: "FR",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Code de la route — Articles R322-1 à R322-14",
        source_family: "National legislation" as const,
        reference: "Code de la route, Articles R322-1 à R322-14 (Délivrance du certificat d'immatriculation)",
        official_url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074228/LEGISCTA000006175954",
        oj_reference: null,
        authoritative_reference: "Code de la route R322-1 à R322-14",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "FR" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2009-04-15",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2009-04-15",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "SIV (Système d'Immatriculation des Véhicules) launched 15 April 2009, replacing the FNI.",
    },
    obligation_text:
      "Every vehicle placed in service on French public roads must be registered via the SIV (Système d'Immatriculation des Véhicules). OEM provides EU CoC to the final purchaser/importer within 4 weeks of delivery; owner/dealer applies for certificat d'immatriculation within 1 month at immatriculation.ants.gouv.fr. BEV automatically receives Crit'Air 0 vignette.",
    owner_hint: "regulatory_affairs",
    required_documents: [
      "EU Certificate of Conformity (CoC)",
      "Proof of identity (justificatif d'identité)",
      "Proof of residence (justificatif de domicile)",
      "Proof of RC auto insurance (attestation d'assurance)",
      "CERFA application form (via ANTS portal)",
    ],
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
  makeSeedRule({
    stable_id: "REG-MS-FR-002",
    title: "France — Periodic Technical Inspection (Contrôle technique périodique)",
    short_label: "FR Contrôle technique",
    legal_family: "member_state_overlay",
    jurisdiction: "FR",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L"],
    sources: [
      {
        label: "Code de la route — Articles L323-1, R323-1 à R323-22",
        source_family: "National legislation" as const,
        reference: "Code de la route, Articles L323-1, R323-1 à R323-22",
        official_url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006074228/LEGISCTA000006177100",
        oj_reference: null,
        authoritative_reference: "Code de la route L323-1, R323-*",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "FR" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2018-05-20",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2018-05-20",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "EU Directive 2014/45/UE transposed into French Code de la route effective 2018-05-20.",
    },
    obligation_text:
      "M1 vehicles (≤ 3.5 t) must complete first contrôle technique within 6 months before the 4-year anniversary of first registration, then every 2 years. BEV: anti-pollution test waived; HV battery + regen brake visual/thermal checks added. Cross-reference: EU Directive 2014/45/UE.",
    owner_hint: "aftersales",
    ui_package: "country_overlay",
    process_stage: "post_market",
    recurring_post_market_obligation: true,
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
  makeSeedRule({
    stable_id: "REG-MS-FR-003",
    title: "France — Compulsory Third-Party Liability Insurance (Assurance RC auto)",
    short_label: "FR Assurance RC",
    legal_family: "member_state_overlay",
    jurisdiction: "FR",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Code des assurances — Articles L211-1 à L211-5",
        source_family: "National legislation" as const,
        reference: "Code des assurances, Articles L211-1 à L211-5 et R211-1 à R211-8",
        official_url:
          "https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006073984/LEGISCTA000006176181",
        oj_reference: null,
        authoritative_reference: "Code des assurances L211-1",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "FR" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "1958-02-27",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "1958-02-27",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Loi n° 58-208 du 27 février 1958 — compulsory motor insurance; codified into Code des assurances L211-1 et seq.",
    },
    obligation_text:
      "Every vehicle owner/keeper must obtain and maintain third-party liability insurance (assurance RC auto) before circulation. Minimum coverage: unlimited for bodily injury; minimum per R211-7 for property damage. Proof of insurance must be presentable at roadside checks.",
    owner_hint: "legal",
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
  makeSeedRule({
    stable_id: "REG-MS-FR-004",
    title: "France — Malus CO₂ / Bonus écologique (Fiscal + Incentive for BEV)",
    short_label: "FR Malus/Bonus écologique",
    legal_family: "member_state_overlay",
    jurisdiction: "FR",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN"],
    sources: [
      {
        label: "Code général des impôts — Malus écologique",
        source_family: "National legislation" as const,
        reference:
          "Code général des impôts, Articles L. 321-1 à L. 323-1 (malus écologique) + Décret n° 2024-1360 du 24 décembre 2024 (bonus 2026)",
        official_url: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000050627093",
        oj_reference: "JORF n° 0300 du 25 décembre 2024",
        authoritative_reference: "CGI L321-1 + Décret 2024-1360",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "FR" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2026-01-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "2026-01-01",
      applies_from_generic: "2026-01-01",
      effective_to: null,
      small_volume_derogation_until: "2026-06-30",
      notes: "Décret n° 2024-1360 du 24 décembre 2024 effective 1 January 2026. BEV full exemption from malus ends 30 June 2026; afterwards 600 kg abatement.",
    },
    obligation_text:
      "At first registration in France: importer/buyer pays malus CO₂ (threshold 108 g/km WLTP 2026, cap €80k) + malus masse (threshold 1 500 kg 2026). BEV (100 % electric) fully exempt from both until 30 June 2026; from 1 July 2026 a 600 kg abatement applies to mass calculation. BEV purchasers may claim bonus écologique (2026: €3 500–5 700 depending on income) if price ≤ €47 000 TTC and mass ≤ 2 400 kg. Bonus policy pending Q1 2026 parliamentary review — monitor Légifrance.",
    owner_hint: "legal",
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
    notes:
      "ALERT: bonus écologique subject to Q1 2026 legislative amendment; verify rates against Légifrance monthly.",
  }),
  makeSeedRule({
    stable_id: "REG-MS-FR-005",
    title: "France — Low-Emission Zone Mobility (ZFE-m)",
    short_label: "FR ZFE-m",
    legal_family: "member_state_overlay",
    jurisdiction: "FR",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L"],
    sources: [
      {
        label: "Code général des collectivités territoriales L2213-4-1 et L2213-4-2",
        source_family: "National legislation" as const,
        reference:
          "CGCT L2213-4-1 et L2213-4-2; Loi Climat et résilience n° 2021-1104 du 22 août 2021 art. 119",
        official_url:
          "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043900313",
        oj_reference: "JORF n° 0196 du 24 août 2021",
        authoritative_reference: "CGCT L2213-4-1",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "FR" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2021-08-22",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2025-01-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Loi Climat et résilience 2021-1104 published 22 August 2021; mandatory ZFE-m in agglomérations > 150 000 pop. by 1 January 2025.",
    },
    obligation_text:
      "OEM / dealer must inform BEV purchasers that Crit'Air 0 vignette is automatically assigned at first registration and grants 24/7 access to all ZFE-m zones (Paris, Lyon mandatory; up to 42 agglomérations > 150 000 pop. phased in from 1 Jan 2025). BEVs face no circulation ban in any ZFE. Government April 2025 proposal to narrow mandatory ZFE to Paris/Lyon only is under parliamentary review — monitor.",
    owner_hint: "regulatory_affairs",
    required_documents: ["Crit'Air 0 vignette (auto-issued by ANTS at registration)"],
    ui_package: "country_overlay",
    process_stage: "post_market",
    recurring_post_market_obligation: true,
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
    notes:
      "ALERT: April 2025 government proposal to suppress mandatory ZFE in 40 agglomérations under parliamentary review — re-check Légifrance quarterly.",
  }),
];

// ============================================================
// Phase H.4 — Netherlands (NL) authored overlay
// 5 SEED_UNVERIFIED rules, sources from wetten.overheid.nl (verified URLs).
// Kept SEED_UNVERIFIED because:
//   - BPM 2027 fixed amount pending Belastingplan 2027 (announced Sept 2026)
//   - MRB BEV discount phase-out schedule confirmed for 2026-2030 window
//   - human_reviewer null → awaiting ratification
// ============================================================
const netherlandsOverlayRules: Rule[] = [
  makeSeedRule({
    stable_id: "REG-MS-NL-001",
    title: "Netherlands — Vehicle Registration via RDW (Kenteken)",
    short_label: "NL RDW Kenteken",
    legal_family: "member_state_overlay",
    jurisdiction: "NL",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Wegenverkeerswet 1994 + Kentekenreglement",
        source_family: "National legislation" as const,
        reference:
          "Wegenverkeerswet 1994, Articles 5a–5c + Kentekenreglement (Vehicle Registration Regulation)",
        official_url: "https://wetten.overheid.nl/BWBR0006622",
        oj_reference: null,
        authoritative_reference: "Wegenverkeerswet 1994 Art. 5a-5c; Kentekenreglement",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "NL" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "1994-01-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "1994-01-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Wegenverkeerswet 1994 entered into force 1 January 1995; Kentekenreglement updated periodically.",
    },
    obligation_text:
      "Before operation on Dutch public roads, vehicle must be registered with RDW (Rijksdienst voor het Wegverkeer) and receive a Dutch kentekenkaart (registration card). For new EU-WVTA-approved vehicles, the card is issued at dealer sale. Imports require an RDW inspection. BEVs registered with standard kentekenkaart (no BEV-specific exemption from registration itself).",
    owner_hint: "regulatory_affairs",
    required_documents: [
      "EU Certificate of Conformity (CoC)",
      "Purchase invoice / proof of acquisition",
      "BPM declaration (at first registration)",
      "Identity documents",
      "RDW inspection report (for non-EU-type-approved imports only)",
    ],
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
  makeSeedRule({
    stable_id: "REG-MS-NL-002",
    title: "Netherlands — Periodic Technical Inspection (APK)",
    short_label: "NL APK",
    legal_family: "member_state_overlay",
    jurisdiction: "NL",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L"],
    sources: [
      {
        label: "Besluit voertuigen",
        source_family: "National legislation" as const,
        reference: "Wegenverkeerswet 1994 + Besluit voertuigen",
        official_url: "https://wetten.overheid.nl/BWBR0025554",
        oj_reference: null,
        authoritative_reference: "Besluit voertuigen",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "NL" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2009-03-18",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2009-03-18",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Besluit voertuigen (BWBR0025554) effective 18 March 2009; transposes EU Directive 2014/47/EU.",
    },
    obligation_text:
      "M1 BEV: first APK (Algemene Periodieke Keuring) due within 4 years of first registration; biennial thereafter. BEV exempt from emissions testing; mandatory checks cover brake system, steering, lighting, tyres, structural integrity, HV battery containment (visual). Cross-reference: EU Directive 2014/47/EU transposed into NL law.",
    owner_hint: "aftersales",
    ui_package: "country_overlay",
    process_stage: "post_market",
    recurring_post_market_obligation: true,
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
  makeSeedRule({
    stable_id: "REG-MS-NL-003",
    title: "Netherlands — Compulsory Third-Party Liability Insurance (WAM)",
    short_label: "NL WAM Insurance",
    legal_family: "member_state_overlay",
    jurisdiction: "NL",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      {
        label: "Wet aansprakelijkheidsverzekering motorrijtuigen (WAM)",
        source_family: "National legislation" as const,
        reference: "Wet aansprakelijkheidsverzekering motorrijtuigen (WAM) Art. 1–30",
        official_url: "https://wetten.overheid.nl/BWBR0002415",
        oj_reference: null,
        authoritative_reference: "WAM Art. 1-30",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "NL" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "1963-01-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2023-12-23",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "WAM (BWBR0002415) originally 1963; minimum indemnity raised to €6,450,000 per personal-injury accident on 23 December 2023.",
    },
    obligation_text:
      "Every owner/long-term user (≥ 1 year lease) of an M1 BEV must carry compulsory WA (third-party liability) insurance before road use or outside-private-garage parking. Minimum indemnity: €6,450,000 per accident for personal injury (as of 23 Dec 2023). Proof of insurance must be carried in the vehicle. Driving without WAM is a criminal offence.",
    owner_hint: "legal",
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
  makeSeedRule({
    stable_id: "REG-MS-NL-004",
    title: "Netherlands — Motor Vehicle Tax (MRB + BPM)",
    short_label: "NL MRB+BPM",
    legal_family: "member_state_overlay",
    jurisdiction: "NL",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN"],
    sources: [
      {
        label: "Wet op de motorrijtuigenbelasting 1994 + Belastingplan 2026",
        source_family: "National legislation" as const,
        reference:
          "Wet op de motorrijtuigenbelasting 1994 (BWBR0006324) + Wet op de belasting van personenauto's en motorrijwielen (BPM)",
        official_url: "https://wetten.overheid.nl/BWBR0006324/",
        oj_reference: null,
        authoritative_reference: "Wet MRB 1994 + Wet BPM",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "NL" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2026-01-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: "2025-01-01",
      applies_from_generic: "2026-01-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Wet MRB 1994; Belastingplan 2026 effective 1 Jan 2026 sets BEV discount at 30 % of standard tariff. BPM full BEV exemption ended 31 Dec 2024.",
    },
    obligation_text:
      "At first NL registration: BPM acquisition tax (flat-rate €667 2025 / ~€687 2026 for BEV; full BEV exemption ended 31 Dec 2024). Ongoing: MRB (annual motor tax) — 2026-2028 BEVs pay 70 % of standard tariff (30 % discount), phasing to 25 % discount in 2029 and parity with ICE in 2030+. BPM corporate-tax deductibility phases out 2027-2031.",
    owner_hint: "legal",
    ui_package: "country_overlay",
    process_stage: "sop",
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
    notes:
      "BPM 2027 fixed amount pending Belastingplan 2027 (Sept 2026 announcement). MRB phase-out schedule confirmed: 30% (2026-2028) → 25% (2029) → 0% (2030+).",
  }),
  makeSeedRule({
    stable_id: "REG-MS-NL-005",
    title: "Netherlands — Low-Emission Zones (Milieuzones, 4 cities)",
    short_label: "NL Milieuzones",
    legal_family: "member_state_overlay",
    jurisdiction: "NL",
    jurisdiction_level: "MEMBER_STATE",
    framework_group: ["MN", "L"],
    sources: [
      {
        label: "Wegenverkeerswet 1994 Art. 5c + municipal ordinances",
        source_family: "National legislation" as const,
        reference:
          "Wegenverkeerswet 1994 Art. 5c; Amsterdam / Utrecht / Den Haag / Arnhem municipal milieuzone ordinances",
        official_url: "https://www.milieuzones.nl/personen-en-bestelautos",
        oj_reference: null,
        authoritative_reference: "Wegenverkeerswet Art. 5c",
        last_verified_on: null,
      },
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        { field: "targetCountries", operator: "includes", value: "NL" },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2021-07-01",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2021-07-01",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Den Haag green zone established 1 July 2021. Amsterdam blue zone tightened to Euro 5+ on 1 Jan 2025; Utrecht followed April 2025. BEV exemption universal across zones.",
    },
    obligation_text:
      "M1 BEVs (0 g CO₂/km) are fully exempt from all 4 city milieuzones: Amsterdam (blue zone, tightened to Euro 5+ 1 Jan 2025), Utrecht (blue zone, April 2025), Den Haag (green zone, since 1 July 2021), Arnhem (green zone). No permit required; no fine risk. Separate zero-emission zones (ZES) for vans/trucks (N1+) launched 1 Jan 2025 — M1 BEVs out of scope.",
    owner_hint: "regulatory_affairs",
    ui_package: "country_overlay",
    process_stage: "post_market",
    recurring_post_market_obligation: true,
    content_provenance: {
      source_type: "national_gazette",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
  }),
];

export const memberStateOverlayRules: Rule[] = [
  ...priorityCountries.flatMap(buildWorkflowRules),
  ...germanyOverlayRules,
  ...franceOverlayRules,
  ...netherlandsOverlayRules,
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
