# Phase E · Design tokens + Glossary + Empty states — Execution Notes

**Branch:** `feature/ux-refactor-v2`
**Scope:** Complete the visual system started in Phases A-D: finish wiring semantic tokens, add the Glossary modal, reusable EmptyState, and badge tooltips. Legacy `phase3/*` components are **not** migrated (sunsetted in Phase G).
**Estimated days:** 3

© Yanhao FU

## Task list

| # | Task | Status | Commit |
|---|---|---|---|
| E1 | Create `phase-e-notes.md` (this file) | done | — |
| E2a | Extend `tokens.css` with freshness forced-colors mapping | done | — |
| E2b | Migrate `.trust-badge-*` and `.applicability-*` CSS to `var(--*)` | done | — |
| E3a | Add `.freshness-badge-*` CSS classes driven by tokens | done | — |
| E3b | Rewrite `FreshnessBadge.tsx` to class-based (icon + text + color) | done | — |
| E4 | `src/components/shell/GlossaryModal.tsx` | done | — |
| E5 | Wire "Open glossary" menu item in `GlobalNav.tsx` | done | — |
| E6 | `src/components/shared/EmptyState.tsx` reusable component | done | — |
| E7a | Wire EmptyState into `/rules` when filters match nothing | done | — |
| E7b | Keep `/plan` and `/status` wording but upgrade to EmptyState | done | — |
| E8a | Unit test: GlossaryModal open / close / ESC | done | — |
| E8b | Unit test: FreshnessBadge renders icon + text | done | — |
| E8c | Unit test: EmptyState renders title/description/action | done | — |
| E9 | `vitest run`, `tsc --noEmit`, `npm run lint` all green | done | — |
| E10 | Single Phase E commit | done | — |

## Decisions log

### ADR E-1: CSS-first vs JSX-first token enforcement

- **Status:** Accepted
- **Context:** Spec §11.1 requires "no direct `bg-emerald-100` etc. in JSX (enforced via lint rule in Phase E)". 196 hex colors exist across `globals.css`; migrating all of them blows scope.
- **Decision:** Phase E migrates **JSX + the CSS classes actually referenced by new components**. Remaining legacy hex values in `globals.css` stay until Phase G (they cover `Phase3MainPage.tsx` which is deleted then). The lint rule is deferred to Phase G along with the dead-code sweep.
- **Consequences:**
  - (+) Phase E stays in its 3-day budget
  - (+) forced-colors support kicks in for every badge rendered by new tabs
  - (−) Legacy phase3 renders without forced-colors until Phase G — acceptable because those routes are no longer default

### ADR E-2: Glossary as modal, not dedicated route

- **Status:** Accepted
- **Context:** Spec §3.1 lists "Open glossary" under the ⚙ menu but doesn't specify route vs overlay.
- **Decision:** Implement as an overlay modal triggered from the ⚙ menu. No `/glossary` route.
- **Rationale:** Glossary is reference content, not a workspace. Modal keeps it one click from anywhere, does not pollute URL history, and supports ESC-to-dismiss.

### ADR E-3: FreshnessBadge icons

- **Status:** Accepted
- **Context:** Spec §B5 requires every badge to be icon + text + color.
- **Decision:** Use Unicode glyphs (not emoji) so fonts render consistently in tests (JSDOM) and print mode:
  - `fresh` → `✓`
  - `due_soon` → `⏱`
  - `overdue` → `⚠`
  - `critically_overdue` → `✕`
  - `never_verified` → `○`

## Pre-flight checks

- [x] Phases A-D merged on `feature/ux-refactor-v2`
- [x] Baseline: 163 tests green, tsc clean, lint clean
- [x] `src/styles/tokens.css` scaffold exists with trust/applicability/status/freshness tokens
- [x] `src/components/shared/TrustBadge.tsx` and `ApplicabilityBadge.tsx` already use class-based token lookups

## Exit criteria

- [ ] FreshnessBadge no longer uses raw Tailwind color utilities
- [ ] `.trust-badge-*`, `.applicability-*`, `.freshness-badge-*` all driven by CSS variables
- [ ] Glossary opens via `⚙ → Open glossary`, closes on ESC / outside click / close button
- [ ] Every tab shows a useful empty state rather than blank panel
- [ ] Every badge has a `title=` tooltip with human-readable explanation
- [ ] All existing tests green + ≥3 new tests pass
- [ ] `tsc --noEmit` 0 errors, `npm run lint` 0 errors

## Links

- Spec: [`./ux-refactor-spec-v2.md`](./ux-refactor-spec-v2.md) (§9, §11)
- Previous phase: [`./phase-a-notes.md`](./phase-a-notes.md)
