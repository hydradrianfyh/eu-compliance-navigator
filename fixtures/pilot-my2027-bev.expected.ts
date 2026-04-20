/**
 * Pilot MY2027 BEV evaluation baseline.
 *
 * Tracks the verified ACTIVE set as Phase 11 progresses.
 * Regression rule: list may grow but must not shrink without review.
 *
 * Phase 11A  baseline:        4 APPLICABLE
 * Phase 11B.2 promotions:    +2 (REG-UN-100, REG-BAT-001)
 * Phase 11C (DE overlay):    +5 (REG-MS-DE-001..005)
 * Phase 11B.2 batch 2:       +5 (REG-EM-001 URL fix,
 *                                REG-AI-001 URL fix,
 *                                REG-PV-002 promoted,
 *                                REG-BAT-004 promoted,
 *                                REG-EM-003 promoted)
 * Current:                   16 APPLICABLE
 *
 * Additional ACTIVEs in batch 2 (not APPLICABLE for this pilot):
 *   - REG-AI-004 (URL fix): FUTURE (applies_from_generic 2027-08-02, pilot SOP 2027-01-15)
 *   - REG-BAT-005 (promoted): FUTURE (applies_from_generic 2027-02-18)
 *   - REG-CL-001 (URL fix): CONDITIONAL (conditional_reason forces downgrade)
 *   - REG-CL-003 (promoted): CONDITIONAL (conditional_reason forces downgrade)
 *   - REG-AI-002 (promoted): NOT_APPLICABLE (pilot aiLevel != foundation_model)
 *   - REG-AI-003 (promoted): CONDITIONAL (conditional_reason forces downgrade)
 *   - REG-UK-001 (promoted): NOT_APPLICABLE (pilot has no UK target)
 *   - REG-EM-002 (promoted): NOT_APPLICABLE (pilot is M1, not M2/M3/N2/N3)
 */
export const pilotExpected = {
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
    ],
    total_applicable_min: 16,
  },
  softAssertions: {
    // CONDITIONAL count drops as SEED_UNVERIFIED → ACTIVE promotions move rules
    // to APPLICABLE / FUTURE / NOT_APPLICABLE. Lower bound is deliberately low to
    // accommodate future promotions; upper bound allows for new conditional_reason
    // rules being added. Phase H.2-H.4 widened upper bound because:
    //   - 15 UNECE R-series now have temporal dates → CONDITIONAL (hard-gate)
    //   - 5 FR + 5 NL authored SEED_UNVERIFIED with temporal → CONDITIONAL
    conditional_count_range: [25, 60] as const,
    unknown_count_max: 120,
  },
};
