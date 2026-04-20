# Phase I — Breadth Expansion Design

**Date:** 2026-04-20
**Author:** © Yanhao FU (brainstormed with Claude)
**Status:** Approved — ready for writing-plans
**Phase:** I (follows Phase H)

---

## 1. Goal

Take the EU Vehicle Compliance Navigator from "production-pilot quality for MY2027 BEV × Germany only" to **"honestly serves Chinese OEMs for BEV + PHEV + ICE × DE / FR / UK / ES at pilot quality"** in one coordinated wave. Fix the structural ICE/PHEV gap at the engine layer first, then author comprehensive country overlays and powertrain-specific rules on top.

---

## 2. Success criteria

1. Tool can honestly serve BEV, PHEV, and ICE programs (no silent under-serving of PHEV).
2. DE, FR, UK, ES all carry comprehensive authored overlays (9-13 rules each).
3. Registry grows from 142 to approximately 200-210 rules (net +60-70).
4. Every new rule lands at `SEED_UNVERIFIED` or `DRAFT`. No new `ACTIVE` without human URL verification (that is a separate follow-up round).
5. Existing snapshots + tests stay green. New fixtures cover ICE × ES and PHEV × FR.
6. No ACTIVE rule is fabricated. Every new rule has `content_provenance` with `human_reviewer: null` and `[verify]` markers on anything uncertain.

---

## 3. Scope

### 3.1 In scope

- Engine + schema: `fuelType` field and 5 derived powertrain flags.
- 9 new emissions rules + 6 new UNECE rules + 1 UNECE enrichment (R34) + 1 ELV promotion + Euro 7 refactor.
- 12 new UK non-EU-market rules (existing `REG-UK-001` stays).
- 13 new ES member-state-overlay rules.
- 4 DE additions + 6 FR additions (member-state-overlay fill-in).
- 1 new pilot fixture (ICE × ES); updates to 2 existing fixtures (BEV, PHEV).
- New ADR (ADR-H7 Euro 7 rule split).
- Governance test count + README stats refresh.

### 3.2 Out of scope (not non-goals — just deferred)

- `ACTIVE` promotion of new rules (human verification is a separate round).
- Chinese-language rule card content (localization is its own workstream).
- NL deepening (already at 5 SEED_UNVERIFIED rules — wait for verification round).
- IT / PL / BE / AT / SE authored overlays (factory-generated stubs stay).

### 3.3 Non-goals respected (per AGENTS.md)

- No backend / API / live EUR-Lex feed integration.
- No customs / CBAM / HS classification / rules-of-origin.
- No ISO-full domain (we declare ISO prerequisites on rules; we do not model ISO internals).
- No RegPulse-Agent as primary consumer.
- No multi-tenant SaaS / SSO / RBAC.
- No heavy-duty Euro 7 delegated acts (still pending from Commission).

---

## 4. Phasing

Six sub-phases. Committed separately for reviewability. Each phase gates on `tsc --noEmit` green + `eslint` green + `vitest run` green.

| Phase | Title | Net rule delta | Dependencies |
|---|---|---|---|
| I.1 | Engine + schema foundation | 0 | — |
| I.2 | ICE/PHEV emissions content + UNECE enrichment | +15 (+1 refactor, +1 promotion) | I.1 |
| I.3 | UK non-EU-market overlay | +12 | I.1 |
| I.4 | ES member-state overlay | +13 | I.1 |
| I.5 | DE + FR targeted fill-in | +10 | — |
| I.6 | Fixtures + tests + governance + docs | 0 | all prior |

Total expected rule count after wave: **142 + 50 = ~192 rules** (may float ±5 depending on final trimming).

---

## 5. Phase I.1 — Engine + schema changes

### 5.1 VehicleConfig addition

```ts
// src/config/schema.ts
fuelType:
  | "petrol"
  | "diesel"
  | "lpg"
  | "cng"
  | "hydrogen"
  | "none"          // pure BEV — no fuel tank
  | null;           // unknown
```

### 5.2 EngineConfig derived flags

