# UX Refactor v2 — Specification

**Version:** v2.0 (approved 2026-04-17)
**Status:** Active — Phase 12 implementation in progress
**Branch:** `feature/ux-refactor-v2`
**Baseline commit:** pre-refactor `main` (128 files, 99 tests green, tsc clean)

© Yanhao FU

---

## 0. Objective

Transform `eu-compliance-navigator` from a "rules-engine debugger" into an "OEM project-team workbench" serving four personas:

1. Homologation / Regulatory lead
2. Project / program manager
3. Domain owner (cybersecurity / privacy / AI / battery / ADAS)
4. Management / decision-maker

**Non-negotiable outcomes** (cannot merge without these):

1. Users reach any tab directly by URL (`/setup`, `/status`, `/plan`, `/rules`, `/coverage`) without a global loading shell.
2. First-time visit lands on Setup with onboarding banner; returning visit lands on `lastActiveTab`.
3. All badges remain distinguishable under grayscale print and `forced-colors: active`.
4. `Phase3MainPage` is deleted (or becomes a compat shim) by end of Phase G.
5. Existing 99 unit tests + 10 UI tests stay green; new persistence / routing tests ≥ 8 added.

## 1. Scope

UI-only refactor **plus net-new UI** for six schema fields currently defined as optional but never rendered (`braking`, `steering`, `cabin`, `lighting`, `fuel`, `hmi`).

- ❌ Do not modify `src/engine/*`, `src/registry/*`, `fixtures/*`, `scripts/*`, or rule data.
- ✅ Modify: `src/app/*`, `src/components/*`, `src/config/*` (defaults + persistence + sharing only), add `src/state/*`, add `src/styles/*`.

## 2. Locked decisions (13)

| # | Decision | Choice |
|---|---|---|
| Q1 | Tab naming | **Status** (avoid "Decision" endorsement risk) |
| Q2 | Compare mode home | **Internal toggle in Rules tab and Status tab** |
| Q3 | Report mode home | **Per-tab `Export as PDF` button** |
| Q4 | Timeline grouping | **SOP-anchored semantic segments** |
| Q5 | Project management | **Read-only chip only; multi-project deferred** |
| Q6 | RuleCard Engineering view | **Right-upper Plain ↔ Engineering toggle** |
| Q7 | Advanced cross-tab navigation | **In-scope this phase** (RuleCard → Setup field highlight) |
| B1 | `Digital & Cockpit` merge | **Yes** (merges connectivity + data + AI + HMI) |
| B2 | Advanced demotion | **Partial**: `braking.type` stays in Propulsion; `lighting.headlampType` stays in ADAS; the rest demoted |
| B3 | First-screen logic | **`lastActiveTab` persistence** |
| B4 | Budget | **7 weeks** |
| B5 | Badge construction | **icon + text + color (all three required)** |
| B6 | Advanced net-new UI | **In-scope this phase** |

## 3. Information architecture

### 3.1 Global nav (sticky)

```
┌─────────────────────────────────────────────────────────────────┐
│ EU Compliance Navigator    [Project: MY2027 BEV]           [⚙]  │
├─────────────────────────────────────────────────────────────────┤
│  Setup │ Status │ Plan │ Rules │ Coverage                        │
│         ●                                                        │
└─────────────────────────────────────────────────────────────────┘
```

- Left: product name
- Middle: read-only project chip showing `config.projectName`
- Right: `⚙` menu with `Load sample…` / `Clear saved state` / `Open glossary`
- Below: 5 tab buttons, active indicated by dot

### 3.2 Persona → Tab mapping

| Persona | Primary tab | Secondary |
|---|---|---|
| Management | Status | — |
| PM / program manager | Plan | Status, Setup |
| Domain owner | Plan (Owner Dashboard) | Rules |
| Homologation lead | Rules | Setup (Advanced), Coverage |
| Compliance author (Phase 13+) | Coverage | Rules |

### 3.3 First-screen behavior

