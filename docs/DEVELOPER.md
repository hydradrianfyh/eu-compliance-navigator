# Developer Guide

**Audience**: Contributors, integrators, engineers extending `eu-compliance-navigator`.
**Reading order**: Sections 1–3 get you running; 4–9 cover the domain model; 10–14 cover workflows.
**Estimated read**: 30 minutes for §1–3, another 60 minutes for the rest.

---

## 1. Getting started (5-minute dev setup)

```bash
git clone <repo>
cd eu-compliance-navigator
npm install
npm run dev          # http://localhost:3000
```

Verify:

```bash
npm test             # 230 tests
npx tsc --noEmit     # 0 errors
npm run lint         # 0 errors
```

If all three pass, your environment is correct.

First code change? Open `src/app/(workspace)/setup/page.tsx`, tweak a heading, save → Next.js hot-reloads. If the change persists on refresh without `rm -rf .next`, you're good.

---

## 2. Architecture

### 2.1 The non-negotiable invariant

> **UI components only render `EvaluationResult`. They never compute applicability, lifecycle, or trigger logic.**

If you find yourself writing `if (rule.lifecycle_state === "ACTIVE")` inside a React component, stop. That logic belongs in `src/engine/` or `src/lib/classify-trust.ts`. The UI is a display layer over a deterministic pipeline.

### 2.2 Four layers, one direction

```
┌──────────────────────────────────────────────────────────┐
│  PRESENTATION         src/app/ · src/components/         │
│      ▲                                                   │
│      │ EvaluationResult[] + VehicleConfig (read-only)    │
│      │                                                   │
│  EVALUATION           src/engine/                        │
│      ▲                                                   │
│      │ Rule[] + EngineConfig                             │
│      │                                                   │
│  REGISTRY             src/registry/                      │
│      ▲                                                   │
│      │ Rule schema (Zod)                                 │
│      │                                                   │
│  CONFIGURATION        src/config/ · src/state/           │
└──────────────────────────────────────────────────────────┘
```

Imports go **up** only. Presentation may import from Evaluation, Registry, and Configuration. Registry and Evaluation **must not** import from Presentation. Violations are caught by review, not lint (today).

### 2.3 Evaluation pipeline

`src/engine/evaluator.ts` applies four gates in order:

1. **Governance gate** — `applyGovernanceToRule`. Non-ACTIVE rules are capped at `CONDITIONAL` no matter what triggers match. This is why `SHADOW` and `SEED_UNVERIFIED` can never return `APPLICABLE`.
2. **Trigger gate** — `interpretDeclarativeTrigger` or a custom evaluator. Produces `matched_conditions` + `unmatched_conditions`.
3. **Temporal gate** — `evaluateTemporalScope`. Handles `FUTURE`, `NOT_APPLICABLE` (past `effective_to`), and `UNKNOWN` (missing dates).
4. **Applicability computation** — `computeApplicability` synthesises the above into the final `ApplicabilityResult`.

All four functions are pure and individually tested.

---

## 3. Repository layout (annotated)