```ts
// src/engine/config-builder.ts
fuelType: VehicleConfig["fuelType"];
hasCombustionEngine: boolean;    // powertrain ∈ {ICE, HEV, PHEV} AND fuelType not in {none, hydrogen}
hasDieselEngine: boolean;        // hasCombustionEngine && fuelType === "diesel"
hasFuelTank: boolean;            // hasCombustionEngine || fuelType ∈ {lpg, cng, hydrogen}
hasOBD: boolean;                 // === hasCombustionEngine (EU mandate)
isPlugInHybrid: boolean;         // powertrain === "PHEV"
```

`batteryPresent` retains existing semantics.

### 5.3 Schema additions (dataFlags + readiness)

- `dataFlags`: add `"targets_ni"` (used by Windsor Framework rule).
- `readiness`: add `offersPublicChargingInfra: boolean` (UK charge-point regs) + `smallVolumeFlag: boolean` (ES homologación individual).

### 5.4 Persistence + URL sharing

- `fuelType` persisted; short key `ft` in URL encoder.
- Backwards-compatible: absent field defaults to `null` on load.

### 5.5 UI additions

- `ConfigPanelV2` Powertrain section: new "Fuel type" select, conditional on `powertrain ∈ {ICE, HEV, PHEV, FCEV}`. Auto-locks to `"none"` for BEV.
- Progressive disclosure: when `fuelType === "diesel"`, show AdBlue-capable toggle (optional, flagged as `readiness.adBlueSystem` — defer to later phase).

### 5.6 Tests

`tests/unit/config-builder.test.ts` — new cases:
- `powertrain: "ICE" + fuelType: "petrol"` → `hasCombustionEngine: true, hasFuelTank: true, hasDieselEngine: false`
- `powertrain: "BEV" + fuelType: null` → `hasCombustionEngine: false, hasFuelTank: false, hasOBD: false`
- `powertrain: "PHEV" + fuelType: "petrol"` → all combustion flags true AND `batteryPresent: true` AND `isPlugInHybrid: true`
- `powertrain: "FCEV" + fuelType: "hydrogen"` → `hasFuelTank: true, hasCombustionEngine: false`
- `powertrain: "ICE" + fuelType: null` → `hasCombustionEngine: true` but evaluator flags `missing_inputs: ["fuelType"]` for diesel-specific rules

### 5.7 Backwards compatibility

- `pilot-my2027-bev.ts` gets `fuelType: "none"` — no behavioral change.
- `pilot-my2028-phev.ts` reshape `fuel: { tankType: "petrol" }` to `fuelType: "petrol"`.
- Saved localStorage configs with old shape: tolerated — default to `null`.

---

## 6. Phase I.2 — Emissions rules content

### 6.1 Refactor + new rules in `src/registry/seed/emissions-co2.ts`

| stable_id | action | trigger | source | notes |
|---|---|---|---|---|
| `REG-EM-001` | refactor | M1/N1 | Reg (EU) 2024/1257 | Demote to framework-only (EVP, scope statement). Pull combustion + battery durability into -013 / -014. |
| `REG-EM-013` | new | M1/N1 + `hasCombustionEngine` | Reg (EU) 2024/1257 + Impl Reg (EU) 2025/1706 + 2025/1707 | Euro 7 combustion exhaust + OBFCM. |
| `REG-EM-014` | new | M1/N1 + `batteryPresent` | Reg (EU) 2024/1257 + pending del. act | Euro 7 battery durability (SOH). |
| `REG-EM-006` | new | M1/N1 + `hasCombustionEngine`, `effective_to: "2026-11-29"` | Reg (EC) 715/2007 + 692/2008 + (EU) 2017/1151 + 2018/1832 | Euro 6 legacy baseline. |
| `REG-EM-007` | new | `hasCombustionEngine` | Dir 98/69/EC + Reg 715/2007 Annex XI + ISO 15031 | OBD/EOBD. |
| `REG-EM-008` | new | `hasFuelTank` + `fuelType ∈ [petrol, lpg, cng]` | Reg 715/2007 Annex III + 692/2008 Annex VI | Evaporative emissions. |
| `REG-EM-009` | new | `isPlugInHybrid` | Commission Reg (EU) 2023/443 + Reg 2019/631 Annex I | PHEV CO2 utility-factor. |
| `REG-EM-010` | new | `hasDieselEngine` | Reg 715/2007 Euro 6d + Reg (EU) 2024/1257 Euro 7 | AdBlue/SCR. |
| `REG-EM-011` | new | `vehicleCategory = M1` | Dir 1999/94/EC + MS transpositions | CO2/fuel-consumption labeling. |
| `REG-EM-012` | new | M2/M3/N2/N3 + `hasCombustionEngine` | Reg (EU) 2017/2400 VECTO + (EU) 2019/1242 | HD CO2 / VECTO. |

