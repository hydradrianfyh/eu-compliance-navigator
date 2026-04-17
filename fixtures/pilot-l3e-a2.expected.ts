/**
 * Expected evaluation baseline for L3e-A2 BEV pilot fixture.
 *
 * This fixture deliberately has a small APPLICABLE surface because most ACTIVE
 * rules target M/N vehicles. It verifies:
 *   - L-category isolation: MN-only rules (TA-001, GSR-001, CS-001, CS-002,
 *     UN-100, EM-001, EM-003) are correctly NOT_APPLICABLE rather than
 *     APPLICABLE (which would indicate framework_group leakage).
 *   - Cross-framework battery rules: BAT-001/004/005 fire on batteryPresent
 *     alone without framework restriction.
 *   - Member-state overlay works for L-cat: DE overlays (MS-DE-001..005) have
 *     framework_group ["MN","L","O","AGRI"] + trigger on targetCountries only.
 *   - Hard governance gate: REG-TA-002 (L-cat framework) is still
 *     SEED_UNVERIFIED and remains CONDITIONAL even though trigger matches.
 */
export const pilotL3eA2Expected = {
  hardAssertions: {
    applicable_rule_ids: [
      "REG-BAT-001",
      "REG-BAT-004",
      "REG-BAT-005",
      "REG-MS-DE-001",
      "REG-MS-DE-002",
      "REG-MS-DE-003",
      "REG-MS-DE-004",
      "REG-MS-DE-005",
    ],
    total_applicable_min: 8,
    // Rules that must stay OFF for this fixture — if any of these appears
    // APPLICABLE, L-cat framework isolation has broken.
    // NOTE: REG-PV-002 (ePrivacy) is APPLICABLE even for L-cat because its trigger
    // is connectivity-based, not framework-based — correct behaviour.
    // REG-AI-001/AI-004 are NOT_APPLICABLE because this fixture sets aiLevel="none"
    // (hasAI=false), not because of framework filtering.
    // REG-UK-001 is NOT_APPLICABLE because targetCountries excludes UK.
    must_not_be_applicable_ids: [
      "REG-TA-001",
      "REG-GSR-001",
      "REG-CS-001",
      "REG-CS-002",
      "REG-UN-100",
      "REG-EM-001",
      "REG-EM-003",
    ],
  },
  softAssertions: {
    // Fewer CONDITIONALs expected — L-cat fires fewer rules overall. CL-001/CL-003
    // still CONDITIONAL from conditional_reason. TA-002 CONDITIONAL from lifecycle gate.
    conditional_count_range: [2, 20] as const,
    unknown_count_max: 130,
  },
};
