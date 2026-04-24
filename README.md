# EU Compliance Navigator

A config-driven compliance workbench for EU vehicle programs.

**Status**: Phase L.1–L.6 shipped · Phase M.0–M.4 + Part C shipped (2026-04-24) · K.1 / K.2 UX refresh live · 211 rules / **137 runtime-ACTIVE** (raw = runtime, no governance downgrades) · MY2027 BEV × DE·FR·NL (**81 APPLICABLE**) / MY2028 PHEV × DE·FR·NL (89 APPLICABLE) / MY2027 ICE × ES (70 APPLICABLE) pilots live · pilotCompleteness KPI green at 81% / 81% / 90% · coverage audit + Phase M plan at [docs/audits/](docs/audits/) and [docs/phase-m/](docs/phase-m/) · verification backlog tracked at [docs/phase-j/verification-backlog.md](docs/phase-j/verification-backlog.md).

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

1. **Setup** — enter a vehicle program (framework group, category, powertrain, fuel type, automation level, markets, SOP date, ...)
2. **Status** — **new in K.2**: management-friendly 3-second exec summary at the top (verdict + three numbers + top urgent action + progressive-disclosure link), followed by the full StatusHero (verdict + 4 coverage metrics), top blockers, top deadlines, countries at risk.
3. **Plan** — **new in K.2**: exec summary block (SOP + countdown + counts + top 3 upcoming deadlines) above the SOP-anchored timeline (Immediate / Pre-SOP critical / Pre-SOP final / Post-SOP / Later / Unscheduled) + Owner Dashboard grouped by responsible team.
4. **Rules** — tri-layer view: Verified / Indicative / Pending authoring / Needs your input. Each rule card has Summary, Why-it-applies, What-to-do, Reference, and your project tracking. **New in K.0**: non-ACTIVE rule cards surface an inline "Why indicative only" callout sourced from `manual_review_reason`.
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
│  211 rules / 137 ACTIVE · 17 legal families · 6 lifecycle│
│  Zod-validated schema. Content provenance tracked.       │
├──────────────────────────────────────────────────────────┤
│  CONFIGURATION LAYER                                     │
│  VehicleConfig → EngineConfig with derived flags.        │
│  zustand store · localStorage persistence · URL sharing. │
└──────────────────────────────────────────────────────────┘
```

**Key invariant**: UI components only render `EvaluationResult`. They never call rule logic directly. See [ADR-P6 · Reusable layer seams](docs/adr/ADR-P6-reusable-layer-seams.md) for the extraction-ready architecture map.

**Stats**:
- **211** rules · **17** legal families · **137 ACTIVE** (after Phase M.0–M.4 + Part C: +4 new EU horizontal, +16 UNECE deep-links, +5 EU-horizontal source fill, +2 MAC/F-gas, +5 FR overlay, +3 UK residual)
- **6** lifecycle states: `PLACEHOLDER` / `DRAFT` / `SEED_UNVERIFIED` / `SHADOW` / `ACTIVE` / `ARCHIVED`
- **6** freshness states: `fresh` / `due_soon` / `overdue` / `critically_overdue` / `never_verified` / `drifted`
- **21** golden-dataset anchors (CI-enforced against EUR-Lex SPARQL weekly)
- **Per-country coverage**:
  - 🟢 **DE** — 8 ACTIVE + 2 indicative (LSV pending legislation, KBA needs architectural split) *(unchanged in Phase M; DE stays at production-grade)*
  - 🟢 **UK** (non-EU market) — **14 ACTIVE** + 1 DRAFT (UK-015 ETS road-transport scope awaiting adopting SI; Phase M.4 promoted Windsor Framework NI + Public Charge Point Regs + UK REACH)
  - 🟢 **ES** — **9 ACTIVE** + 5 indicative / DRAFT / PLACEHOLDER (Homologación Individual still pending Orden ministerial citation; ZEV 2040, Movilidad Sostenible, MOVES III, CCAA notice kept at current lifecycle by design — documented in Phase M.4 rationale)
  - 🟢 **FR** — **11 ACTIVE** + 1 DRAFT (Phase M.3 promoted Crit'Air, TVS→TAVE/TAPVP, TICPE, LOM, Malus masse; Prime à la conversion kept ACTIVE as scheme-terminated informational marker; UTAC-CERAM stays DRAFT — no JORF designation decree located)
  - 🟠 **NL** — 0 ACTIVE, 5 SEED_UNVERIFIED (authoring deferred to Phase N+)
  - 🟢 **UNECE technical** — **43 ACTIVE** (Phase M.2.A promoted 16 R-series: R7 / R25 / R28 / R30 / R34 / R51 / R67 / R87 / R101 / R112 / R113 / R116 / R125 / R128 / R140 / R145 to ACTIVE via verified UNECE deep-link URLs — on top of 27 prior ACTIVE from Phase L)
  - 🟢 **EU horizontal** — **52 ACTIVE** covering Battery Reg (8 sub-obligations) + F-gas 2024/573 · Euro 6 + Euro 7 split + OBD + EVAP + AdBlue · MAC Dir 2006/40 · CO2 / tyre / energy labels · VECTO · WLTP · RDE · AI Act · Data Act + AFIR · GDPR + ePrivacy + EDPB · PLD + GPSR · RED cyber + Del Reg 2022/30 · REACH · recall (2018/858 Arts 52-53) · eCall 2015/758 · WVTA Annex II master 2021/535 · R100 · R171 DCAS · R155/156/157 cyber+SW+ALKS
- **13** non-goals explicitly honoured (see [spec §3.6](docs/phase12/ux-refactor-spec-v2.md))

---

## Scope (and what's out)

**In scope** — this tool evaluates:

- EU horizontal regulations (WVTA 2018/858 + Annex II master 2021/535, GSR2 + 6 delegated acts + eCall 2015/758, R155/R156/R157, GDPR + ePrivacy + EDPB Connected-Vehicle Guidelines, Data Act + AFIR, AI Act 4-phase, Battery + F-gas + REACH + MAC Directive, Euro 6 + Euro 7 split + OBD/EVAP/AdBlue + tyre label + CO2 label, PLD + GPSR, RED cyber Del Reg 2022/30, recall 2018/858 Arts 52-53)
- Germany (DE) member-state overlay (**8 ACTIVE**): registration (FZV) · roadworthiness (§29 StVZO HU/AU) · insurance (PflVG) · motor tax (KraftStG) · low-emission zones (Umweltzonen) · E-Kennzeichen · …
- United Kingdom (UK) non-EU-market overlay (**14 ACTIVE**): Automated Vehicles Act 2024 cluster · post-Brexit registration · UK GDPR / DPA · Windsor Framework NI · Public Charge Point Regs 2023 · UK REACH · UK ETS base
- France (FR) **production-grade overlay (11 ACTIVE)**: French type-approval + national ID + ZFE-m + ZBE registration + CO2 malus + Crit'Air + LOM + TAVE/TAPVP + TICPE + Malus masse + Prime à la conversion (terminated informational marker)
- Spain (ES) partial overlay (**9 ACTIVE**, 5 at indicative/DRAFT/PLACEHOLDER by design)
- UNECE technical regulations (**43 ACTIVE** after Phase M.2.A): EMC, braking, restraints, mirrors, lighting, steering, emissions (LD + HD + noise), crash (frontal/side/pedestrian), EV/H2/AVAS safety, tyres, anti-theft, forward vision, LED sources, ESC, AEBS, EDR, eCall, and more

**Pending human verification** (tracked in separate rolling workstream):

- **74 rules** at various non-ACTIVE lifecycles (down from 104 before Phase M — Phase M promoted 30 rules to ACTIVE + added 6 new ACTIVE rules). Lifecycle breakdown: 33 PLACEHOLDER / 11 DRAFT / 30 SEED_UNVERIFIED.
- Outstanding batches (after Phase M): **NL** (0 ACTIVE yet, 5 SEED_UNVERIFIED authored — Phase N scope) · **ES** remainder (5 rules incl. Homologación Individual awaiting Orden ministerial, ZEV 2040, Movilidad Sostenible, MOVES III, CCAA notice) · **FR** residual (1 DRAFT — UTAC-CERAM pending designation decree) · **DE** non-ACTIVE (2 rules) · **UK** residual (1 DRAFT — UK ETS road-transport scope awaiting adopting SI) · UNECE Annex II residual (5 SEED_UNVERIFIED: R49 HD, R85 power, R115 retrofit, R135 pole, R137 full-width frontal).
- Full backlog — regenerable via `npm run verification-backlog` — tracked at [docs/phase-j/verification-backlog.md](docs/phase-j/verification-backlog.md).

**Out of scope** (explicit non-goals — see [ADRs](docs/adr/)):

- UNECE Annex II technical regulations beyond the pilot-triggered set (43 residual SEED_UNVERIFIED)
- Other EU member states beyond DE/FR/NL/ES (IT/PL/BE/AT/SE/CZ/… — 5-PLACEHOLDER skeletons only)
- Non-EU markets beyond UK (CN/US/JP/TR/…)
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
npm test             # vitest — 248 tests across 38 test files
npx tsc --noEmit     # type-check only
npm run lint         # eslint

# Production build
npm run build
npm start
```

