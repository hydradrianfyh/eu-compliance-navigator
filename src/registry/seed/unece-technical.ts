import { makeSeedRule, makeSource } from "@/registry/seed/shared";
import type { Rule } from "@/registry/schema";

/**
 * Phase H.2 content enrichment:
 * Optional authored payload for a UNECE rule. When supplied, the factory
 * emits:
 *   - Verified `official_url` (UNECE primary) on sources[0]
 *   - EU Annex II phase-in dates in `temporal`
 *   - Richer obligation text
 *   - `content_provenance.source_type: "unece"` + retrieved_at (reviewer
 *     left null — rule stays SEED_UNVERIFIED until a human ratifies)
 *   - Optional related-rule links for cross-reg dependency graphs
 *
 * Rules without `authored` stay at the Phase 11 factory-default shape:
 * generic obligation + no URL + no temporal — still SEED_UNVERIFIED so
 * the hard-gate keeps them from returning APPLICABLE.
 */
interface UneceAuthored {
  /** UNECE primary PDF or portal URL. Must be real — never invent. */
  officialUrl: string;
  /** Human-readable revision label, e.g. "Rev.4 Am.1". */
  revisionLabel?: string;
  /** EU WVTA Annex II phase-in — new type-approvals from this date. */
  applyToNewTypesFrom?: string | null;
  /** EU WVTA Annex II phase-in — all new vehicles from this date. */
  applyToAllNewVehiclesFrom?: string | null;
  /** One-paragraph substantive obligation (not the generic fallback). */
  obligationText?: string;
  /** Cross-reg dependencies shown on RuleCardV2. */
  related?: Array<{
    rule_id: string;
    relation: "requires" | "complements" | "supersedes" | "conflicts";
  }>;
}

function uneceRule(
  seq: string,
  rNumber: string,
  title: string,
  shortLabel: string,
  categories: string[],
  groups: ("MN" | "L" | "O" | "AGRI")[] = ["MN"],
  authored?: UneceAuthored,
): Rule {
  const conditions =
    categories.length > 0
      ? [
          {
            field: "frameworkGroup",
            operator: "in" as const,
            value: groups,
          },
          {
            field: "vehicleCategory",
            operator: "in" as const,
            value: categories,
          },
        ]
      : [
          {
            field: "frameworkGroup",
            operator: "in" as const,
            value: groups,
          },
        ];

  const source = authored?.officialUrl
    ? {
        label: "UNECE regulation",
        source_family: "UNECE" as const,
        reference: `UNECE Regulation No. ${rNumber}${authored.revisionLabel ? ` ${authored.revisionLabel}` : ""}`,
        official_url: authored.officialUrl,
        oj_reference: null,
        authoritative_reference: authored.revisionLabel ?? null,
        last_verified_on: null, // Deliberately null — human has not yet ratified
      }
    : makeSource(
        "UNECE regulation",
        "UNECE",
        `UNECE Regulation No. ${rNumber}`,
      );

  const obligationText =
    authored?.obligationText ??
    `Vehicle must comply with UNECE R${rNumber} (${title}) as referenced in Annex II of the type-approval framework regulation.`;

  const temporal = authored
    ? {
        entry_into_force: null,
        applies_to_new_types_from: authored.applyToNewTypesFrom ?? null,
        applies_to_all_new_vehicles_from:
          authored.applyToAllNewVehiclesFrom ?? null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      }
    : undefined;

  return makeSeedRule({
    stable_id: `REG-UN-${seq}`,
    title,
    short_label: shortLabel,
    legal_family: "unece_technical",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: groups,
    sources: [source],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions,
      fallback_if_missing: "unknown",
    },
    ...(temporal ? { temporal } : {}),
    obligation_text: obligationText,
    owner_hint: "homologation",
    manual_review_reason:
      "UNECE regulation applicability depends on vehicle category and Annex II row. Requires verification against current consolidated text.",
    ui_package: "wvta_core",
    process_stage: "type_approval",
    ...(authored
      ? {
          content_provenance: {
            source_type: "unece" as const,
            retrieved_at: "2026-04-20",
            human_reviewer: null, // Not yet ratified — kept SEED_UNVERIFIED
          },
        }
      : {}),
    ...(authored?.related ? { related_rules: authored.related } : {}),
  });
}

/**
 * Phase H.2 — common Annex II phase-in dates for GSR2 / WVTA UN R-series.
 * The standard EU pattern is 6 July 2022 (new type-approvals) and
 * 7 July 2024 (all new vehicles), inherited from the GSR2 baseline in
 * Regulation (EU) 2019/2144 Annex II. Rules with different phase-in
 * (e.g. R152 AEBS, R171 DCAS) override these per-rule.
 */
const GSR2_APPLIES_NEW_TYPES_FROM = "2022-07-06";
const GSR2_APPLIES_ALL_NEW_VEHICLES_FROM = "2024-07-07";
const UNECE_PRIMARY_PORTAL =
  "https://unece.org/transport/vehicle-regulations";

