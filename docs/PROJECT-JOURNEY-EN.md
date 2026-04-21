# Project Journey

**Version:** Phase K.4+ (snapshot 2026-04-21) · 196 rules / 73 ACTIVE · 230 tests green
**Nature:** Cross-phase, cross-dimension **retrospective reference** — not marketing, not phase-archive
**Audience:** Future maintainer / partner / OEM prospect / investor / future-self
**Chinese original:** [PROJECT-JOURNEY.md](./PROJECT-JOURNEY.md) (primary, deeper detail)
**Related:** [README.md](../README.md) · [DEVELOPER.md](./DEVELOPER.md) · [USER-GUIDE-EN.md](./USER-GUIDE-EN.md) · [HOMOLOGATION-HANDBOOK-EN.md](./HOMOLOGATION-HANDBOOK-EN.md) · [docs/phase0/](./phase0/) · [docs/phase-j/](./phase-j/)

> **How to read this file:** The six Parts are independent and organized by theme, not chronology. After Part 1 (one-page opening narrative), jump to the **Reader Navigation Map** at the end for your role-specific path. Full read is not required.

---

## Table of Contents

- [Part 1 · Opening narrative: from 0 to 73 ACTIVE](#part-1--opening-narrative-from-0-to-73-active)
- [Part 2 · Technical distillation](#part-2--technical-distillation)
- [Part 3 · Product and UX decisions](#part-3--product-and-ux-decisions)
- [Part 4 · Business and market insights](#part-4--business-and-market-insights)
- [Part 5 · Budget / effort / ROI](#part-5--budget--effort--roi)
- [Part 6 · Open risks, technical debt, what we would do differently](#part-6--open-risks-technical-debt-what-we-would-do-differently)
- [Reader Navigation Map](#reader-navigation-map)

---

## Part 1 · Opening narrative: from 0 to 73 ACTIVE

The EU Vehicle Compliance Navigator started from a Phase 0 baseline: a 13-family legal taxonomy, 34 seed rules, and a four-layer architecture (Configuration / Registry / Evaluation / Presentation) laid down in `docs/phase0/architecture.md` and `docs/phase0/data-model.md`. At that point only 14 rules could legitimately claim ACTIVE — everything else was SEED_UNVERIFIED / DRAFT / PLACEHOLDER. The tool was a scaffold with a declared direction and almost no verified content.

**Four turning points** moved it from scaffold to production-grade on a narrow slice:

- **Phase 11 — pilot-driven work guidance** (Sprint 10 ship) reframed the tool from "rule catalog" to "SOP-anchored workbench": the same rule set is re-rendered across Setup / Status / Plan for input, management, and project-manager audiences. `fixtures/pilot-my2027-bev` became the regression anchor — every commit has to preserve its APPLICABLE set.
- **Phase H UNECE enrichment → Phase I breadth expansion** (Phase H.6 closed at `54ee504`; Phase I ran `0dd20ca` through `ff5f6de`) introduced a `fuelType` field and five derived flags (`hasCombustionEngine`, `hasDieselEngine`, `hasFuelTank`, `hasOBD`, `isPlugInHybrid`), breaking the early BEV-only bias. Phase I.2 (`1e20189`) added ICE/PHEV emissions rules plus UNECE enrichment; the same arc added 45 new rules (emissions / UNECE / UK / ES / DE / FR overlay), pushing the registry from ~150 to 196.
- **Phase J human-review rounds** (commits `379eb1a` through `afc4f50`) ran three review rounds in roughly a month, promoting 39 rules from SEED_UNVERIFIED to ACTIVE: Round 1 DE-targeted (`379eb1a` / `b23ebfb`: DE-006/008/010), Round 2a EU emissions + battery sub-obligations (`8fa919b`), Round 2c ES batch (`b8fdc7c`), Round 3 UK/FR/EU residual (`79e3574` / `d42ec2f` / `afc4f50`). Net effect: **34 → 73 ACTIVE**.
- **Phase K management-friendly UX and documentation refresh** (commits `1556ada` through `7850bf4`): K.0 (`1556ada`) surfaced the already-in-schema `manual_review_reason` in the UI; K.1 (`1bf6e79`) refreshed the ScopeBanner; K.2 (`3afaf9a`) added 3-second executive summaries on Status + Plan; K.3 (`cea18c1`) refreshed README / USER-GUIDE / DEVELOPER; K.4 (`7850bf4`) introduced the Homologation Handbook. This document (spec `5668a73`) sits at K.4+.

**Where we are now:** 196 rules / 73 ACTIVE (37%) / 230 tests green. DE and UK are production-grade (DE with 5 ACTIVE overlay rules, UK with a 10-rule AV Act 2024 cluster). ES and FR are indicative (authored, some URLs still unverified). NL remains placeholder. The MY2027 BEV × DE pilot sits at **30 APPLICABLE** — progressing 16 → 21 (Phase I) → 25 (Round 2c) → 30, and the rule is that number may grow but must not shrink without recorded justification.

**Next:** NL URL verification (5 SEED_UNVERIFIED rules already authored); residual UNECE Annex II rules (about 43 PLACEHOLDER entries outside the pilot-triggered set); the DE-009 KBA authority-chain split. Longer-term, a Phase L-class capability expansion whose priority is not yet decided.

The whole arc is a textbook case of "scaffold to production-grade coverage on a narrow country slice": the dominant engineering cost is not UI or engine, it is the **rule-content provenance and human-verification pipeline**.

---

## Part 2 · Technical distillation

The heaviest section. Principle: even an observation that seems mundane today may be the key inspiration later. Prefer over-documenting to losing insight.

### 2.1 Four-layer architecture (UI / Evaluation / Registry / Configuration)

Phase 0 locked in four responsibilities in `docs/phase0/architecture.md` §1.1: **Configuration** is input (`VehicleConfig → EngineConfig` derivation), **Registry** is pure data (Zod-validated `Rule[]`), **Evaluation** is a pure function (`config × rule → EvaluationResult`), **Presentation** only renders. Each layer's boundary is a hard constraint:

- UI does not compute (only consumes `EvaluationResult`)
- Evaluator has no side effects (no storage writes, no logging, no fetch)
- Registry is pure data (`rule` object literal + Zod schema)
- Configuration is one-way derived (`VehicleConfig → EngineConfig`)

**Why this split:** responsibility separation + testability + data-layer migratability. Today the `RegistryAdapter` interface lets a future database migration happen by swapping one adapter — engine and UI stay untouched.

**How we detect boundary violations:** the code reviewer repeatedly flagged the same phrase — "UI is starting to compute, move it back to engine." Phase J.5 (`2f95c4b`) was caught this way; the phrase became a catchphrase.

**Transferability:** any system with "decision logic + mutable inputs + rule data" benefits from this stack. Adjacent examples: permission engines, feature-flag systems, expense approval, compliance scanning, tax rate calculation.

### 2.2 Hard-gate principle: governance enforced at evaluation, not authoring

First principle: **non-ACTIVE rules must never return APPLICABLE**. Implementation is in `src/engine/evaluator.ts:113-121` — a hard-coded downgrade block that turns any SEED_UNVERIFIED / DRAFT match into CONDITIONAL, and PLACEHOLDER into UNKNOWN.

**Why at evaluation, not authoring:** if you rely on the author to set lifecycle correctly, it WILL leak. People forget; new authors bypass. **Put the constraint at evaluation so authors cannot violate it** — no matter how wrongly a rule is authored, runtime pulls it back.

**Transferability:** any "data-quality tier × output-confidence" system. Data quality → decision confidence; model version → prediction surface; evidence level → diagnostic suggestion. Same pattern: metadata controls output authority, and the control point is on the consumer side.

### 2.3 Three load-bearing schema fields

#### 2.3.1 `lifecycle_state` — single source of truth for governance

Five states: `PLACEHOLDER` / `DRAFT` / `SEED_UNVERIFIED` / `ACTIVE` / `ARCHIVED`. The promotion gate is not "edit this field" but "satisfy these conditions" (`official_url`, `oj_reference`, `last_verified_on` all set + a human reviewer signed off). `promotionLog` records every transition with reviewer identity.

#### 2.3.2 `content_provenance.human_reviewer` — the real trust signal

**Key insight:** **the real trust signal is not `lifecycle_state`, it is `human_reviewer`**. Early ACTIVE rules had `human_reviewer: null` — lifecycle was ACTIVE but nobody had actually signed off. Phase J anti-hallucination work separated "trust" from lifecycle into its own field.

→ **governance state** (which tier the rule is in) and **data lineage** (who verified it) are two orthogonal axes. This separation paid off in every verification round: Round 2c could populate `sources[0].official_url` in the ES batch (advancing lifecycle) and record `yanhao` in `human_reviewer` (advancing provenance) as independent moves.

#### 2.3.3 `manual_review_reason` — acknowledge uncertainty AND surface it

**The Phase K.0 story (`1556ada`):** the tool had `manual_review_reason` in the schema from the start, but only surfaced it in the Coverage tab's VerificationQueuePanel. Users (homologation engineers) saw a forest of "Indicative" badges on Rules cards and asked "why is this still Indicative?" — **the problem was not "they don't know"; it was "they don't know WHY they don't know."**

K.0's single action: inline `manual_review_reason` at the top of every RuleCardV2 for SEED_UNVERIFIED / DRAFT / PLACEHOLDER rules. The field was already in the schema; we just exposed it. This UX change touched only the UI render layer — registry was not modified. Directly it resolved confusion around 6 ES rules (whose `manual_review_reason` was filled in during K.0). More importantly, it reshaped how all non-ACTIVE rules would be presented going forward.

**Transferable pattern:** **any product showing "gray / pending / undecided" state should attach a "why" field and surface it explicitly**. Stripe's `decline_reason`, Kubernetes `condition.message`, GitHub Actions skip-reason — all the same idea.

#### 2.3.4 Why these three are "load-bearing"

If we had to keep only three fields to express "how reliable is this rule," it would be these three: **lifecycle says whether the rule enters evaluation; provenance says who signed off; manual_review_reason says what's blocking if pending**. Everything else (source family, oj_reference, temporal scope) is detail.

### 2.4 Factory patterns (factories are stronger than conventions)

The registry uses two factories:

- **`makeSeedRule()`:** applies schema defaults + enables Zod runtime validation; the author only writes diffs.
- **`uneceRule()`:** **hard-locks lifecycle to SEED_UNVERIFIED** — any UNECE R-series rule produced by it is SEED, full stop. The author cannot bypass.

**Lesson:** factories can enforce invariants that prose and convention cannot. No matter how clearly the docs say it, new authors bypass conventions. Factories block them. Phase J.1 (`c6ce6e7`) added `UneceAuthored.evidenceTasks` / `manualReviewReason` to the factory; old callers got defaults, new callers used extensions — **additive extension** preserved backward compatibility. Phase I.3 (`47b51a3`) followed the same pattern when it added `offersPublicChargingInfra` to `EngineConfig`: `.optional().default(false)` prevented breaking user localStorage. Phase I.6 (`ff5f6de`) applied the same back-compat fix once more.

**Transferability:** schema evolution + factory pattern = essential infrastructure for long-lived systems. Short-lived projects can skip it; any schema expected to last over a year needs additive-only + factory-wrapped evolution from day one.

### 2.5 Pilot fixture as regression anchor

`fixtures/pilot-my2027-bev.ts` + `fixtures/pilot-my2027-bev.expected.ts` are the behavior baseline for the entire system. Rules:

- **`applicable_rule_ids` may grow, must not shrink.** The BEV × DE pilot went from 16 APPLICABLE at Phase 0 → 21 at Phase I → 25 at Round 2c → 30 today — only grew. If a commit shrinks the set, a justification must appear in the PR (typically "this rule should never have applied to BEV" — a diagnostic correction — is the only valid reason).
- **Use the fixture to verify end-to-end behavior, not unit tests on internals.** A fixture is "one real project config"; evaluation must remain stable under it.
- **Soft range assertions:** for example `conditional_count_range: [25, 60]`. Tests express intent ("there should be a few dozen CONDITIONALs") not specific numbers, which would churn with every authoring increment.
- **Snapshot tests are audit artifacts.** `git diff tests/unit/__snapshots__/` is the manual review step before every commit — snapshots are evidence, not ground truth.

**Transferability:** any "config → result" system benefits from a golden fixture. Even one (BEV × DE) is vastly better than zero — it makes "what did this change actually affect" visible.

### 2.6 Anti-hallucination stack: multi-layer defense (critical section)

This is where the project spent the most meta-concern time. Eight layers:

1. **Schema layer:** `content_provenance.human_reviewer: null` = "untrusted". A governance test runs `validateRegistryIntegrity(activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification)` as a hard gate — any ACTIVE rule missing URL / OJ / verification date fails the test.
2. **Authoring layer ([verify] markers):** `[verify]` appears only in `notes` / `manual_review_reason` / `source.oj_reference` — **NEVER in `obligation_text`** (user-facing prose). The Phase I.4 ES batch (`cc55a82`) was sent back by the code reviewer once for leaking `[verify]` into obligation_text, and the rule was codified afterward.
3. **Review layer:** two-loop review (spec reviewer + code reviewer). The spec reviewer handles "is this rule's scope aligned with the article it cites?"; the code reviewer handles "does the code change break any existing contract?". Two complementary angles.
4. **Test layer:** governance tests for registry integrity; pilot acceptance tests for behavior stability (see §2.5); unit tests for evaluator edge cases.
5. **UI layer:** lifecycle badges (TrustBadge translates lifecycle to Verified / Indicative / Pending) + "Why indicative only" callouts — users are told explicitly "we don't fully trust this."
6. **Human layer:** human verification catches errors AI cannot. **StVZO §23 is Oldtimer (classic vehicles), not Kennzeichen (license plates)** — Round 1 DE (`379eb1a` / `b23ebfb`) caught this by opening gesetze-im-internet.de in a browser. AI research agents had missed it. Human verification is expensive, but it produces ground truth.
7. **AI-vs-AI layer:** parallel research agents triangulate citations. The ES batch had research agents find 5 spec-level errors — RD 559/2010 is **Industrial Registry**, not homologación individual; Ley 7/2021 ZEV target is **2040**, not 2035; RD 110/2015 is **RAEE** (WEEE / electrical waste), not batteries. These are citation-level mismatches that humans don't spot instantly, but parallel agents are cheap — you can run 5-10 independent checks concurrently.
8. **Key lesson:** **every layer has failure modes; multi-layer redundancy is what works**. The error classes each layer catches are complementary — schema catches missing fields, review catches content-vs-scope mismatches, tests catch behavioral regressions, UI catches user-cognition blind spots, humans catch factual errors (most expensive, most ground-truth), AI research catches citation errors (cheap, parallelizable). Treat the eight layers as a stack; every suspicious rule should leave a trace on at least three.

### 2.7 Key data-model decisions

#### 2.7.1 `RuleTemporalScope` seven-field structure

Replaced the early `effective_from` / `effective_to` two-field pair with: `entry_into_force` / `applies_to_new_types_from` / `applies_to_all_new_vehicles_from` / `applies_to_first_registration_from` / `applies_from_generic` / `effective_to` / `small_volume_derogation_until`. This matches the automotive phase-in pattern directly — one EU regulation may **apply to new types from YYYY, to all new vehicles from YYYY+2, with small-volume derogation until YYYY+5**.

The engine picks the right field based on `config.approvalType`: `new_type` compares against `applies_to_new_types_from`; `carry_over` / `facelift` compares against `applies_to_all_new_vehicles_from`; horizontal regulations compare against `applies_from_generic`.

**Transferability:** any "multi-date effective" regulation / policy system needs this dimension split. Tax law, health-insurance formularies, import restrictions all have similar phase-in structures.

#### 2.7.2 Trigger logic: declarative-primary + custom-evaluator escape hatch

80% declarative, 20% custom — "selective complexity." Declarative conditions (`{ field, operator, value }`) work for most rules; the **DCAS R171 "if fitted"** rule uses a named `customEvaluators["dcas_if_fitted"]` because it needs system-level reasoning. This dodges the "all-DSL or all-code" binary trap.

**Lesson:** the biggest DSL-design pitfall is greediness — trying to express everything in DSL. **Keep a named escape hatch for the 20% that doesn't fit, keep the 80% declarative benefit**.

#### 2.7.3 `OwnerHint` controlled vocabulary

Twelve predefined owner categories: `homologation` / `safety_engineering` / `cybersecurity` / `software_ota` / `privacy_data_protection` / `ai_governance` / `sustainability_materials` / `legal` / `aftersales` / `regulatory_affairs` / `powertrain_emissions` / `connected_services` / `other`. This enum lets the Plan tab's Owner Dashboard aggregate by owner — group, filter, generate cross-rule worklists.

**Transferability:** **controlled vocabulary > free text** for any system that needs cross-cutting views. Free-text fields eventually contain "Safety Team" / "safety" / "SafetyEng" / "safety-eng" — aggregation then collapses.

#### 2.7.4 Related rules as a directed graph

`{ rule_id: "REG-CS-001", relation: "complements" | "requires" | "conflicts" }` — makes inter-rule dependencies first-class. Enables three things: "see also" navigation on rule cards, consistency checks (if A `requires` B but B is ARCHIVED, raise a warning), and dependency visualization.

### 2.8 Config-as-pure-input pattern

`VehicleConfig → EngineConfig` is derived once, and the entire evaluation pipeline then becomes a pure function of config. Phase I.1 (`0dd20ca`)'s five new derived flags (`hasCombustionEngine` / `hasDieselEngine` / `hasFuelTank` / `hasOBD` / `isPlugInHybrid`) are all derived from `VehicleConfig.powertrain + VehicleConfig.fuel` — the invariant holds.

**Lesson:** **if state is immutable + derivable, other subsystems simplify dramatically**. URL sharing (`VehicleConfig` JSON-encoded into a query string), localStorage persistence, undo/redo, time-travel debug — all become cheap, no special architecture needed. Conversely, if the config contains derived mutable state, every persistence path requires extra handling.

### 2.9 Rule splitting: ADR-H7 Euro 7 three-way split

`docs/adr/ADR-H7-euro-7-rule-split.md` records what looked at first like a strange decision: **splitting Regulation (EU) 2024/1257 Euro 7 into three rules** (not one big rule), keyed by powertrain:

- `REG-EM-001` Euro 7 framework (all M1/N1 trigger)
- `REG-EM-013` Euro 7 combustion exhaust + OBFCM (triggers only when `hasCombustionEngine`)
- `REG-EM-014` Euro 7 battery durability (triggers only when `batteryPresent`)

**Why split:** if a single rule's trigger has internal branching ("test A for ICE, test B for BEV"), `evidence_tasks` becomes a mix of ICE and BEV tasks that can't be cleanly assigned. After splitting, each rule's evidence is clean: combustion → `powertrain_emissions` owner; battery → `sustainability_materials` owner.

**Transferable principle:** **if a single rule's trigger conditions have internal branches, split into multiple rules**. Prefer more rules, each one monomorphic.

### 2.10 Subagent-driven development lessons

Phase H / I / J used subagents extensively. Lessons earned in practice:

1. **Fresh subagent + clean prompt > single agent + long history.** The context-switching cost of spinning up a new agent is always less than the context-pollution cost of a long session (attention drift + compounding early errors).
2. **Parallel implementers have conflict risk** — two agents editing the same file will collide at merge. So implementation-stage commits are serialized; **parallelize only research**.
3. **Research agents can parallelize safely.** They don't write code, so no conflicts; and triangulation (multiple independent sources converging on the same conclusion) is the strongest anti-hallucination weapon. The ES batch had three research agents covering different slices — every citation error they found was an independent discovery.
4. **Fresh subagent is not stateless** — it needs a current registry snapshot and a clear scope boundary ("touch only `src/registry/seed/member-state-overlay.ts`, don't modify engine") or it will overstep.
5. **Aphorism:** **agent-to-agent workflow is the "disposable worker" pattern — use once and discard. Don't build long conversations with any single agent**. Break work into blocks that a clear prompt can fully describe.

### 2.11 File organization (per-responsibility, not per-domain)

`src/registry/seed/*.ts` splits by legal family: `vehicle-approval.ts` / `general-safety.ts` / `cybersecurity.ts` / `emissions-co2.ts` / `materials-chemicals.ts` / ... Cross-cutting logic lives outside:

- `shared.ts` — factories
- `classification.ts` — cross-cutting enrichment
- `evidence-enrichment.ts` — cross-cutting evidence reinforcement
- `freshness-data.ts` — cross-cutting review cadence
- `index.ts` — composition (`applyEnrichments` merges all)

**Lesson:** **one file, one responsibility** — easier to locate, review, reason.

**Threshold:** when a file exceeds 1,500-2,000 lines, split. `member-state-overlay.ts` hit 2,692 lines (see §6.2), near the break point. `emissions-co2.ts` at 998 is in the caution zone.

### 2.12 UI language vs engine language — explicit mapping

Engine says: `ACTIVE / SEED_UNVERIFIED / DRAFT / PLACEHOLDER / ARCHIVED`. UI says: **Verified / Indicative / Pending**. The `TrustBadge` component does the translation; `src/lib/classify-trust.ts` holds the map.

**Lesson:** **user vocabulary ≠ governance vocabulary**. Schema-native terms preserve precise semantics (governance needs 5 states); user-facing terms should be fewer and more intuitive (users only care "how much can I trust this"). Don't make users learn your internal enums.

### 2.13 What to do when the schema doesn't support something

The ES CCAA (Comunidad Autónoma) sub-country regional variation: Madrid's ZBE (low-emission zone) differs from Catalonia's, but our `targetCountries` schema only goes to country granularity — no region field. Two paths:

- Option A: add `targetRegions: string[]` to the schema. Cost: all registry rules, engine, UI, config persistence have to change, globally, for a single country.
- Option B: **acknowledge the tool's boundary** — add one aggregate advisory rule `REG-MS-ES-014` telling the user "ES has CCAA variation; this dimension needs separate due diligence." The user is told about the blind spot rather than misled.

We chose B. **Lesson:** **acknowledging tool boundaries beats force-extending the schema — the tool does not lie to the user**. If 10% of real-world dimensions are outside schema reach, an honest "not covered" is better than a half-baked pseudo-cover.

### 2.14 Evidence tasks must be actionable

Contrast:

- Bad: `Ensure compliance with Art. 13`
- Good: `Battery label artwork approval per Annex VI format including QR linking to passport` (from REG-BAT-009)
- Good: `Demontage-Informationen sheet in German within 6 months of new-type launch` (from REG-MS-DE-010 AltfahrzeugV)

Every `evidence_task` is a concrete deliverable (document, test, sign-off) — checkable, assignable by `owner_hint`.

**Lesson:** **abstract obligations must be concretized at authoring time — the tool does not pass the buck to the user**. A rule that says "comply with Art. 13" says nothing; the engineer would still have to crack open the legal text. Doing the unpack once at authoring benefits all downstream readers.

### 2.15 Three orthogonal axes of trust (key abstraction insight)

**People often conflate these three; they are independent dimensions:**

1. **Trust:** is this rule's source trustworthy? — answered by `lifecycle_state` + `content_provenance.human_reviewer`. Only ACTIVE + `human_reviewer: yanhao` counts as trustworthy.
2. **Applicability:** does it apply to the current project? — answered by `trigger_logic` + `EngineConfig`. The 30 APPLICABLE in BEV × DE is this axis's output.
3. **Freshness:** recently re-verified? — answered by `last_verified_on` + `review_cadence_days`. Even if lifecycle is ACTIVE and `human_reviewer` is set, if `last_verified_on` has passed the 6-month cadence, the rule moves to `overdue` / `critically_overdue` / `drifted`.

**Why the separation matters:** there's no derivation between the three — any two can be green while the third is red. Common scenarios:

- Trust OK / Applicability OK / Freshness NOT: rule is ACTIVE, applies, but stale — needs re-verify, don't delete.
- Trust NOT / Applicability OK / Freshness N/A: rule applies but source isn't trusted — show Indicative, flag for human review.
- Trust OK / Applicability NOT / Freshness OK: rule is trusted and fresh but doesn't trigger for the project — stays off the checklist.

**Transferability:** **any rule engine / policy system / knowledge base benefits from this separation**. Medical decision support (evidence level × patient match × guideline recency), legal compliance (statute status × entity nexus × last update), security scanning (CVE confidence × system affected × last scan) — all fit the same three-axis frame. **This may be the highest-transferability abstraction in the whole project.**

### 2.16 Aphorism catalog (pluck-and-use principles)

Seventeen one-liners. Each with a sentence or two of context.

1. **"Non-ACTIVE rules must never return APPLICABLE"** — governance first-principle. Hard-gate at the top of `src/engine/evaluator.ts`. Every rule engine should start here.
2. **"UI renders, engine computes"** — the responsibility boundary. Any UI-side conditional "if X then Y" should first ask whether it belongs in engine.
3. **"[verify] lives in notes, never in obligation_text"** — anti-hallucination hard rule. The Phase I.4 ES batch learned this the expensive way.
4. **"Pilot regression anchor: applicable_rule_ids may grow but must not shrink"** — regression guard. Every cross-phase behavior change passes through it.
5. **"Silent under-serving is the worst failure mode"** — the PHEV fixture diagnosis lesson. A rule failing to trigger is more insidious than a rule triggering wrongly — users don't complain about absent output.
6. **"Fresh subagent beats long conversation"** — subagent-driven development core. Starting fresh with a clean prompt is cheaper than trying to unteach an old agent.
7. **"Dispatch parallel research agents BEFORE writing anything"** — multiple citation triangulations before authoring save enormous review-round rework.
8. **"Human verification catches real errors AI verification cannot"** — the StVZO §23 lesson. AI triangulation is strong but doesn't cover primary-source detail divergence.
9. **"Trust ≠ Lifecycle ≠ Applicability — three separate axes"** — the condensed form of §2.15.
10. **"Factories enforce invariants, prose/convention cannot"** — docs never out-leverage factory code.
11. **"Controlled vocabulary > free text"** — owner_hint, legal_family, lifecycle all qualify. Foundation of any cross-cutting view.
12. **"If your data is immutable + derivable, the rest of the system simplifies"** — the core payoff of config-as-pure-input.
13. **"When the schema doesn't support X, tell the user — don't hack"** — the ES CCAA lesson.
14. **"Test snapshot is audit artifact, not baseline"** — snapshot diffs are review material, not absolute truth.
15. **"Additive schema changes should default; existing data shouldn't break"** — `.optional().default(x)` is the basic syntax of long-lived systems.
16. **"Acknowledge tool boundaries rather than fake omniscience"** — CCAA case. Honest explicit "not covered" beats misleading pseudo-cover.
17. **"Evidence tasks are deliverables, not aspirations"** — "comply with X" is not evidence; "submit a compliant-with-X Y report" is.

### 2.17 Rejected decisions (counter-examples)

**This section is more reference-valuable than "what we did" — it encodes constraint knowledge.**

1. **Considered: splitting CCAA into per-region rules.** Rejected — schema doesn't support it; hack cost too high. See §2.13 for the decision flow. Substitute: aggregate advisory `REG-MS-ES-014`.
2. **Considered: introducing a backend API.** Rejected — `AGENTS.md` non-goals explicitly forbid it (Next.js static export). Adding a backend means hosting, auth, data-residency, and cost overhead — out of scope for current needs.
3. **Considered: UNECE R161 as a standalone rule.** Rejected — R161's ADB (Adaptive Driving Beam) content actually lives inside R149; a standalone rule would be a hallucination. A research agent initially returned R161 as standalone; human review at gesetze / UNECE portal confirmed the error and pulled it back.
4. **Considered: LLM runtime evaluation.** Rejected — triple penalty: reproducibility (same config, different outputs), cost (per-evaluation tokens), latency (seconds vs milliseconds). Evaluation must be a deterministic pure function (see §2.2).
5. **Considered: marking Ley 3/2023 ES as ACTIVE.** Rejected — enactment status unverified (ES has a gap between "published" and "in force"). Required the URL to resolve to "En vigor" before promotion. Left as SEED_UNVERIFIED — the honest state.

**Lesson:** recording "rejected" decisions is more reference-valuable than recording "adopted" ones — newcomers' first instinct is often to re-propose these already-explored dead ends. Writing them down = blocking successors from walking the same dead ends.

---

## Part 3 · Product and UX decisions

### 3.1 Progressive disclosure

Phase K.2 (`3afaf9a`) restructured Status and Plan into a **3-second exec block + expandable detail** two-tier layout: management sees the verdict ("OK WITH CAVEATS" / "AT RISK") on first paint; engineers can scroll down to per-rule conditions and evidence tasks. This is the tool's core response to "heterogeneous audiences on the same data" — one `EvaluationResult`, three depths of rendering (3 seconds / 30 seconds / 3 minutes), none hollowed out.

**Lesson:** not every audience needs the same density. Management scans the verdict plus three top blockers; engineers scan per-rule evidence and owner assignments. **Same payload, tiered render**.

### 3.2 Three-tier trust (Verified / Indicative / Pending)

The engine has five lifecycle tiers; the UI exposes three: `ACTIVE → Verified` / `SEED_UNVERIFIED + DRAFT → Indicative` / `PLACEHOLDER → Pending`. The `TrustBadge` component does the mapping; `src/lib/classify-trust.ts` holds the table.

**Why three and not two (OK / not-OK):** a binary presentation collapses "authored but not verified" and "empty placeholder" into the same category — but users should treat the first as an "indicative working copy" and the second as "completely unknown." Three explicit tiers calibrate user trust better.

**Lesson:** **honest graded uncertainty beats false confidence**. A user who discovers the tool claimed "Verified" when it wasn't verified loses trust — and can't get it back.

### 3.3 The "Why indicative only" callout story (K.0)

Phase K.0 (`1556ada`) did one thing — promoted `manual_review_reason` from a bottom-of-Coverage surface to a top-of-RuleCardV2 inline callout. Background: user feedback before K.0 was "why is this still Indicative, can I trust it?" The answer was always in `manual_review_reason` (e.g., "enactment status unverified", "implementing SI rolling release"), but buried in the Coverage tab where few users clicked.

The **leverage** of this UX change: the modification touched only the UI render layer (one component), registry not changed, but it reshaped how all Indicative rules looked. It directly resolved confusion around 6 ES rules (their `manual_review_reason` was also filled in during K.0 — because now it was mandatory to surface).

**Lesson:** **sometimes the highest-value UX change is just surfacing information already in the schema**. No need to add a field — add a presentation.

### 3.4 Five-tab hierarchy

The tool's five tabs each serve a distinct role:

| Tab | Primary audience | Information layer |
|---|---|---|
| Setup | Inputters (homologation engineers, PMs) | Configuration form |
| Status | Management (VPs, domain leads) | Top-line verdict + 3-second exec block |
| Plan | Project managers | SOP-anchored timeline + Owner Dashboard |
| Rules | Homologation engineers | Per-rule evidence / condition / source |
| Coverage | Governance (rule curators, external auditors) | Lifecycle distribution / verification queue / freshness matrix |

**Setup → Status → Plan → Rules → Coverage** is also the natural onboarding sequence: "who am I" → "big picture" → "what to do this week" → "which rule specifically this week" → "any coverage gaps."

**Lesson:** **each tab by default answers one role's one question**. Don't make all five tabs "all information visible at all times" — that's equivalent to having no tabs at all.

### 3.5 ScopeBanner four-tier grouping

Phase K.1 (`1bf6e79`) rewrote the ScopeBanner into four groups: **In scope / Pending / Pilot / Out of scope**. The prior banner lumped all jurisdictions together; management couldn't see the gap between "DE is production-grade" and "FR is indicative." The new version states up front — DE + UK in scope (ACTIVE coverage), ES + FR pending (authored but partial verification), NL still in pilot, other EU member states out of scope.

**Lesson:** **telling management the truth** beats optimistic framing in long-run value. Management only needs to catch the tool over-claiming once ("you said FR was covered...") to stop trusting the front-page verdict permanently. ScopeBanner bets on "honesty > polish."

---

## Part 4 · Business and market insights

### 4.1 Target users: Chinese OEMs entering the EU

The primary user profile is **Chinese new-energy OEMs entering Europe** — NIO, BYD, Xpeng, Zeekr, Geely/Lynk&Co, Leapmotor, Chery, Great Wall/ORA, SAIC MG, Li Auto and similar. Their EU progress sits in three bands:

- **Active EU operations** (selling in several countries, local homologation partners in place) — the tool's value here is freshness monitoring and cross-country coordination, not "learning these regulations for the first time."
- **Pilot phase** (single-country pilot underway, authorization team being built) — this is the tool's highest-value segment, capable of replacing roughly half of "researching EU regulations from zero" time.
- **Plan-only** (no TA application yet) — the tool helps them build the "what needs to be done" taxonomy, but lawyers and consulting partners remain necessary.

Users are not lawyers and not management — **they are frontline homologation / regulatory-affairs engineers** (see [HOMOLOGATION-HANDBOOK-EN.md](./HOMOLOGATION-HANDBOOK-EN.md)).

### 4.2 Real pain points

Five concrete pain points, each with a tool-side response:

1. **Regulations are opaque.** EU regulations are published in 24 official languages; one regulation lives simultaneously on EUR-Lex, Commission pages, and each member-state gazette — finding the current consolidated version is its own skill. The tool packages "current authoritative version + who verified + when" into each rule card via `sources[0].official_url` + `oj_reference` + `last_verified_on`.
2. **Member-state divergence.** KBA (DE), VCA (UK), UTAC (FR), RDW (NL), IDIADA (ES) — each has its own TA requirements, document list, and lead times. The `member_state_overlay` legal family exists precisely for this (DE 5 ACTIVE + UK 10 ACTIVE + ES / FR indicative).
3. **Audit evidence chain.** When type-approval authorities or technical services (TÜV, DEKRA, etc.) inquire, they expect SOP-anchored evidence — not "we have a Word document." The `evidence_tasks` field is designed for this (see §2.14); each entry is a checkable deliverable.
4. **Software / OTA lifecycle.** R155 CSMS + R156 SUMS require full change management on every OTA — not a one-shot certification. `review_cadence_days` + drift-alert CI track this layer.
5. **Horizontal regulation acceleration.** AI Act (2024/1689), Battery Regulation (2023/1542), Data Act (2023/2854), Euro 7 (2024/1257) all landed 2024-2026. Management can't absorb them simultaneously. The Status tab + exec summary exist specifically for "management needs one screen showing what's urgent now."

Operational detail is in [HOMOLOGATION-HANDBOOK-EN.md](./HOMOLOGATION-HANDBOOK-EN.md) — this section doesn't repeat per-country detail.

### 4.3 Value proposition

Three sentences:

- **Not a lawyer replacement.** Actual TA applications, contract terms, dispute resolution still belong to law firms and consulting partners.
- **It's the homologation team's daily workbench.** Log in every day, sequence evidence deliverables by SOP date, schedule TÜV review, export audit packs — a persistent surface, not a one-time consulting deliverable.
- **Solves "what do I need to do next week," not "what is this law."** For users, the real value is turning abstract obligations ("comply with Art. 13") into concrete tasks ("submit Annex VI-format battery-label artwork to TÜV for sign-off"). This is the fundamental distinction from reading EUR-Lex straight.

### 4.4 Competitive landscape (anti-hallucination pass)

Described per publicly available information, without claiming specific business practices:

- **Consulting firms (TÜV Rheinland, SGS, UL, DEKRA and similar TIC firms):** per public information, they offer regulatory-compliance consulting, type-approval support, and pre-scan services. Specific pricing structures and engagement models are not verifiable within this document — for accurate comparison, consult their official service catalogs. The tool does not replace TIC services: a TA application must be processed by a designated technical service.
- **Internal Excel + team Confluence.** This is the prevalent state — compliance information scattered across personal files and wiki pages; cross-project reuse difficult; new-hire onboarding long. Self-evident; no source needed.
- **Open-source / public rule resources.** EUR-Lex, UNECE WP.29 documents, Commission delegated-act pages — all primary sources. Any tool's ACTIVE rules ultimately point back here.
- **The tool's relative position.** Between "Excel (ephemeral)" and "TIC consulting (expensive + episodic)," as a **persistent compliance workbench**. It does not compete with TIC firms for the technical-service certificate-issuing authority; it reduces the day-to-day tracking and evidence-assembly burden.

**Hard rule:** any claim about specific TÜV pricing, SGS market share, consulting rate structures requires a verifiable source. No such source is available within this document, **so no such claim is made**. 宁缺毋滥 — better omitted than fabricated.

### 4.5 Commercialization path trade-offs (no specific pricing)

Three paths, described structurally without dollar figures:

1. **Non-commercial / open source / research.** Zero revenue. Persona: hobbyists + academic users + open-source contributors. Upside: maximum freedom. Downside: freshness maintenance depends entirely on individual bandwidth; long-term unsustainable.
2. **Consulting-embedded.** Sign periodic agreements with 1-2 OEM partners + 1 senior regulatory expert; the tool is part of the consulting deliverable. Upside: clear revenue model. Downside: re-negotiating contracts when scaling to a third OEM.
3. **SaaS subscription.** Requires prior completion of automation (EUR-Lex sync pipeline + UI polish + onboarding flow); minimum viable team ~3-6 FTEs for a year. Upside: highest scale potential. Downside: front-loaded investment and go-to-market is a heavy-asset bet.

Which path fits depends on team and OEM relationship network — not a technical question.

### 4.6 Moat + replication risk

**Honest framing:**

- **The real moat:** the 73 ACTIVE rules sit on top of real human verification bandwidth — URL checking, OJ referencing, `last_verified_on`, `human_reviewer` sign-off. This 1-2-person sustained investment is **hard to replicate** — not IP-hard but **operational-cadence and domain-judgement hard**.
- **What is replicable:** the UI layer — a senior frontend engineer could clone it in 6 months. The engine's declarative-trigger architecture — imitable in 3 months. The registry schema itself — public (Zod schema + 13 legal families). **So we do not claim proprietary algorithms — we don't have any**.
- **The real differentiator:** **ACTIVE rules + sustained freshness-review bandwidth**. A new competitor starting from zero doesn't face "build a tool"; they face "build a pipeline that keeps rule content continuously verified" — that's the operational barrier.
- **Replication window:** with 3-6 FTEs and 18 months, a competitor could reach ~70% of current coverage; catching up plus maintaining freshness requires ongoing investment. It's a compounding battle, not a one-off.

---

## Part 5 · Budget / effort / ROI

> **Disclaimer:** hours below are rough estimates based on session records; exact hour tracking was not performed. Ranges reflect "scale of work," not "precise invested hours." Commit timestamps in `git log --format='%h %ai %s'` show the moment of commit, not author time.

### 5.1 Per-phase rough effort

Ballpark estimates by phase (units: hours, each a range):

- Phase 0 design baseline: **about 15-25 hours** (inferred from `docs/phase0/*` scale)
- Phases 1-9 scaffold → evidence: **about 80-120 hours** (inferred from `docs/phase12` notes)
- Phase 11 (11A-E pilot-driven): **about 20-30 hours**
- Phase 12 Path B UX refactor: **about 30-40 hours**
- Phase H UNECE / ISO enrichment: **about 10-15 hours**
- Phase I breadth (I.1-I.6, 45 new rules + fuelType engine flag): **about 20-30 hours**
- Phase J (production readiness): **about 15-25 hours**
- Phase J human-review rounds 1-3: **about 5-8 hours**
- Phase K (K.1-K.4 UX + docs): **about 4-6 hours**

Cumulative roughly **200-300 hours** — one person, discontinuously, across several months. **Reminder again: session-estimated; exact hours not tracked**.

### 5.2 Per-rule unit economics

- **One SEED_UNVERIFIED → ACTIVE promotion (fast path):** URL verification about 10-15 minutes + metadata fill about 5 minutes ≈ **about 15-20 minutes per rule**. Assumes `sources[0]` candidate URL already present, `oj_reference` drafted, and rule scope already authored.
- **Complex rule (requiring split or re-authoring):** **about 1-2 hours per rule**. Example: `REG-MS-DE-009` needs to split into EU-TA + national small-series rules — predicted about 3-4 hours of architectural work.

### 5.3 Expansion cost curve

- **73 → 100 ACTIVE** (27 more promotions): estimated **about 9 hours** of pure human work (fast path).
- **100 → 150 ACTIVE** (50 more): estimated **about 20 hours**. Marginal cost rises — the remaining rules are the harder ones (pending delegated acts, multi-language national gazettes, complex authority chains).
- **Authoring a new member-state overlay from zero (DE-depth):** estimated **about 40-60 hours**. Includes legal-family scoping, 5-10 rule authoring, URL verification, pilot-fixture update, UI scope-banner update.

### 5.4 Long-term maintenance cost

- **Six-month freshness review cycle:** about 30 rules × 10 min ≈ **about 5 hours per cycle**. Assumes EUR-Lex drift-alert CI has surfaced the subset needing re-check; these 5 hours are human secondary confirmation.
- **Major EUR-Lex / UNECE change trigger** (e.g., Euro 7 implementing act release): **about 10-20 hours per event**. A handful of active rules need full re-authoring (split / re-scope) rather than URL refresh.

### 5.5 Commercialization unit economics (no specific pricing)

FTE ranges by path (headcount only, no currency figures):

1. **Research / open source / community:** 0 FTEs for commercialization. Sustained bandwidth depends on personal interest; long-term unsustainable.
2. **Consulting-embedded:** **1 OEM partner + 1 senior regulatory expert** can maintain and deepen (approx 0.5-1 FTE external expert + 1-2 tooling team). Contracts are retainer or project-based; specific billing models depend on OEM contract terms — out of scope for this document.
3. **SaaS subscription:** requires EUR-Lex sync automation, UI productization, onboarding flow — **minimum viable team ~3-6 FTEs for a year**. Coverage: 2 engineering (frontend + backend/automation) + 1 regulatory expert + 0.5 design + 0.5 go-to-market + residual management.

**Hard rule:** no `$/seat`, `€/month`, `¥/year` numbers anywhere in this section — no verifiable pricing data exists.

---

## Part 6 · Open risks, technical debt, what we would do differently

### 6.1 Open risks (not yet closed)

**Six risks still requiring ongoing attention:**

1. **NL coverage is still placeholder.** Five SEED_UNVERIFIED rules already authored (`REG-MS-NL-001..005`), but URL verification not complete. For projects entering NL market, the tool is unreliable; ScopeBanner discloses this explicitly.
2. **UNECE Annex II residual.** Forty-three PLACEHOLDER rules (outside the pilot-triggered set). Additions proceed pilot-driven, not batch-authored. If user config triggers one that's still PLACEHOLDER, the result is UNKNOWN — honest but not actionable.
3. **REG-MS-DE-009 KBA authority chain.** Phase J Round 1 already flagged: needs to split into two rules (EU-TA rule + national small-series rule). Currently conflated; evidence tasks aren't clean.
4. **ES CCAA sub-country variation.** Madrid / Catalonia / other CCAA differences in ZBE / tax / subsidy aren't in the schema (see §2.13); covered by the aggregate advisory `REG-MS-ES-014` telling users "this dimension isn't covered."
5. **Commission delegated acts pending.** Euro 7 battery durability (REG-EM-014) and BAT-010 recycled-content methodology — implementing acts not yet published; rules sit in "`applies_from_generic` + notes marked pending" state. Re-authoring required once published.
6. **Windsor Framework NI stays at DRAFT.** UK AV Act 2024 Secondary Instruments are rolling; Northern Ireland alignment with EU law is not yet finalized. The rule is explicitly DRAFT rather than a fake SEED_UNVERIFIED.

### 6.2 Structural technical debt

- **`src/registry/seed/member-state-overlay.ts` hit 2,692 lines**, past the 1,500-2,000 threshold from §2.11, approaching the point where splitting by country (`member-state-overlay-de.ts`, `-fr.ts`, `-nl.ts`, ...) becomes necessary.
- **`src/registry/seed/emissions-co2.ts` at 998 lines**, in the caution zone. If Euro 7 HD is authored later, it will exceed the threshold.
- **Two inconsistent factories.** `uneceRule` hard-locks lifecycle to SEED_UNVERIFIED; `makeSeedRule` does not. This inconsistency is a historical-evolution artifact; long-term it should converge to one factory or expose "lifecycle lock policy" as an explicit factory parameter.
- **Verification-backlog generation is manual-run** (`npm run verification-backlog`), not on the CI path. Therefore `docs/phase-j/verification-backlog.md` can occasionally drift.

### 6.3 Test debt

- **E2E (Playwright) only has scaffold** — no smoke suite. UI overhauls have no automated end-to-end detection.
- **UI regression relies on snapshots + per-component tests** with no cross-browser matrix (Chrome / Firefox / Safari / Edge).
- **Rule semantic correctness relies on pilot fixtures only** (BEV × DE, PHEV × DE·FR·NL, ICE × ES) — no formal verification of "does this rule's declarative trigger logic actually correspond to the cited article's scope." That layer was compensated by human review in Phase J rounds.

### 6.4 Process debt

- **Human-verification bandwidth is a permanent bottleneck.** Currently one reviewer (yanhao). `content_provenance.human_reviewer` is a single-string field (not a list), limiting parallelization.
- **EUR-Lex auto-monitoring is only CI drift-alert level**, not pushed down to rule level ("the HTML of this rule's URL changed" does not auto-flag the corresponding rule). Drift-alert fingerprints the fetched body hash, not fine-grained diff.
- **No release process or version numbers.** Commit = deploy; no semver, no changelog (beyond git log). Fine for a single-person project; becomes a problem for 2+ people.
- **Docs lag commits** as a habit. Before K.3 the README still said 187 rules (actual was 196); source-of-truth in `src/registry/` was already updated. Fix: a `README stats` generator script (not implemented).

### 6.5 What we would do differently

**Keep (core defenses unchanged):**

- **Hard-gate + `content_provenance` + pilot regression anchor** — these three are what holds the project together. No "do-over" changes them.
- **Four-layer architecture + pure-function evaluation** — §2.1's separation lets UX / engine / registry evolve without disturbing each other.

**What we would change:**

1. **Make `human_reviewer` a list of reviewer IDs, not a single string** — allows parallel verification and cross-checking across reviewers. The v1 schema went with single-string due to under-estimation of reviewer-bandwidth needs during Phase J.
2. **Split `lifecycle_state` ACTIVE into `ACTIVE_AUTOMATIC` vs `ACTIVE_HUMAN`** — EUR-Lex-scripted watch catching "URL still live, content hash unchanged" could auto-bump to `ACTIVE_AUTOMATIC` (meaning "source still live and not drifted"); only human-verified rules get `ACTIVE_HUMAN`. The current single-ACTIVE tier obscures this distinction.
3. **Introduce an evidence-pack export format earlier.** Current export is CSV + Markdown, inadequate as a TÜV audit pack. If Phase 5 had already produced a structured JSON + PDF-rendered evidence pack, Phase J human-review rounds might have been ~30% faster.
4. **The UX exec-summary layer should have been in Phase 0, not Phase K catch-up.** Status / Plan's 3-second exec blocks (K.2 `3afaf9a`) are management-critical, but they weren't added until Phase K. The reason is the initial default user was engineers; only later did we realize VP / domain-lead traffic is also large. Identifying audience heterogeneity earlier saves rewrite cost.

---

## Reader Navigation Map

Recommended reading paths by role:

| Role | Path | Estimated time |
|---|---|---|
| **New engineer (onboarding)** | Part 1 → Part 2 → Part 6.1 → Part 6.2 → Part 6.5 | 30-45 min |
| **Prospective OEM buyer** | Part 1 → Part 4 → Part 5 | about 10 min |
| **Investor** | Part 1 → Part 4.4 → Part 4.6 → Part 5.5 → Part 6.1 | about 15 min |
| **Technical interview showcase** | Part 1 → Part 2 → Part 3 | about 20 min |
| **Handoff (to next maintainer)** | Full read | 1-2 hours |

---

© Yanhao FU · 2026
