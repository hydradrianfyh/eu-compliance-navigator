# Current State Snapshot — Coverage Audit

Generated: 2026-04-23  
Scope: EU 27 + UK + EEA (NO/IS/LI) + CH only. No seed rule edits were made.

## Executive Snapshot

| Metric | Raw seed registry | Governed runtime registry | Audit note |
|---|---:|---:|---|
| Total rules | 205 | 205 | Matches Phase L.6 total. |
| ACTIVE | 101 | 97 | `applyGovernanceToRule()` downgrades 4 raw ACTIVE rules with missing primary source gates. |
| Non-ACTIVE / backlog | 104 | 108 | `docs/phase-j/verification-backlog.md` is raw-seed based, so it omits 4 runtime downgrades. |
| Strict fully sourced rules | 50 | 50 | Strict means every source has `official_url`, `oj_reference`, and `last_verified_on`. |
| Code-gate fully sourced raw ACTIVE | 85 / 101 | n/a | Code requires OJ only for EUR-Lex / Commission legal sources and checks primary source only. |
| Trigger mode | 204 declarative / 1 custom | same | Custom evaluator is the DCAS exception. |
| Freshness, computed at 2026-04-23 | 29 fresh / 176 never verified | 29 fresh / 176 never verified | `freshness_status` is not materialized in seed; runtime computation shows large review-cadence debt. |

The headline “205 rules / 101 ACTIVE / 104 backlog” is true for raw seed data. The user-facing/evaluation truth is more conservative: 205 rules / 97 ACTIVE / 108 non-ACTIVE after governance.

## Governance Downgrades

These raw ACTIVE rules are not ACTIVE at runtime:

| Rule | Jurisdiction | Missing gate |
|---|---|---|
| REG-TA-002 L-category Vehicle Type-Approval Framework | EU | `official_url`, `last_verified_on` |
| REG-AD-001 Automated Lane Keeping System | UNECE | `official_url`, `last_verified_on` |
| REG-AD-002 Driver Control Assistance Systems | UNECE | `official_url`, `last_verified_on` |
| REG-DA-001 EU Data Act | EU | `official_url`, `last_verified_on` |

Under the stricter Phase 11 instruction that promotion requires all three fields (`official_url`, `oj_reference`, `last_verified_on`), only 50 rules are fully promotion-clean today. Under current code policy, UNECE and national sources may be ACTIVE without `oj_reference`, but the audit treats that as a policy inconsistency to resolve, not as a reason to weaken governance.

## Lifecycle By Legal Family

Raw seed counts:

| Legal family | ACTIVE | DRAFT | SEED_UNVERIFIED | PLACEHOLDER | SHADOW | ARCHIVED | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| ai_governance | 4 | 0 | 0 | 0 | 0 | 0 | 4 |
| consumer_information | 0 | 1 | 2 | 0 | 0 | 0 | 3 |
| consumer_liability | 2 | 1 | 3 | 0 | 0 | 0 | 6 |
| cybersecurity | 2 | 1 | 0 | 0 | 0 | 0 | 3 |
| data_access | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| dcas_automated | 2 | 0 | 0 | 1 | 0 | 0 | 3 |
| emissions_co2 | 13 | 0 | 1 | 0 | 0 | 0 | 14 |
| general_safety | 6 | 0 | 0 | 0 | 0 | 0 | 6 |
| import_customs | 0 | 1 | 4 | 0 | 0 | 0 | 5 |
| insurance_registration | 0 | 1 | 1 | 1 | 0 | 0 | 3 |
| market_surveillance | 0 | 0 | 3 | 0 | 0 | 0 | 3 |
| materials_chemicals | 7 | 1 | 2 | 2 | 0 | 0 | 12 |
| member_state_overlay | 22 | 6 | 12 | 27 | 0 | 0 | 67 |
| non_eu_market | 11 | 3 | 1 | 0 | 0 | 0 | 15 |
| privacy_connected | 2 | 0 | 1 | 0 | 0 | 0 | 3 |
| unece_technical | 27 | 0 | 26 | 1 | 0 | 0 | 54 |
| vehicle_approval | 2 | 0 | 0 | 1 | 0 | 0 | 3 |

Governed deltas: `data_access` loses 1 ACTIVE, `dcas_automated` loses 2 ACTIVE, and `vehicle_approval` loses 1 ACTIVE.

## Lifecycle By Jurisdiction

Raw seed counts:

