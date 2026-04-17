# Phase 0 Merge Report

**Date:** 2026-04-14  
**Author:** © Yanhao FU  
**Scope:** Merge of v1.0 artifacts + v2.0 delta patch into final baseline

---

## Removed

| Item | Was in | Reason |
|------|--------|--------|
| "Single-file React SPA with migration path" | v1.0 Assumptions §B2, Plan Phase 1 | Replaced by Next.js project from day one |
| `effective_from: string \| null` / `effective_to: string \| null` as flat fields | v1.0 Data Model §Rule | Replaced by `RuleTemporalScope` with 7 date fields |
| `official_url: string \| null` as single field | v1.0 Data Model §Rule | Replaced by `sources: SourceReference[]` |
| "No ACTIVE rules exist in MVP" | v1.0 Architecture §3.1, Plan Phase 2 exit criteria | 14 foundational instruments promoted to ACTIVE |
| `RuleConfidence` type name | v1.0 Data Model §1.6 | Replaced by `RuleLifecycleState` |
| `confidence` field on Rule | v1.0 Data Model §Rule | Replaced by `lifecycle_state` field |
| "ACTIVE candidate" as a lifecycle value | v2.0 delta artifacts | Normalized to canonical `ACTIVE` with `manual_review_required: true` + `manual_review_reason: "EUR-Lex URL verification pending"` |
| DCAS described as "not yet adopted" | v1.0 NB-03, CL-02 | Replaced with adopted status: UN R171 via Delegated Reg 2025/1122, in force 1 Sep 2025 |
| AI Act dates as "~February / ~August" | v1.0 CL-06 | Replaced with hard dates: 2 Feb 2025, 2 Aug 2025, 2 Aug 2026, 2 Aug 2027 |
| Euro 7 as "proposed / needs verification" | v1.0 NB-11 | Replaced with adopted Reg 2024/1257 + implementing regs 2025/1706, 2025/1707 |
| "14 regulatory families" | v1.0 Assumptions | Corrected to 13 (canonical count) |
| `trigger_logic` as bare JS function | v1.0 Data Model | Replaced by `TriggerLogic` union: declarative (default) + custom evaluator hook |
| Free-text `owner_hint: string` | v1.0 Data Model | Replaced by `OwnerHint` enum (13 values) + optional `owner_hint_detail` |
| Source policy row "proposals — Yes (if adopted)" | v1.0 Architecture §3.3 | Split: adopted acts can activate; proposals cannot (DRAFT only) |

## Renamed

| Old name | New name | Reason |
|----------|----------|--------|
| `RuleConfidence` | `RuleLifecycleState` | Lifecycle state ≠ epistemic confidence |
| `confidence` (field) | `lifecycle_state` | Matches type name |
| `ACTIVE candidate` | `ACTIVE` + `manual_review_required: true` | Only canonical enum values permitted |
| `battery_chemicals` (family ID considered in v1.0) | `materials_chemicals` | Broader scope: REACH, ELV, CLP, not just batteries |
| REG-AD-002a / REG-AD-002b (v2.0 delta) | **REG-AD-002** (single rule) | One regulation = one rule. No split needed. |

## Merged

| What | From | Into |
|------|------|------|
| v1.0 Architecture + PATCH-02, -03, -04, -05, -06, -07, -08, -09, -11 | 6 original artifacts + 16 patches | `final-phase0-architecture.md` |
| v1.0 Data Model + PATCH-02, -03, -04, -06, -09, -10 | Original + patches | `final-phase0-data-model.md` |
| v1.0 Plan + PATCH-05, -07, -08 | Original + patches | `final-phase0-implementation-plan.md` |
| v2.0 seed list + PATCH-12, -13, -14, PLD verification | Delta list + PLD web search | `final-phase0-seed-rule-candidate-list.md` |

## Normalized

| What | Normalization applied |
|------|----------------------|
| lifecycle_state values | Only PLACEHOLDER / DRAFT / SEED_UNVERIFIED / ACTIVE / ARCHIVED. No other values anywhere. |
| Legal family count | 13 everywhere. No "14" remnants. |
| DCAS name | "Driver Control Assistance Systems" only. "Dynamically Commanded Assistive Driving System" purged. |
| PLD (REG-CL-001) | OJ ref: OJ L, 2024/2853, 18 Nov 2024. Entry into force: 8 Dec 2024. Transposition deadline: 9 Dec 2026. Application: 9 Dec 2026. |
| Hard evaluation gate | Documented in architecture invariant §1.2.6: non-ACTIVE → max CONDITIONAL. Documented in plan Phase 2 exit criteria. Added `was_downgraded_from_applicable` flag to EvaluationResult. |
| Technology stack | "Next.js + TypeScript" everywhere. No "single-file artifact" references. |
| Trigger logic | `TriggerLogic = TriggerLogicDeclarative \| TriggerLogicCustom`. REG-AD-002 (DCAS) is the only rule using custom mode in the seed list. All others are declarative. |

## Documents produced

1. `final-phase0-architecture.md` — 8 sections, clean
2. `final-phase0-data-model.md` — 11 sections, clean
3. `final-phase0-implementation-plan.md` — 6 phases + risk list + roadmap, clean
4. `final-phase0-seed-rule-candidate-list.md` — 33 rules across 13 families, clean
5. `merge-report.md` — this document