| Condition | Landing |
|---|---|
| No localStorage | `/setup` + OnboardingBanner |
| Has `lastActiveTab` in localStorage | That tab |
| User clicks `Clear saved state` | `/setup` + banner re-shows |

## 4. Configuration panel grouping (Setup tab)

### 4.1 Primary sections (default expanded)

```
1. Program & Market          "Who, where, and when"
2. Homologation Basis        "How the vehicle gets type-approved"
3. Propulsion & Energy       "Powertrain architecture" (+ braking.type for EV)
4. ADAS & Automated Driving  "Driver assistance and autonomy level" (+ lighting.headlampType)
5. Digital & Cockpit         "Software, connectivity, data, AI, and HMI"  ★ merged
6. Readiness                 "What you've already prepared"
```

### 4.2 Advanced vehicle systems (default collapsed)

```
   Braking            ABS / ESP (braking.type lives in Propulsion)
   Steering           type / EPS
   Lighting           AVAS, non-Matrix details (headlampType lives in ADAS)
   Cabin              airbag count / ISOFIX / seatbelt reminder
   Fuel               tank type
```

### 4.3 Setup progress

Top of Setup tab:

```
Setup progress: ████████░░ 6 of 7 sections complete
```

Section is "complete" when all **required** fields (per §4.4) are non-empty. Advanced is never required.

### 4.4 Required vs optional fields per section

| Section | Required fields |
|---|---|
| Program & Market | `projectName`, `frameworkGroup` (implicitly in Homologation), `targetCountries` (≥1), `sopDate` |
| Homologation Basis | `frameworkGroup`, `vehicleCategory`, `approvalType` |
| Propulsion & Energy | `powertrain` |
| ADAS & Automated Driving | `automationLevel` |
| Digital & Cockpit | none (all optional; completion = opted in) |
| Readiness | none |

## 5. Tab 1 · Status (was "Decision")

### 5.1 Hero

```
┌─────────────────────────────────────────────┐
│   Market entry status:  LIKELY OK           │
│   Confidence: high                          │
│                                             │
│   Coverage 72/100  Verified 11  Indicative 8│
│                    Pending 55               │
│   Generated 2026-04-17 15:30 UTC            │
└─────────────────────────────────────────────┘
```

Wording is **descriptive**, not prescriptive. `canEnterMarket=yes` maps to `LIKELY OK`, not `YES`.

### 5.2 Three-column body

```
Top Blockers (≤5)  │  Top Deadlines (≤10)  │  Countries at Risk
```

Each column has actionable links (jump to Rules tab with filter pre-applied).

### 5.3 Export & Compare

- Top-right `[⬇ Export as PDF]` button
- Top-right `[Compare with…]` button (renders a second config on the right; scoped to tab)

## 6. Tab 2 · Plan

Two-column on wide viewport:

```
┌─ Timeline (SOP-anchored) ──┬─ Owner Dashboard ─────────────┐
│ Immediate (0-3mo)          │ Homologation (8 tasks)         │
│ Pre-SOP critical           │ Cybersecurity (3 tasks)        │
│ Pre-SOP final              │ Privacy (2 tasks)              │
│ Post-SOP                   │ Sustainability (1 task)        │
│ Later                      │                                │
│ Unscheduled                │                                │
└────────────────────────────┴────────────────────────────────┘
```

- Empty owner sections hidden
- Clicking a rule navigates to `/rules?rule={id}` with auto-expand

### 6.1 Timeline SOP-anchored segments

| Segment | Anchor | Default |
|---|---|---|
| Immediate | today → today + 3 months | expanded |
| Pre-SOP critical | SOP − 12 mo → SOP − 3 mo | expanded |
| Pre-SOP final | SOP − 3 mo → SOP | expanded |
| Post-SOP | SOP → SOP + 12 mo | collapsed |
| Later | > SOP + 12 mo | collapsed |
| Unscheduled | no date | collapsed (count badge) |

**Fallback**: if SOP null → use `firstRegistrationDate`; if both null → calendar-month segments.

## 7. Tab 3 · Rules

### 7.1 Tri-layer sections