### 6.2 UNECE enrichment in `src/registry/seed/unece-technical.ts`

Enrich factory stubs (SEED_UNVERIFIED → authored SEED_UNVERIFIED):

| stable_id | trigger | source |
|---|---|---|
| `REG-UN-034` | `hasFuelTank` | UN R34 |
| `REG-UN-049` (new) | M2/M3/N2/N3 + `hasCombustionEngine` | UN R49 Euro VI→VII |
| `REG-UN-067` (new) | `fuelType = lpg` | UN R67 |
| `REG-UN-085` (new) | `hasCombustionEngine` | UN R85 |
| `REG-UN-101` (new) | M1/N1 | UN R101 |
| `REG-UN-115` (new) | `fuelType ∈ [lpg, cng]` (aftermarket notes) | UN R115 |
| `REG-UN-117` (new) | M/N/O framework | UN R117 |

### 6.3 ELV promotion

`REG-BAT-003` (ELV) promoted from DRAFT → SEED_UNVERIFIED with authored content. Source: Dir 2000/53/EC + revision into Reg per Commission proposal COM(2023) 451. Trigger: `batteryPresent OR vehicleCategory ∈ [M1, N1]`.

### 6.4 ISO prerequisites

- REG-EM-007 → ISO 15031, SAE J1979
- REG-EM-010 → ISO 22241 (DEF quality)
- REG-EM-012 → VECTO docs + VDA
- REG-UN-117 → ISO 28580, ISO 10844

### 6.5 Related_rules

- REG-EM-001 ↔ 013 ↔ 014 (Euro 7 family)
- REG-EM-009 ↔ REG-UN-101 (PHEV CO2 pathway)
- REG-EM-010 ↔ REG-UN-083 (diesel NOx)

---

## 7. Phase I.3 — UK overlay

File: `src/registry/seed/non-eu-market.ts`. Family: `non_eu_market`.

12 new rules (REG-UK-002 through REG-UK-013); existing REG-UK-001 untouched. Remove UK from factory `priorityCountries` in `member-state-overlay.ts`.

