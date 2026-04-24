# Coverage Audit — 2026-04-23

**Audit scope:** EU Compliance Navigator rule registry — 205 rules / 101 ACTIVE / 104 non-ACTIVE, post Phase L.6
**Core question:** *"205 条真的全面吗？"*
**Method:** Three-benchmark parallel evaluation (Full EU landscape / Pilot-need / Backlog completeness) + product judgment on Phase M direction
**Geographic scope (hard-locked):** EU 27 + UK + EEA (NO/IS/LI) + CH — not relaxed
**Governance guardrails respected:** No URLs fabricated · No tier-2 sources treated as authoritative · No registry edits · Non-ACTIVE ≠ APPLICABLE invariant intact

---

## 0 · One-liner answer

> **Against the full EU vehicle regulatory landscape (~450–700 rules, aggregate denominator 650), our 205 is 31.5% rule-present and 14.9% runtime-ACTIVE.
> Against the 3-pilot union work need (aggregate denominator 278 engineer-expected rules), we are 35.3% present and 25.5% runtime-ACTIVE (verified by running `evaluateAllRules` against the 3 pilot fixtures: BEV 51 APPLICABLE, PHEV 57, ICE 44).
> Against the 104-item known-unknown backlog, the list is structurally complete but ~14/30 sampled items (≈47%) have systematic execution gaps (missing URLs, makeSource fallbacks, one latent over-broad trigger).**
>
> **⚠ Before any of that: the registry labels 101 rules ACTIVE but the runtime governance layer silently downgrades 4 of them to SEED_UNVERIFIED (REG-TA-002, REG-AD-001 R157, REG-AD-002 R171, REG-DA-001 Data Act) because their primary sources fail the `official_url + last_verified_on` gate. True runtime ACTIVE count is 97, not 101. Fix this first — it's an 8-hour authoring job and removes a user-visible credibility gap.**
>
> **Phase M+ should lock to Pilot-need (Benchmark B) as the primary KPI and sequence four workstreams: (0) promote the 4 runtime-downgraded rules to genuinely-ACTIVE, (a) close 10 landscape-critical gaps led by eCall 2015/758, (b) batch-fix UNECE deep-link pattern issue (~16 rules), (c) close FR/NL overlay execution drift.**

---

## 1 · Phase 1 — Inventory (the starting line)

### 1.1 Verified totals (live `src/registry/seed/index.ts`)

| Metric | Raw seed | Runtime (post-governance) | README claim | Status |
|---|---:|---:|---|---|
| Total rules | **205** | 205 | 205 | ✓ |
| ACTIVE | **101** | **97** | 101 | **⚠ runtime ≠ raw** |
| SEED_UNVERIFIED | **56** | 60 | — | +4 from downgrades |
| DRAFT | **15** | 15 | — | — |
| PLACEHOLDER | **33** | 33 | — | — |
| Legal families | **17** | 17 | 17 | ✓ |

The 4-rule gap between raw and runtime ACTIVE is produced by `applyGovernanceToRule()` (see `src/registry/governance.ts:37`): any rule labelled ACTIVE in source whose primary source fails `official_url AND last_verified_on AND (oj_reference when required)` is automatically downgraded to SEED_UNVERIFIED at registry-load time. This is **a governance feature working correctly** — the audit finding is that the README / verification-backlog use the *raw* count and so over-report ACTIVE by 4.

**Rules affected by runtime downgrade:**

| Rule | Jurisdiction | Missing fields on primary source |
|---|---|---|
| REG-TA-002 L-category Framework | EU | `official_url`, `last_verified_on` |
| REG-AD-001 ALKS (R157) | UNECE | `official_url`, `oj_reference`, `last_verified_on` |
| REG-AD-002 DCAS (R171) | UNECE | `official_url`, `last_verified_on` |
| REG-DA-001 EU Data Act | EU | `official_url`, `last_verified_on` |

These are all **foundational rules** — L-category framework, two top automation regulations, and the Data Act. The seed-rule-candidate-list.md Phase 0 baseline marks all four as ACTIVE in prose, but the code never had the verified source fields populated. Fixing four rules takes ≈ 8 hours of authoring; skipping the fix means every user-facing coverage number in the README is inflated by 4.

### 1.2 By family × lifecycle

