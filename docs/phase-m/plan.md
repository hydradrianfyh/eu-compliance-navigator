# Phase M Plan — Pilot-Readiness Coverage (DE · FR · ES · UK)

**Authored:** 2026-04-23
**Duration:** 8 weeks (target end: 2026-06-18)
**Status:** Ready to start (prerequisite: Phase L.6 shipped · audit 2026-04-23 published)
**Prerequisite reading:**
- [`docs/audits/coverage-audit-2026-04-23.md`](../audits/coverage-audit-2026-04-23.md) — Claude's synthesis report (post-patch)
- [`docs/audits/path-a-landscape-benchmark.md`](../audits/path-a-landscape-benchmark.md) — Codex canonical numbers matrix
- [`docs/audits/phase-1-snapshot.md`](../audits/phase-1-snapshot.md) — raw/runtime baseline

---

## 1 · Context

Phase L.6 ended with **205 rules / 101 raw-ACTIVE / 97 runtime-ACTIVE**. Two parallel coverage audits (Claude + Codex, 2026-04-23) both concluded: **205 is not "full EU landscape" comprehensive**, but it is a defensible curated subset with explicit backlog.

Key verified numbers (aggregate Codex canonical matrix):

| Benchmark | Denominator | Runtime ACTIVE | % | Interpretation |
|---|---:|---:|---:|---|
| A — Full EU landscape | 650 | 97 | 14.9% | Incomplete; ~10 category-level unknowns |
| B — 3-pilot union need | 278 | 71 | 25.5% | Business-ready only for regression anchor |
| C — Backlog completeness | 108 runtime non-ACTIVE | 104 in generated doc | 96.3% | Structurally sound, 4-item generator gap |

Phase M is **not a library-expansion phase**. It is a **pilot-readiness phase** — convert existing known-unknowns into genuinely-ACTIVE rules, close the 4 highest-leverage EU horizontal landscape gaps, and bring FR/ES/UK to DE-parity production-grade.

## 2 · Scope lock

**In-scope jurisdictions (this phase only):** DE · FR · ES · UK + EU horizontal + UNECE.

**Explicit out-of-scope this phase:**
- NL new overlay authoring (existing 5 SEED rules stay frozen as regression baseline; no promotions)
- CH / NO / IS / LI (EEA overlay) — reserve Phase N+
- IT / PL / BE / AT / SE / CZ (placeholder skeletons — stay untouched)
- CN / JP / US / TR / Western Balkans — hard-locked by AGENTS.md
- HD-specific EU horizontal gaps: Weights & Dimensions (Dir 96/53), HDV CO2 monitoring (Reg 2018/956), VECTO simulation act (Reg 2017/2400), Machinery Regulation (2023/1230) — pilots are M1; revisit only if HD pilot emerges
- UI / UX redesign — separate track gated by UI/UX audit
- Engine / governance / schema changes — no architectural shifts
- CI auto-promotion gate — Phase N candidate

## 3 · Non-goals to call out explicitly

- Do **not** author new rules for CH/NO/IS/LI even if an auditor flags them as "in-scope per AGENTS.md"
- Do **not** fabricate official URLs or OJ references — all 4 new EU horizontal rules (§5.2) require real Tier-1 sources
- Do **not** bulk-promote SEED to ACTIVE without source/date verification — promotion gate (per `docs/source-policy.md`) must hold
- Do **not** grow raw-ACTIVE count while runtime-ACTIVE stagnates — every promotion must survive `applyGovernanceToRule`
- Do **not** break `fixtures/pilot-my2027-bev.expected.ts` regression (the 51-item APPLICABLE list must grow or stay, never shrink without documented review)

## 4 · Success criteria (measurable, 2026-06-18)

