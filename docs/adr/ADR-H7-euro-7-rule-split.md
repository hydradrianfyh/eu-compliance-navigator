# ADR-H7 — Euro 7 Rule Split into Framework + Combustion + Battery Durability

Status: Accepted
Date: 2026-04-20
Context: Phase I breadth expansion

## Context

Euro 7 Regulation (EU) 2024/1257 applies to all M1/N1 light-duty vehicles, but
its obligations vary dramatically by powertrain:
- **Combustion**: exhaust PN10/NOx/HC/CO limits, OBM, OBFCM, extended RDE
- **Battery-electric**: battery durability (SOH ≥80% at 5y/100k, ≥70% at 8y/160k km)
- **All powertrains**: non-exhaust emissions (tyre/brake particulate from 2028), EVP

Before Phase I, `REG-EM-001` mushed these into one rule with mixed `evidence_tasks`
("Exhaust emission test reports" was shown to BEV engineers). This silently
under-served PHEV programs (missing ICE-side evidence mapping) and over-served
BEV programs (irrelevant exhaust evidence clutter).

## Decision

Split `REG-EM-001` into three rules:
- `REG-EM-001` — Euro 7 framework — applies to all M1/N1, covers EVP + non-exhaust + scope statement
- `REG-EM-013` — Euro 7 combustion exhaust + OBFCM — trigger `hasCombustionEngine`
- `REG-EM-014` — Euro 7 battery durability — trigger `batteryPresent`

Rules are linked via `related_rules` with relation `"complements"` for navigability.

## Consequences

**Positive**:
- Evidence tasks now match the vehicle's actual scope.
- PHEV correctly receives both `-013` (combustion path) and `-014` (battery durability) — no silent gap.
- BEV correctly receives only `-001` + `-014`; does not see `-013` exhaust items.
- ICE programs see `-001` + `-013` without irrelevant battery-durability tasks.

**Negative**:
- Rule count grows by 2 for one regulation (minor navigability cost).
- Human reviewers must verify each sub-rule independently before promotion to ACTIVE.

## Alternatives Considered

1. **Keep single REG-EM-001 with conditional evidence_tasks**: rejected — Rule schema does not support conditional evidence, and tagging evidence with `[ICE]` / `[BEV]` prefixes relies on user interpretation.
2. **Separate only combustion out (013) and keep battery durability in 001**: rejected — asymmetry reduces navigability; both specialized rules are visible as distinct Applicable entries, which matches how a compliance engineer thinks.

## Dependencies

Requires the Phase I.1 engine flag additions:
- `hasCombustionEngine: boolean` — used by REG-EM-013
- `batteryPresent: boolean` — used by REG-EM-014 (existed pre-I.1)
