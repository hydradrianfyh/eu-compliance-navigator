# EU Vehicle Compliance Navigator

A configuration-driven, source-governed compliance checklist generator for EU vehicle programs.

> **This is not legal advice. This is not a complete legal library. Only verified ACTIVE rules may return APPLICABLE.**

---

## Table of contents

- [What this tool does](#what-this-tool-does)
- [What this tool is NOT](#what-this-tool-is-not)
- [Architecture overview](#architecture-overview)
- [Getting started](#getting-started)
- [Page modes](#page-modes)
- [Configuration panel — every field explained](#configuration-panel--every-field-explained)
- [Derived flags (computed automatically)](#derived-flags-computed-automatically)
- [Rule evaluation — how the engine works](#rule-evaluation--how-the-engine-works)
- [Applicability results — what each value means](#applicability-results--what-each-value-means)
- [Lifecycle states — what each state means](#lifecycle-states--what-each-state-means)
- [Rule card — every information block explained](#rule-card--every-information-block-explained)
- [Summary metrics](#summary-metrics)
- [Search and filtering](#search-and-filtering)
- [Seed rule registry — 35 rules across 13 legal families](#seed-rule-registry--35-rules-across-13-legal-families)
- [Source verification workflow](#source-verification-workflow)
- [Temporal model — multi-date phase-in logic](#temporal-model--multi-date-phase-in-logic)
- [Trigger logic — declarative and custom](#trigger-logic--declarative-and-custom)
- [User state and persistence](#user-state-and-persistence)
- [URL sharing](#url-sharing)
- [Export](#export)
- [Governance invariants](#governance-invariants)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Test coverage](#test-coverage)
- [Running the project](#running-the-project)
- [Implemented phases](#implemented-phases)
- [Intentionally out of scope](#intentionally-out-of-scope)
- [Canonical baseline documents](#canonical-baseline-documents)

---

## What this tool does

It takes a vehicle program configuration as input, evaluates it against a registry of EU/UNECE/member-state regulations, and produces a structured, explainable compliance checklist.

The pipeline is:

```
Configuration input → Rule evaluation → Explainability → User annotations → Shareable / Exportable / Printable
```

It serves:

- Homologation / type-approval engineers
- ADAS / product / system owners
- Data / privacy / AI governance teams
- Project managers
- Management for quick compliance assessment

## What this tool is NOT

- **Not a legal opinion generator.** It produces structured evaluation results, not legal conclusions.
- **Not a static regulation listing.** Applicability depends on the vehicle configuration.
- **Not a complete legal library.** 35 seed rules cover the major frameworks; gaps are marked as PLACEHOLDER.
- **Not an LLM-based chatbot.** There is no AI inference in the evaluation pipeline. All logic is deterministic.
- **Not a source of fabricated certainty.** Rules without verified authoritative sources are automatically downgraded and cannot return APPLICABLE.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                     │
│  React components consume engine output only.           │
│  No rule logic inside components.                       │
├─────────────────────────────────────────────────────────┤
│  EVALUATION LAYER                                       │
│  evaluateRule(): governance → trigger → temporal →      │
│  applicability. Pure functions. No side effects.        │
├─────────────────────────────────────────────────────────┤
│  REGISTRY LAYER                                         │
│  35 typed rules. Zod validation. Lifecycle governance.  │
│  Source verification queue. Immutable promotion gate.   │
├─────────────────────────────────────────────────────────┤
│  CONFIGURATION LAYER                                    │
│  VehicleConfig → EngineConfig with derived flags.       │
│  Persistence, URL sharing, export.                      │
└─────────────────────────────────────────────────────────┘
```

**Key principle**: UI components only render `EvaluationResult`. They never compute applicability, lifecycle, or trigger logic.

---

## Getting started

```bash
npm install
npm run dev          # local dev server at http://localhost:3000
npm test             # Vitest + coverage (36 tests)
npm run lint         # ESLint
npm run build        # Next.js static export
npx tsc --noEmit     # TypeScript type check
```

---

## Page modes

The application is a single page with four mode combinations.

### Single + Interactive (default)

- Left side: configuration panel with all editable fields.
- Right side: summary metrics, grouped rule cards, search/filter, export buttons.
- User can edit per-rule status and notes.

### Single + Report

- Configuration panel is hidden.
- Search, filter, and export buttons are hidden.
- Results remain readable.
- User status and notes are shown as read-only text.
- Optimized for browser print dialog (`@media print`).

### Compare + Interactive

- Two configuration panels side by side (Left and Right).
- Both configurations are independently evaluated by the same engine.
- Summary metrics shown side by side.
- Rules are aligned by group, with lightweight difference badges:
  - `Applicability changed`
  - `Lifecycle changed`
  - `Manual review changed`
  - `Explanation changed`
- Left configuration syncs to URL and localStorage.
- Right configuration exists only in memory.

### Compare + Report

- Both configuration panels are hidden.
- Compare results remain readable.
- Optimized for browser print dialog.

**Mode switching behavior**: switching from Compare back to Single hides the right-hand scenario but preserves it in memory. Search, filter, grouping, and user annotations are shared page-level state across all modes.

---

## Configuration panel — every field explained

### A. Project / Market

| Field | Type | What it means |
|---|---|---|
| `projectName` | Text | Name of the vehicle program, e.g. "MY2027 Electric SUV". For identification only; does not affect rule evaluation. |
| `frameworkGroup` | Select: MN / L / O / AGRI / unspecified | The EU type-approval framework that governs this vehicle. **MN** = M and N categories (cars M1-M3, trucks/vans N1-N3). **L** = L-category (two-wheelers, three-wheelers, quadricycles L1e-L7e). **O** = O-category (trailers O1-O4). **AGRI** = Agricultural/forestry vehicles (T, C, R, S). This is the single most important field — it determines which framework regulations apply. |
| `vehicleCategory` | Text | Specific vehicle category within the framework group, e.g. M1, N1, L3e, O2. Used by rules that target specific categories (e.g. Euro 7 light-duty targets M1/N1 only). |
| `approvalType` | Select: new_type / carry_over / facelift / major_update | **new_type**: brand new type-approval application. **carry_over**: extension of existing type-approval. **facelift**: minor update to approved type. **major_update**: significant changes requiring re-assessment. This affects which temporal date the engine uses for comparison. |
| `sopDate` | Date | Start of Production date. The engine compares this against rule temporal scope dates to determine whether a rule is in force, future, or expired. |
| `firstRegistrationDate` | Date | Date of first vehicle registration. Some regulations (e.g. "applies to first registration from") use this date instead of SOP. Strongly recommended input. |
| `targetCountries` | Comma-separated text | Target market countries as ISO codes, e.g. DE, FR, IT, UK. Determines which member-state overlays and non-EU market rules apply. UK is always treated as NON_EU_MARKET, never as a member state. |

### B. Vehicle Core

| Field | Type | What it means |
|---|---|---|
| `powertrain` | Select: ICE / HEV / PHEV / BEV / FCEV / unspecified | Vehicle powertrain type. HEV/PHEV/BEV/FCEV automatically set `batteryPresent = true`, which triggers Battery Regulation (2023/1542). ICE does not. |
| `automationLevel` | Select: none / basic_adas / l2 / l2plus / l3 / l4 / l4_driverless | Level of driving automation. **l2plus** and above trigger DCAS (R171) evaluation. **l3** and above trigger ALKS (R157) and UK AV Act. **l4_driverless** additionally sets `isDriverless = true`. |
| `aiLevel` | Select: none / conventional / ai_perception / ai_dms / ai_analytics / ai_safety / foundation_model | Level of AI usage in the vehicle. Anything beyond `conventional` sets `hasAI = true` and triggers AI Act obligations. `ai_dms`/`ai_safety`/`ai_perception` set `hasSafetyRelevantAI = true` for Art. 6(1) high-risk classification. `foundation_model` triggers GPAI obligations. |
| `connectivity` | Comma-separated text | Connectivity features: `telematics`, `mobile_app`, `remote_control`, `ota`. These determine `hasConnectedServices` and `hasOTA` derived flags, triggering Data Act, ePrivacy, GDPR, and SUMS rules. |
| `dataFlags` | Comma-separated text | Data processing indicators: `cabin_camera`, `driver_profiling`, `biometric_data`, `location_tracking`. These determine `processesPersonalData`, triggering GDPR and AI Act Annex III high-risk rules. |

### C. Automation Details

| Field | Type | What it means |
|---|---|---|
| `motorwayAssistant` | Checkbox | Whether a motorway/highway assistant system is fitted. Combined with `automationLevel >= l2plus`, this is strong evidence for DCAS (R171) applicability. |
| `parkingAutomation` | Checkbox | Whether automated parking is fitted. With `automationLevel >= l2plus`, this triggers conditional DCAS evaluation (system-level confirmation needed). |

### D. Readiness

| Field | Type | What it means |
|---|---|---|
| `readiness.csmsAvailable` | Checkbox | Whether the Cybersecurity Management System (CSMS) is available. This is a capability flag, not a regulation — it indicates organizational readiness for R155 compliance. |

> **Note**: The schema defines 5 additional readiness flags (`sumsAvailable`, `dpiaCompleted`, `technicalDocStarted`, `evidenceOwnerAssigned`, `registrationAssumptionsKnown`) that exist in the engine but are not yet exposed in the configuration panel UI.

---

## Derived flags (computed automatically)

These are calculated by `buildEngineConfig()` from the user inputs. They are never edited directly.

| Flag | Logic |
|---|---|
| `batteryPresent` | `powertrain` is HEV, PHEV, BEV, or FCEV |
| `hasOTA` | `connectivity` includes `ota`, or `readiness.sumsAvailable` is true |
| `hasConnectedServices` | `connectivity` includes telematics, mobile_app, remote_control, or ota |
| `processesPersonalData` | `dataFlags` includes cabin_camera, driver_profiling, biometric_data, or location_tracking |
| `hasAI` | `aiLevel` is not `none` or `conventional` |
| `hasSafetyRelevantAI` | `aiLevel` is `ai_dms`, `ai_safety`, or `ai_perception` |
| `isL3Plus` | `automationLevel` is `l3`, `l4`, or `l4_driverless` |
| `isDriverless` | `automationLevel` is `l4_driverless` |
| `targetsEU` | `targetCountries` contains any EU member state code |
| `targetsUK` | `targetCountries` contains `UK` |
| `targetsMemberStates` | Subset of `targetCountries` that are EU member state codes |
| `targetsNonEU` | Subset of `targetCountries` that are not EU member state codes |

EU member state codes recognized: AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK.

---

## Rule evaluation — how the engine works

For each rule, `evaluateRule()` runs this pipeline:

1. **Governance normalization**: `applyGovernanceToRule(rule)` — downgrades ACTIVE rules lacking verified sources; marks PLACEHOLDER for manual review.
2. **Trigger evaluation**: declarative condition interpreter (80% of rules) or custom evaluator (20%).
3. **Temporal evaluation**: checks SOP/registration date against the rule's multi-date temporal scope, including `effective_to` sunset.
4. **Applicability computation**: combines trigger result, temporal assessment, missing inputs, and lifecycle state into a final `ApplicabilityResult`.
5. **Explainability assembly**: populates all explanation fields.

The engine is pure — no global state, no side effects, no UI imports.

---

## Applicability results — what each value means

| Value | Meaning | When it occurs |
|---|---|---|
| `APPLICABLE` | This regulation applies to the vehicle. | Only when: rule is ACTIVE, trigger matches, temporal is in force, no missing inputs. |
| `NOT_APPLICABLE` | This regulation does not apply. | Trigger did not match, or rule has expired (`effective_to` is past). |
| `CONDITIONAL` | Possibly applicable but uncertain. | Non-ACTIVE rule that would otherwise be APPLICABLE (downgraded); or trigger returned `"conditional"`; or `conditional_reason` is set. |
| `UNKNOWN` | Cannot determine applicability. | Missing required input fields; temporal dates unavailable; rule is PLACEHOLDER. |
| `FUTURE` | Rule will apply but is not yet in force. | SOP date is before the rule's effective date. Only for ACTIVE rules; non-ACTIVE future rules get CONDITIONAL. |

---

## Lifecycle states — what each state means

| State | Description | Engine behavior |
|---|---|---|
| `PLACEHOLDER` | Known regulatory gap. Shell exists but content is not authored. | Always returns `UNKNOWN`. Excluded from evaluation. |
| `DRAFT` | Known regulation with significant unknowns remaining. | Can trigger, but max result is `CONDITIONAL`. |
| `SEED_UNVERIFIED` | Content is plausible but source fields are not verified. | Can trigger, but max result is `CONDITIONAL`. |
| `ACTIVE` | Source verified: `official_url` + `oj_reference` + `last_verified_on` all present. | Full evaluation. Can return `APPLICABLE`. |
| `ARCHIVED` | Regulation repealed or replaced. | Excluded from evaluation entirely. |

**Hard gate**: the only path to `APPLICABLE` is through `ACTIVE` lifecycle state. All other states are capped at `CONDITIONAL` regardless of trigger match.

**Automatic downgrade**: rules written as `ACTIVE` in seed data but missing any of the three required source fields (`official_url`, `oj_reference`, `last_verified_on`) are automatically downgraded to `SEED_UNVERIFIED` by `applyGovernanceToRule()`.

---

## Rule card — every information block explained

Each rule card in the results panel shows:

| Block | Content | Source field |
|---|---|---|
| **Title** | Full regulation name | `result.title` |
| **Stable ID** | Immutable rule identifier, e.g. REG-TA-001 | `result.rule_id` |
| **Lifecycle badge** | Current lifecycle state (SEED_UNVERIFIED, ACTIVE, etc.) | `result.lifecycle_state` |
| **Applicability badge** | Evaluation result (APPLICABLE, CONDITIONAL, etc.) | `result.applicability` |
| **Manual review badge** | Shown when human review is required | `result.manual_review_required` |
| **Explanation** | Engine's text description of why this result was reached | `result.explanation` |
| **Owner** | Suggested responsible department (homologation, cybersecurity, legal, etc.) | `result.owner_hint` |
| **Trigger path** | Whether evaluation used `declarative` or `custom` logic | `result.trigger_path` |
| **Matched conditions** | Which trigger conditions were satisfied | `result.matched_conditions` |
| **Unmatched conditions** | Which trigger conditions were not satisfied | `result.unmatched_conditions` |
| **Missing inputs** | Which config fields were null/undefined and prevented evaluation | `result.missing_inputs` |
| **Manual review reason** | Why manual review is flagged (e.g. "Downgraded from ACTIVE because...") | `result.manual_review_reason` |
| **Sources** | Legal references with OJ numbers (e.g. "Regulation (EU) 2018/858 — OJ L 151, 14.6.2018") | `result.sources[]` |
| **Temporal fields** | All non-null date fields from the rule's temporal scope | `result.temporal` |
| **User status** | Per-rule tracking: `todo` / `in_progress` / `done` | localStorage persisted |
| **User note** | Free-text annotation per rule | localStorage persisted |

In **report mode**, user status and notes are displayed as read-only text instead of interactive controls.

---

## Summary metrics

The summary bar at the top of the results panel shows:

| Metric | Meaning |
|---|---|
| **Visible rules** | Number of rules currently displayed (after search/filter) |
| **APPLICABLE** | Count of rules evaluated as APPLICABLE in the current view |
| **NOT_APPLICABLE** | Count of NOT_APPLICABLE rules |
| **CONDITIONAL** | Count of CONDITIONAL rules |
| **UNKNOWN** | Count of UNKNOWN rules |
| **FUTURE** | Count of FUTURE rules |
| **Visible manual review** | Count of rules requiring manual review in the current view |

All metrics reflect the **current filtered view**, not the full registry.

---

## Search and filtering

| Control | Behavior |
|---|---|
| **Search** | Filters rule cards by matching against: `rule_id`, `title`, `short_label`, `legal_family`, `ui_package`, `explanation`. Case-insensitive substring match. |
| **Applicability filter** | Dropdown: `all` / `APPLICABLE` / `NOT_APPLICABLE` / `CONDITIONAL` / `UNKNOWN` / `FUTURE`. Shows only rules with the selected result. |
| **Group by** | `legal_family` (default) groups by the 13 canonical legal families. `ui_package` groups by display package: `wvta_core` / `market_access` / `country_overlay` / `horizontal`. |

---

## Seed rule registry — 93 rules across 17 legal families

| Legal family | Count | Coverage |
|---|---|---|
| `vehicle_approval` | 3 | WVTA (2018/858) for M/N/O, L-category (168/2013), AGRI (167/2013 placeholder) |
| `general_safety` | 6 | GSR2 (2019/2144) framework + ISA, EDR, DMS/DDW, AEB, TPMS |
| `unece_technical` | 35 | Annex II matrix placeholder + 34 individual regulations (R10 EMC, R13/13-H braking, R16 belts, R21 interior, R25 head restraints, R34 fire, R43 glazing, R44/R129 child seats, R46 mirrors, R48 lighting, R51 noise, R58 RUP, R66 bus rollover, R79 steering, R83 emissions, R94/R95 impact, R100 EV safety, R110 CNG/LNG, R118 interior fire, R127 pedestrian, R134 hydrogen, R135/R137 pole/frontal impact, R140 ESC, R141 TPMS, R142 tyres, R145 ISOFIX, R149 LED headlamp, R153 fuel integrity) |
| `cybersecurity` | 3 | R155 CSMS, R156 SUMS, CRA (draft) |
| `dcas_automated` | 3 | R157 ALKS, R171 DCAS, EU L4 (placeholder) |
| `privacy_connected` | 3 | GDPR, ePrivacy Directive, EDPB connected vehicles guidance |
| `data_access` | 1 | EU Data Act (2023/2854) |
| `ai_governance` | 4 | AI Act prohibited practices, GPAI, Annex III high-risk, Art. 6(1) safety components |
| `materials_chemicals` | 3 | Battery Regulation, REACH, ELV revision (draft) |
| `emissions_co2` | 5 | Euro 7 light-duty, Euro 7 heavy-duty, CO2 fleet targets, WLTP, RDE |
| `consumer_liability` | 5 | PLD revised, GPSR (draft), Sale of Goods, Digital Content Directive, Warranty/Guarantee |
| `member_state_overlay` | 10 | DE, FR, IT, ES, NL, SE, PL, AT, BE, CZ (all placeholders) |
| `non_eu_market` | 1 | UK AV Act 2024 |
| `insurance_registration` | 3 | Motor Insurance Directive, Green Card, CO2 registration tax (placeholder) |
| `market_surveillance` | 2 | Market Surveillance Regulation 2019/1020, Economic operator obligations |
| `import_customs` | 3 | Import/CoC recognition, Union Customs Code, Rules of origin |
| `consumer_information` | 3 | Car CO2 labelling, Tyre labelling, Energy labelling framework |

Current lifecycle distribution: 0 ACTIVE (14 prose-ACTIVE downgraded), ~65 SEED_UNVERIFIED, ~5 DRAFT, ~23 PLACEHOLDER.

---

## Source verification workflow

All 14 rules that were labeled ACTIVE in the seed candidate prose have been automatically downgraded to `SEED_UNVERIFIED` because they lack verified source fields in code.

The verification queue tracks each downgraded rule with:

- `stable_id` and `title`
- `current_lifecycle_state` (always SEED_UNVERIFIED after downgrade)
- `missing_source_fields`: which of `official_url`, `oj_reference`, `last_verified_on` are null
- `expected_authoritative_source_family`: EUR-Lex, UNECE, etc.
- `expected_legal_reference`: the regulation reference string
- `verification_status`: PENDING_SOURCE_FIELDS
- `reviewer_notes`: reasons for current status

**Promotion gate**: `RuleRegistry.promoteRuleToActive(id, reviewer)` is the only way to promote a rule to ACTIVE. It:

1. Checks all three source fields are present and non-null.
2. Checks the primary source family is authoritative.
3. Rejects PLACEHOLDER and ARCHIVED rules.
4. Returns a new immutable `RuleRegistry` instance (does not mutate the original).

No code in this repository fabricates `official_url` or `last_verified_on` values.

---

## Temporal model — multi-date phase-in logic

Each rule has a `RuleTemporalScope` with these date fields:

| Field | Meaning |
|---|---|
| `entry_into_force` | Date the regulation entered into force (publication + X days). |
| `applies_to_new_types_from` | Date from which new type-approvals must comply. |
| `applies_to_all_new_vehicles_from` | Date from which all newly produced vehicles must comply. |
| `applies_to_first_registration_from` | Date from which first registration requires compliance. |
| `applies_from_generic` | Generic application date for horizontal regulations without type-approval phase-in. |
| `effective_to` | Sunset / repeal date. Rules past this date return `NOT_APPLICABLE`. |
| `small_volume_derogation_until` | Small-volume manufacturer exemption deadline. |
| `notes` | Free-text temporal notes. |

The engine selects the reference date based on `approvalType`:

- `new_type` → compares SOP against `applies_to_new_types_from`
- `carry_over` / `facelift` / `major_update` → compares SOP against `applies_to_all_new_vehicles_from`
- If `firstRegistrationDate` is set → also compares against `applies_to_first_registration_from`
- Horizontal regulations → compares against `applies_from_generic`
- `effective_to` is always checked regardless of reference path

---

## Trigger logic — declarative and custom

### Declarative (default, ~80% of rules)

```typescript
{
  mode: "declarative",
  match_mode: "all" | "any",       // all conditions must match, or any one
  conditions: [
    { field: "frameworkGroup", operator: "eq", value: "MN" },
    { field: "isL3Plus", operator: "is_true" }
  ],
  fallback_if_missing: "unknown" | "not_applicable",
  conditional_reason?: "Vehicle may contain high-risk AI"
}
```

Supported operators: `eq`, `neq`, `in`, `not_in`, `includes`, `includes_any`, `gt`, `gte`, `lt`, `lte`, `is_true`, `is_false`, `is_null`, `is_not_null`.

### Custom evaluator (exception, ~20% of rules)

Currently only one custom evaluator exists: `dcas_if_fitted` for R171 DCAS.

It evaluates whether the vehicle has a sustained lateral + longitudinal control system (DCAS-type), based on `frameworkGroup === "MN"` + `automationLevel >= l2plus` + `motorwayAssistant` or `parkingAutomation`.

---

## User state and persistence

| What is persisted | Storage | Key |
|---|---|---|
| Current `VehicleConfig` | localStorage | `evcn:config` |
| Per-rule user status (`todo` / `in_progress` / `done`) | localStorage | `evcn:rule-statuses` |
| Per-rule user notes (free text) | localStorage | `evcn:rule-notes` |

- State is restored on page load (client-side only, `ssr: false`).
- "Clear saved state" button removes all three keys and resets to defaults.
- User status and notes are shared across single/compare/report modes.

---

## URL sharing

Core `VehicleConfig` fields are synced to URL query parameters:

`projectName`, `frameworkGroup`, `vehicleCategory`, `approvalType`, `sopDate`, `firstRegistrationDate`, `powertrain`, `automationLevel`, `aiLevel`, `targetCountries`, `connectivity`, `dataFlags`, `motorwayAssistant`, `parkingAutomation`, `readiness.csmsAvailable`

**Priority on page load**: URL > localStorage > default config.

**Not synced to URL**: user notes, user status, search term, applicability filter, group mode, compare-mode right configuration.

---

## Export

| Format | Content |
|---|---|
| **JSON** | Complete payload: `config`, `evaluatedResults[]`, `userRuleStatuses`, `userRuleNotes` |
| **CSV** | Flat rows: `rule_id`, `title`, `applicability`, `lifecycle_state`, `explanation`, `owner_hint`, `user_status`, `user_note`, `config_json` |

Exports reflect the **current filtered view**, not the full evaluation set.

---

## Governance invariants

These rules are enforced at the engine level and cannot be overridden by UI code:

1. **Non-ACTIVE rules never return APPLICABLE.** They are capped at CONDITIONAL with `was_downgraded_from_applicable: true`.
2. **PLACEHOLDER rules always return UNKNOWN.** They are excluded from meaningful evaluation.
3. **ACTIVE requires verified sources.** `official_url` + `oj_reference` + `last_verified_on` must all be present on the primary source.
4. **Prose-ACTIVE without verified sources is auto-downgraded.** `applyGovernanceToRule()` enforces this at every evaluation entry point.
5. **No fabricated URLs or verification dates.** `makeSource()` hardcodes `official_url: null` and `last_verified_on: null`.
6. **Promotion is gated.** `promoteRuleToActive()` throws if source fields are incomplete. It returns a new registry, not a mutation.
7. **evaluateRule() always governs first.** The engine entry point calls `applyGovernanceToRule(rule)` before any trigger or temporal logic.

---

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) with static export |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State | React local state (useState/useEffect/useCallback/useMemo/useRef) |
| Validation | Zod |
| Unit tests | Vitest |
| E2E tests | Playwright (configured, no test cases yet) |
| Database | None. Registry adapter interface designed for future migration. |

---

## Repository structure

```
eu-compliance-navigator/
├── docs/                          # Governance documents
│   ├── phase0/                    # Canonical baseline (architecture, data model, plan, seed list)
│   ├── source-policy.md           # What qualifies as authoritative source
│   ├── rule-authoring-guide.md    # How to write rules
│   ├── review-checklist.md        # Review gates for rules and code
│   └── correction-ledger.md       # Design corrections already adopted
├── src/
│   ├── shared/constants.ts        # All enumerations, Zod schemas, framework definitions
│   ├── config/
│   │   ├── schema.ts              # VehicleConfig, EngineConfig, user state Zod schemas
│   │   ├── defaults.ts            # Default VehicleConfig
│   │   ├── persistence.ts         # localStorage read/write/clear
│   │   ├── sharing.ts             # URL encode/decode/sync
│   │   └── comparison.ts          # Config field diff
│   ├── registry/
│   │   ├── schema.ts              # Rule, SourceReference, TriggerLogic Zod schemas
│   │   ├── governance.ts          # applyGovernanceToRule, validateRegistryIntegrity
│   │   ├── registry.ts            # RuleRegistry class (immutable promotion)
│   │   ├── adapter.ts             # RegistryAdapter interface for future DB
│   │   ├── custom-evaluators.ts   # dcas_if_fitted custom evaluator
│   │   ├── verification.ts        # Promotability assessment, verification queue builder
│   │   ├── verification-queue.ts  # Pre-built queue from raw seed rules
│   │   └── seed/                  # 13 legal family seed modules + shared helpers + index
│   ├── engine/
│   │   ├── types.ts               # EvaluationResult, TriggerResult schemas
│   │   ├── config-builder.ts      # VehicleConfig → EngineConfig with derived flags
│   │   ├── declarative.ts         # Declarative condition interpreter
│   │   ├── temporal.ts            # Multi-date temporal scope evaluator
│   │   ├── evaluator.ts           # evaluateRule, evaluateAllRules
│   │   ├── comparator.ts          # Left/right evaluation row comparison
│   │   └── summary.ts             # Aggregate statistics
│   ├── export/
│   │   ├── view-export.ts         # JSON/CSV blob builders
│   │   └── download.ts            # Browser blob download helper
│   ├── app/
│   │   ├── globals.css            # Layout, print, report, compare styles
│   │   ├── layout.tsx             # Root layout with metadata
│   │   └── page.tsx               # Entry point (dynamic, ssr: false)
│   └── components/phase3/
│       ├── Phase3MainPage.tsx      # Main page orchestrator (all modes)
│       ├── ConfigPanel.tsx         # Vehicle configuration form
│       ├── FilterBar.tsx           # Search, applicability filter, group-by
│       ├── ResultsPanel.tsx        # Single-mode results (summary + grouped cards)
│       ├── SummaryMetrics.tsx      # Metric cards
│       ├── RuleCard.tsx            # Individual rule display (interactive + report)
│       ├── CompareResultsPanel.tsx # Compare-mode results (side-by-side summary + cards)
│       └── CompareRuleCard.tsx     # Compare-mode rule difference card
└── tests/
    ├── unit/                      # Engine, governance, temporal, registry, verification
    └── ui/                        # Phase 3–6A UI regression tests
```

---

## Test coverage

| Test file | Tests | Coverage |
|---|---|---|
| evaluator.test.ts | 4 | Non-ACTIVE downgrade, PLACEHOLDER, missing inputs, effective_to expiry |
| governance.test.ts | 3 | Seed downgrade, integrity report, PLACEHOLDER manual review |
| temporal.test.ts | 4 | Future-dated, no reference field, expired, expired without forward path |
| registry.test.ts | 2 | Evaluable rule filtering, family query |
| verification.test.ts | 6 | Queue size, completeness, promotability gate, immutable promotion |
| phase3-main-page.test.tsx | 3 | Render, search filter, badges |
| phase4a-persistence.test.tsx | 3 | Restore, persist edits, clear |
| phase4b-share-export.test.tsx | 3 | URL override, URL sync, export blobs |
| phase5a-report-mode.test.tsx | 2 | Mode toggle, read-only user fields |
| phase5b-compare-mode.test.tsx | 2 | Dual panels, applicability diff signals |
| phase6a-regressions.test.tsx | 3 | Default single, compare+report combo, cross-mode state preservation |
| **Total** | **36** | Statements 85%, Branches 73%, Functions 82%, Lines 85% |

---

## Running the project

```bash
npm install                        # install dependencies
npm run dev                        # development server
npm test                           # run all tests with coverage
npm run lint                       # ESLint check
npm run build                      # production static export
npx tsc --noEmit -p tsconfig.json  # TypeScript type check
```

---

## Implemented phases

| Phase | Scope |
|---|---|
| Phase 1 | Project scaffold, folder structure, base configuration |
| Phase 2 | Canonical schemas, registry, governance, rule engine, seed rules, integrity checks, verification workflow |
| Phase 3 | Single-page interactive UI: config panel, results, summary, grouped cards, search/filter |
| Phase 4A | Per-rule user status and notes, localStorage persistence, clear/reset |
| Phase 4B | URL sharing for core config, JSON/CSV export |
| Phase 5A | Report mode, print-friendly CSS |
| Phase 5B | Lightweight two-configuration compare mode |
| Phase 6A | Temporal hardening (`effective_to` sunset), regression coverage, documentation sync |
| Phase 7A | UI optimization: structured multi-select inputs, collapsible rule cards, group counts, registry coverage indicator |
| Phase 7B | Regulatory content expansion: UNECE Annex II matrix, 10 member-state overlays, 4 new families |
| Phase 8 | Coverage matrix model (domain + artifact_type), coverage/gap panel, 3 structured backlogs, priority gap-fill rules |
| Phase 9 | Evidence operationalization (required_documents, submission_timing, etc.), workflow-based member-state overlays (9 countries × 5 workflows), Coverage Contract / Gap Query panel with filtering, 137 rules across 17 families |
| Phase 11 (Path C) | Pilot-driven "working guidance" delivery: MY2027 BEV fixture + layered acceptance test; VehicleConfig field expansion (braking/steering/cabin/lighting/fuel/hmi); Phase 11B.1 evidence enrichment for 4 ACTIVE + 8 high-frequency SEED rules; Phase 11B.2 source verification and promotion of **R100 + Battery Regulation 2023/1542** to ACTIVE (R155/R156 already ACTIVE); Phase 11C Germany authored overlay (5 ACTIVE rules covering registration/HU-AU/PflVG/KraftStG/Umweltzonen) — FR/NL deferred to Phase 12 with explicit "pending" UI indicator; Phase 11D 5-state freshness contract (`fresh`/`due_soon`/`overdue`/`critically_overdue`/`never_verified`) with `FreshnessBadge` + CoveragePanel distribution + FilterBar filter; Phase 11D.5 **EUR-Lex SPARQL watcher** (`scripts/eur-lex-watch.mjs` + weekly GitHub Action); Phase 11E_v1 **Timeline engine** (`src/engine/timeline.ts` with graceful degradation), **Executive Summary engine** (`canEnterMarket` / `topBlockers` / `topDeadlines` / `countriesAtRisk` / `coverageScore`), **Owner Dashboard** (`src/engine/by-owner.ts` — per-`owner_hint` task view); Phase 11F **Compliance Author DSL** (`content/authoring.csv` + `scripts/generate-authoring-data.mjs` + `docs/AUTHORING.md`) so compliance specialists can contribute content without writing TypeScript. Outcome: APPLICABLE rules 4 → **11** for pilot; 80 unit tests passing; verified/indicative/pending authoring clearly separated in UI. |

---

## Intentionally out of scope

- PDF generation
- Server-side API or database
- Multi-user collaboration
- Rule authoring UI (CLI via CSV is live -- see docs/AUTHORING.md)
- Internationalization
- Full UNECE Annex II regulation matrix
- Member-state overlay content for FR / NL (deferred to Phase 12 per Path C)
- Promotion of other SEED_UNVERIFIED rules to ACTIVE (awaits per-rule source verification; watchlist in scripts/eur-lex-watch.mjs)

---

## Canonical baseline documents

- `docs/phase0/architecture.md` — system architecture and invariants
- `docs/phase0/data-model.md` — complete TypeScript data model
- `docs/phase0/implementation-plan.md` — phased delivery plan
- `docs/phase0/seed-rule-candidate-list.md` — 35 seed rules with field-level detail
- `docs/source-policy.md` — what qualifies as authoritative source
- `docs/rule-authoring-guide.md` — how to author rules
- `docs/review-checklist.md` — review gates for rules and code changes
- `docs/correction-ledger.md` — design corrections already adopted

---

© Yanhao FU