```
eu-compliance-navigator/
│
├── src/
│   ├── app/                              Next.js 16 App Router
│   │   ├── (workspace)/                  Route group — does NOT appear in URL
│   │   │   ├── layout.tsx                AppShell wrapper + state hydrate
│   │   │   ├── setup/page.tsx            Setup tab (ConfigPanelV2)
│   │   │   ├── status/page.tsx           Status tab (verdict + metrics)
│   │   │   ├── plan/page.tsx             Plan tab (timeline + owners)
│   │   │   ├── rules/page.tsx            Rules tab (tri-layer + cards)
│   │   │   └── coverage/page.tsx         Coverage tab (governance)
│   │   ├── legacy/page.tsx               Fallback renders old Phase3MainPage
│   │   ├── page.tsx                      Root — redirects to lastActiveTab
│   │   ├── layout.tsx                    HTML shell
│   │   └── globals.css                   Global styles (≈1900 lines)
│   │
│   ├── components/
│   │   ├── shell/                        Workspace chrome
│   │   │   ├── AppShell.tsx              Hydrates store, renders nav+content+footer
│   │   │   ├── GlobalNav.tsx             Top bar (project chip + ⚙ menu)
│   │   │   ├── TabNav.tsx                5-tab buttons
│   │   │   ├── ScopeBanner.tsx           Always-visible coverage declaration
│   │   │   ├── GlossaryModal.tsx         Terminology explanations
│   │   │   ├── StatusBar.tsx             Sticky footer (project summary)
│   │   │   ├── LastActiveTabTracker.tsx  Persists current tab route
│   │   │   └── TabPlaceholder.tsx        Used by routes pre-migration
│   │   │
│   │   ├── setup/                        Setup-tab widgets
│   │   │   ├── ConfigPanelV2.tsx         Main 6-section form
│   │   │   ├── SetupProgress.tsx         "X of Y sections complete" bar
│   │   │   ├── OnboardingBanner.tsx      First-visit guidance
│   │   │   ├── AdvancedSystemsSection.tsx Collapsible braking/steering/…
│   │   │   └── OptionalSection.tsx       Generic opt-in section
│   │   │
│   │   ├── rules/
│   │   │   └── RuleCardV2.tsx            5-section rule card
│   │   │
│   │   ├── shared/
│   │   │   ├── TrustBadge.tsx            Verified / Indicative / Pending
│   │   │   ├── ApplicabilityBadge.tsx    Applies / May apply / Does not apply / Unknown
│   │   │   └── EmptyState.tsx            Reusable empty-state primitive
│   │   │
│   │   └── phase3/                       LEGACY — retained for fallback only
│   │       ├── Phase3MainPage.tsx        Old single-page layout
│   │       ├── FreshnessBadge.tsx        Used by legacy + Coverage tab
│   │       ├── CoveragePanel.tsx         Used by /coverage page
│   │       └── …                         Do not extend; contributions go to shell/setup/rules/shared
│   │
│   ├── engine/                           PURE evaluation functions
│   │   ├── evaluator.ts                  evaluateRule / evaluateAllRules
│   │   ├── declarative.ts                interpretDeclarativeTrigger
│   │   ├── temporal.ts                   evaluateTemporalScope
│   │   ├── config-builder.ts             VehicleConfig → EngineConfig
│   │   ├── executive-summary.ts          Status-tab computations
│   │   ├── timeline.ts                   Plan-tab timeline computations
│   │   ├── by-owner.ts                   Owner-dashboard grouping
│   │   ├── comparator.ts                 Compare-mode diff
│   │   ├── summary.ts                    Aggregations
│   │   └── types.ts                      EvaluationResult
│   │
│   ├── registry/
│   │   ├── schema.ts                     Rule shape (Zod) — canonical
│   │   ├── governance.ts                 Lifecycle state machine
│   │   ├── freshness.ts                  6-state freshness math
│   │   ├── verification.ts               Source verification workflow
│   │   ├── registry.ts                   Query / filter / materialize API
│   │   ├── coverage-matrix.ts            Domain × process coverage
│   │   ├── source-validation.ts          official_url / oj_reference rules
│   │   ├── custom-evaluators.ts          Named custom trigger evaluators
│   │   └── seed/
│   │       ├── index.ts                  Aggregates + applies enrichments
│   │       ├── *.ts                      One file per legal family
│   │       ├── evidence-enrichment.ts    required_documents / evidence
│   │       ├── freshness-data.ts         last_human_review_at / cadence
│   │       ├── authoring-generated.ts    GENERATED from content/authoring.csv
│   │       └── classification.ts         Rule → domain / artifact_type
│   │
│   ├── state/
│   │   └── app-shell-store.ts            zustand store (persisted)
│   │
│   ├── config/
│   │   ├── schema.ts                     VehicleConfig (Zod)
│   │   ├── defaults.ts                   defaultVehicleConfig + advancedSectionDefaults
│   │   ├── persistence.ts                localStorage read/write
│   │   └── sharing.ts                    URL query-string encode/decode
│   │
│   ├── lib/                              Small, pure utilities
│   │   ├── classify-trust.ts             Lifecycle + freshness → Verified/Indicative/Pending
│   │   ├── condition-to-text.ts          TriggerCondition → natural-language sentence
│   │   ├── format-months.ts              "14 months overdue" / "in 7 months"
│   │   ├── golden-dataset.ts             Loader + diff vs registry
│   │   ├── setup-progress.ts             Per-section completeness
│   │   └── timeline-sop-groups.ts        SOP-anchored bucket math
│   │
│   ├── export/                           JSON / CSV / URL sharing
│   │   ├── download.ts                   Blob + filename helper
│   │   └── view-export.ts                Build export payload
│   │
│   ├── shared/
│   │   └── constants.ts                  All enums, options, framework defs
│   │
│   └── styles/
│       └── tokens.css                    Semantic tokens + forced-colors
│
├── tests/
│   ├── unit/                             Pure-function tests (30 files)
│   ├── ui/                               React Testing Library (component tests)
│   └── regression/                       Golden-dataset + drift checks
│
├── fixtures/
│   ├── pilot-my2027-bev.ts               Canonical pilot config
│   ├── pilot-my2027-bev.expected.ts      Baseline evaluation result
│   ├── pilot-my2028-phev.ts              Secondary pilot (cross-check)
│   └── pilot-l3e-a2.ts                   L-category pilot
│
├── content/
│   ├── authoring.csv                     Non-dev rule-authoring DSL
│   └── golden-dataset.json               21 anchor rules (CI-enforced)
│
├── scripts/
│   ├── eur-lex-watch.mjs                 Weekly CI source watcher
│   └── generate-authoring-data.mjs       CSV → authoring-generated.ts
│
├── docs/
│   ├── USER-GUIDE.md                     Business-user guide (Chinese)
│   ├── DEVELOPER.md                      This file
│   ├── AUTHORING.md                      CSV DSL authoring guide
│   ├── phase0/                           Original architecture notes
│   ├── phase12/
│   │   ├── ux-refactor-spec-v2.md        Path B product spec
│   │   ├── sprint-10-go-no-go.md         Ship report
│   │   └── demo-scripts/                 3 stakeholder walkthroughs
│   ├── adr/                              Architecture Decision Records
│   │   ├── README.md                     Index
│   │   ├── ADR-P1-keep-localstorage.md
│   │   └── ADR-P6-reusable-layer-seams.md
│   ├── superpowers/specs/                brainstorming-skill outputs
│   ├── source-policy.md                  What qualifies as authoritative source
│   ├── rule-authoring-guide.md           Human-written rule authoring
│   ├── review-checklist.md               PR review gates
│   └── correction-ledger.md              Past design corrections
│
└── .github/workflows/
    ├── golden-regression.yml             Gate PRs on golden-dataset CI
    ├── drift-alert.yml                   Weekly EUR-Lex source-change check
    └── eur-lex-watch.yml                 Retained from Phase 11D
```

