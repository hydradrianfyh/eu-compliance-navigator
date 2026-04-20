# EU Compliance Navigator

A config-driven compliance workbench for EU vehicle programs.

**Status**: Phase 12 Path B shipped · 210 tests green · MY2027 BEV × DE demo live.

> ⚠ **This tool is a navigation aid, not legal advice.** Always validate with your homologation partner and legal counsel before making market-entry decisions. See [Disclaimer](#disclaimer).

---

## What you want to do

| You are… | Start here |
|---|---|
| 👤 **Business user** — homologation engineer, domain team leader, program manager, VP | User Guide: **[中文版](docs/USER-GUIDE.md)** (deeper per-field reference) · **[English](docs/USER-GUIDE-EN.md)** (lightweight translation) |
| 🛠 **Developer** — contributor, integrator, extender | → **[docs/DEVELOPER.md](docs/DEVELOPER.md)** |
| 🎬 **Just want to see it run** | `npm install && npm run dev` → [http://localhost:3000](http://localhost:3000) → Click ⚙ → **Load MY2027 BEV sample** |

### Language / 语言

- **中文 (Chinese)** — [docs/USER-GUIDE.md](docs/USER-GUIDE.md) · primary, deepest per-field reference
- **English** — [docs/USER-GUIDE-EN.md](docs/USER-GUIDE-EN.md) · structure-identical translation, condensed field depth
- **Developer guide** — [docs/DEVELOPER.md](docs/DEVELOPER.md) · English only

---

## 30-second tour

1. **Setup** — enter a vehicle program (framework group, category, powertrain, automation level, markets, SOP date, ...)
2. **Status** — see the top-line verdict (`LIKELY OK` / `OK WITH CAVEATS` / `AT RISK` / `INDETERMINATE`) with 4 coverage metrics, top blockers, top deadlines, countries at risk.
3. **Plan** — SOP-anchored timeline (Immediate / Pre-SOP critical / Pre-SOP final / Post-SOP / Later / Unscheduled) + Owner Dashboard grouped by responsible team.
4. **Rules** — tri-layer view: Verified / Indicative / Pending authoring / Needs your input. Each rule card has Summary, Why-it-applies, What-to-do, Reference, and your project tracking.
5. **Coverage** — governance view: lifecycle distribution, freshness distribution, domain × process coverage matrix, member-state chips, verification queue, promotion log.

See [docs/phase12/demo-scripts/](docs/phase12/demo-scripts/) for three real 3-to-5-minute walkthroughs (homologation lead · team leader · management).

---

## Architecture snapshot

```
┌──────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                      │
│  React/Next.js 5-tab workspace. Consumes EvaluationResult│
│  only; never computes applicability or lifecycle.        │
├──────────────────────────────────────────────────────────┤
│  EVALUATION LAYER                                        │
│  evaluateRule(): governance → trigger → temporal →       │
│  applicability. Pure functions. No side effects.         │
├──────────────────────────────────────────────────────────┤
│  REGISTRY LAYER                                          │
│  142 typed rules · 17 legal families · 6 lifecycle states│
│  Zod-validated schema. Content provenance tracked.       │
├──────────────────────────────────────────────────────────┤
│  CONFIGURATION LAYER                                     │
│  VehicleConfig → EngineConfig with derived flags.        │
│  zustand store · localStorage persistence · URL sharing. │
└──────────────────────────────────────────────────────────┘
```

**Key invariant**: UI components only render `EvaluationResult`. They never call rule logic directly. See [ADR-P6 · Reusable layer seams](docs/adr/ADR-P6-reusable-layer-seams.md) for the extraction-ready architecture map.

**Stats**:
- **142** rules · **17** legal families
- **6** lifecycle states: `PLACEHOLDER` / `DRAFT` / `SEED_UNVERIFIED` / `SHADOW` / `ACTIVE` / `ARCHIVED`
- **6** freshness states: `fresh` / `due_soon` / `overdue` / `critically_overdue` / `never_verified` / `drifted`
- **21** golden-dataset anchors (CI-enforced against EUR-Lex SPARQL weekly)
- **DE** member-state overlay: 5 ACTIVE rules
- **FR / NL** overlay: pending Phase 13+
- **13** non-goals explicitly honoured (see [spec §3.6](docs/phase12/ux-refactor-spec-v2.md))

---

## Scope (and what's out)

**In scope** — this tool evaluates:

- EU horizontal regulations (WVTA 2018/858, GSR2, R155/R156/R157, GDPR, Data Act, AI Act, Battery, Euro 7, PLD)
- Germany (DE) member-state overlay: registration (FZV) · roadworthiness (§29 StVZO HU/AU) · insurance (PflVG) · motor tax (KraftStG) · low-emission zones (Umweltzonen)

**Pending** (Phase 13+):

- France (FR) and Netherlands (NL) overlays — structure in place, content not authored.

**Out of scope** (explicit non-goals — see [ADRs](docs/adr/)):

- UNECE Annex II technical regulations beyond the pilot-triggered set (32 rules still placeholder)
- Other EU member states (IT/ES/PL/BE/AT/SE/CZ/…)
- Non-EU markets (CN/US/JP/UK/TR/…)
- Customs / CBAM / HS classification / Rules-of-Origin / FTA rules
- ISO standards prerequisites (26262 / 21448 / 21434 / 8800)
- Multi-tenant SaaS, SSO / RBAC, PLM / ERP / QMS integration, supplier portal, legal sign-off workflow, backend server, RegPulse-Agent feeder pipeline

---

## Tech stack

- **Runtime**: Next.js 16 (App Router) · React 19 · TypeScript 6
- **State**: zustand (with persist middleware) + localStorage
- **Styling**: Tailwind CSS 4 + semantic design tokens (`src/styles/tokens.css`)
- **Testing**: vitest (unit + UI) · Playwright (E2E, scaffolded)
- **CI**: GitHub Actions — `golden-regression`, `drift-alert`, `eur-lex-watch`

Zero runtime LLM calls. All evaluation logic is deterministic.

---

## Running the project

```bash
# Install
npm install

# Local dev server (hot-reload)
npm run dev          # http://localhost:3000

# Quality gates
npm test             # vitest — 210 tests
npx tsc --noEmit     # type-check only
npm run lint         # eslint

# Production build
npm run build
npm start
```

First time? Open the app, click the **⚙ gear icon** in the top-right, then **"Load MY2027 BEV sample"**. You'll land on a pre-populated Setup with 22 ACTIVE pilot-triggered rules ready to explore.

---

## Quick links

| Link | Purpose |
|---|---|
| [docs/USER-GUIDE.md](docs/USER-GUIDE.md) | Full user guide (Chinese) — task-oriented, per-field reference |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | Developer guide (English) — architecture, conventions, contribution |
| [docs/phase12/ux-refactor-spec-v2.md](docs/phase12/ux-refactor-spec-v2.md) | Product spec (source of truth, read before major changes) |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| [docs/phase12/sprint-10-go-no-go.md](docs/phase12/sprint-10-go-no-go.md) | Latest ship report + pilot metrics |
| [docs/phase12/demo-scripts/](docs/phase12/demo-scripts/) | Three 3-to-5-minute stakeholder walkthroughs |
| [content/authoring.csv](content/authoring.csv) | Non-developer rule-authoring DSL |
| [fixtures/pilot-my2027-bev.ts](fixtures/pilot-my2027-bev.ts) | Canonical pilot configuration |

---

## Repository layout (abridged)

```
eu-compliance-navigator/
├── src/
│   ├── app/                    Next.js App Router (5-tab workspace + legacy)
│   ├── components/             React components
│   │   ├── shell/              GlobalNav · TabNav · ScopeBanner · GlossaryModal · …
│   │   ├── setup/              ConfigPanelV2 · SetupProgress · OnboardingBanner
│   │   ├── rules/              RuleCardV2
│   │   ├── shared/             TrustBadge · ApplicabilityBadge · EmptyState
│   │   └── phase3/             Legacy (retained as fallback until Phase G)
│   ├── engine/                 Pure evaluation functions (evaluator, temporal, …)
│   ├── registry/               Rule schema, governance, freshness, verification
│   ├── state/                  app-shell-store (zustand)
│   ├── config/                 VehicleConfig schema + persistence
│   ├── lib/                    Pure utilities (condition-to-text, classify-trust, …)
│   └── styles/                 Semantic tokens + globals
├── tests/                      210 tests (unit + UI + regression)
├── fixtures/                   Pilot configurations
├── content/                    Authoring DSL + golden dataset
├── scripts/                    EUR-Lex watcher · content generator
├── docs/                       Specs · ADRs · user guide · developer guide
└── .github/workflows/          golden-regression · drift-alert · eur-lex-watch
```

See [docs/DEVELOPER.md §3](docs/DEVELOPER.md) for the annotated tree.

---

## Disclaimer

This tool is a **navigation aid, not legal advice**. Rule content is authored from official sources (EUR-Lex / UNECE / national gazettes) with human review, but:

- **No rule guarantees market approval.** Applicable regulations change; the tool's drift-alert CI detects source changes but does not replace human re-verification.
- **No automated rule content is generated by LLM at runtime.** All evaluation is deterministic; every ACTIVE rule has a `content_provenance` record naming its reviewer and retrieval date.
- **FR and NL overlays are placeholders** — the tool displays this explicitly in the ScopeBanner; do not assume coverage.
- **Always validate with your homologation partner** (TÜV / DEKRA / UTAC / RDW / KBA / VCA / …) and legal counsel before making market-entry decisions.

---

## License / Attribution

© Yanhao FU · 2026
