# EU Vehicle Compliance Navigator — Architecture

**Version:** Phase 0 Final Baseline  
**Date:** 2026-04-14  
**Author:** © Yanhao FU  

---

## 1. Architectural principles

### 1.1 Separation of concerns

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                     │
│  UI components, grouping views, search, export          │
│  ui_package and process_stage are display-only fields    │
├─────────────────────────────────────────────────────────┤
│  EVALUATION LAYER                                       │
│  Rule engine: config × rule → applicability + explain   │
│  Pure functions. No side effects. No UI imports.        │
│  Declarative condition interpreter + custom hook runner  │
├─────────────────────────────────────────────────────────┤
│  REGISTRY LAYER                                         │
│  Source-governed rule store with lifecycle states        │
│  Typed schema, Zod validation, audit trail              │
│  SourceReference[] per rule, multi-date temporal scope   │
├─────────────────────────────────────────────────────────┤
│  CONFIGURATION LAYER                                    │
│  Vehicle program config, readiness flags, user state    │
│  Persistence, URL sharing, comparison                   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Invariants

1. **No rule evaluation in UI code.** All applicability logic lives in the evaluation layer.
2. **No UI grouping in the legal model.** `ui_package` is display-only. `legal_family` and `jurisdiction_level` are binding.
3. **No fabricated sources.** ACTIVE rules must have at least one `SourceReference` with verified `official_url` and `last_verified_on`. No URL is ever invented.
4. **Explainability is mandatory.** Every evaluation result includes `matched_conditions`, `unmatched_conditions`, `missing_inputs`, and `trigger_path`.
5. **Uncertainty is surfaced, not hidden.** UNKNOWN and CONDITIONAL are first-class applicability states.
6. **Hard evaluation gate.** Rules with `lifecycle_state` other than ACTIVE cannot return APPLICABLE. The engine downgrades to CONDITIONAL with explanation: "Rule source not yet verified — applicability is indicative only." This means:
   - ACTIVE → may return any of: APPLICABLE, NOT_APPLICABLE, CONDITIONAL, UNKNOWN, FUTURE
   - SEED_UNVERIFIED → max CONDITIONAL
   - DRAFT → max CONDITIONAL
   - PLACEHOLDER → always UNKNOWN
7. **Declarative-first trigger logic.** The default rule model uses JSON-serializable condition expressions. Custom evaluator hooks are permitted only for genuinely complex rules (~20% of registry).

---

## 2. Technology stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) with static export |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State | Zustand |
| Validation | Zod |
| Unit tests | Vitest |
| E2E tests | Playwright |
| Database | None in MVP. Registry adapter interface designed for future Supabase/Postgres. |

The project is a Next.js repository from day one. Static export (`next build && next export`) provides zero-server deployment. No single-file artifact intermediate step.

---

## 3. Component architecture

### 3.1 Registry layer

```
src/registry/
├── schema.ts              # Zod schemas for Rule, SourceReference, RuleTemporalScope
├── registry.ts            # RuleRegistry: load, query, filter, validate
├── governance.ts          # Lifecycle state transitions, promotion gate, integrity checks
├── adapter.ts             # RegistryAdapter interface for future DB migration
├── custom-evaluators.ts   # Named custom evaluator functions (~20% of rules)
└── seed/
    ├── vehicle-approval.ts
    ├── general-safety.ts
    ├── cybersecurity.ts
    ├── dcas-automated.ts
    ├── privacy-connected.ts
    ├── data-access.ts
    ├── ai-governance.ts
    ├── materials-chemicals.ts
    ├── emissions-co2.ts
    ├── consumer-liability.ts
    ├── member-state-overlay.ts
    ├── non-eu-market.ts
    └── unece-technical.ts
```

### 3.2 Evaluation layer

```
src/engine/
├── types.ts               # EvaluationResult, TriggerResult, ExplainPayload
├── evaluator.ts           # evaluateRule(), evaluateAllRules()
├── declarative.ts         # interpretConditions(): declarative condition interpreter
├── config-builder.ts      # VehicleConfig → EngineConfig (derived flags)
├── temporal.ts            # Date-aware evaluation against RuleTemporalScope
├── comparator.ts          # Side-by-side config comparison
└── summary.ts             # Aggregate statistics
```