---

## 4. Rule authoring

There are two paths:

### 4.1 Non-developer path — CSV DSL

If you're a compliance specialist and not comfortable with TypeScript:

1. Edit `content/authoring.csv` — one row per rule.
2. Run `node scripts/generate-authoring-data.mjs` → regenerates `src/registry/seed/authoring-generated.ts`.
3. Run `npm test` locally. If green, open a PR.

See [docs/AUTHORING.md](./AUTHORING.md) for the CSV schema.

### 4.2 Developer path — TypeScript seed

For complex rules (custom evaluators, cross-rule relations, detailed temporal scopes):

1. Pick the right seed file under `src/registry/seed/` (one per legal family).
2. Add a new entry using `makeSeedRule(...)`.
3. Fill **at minimum**: `stable_id`, `title`, `short_label`, `legal_family`, `jurisdiction`, `jurisdiction_level`, `framework_group`, `sources`, `lifecycle_state`, `vehicle_scope`, `applicability_summary`, `exclusions`, `trigger_logic`, `temporal`, `planning_lead_time_months`, `output_kind`, `obligation_text`, `evidence_tasks`, `owner_hint`, `manual_review_required`, `manual_review_reason`, `notes`, `ui_package`, `process_stage`.
4. If the rule references standards (ISO 26262 etc.), fill `prerequisite_standards`.
5. If related rules exist, fill `related_rules` (`requires` / `complements` / `supersedes` / `conflicts`).
6. If the source has been verified, also fill `content_provenance`.
7. Any new ACTIVE rule must have:
    - `sources[0].official_url` set
    - `sources[0].oj_reference` set (for EUR-Lex sources)
    - `sources[0].last_verified_on` set