```
✓ VERIFIED (11)                  "You can rely on these"
⚠ INDICATIVE (8)                 "Review before trusting"
○ PENDING AUTHORING (55)         "Not yet written up"    [default collapsed]
— NEEDS YOUR INPUT (3)           "Missing project fields" [if any]
```

Mapping:
- `lifecycle=ACTIVE` + `applicability≠UNKNOWN` → **Verified**
- `lifecycle∈{SEED_UNVERIFIED,DRAFT}` + `applicability≠UNKNOWN` → **Indicative**
- `lifecycle=PLACEHOLDER` → **Pending authoring**
- `applicability=UNKNOWN` and `missing_inputs.length>0` → **Needs your input** (separate)

### 7.2 RuleCardV2 layout

```
┌─ REG-TA-001 · WVTA ─────────────────────────[Plain|Engineering]─┐
│ [✓ Verified] [Applies] [Homologation] [Fresh]                   │
├─ Summary ────────────────────────────────────────────────────────┤
│ Vehicle type-approval per Reg. 2018/858. Required before SOP.   │
├─ Why it applies ────────────────────────────────────────────────┤
│ ✓ Framework group is MN                                         │
│ ✓ Approval type is new_type                                     │
│ ✓ SOP date is in the future                                     │
├─ What to do ────────────────────────────────────────────────────┤
│ Required documents (5): …                                       │
│ Required evidence (3): …                                        │
│ Submission timing: Before SOP                                   │
├─ Reference ─────────────────────────────────────────────────────┤
│ Reg. (EU) 2018/858 · OJ L 151, 14.6.2018                        │
│ Last verified 2026-04-16 · Next review 2026-10-13               │
│ [Open on EUR-Lex ↗]                                             │
├─ My tracking ───────────────────────────────────────────────────┤
│ Status: [todo ▾]    Note: [______________]                       │
└──────────────────────────────────────────────────────────────────┘
```

**Plain view** (default): hides `matched_conditions` raw JSON, `trigger_path`, `unmatched_conditions`, `manual_review_reason`.
**Engineering view**: adds a code-looking panel with those raw fields.

### 7.3 Natural-language translator

`src/lib/condition-to-text.ts` converts `TriggerCondition` → human sentence.

| Operator | Template |
|---|---|
| `eq` | `{field} is {value}` |
| `neq` | `{field} is not {value}` |
| `in` | `{field} is one of {value}` |
| `not_in` | `{field} is not one of {value}` |
| `includes` | `{field} includes {value}` |
| `includes_any` | `{field} includes any of {value}` |
| `gt / gte / lt / lte` | `{field} is greater / less than {value}` |
| `is_true / is_false` | `{field} is true / false` |
| `is_null / is_not_null` | `{field} is not set / is set` |

Custom evaluators fall back to `Custom logic: {description}`.

## 8. Tab 4 · Coverage

Keeps the existing CoveragePanel mostly as-is. The Verification Queue is split out into a sub-section (not a separate page).

```
- Lifecycle distribution (chart)
- Freshness distribution (chart)
- Domain × Process coverage matrix
- Member-state chips (grid)
- Verification queue (sub-section)
- Promotion log (sub-section)
```

## 9. Status vocabulary translation

### 9.1 Lifecycle × source → three user-facing trust states

| Engine | UI state | Badge |
|---|---|---|
| `ACTIVE` + source verified | **Verified** | `✓ Verified` (emerald) |
| `SEED_UNVERIFIED` / `DRAFT` | **Indicative** | `⚠ Indicative` (amber) |
| `PLACEHOLDER` | **Pending authoring** | `○ Pending` (slate) |

### 9.2 Applicability → user wording

| Engine | UI |
|---|---|
| `APPLICABLE` | Applies |
| `CONDITIONAL` | May apply |
| `FUTURE` | Applies from {date} |
| `NOT_APPLICABLE` | Does not apply |
| `UNKNOWN` + lifecycle=PLACEHOLDER | Not authored yet |
| `UNKNOWN` + downgrade | Source not verified |
| `UNKNOWN` + missing inputs | Missing project input |

