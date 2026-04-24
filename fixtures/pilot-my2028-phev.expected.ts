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
};