Missing any of these and the governance gate auto-downgrades the rule to `SEED_UNVERIFIED`.

### 4.3 Lifecycle states

| State | Applicability cap | UI label |
|---|---|---|
| `PLACEHOLDER` | Always `UNKNOWN` | "Not authored yet" |
| `DRAFT` | `CONDITIONAL` | "Indicative" (UI) |
| `SEED_UNVERIFIED` | `CONDITIONAL` | "Indicative" |
| `SHADOW` | `CONDITIONAL` | "Indicative" (4-week gray release before graduation) |
| `ACTIVE` | Can reach `APPLICABLE` | "Verified" |
| `ARCHIVED` | Always `NOT_APPLICABLE` | "Retired" |

Promotion from `SEED_UNVERIFIED` → `ACTIVE` requires source verification via the Coverage-tab verification queue.

### 4.4 Shadow mode workflow

1. Author new rule with `lifecycle_state: "SHADOW"`.
2. Rule participates in evaluation but is **hidden from the Rules tab's Verified section**. It appears in Indicative (so reviewers see it).
3. After 4 weeks with no drift / complaint, promote to `SEED_UNVERIFIED` or directly to `ACTIVE` (if source fields are filled and verified).

Shadow mode protects stakeholders from untested content reaching the Verified band.

---

## 5. Content quality gates

Three independent gates protect against rule content rot:

### 5.1 Golden dataset (CI-enforced)

`content/golden-dataset.json` contains 21 human-verified anchor rules. Structure:

```json
{
  "anchors": [
    {
      "rule_id": "REG-TA-001",
      "expected": {
        "celex": "32018R0858",
        "oj_reference": "OJ L 151, 14.6.2018, p. 1-218",
        "effective_date": "2020-09-01",
        "...": "..."
      },
      "reviewer": "yanhao",
      "last_verified_on": "2026-04-16"
    }
  ]
}
```

CI workflow `.github/workflows/golden-regression.yml` runs `tests/unit/golden-dataset.test.ts` on every PR. If a seed change makes the registry diverge from the golden anchors, the PR is blocked until a reviewer explicitly approves the drift + updates the golden dataset with a fresh `last_verified_on`.

### 5.2 Drift alert (weekly CI)

`.github/workflows/drift-alert.yml` runs once a week. For each ACTIVE rule with an EUR-Lex source, it re-queries SPARQL and compares key fields (OJ reference, effective date). Any mismatch marks the rule's freshness as `drifted` (the 6th freshness state, distinct from `overdue`). The Coverage tab's Freshness Distribution surfaces the drifted bucket; the Glossary explains the state.

### 5.3 EUR-Lex watcher (Phase 11D legacy, retained)

`.github/workflows/eur-lex-watch.yml` is a lighter per-rule watch that predates the golden dataset. Kept alive as a secondary signal.

---

## 6. Testing

### 6.1 Test layout

```
tests/
├── unit/                  Pure functions (evaluator, freshness, timeline, …)
├── ui/                    React Testing Library (component tests)
└── regression/            Golden-dataset + drift CI checks
```

34 test files, 230 tests. Goal: ≥80% line coverage on `src/engine/`, `src/registry/`, `src/lib/`.

### 6.2 How to add a test

- **Pure function?** → `tests/unit/<subject>.test.ts`. Use vitest's `describe/it/expect`. No JSDOM setup needed.
- **React component?** → `tests/ui/<component>.test.tsx`. Uses `@testing-library/react` + vitest's jsdom environment. Check `vitest.config.ts` for environment hints (some test files opt into jsdom via `// @vitest-environment jsdom` at the top).
- **Regression anchor?** → Add to `content/golden-dataset.json`, not a new test file; the existing suite picks it up.

