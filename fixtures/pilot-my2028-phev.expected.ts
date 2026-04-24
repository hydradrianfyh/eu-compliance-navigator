/**
 * Expected evaluation baseline for MY2028 PHEV pilot fixture.
 *
 * Delta vs. MY2027 BEV baseline (16 APPLICABLE):
 *   + REG-AI-004: applies_from_generic 2027-08-02; SOP 2028-06-01 now in force
 *                 (was FUTURE in MY2027 BEV whose SOP 2027-01-15 is before).
 *   + REG-BAT-005: applies_from_generic 2027-02-18; SOP 2028-06-01 now in force
 *                  (was FUTURE in MY2027 BEV).
 *
 * Total: 18 APPLICABLE. Verifies:
 *   - PHEV powertrain triggers the same battery-family rules as BEV
 *     (batteryPresent is the derived flag regardless of specific powertrain).
 *   - Temporal advancement moves ACTIVE-but-FUTURE rules into APPLICABLE.
 *   - AI Act Art. 6(1) timeline (REG-AI-004) gate is observed.
 */

// Phase J audit notes (2026-04-20):
//
// The applicable_rule_ids list of ~18 is intentional and reflects the governance
// hard-gate in src/engine/evaluator.ts:113-122.
//
// REG-EM-009 (PHEV CO2 Utility-Factor) and REG-EM-013 (Euro 7 Combustion Exhaust)
// appear as CONDITIONAL rather than APPLICABLE because they are SEED_UNVERIFIED.
// Their triggers DO fire correctly for PHEV (isPlugInHybrid=true, hasCombustionEngine=
// true), but the hard-gate downgrades non-ACTIVE rules to at most CONDITIONAL.
// Once these rules are promoted to ACTIVE in the separate human-verification round,
// they will surface as APPLICABLE and the expected set will grow accordingly.
//
// This is NOT silent under-serving. Do not add these stable_ids to applicable_rule_ids
// while they remain SEED_UNVERIFIED.

export const pilotMY2028PHEVExpected = {
  hardAssertions: {
    applicable_rule_ids: [
      "REG-TA-001",
      "REG-GSR-001",
      "REG-CS-001",
      "REG-CS-002",
      "REG-BAT-001",
      "REG-UN-100",
      "REG-MS-DE-001",
      "REG-MS-DE-002",
      "REG-MS-DE-003",
      "REG-MS-DE-004",
      "REG-MS-DE-005",
      "REG-EM-001",
      "REG-AI-001",
      "REG-PV-002",
      "REG-BAT-004",
      "REG-EM-003",
      "REG-AI-004",
      "REG-BAT-005",
    ],
    total_applicable_min: 18,
  },
  softAssertions: {
    // Fewer CONDITIONALs than MY2027 BEV because AI-004 and BAT-005 move out
    // of CONDITIONAL/FUTURE into APPLICABLE. Phase M.2.A lowered the floor to
    // 15 after promoting 16 UNECE R-series (R7/R25/R28/R30/R34/R51/R67/R87/R101/
    // R112/R113/R116/R125/R128/R140/R145) from SEED_UNVERIFIED to ACTIVE,
    // which collapsed ~10 rules from CONDITIONAL (hard-gate) to APPLICABLE.
    conditional_count_range: [15, 60] as const,
    unknown_count_max: 120,
  },

  // Phase M Part C — pilot-completeness KPI (docs/phase-m/plan.md §6).
  // Seeded 2026-04-24. See pilot-my2027-bev.expected.ts for methodology.
  //
  // PHEV expected set = BEV expected set + combustion-gated rules that
  // BEV NOT_APPLICABLE'd due to no combustion engine (R34 fuel-tank,
  // R83 LD emissions, R85 engine power, EM-007/008/009 utility-factor,
  // EM-013 Euro 7 combustion, FR-009 TICPE), plus BAT-008, AI-004 /
  // BAT-005 (SOP-date driven, PHEV SOP 2028-06 is in-force for both).
  //
  // Tracked by tests/unit/pilot-completeness.test.ts — enforces
  //   coverage ≥ 0.80 (plan §6.3 target).
  engineerExpectedApplicable: [
    // --- Currently APPLICABLE for PHEV × DE/FR/NL (89 rules, 2026-04-24) ---
    "REG-AD-002", "REG-AI-001", "REG-AI-004", "REG-BAT-001", "REG-BAT-002",
    "REG-BAT-004", "REG-BAT-005", "REG-BAT-008", "REG-BAT-009", "REG-BAT-011",
    "REG-CI-001", "REG-CI-002", "REG-CS-001", "REG-CS-002", "REG-CS-004",
    "REG-DA-001", "REG-DA-002", "REG-EM-001", "REG-EM-003", "REG-EM-007",
    "REG-EM-008", "REG-EM-009", "REG-EM-011", "REG-EM-013", "REG-EM-015",
    "REG-GSR-001", "REG-GSR-002", "REG-GSR-003", "REG-GSR-004", "REG-GSR-005",
    "REG-GSR-006", "REG-GSR-007", "REG-MS-003", "REG-MS-DE-001", "REG-MS-DE-002",
    "REG-MS-DE-003", "REG-MS-DE-004", "REG-MS-DE-005", "REG-MS-DE-006",
    "REG-MS-DE-010", "REG-MS-FR-001", "REG-MS-FR-002", "REG-MS-FR-003",
    "REG-MS-FR-004", "REG-MS-FR-005", "REG-MS-FR-006", "REG-MS-FR-009",
    "REG-MS-FR-010", "REG-MS-FR-011", "REG-PV-002", "REG-PV-003", "REG-TA-001",
    "REG-TA-004", "REG-UN-007", "REG-UN-010", "REG-UN-013H", "REG-UN-014",
    "REG-UN-016", "REG-UN-017", "REG-UN-021", "REG-UN-025", "REG-UN-028",
    "REG-UN-030", "REG-UN-034", "REG-UN-043", "REG-UN-046", "REG-UN-048",
    "REG-UN-051", "REG-UN-079", "REG-UN-087", "REG-UN-094", "REG-UN-095",
    "REG-UN-100", "REG-UN-101", "REG-UN-112", "REG-UN-113", "REG-UN-116",
    "REG-UN-117", "REG-UN-125", "REG-UN-127", "REG-UN-128", "REG-UN-140",
    "REG-UN-141", "REG-UN-142", "REG-UN-145", "REG-UN-149", "REG-UN-152",
    "REG-UN-158", "REG-UN-160",

    // --- Pilot-relevant CONDITIONAL expected to become APPLICABLE (16) ---
    "REG-MS-NL-001", "REG-MS-NL-002", "REG-MS-NL-003", "REG-MS-NL-004",
    "REG-MS-NL-005",
    "REG-MS-DE-009", "REG-MS-FR-012",
    "REG-PV-001", "REG-CL-001", "REG-CL-003",
    "REG-BAT-003", "REG-BAT-010", "REG-EM-014", "REG-AI-003",
    "REG-UN-135", "REG-UN-137",

    // --- Small wish-list of backlog (5) ---
    "REG-CS-003", "REG-CSRD-001", "REG-CI-003",
    "REG-UN-138", // AVAS — PHEV also subject to AVAS at low speed
    "REG-MS-FR-008", // TAVE/TAPVP — would apply if salesModel is fleet; engineer-expected
  ] as const satisfies readonly string[],
};