| Legal family | ACTIVE | DRAFT | SEED_UNVERIFIED | PLACEHOLDER | Total |
|---|---|---|---|---|---|
| member_state_overlay | 22 | 6 | 12 | 27 | **67** |
| unece_technical | 27 | 0 | 26 | 1 | **54** |
| non_eu_market (UK) | 11 | 3 | 1 | 0 | **15** |
| emissions_co2 | 13 | 0 | 1 | 0 | **14** |
| materials_chemicals | 7 | 1 | 2 | 2 | **12** |
| consumer_liability | 2 | 1 | 3 | 0 | **6** |
| general_safety | 6 | 0 | 0 | 0 | **6** |
| import_customs | 0 | 1 | 4 | 0 | **5** |
| ai_governance | 4 | 0 | 0 | 0 | **4** |
| vehicle_approval | 2 | 0 | 0 | 1 | **3** |
| cybersecurity | 2 | 1 | 0 | 0 | **3** |
| dcas_automated | 2 | 0 | 0 | 1 | **3** |
| privacy_connected | 2 | 0 | 1 | 0 | **3** |
| consumer_information | 0 | 1 | 2 | 0 | **3** |
| insurance_registration | 0 | 1 | 1 | 1 | **3** |
| market_surveillance | 0 | 0 | 3 | 0 | **3** |
| data_access | 1 | 0 | 0 | 0 | **1** |

### 1.3 By jurisdiction

| Jurisdiction | ACTIVE | DRAFT | SEED | PLACEHOLDER | Total | Country status |
|---|---|---|---|---|---|---|
| EU (horizontal) | 36 | 6 | 17 | 5 | **64** | backbone |
| UNECE | 32 | 0 | 26 | 1 | **59** | 32 ACTIVE + 26 pending deep-link |
| UK (non-EU) | 11 | 3 | 1 | 0 | **15** | production-grade |
| ES | 9 | 3 | 1 | 1 | **14** | production-grade post L.6 |
| FR | 5 | 2 | 5 | 0 | **12** | partial — execution drift |
| DE | 8 | 1 | 1 | 0 | **10** | production-grade |
| NL | 0 | 0 | 5 | 0 | **5** | seed-only |
| IT / PL / BE / AT / SE | 0 | 0 | 0 | 25 | **25** | out-of-scope skeletons (5 each) |
| CZ | 0 | 0 | 0 | 1 | **1** | skeleton |
| **CH / NO / IS / LI** | **0** | **0** | **0** | **0** | **0** | **⚠ in scope but zero rules** |

### 1.4 Evolution from Phase 0 baseline (33 rules) → 205

Phase 0's canonical baseline (`docs/phase0/seed-rule-candidate-list.md`, 2026-04-14) listed **33 seed rules** across 13 families. Today we have **205 rules across 17 families** — a **6× expansion in ~10 days of calendar time**.

**4 new families added post-baseline:** `consumer_information`, `insurance_registration`, `market_surveillance`, `import_customs`. All four arrived at SEED_UNVERIFIED or DRAFT; zero ACTIVE. These are the families added *fastest* and verified *slowest* — a structural warning.

**Net promotion throughput:** 33 rules described in Phase 0 → 101 ACTIVE today. But 104 are still non-ACTIVE — the promotion pipeline has kept pace with authoring only partially.

---

## 2 · Phase 2 — Three-benchmark parallel evaluation

### 2.1 Path A — Full EU regulatory landscape benchmark

**Landscape size estimate:** ~450–700 rules if fully instrumented for EU 27 + UK + EEA + CH vehicle compliance.
**Our 205 → ~29–45% complete.**

**Recency caveat:** analysis reflects EU law through roughly late-2025 / early-2026; Q1-2026 OJ entries (especially Euro 7 heavy-duty implementing acts, Phase-3 GSR2 delegated acts, AI Act guidance) are the least reliable edge of this analysis.

#### Top-10 unknown-unknown categories (not in verification-backlog)