Run focused tests:

```bash
npx vitest run tests/unit/evaluator.test.ts
npx vitest run --reporter=verbose tests/ui/
```

### 6.3 Playwright (E2E, scaffolded)

`@playwright/test` is installed but no persona journey tests ship yet. This is Phase F scope (see [ux-refactor-spec-v2.md §14](./phase12/ux-refactor-spec-v2.md)). If you add E2E, mirror the structure of the demo scripts under `docs/phase12/demo-scripts/`.

---

## 7. State management (zustand store)

Single store at `src/state/app-shell-store.ts`. Persisted slice under localStorage key `evcn:app-shell`.

### 7.1 Persisted slice

- `config: VehicleConfig` — the current project
- `ruleStatuses: Record<ruleId, "todo" | "in_progress" | "done">`
- `ruleNotes: Record<ruleId, string>`
- `verificationReviewState` — source-verification queue progress
- `promotionLog` — historical promotions to ACTIVE
- `lastActiveTab: TabId` — routes `/` to this on re-entry
- `onboardingDismissed: boolean`

### 7.2 Session slice

- `searchTerm`
- `applicabilityFilter` — `all` | one of `ApplicabilityResult`
- `freshnessFilter` — `all` | one of `FreshnessStatus`

### 7.3 Key actions

- `setConfig` / `patchConfig` — mutate the vehicle program
- `setRuleStatus` / `setRuleNote` — per-rule tracking
- `setLastActiveTab` — called by `LastActiveTabTracker`
- `loadSampleProject` — seeds the pilot fixture
- `clearSavedState` — wipes localStorage (requires confirmation in UI)
- `resetOnboarding` — re-shows the onboarding banner
- `hydrate` — idempotent; called once on mount

Components **select the specific slice** they need; don't read the whole store:

```ts
const config = useAppShellStore((s) => s.config)
const setRuleStatus = useAppShellStore((s) => s.setRuleStatus)
```

---

## 8. Design system

### 8.1 Token tiers

`src/styles/tokens.css` defines three semantic token families:

- **Trust** — `--trust-verified-*`, `--trust-indicative-*`, `--trust-pending-*`
- **Applicability** — `--applies-*`, `--may-apply-*`, `--applies-future-*`, `--does-not-apply-*`, `--unknown-*`
- **Freshness** — `--freshness-fresh-*`, `--freshness-due-soon-*`, `--freshness-overdue-*`, `--freshness-critical-*`, `--freshness-never-*`

Each family has `-fg`, `-bg`, `-border`, sometimes `-accent` variants.

### 8.2 Forced-colors compliance

Every token has a `@media (forced-colors: active)` override that maps to system colors (`CanvasText` / `Canvas` / `GrayText`). This ensures badges remain distinguishable under Windows High Contrast mode and grayscale print.

### 8.3 Badge construction

Every badge combines **icon + text + color**. Never rely on color alone.

- `TrustBadge`: `✓ Verified` / `⚠ Indicative` / `○ Pending`
- `ApplicabilityBadge`: `● Applies` / `◐ May apply` / `◷ Applies from…` / `— Does not apply` / `? Unknown`
- `FreshnessBadge`: `✓ Fresh` / `⏱ Review due soon` / `⚠ Overdue` / `✕ Critical` / `○ Never verified` / (drifted TBD icon)

Under grayscale print, the icon alone communicates the state. Under forced-colors, the text + system-coloured background communicates.

---

## 9. Reusable layer seams

See [ADR-P6](./adr/ADR-P6-reusable-layer-seams.md) for the complete map.

Summary:

- **Layer 1 (~60–70% of code)** — project-invariant. Rule schema, governance, freshness, registry API, declarative interpreter, temporal evaluator, UI primitives, shell chrome, zustand store, tokens. Could be packaged as `@ocn/compliance-core` in the future.
- **Layer 2 (~20%)** — automotive-general. Owner hints, legal families, framework definitions. Reusable across OEM programs but specific to the vehicle domain.
- **Layer 3 (~10–15%)** — pilot-specific. The pilot fixtures, the DE overlay content, the MY2027 BEV expected baseline.