| Dimension | 2026-04-23 baseline | Phase M target | How measured |
|---|---:|---:|---|
| Runtime ACTIVE rules | 97 | **≥ 135** | `applyGovernanceToRule` output count |
| Raw-ACTIVE ↔ Runtime-ACTIVE gap | 4 downgraded | **0** | Compare `rawSeedRules.filter(ACTIVE).length` vs `allSeedRules.filter(ACTIVE).length` |
| Genuinely-ACTIVE (governance-pass AND `last_human_review_at` set) | 25 / 97 (26%) | **≥ 81 / 135 (60%)** | Count rules satisfying both predicates |
| DE coverage | 🟢 production-grade | 🟢 maintained | README classification |
| FR coverage | 🟡 partial (5 ACTIVE) | **🟢 production-grade (≥ 10 ACTIVE)** | README classification |
| ES coverage | 🟢 production-grade (9 ACTIVE) | 🟢 13+ ACTIVE | README classification |
| UK coverage | 🟢 production-grade (11 ACTIVE) | 🟢 15/15 ACTIVE | README classification |
| `pilotCompleteness` BEV | ~51/100 (Codex) | **≥ 80/100** | Primary KPI, see §6 |
| `pilotCompleteness` PHEV | ~57/110 | **≥ 88/110** | Primary KPI |
| `pilotCompleteness` ICE × ES | ~44/75 | **≥ 53/75** | Primary KPI |
| Benchmark A rule-present | 205/650 = 31.5% | ~240/650 ≈ 37% | Natural growth from M.1+M.2, not chased |
| Fixture anchor staleness | 16 of 51 enumerated | **0** | `fixtures/pilot-my2027-bev.expected.ts.applicable_rule_ids` matches current engine output |

**Slogan:** Phase M is convergence, not expansion. Make the "101 ACTIVE" public claim reduce to 135 genuinely-ACTIVE with 81 human-dated.

## 5 · Sprints

### 5.1 Sprint M.0 — Data-integrity gate (Week 1)

**Blocks everything else.** If M.0 does not close, later sprints build on unstable ground.

| # | Task | Files touched | Acceptance |
|---|---|---|---|
| M.0.1 | Fix 4 runtime-downgrade rules: author `official_url` + `oj_reference` + `last_verified_on` + `promotionLog` for `REG-TA-002` (L-cat), `REG-AD-001` (R157), `REG-AD-002` (R171), `REG-DA-001` (Data Act) | `src/registry/seed/vehicle-approval.ts`, `src/registry/seed/dcas-automated.ts`, `src/registry/seed/data-access.ts` | `rawActive.length === runtimeActive.length === 101` |
| M.0.2 | **REG-CL-002 GPSR**: author scope conditions FIRST (M/N vehicle category + market), leave temporal empty or author it in same commit. Verify trigger no longer resolves to UNKNOWN without scope. | `src/registry/seed/consumer-liability.ts` | pilot evaluator test: BEV × DE gets APPLICABLE, not UNKNOWN, for GPSR |
| M.0.3 | Patch `scripts/emit-verification-backlog.ts` to include the 4 runtime-downgrade rules (pull from `allSeedRules.filter(lifecycle_state !== ACTIVE)`, not `rawSeedRules`) | `scripts/emit-verification-backlog.ts`, regenerate `docs/phase-j/verification-backlog.md` | backlog count shows 108 or 104 depending on M.0.1 completion order |
| M.0.4 | Refresh `fixtures/pilot-my2027-bev.expected.ts` `applicable_rule_ids` from 16-item Phase-11C snapshot to current 51-item engine output; keep `total_applicable_min` as floor | `fixtures/pilot-my2027-bev.expected.ts` | regression test asserts exact set, not just floor |
| M.0.5 | Update `README.md` stats line to reflect post-M.0 state (101 ACTIVE raw = runtime; genuinely-ACTIVE count explicit) | `README.md` | prose matches registry truth |

**Gate:** `npm test` green · `npx tsc --noEmit` clean · `npm run build` emits `out/` · regenerated `docs/phase-j/verification-backlog.md` shows 104 (not 108 after M.0.1). Commit message pattern: `fix(phase-m.0): close audit 2026-04-23 data-integrity findings`.