### 3.3 Configuration layer

```
src/config/
├── schema.ts              # Zod schemas for VehicleConfig, ReadinessFlags
├── defaults.ts            # Default values
├── persistence.ts         # Save/load to localStorage
├── sharing.ts             # URL query encoding/decoding
└── comparison.ts          # Config diff
```

### 3.4 Presentation layer

```
src/app/                   # Next.js App Router pages
src/components/
├── layout/                # AppShell, Sidebar, MobileWizard
├── config/                # Per-section config panels (9 sections)
├── results/               # SummaryMetrics, GroupedResults, RuleCard, RuleDetail
├── tabs/                  # Checklist, Sources, EvidencePack, Assumptions, ChangeLog
├── shared/                # Badges, chips, search, glossary, banners
└── export/                # CSV, JSON, Markdown, Print
```

---

## 4. Legal family taxonomy

13 families. This count is canonical across all documents.

| ID | Legal family | Scope |
|----|-------------|-------|
| `vehicle_approval` | Vehicle type-approval core | 2018/858 (M/N/O), 168/2013 (L), 167/2013 (AGRI) |
| `general_safety` | General safety (GSR2) | 2019/2144 and its delegated acts |
| `unece_technical` | UNECE technical regulations | R-series regulations referenced by EU type-approval |
| `cybersecurity` | Cybersecurity & software updates | R155, R156, CRA |
| `dcas_automated` | DCAS / Automated driving | R171 (DCAS), R157 (ALKS), national AD frameworks |
| `privacy_connected` | Privacy / Connected vehicle | GDPR, ePrivacy, EDPB guidance |
| `data_access` | Data access & sharing | Data Act, RMI, aftermarket access |
| `ai_governance` | AI governance | AI Act 2024/1689, sub-obligations by phase |
| `materials_chemicals` | Battery / Chemicals / Circularity | Battery Reg, REACH, ELV, CLP |
| `emissions_co2` | Emissions / CO2 / Consumer info | Euro 7, CO2 fleet targets, energy labeling |
| `consumer_liability` | Consumer / Liability / Product safety | PLD, Sale of Goods, GPSR |
| `member_state_overlay` | Member state overlay | Country-specific national requirements |
| `non_eu_market` | Non-EU market requirements | UK AV Act, other non-EU frameworks |

---

## 5. Jurisdiction model

Four levels. No conflation.

| Level | Definition | Example |
|-------|-----------|---------|
| `EU` | Directly applicable EU regulation or directive | Regulation (EU) 2018/858 |
| `UNECE` | UNECE regulation applied via EU framework or independently | UNECE R155 |
| `MEMBER_STATE` | National requirement within EU framework | German StVZO |
| `NON_EU_MARKET` | Separate jurisdiction outside EU | UK (never a member state in this system) |

UK is hardcoded as `NON_EU_MARKET`. In the target countries picker, UK appears in a separate section from EU member states.

---

## 6. Rule governance mechanism

### 6.1 Lifecycle states

```
PLACEHOLDER → DRAFT → SEED_UNVERIFIED → ACTIVE → ARCHIVED
```

| State | Can trigger in evaluation? | Max applicability result |
|-------|--------------------------|------------------------|
| PLACEHOLDER | No | UNKNOWN (always) |
| DRAFT | Yes | CONDITIONAL (hard gate) |
| SEED_UNVERIFIED | Yes | CONDITIONAL (hard gate) |
| ACTIVE | Yes | APPLICABLE |
| ARCHIVED | No | — (excluded from evaluation) |

### 6.2 Promotion criteria

**PLACEHOLDER → DRAFT:** Minimum fields populated: `stable_id`, `title`, `legal_family`, `jurisdiction`, `framework_group`, `sources[0].reference`. Trigger logic authored. Obligation text drafted.

**DRAFT → SEED_UNVERIFIED:** All required metadata fields populated. Trigger logic covers known edge cases. Evidence tasks listed. Exclusions listed. No fabricated URLs or article numbers.