### 9.3 Member-state chip states

| State | Wording | Dot |
|---|---|---|
| Operational (DE) | "Operational guidance available" | green |
| Placeholder (FR/NL) | "National overlay not yet authored (Phase 12)" | slate |
| Non-EU (UK) | "Non-EU market — post-Brexit rules apply" | blue |
| Basic (IT/ES/PL/BE/AT/SE/CZ) | "Basic overlay only — verify locally" | amber |

## 10. Trust × Freshness combination

| Trust | Freshness | Rendered |
|---|---|---|
| Verified | Fresh | `✓ Verified` |
| Verified | Due soon | `✓ Verified · Review in {N}d` |
| Verified | Overdue | `✓ Verified · Overdue {N}d` (amber accent) |
| Verified | **Critical** | `⚠ Verified (critically stale)` — **downgrade color to amber** |
| Verified | Never | engine-guard should prevent this state |
| Indicative | * | `⚠ Indicative` (freshness suppressed) |
| Pending | * | `○ Pending` (freshness suppressed) |

## 11. Visual system

### 11.1 Semantic tokens (`src/styles/tokens.css`)

```css
:root {
  /* Trust */
  --trust-verified:       var(--emerald-600);
  --trust-indicative:     var(--amber-600);
  --trust-pending:        var(--slate-400);

  /* Status */
  --status-blocker:       var(--red-600);
  --status-attention:     var(--amber-600);
  --status-ok:            var(--emerald-600);
  --status-info:          var(--slate-600);

  /* Freshness */
  --fresh-ok:             var(--emerald-500);
  --fresh-soon:           var(--amber-500);
  --fresh-overdue:        var(--orange-500);
  --fresh-critical:       var(--red-500);
  --fresh-never:          var(--slate-500);

  /* Applicability */
  --applies:              var(--emerald-600);
  --may-apply:            var(--amber-600);
  --does-not-apply:       var(--slate-500);
  --applies-future:       var(--blue-500);
  --unknown:              var(--slate-400);
}
```

All components reference semantic tokens; no direct `bg-emerald-100` etc. in JSX (enforced via lint rule in Phase E).

### 11.2 Badge construction (hard requirement)

Every badge is **icon + text + color**. Under `forced-colors: active` or grayscale print:
- Icon remains (shape-based semantics)
- Text remains
- Color degrades gracefully

**Contrast**: all badge text/bg pairs ≥ 4.5:1 (WCAG AA).

## 12. State management

Single zustand store at `src/state/app-shell-store.ts`:

```typescript
interface AppShellState {
  // Persisted
  config: VehicleConfig;
  ruleStatuses: Record<string, UserRuleStatus>;
  ruleNotes: Record<string, string>;
  verificationReviewState: VerificationReviewState;
  promotionLog: PromotionLog;
  lastActiveTab: TabId;
  onboardingDismissed: boolean;

  // Session (filters)
  searchTerm: string;
  applicabilityFilter: ApplicabilityFilter;
  freshnessFilter: FreshnessFilter;

  // Actions
  setConfig: (config: VehicleConfig) => void;
  patchConfig: (patch: Partial<VehicleConfig>) => void;
  setRuleStatus: (ruleId: string, status: UserRuleStatus) => void;
  setRuleNote: (ruleId: string, note: string) => void;
  setLastActiveTab: (tab: TabId) => void;
  dismissOnboarding: () => void;
  loadSampleProject: () => void;
  clearSavedState: () => void;
  // … more
}

type TabId = "setup" | "status" | "plan" | "rules" | "coverage";
```

Persisted under localStorage key `evcn:app-shell` via `zustand/middleware`.
Per-tab local state (Compare) lives inside each tab's component; not in the global store.

## 13. Routing

Next.js App Router, 5 subroutes:

```
src/app/
├── layout.tsx               (AppShell wrapper)
├── page.tsx                 (root — redirects to lastActiveTab)
├── setup/page.tsx
├── status/page.tsx
├── plan/page.tsx
├── rules/page.tsx
└── coverage/page.tsx
```