| Jurisdiction | ACTIVE | DRAFT | SEED_UNVERIFIED | PLACEHOLDER | SHADOW | ARCHIVED | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| AT | 0 | 0 | 0 | 5 | 0 | 0 | 5 |
| BE | 0 | 0 | 0 | 5 | 0 | 0 | 5 |
| CZ | 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| DE | 8 | 1 | 1 | 0 | 0 | 0 | 10 |
| ES | 9 | 3 | 1 | 1 | 0 | 0 | 14 |
| EU | 36 | 6 | 17 | 5 | 0 | 0 | 64 |
| FR | 5 | 2 | 5 | 0 | 0 | 0 | 12 |
| IT | 0 | 0 | 0 | 5 | 0 | 0 | 5 |
| NL | 0 | 0 | 5 | 0 | 0 | 0 | 5 |
| PL | 0 | 0 | 0 | 5 | 0 | 0 | 5 |
| SE | 0 | 0 | 0 | 5 | 0 | 0 | 5 |
| UK | 11 | 3 | 1 | 0 | 0 | 0 | 15 |
| UNECE | 32 | 0 | 26 | 1 | 0 | 0 | 59 |

## Pilot Evaluation Snapshot

Evaluated against current governed registry:

| Pilot | APPLICABLE | CONDITIONAL | FUTURE | NOT_APPLICABLE | UNKNOWN | Downgraded-from-applicable |
|---|---:|---:|---:|---:|---:|---:|
| MY2027 BEV × DE/FR/NL | 51 | 27 | 4 | 45 | 78 | 21 |
| MY2028 PHEV × DE/FR/NL | 57 | 28 | 0 | 42 | 78 | 22 |
| MY2027 ICE M1 × ES | 44 | 16 | 3 | 64 | 78 | 11 |

Union of rules that are APPLICABLE / CONDITIONAL / FUTURE for at least one pilot: 98. Of these, 71 are ACTIVE, 6 are DRAFT, and 21 are SEED_UNVERIFIED.

## Evolution From Phase 0 Baseline

Phase 0 seed candidate list had 33 rules:

| Phase | Total | ACTIVE | Non-ACTIVE | Notes |
|---|---:|---:|---:|---|
| Phase 0 baseline | 33 | 14 | 19 | 13-family taxonomy; initial BEV×DE anchor. |
| Phase K.4 journey docs | 196 | 73 | 123 | Phase I/J breadth + human-review rounds. |
| Phase L.4 | 205 | 85 | 120 | Added 9 UNECE R-number stubs. |
| Phase L.6 raw seed | 205 | 101 | 104 | UNECE + ES promotions. |
| 2026-04-23 governed runtime | 205 | 97 | 108 | 4 raw ACTIVE rules downgraded by governance. |

The evolution path is breadth first, then verification: 33 baseline rules became a 205-rule registry, with Phase L focusing on pilot-visible UNECE and ES activation rather than full geographic completion.

## Full Inventory By Family

Legend: `A` raw ACTIVE, `S` SEED_UNVERIFIED, `D` DRAFT, `P` PLACEHOLDER.