**Important**: ADR-P6 explicitly decides **not to extract** until a second real project materialises. Do not create monorepo packages prematurely.

---

## 10. How to contribute a new rule

### 10.1 Minimal checklist

1. Create a new entry in the appropriate `src/registry/seed/<family>.ts`.
2. Fill all required fields (see §4.2).
3. If adding as `SEED_UNVERIFIED` / `DRAFT`: done after tests pass.
4. If adding as `ACTIVE`:
    - `sources[0].official_url` must be a canonical link
    - `sources[0].oj_reference` for EUR-Lex, non-empty for UNECE
    - `sources[0].last_verified_on` YYYY-MM-DD
    - `content_provenance` complete
    - If the rule joins the golden dataset, add it to `content/golden-dataset.json`

### 10.2 Trigger logic authoring

Two modes:

**Declarative** (preferred):

```ts
trigger_logic: {
  mode: "declarative",
  match_mode: "all",
  conditions: [
    { field: "frameworkGroup", operator: "eq", value: "MN" },
    { field: "batteryPresent", operator: "is_true", value: true },
  ],
  fallback_if_missing: "unknown",
}
```

Supported fields are all `EngineConfig` fields plus dotted paths into `readiness.*`. Operators are listed in `src/shared/constants.ts` (`conditionOperators`).

**Custom** (only when declarative is insufficient):

```ts
trigger_logic: {
  mode: "custom",
  evaluator_id: "my_custom_evaluator",
  description: "Human-readable description of the condition",
}
```

Then register `my_custom_evaluator` in `src/registry/custom-evaluators.ts`. Custom evaluators should be rare; prefer adding a new derived flag to `EngineConfig` (`src/engine/config-builder.ts`) and staying declarative.

### 10.3 Adding a derived flag

If your rule needs a condition not expressible in existing `EngineConfig` fields:

1. Add the new field to `engineConfigSchema` in `src/config/schema.ts`.
2. Compute it in `buildEngineConfig` (`src/engine/config-builder.ts`).
3. Use it in the rule's `trigger_logic`.
4. Update `condition-to-text.ts` with a natural-language rendering.

### 10.4 Propulsion/fuel derived flags (Phase I.1)

The Euro 6/7/OBD/AdBlue/EVAP rule split introduced in Phase I.1 relies on this set of derived flags, all computed inside `buildEngineConfig`:

| Flag | Derivation | Used by |
|---|---|---|
| `fuelType` | `config.fuel?.tankType ?? null` | emissions-family declarative triggers |
| `hasCombustionEngine` | powertrain ∈ {ICE, HEV, PHEV} AND fuelType ∉ {null, none, h2} | REG-EM-013 Euro 7 combustion, R83, R49, EVAP, AdBlue |
| `hasDieselEngine` | `hasCombustionEngine && fuelType === "diesel"` | diesel-specific NOx / AdBlue / aftertreatment rules |
| `hasFuelTank` | fuelType ∉ {null, none} | R67 (LPG), R110 (CNG), R134 (H2), fuel-tank crash rules |
| `hasOBD` | equal to `hasCombustionEngine` | OBD-family rules (REG-EM-OBD-001, R83) |
| `isPlugInHybrid` | `powertrain === "PHEV"` | PHEV-specific documentation rules, WLTP utility factor |

When you author a rule whose trigger depends on combustion/diesel specificity, prefer these flags over branching on raw `powertrain` + `fuel.tankType` strings. See `src/registry/seed/emissions-co2.ts` for examples.

---

## 11. How to add a new member-state overlay

Current coverage: DE (8 ACTIVE + 2 indicative), UK (11 ACTIVE + 2 DRAFT), ES (7 ACTIVE + 7 pending), FR (5 ACTIVE + 7 pending), NL (0 ACTIVE + 5 SEED_UNVERIFIED). Adding a new country (e.g. IT / PL / BE / AT / SE / CZ — currently 5-PLACEHOLDER skeletons per country):