All tab pages marked `"use client"` (consistent with current Phase3MainPage).

## 14. Implementation phases (7 weeks)

| Phase | Scope | Days |
|---|---|---|
| A | Shell + routing + state hoist | 5 |
| B | ConfigPanel regroup + Advanced net-new UI | 10 |
| C | RuleCardV2 + NL translator + tri-layer | 10 |
| D | Timeline SOP-anchored + Owner cleanup | 3 |
| E | Design tokens + glossary + empty states | 3 |
| F | E2E Playwright persona journeys | 2 |
| G | Compare/Report restructure + delete old | 5 |

Total ~38 days ≈ 7 weeks. (See `docs/phase12/phase-{A..G}-notes.md` for per-phase task breakdown and commits.)

## 15. Skills and subagents per phase

| Phase | Must-use skills | Subagents |
|---|---|---|
| A | `frontend-patterns`, `coding-standards`, `architecture-decision-records` | `architect`, `typescript-reviewer` |
| B | `frontend-patterns`, `design-system`, `tdd-workflow`, `coding-standards` | `typescript-reviewer`, `code-reviewer` |
| C | `tdd-workflow`, `frontend-patterns`, `coding-standards`, `verification-loop` | `typescript-reviewer`, `code-reviewer` |
| D | `tdd-workflow`, `coding-standards` | `code-reviewer` |
| E | `design-system`, `frontend-patterns`, `browser-qa` | `typescript-reviewer` |
| F | `e2e-testing`, `browser-qa`, `ai-regression-testing` | `e2e-runner` |
| G | `frontend-patterns`, `coding-standards` | `refactor-cleaner`, `code-reviewer` |
| cross | `search-first`, `verification-loop`, `continuous-learning` | `doc-updater` |

## 16. Acceptance gates per phase

Before merging any phase commit:
- `npm test` green
- `npx tsc --noEmit` 0 errors
- `npm run lint` 0 errors
- Phase-specific tests added (≥70% coverage on new code)
- `docs/phase12/phase-{letter}-notes.md` updated with what was done

## 17. Rollback strategy

- `main` stays at pre-refactor baseline until Phase G merges.
- Each phase lands as 1-3 commits on `feature/ux-refactor-v2`.
- If phase introduces regression: `git revert` its commits (still on feature branch).
- If whole refactor must be abandoned: `main` is untouched; discard feature branch.
- `Phase3MainPage.tsx` is kept as fallback renderer until Phase G; can be re-enabled by toggling root `src/app/page.tsx`.

## 18. Out of scope (deferred)

- Multi-project management (Q5)
- Wizard multi-step setup
- Dark mode
- i18n
- Mobile-first optimization (ensure no break, not optimized)
- PDF multi-page templates (browser print used)
- Compliance-author UI (Phase 13+)

## 19. Acceptance journeys (tested in Phase F)

| # | Persona | Flow |
|---|---|---|
| 1 | Management | `/` → onboarding → Load sample → lands on `/status` → sees `LIKELY OK` + blockers ≤10s |
| 2 | PM | `/setup` fills Program + Homologation + Propulsion → `/plan` sees segmented timeline + owners |
| 3 | Domain owner | `/plan` → Owner Dashboard → Cybersecurity → click R155 → `/rules?rule=REG-CS-001` auto-expanded |
| 4 | Homologation | `/setup` Advanced → fills braking/steering → `/rules` Verified → expand REG-UN-100 → Engineering toggle → sees raw conditions |
| 5 | First-timer | `/` → onboarding → Start blank → `/setup` empty → fills → reload → `lastActiveTab` |
| 6 | A11y | forced-colors active → every badge still distinguishable |
| 7 | Compare | `/rules` click `Compare with…` → 2-col → switch to `/plan` → compare auto-exits |

---

## Changelog

- 2026-04-17 v2.0 approved after design-first review (decisions Q1-Q7, B1-B6 locked).

© Yanhao FU