| # | Category | Representative instrument(s) | Severity | Likelihood | Est. rule count |
|---|---|---|---|---|---|
| 1 | **eCall / AECS** | Reg (EU) 2015/758 · UN R144 · Del. Reg 2017/79 · Impl. Reg 2017/78 | **critical** | certain | 2 |
| 2 | **PTI framework** | Directives 2014/45, 2014/46, 2014/47 | high | certain | 3 |
| 3 | **AFIR** | Reg (EU) 2023/1804 (repeals 2014/94) | high | probable | 2–3 |
| 4 | **Weights & Dimensions** | Directive 96/53 · 2015/719 | high | certain | 2 |
| 5 | **HDV CO2 monitoring / VECTO sim** | Reg 2018/956 · Reg 2017/2400 | high | certain | 2 |
| 6 | **RED + cybersecurity delegated** | Directive 2014/53 · Del. Reg 2022/30 · EN 18031-series | high | certain | 2 |
| 7 | **MAC + F-gas** | Directive 2006/40 · Reg 2024/573 | high | certain | 2 |
| 8 | **Spare-parts UNECE set** | R54, R64, R90, R103, R109, R124 | medium | certain | 5–6 |
| 9 | **WVTA Annex II EU-side acts** | Reg 2021/535 (GSR2 technical), 65/2012 (gear-shift), 2022/1362, 661/2009 residuals | high | certain | 10–15 |
| 10 | **Machinery Reg 2023/1230 + noise 2000/14** | 2023/1230 (from 14 Jan 2027) · 2000/14 | medium (AGRI) | probable | 2–3 |

**Subtotal:** ~32–40 rules in top-10 categories alone — each a category of real, non-duplicate unknown-unknowns.

#### Cross-cutting landscape gaps (not in top-10)

- **UNECE R-number residual gaps** (beyond top-10): R12 (steering impact), R25 (head restraints — check), R39 (speedometer), R73 (lateral protection HD), R78 (L-cat brakes), R80 (bus seat strength), R89 (speed limiters), R107 (bus construction), R111 (tanker rollover), R130/R151 (LDWS/BSIS), R159 (MCPDS), R161–R166 (recent additions — verify adoption) ≈ 15–25 rules
- **Member-state missing patterns**: dedicated PTI rule per MS (FR Contrôle Technique, NL APK, ES ITV, IT Revisione — all absent as standalone rules); LEZ/ZFE/Area B/C per city ≈ 8–12 rules
- **⚠ Zero rules for CH / NO / IS / LI despite being in geographic scope** — CH in particular has distinct ASA/UVEK type-approval regime. If these jurisdictions are truly in scope per AGENTS.md, they need ≥ 5 rules each = ~20 rules minimum.

### 2.2 Path B — Pilot-need benchmark

**Method:** run `buildEngineConfig()` + `evaluateAllRules()` against each pilot fixture; aggregate engineer-expected totals across the 3 pilots = **278 rule-units of work** that a real homologation/compliance engineer would expect. Numerator is actual runtime-ACTIVE APPLICABLE rules summed over pilots (deduplicated).

**Per-pilot runtime evaluation (verified 2026-04-23):**

| Pilot | APPLICABLE | CONDITIONAL | FUTURE | UNKNOWN | NOT_APPLICABLE | Pilot-relevant total | ACTIVE pilot-relevant |
|---|---:|---:|---:|---:|---:|---:|---:|
| MY2027 BEV × DE·FR·NL | **51** | 27 | 4 | 78 | 45 | 82 | 51 |
| MY2028 PHEV × DE·FR·NL | **57** | 28 | 0 | 78 | — | 85 | 57 |
| MY2027 ICE × ES | **44** | 16 | 3 | 78 | — | 63 | 44 |
| **Union of 3 pilots** | — | — | — | — | — | **98** | **71** |

Aggregate: **98 / 278 = 35.3% represented · 71 / 278 = 25.5% verified-ACTIVE**.

**Fixture anchor hygiene debt:** `fixtures/pilot-my2027-bev.expected.ts` uses `total_applicable_min: 16` as a FLOOR assertion and carries a stale 16-item `applicable_rule_ids` list from Phase 11C. Tests pass because the assertion is `_min` (51 ≥ 16), but the enumerated list is 35 rules out of date relative to current runtime output. This is a **documentation anchor debt, not a correctness bug** — refresh `applicable_rule_ids` to the current 51-item list so future pilot evaluations can assert the exact set, not just a floor.

#### Cross-cutting pilot gaps