- ai_governance (4): REG-AI-001(A), REG-AI-002(A), REG-AI-003(A), REG-AI-004(A)
- consumer_information (3): REG-CI-001(S), REG-CI-002(S), REG-CI-003(D)
- consumer_liability (6): REG-CL-001(A), REG-CL-002(D), REG-CL-003(A), REG-CL-004(S), REG-CL-005(S), REG-CL-006(S)
- cybersecurity (3): REG-CS-001(A), REG-CS-002(A), REG-CS-003(D)
- data_access (1): REG-DA-001(A)
- dcas_automated (3): REG-AD-001(A), REG-AD-002(A), REG-AD-003(P)
- emissions_co2 (14): REG-EM-001(A), REG-EM-002(A), REG-EM-003(A), REG-EM-004(A), REG-EM-005(A), REG-EM-006(A), REG-EM-007(A), REG-EM-008(A), REG-EM-009(A), REG-EM-010(A), REG-EM-011(A), REG-EM-012(A), REG-EM-013(A), REG-EM-014(S)
- general_safety (6): REG-GSR-001(A), REG-GSR-002(A), REG-GSR-003(A), REG-GSR-004(A), REG-GSR-005(A), REG-GSR-006(A)
- import_customs (5): REG-IMP-001(S), REG-IMP-002(S), REG-IMP-003(D), REG-IMP-004(S), REG-IMP-005(S)
- insurance_registration (3): REG-INS-001(S), REG-INS-002(D), REG-INS-003(P)
- market_surveillance (3): REG-MS-001(S), REG-MS-002(S), REG-MS-003(S)
- materials_chemicals (12): REG-BAT-001(A), REG-BAT-002(S), REG-BAT-003(S), REG-BAT-004(A), REG-BAT-005(A), REG-BAT-006(A), REG-BAT-007(A), REG-BAT-008(A), REG-BAT-009(A), REG-BAT-010(D), REG-CSRD-001(P), REG-ESPR-001(P)
- member_state_overlay (67): REG-MS-AT-001(P), REG-MS-AT-002(P), REG-MS-AT-003(P), REG-MS-AT-004(P), REG-MS-AT-005(P), REG-MS-BE-001(P), REG-MS-BE-002(P), REG-MS-BE-003(P), REG-MS-BE-004(P), REG-MS-BE-005(P), REG-MS-CZ-001(P), REG-MS-DE-001(A), REG-MS-DE-002(A), REG-MS-DE-003(A), REG-MS-DE-004(A), REG-MS-DE-005(A), REG-MS-DE-006(A), REG-MS-DE-007(D), REG-MS-DE-008(A), REG-MS-DE-009(S), REG-MS-DE-010(A), REG-MS-ES-001(A), REG-MS-ES-002(A), REG-MS-ES-003(A), REG-MS-ES-004(A), REG-MS-ES-005(A), REG-MS-ES-006(A), REG-MS-ES-007(A), REG-MS-ES-008(S), REG-MS-ES-009(A), REG-MS-ES-010(D), REG-MS-ES-011(P), REG-MS-ES-012(D), REG-MS-ES-013(A), REG-MS-ES-014(D), REG-MS-FR-001(A), REG-MS-FR-002(A), REG-MS-FR-003(A), REG-MS-FR-004(A), REG-MS-FR-005(A), REG-MS-FR-006(S), REG-MS-FR-007(D), REG-MS-FR-008(S), REG-MS-FR-009(S), REG-MS-FR-010(D), REG-MS-FR-011(S), REG-MS-FR-012(S), REG-MS-IT-001(P), REG-MS-IT-002(P), REG-MS-IT-003(P), REG-MS-IT-004(P), REG-MS-IT-005(P), REG-MS-NL-001(S), REG-MS-NL-002(S), REG-MS-NL-003(S), REG-MS-NL-004(S), REG-MS-NL-005(S), REG-MS-PL-001(P), REG-MS-PL-002(P), REG-MS-PL-003(P), REG-MS-PL-004(P), REG-MS-PL-005(P), REG-MS-SE-001(P), REG-MS-SE-002(P), REG-MS-SE-003(P), REG-MS-SE-004(P), REG-MS-SE-005(P)
- non_eu_market (15): REG-UK-001(A), REG-UK-002(A), REG-UK-003(A), REG-UK-004(A), REG-UK-005(A), REG-UK-006(A), REG-UK-007(A), REG-UK-008(A), REG-UK-009(A), REG-UK-010(A), REG-UK-011(D), REG-UK-012(A), REG-UK-013(D), REG-UK-014(S), REG-UK-015(D)
- privacy_connected (3): REG-PV-001(A), REG-PV-002(A), REG-PV-003(S)
- unece_technical (54): REG-UN-001(P), REG-UN-007(S), REG-UN-010(A), REG-UN-013(S), REG-UN-013H(A), REG-UN-014(A), REG-UN-016(A), REG-UN-017(A), REG-UN-021(A), REG-UN-025(S), REG-UN-028(S), REG-UN-030(S), REG-UN-034(S), REG-UN-043(A), REG-UN-044(A), REG-UN-046(A), REG-UN-048(A), REG-UN-049(S), REG-UN-051(S), REG-UN-058(S), REG-UN-066(S), REG-UN-067(S), REG-UN-079(A), REG-UN-083(A), REG-UN-085(S), REG-UN-087(S), REG-UN-094(A), REG-UN-095(A), REG-UN-100(A), REG-UN-101(S), REG-UN-110(S), REG-UN-112(S), REG-UN-113(S), REG-UN-115(S), REG-UN-116(S), REG-UN-117(A), REG-UN-118(S), REG-UN-125(S), REG-UN-127(A), REG-UN-128(S), REG-UN-129(A), REG-UN-134(A), REG-UN-135(S), REG-UN-137(S), REG-UN-138(A), REG-UN-140(S), REG-UN-141(A), REG-UN-142(A), REG-UN-145(S), REG-UN-149(A), REG-UN-152(A), REG-UN-153(A), REG-UN-158(A), REG-UN-160(A)
- vehicle_approval (3): REG-TA-001(A), REG-TA-002(A), REG-TA-003(P)