### 5.2 Sprint M.1 — EU horizontal landscape gaps (Weeks 2-3)

4 new rules, each applies to all 4 in-scope jurisdictions (DE/FR/ES/UK inherit EU regulations).

| stable_id | Title | Instrument | Trigger | Tier-1 source |
|---|---|---|---|---|
| `REG-GSR-007` | eCall / AECS (M1/N1 mandatory emergency call) | Reg (EU) 2015/758 · UN R144 Rev.1 · Del. Reg 2017/79 · Impl. Reg 2017/78 | `frameworkGroup = MN` AND `vehicleCategory in [M1, N1]` | [Reg 2015/758](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32015R0758) · [UN R144 Rev.1](https://unece.org/transport/documents/2023/02/standards/un-regulation-no-144-rev1) |
| `REG-DA-002` | AFIR vehicle-facing obligations | Reg (EU) 2023/1804 | `batteryPresent = true` AND (`chargingCapability.dc = true` OR `offersPublicChargingInfra`) | [Reg 2023/1804](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1804) |
| `REG-CS-004` | RED + cybersecurity delegated | Dir 2014/53/EU · Del. Reg 2022/30 · EN 18031-series | `connectivity includes_any [telematics, remote_control, ota]` | [Dir 2014/53](https://eur-lex.europa.eu/eli/dir/2014/53/oj) + Del Reg 2022/30 (Tier-1 portal) |
| `REG-TA-004` | WVTA Annex II master technical implementing act | Impl. Reg (EU) 2021/535 | `frameworkGroup = MN` | [Impl Reg 2021/535](https://eur-lex.europa.eu/eli/reg_impl/2021/535/oj) |

**Why these 4 specifically:**
- All three pilots' configs (BEV/PHEV/ICE) trigger ≥ 3 of the 4
- All four have verified Tier-1 source URLs already in Codex's cross-validation
- All four are in my audit's top-10 landscape unknown-unknowns
- Skipping HD-specific gaps (W&D / HDV CO2 / VECTO / Machinery) keeps scope M1-tight

**Acceptance:** 4 new rules land ACTIVE (all gates satisfied on first commit). BEV pilot runtime APPLICABLE rises from 51 → 54-55. `validateRegistryIntegrity` clean.

### 5.3 Sprint M.2 — Systematic backlog cleanup (Weeks 4-5)

Convert existing SEED to ACTIVE en masse. No new rule authoring — pure content fill.

| Batch | Target count | Rules | Work per rule |
|---|---:|---|---|
| UNECE deep-link fill | ~16 | R7, R25, R28, R30, R34, R51, R67, R87, R101, R112, R113, R116, R125, R128, R140, R145 | Replace `UNECE_PRIMARY_PORTAL` with regulation-specific deep link (visit `unece.org/transport/vehicle-regulations` landing, find consolidated text PDF) + set `last_verified_on: 2026-MM-DD` + `humanReviewer: yanhao` + `promotionLog` entry |
| EU-horizontal `makeSource` fallback fill | 6 | REG-BAT-002 (REACH), REG-CI-001 (CO2 label), REG-CI-002 (tyre label), REG-CS-003 (CRA), REG-PV-003 (EDPB), REG-MS-003 (recall notification) | EUR-Lex search for deep URL + OJ citation + verification date |
| MAC + F-gas | 2 new | `REG-EM-015` MAC Dir 2006/40, `REG-MAT-006` F-gas Reg 2024/573 | Author as DRAFT → verify → ACTIVE |

**Acceptance:** Runtime ACTIVE ≈ 125 (97 + 4 M.1 + ~24 M.2). `validateRegistryIntegrity` clean on all new ACTIVE. `npm test` green.

### 5.4 Sprint M.3 — FR overlay to production-grade (Weeks 6-7)

Target: FR from **5 ACTIVE / 12 total** → **≥ 10 ACTIVE / 12 total**. This is the biggest execution debt inside the DE/FR/ES/UK scope.

| stable_id | Current | Action |
|---|---|---|
| `REG-MS-FR-006` Crit'Air | SEED (zero content) | Légifrance search for Décret n° 2016-858 (Crit'Air), deep link, promote |
| `REG-MS-FR-007` Prime à la conversion | DRAFT | Verify applicability: OEM-facing or consumer-only? If consumer-only, downgrade to `output_kind: "information"` or deprecate |
| `REG-MS-FR-008` TVS→TAVE/TAPVP fleet tax | SEED | Légifrance code général des impôts, art. 1010, deep link, promote |
| `REG-MS-FR-009` TICPE fuel tax | SEED | Verify OEM-facing; likely informational |
| `REG-MS-FR-010` LOM | DRAFT | Verify which Loi n° 2019-1428 provisions are in force, deep link, promote |
| `REG-MS-FR-011` Malus masse 2025 | SEED | Légifrance search, deep link, promote |
| `REG-MS-FR-012` UTAC-CERAM designation | SEED (zero content) | Find **official designation decree** (not UTAC commercial site), deep link, promote |

**Acceptance:** BEV pilot (`targetCountries: ["DE","FR","NL"]`) gains ≥ 4 new APPLICABLE from FR side. FR status in `README.md` flips from 🟡 partial to 🟢 production-grade.

### 5.5 Sprint M.4 — UK residual + ES cleanup (Week 8)

| Country | Task | Rules |
|---|---|---|
| UK | Promote 3 DRAFT to ACTIVE: `REG-UK-011` (Windsor Framework NI), `REG-UK-013` (Public Charge Point Regs 2023), `REG-UK-015` (UK ETS road transport scope) + 1 SEED: `REG-UK-014` (UK REACH 2020) | 4 promotions |
| ES | Promote `REG-MS-ES-008` (Homologación Individual — needs Orden ministerial citation); finalize `REG-MS-ES-011`/`012`/`014` (ZEV phase-out, BEV incentive Plan MOVES III, CCAA regional notice) | 1 critical + 3 judgment calls |

**Acceptance:** UK 15/15 ACTIVE · ES ≥ 13/14 ACTIVE · `README.md` stats line updated.

## 6 · Part C — Pilot-completeness KPI instrumentation (parallel to M.0)

KPI: `pilotCompleteness = applicable.length / engineerExpected.length`.

### 6.1 Schema extension

Extend `fixtures/pilot-*.expected.ts` with a new field:

```ts
export const pilotExpected = {
  hardAssertions: { /* unchanged */ },
  softAssertions: { /* unchanged */ },

  // Phase M addition — Path B coverage grounding.
  engineerExpectedApplicable: [
    // Rule IDs a real homologation engineer running this pilot
    // would expect to see APPLICABLE once all known gaps are closed.
    // Authored manually from Codex audit Benchmark B stratification.
    // Denominator for pilotCompleteness.
  ] as const satisfies readonly string[],
};
```

### 6.2 Per-pilot seed (Codex Benchmark B stratification)

| Pilot | Current APPLICABLE | Target `engineerExpected.length` |
|---|---:|---:|
| MY2027 BEV × DE·FR·NL | 51 | **100** |
| MY2028 PHEV × DE·FR·NL | 57 | **110** |
| MY2027 ICE × ES | 44 | **75** |
| Union | 98 | **278** (matches Codex canonical denominator) |

### 6.3 Test + visualization

- New test file: `tests/unit/pilot-completeness.test.ts` — asserts `applicable.length ≥ target * engineerExpected.length` per pilot, where target = 0.8 / 0.8 / 0.7 at end of Phase M
- Extend `src/app/(workspace)/coverage/page.tsx` — add "Pilot completeness" section showing three pilots × (percentage + missing-rule list)
- Run `npm test` green before declaring Phase M done

## 7 · Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tier-1 source for `REG-CS-004` (RED + 2022/30) harder to find than expected | medium | M.1 delay | Accept DRAFT lifecycle if deep link not found; mark gap + ship the other 3 |
| FR UTAC-CERAM official designation source genuinely not published | medium | M.3 delay | Keep REG-MS-FR-012 DRAFT and document the blocker; don't invent a source |
| Phase M rule growth breaks existing 236-test suite | medium | Time loss | Run `npm test` after every new ACTIVE rule; batch fixes at end of each sprint |
| `engineerExpectedApplicable` seed list (100/110/75) turns out to be wrong after real user validation | low | KPI miscalibration | Allow one adjustment mid-phase; document the change with reasoning |
| 4-rule M.0.1 authoring reveals that one of REG-TA-002/AD-001/AD-002/DA-001 genuinely cannot get Tier-1 source today | low | Stuck at 100 raw-ACTIVE | Document the blocker; don't force-promote; re-plan Phase M+ around it |

## 8 · Timeline

```
Week 1       : M.0 data integrity       →  raw = runtime = 101 ACTIVE · fixture refreshed · backlog reconciled
Weeks 2-3    : M.1 EU horizontal        →  +4 new ACTIVE · BEV APPLICABLE 51→54-55
Weeks 4-5    : M.2 backlog cleanup      →  +~24 promotions · runtime ACTIVE ~125
Weeks 6-7    : M.3 FR overlay           →  +5 FR promotions · FR 🟡→🟢
Week 8       : M.4 UK + ES cleanup      →  +5 more promotions · UK 15/15 · ES ≥13/14
Parallel     : Part C KPI instrumentation (starts Week 1, ends Week 8)
```

End state: runtime ACTIVE ≥ 135, DE/FR/ES/UK all 🟢, pilotCompleteness ≥ 80/80/70, fixture anchor = current engine output.

## 9 · Exit criteria → Phase N

Phase M is complete when:
1. All 4 M.0 data-integrity items closed
2. All 4 M.1 EU horizontal rules ACTIVE with real Tier-1 sources
3. At least 20 of ~24 planned M.2 promotions land ACTIVE
4. FR has ≥ 10 ACTIVE rules (production-grade threshold)
5. UK has 15/15 ACTIVE, ES has ≥ 13/14 ACTIVE
6. `pilotCompleteness` tests green at BEV ≥ 80 / PHEV ≥ 88 / ICE ≥ 53
7. `README.md` stats line reflects post-Phase-M reality (not Phase L.6 history)

**Phase N candidate scope** (not committed — document only):
- NL overlay authoring (5 SEED → ACTIVE)
- CH / NO / IS / LI EEA decision + possible skeletons
- HD pilot support (W&D, HDV CO2 monitoring, VECTO sim)
- Cabin-camera × GDPR × AI Act intersection rule (audit §4.2 Category II item 1)
- R100 Part 2 V2G rule
- R51 §10 charging-mode noise rule
- `REG-UN-149` ADB rule ID nomenclature fix
- EVP data-structure rule (Impl Reg 2025/1707)
- CI auto-promotion gate with freshness SLA enforcement

## 10 · Cross-reference

| This plan section | Audit evidence |
|---|---|
| §5.1 M.0.1 | audit §6 row 0 · runtime downgrade 4 rules |
| §5.1 M.0.2 | audit §6 row 2 · REG-CL-002 latent over-broad |
| §5.1 M.0.3 | Codex path-a-landscape-benchmark.md "Runtime backlog not in generated backlog: 4" |
| §5.1 M.0.4 | audit §2.2 · fixture anchor hygiene debt |
| §5.2 | audit §4.2 Category I top-10 (eCall rank 1, AFIR rank 3, RED rank 6, Annex II master rank 9) |
| §5.3 | audit §4.2 Category III items 3, 4 · Codex Next-100 items 6-11 |
| §5.4 | Codex Next-100 items 17-31 (UNECE deep-link batch) |
| §5.5 | audit country coverage table (UK 11 ACTIVE + 3 DRAFT + 1 SEED) |
| §6 | audit §3 Q3 product judgment · Codex product judgment Q3 |
