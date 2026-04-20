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
    // of CONDITIONAL/FUTURE into APPLICABLE. Phase H.2-H.4 widened upper bound
    // because UNECE + FR + NL rules with temporal dates now evaluate CONDITIONAL.
    conditional_count_range: [25, 60] as const,
    unknown_count_max: 120,
  },
};
