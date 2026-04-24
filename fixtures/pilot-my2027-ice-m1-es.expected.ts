/**
 * Expected evaluation baseline for MY2027 ICE M1 × ES pilot.
 *
 * Introduced in Phase M Part C (2026-04-24) alongside the pilotCompleteness
 * KPI (docs/phase-m/plan.md §6). The hard/soft assertions already asserted
 * by tests/unit/pilot-ice-es-acceptance.test.ts (snapshot-based) continue to
 * apply — this file specifically adds the engineerExpectedApplicable
 * denominator used by the pilot-completeness test.
 */

export const pilotMy2027IceM1EsExpected = {
  // Phase M Part C — pilot-completeness KPI.
  //
  // engineerExpectedApplicable for MY2027 ICE M1 × ES seeded 2026-04-24 as:
  //   (a) all 70 rules currently APPLICABLE for this pilot, plus
  //   (b) pilot-relevant CONDITIONAL rules (ES-008 Homologación Individual,
  //       ES-010 ZEV 2040, ES-012 MOVES III, ES-014 CCAA notice, PV-001 /
  //       CL-001 / CL-003 conditional_reason rules, BAT-003 / BAT-010 still
  //       in SEED/DRAFT, UN-135 / UN-137 SEED M1 crash rules), plus
  //   (c) small wish-list of known backlog items.
  //
  // Excluded from the ICE × ES expected set:
  //   - DE/FR/NL/UK overlay rules (pilot targets ES only)
  //   - BEV/PHEV-only rules (pilot is ICE, no battery)
  //   - M2/M3/N2/N3 rules (pilot is M1)
  //   - AI Act Annex III / connected-vehicle rules (pilot has basic ADAS /
  //     conventional AI / minimal connectivity)
  //
  // Tracked by tests/unit/pilot-completeness.test.ts — enforces coverage
  //   ≥ 0.70 (plan §6.3 target).
  engineerExpectedApplicable: [
    // --- Currently APPLICABLE for ICE M1 × ES (70 rules, 2026-04-24) ---
    "REG-BAT-002", "REG-BAT-011", "REG-CI-001", "REG-CI-002", "REG-CS-001",
    "REG-CS-002", "REG-CS-004", "REG-DA-001", "REG-EM-001", "REG-EM-003",
    "REG-EM-007", "REG-EM-008", "REG-EM-011", "REG-EM-013", "REG-EM-015",
    "REG-GSR-001", "REG-GSR-002", "REG-GSR-003", "REG-GSR-004", "REG-GSR-005",
    "REG-GSR-006", "REG-GSR-007", "REG-MS-003", "REG-MS-ES-001", "REG-MS-ES-002",
    "REG-MS-ES-003", "REG-MS-ES-004", "REG-MS-ES-005", "REG-MS-ES-006",
    "REG-MS-ES-007", "REG-MS-ES-009", "REG-PV-002", "REG-PV-003", "REG-TA-001",
    "REG-TA-004", "REG-UN-007", "REG-UN-010", "REG-UN-013H", "REG-UN-014",
    "REG-UN-016", "REG-UN-017", "REG-UN-021", "REG-UN-025", "REG-UN-028",
    "REG-UN-030", "REG-UN-034", "REG-UN-043", "REG-UN-046", "REG-UN-048",
    "REG-UN-051", "REG-UN-079", "REG-UN-087", "REG-UN-094", "REG-UN-095",
    "REG-UN-101", "REG-UN-112", "REG-UN-113", "REG-UN-116", "REG-UN-117",
    "REG-UN-125", "REG-UN-127", "REG-UN-128", "REG-UN-140", "REG-UN-141",
    "REG-UN-142", "REG-UN-145", "REG-UN-149", "REG-UN-152", "REG-UN-158",
    "REG-UN-160",

    // --- Pilot-relevant CONDITIONAL expected to become APPLICABLE (8) ---
    "REG-MS-ES-008", "REG-MS-ES-010", "REG-MS-ES-012", "REG-MS-ES-014",
    "REG-PV-001", "REG-CL-001", "REG-CL-003",
    "REG-BAT-003",
  ] as const satisfies readonly string[],
};
