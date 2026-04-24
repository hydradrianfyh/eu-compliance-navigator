/**
 * Pilot MY2027 BEV evaluation baseline.
 *
 * Tracks the verified ACTIVE set as Phase 11 / Phase L / Phase M progresses.
 * Regression rule: list may grow but must not shrink without review.
 *
 * History:
 *   Phase 11A  baseline:        4 APPLICABLE
 *   Phase 11B.2 promotions:    +2 (REG-UN-100, REG-BAT-001)
 *   Phase 11C (DE overlay):    +5 (REG-MS-DE-001..005)
 *   Phase 11B.2 batch 2:       +5 (REG-EM-001 URL fix, REG-AI-001 URL fix,
 *                                  REG-PV-002 promoted, REG-BAT-004 promoted,
 *                                  REG-EM-003 promoted)
 *                              ↳ 16 APPLICABLE (Phase 11C-era snapshot)
 *   Phase L.1-L.6 promotions: ~+35 (UNECE R-series batch + GSR + DE-006/010 +
 *                                   FR-001..005 + EM-011 + BAT-009)
 *                              ↳ 51 APPLICABLE (pre-Phase-M runtime)
 *   Phase M.0.1 data gate:    +2 (REG-DA-001 Data Act URL fix,
 *                                 REG-AD-002 R171 DCAS source fix — both
 *                                 runtime-ungraded from SEED_UNVERIFIED)
 *                              ↳ 53 APPLICABLE (post Phase M.0)
 *   Phase M.1 EU horizontal:  +4 (REG-GSR-007 eCall / AECS,
 *                                 REG-DA-002 AFIR vehicle-facing,
 *                                 REG-CS-004 RED cyber + Del Reg 2022/30,
 *                                 REG-TA-004 WVTA Annex II master 2021/535)
 *                              ↳ 57 APPLICABLE (post Phase M.1)
 *   Phase M.2.A UNECE fill:  +14 (REG-UN-007 / -025 / -028 / -030 / -051 / -087 /
 *                                 -101 / -112 / -113 / -116 / -125 / -128 /
 *                                 -140 / -145 — promoted SEED→ACTIVE with deep
 *                                 links; R34 / R67 stay NOT_APPLICABLE for BEV
 *                                 because BEV has no fuel tank / no LPG)
 *                              ↳ 71 APPLICABLE (post Phase M.2.A)
 *   Phase M.2.B EU horizontal: +5 (REG-BAT-002 REACH,
 *                                  REG-CI-001 CO2 label (Dir 1999/94/EC),
 *                                  REG-CI-002 Tyre label (Reg 2020/740),
 *                                  REG-PV-003 EDPB Connected-Vehicle Guidelines,
 *                                  REG-MS-003 Recall (Reg 2018/858 Arts 52-53))
 *                              ↳ 76 APPLICABLE (post Phase M.2.B)
 *   Phase M.2.C MAC + F-gas:  +2 (REG-EM-015 MAC Dir 2006/40/EC — M1/N1 with
 *                                 GWP ≤ 150 refrigerant,
 *                                 REG-BAT-011 F-gas Reg (EU) 2024/573 —
 *                                 replaces Reg 517/2014, phase-down schedule +
 *                                 labelling + quotas)
 *                              ↳ 78 APPLICABLE (current runtime, 2026-04-24)
 *
 * Notable runtime-ACTIVE rules NOT APPLICABLE for this pilot (by design):
 *   - REG-TA-002 L-category framework: pilot is M1, not L
 *   - REG-AD-001 R157 ALKS: pilot automationLevel l2plus, not L3+
 *   - REG-AI-004 Art. 6(1): FUTURE (applies_from 2027-08-02, SOP 2027-01-15)
 *   - REG-BAT-005: FUTURE (applies_from 2027-02-18)
 *   - REG-CL-001 PLD, REG-CL-003 Sale of Goods, REG-AI-003 AI Act Annex III:
 *     CONDITIONAL (conditional_reason forces downgrade from hard-gate perspective)
 *   - REG-AI-002 GPAI: NOT_APPLICABLE (aiLevel != foundation_model)
 *   - REG-UK-*: NOT_APPLICABLE (pilot has no UK target; targetCountries = DE/FR/NL)
 *   - REG-EM-002 Euro 7 HD: NOT_APPLICABLE (M1 pilot, not M2/M3/N2/N3)
 */
export const pilotExpected = {
  hardAssertions: {
    applicable_rule_ids: [
      "REG-AD-002",
      "REG-AI-001",
      "REG-BAT-001",
      "REG-BAT-002",
      "REG-BAT-004",
      "REG-BAT-009",
      "REG-BAT-011",
      "REG-CI-001",
      "REG-CI-002",
      "REG-CS-001",
      "REG-CS-002",
      "REG-CS-004",
      "REG-DA-001",
      "REG-DA-002",
      "REG-EM-001",
      "REG-EM-003",
      "REG-EM-011",
      "REG-EM-015",
      "REG-GSR-001",
      "REG-GSR-002",
      "REG-GSR-003",
      "REG-GSR-004",
      "REG-GSR-005",
      "REG-GSR-006",
      "REG-GSR-007",
      "REG-MS-003",
      "REG-MS-DE-001",
      "REG-MS-DE-002",
      "REG-MS-DE-003",
      "REG-MS-DE-004",
      "REG-MS-DE-005",
      "REG-MS-DE-006",
      "REG-MS-DE-010",
      "REG-MS-FR-001",
      "REG-MS-FR-002",
      "REG-MS-FR-003",
      "REG-MS-FR-004",
      "REG-MS-FR-005",
      "REG-PV-002",
      "REG-PV-003",
      "REG-TA-001",
      "REG-TA-004",
      "REG-UN-007",
      "REG-UN-010",
      "REG-UN-013H",
      "REG-UN-014",
      "REG-UN-016",
      "REG-UN-017",
      "REG-UN-021",
      "REG-UN-025",
      "REG-UN-028",
      "REG-UN-030",
      "REG-UN-043",
      "REG-UN-046",
      "REG-UN-048",
      "REG-UN-051",
      "REG-UN-079",
      "REG-UN-087",
      "REG-UN-094",
      "REG-UN-095",
      "REG-UN-100",
      "REG-UN-101",
      "REG-UN-112",
      "REG-UN-113",
      "REG-UN-116",
      "REG-UN-117",
      "REG-UN-125",
      "REG-UN-127",
      "REG-UN-128",
      "REG-UN-138",
      "REG-UN-140",
      "REG-UN-141",
      "REG-UN-142",
      "REG-UN-145",
      "REG-UN-149",
      "REG-UN-152",
      "REG-UN-158",
      "REG-UN-160",
    ],
    total_applicable_min: 78,
  },
  softAssertions: {
    // CONDITIONAL count drops as SEED_UNVERIFIED → ACTIVE promotions move rules
    // to APPLICABLE / FUTURE / NOT_APPLICABLE. Lower bound is deliberately low to
    // accommodate future promotions; upper bound allows for new conditional_reason
    // rules being added. Phase M.2.A promoted 16 UNECE R-series (R7 / R25 / R28 /
    // R30 / R34 / R51 / R67 / R87 / R101 / R112 / R113 / R116 / R125 / R128 / R140 /
    // R145) from SEED_UNVERIFIED to ACTIVE, which collapsed roughly a dozen rules
    // from CONDITIONAL (hard-gate downgrade) to APPLICABLE (now satisfy lifecycle).
    // Lower bound widened 25 → 15 to reflect the smaller CONDITIONAL surface.
    conditional_count_range: [15, 60] as const,
    unknown_count_max: 120,
  },
};