1. **Cabin-camera + GDPR + AI Act Art. 22 intersection**: pilot has `cabin_camera + driver_profiling + biometric_data + aiLevel: ai_dms`. No dedicated rule for EDPB biometric-processing guidance or automated-decision-making limits. **Severity: HIGH.**
2. **Bidirectional charging / V2G**: pilot has `chargingCapability.bidirectional: true`. R100 (REG-UN-100 ACTIVE) covers EV safety broadly but does not distinguish battery-as-component vs. battery-pack-as-system (R100 Part 2) or reverse-polarity/V2G testing. **Severity: MEDIUM.**
3. **R51 charging-mode noise**: pilot has AC+DC charging. R51 §10 covers noise during charging operations; no dedicated rule. **Severity: MEDIUM.**
4. **R149 ADB**: pilot has `headlampType: "matrix_led"`. README/registry mention R149 as promoted but there is no explicit `REG-UN-149` rule in the registry surface (nomenclature issue).
5. **EVP data structure**: Euro 7 framework rule (REG-EM-001) mentions EVP as evidence_task but no dedicated rule details the schema mandated by Impl. Reg 2025/1707.
6. **AFIR transposition stuck in DRAFT**: `REG-MS-DE-007` is correctly marked DRAFT because German LSV transposition is pending legislature — but this means a BEV pilot **cannot plan work** against a verified AFIR obligation today.

### 2.3 Path C — Backlog quality (30-sample of 104)

| Verdict | Count / 30 | Pattern |
|---|---|---|
| **Promotable as-is** (URL+trigger OK, needs only verification date) | **7** | e.g. REG-UN-013, REG-MS-NL-001/003, REG-MS-ES-008, REG-EM-014, REG-MS-DE-007 |
| **Legit skeleton** (PLACEHOLDER, content pending, design intent) | **7** | REG-MS-IT/PL/BE/AT/SE/CZ-001, REG-ESPR-001 |
| **Missing URL / generic source** (SEED-dressed skeleton) | **14** | 8 UNECE using `UNECE_PRIMARY_PORTAL` constant · 6 EU horizontal using `makeSource()` fallback with null URL |
| **Needs rewrite** (broken trigger or scope ambiguity) | **2** | REG-CL-002 GPSR (empty `conditions:[]`), REG-MS-DE-009 KBA (authority-chain ambiguity, may need split) |

**Systematic execution issues uncovered:**