1. Add the country code to `targetCountryOptions.eu` in `src/shared/constants.ts` (if not already).
2. Create rule entries in `src/registry/seed/member-state-overlay.ts`. Template from the DE overlay (8 ACTIVE rules: registration FZV, roadworthiness §29 StVZO HU/AU, insurance PflVG, motor tax KraftStG, Umweltzone low-emission zones, E-Kennzeichen, …).
3. Each country overlay rule needs:
    - `stable_id` pattern: `REG-MS-<CC>-<NNN>` (e.g. `REG-MS-FR-001`)
    - `jurisdiction: "<CC>"`, `jurisdiction_level: "MEMBER_STATE"`
    - `trigger_logic` gating on `targetCountries` inclusion
    - National-language `sources` (e.g. `Source: "Legifrance"` for FR)
4. Update ScopeBanner copy (`src/components/shell/ScopeBanner.tsx`) to reflect the new coverage.
5. Update README `Scope (and what's out)` section.
6. Add at least one rule to `content/golden-dataset.json` for the new country.

---

## 12. Release process

Today, this is a single-branch workflow:

1. Feature branch → open PR.
2. CI must be green: `npm test` + `tsc --noEmit` + `npm run lint` + `golden-regression`.
3. One reviewer (manual) approves.
4. Merge to `main`.
5. Deploy (out of scope — the app is currently run locally).

No semver tags yet. When a stable "v1.0" is cut, use [CHANGELOG.md](./) (to be created) to enumerate the shipped phases.

---

## 13. Known limitations / tech debt

- **localStorage only** — no multi-user, no audit trail. By design (ADR-P1). Will revisit only if a real second OEM tenant appears.
- **Legacy `src/components/phase3/`** — retained as fallback. `Phase3MainPage` is not imported by any `(workspace)` route but sits behind `/legacy` for comparison. Phase G is the planned deletion window.
- **UNECE Annex II coverage** — 43 UNECE technical rules still SEED_UNVERIFIED. Phase K+ scope. ScopeBanner acknowledges this.
- **NL overlay** — 5 SEED_UNVERIFIED, 0 ACTIVE. Phase K+ scope.
- **FR / ES overlay remainder** — 7 rules each pending verification. Rolling workstream.
- **Playwright E2E** — scaffolded, no real tests. Phase F scope.
- **Type-approval extension workflow** — `approvalType` has 4 states; E-mark extension flow is not modelled separately. Would require schema-level work.
- **DE-009 KBA architectural split** — follow-up item from human-review round 1.

---

## 14. Phase K+ roadmap hooks

Not commitments, just natural next moves when priorities shift:

1. **NL overlay promotion** — 5 SEED_UNVERIFIED rules already authored, awaiting EUR-Lex (NL gazette) URL verification.
2. **FR / ES overlay remainder** — 7 rules each at null-URL / DRAFT; verification follows the same Phase-J round cadence.
3. **UNECE Annex II fill** — 43 residual SEED_UNVERIFIED regulations, driven off Annex II of 2018/858.
4. **DE-009 KBA architectural split** — follow-up from human-review round 1.
5. **Playwright E2E** — mirror `docs/phase12/demo-scripts/*.md` as three E2E tests (homologation / team-leader / management).
6. **CHANGELOG.md** — extract "Implemented phases" into a versioned changelog.
7. **`@ocn/compliance-core` package** — only if a second real project materialises (per ADR-P6).

Anything outside this list is probably scope creep. Check [ux-refactor-spec-v2.md §3.6 non-goals](./phase12/ux-refactor-spec-v2.md) before committing.

---

## 15. `manual_review_reason` — the human-visible "why pending" field

Every non-ACTIVE rule (SEED_UNVERIFIED, DRAFT, PLACEHOLDER, SHADOW) carries a `manual_review_reason: string | null` field at the top of its seed entry. Since Phase K.0 (`commit 1556ada`) this string is **rendered inline** in `RuleCardV2` as a "Why indicative only" callout — it is the first thing a user sees on a non-ACTIVE rule card.

### 15.1 Authoring guidelines