First time? Open the app, click the **⚙ gear icon** in the top-right, then **"Load MY2027 BEV sample"**. You'll land on a pre-populated Setup with **81 APPLICABLE** pilot-triggered rules ready to explore (MY2027 BEV × DE·FR·NL pilot baseline, post Phase M full execution).

---

## Quick links

| Link | Purpose |
|---|---|
| [docs/USER-GUIDE.md](docs/USER-GUIDE.md) | Full user guide (Chinese) — task-oriented, per-field reference |
| [docs/DEVELOPER.md](docs/DEVELOPER.md) | Developer guide (English) — architecture, conventions, contribution |
| [docs/phase12/ux-refactor-spec-v2.md](docs/phase12/ux-refactor-spec-v2.md) | Product spec (source of truth, read before major changes) |
| [docs/adr/](docs/adr/) | Architecture Decision Records |
| [docs/phase-m/plan.md](docs/phase-m/plan.md) | Phase M coverage plan (shipped 2026-04-24 — source for §9 exit criteria) |
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
├── tests/                      248 tests (unit + UI + regression)
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
- **FR coverage reached production-grade in Phase M.3 (11 ACTIVE, 1 DRAFT — UTAC-CERAM designation blocker); NL coverage remains seed-only (0 ACTIVE, 5 SEED_UNVERIFIED — authoring deferred to Phase N+)** — the ScopeBanner's 4-tier progressive disclosure (production-grade / indicative / pending / out of scope) and per-rule "Why indicative only" callouts communicate this explicitly; do not assume coverage on the basis of a country code being selectable.
- **Always validate with your homologation partner** (TÜV / DEKRA / UTAC / RDW / KBA / VCA / …) and legal counsel before making market-entry decisions.

---

## License / Attribution

© Yanhao FU · 2026