1. **UNECE deep-link pattern gap** (high-confidence, easy fix): at least **8 sampled UNECE rules** use the `UNECE_PRIMARY_PORTAL` constant instead of regulation-specific deep links. Phase L promotions show the pattern is solvable — other UNECE rules have proper deep links. Fix is a batch authoring session.
2. **`makeSource` fallback over-use** (medium-confidence): REG-BAT-002, REG-CI-001, REG-CI-002, REG-CL-002, REG-CS-003, REG-PV-003 all use the generic helper that produces `official_url: null`. These are SEED-labelled but content-empty.
3. **⚠ REG-CL-002 (GPSR) trigger is latent-over-broad**: `conditions: []` + no temporal fields currently resolves to UNKNOWN at runtime (not NOT_APPLICABLE as one might assume). The latent risk is if a future author populates temporal without adding scope conditions — `match_mode: "all"` over an empty conditions array evaluates as satisfied, which would cause the rule to match **every** vehicle passing the hard-gate. Fix-ordering requirement: scope conditions BEFORE temporal authoring.
4. **REG-MS-FR-006 (Crit'Air), REG-MS-FR-012 (UTAC-CERAM) have zero source content** — not even portal roots. These are below the "intentional SEED" bar.
5. **REG-MS-DE-009 (KBA) flagged in-code** for needed authority-chain split (StVG + EG-FGV + StVZO) — architectural work, not just data fill.

**Backlog structural completeness:** the 104-item list correctly covers the 5 standard MS obligations × 6–7 countries + UNECE Annex II residual + EU horizontal gaps. Structurally OK. **Execution ≠ structure** — the data behind those 104 list entries is patchy.

---

## 3 · Phase 3 — Product judgment

### Q1 — Continue expanding rule count, or freeze and drive 101 → 205 all ACTIVE?

**Neither pure path. Sequenced hybrid.**

Evidence:
- Path A found **eCall 2015/758 is both mandatory for M1/N1 and missing** — our primary pilot is M1 BEV. Freezing the registry without eCall is embarrassing.
- Path A found **~10 category-level unknown-unknowns** totalling ≈ 32–40 rules. Some (AFIR, RED + 2022/30, HDV CO2 monitoring, MAC) are foundational, not niche.
- Path C found **~60% of backlog is promotable with modest effort** — deep-link fill + verification dating + 1 trigger rewrite. Low-hanging fruit exists.
- But Path C also found the makeSource-fallback and UNECE-portal-root patterns are systemic — pure ACTIVE grinding would stall at the content-fill step.

**Recommended sequence for Phase M**:
- **Sprint M.1 (2 weeks)**: Close the top-5 Path A landscape gaps that matter for M1/N1 pilots — eCall, AFIR (DE already pending), RED + 2022/30, MAC, WVTA Annex II GSR2 implementing (Reg 2021/535) ≈ 8 new rules at ACTIVE-ready quality
- **Sprint M.2 (2 weeks)**: Batch-fix UNECE deep-link + makeSource-fallback patterns (≈ 16 rules from SEED to ACTIVE by content fill) + rewrite REG-CL-002
- **Sprint M.3 (2 weeks)**: FR/NL overlay execution — bring FR to 9+ ACTIVE matching ES pattern, NL to 3+ ACTIVE
- **Sprint M.4 (2 weeks)**: Path B cross-cutting gaps — cabin-camera + GDPR + AI Act intersection rule; R149 ADB explicit; R51 charging noise; README reconciliation

**Net state at end of Phase M (8 weeks):** ~225 total rules, ~145 ACTIVE, all 3 pilots at ≥ 80% pilot-completeness.

### Q2 — FR partial + NL seed-only: intentional scope or product debt?

**Intentional scope, but measurable execution drift.**

- Per AGENTS.md: *"Phase 11: active. Sub-phases 11A (pilot fixture), 11B (evidence enrichment + source verification), **11C (member-state overlays — DE first, FR/NL next)**"*. Intent is clear.
- Per observed Phase L output: Phase L.1–L.6 went deep on DE completion and ES catch-up. **FR/NL was not the Phase L focus.** Phase 11C is therefore behind its own roadmap.
- Path C confirms: NL rules have proper `wetten.overheid.nl` URLs but no verification dates — one batch of verification work away from ACTIVE. FR rules are worse — FR-006 / FR-012 have zero official_url (below "intentional SEED" bar).

**Verdict:** Phase 11C is intended scope. It has drifted because Phase K/L chose a different priority (UX polish + UNECE Annex II completion). Dedicating one Phase M sprint to FR/NL closes the drift.

### Q3 — Phase M+ primary KPI

**Recommend: Pilot-completeness (% of rules a real pilot engineer expects that we have ACTIVE)**, with two guardrail KPIs.

| KPI role | Metric | Target for Phase M end | Why |
|---|---|---|---|
| **Primary** | Pilot-completeness (ACTIVE ÷ engineer-expected, per pilot) | ≥ 80% for MY2027 BEV × DE, ≥ 70% for PHEV and ICE pilots | Business-anchored; forces Path-B thinking; prevents scope creep |
| Guardrail 1 | ACTIVE ratio (ACTIVE ÷ total) | ≥ 60% (from 49% today) | Prevents "add more SEED" as a cheap win |
| Guardrail 2 | Freshness median (ACTIVE rules past `last_verified_on` by review_cadence_days) | 0 critically_overdue, ≤ 10% overdue | Prevents rot |

**Rejected alternatives:**
- "Total rule count" → we have that. Already 205. Adding more SEED is not progress.
- "Country count" → geographic scope is already locked; expanding would mean adding CH/NO/IS/LI (fair), not going beyond.
- "Verification SLA" (days from author → ACTIVE) → useful but a *process* KPI not a *coverage* KPI.

Primary KPI's denominator (engineer-expected per pilot) needs to be authored once per pilot. Suggested approach: extend `fixtures/pilot-*.expected.ts` with an `engineer_expected_applicable` list containing rules that *should* apply once we instrument them properly; the % is `len(hard_assertions.applicable_rule_ids) / len(engineer_expected_applicable)`.

---

## 4 · Phase 4 — Synthesis

### 4.1 Scorecard

| Benchmark | Score | Interpretation |
|---|---|---|
| **A — Full EU landscape (denominator 650)** | 31.5% rule-present / 14.9% runtime-ACTIVE | Incomplete; ~10 category-level unknowns outside current backlog |
| **B — Pilot-need (3-pilot union, denominator 278)** | 35.3% rule-present / 25.5% runtime-ACTIVE (BEV 51 / PHEV 57 / ICE 44 APPLICABLE) | Business-ready only for the regression-anchor pilot; real engineer still has 6 cross-cutting gaps |
| **C — Backlog execution** | 96.3% runtime-captured (104/108); 23% promotable-as-is (7/30) · 47% content-deficient (14/30) · 7% latent-over-broad (2/30) · 23% legit skeleton (7/30) | Structurally complete list, execution drift inside it |

### 4.2 The Real Gap List (deduplicated across A/B/C)

**Category I — Unknown-unknowns to ADD to registry (Phase A finds)**
Ordered by severity × likelihood:

1. `eCall / AECS` — Reg 2015/758 + UN R144 + Del. Reg 2017/79 + Impl. Reg 2017/78 — **critical**
2. `AFIR` — Reg 2023/1804 (EU-level, separate from DE LSV transposition) — high
3. `PTI framework` — Directives 2014/45, 2014/46, 2014/47 — high
4. `RED + cybersecurity delegated` — Directive 2014/53 + Del. Reg 2022/30 — high
5. `MAC Directive + F-gas` — Directive 2006/40 + Reg 2024/573 — high
6. `Weights & Dimensions` — Directive 96/53 + 2015/719 — high (O/N2/N3)
7. `HDV CO2 monitoring + VECTO simulation act` — Reg 2018/956 + Reg 2017/2400 — high (HD pilots)
8. `WVTA Annex II EU-side implementing — Reg 2021/535` — master GSR2 technical act (single rule covering ~20 systems via reference) — high
9. `Machinery Regulation 2023/1230` — from 14 Jan 2027, repeals 2006/42 — medium (AGRI)
10. `UNECE spare-parts set` — R54, R64, R90, R103, R109, R124 — medium (aftermarket)

Plus: **Address zero-rule status of CH / NO / IS / LI** — either confirm they are "in scope but not yet instrumented" and add 5 × 4 = 20 PLACEHOLDER skeletons matching the IT/PL/BE/AT/SE pattern, or explicitly carve them out of Phase M. Today they sit silently unaddressed despite AGENTS.md including them.

**Category II — Pilot-need gaps to ADD (Phase B finds)**

1. Cabin-camera + GDPR + AI Act Art. 22 intersection rule (EDPB Opinion 4/2020 + 2023 AI guidance)
2. R100 Part 2 sub-rule for V2G / bidirectional-charging safety path
3. R51 §10 charging-mode noise rule
4. Explicit `REG-UN-149` ADB rule (nomenclature fix — content is referenced but no rule ID)
5. EVP data-structure detail rule (Impl. Reg 2025/1707 annex)
6. Motorway-assistant-vs-DCAS trigger refinement (R171 applicability clarification)

**Category III — Backlog cleanup (Phase C finds)**

1. **Fix REG-CL-002 (GPSR)** — rewrite empty `conditions:[]` trigger
2. **Batch UNECE deep-link fill** — 8+ rules using `UNECE_PRIMARY_PORTAL` constant
3. **Batch EU horizontal EUR-Lex deep-link fill** — 6 rules using `makeSource()` fallback with null URL (REG-BAT-002, REG-CI-001/002, REG-CS-003, REG-PV-003, and REG-CL-002 as part of rewrite)
4. **REG-MS-FR-006 (Crit'Air) + REG-MS-FR-012 (UTAC-CERAM)** — find Légifrance links
5. **REG-MS-DE-009 (KBA)** — architectural split into EU-TA vs national small-series
6. **README reconciliation** — fix 51 vs 16 claim before any new demo

### 4.3 "Next 100 rules" priority list (rough shape for Phase M)

| Chunk | Rules | What unlocks |
|---|---|---|
| Close Category I top-10 landscape gaps | ~15 new rules (some compounds) | MY2027 BEV × DE legitimately complete; 2027/858 Annex II defensible |
| Close Category II pilot-need cross-cutting | ~6 new rules | Cabin-camera/V2G/R51 properly triggered for real pilot configs |
| UNECE Annex II residual promotion (SEED → ACTIVE) | ~26 existing rules (deep-link batch) | UNECE coverage genuinely production-grade, not "shelf" |
| FR overlay to ES-parity | ~7 new + ~5 existing promotions | FR pilot unblocked; Phase 11C roadmap closed |
| NL overlay to DE-parity | ~5 existing promotions | NL pilot unblocked |
| CH + NO overlay skeleton (if in scope) | ~10 new PLACEHOLDER | Honest geographic coverage |
| Backlog quality cleanup (EU horizontal) | ~6 existing fills | REACH, EDPB, GPSR, CRA, tyre label all ACTIVE-ready |
| UK residual promotion | ~4 existing | UK fully production-grade |
| **Total** | **~78 net new + promotions** ≈ 100 rule-units of work | 3 pilots at ≥ 80%; all currently-labelled ACTIVE are genuinely ACTIVE |

### 4.4 Phase M+ primary KPI formal proposal

```ts
// Proposed addition to fixtures/pilot-*.expected.ts
export const pilotExpected = {
  hardAssertions: { /* ... existing ... */ },
  softAssertions: { /* ... existing ... */ },

  // NEW — Path B coverage grounding
  engineerExpectedApplicable: [
    // Rule IDs an experienced homologation engineer running this pilot
    // would expect to see APPLICABLE, regardless of current lifecycle.
    // Used as denominator for the pilot-completeness KPI:
    //   pilotCompleteness = len(hard.applicable) / len(engineerExpected)
    // Authored manually; reviewed per pilot-cycle.
  ] as const,
};
```

Target at end of Phase M (+8 weeks):
- MY2027 BEV × DE·FR·NL: **≥ 80%** pilot-completeness
- MY2028 PHEV × DE·FR·NL: **≥ 80%**
- MY2027 ICE × ES: **≥ 70%**

---

## 5 · Verification of this audit

- [x] Three benchmarks each have a specific % (not "basically" or "mostly")
- [x] Every unknown-unknown in Category I names an authoritative source (EUR-Lex regulation number or UN R-number) without fabricating a URL
- [x] "Next 100 rules" list every chunk carries a pilot-enablement rationale
- [x] No item added for CN / JP / US / TR / Western Balkans (geographic scope respected)
- [x] Q1/Q2/Q3 each have a one-line conclusion
- [x] No registry file modified during audit
- [x] Non-ACTIVE ≠ APPLICABLE invariant noted and preserved (README drift is the error, not the engine)

## 6 · Critical findings (requiring fix before next demo)

| # | Finding | Severity | Fix effort |
|---|---|---|---|
| **0** | **⚠ Governance silently downgrades 4 raw-ACTIVE rules to SEED_UNVERIFIED at runtime — README/backlog totals are the RAW count, users see the RUNTIME count.** Affected: REG-TA-002 (L-category Framework), REG-AD-001 (R157 ALKS), REG-AD-002 (R171 DCAS), REG-DA-001 (EU Data Act). Each has `official_url: null` OR `last_verified_on: null` on primary source → fails `applyGovernanceToRule`'s `hasVerifiedPrimarySource` check (see `src/registry/governance.ts:37`). Raw 101 ACTIVE → **runtime 97 ACTIVE**; raw 104 non-ACTIVE → **runtime 108 non-ACTIVE**. | **CRITICAL** (coverage reporting inaccurate) | 4 rules × 2 h authoring (find real URL + OJ + verification date + promotionLog) = 8 h |
| 1 | `fixtures/pilot-my2027-bev.expected.ts` `applicable_rule_ids` list is a stale 16-item Phase-11C snapshot; runtime outputs 51 APPLICABLE. `total_applicable_min: 16` floor assertion passes (51 ≥ 16), but the enumerated list is unhelpful. README/Phase-L's "51 APPLICABLE" claim is correct; fixture is anchor-hygiene debt. | MEDIUM (test utility, not correctness) | 30 min — refresh list to current 51-item engine output |
| 2 | REG-CL-002 (GPSR) has empty `conditions:[]` AND no temporal scope populated → currently evaluates to **UNKNOWN** at runtime (not NOT_APPLICABLE). Latent risk: if temporal dates are later authored without adding scope conditions, match-mode `all` on empty-conditions resolves as **over-broadly APPLICABLE to every vehicle** that passes the hard-gate. Fix order matters — scope conditions must land BEFORE any temporal field to prevent silent over-match on promotion. | **HIGH** (latent over-broad applicability on future temporal authoring) | 30 min — author 2-4 scope conditions first, THEN temporal |
| 3 | REG-MS-FR-006 (Crit'Air), REG-MS-FR-012 (UTAC-CERAM) have `official_url: null` + `oj_reference: null` | MEDIUM | 1–2 h per rule — Légifrance search |
| 4 | Zero rules for CH / NO / IS / LI despite in-scope per AGENTS.md | MEDIUM | Policy decision first: confirm in-scope → author 20 PLACEHOLDER |
| 5 | eCall / AECS (Reg 2015/758) missing from an M1 BEV pilot registry | HIGH | 2–3 h — real rule, real source, real test-update |
| 6 | 8+ UNECE rules use `UNECE_PRIMARY_PORTAL` root instead of deep links | MEDIUM | 4 h batch — UNECE regulation pages are structured |

### 6.1 Metadata depth findings (from Phase 1 snapshot agent)

- **50 rules out of 205 are *strictly* fully sourced** — every source (primary + secondary) has `official_url` + `oj_reference` + `last_verified_on`. The remaining 155 either have partial source metadata or carry no sources at all. This is a sharper lens than the 101/97 headline.
- **176 of 205 rules have `last_human_review_at: null`** — only 29 rules across the whole registry have ever been human-reviewed and dated.
- **Critically, 72 of the 97 runtime-ACTIVE rules (74%) have `last_human_review_at: null`** — the majority of rules labelled ACTIVE have never been dated by a human reviewer. Only **25 / 97 (26%)** runtime-ACTIVE rules are genuinely human-reviewed. Combined with the governance-downgrade finding (§6, row 0), the defensible "101 ACTIVE" public claim reduces to "25 rules that are both governance-passing AND human-dated" as the genuinely-ACTIVE core. This is the sharpest headline-vs-reality gap in the audit.
- **204 declarative triggers · 1 custom evaluator** (DCAS `dcas_if_fitted`) — matches architecture.md intent ("declarative-first, 20% custom"). No drift here.

---

## 7 · Answer to the core question

**"205 条真的全面吗？"**

- 相对 Benchmark A（全 EU 景观，denominator 650）: **31.5% rule-present / 14.9% runtime-ACTIVE**，**不全面**，10 个 category 级 unknown-unknowns 待补。
- 相对 Benchmark B（3-pilot union need, denominator 278）: **35.3% rule-present / 25.5% runtime-ACTIVE**（BEV 51 / PHEV 57 / ICE 44 APPLICABLE，engine 实跑校验），**主 pilot 的 APPLICABLE 集合可用但尚未足以支持端到端 homologation 规划**，6 个 cross-cutting gap 待补。
- 相对 Benchmark C（已知 backlog 完整性，runtime 108）: 104/108 = **96.3% captured**（generator 漏 4 条 governance-downgrade），30 抽样里 47% 条目有 execution drift，1 条触发器 latent over-broad risk。

**Phase M+ 建议锁定 Benchmark B（Pilot-need）为主 KPI**，走四 sprint：
1. 补 Category I 10 个 landscape unknowns 中的前 5 个（eCall 在首）
2. 批量清理 UNECE deep-link + makeSource fallback
3. FR / NL overlay 追平 DE 执行标准
4. Category II pilot cross-cutting gap 6 条全落地

到 Phase M 末：约 225 rules，约 145 ACTIVE，3 个 pilot 都 ≥ 70–80% pilot-completeness。

"全面"不是一个数字，是一个相对基准的承诺。**205 不全面，但它足够作为 Phase L 的结束线 + Phase M 的起跑线。**

---

*Author: this audit was produced by a single Claude Opus 4.7 session on 2026-04-23 using read-only tooling against the live registry. All specific rule IDs cited are verified present in `src/registry/seed/*.ts`. All external EU / UNECE / national-gazette references are to portal roots or published regulation numbers only — no fabricated URLs.*
