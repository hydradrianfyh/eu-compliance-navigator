import { makeSeedRule, makeSource } from "@/registry/seed/shared";
import type { Rule, TriggerCondition } from "@/registry/schema";

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
  /**
   * ISO / SAE / EN standards this rule depends on. Only add high-confidence
   * mappings (≥ 80 %). For uncertain ones, leave undefined — better than
   * hallucinating a standard number.
   */
  prerequisiteStandards?: string[];
  /**
   * Phase I.2: extra trigger conditions appended to the default
   * frameworkGroup / vehicleCategory pair. Used for powertrain-gated UN
   * regulations (R34 hasFuelTank, R49 hasCombustionEngine, R67 fuelType=lpg,
   * R101 M1/N1 — already via categories, R115 fuel retrofit, R117 tyre-level).
   */
  extraConditions?: TriggerCondition[];
  /**
   * Phase I.2: override the default fallback_if_missing = "unknown" for
   * powertrain-gated UN rules where missing hasFuelTank / fuelType should
   * resolve to NOT_APPLICABLE rather than UNKNOWN.
   */
  fallbackIfMissing?: "unknown" | "not_applicable";
  /**
   * Phase I.2: notes string persisted onto `temporal.notes` — lets callers
   * record "aftermarket — OEM responsibility limited" or "Euro 7 HD takes
   * over from 2028-05-29" without a separate schema change.
   */
  temporalNotes?: string;
  /**
   * Phase J.1: per-rule evidence checklist, passed through `makeSeedRule`.
   * Used by rules like R138 AVAS that need distinct type-approval + design
   * documentation items beyond the default empty list.
   */
  evidenceTasks?: string[];
  /**
   * Phase J.1: override the factory's default manual_review_reason with a
   * rule-specific message (e.g. "UNECE deep link + R138 revision number +
   * exact EU effective dates [verify]").
   */
  manualReviewReason?: string;
  /**
   * Phase L.1: opt-in ACTIVE lifecycle for properly verified rules.
   * Only applied when ALL of these are satisfied:
   * - officialUrl is set and NOT equal to UNECE_PRIMARY_PORTAL (must be deep link)
   * - revisionLabel is non-null
   * - lastVerifiedOn is non-null ISO date
   * - humanReviewer is non-null identifier
   * Defaults undefined → rule stays SEED_UNVERIFIED.
   */
  lifecycleOverride?: "ACTIVE";

  /** ISO date string; required if lifecycleOverride === "ACTIVE". */
  lastVerifiedOn?: string;

  /** Reviewer identifier (e.g. "yanhao"); required if lifecycleOverride === "ACTIVE". */
  humanReviewer?: string;

  /** ISO date when promotion happened; required if lifecycleOverride === "ACTIVE". */
  promotedOn?: string;

  /** Promotion session/round identifier; required if lifecycleOverride === "ACTIVE". */
  promotedBy?: string;
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
  const baseConditions: TriggerCondition[] =
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
  const conditions: TriggerCondition[] = authored?.extraConditions
    ? [...baseConditions, ...authored.extraConditions]
    : baseConditions;

  const canPromote = !!(
    authored?.lifecycleOverride === "ACTIVE" &&
    authored.officialUrl &&
    authored.officialUrl !== UNECE_PRIMARY_PORTAL &&
    authored.revisionLabel &&
    authored.lastVerifiedOn &&
    authored.humanReviewer
  );
  const finalLifecycle = canPromote ? "ACTIVE" : "SEED_UNVERIFIED";

  const source = authored?.officialUrl
    ? {
        label: "UNECE regulation",
        source_family: "UNECE" as const,
        reference: `UNECE Regulation No. ${rNumber}${authored.revisionLabel ? ` ${authored.revisionLabel}` : ""}`,
        official_url: authored.officialUrl,
        oj_reference: null,
        authoritative_reference: authored.revisionLabel ?? null,
        last_verified_on: canPromote ? authored!.lastVerifiedOn! : null,
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
        notes: authored.temporalNotes ?? null,
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
    lifecycle_state: finalLifecycle,
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions,
      fallback_if_missing: authored?.fallbackIfMissing ?? "unknown",
    },
    ...(temporal ? { temporal } : {}),
    obligation_text: obligationText,
    owner_hint: "homologation",
    manual_review_reason:
      authored?.manualReviewReason ??
      "UNECE regulation applicability depends on vehicle category and Annex II row. Requires verification against current consolidated text.",
    ...(authored?.evidenceTasks ? { evidence_tasks: authored.evidenceTasks } : {}),
    ui_package: "wvta_core",
    process_stage: "type_approval",
    ...(canPromote ? {
      promoted_on: authored!.promotedOn ?? authored!.lastVerifiedOn!,
      promoted_by: authored!.promotedBy ?? "phase-l-auto",
    } : {}),
    ...(authored
      ? {
          content_provenance: {
            source_type: "unece" as const,
            retrieved_at: authored.lastVerifiedOn ?? "2026-04-20",
            human_reviewer: canPromote ? authored.humanReviewer! : null,
          },
        }
      : {}),
    ...(authored?.related ? { related_rules: authored.related } : {}),
    ...(authored?.prerequisiteStandards
      ? { prerequisite_standards: authored.prerequisiteStandards }
      : {}),
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
    prerequisiteStandards: [
      "CISPR 25 (radio disturbance — radiated emissions)",
      "ISO 11451 (vehicle EMC — whole-vehicle immunity)",
      "ISO 7637 (conducted electrical transients)",
    ],
  }),
  uneceRule("013", "13", "Heavy Vehicle Braking", "R13 Braking (HD)", ["M2", "M3", "N2", "N3"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/2025/01/standards/addendum-12-un-regulation-no-13-revision-8-amendment-13",
    revisionLabel: "Rev.8 Am.13",
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Heavy-duty vehicles (M2/M3/N2/N3) and their trailers must meet R13 service, secondary, parking and endurance brake requirements, including ABS (Annex 13), electronic braking system architecture, compatibility bands for tractor-trailer combinations, and automatic brake adjustment. The 11-series amendments extend ESC requirements to applicable categories.",
    evidenceTasks: [
      "R13 type-approval certificate for vehicle and brake system",
      "ABS Category 1 test report per Annex 13",
      "Brake compatibility band validation for tractor-trailer combinations",
      "ESC performance evidence per Annex 21 where applicable",
    ],
    related: [
      { rule_id: "REG-UN-013H", relation: "complements" },
      { rule_id: "REG-UN-140", relation: "complements" },
    ],
    temporalNotes:
      "R13 Rev.8 Amendment 13 (January 2025) is the most recent addendum at the time of authoring. R13 is the heavy-duty counterpart of R13-H; light-duty M1/N1 use R13-H. [verify] exact revision progression if further supplements have been adopted.",
  }),
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
    prerequisiteStandards: ["ISO 26262 (functional safety — brake ECU ASIL)"],
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
  uneceRule("034", "34", "Fire Prevention (Fuel Tank)", "R34 Fire Prevention", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    obligationText:
      "Vehicles with liquid-fuel tanks (M/N/O) must meet R34 crash-resistance + fire-prevention tests: side impact, rear collision, rollover, vapor tightness, plus fuel-pipe routing + containment.",
    extraConditions: [
      {
        field: "hasFuelTank",
        operator: "is_true" as const,
        value: true,
        label: "Vehicle has a liquid or gaseous fuel tank",
      },
    ],
    fallbackIfMissing: "not_applicable",
    temporalNotes:
      "Fuel-tank rule — applies only when vehicle has a liquid/gaseous fuel tank. Applies_to_new_types_from [verify]; defer until current consolidated revision text is reviewed.",
  }),
  uneceRule("043", "43", "Safety Glazing", "R43 Safety Glass", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "All glazing (windscreen, side, rear, sunroof) must be R43-approved — light transmittance, fragmentation, penetration, weathering.",
  }),
  uneceRule("044", "44", "Child Restraint Systems", "R44 Child Seats", [], ["MN"], {
    officialUrl: "https://www.unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/r044r2e.pdf",
    revisionLabel: "Rev.2 (04 series)",
    obligationText:
      "R44 establishes uniform provisions for the approval of restraining devices for child occupants of power-driven vehicles. It classifies CRS into five weight groups (0, 0+, I, II, III) and covers seat-belt-installed and ISOFIX-installed systems. R44 is a component-level regulation: vehicle manufacturers must ensure vehicle seats can accept R44-approved CRS; CRS manufacturers carry the direct type-approval burden. R44 remains in force in parallel with R129 i-Size, but new ISOFIX CRS approvals now flow only through R129.",
    evidenceTasks: [
      "Vehicle owner manual CRS compatibility statements per R44 weight groups",
      "Seat geometry and belt anchorage compliance enabling R44 CRS installation",
    ],
    related: [
      { rule_id: "REG-UN-129", relation: "supersedes" },
      { rule_id: "REG-UN-014", relation: "complements" },
      { rule_id: "REG-UN-145", relation: "complements" },
    ],
    temporalNotes:
      "R44 Rev.2 consolidated text dated February 2008; 04-series amendments continue to be supplemented. R44 remains valid in parallel with R129 but ISOFIX CRS now only approved under R129. [verify] current amendment sequence.",
  }),
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
  // Phase I.2 — heavy-duty exhaust emissions (R49).
  uneceRule("049", "49", "Heavy-Duty Exhaust Emissions", "R49 HD Emissions", ["M2", "M3", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    revisionLabel: "Rev.7 (Euro VI-E/F)",
    obligationText:
      "Heavy-duty compression-ignition and gas engines (M2/M3/N2/N3) must meet R49.06 Euro VI exhaust limits (NOx, PM, NH3, PN) via WHSC + WHTC laboratory cycles and WNTE off-cycle. Euro 7 HD (Reg (EU) 2024/1257) supersedes for new type-approvals from 2028-05-29.",
    extraConditions: [
      {
        field: "hasCombustionEngine",
        operator: "is_true" as const,
        value: true,
        label: "Vehicle has a combustion engine",
      },
    ],
    fallbackIfMissing: "not_applicable",
    temporalNotes:
      "R49 Rev.7 Euro VI-E/F current [verify exact revision]. Euro 7 HD (Reg (EU) 2024/1257) applies from 2028-05-29 new types.",
    related: [
      { rule_id: "REG-EM-002", relation: "complements" },
      { rule_id: "REG-EM-012", relation: "complements" },
    ],
  }),
  uneceRule("051", "51", "Noise Emissions", "R51 Noise", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Vehicle pass-by noise must stay within R51.03 limits. BEV-specific: no combustion noise, but AVAS per R138 mandatory.",
  }),
  uneceRule("058", "58", "Rear Underrun Protection", "R58 RUP", ["N2", "N3"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/2022/08/standards/un-regulation-no-58-rev-3-amendment-3",
    revisionLabel: "Rev.3 Am.3",
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "N2 / N3 goods vehicles must be fitted with a rear underrun protective device (RUPD) meeting R58 geometry and force-resistance requirements. The RUPD must withstand defined loads at specified test points without exceeding maximum rearward deflection, preventing small passenger vehicles from underriding the truck in a rear-end collision. The 03 series (Rev.3) adds reinforced requirements for height, ground-clearance and side-lateral span.",
    evidenceTasks: [
      "R58 type-approval certificate for the RUPD",
      "Installation drawings showing compliance with geometric limits (height, ground clearance, lateral span)",
      "Force-resistance test reports at P1, P2, P3 test points",
    ],
    related: [
      { rule_id: "REG-UN-073", relation: "complements" },
    ],
    temporalNotes:
      "R58 Rev.3 Amendment 3 published August 2022. Applies to N2/N3 (not M1); phase-in dates follow EU Annex II general pattern — [verify] exact dates if distinct from GSR2 baseline.",
  }),
  uneceRule("066", "66", "Bus Body Strength (Rollover)", "R66 Bus Rollover", ["M2", "M3"], ["MN"], {
    officialUrl: "https://unece.org/transport/vehicle-regulations-wp29/standards/addenda-1958-agreement-regulations-61-80",
    revisionLabel: "02 series",
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Large passenger vehicles (single-deck rigid or articulated buses / coaches, M2 or M3, Classes II and III, >22 passengers) must demonstrate that their superstructure retains a defined residual survival space during and after a 0.8 m drop rollover test. Five equivalent approval routes are available (Annexes 5-9): full-vehicle rollover, body-section rollover, quasi-static body-section loading, quasi-static component calculation, or computer simulation.",
    evidenceTasks: [
      "Rollover test report per Annex 5, OR equivalent evidence per Annexes 6-9",
      "Superstructure strength calculation or simulation report",
      "Residual space compliance documentation",
    ],
    temporalNotes:
      "R66 current baseline is the 02 series of amendments. [verify] deep link — landing page used here pending confirmation of the specific 02-series consolidated-text URL.",
  }),
  // Phase I.2 — LPG OEM fuel system approval (R67).
  uneceRule("067", "67", "LPG OEM Fuel System", "R67 LPG", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    revisionLabel: "01 series",
    obligationText:
      "OEM LPG fuel systems must hold a type-approved LPG tank (R67 Part I) + vehicle installation approval (R67 Part II) covering pressure relief, piping, valves, electromagnetic safety, and refuelling-receptacle geometry.",
    extraConditions: [
      {
        field: "fuelType",
        operator: "eq" as const,
        value: "lpg",
        label: "Fuel type is LPG",
      },
    ],
    fallbackIfMissing: "not_applicable",
    temporalNotes:
      "R67.01 [verify exact revision]. Applies to OEM LPG fuel systems only; aftermarket retrofit covered by R115.",
    related: [{ rule_id: "REG-UN-115", relation: "complements" }],
  }),
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
    prerequisiteStandards: ["ISO 26262 (functional safety — ACSF ASIL)"],
  }),
  // Phase J.1 — R83 temporal clarification: UN counterpart to EU light-duty
  // emissions (Reg (EC) 715/2007 + Impl Reg (EU) 2017/1151); Euro 7 supersedes
  // for new types from 2026-11-29 under the EU framework, but R83 remains
  // valid for 1958-Agreement contracting parties not transitioning.
  uneceRule("083", "83", "Pollutant Emissions (Light-Duty)", "R83 Emissions (LD)", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    temporalNotes:
      "R83 is the UN counterpart to Reg (EC) 715/2007 + Impl Reg (EU) 2017/1151 for light-duty emissions. Current text aligns to Euro 6; Euro 7 (Reg (EU) 2024/1257) will supersede for new types from 2026-11-29. R83 remains valid under the 1958 Agreement for contracting parties not transitioning to Euro 7.",
    related: [
      { rule_id: "REG-EM-013", relation: "complements" },
      { rule_id: "REG-EM-006", relation: "complements" },
    ],
  }),
  // Phase I.2 — engine power declaration (R85).
  uneceRule("085", "85", "Engine Power", "R85 Engine Power", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    obligationText:
      "M/N combustion vehicles (and electric drive) must declare net power and maximum 30-minute power per the R85 dynamometer test procedure. Declared values feed the CoC + type-approval certificate.",
    extraConditions: [
      {
        field: "hasCombustionEngine",
        operator: "is_true" as const,
        value: true,
        label: "Vehicle has a combustion engine",
      },
    ],
    fallbackIfMissing: "not_applicable",
    temporalNotes:
      "R85 covers M/N with combustion and/or electric drive. Applies_to_new_types_from [verify].",
  }),
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
    prerequisite_standards: [
      "ISO 26262 (functional safety — HV system ASIL)",
      "ISO 6469 (electrically propelled road vehicles — safety specifications)",
    ],
  }),
  // Phase I.2 — CO2 / FC light-duty (R101). UN counterpart to WLTP; Reg 2017/1151 is EU operative.
  uneceRule("101", "101", "CO2 Emissions + Fuel/Energy Consumption (Light-Duty)", "R101 CO2/FC", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    revisionLabel: "Rev.3",
    obligationText:
      "M1/N1 CO2 emissions + fuel/energy consumption measured per R101 (WLTP-compatible); includes PHEV utility-factor methodology + electric-range determination for BEV/PHEV.",
    temporalNotes:
      "R101 Rev.3 [verify exact revision]. R101 is the UN counterpart; Commission Reg (EU) 2017/1151 WLTP is the EU operative procedure.",
    related: [
      { rule_id: "REG-EM-004", relation: "complements" },
      { rule_id: "REG-EM-009", relation: "complements" },
    ],
  }),
  uneceRule("110", "110", "CNG/LNG Fuel System", "R110 CNG/LNG", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/2022/09/standards/un-regulation-no-110-rev6-amend4",
    revisionLabel: "Rev.6 Am.4 (04/05 series)",
    obligationText:
      "Vehicles using compressed natural gas (CNG) and/or liquefied natural gas (LNG) in their propulsion system must have type-approved CNG/LNG components (Part I — cylinders, fittings, pressure-relief devices, valves) and approved vehicle installation (Part II — fuel lines, filling receptacle, automatic shut-off, ventilation of gas-tight housing). Crash-integrity, fire-resistance, and temperature-cycle tests apply to tanks and piping.",
    evidenceTasks: [
      "R110 Part I type-approval certificates for CNG/LNG tanks and safety components",
      "R110 Part II vehicle-installation type-approval certificate",
      "Piping routing, pressure-relief, and gas-tight-housing ventilation drawings",
    ],
    extraConditions: [
      {
        field: "fuelType",
        operator: "in" as const,
        value: ["cng", "lng"],
        label: "Fuel type is CNG or LNG",
      },
    ],
    fallbackIfMissing: "not_applicable",
    related: [
      { rule_id: "REG-UN-115", relation: "complements" },
      { rule_id: "REG-UN-067", relation: "complements" },
    ],
    temporalNotes:
      "R110 Rev.6 Amendment 4 published September 2022. OEM CNG/LNG fuel systems only; aftermarket retrofit covered by R115. [verify] current supplement if post-2022 updates have been adopted.",
  }),
  // Phase I.2 — LPG/CNG retrofit kits (R115). Aftermarket; OEM scope only if shipping kits.
  uneceRule("115", "115", "LPG/CNG Retrofit Kits", "R115 Retrofit Kits", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    obligationText:
      "Aftermarket LPG or CNG retrofit kits must hold R115 kit-level type-approval. OEM scope only if the manufacturer is selling retrofit solutions; installer and inspection responsibilities are national.",
    extraConditions: [
      {
        field: "fuelType",
        operator: "in" as const,
        value: ["lpg", "cng"],
        label: "Fuel type is LPG or CNG",
      },
    ],
    fallbackIfMissing: "not_applicable",
    temporalNotes:
      "Aftermarket retrofit — OEM responsibility only if shipping retrofit solutions; not part of vehicle type-approval.",
  }),
  // Phase I.2 — Tyres (R117): rolling resistance + wet grip + noise.
  uneceRule("117", "117", "Tyres — Rolling Resistance / Wet Grip / Noise", "R117 Tyres", ["M1", "M2", "M3", "N1", "N2", "N3", "O1", "O2", "O3", "O4"], ["MN", "O"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    revisionLabel: "02 series",
    obligationText:
      "Tyres fitted to M/N/O vehicles must meet rolling resistance + wet grip + external noise limits per R117. Underlies EU tyre-label Reg (EU) 2020/740 and the noise framework Reg (EU) 540/2014.",
    temporalNotes:
      "R117.02 [verify exact revision]. Tyres tested at component level; the vehicle-level obligation is to fit only R117-approved tyres.",
    prerequisiteStandards: [
      "ISO 28580 (rolling resistance measurement)",
      "ISO 10844 (reference test-track surface for noise)",
    ],
  }),
  uneceRule("118", "118", "Burning Behaviour of Interior Materials", "R118 Interior Fire", ["M2", "M3"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/2023/02/standards/un-regulation-no-118-rev3",
    revisionLabel: "Rev.3 (03 series)",
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "Interior materials of M3 Class II and Class III buses / coaches (and M2 in the harmonised scope) must pass R118 tests for horizontal burning rate (Annex 6), melting behaviour (Annex 7), vertical burning rate (Annex 8), capability to repel fuel/lubricant (Annex 9), and flame-propagation resistance for electrical cables (Annex 10). City buses (M3 Class I) are excluded from R118 material scope.",
    evidenceTasks: [
      "R118 type-approval certificate or test reports per Annexes 6-10",
      "Material datasheet demonstrating each tested property",
      "Cable flame-propagation test reports per Annex 10 (for bundled electrical harness)",
    ],
    related: [
      { rule_id: "REG-UN-066", relation: "complements" },
    ],
    temporalNotes:
      "R118 Rev.3 consolidated text published February 2023. 04 series of amendments was proposed (December 2020) but adoption status [verify].",
  }),

  // Phase H.6 — R127/R140/R141/R145/R149 enriched with authored content.
  uneceRule("127", "127", "Pedestrian Safety", "R127 Pedestrian", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 and N1 vehicles must meet head-impact protection requirements on the bonnet / cowl area, upper-legform impact on the bumper, and A-pillar / windscreen header headform tests. Rev.4 Am.1 (2024) expanded the head-impact test zone and tightened jerk-limit thresholds.",
    related: [
      { rule_id: "REG-UN-094", relation: "complements" },
      { rule_id: "REG-UN-095", relation: "complements" },
      { rule_id: "REG-UN-135", relation: "complements" },
    ],
  }),
  uneceRule("129", "129", "Enhanced Child Restraint Systems (i-Size)", "R129 i-Size", [], ["MN"], {
    officialUrl: "https://unece.org/sites/default/files/2021-05/R129r4e.pdf",
    revisionLabel: "Rev.4 (03 series)",
    obligationText:
      "R129 (known as i-Size) establishes uniform provisions for the approval of Enhanced Child Restraint Systems (ECRS). It replaces the weight-based R44 classification with a stature-based (height) scheme and requires ISOFIX attachment plus a third anchorage (top tether or support leg). Testing covers dynamic frontal and side sled tests, inversion resistance, and installation compatibility with i-Size seating positions. R129 is a component-level regulation; vehicle OEMs must provide i-Size-marked seating positions per the ISOFIX anchorage framework (R145).",
    evidenceTasks: [
      "i-Size seating position identification in vehicle owner manual",
      "ISOFIX + top-tether anchorage compliance per R145 (enabling R129 CRS)",
      "Vehicle seat geometry compatible with i-Size envelope",
    ],
    related: [
      { rule_id: "REG-UN-044", relation: "supersedes" },
      { rule_id: "REG-UN-145", relation: "requires" },
      { rule_id: "REG-UN-014", relation: "complements" },
    ],
    temporalNotes:
      "R129 Rev.4 consolidated text published May 2021. R129 entered into force 9 July 2013; the 03 series is current with ongoing supplements. ISOFIX CRS now only approved via R129 (R44 remains valid in parallel but not for new ISOFIX approvals).",
  }),
  uneceRule("134", "134", "Hydrogen Vehicle Safety", "R134 Hydrogen", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: "https://unece.org/sites/default/files/2025-01/R134r1am3e.pdf",
    revisionLabel: "Rev.1 Am.3",
    obligationText:
      "Hydrogen-fuelled vehicles (fuel-cell electric vehicles and hydrogen ICE) must demonstrate safety-related performance per R134: Compressed Hydrogen Storage System (CHSS) pressure-cycle / gas-leakage / fire / bonfire / burst tests, piping and joint integrity, automatic shut-off on impact, hydrogen detection in the passenger compartment (post-crash), and electric-powertrain isolation for FCEVs. A 02 series of amendments (transposing GTR No. 13 Amendment 1) is in the WP.29 adoption pipeline.",
    evidenceTasks: [
      "R134 type-approval certificate for the vehicle and CHSS",
      "CHSS bonfire / pressure-cycle / burst test reports",
      "Hydrogen-leak detection and automatic shut-off validation",
      "Post-crash electrical isolation evidence (FCEV) coordinated with R100",
    ],
    extraConditions: [
      {
        field: "fuelType",
        operator: "eq" as const,
        value: "h2",
        label: "Fuel type is hydrogen (FCEV or H2-ICE)",
      },
    ],
    fallbackIfMissing: "not_applicable",
    related: [
      { rule_id: "REG-UN-100", relation: "complements" },
    ],
    temporalNotes:
      "R134 Rev.1 Amendment 3 published January 2025. Proposed 02 series (aligning with GTR 13 Am.1) submitted to WP.29 at the 191st session (November 2023); adoption timing [verify]. Rule only triggers for hydrogen-fuelled vehicles; BEVs without H2 are excluded.",
  }),
  uneceRule("135", "135", "Pole Side Impact", "R135 Pole Impact", ["M1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 vehicles must pass pole side-impact test (32 km/h into rigid pole). Works in tandem with R94 / R95 to give a 3-axis collision protection envelope.",
    related: [
      { rule_id: "REG-UN-094", relation: "complements" },
      { rule_id: "REG-UN-095", relation: "complements" },
    ],
  }),
  uneceRule("137", "137", "Frontal Impact (Full Width)", "R137 Full-Width Frontal", ["M1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 vehicles must pass 50 km/h full-width rigid-barrier frontal impact with Hybrid-III / THOR dummy seated at restrained driver and passenger positions. Complements R94 offset frontal.",
    related: [{ rule_id: "REG-UN-094", relation: "complements" }],
  }),
  // Phase J.1 — R138 AVAS. Closes the BEV silent-coverage gap: the engine
  // already exposed `hasAVAS` and pilot fixtures set `lighting.avas: true`,
  // but no rule consumed it. Trigger: M/N category without combustion engine
  // (BEV + FCEV). SEED_UNVERIFIED until human ratifies the UNECE deep link,
  // R138 revision number, and exact EU effective dates.
  uneceRule("138", "138", "Acoustic Vehicle Alerting System (AVAS)", "R138 AVAS", ["M1", "M2", "N1", "N2"], ["MN"], {
    officialUrl: "https://unece.org/transport/vehicle-regulations-wp29/standards/addenda-1958-agreement-regulations-121-140",
    applyToNewTypesFrom: "2019-07-01",
    applyToAllNewVehiclesFrom: "2021-07-01",
    obligationText:
      "Vehicles in M/N categories without a combustion engine (BEV and FCEV at low speed) must be equipped with an Acoustic Vehicle Alerting System (AVAS) per UNECE R138. The AVAS emits a continuous warning sound between standstill and approximately 20 km/h to alert vulnerable road users. The sound characteristics must meet R138 frequency-shift, minimum-level, and pause-switch restrictions.",
    extraConditions: [
      {
        field: "hasCombustionEngine",
        operator: "is_false" as const,
        value: false,
        label: "Vehicle has no combustion engine (BEV / FCEV)",
      },
    ],
    fallbackIfMissing: "not_applicable",
    temporalNotes:
      "applies_to_new_types_from 2019-07-01 [verify]; applies_to_all_new_vehicles_from 2021-07-01 [verify]. EU transposition via Reg (EU) 540/2014 Art. 8 (noise-type approval). UNECE deep link + R138 revision number pending human verification.",
    evidenceTasks: [
      "R138 type-approval certificate",
      "AVAS sound design specification (frequency profile, level vs speed)",
      "Pause-switch logic documentation per R138 latest revision",
      "Coordination with UN R51 overall vehicle noise compliance",
    ],
    related: [
      { rule_id: "REG-UN-051", relation: "complements" },
      { rule_id: "REG-UN-100", relation: "complements" },
    ],
    manualReviewReason:
      "UNECE deep link + R138 revision number + exact EU effective dates [verify].",
  }),
  uneceRule("140", "140", "Electronic Stability Control (ESC)", "R140 ESC", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 / N1 must have an ESC system meeting R140 performance: per-wheel brake torque control, automatic yaw-rate correction, driver override logic, sine-with-dwell test, and failure-mode indicator. Required by R13-H 01 series for light vehicles.",
    related: [
      { rule_id: "REG-UN-013H", relation: "requires" },
      { rule_id: "REG-UN-152", relation: "complements" },
    ],
    prerequisiteStandards: ["ISO 26262 (functional safety — brake ECU ASIL)"],
  }),
  uneceRule("141", "141", "Tyre Pressure Monitoring System", "R141 TPMS", ["M1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 vehicles must be equipped with TPMS that detects ≥ 20 % pressure loss on any tyre and alerts the driver within the time limits of Annex 3.",
  }),
  uneceRule("142", "142", "Tyre Installation", "R142 Tyre Install", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/2022/11/standards/un-regulation-no-142-rev-1-amend-1",
    revisionLabel: "Rev.1 Am.1 (01 series)",
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "R142 covers the installation of tyres on M/N category vehicles: every tyre fitted as original equipment must be compatible with the vehicle's maximum speed, load index and axle load, and must itself hold a valid type-approval under R30 (car tyres), R54 (commercial-vehicle tyres) or R117 (rolling resistance / wet grip / noise). The vehicle OEM carries responsibility for correct tyre / rim matching and for specifying permissible tyre sizes on the CoC.",
    evidenceTasks: [
      "R142 vehicle-level type-approval certificate",
      "Tyre type-approval references (R30 / R54 / R117) listed on the CoC",
      "Rim-tyre compatibility matrix and speed/load-index validation",
    ],
    related: [
      { rule_id: "REG-UN-117", relation: "requires" },
      { rule_id: "REG-UN-141", relation: "complements" },
    ],
    temporalNotes:
      "R142 Rev.1 Amendment 2 / Addendum 141 published December 2021; Rev.1 Amendment 1 deep-link from November 2022. ETRTO proposed a new Supplement in December 2024 [verify] adoption status.",
  }),
  uneceRule("145", "145", "ISOFIX Anchorage Systems", "R145 ISOFIX", ["M1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 vehicles with ISOFIX or i-Size child seating provisions must provide rigid anchorages per R145 (pull-test strengths, geometry, top-tether installation instructions). Interoperates with R129 i-Size CRS systems.",
    related: [
      { rule_id: "REG-UN-014", relation: "complements" },
      { rule_id: "REG-UN-016", relation: "complements" },
      { rule_id: "REG-UN-129", relation: "complements" },
    ],
    prerequisiteStandards: ["ISO 13216-1 (ISOFIX attachment + testing)"],
  }),
  uneceRule("149", "149", "LED/ADB Headlamp", "R149 LED Headlamp", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: "2021-09-01",
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 / N1 headlamps (driving / passing / fog) must meet R149 photometric limits, durability, and installation geometry. Adaptive Driving Beam (ADB) is optional and covered by R149 00/01-series amendments (no separate R161 in force).",
    related: [{ rule_id: "REG-UN-048", relation: "complements" }],
  }),

  // Phase H.6 — new rules (previously missing from registry).
  uneceRule("152", "152", "Advanced Emergency Braking System (AEBS)", "R152 AEBS (M1/N1)", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: "2023-07-10",
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 / N1 vehicles must be equipped with an Advanced Emergency Braking System per R152: forward collision warning followed by automatic braking for pedestrians, cyclists and vehicles. Sensor fusion (radar + camera) with ≥ 9 m/s² mean fully developed deceleration.",
    related: [
      { rule_id: "REG-UN-013H", relation: "requires" },
      { rule_id: "REG-UN-140", relation: "complements" },
      { rule_id: "REG-UN-155", relation: "complements" },
    ],
    prerequisiteStandards: [
      "ISO 26262 (functional safety — ECU ASIL B/C)",
      "ISO 21448 SOTIF (sensor perception safety)",
    ],
  }),
  uneceRule("153", "153", "Fuel System Integrity (Rear Impact)", "R153 Rear Fuel", ["M1", "N1"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/2021/03/standards/un-regulation-no-153-fuel-system-integrity-and-electric-power",
    revisionLabel: "original series + Am.4 (2024)",
    obligationText:
      "M1 and N1 vehicles must maintain fuel system integrity (R153 Part A — liquid-fuel and gaseous-fuel tanks) AND electric power-train safety (R153 Part B — REESS, HV electrical isolation) after a defined rear-impact collision against a 70% overlap moving-deformable barrier at 80 km/h. R153 extends the legacy R34 rear-impact scope to cover BEV/HEV/PHEV HV electrical safety, closing the gap between combustion-era and electrified rear-crash requirements.",
    evidenceTasks: [
      "R153 type-approval certificate (Part A and/or Part B as applicable)",
      "Rear-impact test report per Annex 3 / Annex 4 procedures",
      "Post-crash fuel-leak rate measurement (Part A)",
      "Post-crash HV electrical isolation + no-REESS-displacement evidence (Part B)",
    ],
    extraConditions: [
      {
        field: "vehicleCategory",
        operator: "in" as const,
        value: ["M1", "N1"],
        label: "M1 / N1 light-duty",
      },
    ],
    fallbackIfMissing: "not_applicable",
    related: [
      { rule_id: "REG-UN-034", relation: "complements" },
      { rule_id: "REG-UN-100", relation: "complements" },
      { rule_id: "REG-UN-094", relation: "complements" },
    ],
    temporalNotes:
      "R153 original series entered into force 22 January 2021 as an annex to the 1958 Agreement. Amendment 3 published March 2024; Amendment 4 published October 2024. A 01 series of amendments was proposed August 2024 [verify] adoption status.",
  }),
  uneceRule("158", "158", "Reversing Detection Devices", "R158 Reversing", ["M1", "M2", "M3", "N1", "N2", "N3"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M / N vehicles must provide direct driver rear visibility OR camera-monitor system OR detection system per R158, with rear-view image visible ≤ 2 s after reverse gear engagement and obstacle-warning response ≤ 0.6 s per Annexes 10-11.",
    related: [{ rule_id: "REG-UN-046", relation: "complements" }],
  }),
  uneceRule("160", "160", "Event Data Recorder (EDR)", "R160 EDR", ["M1", "N1"], ["MN"], {
    officialUrl: UNECE_PRIMARY_PORTAL,
    applyToNewTypesFrom: GSR2_APPLIES_NEW_TYPES_FROM,
    applyToAllNewVehiclesFrom: GSR2_APPLIES_ALL_NEW_VEHICLES_FROM,
    obligationText:
      "M1 / N1 must log ≥ 21 mandatory data elements (acceleration, speed, throttle/brake, seat-belt, airbag, yaw/pitch/roll, impact trigger) at ≥ 10 Hz over a 5-s pre-crash / 5-s post-crash window, stored in a crash-survivable non-volatile memory and retrievable via OBD-II. 01 series enforced through 2024-07-01; 02 series [verify] adoption status.",
    related: [
      { rule_id: "REG-UN-094", relation: "complements" },
      { rule_id: "REG-UN-095", relation: "complements" },
      { rule_id: "REG-UN-155", relation: "complements" },
    ],
  }),

  // Note: R161 (ADB) is NOT a standalone UNECE regulation as of 2026-04.
  // ADB is covered by R149 00/01-series amendments. Do not add REG-UN-161.
];
