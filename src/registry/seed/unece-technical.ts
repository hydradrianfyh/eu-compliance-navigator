import { makeSeedRule, makeSource } from "@/registry/seed/shared";

function uneceRule(
  seq: string,
  rNumber: string,
  title: string,
  shortLabel: string,
  categories: string[],
  groups: ("MN" | "L" | "O" | "AGRI")[] = ["MN"],
) {
  return makeSeedRule({
    stable_id: `REG-UN-${seq}`,
    title,
    short_label: shortLabel,
    legal_family: "unece_technical",
    jurisdiction: "UNECE",
    jurisdiction_level: "UNECE",
    framework_group: groups,
    sources: [
      makeSource("UNECE regulation", "UNECE", `UNECE Regulation No. ${rNumber}`),
    ],
    lifecycle_state: "SEED_UNVERIFIED",
    trigger_logic: {
      mode: "declarative",
      match_mode: "all",
      conditions:
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
            ],
      fallback_if_missing: "unknown",
    },
    obligation_text: `Vehicle must comply with UNECE R${rNumber} (${title}) as referenced in Annex II of the type-approval framework regulation.`,
    owner_hint: "homologation",
    manual_review_reason:
      "UNECE regulation applicability depends on vehicle category and Annex II row. Requires verification against current consolidated text.",
    ui_package: "wvta_core",
    process_stage: "type_approval",
  });
}

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

  uneceRule("010", "10", "Electromagnetic Compatibility (EMC)", "R10 EMC", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("013", "13", "Heavy Vehicle Braking", "R13 Braking (HD)", ["M2", "M3", "N2", "N3"], ["MN"]),
  uneceRule("013H", "13-H", "Passenger Car Braking", "R13-H Braking (PC)", ["M1", "N1"]),
  uneceRule("014", "14", "Safety Belt Anchorages", "R14 Belt Anchorages", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("016", "16", "Safety Belts and Restraint Systems", "R16 Safety Belts", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("017", "17", "Seat Strength", "R17 Seat Strength", ["M1", "N1"]),
  uneceRule("021", "21", "Interior Fittings", "R21 Interior Fittings", ["M1"]),
  uneceRule("025", "25", "Head Restraints", "R25 Head Restraints", ["M1", "N1"]),
  uneceRule("034", "34", "Fire Prevention (Fuel Tank)", "R34 Fire Prevention", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("043", "43", "Safety Glazing", "R43 Safety Glass", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("044", "44", "Child Restraint Systems", "R44 Child Seats", [], ["MN"]),
  uneceRule("046", "46", "Rear-View Mirrors and Devices", "R46 Mirrors", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("048", "48", "Installation of Lighting and Light-Signalling Devices", "R48 Lighting Install", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("051", "51", "Noise Emissions", "R51 Noise", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("058", "58", "Rear Underrun Protection", "R58 RUP", ["N2", "N3"], ["MN"]),
  uneceRule("066", "66", "Bus Body Strength (Rollover)", "R66 Bus Rollover", ["M2", "M3"], ["MN"]),
  uneceRule("079", "79", "Steering Equipment", "R79 Steering", ["M1", "M2", "M3", "N1", "N2", "N3"]),
  uneceRule("083", "83", "Pollutant Emissions (Light-Duty)", "R83 Emissions (LD)", ["M1", "N1"]),
  uneceRule("094", "94", "Frontal Collision Protection", "R94 Frontal Impact", ["M1", "N1"]),
  uneceRule("095", "95", "Side Collision Protection", "R95 Side Impact", ["M1", "N1"]),
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
        label: "UNECE Regulation No. 100 Revision 3 (Rev.3 Am.4)",
        source_family: "UNECE" as const,
        reference: "UNECE Regulation No. 100 Rev.3 Am.4",
        official_url: "https://unece.org/transport/documents/2022/03/standards/regulation-no-100-rev3",
        oj_reference: null,
        authoritative_reference: "E/ECE/324/Rev.2/Add.99/Rev.3",
        last_verified_on: "2026-04-16",
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
        },
        {
          field: "batteryPresent",
          operator: "is_true" as const,
          value: true,
        },
      ],
      fallback_if_missing: "unknown",
    },
    temporal: {
      entry_into_force: "2013-07-15",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: "2013-07-15",
      effective_to: null,
      small_volume_derogation_until: null,
      notes: "Rev.3 published 2022-03-25; Amendment 4 entered into force 2025-01-10.",
    },
    obligation_text:
      "Electric and hybrid vehicles must meet R100 requirements for high-voltage electrical safety, REESS (traction battery) safety, thermal propagation protection, and charging system electrical safety. Rev.3 Am.4 entered into force 2025-01-10.",
    owner_hint: "homologation",
    planning_lead_time_months: 12,
    ui_package: "wvta_core",
    process_stage: "type_approval",
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
