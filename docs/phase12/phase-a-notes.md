# Phase A · Shell & Routing — Execution Notes

**Branch:** `feature/ux-refactor-v2`
**Scope:** Non-functional 5-tab skeleton. Each tab renders a placeholder. Old `Phase3MainPage` retained as fallback.
**Estimated days:** 5

© Yanhao FU

## Task list

| # | Task | Status | Commit |
|---|---|---|---|
| A1a | Install zustand | pending | — |
| A1b | Create `src/state/app-shell-store.ts` skeleton | pending | — |
| A2 | Migrate `Phase3MainPage` state into store (store wraps useState) | pending | — |
| A3 | `src/components/shell/AppShell.tsx` container | pending | — |
| A4 | `src/components/shell/GlobalNav.tsx` + project chip | pending | — |
| A5 | `src/components/shell/TabNav.tsx` — 5 tab buttons | pending | — |
| A6 | Next.js App Router routes: `/setup`, `/status`, `/plan`, `/rules`, `/coverage` | pending | — |
| A7 | `lastActiveTab` persistence helper | pending | — |
| A8 | `src/components/shell/StatusBar.tsx` footer | pending | — |
| A9 | Placeholder pages for 5 tabs | pending | — |
| A10 | Unit tests: store hydrate / persist / lastActiveTab round-trip | pending | — |
| A11 | Root `/` redirects to `lastActiveTab` or `/setup` | pending | — |

## Decisions log (for architecture-decision-records)

### ADR A-1: Zustand over Context

- **Status:** Accepted
- **Date:** 2026-04-17
- **Context:** 5 tabs × 4 personas × many panels read/write the same VehicleConfig and filter state. React Context causes whole-tree re-render on state change.
- **Decision:** Use zustand with `persist` middleware (localStorage key `evcn:app-shell`).
- **Consequences:**
  - (+) Selector-based subscriptions; components only re-render when their slice changes
  - (+) Built-in persist middleware replaces hand-rolled persistence layer (but we keep legacy `src/config/persistence.ts` for migration back-compat)
  - (−) New runtime dependency
  - (−) SSR hydration boundary must be handled; all tab pages stay `"use client"`

### ADR A-2: 5 subroutes, each a client component

- **Status:** Accepted
- **Context:** Each tab has its own state slice, interactive filters, and needs URL-shareable position.
- **Decision:** Each tab is a separate `page.tsx` under `src/app/{tab}/`. All marked `"use client"`.
- **Alternative considered:** Single-page with hash routing (`/#setup`). Rejected because it loses SSG benefits and URL share quality.

### ADR A-3: Keep `Phase3MainPage` as fallback until Phase G

- **Status:** Accepted
- **Context:** 7-week refactor needs safety net.
- **Decision:** Old `Phase3MainPage` stays in repo, not imported by default. `src/app/page.tsx` redirect can be toggled back to render `<Phase3MainPage />` as a rollback.
- **Sunset:** Delete in Phase G after all persona E2E journeys green.

## Pre-flight checks

- [x] Git initialized, baseline committed on `main` (`7f0e…` — replace with actual sha)
- [x] Branch `feature/ux-refactor-v2` created
- [x] `docs/phase12/ux-refactor-spec-v2.md` authored
- [x] Baseline tests green: 99 pass / 20 files / tsc clean

## Exit criteria (must all pass before A → B)

- [ ] 5 routes accessible: `/setup` `/status` `/plan` `/rules` `/coverage`
- [ ] All existing 99 tests still green
- [ ] New store tests: at least 3 (hydrate / persist / lastActiveTab round-trip)
- [ ] `tsc --noEmit` 0 errors
- [ ] `npm run lint` 0 errors
- [ ] No imports from old `Phase3MainPage` inside new tabs (grep verifies)
- [ ] Root `/` redirects correctly for both first-time and returning users

## Links

- Spec: [`./ux-refactor-spec-v2.md`](./ux-refactor-spec-v2.md)
- ADRs: inline above