| stable_id | title | lifecycle | trigger |
|---|---|---|---|
| `REG-UK-002` | GB Type-Approval (GBTA) + EU-TA Provisional | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-003` | DVLA V5C Registration | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-004` | MoT Roadworthiness Test | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-005` | Vehicle Excise Duty (VED) | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-006` | Compulsory Motor Insurance (RTA 1988) | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-007` | London ULEZ | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-008` | Regional Clean Air Zones (England) | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-009` | Scotland Low Emission Zones | SEED_UNVERIFIED | `targetsUK` |
| `REG-UK-010` | ZEV Sales Mandate | SEED_UNVERIFIED | `targetsUK + M1/N1` |
| `REG-UK-011` | Windsor Framework NI Alignment | DRAFT | `targetsUK + dataFlags.targets_ni` |
| `REG-UK-012` | UK GDPR / DPA 2018 | SEED_UNVERIFIED | `targetsUK + (processesPersonalData ∥ hasConnectedServices)` |
| `REG-UK-013` | Public Charge Point Regs 2023 | DRAFT | `targetsUK + offersPublicChargingInfra` |

Sources detailed in Section 4 of design conversation (SI numbers marked `[verify]` where appropriate).

---

## 8. Phase I.4 — ES overlay

File: `src/registry/seed/member-state-overlay.ts`. Family: `member_state_overlay`.

Replace factory stubs REG-MS-ES-001..005 with authored versions; add REG-MS-ES-006 through -013. Remove ES from factory `priorityCountries`.

| stable_id | title | lifecycle |
|---|---|---|
| `REG-MS-ES-001` | DGT Matriculación | SEED_UNVERIFIED |
| `REG-MS-ES-002` | ITV Roadworthiness | SEED_UNVERIFIED |
| `REG-MS-ES-003` | Seguro RCP | SEED_UNVERIFIED |
| `REG-MS-ES-004` | IEDMT Registration Tax | SEED_UNVERIFIED |
| `REG-MS-ES-005` | IVTM Municipal Tax | SEED_UNVERIFIED |
| `REG-MS-ES-006` | ZBE Low Emission Zones | SEED_UNVERIFIED |
| `REG-MS-ES-007` | Etiqueta Ambiental DGT | SEED_UNVERIFIED |
| `REG-MS-ES-008` | Homologación Individual | SEED_UNVERIFIED |
| `REG-MS-ES-009` | WVTA National Transposition (RD 750/2010) | SEED_UNVERIFIED |
| `REG-MS-ES-010` | ZEV Phase-out 2035 (Ley 7/2021 Art. 14) | DRAFT |
| `REG-MS-ES-011` | Ley 3/2023 Movilidad Sostenible | DRAFT |
| `REG-MS-ES-012` | Plan MOVES III | DRAFT |
| `REG-MS-ES-013` | Gestión de Residuos de Pilas (RD 184/2022) | SEED_UNVERIFIED |

Sources + full obligation text detailed in Section 5 of design conversation.

---

## 9. Phase I.5 — DE + FR fill-in

### 9.1 DE additions (4 rules, append to existing DE block)

| stable_id | title | lifecycle | source |
|---|---|---|---|
| `REG-MS-DE-006` | E-Kennzeichen (EmoG) | SEED_UNVERIFIED | EmoG §2-3 + StVZO §23 |
| `REG-MS-DE-007` | AFIR Transposition (Ladeinfrastruktur) | DRAFT | Reg (EU) 2023/1804 + LSV revision |
| `REG-MS-DE-008` | Dienstwagenbesteuerung | SEED_UNVERIFIED | EStG §6(1)Nr.4 + §8(2) |
| `REG-MS-DE-009` | KBA National TA Authority | SEED_UNVERIFIED | KBA-Zuständigkeitsverordnung + StVZO |

### 9.2 FR additions (6 rules)

| stable_id | title | lifecycle | source |
|---|---|---|---|
| `REG-MS-FR-006` | Crit'Air Vignette (standalone) | SEED_UNVERIFIED | Arrêté 21 juin 2016 + CE R318-2 |
| `REG-MS-FR-007` | Prime à la Conversion | DRAFT | Décret 2022-1761 + revisions |
| `REG-MS-FR-008` | TVS → TAVE + TAPVP (2025) | SEED_UNVERIFIED | CGI Art. 1010 + LF 2025 |
| `REG-MS-FR-009` | TICPE Fuel Tax | SEED_UNVERIFIED | CIBS Art. L312-35 |
| `REG-MS-FR-010` | LOM — Loi d'Orientation des Mobilités | DRAFT | Loi 2019-1428 |
| `REG-MS-FR-011` | Malus Masse (Weight Tax) 2025 | SEED_UNVERIFIED | LF 2024 + LF 2025 |

---

## 10. Phase I.6 — Fixtures + tests + governance + docs

### 10.1 New fixture

`fixtures/pilot-my2027-ice-m1-es.ts` — Chinese OEM ICE SUV for Spain:

```ts
{
  projectName: "MY2027 ICE M1 (ES market)",
  frameworkGroup: "MN", vehicleCategory: "M1",
  powertrain: "ICE", fuelType: "petrol",
  sopDate: "2027-04-01",
  targetCountries: ["ES"],
  automationLevel: "basic_adas",
  // ... minimal realistic config
}
```

Plus `pilot-my2027-ice-m1-es.expected.ts` snapshot. Expected applicable: REG-TA-001, REG-GSR-001, REG-CS-001/002, REG-EM-001/006/007/008/011, REG-UN-034/051/085/101/117, REG-MS-ES-001 through -007, REG-MS-ES-009, REG-MS-ES-010. NOT applicable: REG-UN-100 (BEV-only), REG-BAT-001.

### 10.2 Updated fixtures

- `fixtures/pilot-my2027-bev.ts`: add `fuelType: "none"`. Expected: REG-EM-001 stays applicable (framework scope) but with reduced evidence tasks after refactor; gains REG-EM-014 (battery durability); does NOT gain REG-EM-013 (combustion — correctly excluded by `hasCombustionEngine = false`); does NOT gain REG-EM-007/008/010 (combustion-only rules correctly excluded). No FR addition in this iteration for the BEV fixture — keeps pilot anchor stable.
- `fixtures/pilot-my2028-phev.ts`: add `fuelType: "petrol"`. Expand `targetCountries` to `["DE", "FR"]` to exercise FR overlay. Expected grows by REG-EM-007/008/009/013/014, REG-UN-034/085/101, FR overlay. `conditional_count_range: [25, 60] → [40, 85]`.

### 10.3 Tests

- `tests/unit/config-builder.test.ts` — new cases per Section 5.6.
- `tests/unit/governance.test.ts` — update total count to new value (approximately 193).
- `tests/unit/pilot-ice-es-acceptance.test.ts` — new snapshot-based acceptance test.
- Existing snapshots regenerated with `vitest run -u`.

### 10.4 Docs

- `README.md`: update rule count (142 → ~193); test count bump.
- `docs/USER-GUIDE.md` + `docs/USER-GUIDE-EN.md`: document `fuelType` field under Powertrain section.
- `docs/adr/ADR-H7-euro-7-rule-split.md` — new ADR.
- `docs/rule-authoring-guide.md` — note new engine flags.

---

## 11. Anti-hallucination guardrails

- Every new rule gets `content_provenance: { source_type: <jurisdiction>, retrieved_at: "2026-04-20", human_reviewer: null }`.
- Any URL not verifiable against EUR-Lex / UNECE / legifrance / gesetze-im-internet / gov.uk / boe.es: `official_url: null` + `manual_review_reason` flag.
- Any date I am not confident about: note `[verify]` in `notes`.
- Uncertain legal references (UK GBTA exact SI number, ES IEDMT 2026 thresholds, FR TVS 2025 rates): verbatim reference + `[verify]` on the precise value.
- Parallel research agents dispatched for high-stakes authoring groups (UK, ES, ICE technical) to cross-check facts before authoring — one agent per group.
- Golden-dataset tests + `pilot-acceptance` tests green at end of each phase.

---

## 12. Anti-regression contract

- `pilot-my2027-bev.ts` `applicable_rule_ids` may grow (gains REG-EM-014 battery durability) but must **not shrink**.
- `pilot-my2028-phev.ts` `applicable_rule_ids` grows materially (+8-10 ICE-side rules) — intentional behavioral improvement.
- ACTIVE rule count stays at 22 (no promotions in this wave).
- No `activeWithoutUrl` / `activeWithoutOjReference` regressions.
- `applicability_count_ceiling` for existing fixtures may change; document deltas in commit messages.

---

## 13. Human-verification backlog (output of this wave)

Approximately 60-70 new SEED_UNVERIFIED rules. Each needs URL verification + `last_verified_on` to promote to ACTIVE. Estimated effort: 15-20 human-hours split across DE / FR / UK / ES legal review. Separate follow-up round.

---

## 14. Commit sequence

Six commits, one per sub-phase, each green + reviewable:

1. `feat(phase-i.1): fuelType + ICE/PHEV derived flags in engine + config`
2. `feat(phase-i.2): ICE/PHEV emissions rules + UNECE enrichment`
3. `feat(phase-i.3): UK non-EU-market overlay — 12 authored rules`
4. `feat(phase-i.4): ES member-state overlay — 13 authored rules`
5. `feat(phase-i.5): DE + FR targeted fill-in`
6. `feat(phase-i.6): fixtures + tests + governance + docs`

Each commit gate: `npx tsc --noEmit` green + `npm run lint` green + `npx vitest run` green (with `-u` for snapshot regen in I.6 and where needed in I.2).

---

## 15. Open questions — none

All resolved through the 6-section brainstorming dialogue. Design is complete and ready for implementation-plan authoring.

---

## 16. Definition of Done

- All six sub-phase commits landed on main.
- Test count (≥ 212) and rule count (~192) reflected in README.
- New ICE-ES fixture + updated BEV / PHEV fixtures green.
- No new ACTIVE rule (all new content SEED_UNVERIFIED or DRAFT).
- Docs updated: USER-GUIDE, rule-authoring-guide, ADR-H7.
- Human-verification backlog file written (list of all new SEED_UNVERIFIED stable_ids for the reviewer).