export const uneceTechnicalRules = [
  makeSeedRule({
    stable_id: "REG-UN-001",
    title: "UNECE Regulation Matrix",
    short_label: "UNECE matrix",
    legal_family: "unece_technical",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN", "L", "O", "AGRI"],
    sources: [
      makeSource(
        "Framework reference",
        "EUR-Lex",
        "Annex II of Regulation (EU) 2018/858 and amendments",
      ),
    ],
    lifecycle_state: "PLACEHOLDER",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [],
      fallback_if_missing: "unknown",
    },
    obligation_text:
      "PLACEHOLDER — full vehicle-category × UNECE-regulation matrix not yet authored.",
    owner_hint: "homologation",
    notes:
      "Full vehicle-category × UNECE-regulation matrix is in Annex II of Regulation (EU) 2018/858 and amendments.",
    ui_package: "wvta_core",
    process_stage: "type_approval",
  }),

  // Phase H.2 (Sprint authored content):
  // 15 M1-BEV-priority R-series rules now carry UNECE primary URL,
  // GSR2 Annex II phase-in dates, and a one-paragraph obligation.
  // All remain SEED_UNVERIFIED (human_reviewer null) until ratified.
  uneceRule("010", "10", "Electromagnetic Compatibility (EMC)", "R10 EMC", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Vehicle and its electrical / electronic sub-assemblies must pass EMC testing per UNECE R10 (immunity + emissions). BEV-specific: on-board and external charging interfaces subject to additional emissions measurement per R10 Supplements for electric vehicles.",
  }),
  uneceRule("013", "13", "Heavy Vehicle Braking", "R13 Braking (HD)", ["M2", "M3", "N2", "N3"], ["MN"]),
  uneceRule("013H", "13-H", "Passenger Car Braking", "R13-H Braking (PC)", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 / N1 vehicles must pass R13-H braking tests. BEV-specific: regenerative braking blending must not degrade service-brake performance; ESC integration per R140 verified alongside.",
    related: [
      { rule_id: "REG-UN-079", relation: "complements" },
      { rule_id: "REG-UN-140", relation: "complements" },
    ],
  }),
  uneceRule("014", "14", "Safety Belt Anchorages", "R14 Belt Anchorages", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Seatbelt anchorages must withstand pull-tests per R14. Anchorage locations + ISOFIX integration aligned with R145.",
    related: [{ rule_id: "REG-UN-145", relation: "complements" }],
  }),
  uneceRule("016", "16", "Safety Belts and Restraint Systems", "R16 Safety Belts", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Safety belts + pretensioners must pass R16 tests (static strength, dynamic test, durability). SBR integration with seatbelt reminder per R16 Supplement 8+.",
    related: [{ rule_id: "REG-UN-014", relation: "requires" }],
  }),
  uneceRule("017", "17", "Seat Strength", "R17 Seat Strength", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Seats, their anchorages and head restraints must pass R17 static strength and dynamic sled tests.",
    related: [{ rule_id: "REG-UN-025", relation: "complements" }],
  }),
  uneceRule("021", "21", "Interior Fittings", "R21 Interior Fittings", ["M1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Interior fittings (dashboard, controls, trim) must meet R21 head-impact geometry and energy-absorption criteria.",
  }),
  uneceRule("025", "25", "Head Restraints", "R25 Head Restraints", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Head restraints must meet height, width and rearward displacement requirements per R25 (amended by 2025/1122).",
  }),
  uneceRule("034", "34", "Fire Prevention (Fuel Tank)", "R34 Fire Prevention", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"]),
  uneceRule("043", "43", "Safety Glazing", "R43 Safety Glass", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "All glazing (windscreen, side, rear, sunroof) must be R43-approved — light transmittance, fragmentation, penetration, weathering.",
  }),
  uneceRule("044", "44", "Child Restraint Systems", "R44 Child Seats", [], ["MN"]),
  uneceRule("046", "46", "Rear-View Mirrors and Devices", "R46 Mirrors", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Indirect-vision devices (mirrors + Camera Monitor Systems per R46 06 series) must meet field-of-view, glare and durability requirements.",
    related: [{ rule_id: "REG-UN-158", relation: "complements" }],
  }),
  uneceRule("048", "48", "Installation of Lighting and Light-Signalling Devices", "R48 Lighting Install", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Installation of lighting + light-signalling on the vehicle must follow R48 geometry, photometric performance and electrical interconnection rules. Matrix LED / ADB per R149 triggers extra R48 annex.",
    related: [{ rule_id: "REG-UN-149", relation: "complements" }],
  }),
  uneceRule("051", "51", "Noise Emissions", "R51 Noise", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Vehicle pass-by noise must stay within R51.03 limits. BEV-specific: no combustion noise, but AVAS per R138 mandatory.",
  }),
  uneceRule("058", "58", "Rear Underrun Protection", "R58 RUP", ["N2", "N3"], ["MN"]),
  uneceRule("066", "66", "Bus Body Strength (Rollover)", "R66 Bus Rollover", ["M2", "M3"], ["MN"]),
  uneceRule("079", "79", "Steering Equipment", "R79 Steering", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Steering equipment must meet R79 geometry, handling, and fail-safe requirements. ACSF Category A-E (driver-assist steering) covered by dedicated annex; R171 DCAS builds on this.",
    related: [
      { rule_id: "REG-AD-001", relation: "complements" },
      { rule_id: "REG-AD-002", relation: "requires" },
    ],
  }),
  uneceRule("083", "83", "Pollutant Emissions (Light-Duty)", "R83 Emissions (LD)", ["M1", "N1"], ["MN"]),
  uneceRule("094", "94", "Frontal Collision Protection", "R94 Frontal Impact", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 (≤ 2.5 t) and N1 must pass R94 40% offset deformable barrier @ 56 km/h frontal impact. BEV-specific: post-crash HV electrical safety integrated with R100 requirements.",
    related: [
      { rule_id: "REG-UN-095", relation: "complements" },
      { rule_id: "REG-UN-100", relation: "requires" },
    ],
  }),
  uneceRule("095", "95", "Side Collision Protection", "R95 Side Impact", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 and N1 must pass R95 mobile deformable barrier side impact @ 50 km/h. Side airbags + curtain airbags evaluated against occupant-injury thresholds.",
    related: [
      { rule_id: "REG-UN-094", relation: "complements" },
      { rule_id: "REG-UN-135", relation: "complements" },
    ],
  }),
  makeSeedRule({
    stable_id: "REG-UN-100",
    title: "Electric Vehicle Safety",
    short_label: "R100 EV Safety",
    legal_family: "unece_technical",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: ["MN"],
    sources: [
      {
        // Sprint 6 drift fix: seed was Rev.3 Am.4 (2022), golden says
        // current is Rev.4 Am.1 (entered into force 2025-01-10).
        label: "UNECE Regulation No. 100 Revision 4 (Rev.4 Am.1)",
        source_family: "UNECE" as const,
        reference: "UNECE Regulation No. 100 Rev.4 Am.1",
        official_url: "https://unece.org/transport/documents/2023/09/standards/un-regulation-no-100-rev4",
        oj_reference: null,
        authoritative_reference: "E/ECE/324/Rev.2/Add.99/Rev.4/Amend.1",
        last_verified_on: "2026-04-19",
      },
    ],
    lifecycle_state: "ACTIVE",
    promoted_on: "2026-04-16",
    promoted_by: "phase-11b2",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions: [
        {
          field: "frameworkGroup",
          operator: "eq" as const,
          value: "MN",
          label: "Framework group is MN",
        },
        {
          field: "batteryPresent",
          operator: "is_true" as const,
          value: true,
          label: "Vehicle has a battery",
        },
      ],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2025-01-10",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2025-01-10",
      effective_to: null,
      small_volume_derogation_until: null,
      notes:
        "Rev.4 published 2023-09; Amendment 1 entered into force 2025-01-10 (updated REESS thermal propagation tests).",
    },
    obligation_text:
      "Electric and hybrid vehicles must meet R100 requirements for high-voltage electrical safety, REESS (traction battery) safety, thermal propagation protection, and charging system electrical safety. Rev.4 Am.1 (2025-01-10) tightens thermal propagation validation and adds vibration / mechanical shock profile updates for pouch cells.",
    owner_hint: "homologation",
    planning_lead_time_months: 12,
    ui_package: "wvta_core",
    process_stage: "type_approval",
    content_provenance: {
      source_type: "unece",
      retrieved_at: "2026-04-19",
      human_reviewer: "yanhao",
    },
    related_rules: [{ rule_id: "REG-BAT-001", relation: "complements" }],
  }),
  uneceRule("110", "110", "CNG/LNG Fuel System", "R110 CNG/LNG", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("118", "118", "Burning Behaviour of Interior Materials", "R118 Interior Fire", ["M2", "M3"], ["MN"]),
  uneceRule("127", "127", "Pedestrian Safety", "R127 Pedestrian", ["M1", "N1"]),
  uneceRule("129", "129", "Enhanced Child Restraint Systems (i-Size)", "R129 i-Size", [], ["MN"]),
  uneceRule("134", "134", "Hydrogen Vehicle Safety", "R134 Hydrogen", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("135", "135", "Pole Side Impact", "R135 Pole Impact", ["M1"]),
  uneceRule("137", "137", "Frontal Impact (Full Width)", "R137 Full-Width Frontal", ["M1"]),
  uneceRule("140", "140", "Electronic Stability Control (ESC)", "R140 ESC", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("141", "141", "Tyre Pressure Monitoring System", "R141 TPMS", ["M1"]),
  uneceRule("142", "142", "Tyre Installation", "R142 Tyre Install", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("145", "145", "ISOFIX Anchorage Systems", "R145 ISOFIX", ["M1"]),
  uneceRule("149", "149", "LED/ADB Headlamp", "R149 LED Headlamp", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("153", "153", "Fuel System Integrity (Rear Impact)", "R153 Rear Fuel", ["M1", "N1"]),
];