**SEED_UNVERIFIED → ACTIVE (critical gate):**
1. `sources[0].official_url` verified — URL resolves to the correct official document
2. `sources[0].oj_reference` recorded
3. `sources[0].last_verified_on` set to current date
4. Temporal scope dates verified against official text
5. Vehicle scope verified against regulation annexes
6. Trigger logic reviewed against regulation's actual scope provisions
7. Obligation text reviewed for accuracy (framework-level; no unverified article-specific claims)
8. Sign-off by rules curator

**ACTIVE → ARCHIVED:** Regulation repealed or replaced. `archived_reason` and `archived_on` populated. Rule excluded from evaluation but retained for audit.

### 6.3 Source policy

**Can activate rules to ACTIVE:**

| Priority | Source type |
|----------|-----------|
| 1 | Official Journal of the EU (EUR-Lex) — adopted regulations, directives, decisions |
| 2 | UNECE official regulation texts |
| 3 | European Commission — adopted delegated/implementing acts published in OJ |
| 4 | National official gazettes (for member state overlays) |
| 5 | EU agency official publications — EDPB guidelines, ECHA SVHC list (for interpretive rules) |

**Cannot activate rules to ACTIVE (DRAFT or PLACEHOLDER only):**

| Source type | Maximum lifecycle_state |
|------------|----------------------|
| Commission proposals, consultations, roadmaps | DRAFT |
| Uploaded PDFs, consultancy reports | Reference only — not a basis for any lifecycle_state |
| Industry publications, news articles | Reference only |
| AI-generated legal analysis | Prohibited |

### 6.4 Manual review triggers

A rule is automatically flagged `manual_review_required: true` when ANY of:
1. `lifecycle_state` is not ACTIVE
2. No source entry has non-null `official_url`
3. No source entry has non-null `last_verified_on`
4. Any temporal date needed for evaluation is null
5. Trigger logic returns `"conditional"`
6. Evaluated result has non-empty `missing_inputs`
7. `jurisdiction_level` is MEMBER_STATE and no country-specific verification exists
8. Rule has known pending amendments (noted in `notes`)

### 6.5 Review cadence

| Lifecycle state | Review frequency | If overdue |
|----------------|-----------------|-----------|
| ACTIVE | Every 6 months | "Verification overdue" warning; downgrade to SEED_UNVERIFIED after 12 months |
| SEED_UNVERIFIED | Every 3 months | Attempt promotion or document blocker |
| DRAFT | Monthly | Promote or archive |
| PLACEHOLDER | Quarterly | Fill content or remove |

### 6.6 Ownership model

| Role | Responsibility |
|------|---------------|
| Rules curator | Registry quality. Approves ACTIVE promotions. Enforces review cadence. |
| Domain authors | Author/maintain rules within their family. Verify sources. |
| QA reviewer | Reviews promotion proposals. Cross-checks trigger logic. |
| Tool maintainer | Schema compliance, integrity tests, engine implementation. |

---

## 7. Data flow

```
User input (form)
    │
    ▼
Config builder (normalize, validate, compute derived flags)
    │
    ▼
EngineConfig (typed, immutable)
    │
    ├──→ Rule evaluator
    │     ├── Declarative condition interpreter (80%)
    │     └── Custom evaluator hooks (20%)
    │     │
    │     ├── Hard gate: non-ACTIVE → max CONDITIONAL
    │     ├── Date-aware evaluation (temporal scope vs. SOP/approvalType)
    │     └── Missing input detection
    │     │
    │     ▼
    │  EvaluationResult[] (applicability, explanation, evidence, metadata)
    │     │
    │     ├──→ Summary (aggregate statistics)
    │     ├──→ Grouper (by ui_package | legal_family | process_stage)
    │     ├──→ Filter (by applicability, search, jurisdiction)
    │     ├──→ Exporter (CSV, JSON, Markdown, Print)
    │     └──→ Comparator (diff against saved config)
    │
    └──→ Persistence (localStorage, URL encoding)
```

---

## 8. Non-functional requirements

| Requirement | Target |
|------------|--------|
| Rule evaluation latency | < 50ms for 200 rules |
| Initial load | < 3 seconds |
| Accessibility | WCAG 2.1 AA |
| Browser support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| Responsive | Desktop-first, tablet-usable, mobile-degraded |
| Offline | Full functionality after initial load |