- **Be specific**. "Pending verification" is too vague. Prefer "Awaiting EUR-Lex URL verification — CELEX ID pending SPARQL confirmation." or "KBA architectural split pending — see DE-009 follow-up." or "Windsor Framework NI provisions staged for 2026-10."
- **Name the next action**, not just the current state. What would un-block this rule?
- **Keep it under ~200 chars**. It's a single callout line in the card header.
- **Never leave it null on a non-ACTIVE rule**. The UI renders a visible gap and RuleCardV2 drops to a generic fallback.

### 15.2 What it is NOT

- Not legal advice — never put legal interpretation in this field.
- Not a full changelog — that belongs in `promotionLog` or git history.
- Not `content_provenance` — that's the ACTIVE-rule provenance record; `manual_review_reason` is the NON-ACTIVE complement.

### 15.3 Surfacing in the UI

Two places:
- **RuleCardV2** (since K.0): inline "Why indicative only" callout at the top of the card header, visible for all SEED_UNVERIFIED / DRAFT / PLACEHOLDER rule cards.
- **VerificationQueuePanel** (legacy): shows the same field in a per-rule row inside the Coverage tab.

If you add a new non-ACTIVE rule without `manual_review_reason`, both surfaces fall back to a generic "Authored content pending verification" message. Fill it explicitly.

---

## 16. Phase timeline

Concise one-line summary of each phase for new contributors orienting in the git log.

| Phase | Goal | Ship state |
|---|---|---|
| **0** | Scaffolding + canonical baseline docs | Complete (see `docs/phase0/*`) |
| **1** | Next.js + type system + Zod schemas | Complete |
| **2** | Registry + rule engine + 34 seed rules | Complete |
| **3** | Configuration UI (9-section form) | Complete |
| **4** | Results view + trust badges + explainability | Complete |
| **5** | Annotations + comparison + export | Complete |
| **6** | Testing + docs + cleanup | Complete |
| **7-9** | Pilot onboarding + evidence + coverage | Complete (210 tests green) |
| **11** | Pilot-driven work guidance (11A-11E) | Complete |
| **12** | Path B UX refactor (5-tab workspace, exec-oriented) | Complete (Sprint 10 shipped) |
| **I** | Breadth expansion — fuel/ICE/PHEV flags, emissions split | Complete (Phase I.1-I.6) |
| **J** | Production readiness — country overlays + verification backlog | Complete (Phase J.1-J.6) |
| **J human-review rounds 1-3** | 39 promotions to ACTIVE (34 → 73 ACTIVE) | Complete |
| **K.0** | "Why indicative only" inline UX | Complete (`1556ada`) |
| **K.1** | Scope banner + glossary content refresh | Complete (`1bf6e79`) |
| **K.2** | Status + Plan exec summaries | Complete (`3afaf9a`) |
| **K.3** | Doc refresh (README + user-guide + this file) | **Current commit** |
| **K.4+** | Homologation manual · NL ACTIVE batch · DE-009 split | Pending |

---

## Quick reference

| Need to… | File |
|---|---|
| Change a rule's content | `src/registry/seed/<family>.ts` |
| Add a new vehicle-config field | `src/config/schema.ts` + `src/config/defaults.ts` + `src/components/setup/ConfigPanelV2.tsx` |
| Add a new derived flag | `src/config/schema.ts` (engineConfigSchema) + `src/engine/config-builder.ts` |
| Change trigger evaluation | `src/engine/declarative.ts` or `src/registry/custom-evaluators.ts` |
| Add a new lifecycle / freshness state | `src/shared/constants.ts` + `src/registry/freshness.ts` + `src/lib/classify-trust.ts` + all related UI badges |
| Change top nav / tabs | `src/components/shell/TabNav.tsx` + `src/state/app-shell-store.ts` (TabId) |
| Add a new ADR | `docs/adr/ADR-PN-<topic>.md` + update `docs/adr/README.md` index |
| Run just one test | `npx vitest run tests/unit/<file>.test.ts` |
| Regenerate authoring data | `node scripts/generate-authoring-data.mjs` |

---

© Yanhao FU · 2026
