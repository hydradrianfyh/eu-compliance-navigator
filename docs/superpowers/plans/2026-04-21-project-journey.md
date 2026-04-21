# Project Journey Document — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `docs/PROJECT-JOURNEY.md` (zh, 8000-11000 字) + `docs/PROJECT-JOURNEY-EN.md` (en, 5500-7500 words), both following the approved spec structure (6 parts + navigation map, Part 2 expanded). Single commit, pushed to `origin/main`.

**Architecture:** Pure documentation task. Two files, mirror structure. Content sourced from spec, git log, existing docs (phase0/phase12/phase-j), and session memory. No code changes. 230 tests must stay green.

**Tech Stack:** Markdown files. No tools beyond Read / Write / Bash (git) / Grep. Optional: `wc -w` for word-count verification.

**Spec references:**
- `docs/superpowers/specs/2026-04-21-project-journey-design.md` (en)
- `docs/superpowers/specs/2026-04-21-project-journey-design-zh.md` (zh)
- Both at commit `5668a73` (approved)

---

## Execution order note

Spec §6.2 prescribes this draft order (lowest-hallucination-risk first, narrative last):
1. Source material inventory (Task 1)
2. Part 6 (risks/debt/would-differently) — most factual
3. Part 2 (Technical) — densest, heaviest, from code
4. Part 3 (Product/UX) — from Phase J K.1/K.2 + Phase 12
5. Part 4 (Business) — anti-hallucination pass required
6. Part 5 (Budget) — range estimation pass required
7. Part 1 (Opening) + navigation map (summarize everything else)
8. Cross-file mirror check
9. Verification
10. Commit + push

Each task produces its content in BOTH the zh file and the en file in one pass (so the two stay in sync instead of drifting). Don't draft all zh first then translate — author both simultaneously so terminology matches.

---

## Task 1: Collect source material

**Files:**
- Read: `docs/superpowers/specs/2026-04-21-project-journey-design-zh.md` (zh spec)
- Read: `docs/superpowers/specs/2026-04-21-project-journey-design.md` (en spec)
- Read: `README.md` (current stats + scope)
- Read: `docs/phase0/architecture.md` (baseline 4-layer architecture)
- Read: `docs/phase0/data-model.md` (schema decisions — temporal, trigger, owner_hint)
- Read: `docs/phase0/implementation-plan.md` (phase 1-9 context)
- Read: `docs/phase-j/README.md` (Phase J + human-review round 1-3 summary)
- Read: `docs/DEVELOPER.md` §16 (Phase timeline)
- Read: `docs/source-policy.md` (governance gate)

- [ ] **Step 1: Read all 9 files above and note key facts.** Specifically capture:
  - Current stats: `196 rules, 73 ACTIVE, 230 tests, 17 legal families` (from README stats block)
  - Phase timeline from DEVELOPER §16
  - Human-review round 1-3 outcomes from docs/phase-j/README.md
  - The 13 legal families from docs/phase0/data-model.md §1.3

- [ ] **Step 2: Collect phase-anchor commit SHAs via git log**

Run: `git log --oneline --all | grep -E "feat\\(phase-|docs\\(phase-|feat\\(human-|feat\\(k\\." | head -40`
Expected: list of ~30-40 commits. Capture at least these anchors:
  - `ff5f6de` (Phase I complete)
  - `54ee504` (Phase H complete)
  - `7850bf4` (K.4 Homologation Handbook shipped)
  - `cea18c1` (K.3 docs refresh)
  - `3afaf9a` (K.2 exec summaries)
  - `1bf6e79` (K.1 scope banner refresh)
  - `8fa919b` / `b8fdc7c` / `79e3574` / `d42ec2f` / `afc4f50` (Round 2a/2c/3-UK/3-FR/3-EU)
  - `379eb1a` / `b23ebfb` (Round 1 DE)
  - `1556ada` (Why-indicative UX)
  - `5668a73` (this spec)

- [ ] **Step 3: Save inventory as scratch notes**

Create `/tmp/journey-source-inventory.md` (not committed) with collected facts + SHAs, to reference across all subsequent tasks. Scratch file — will be deleted before commit.

No commit for this task.

---

## Task 2: Draft Part 6 (Risks + tech debt + would-do-differently)

Spec §3.1 Part 6 outline covers 6.1-6.5. Draft this first because it's the most factual (everything is observable current state, no hallucination risk).

**Files:**
- Create: `docs/PROJECT-JOURNEY.md` (start file, write Part 6 first — we'll reorder later)
- Create: `docs/PROJECT-JOURNEY-EN.md` (same)

- [ ] **Step 1: Create both files with preamble + placeholder table of contents**

Both files start with a standard preamble (version + audience + related-docs lines), then a `## 目录 / ## Table of Contents` section with 6 parts listed (empty stubs for Parts 1-5, Part 6 will be filled below). Match the preamble pattern from `docs/HOMOLOGATION-HANDBOOK.md` exactly — same version line style, same "related docs" style.

- [ ] **Step 2: Draft Part 6.1 — Open risks (仍未关闭的风险)**

Draw from spec §3.1 Part 6.1 outline. Concrete items to include:
- NL: 5 SEED_UNVERIFIED rules unauthored (REG-MS-NL-001..005)
- UNECE Annex II: ~43 PLACEHOLDER rules beyond pilot-triggered set
- REG-MS-DE-009 KBA statutory chain: needs split into EU-TA rule + national small-series rule
- ES CCAA sub-country variations: schema has no region field, aggregate advisory only (REG-MS-ES-014)
- Commission delegated acts pending: Euro 7 battery durability (REG-EM-014), BAT-010 recycled content methodology
- Plus one that spec doesn't mention explicitly: Windsor Framework NI rule is DRAFT because implementation SIs are rolling

Write 250-350 字 zh / 180-250 words en.

- [ ] **Step 3: Draft Part 6.2 — Structural tech debt**

- member-state-overlay.ts ~2400 lines (confirmed by `wc -l src/registry/seed/member-state-overlay.ts`)
- emissions-co2.ts ~960 lines
- Two factory patterns inconsistent: `uneceRule` hard-locks lifecycle to SEED_UNVERIFIED; `makeSeedRule` does not
- Verification backlog script is manual-run (`npm run verification-backlog`), not CI-integrated

Write 200-280 字 zh / 150-200 words en.

- [ ] **Step 4: Draft Part 6.3 — Test debt**

- E2E (Playwright) only scaffolded, no smoke suite
- UI regression via snapshot tests + per-component tests, no cross-browser matrix
- Rule semantic correctness only via pilot fixtures; no formal verification

Write 150-200 字 zh / 110-150 words en.

- [ ] **Step 5: Draft Part 6.4 — Process debt**

- Human verification bandwidth is a permanent bottleneck (1 reviewer: yanhao)
- EUR-Lex auto-monitoring only has CI drift-alert, not pushdown to rule level
- No release process or version number
- Docs lag commit (before K.3, README said 187 rules when registry was already 196)

Write 180-250 字 zh / 130-180 words en.

- [ ] **Step 6: Draft Part 6.5 — If we did it again**

Kept the same (hard-gate + content_provenance + pilot regression anchor = core defenses).
Would change:
- Make `human_reviewer` a list not single person → parallel verification
- Split lifecycle ACTIVE into ACTIVE_AUTOMATIC vs ACTIVE_HUMAN (EUR-Lex scripted vs human verified)
- Introduce evidence-pack export format (for TÜV audit pack) earlier
- UI exec-summary layer should have been Phase 0, not Phase K catch-up

Write 280-380 字 zh / 200-270 words en.

- [ ] **Step 7: Run wc check for Part 6**

Run: `wc -w docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: Part 6 alone should be ~1000 字 zh / ~700 words en. (Full files still short because Parts 1-5 are stubs.)

No commit yet. Continue with Task 3.

---

## Task 3: Draft Part 2 (Technical distillation — the heaviest part)

Spec §3.1 Part 2 lists 17 subsections (2.1-2.17). This task drafts all 17 in both files. Target: 3000-4000 字 zh / 2200-3000 words en.

**Files:**
- Modify: `docs/PROJECT-JOURNEY.md` (append Part 2 content)
- Modify: `docs/PROJECT-JOURNEY-EN.md` (append)

- [ ] **Step 1: Draft §2.1 — Four-layer architecture**

Content outline in spec §3.1 Part 2 subsection 2.1. Reference `docs/phase0/architecture.md` for the 4-layer diagram. Include:
- Why split (responsibility separation + testability + data-layer migratability)
- Strict boundaries per layer with concrete examples
- The reviewer one-liner: "UI is starting to compute — move it back to engine" (ref: Phase J.5 review, commit `2f95c4b`)
- Transferable list (permission engines, feature flags, expense approval, compliance scanning)

Write 200-300 字 zh / 150-220 words en.

- [ ] **Step 2: Draft §2.2 — Hard-gate principle**

Outline in spec. Include concrete code reference: `src/engine/evaluator.ts:113-121`. The transferable principle (data quality tier → output confidence).

Write 180-260 字 / 130-200 words.

- [ ] **Step 3: Draft §2.3 — Three load-bearing schema fields**

Sub-subsections 2.3.1 / 2.3.2 / 2.3.3 from spec. Especially emphasize the `manual_review_reason` insight — "users confused because they don't know why they don't know" — cite commit `1556ada` (K.0 UX work).

Write 280-380 字 / 200-280 words.

- [ ] **Step 4: Draft §2.4 — Factory patterns**

Outline in spec. Mention:
- Phase J.1 extension: UneceAuthored.evidenceTasks + manualReviewReason added (commit `c6ce6e7`)
- Phase I.3 extension: `offersPublicChargingInfra` added with `.optional().default(false)` (commit `47b51a3`)
- Backward-compat fix for offersPublicChargingInfra (commit `ff5f6de`)

Write 200-280 字 / 150-200 words.

- [ ] **Step 5: Draft §2.5 — Pilot fixture as regression anchor**

Outline in spec 5 subsections. Reference `fixtures/pilot-my2027-bev.ts` and `fixtures/pilot-my2027-bev.expected.ts`. Include the specific BEV applicable_rule_ids progression: 16 → 21 (Phase I) → 25 (Round 2c) → 30 (current).

Write 220-300 字 / 160-220 words.

- [ ] **Step 6: Draft §2.6 — Multi-layer anti-hallucination stack**

Spec has 8 sub-items (2.6.1-2.6.8). This is dense and important — give it 400-500 字 / 280-360 words. Include the concrete error-catching examples:
- StVZO §23 caught only by human verification (humans opened gesetze-im-internet.de)
- RD 559/2010 Industrial Registry mix-up caught by research agent (ES batch research, commit `cc55a82`)
- [verify] leaking to obligation_text caught by code reviewer (Round 2c code review)

- [ ] **Step 7: Draft §2.7 — Data-model key decisions**

4 subsections on temporal scope / trigger logic / owner_hint / related_rules. Reference docs/phase0/data-model.md for full detail.

Write 260-360 字 / 190-270 words.

- [ ] **Step 8: Draft §2.8 — Config-as-pure-input pattern**

Mention Phase I.1 five derived flags (commit `0dd20ca`). Reference `src/engine/config-builder.ts`.

Write 150-220 字 / 110-160 words.

- [ ] **Step 9: Draft §2.9 — ADR-H7 Euro 7 three-way split**

Reference `docs/adr/ADR-H7-euro-7-rule-split.md`. Briefly explain the three rules (REG-EM-001 framework / 013 combustion / 014 battery). Transferable principle.

Write 180-260 字 / 130-200 words.

- [ ] **Step 10: Draft §2.10 — Subagent-driven-development lessons**

5 sub-items in spec. Emphasize "disposable workers" pattern. Reference superpowers:subagent-driven-development skill if appropriate.

Write 220-300 字 / 160-220 words.

- [ ] **Step 11: Draft §2.11 — File organization (per-responsibility)**

Include the actual file layout from src/registry/seed/. Mention when to split (2400-line member-state-overlay.ts threshold example).

Write 180-260 字 / 130-200 words.

- [ ] **Step 12: Draft §2.12 — UI vs Engine language mapping**

Engine: ACTIVE/SEED_UNVERIFIED/DRAFT/PLACEHOLDER/ARCHIVED. UI: Verified/Indicative/Pending. TrustBadge component does the translation.

Write 120-180 字 / 90-130 words.

- [ ] **Step 13: Draft §2.13 — What to do when schema doesn't support X**

ES CCAA case: no region field. Solution: aggregate advisory rule REG-MS-ES-014. Transferable principle.

Write 140-200 字 / 100-150 words.

- [ ] **Step 14: Draft §2.14 — Evidence tasks must be actionable**

Contrast: ❌ "Ensure compliance with Art. 13" vs ✓ concrete deliverable. Reference REG-BAT-009 labeling + REG-MS-DE-010 AltfahrzeugV examples.

Write 150-220 字 / 110-160 words.

- [ ] **Step 15: Draft §2.15 — Three orthogonal trust axes (KEY INSIGHT)**

Trust / Applicability / Freshness = three independent dimensions. This section is marked in spec §8 DoD as "must have its own standalone section — highest transferability". Give it proper space: 300-400 字 / 220-300 words. This one could be the most reusable abstraction.

- [ ] **Step 16: Draft §2.16 — Aphorism catalog (17 principles)**

17 bullets, pluck-and-use one-liners. Copy verbatim from spec. Add 1-2 sentences of context per bullet. 500-700 字 / 360-500 words.

- [ ] **Step 17: Draft §2.17 — Rejected decisions (counter-examples)**

5 items from spec. Each gets one sentence explaining why rejected. Lesson: rejected decisions are more reference-valuable than adopted ones.

Write 220-300 字 / 160-220 words.

- [ ] **Step 18: wc check**

Run: `wc -w docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: Part 2 alone should be 3000-4000 字 zh / 2200-3000 words en. If below, expand sections that feel thin.

No commit yet.

---

## Task 4: Draft Part 3 (Product / UX decisions)

Spec §3.1 Part 3 outline. Target: 1200 字 zh / 850 words en.

**Files:**
- Modify: `docs/PROJECT-JOURNEY.md` (append Part 3)
- Modify: `docs/PROJECT-JOURNEY-EN.md`

- [ ] **Step 1: Draft §3.1 — Progressive disclosure principle**

Reference Phase K.2 exec summaries (commit `3afaf9a`). The 3-second grok / full-detail-below pattern.

Write 180-250 字 / 130-180 words.

- [ ] **Step 2: Draft §3.2 — Three-tier trust (Verified/Indicative/Pending)**

Reference TrustBadge component. Why 3-tier beats binary OK/not-OK.

Write 180-250 字 / 130-180 words.

- [ ] **Step 3: Draft §3.3 — "Why indicative only" callout story**

From K.0 (commit `1556ada`). The story of user confusion → schema field → UI surfacing. Reference 6 ES rules that gained manual_review_reason in K.0.

Write 200-280 字 / 140-200 words.

- [ ] **Step 4: Draft §3.4 — Five tabs hierarchy**

Setup (input) / Status (manager) / Plan (PM) / Rules (homologation engineer) / Coverage (governance). Each tab targets a different audience.

Write 250-350 字 / 180-260 words.

- [ ] **Step 5: Draft §3.5 — ScopeBanner 4-tier grouping**

Phase K.1 refresh (commit `1bf6e79`). Honest management communication vs marketing spin.

Write 180-250 字 / 130-180 words.

No commit yet.

---

## Task 5: Draft Part 4 (Business / market insights) — anti-hallucination pass required

Spec §3.1 Part 4 outline + spec §5 Anti-hallucination rule #2 (competitors / market). Target: 1500 字 zh / 1050 words en.

**Files:**
- Modify: both journey files.

- [ ] **Step 1: Draft §4.1 — Target users (Chinese OEMs)**

List concrete OEM names (NIO, BYD, Xpeng, Zeekr, Geely/Lynk&Co, Leapmotor, Chery, Great Wall/ORA, SAIC MG, Li Auto). Mention their EU progress only at high level ("several have active EU operations, several are pilot or entering"). No specific sales data.

Write 200-280 字 / 140-200 words.

- [ ] **Step 2: Draft §4.2 — Real pain points**

5 pain points from spec outline. Make concrete: language barrier (EU regulations in 24 languages), member-state authority list (KBA / VCA / UTAC / RDW / IDIADA). Reference HOMOLOGATION-HANDBOOK for operational detail rather than repeat.

Write 300-400 字 / 220-280 words.

- [ ] **Step 3: Draft §4.3 — Value proposition**

Three bullets from spec: not a lawyer replacement / daily workbench / "what do I do next week" not "what is this law". Cross-reference docs/HOMOLOGATION-HANDBOOK.

Write 200-280 字 / 140-200 words.

- [ ] **Step 4: Draft §4.4 — Competitive landscape (ANTI-HALLUCINATION CRITICAL)**

Only include CITEABLE public facts. Structure:
- "Consulting firms (TÜV Rheinland / SGS / UL / VDE) offer regulatory compliance consulting. Specific fee structures and engagement models not verified here." [No specific claims about their practices.]
- "Internal Excel + Confluence tracking" — self-evident, no source needed
- "Open-source rule libraries (EUR-Lex, UNECE WP.29 public documents)" — verifiable
- "This tool's position: between Excel (ephemeral) + consulting (expensive, episodic) — a persistent compliance workbench"

If any specific competitor claim is tempting, replace with "[not verified — would require competitive research]" or omit entirely. 宁缺毋滥.

Write 280-380 字 / 200-280 words.

- [ ] **Step 5: Draft §4.5 — Commercialization-path tradeoffs**

Three paths from spec: non-commercial / consulting-embedded / SaaS subscription. No specific pricing. Only human-hours ranges for maintenance + extension.

Write 220-300 字 / 160-220 words.

- [ ] **Step 6: Draft §4.6 — Moat + replication risk**

From spec: moat = human-verified rule registry (73 ACTIVE rules took real human review); replication risk = UI can be cloned in 6 months; real differentiator = ACTIVE rules + continuous freshness bandwidth. Be honest — don't claim proprietary algorithms we don't have.

Write 200-280 字 / 140-200 words.

- [ ] **Step 7: Grep check**

Run: `grep -n "TÜV Rheinland\|SGS\|UL\|Dekra\|IDIADA" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: any mention includes "per public information" or similar hedge, OR is mentioned only in lists of types (e.g., "consulting firms like TÜV Rheinland"). No specific business practice claim without source.

No commit yet.

---

## Task 6: Draft Part 5 (Budget / effort / ROI) — range estimation pass

Spec §3.1 Part 5 outline + spec §5 Anti-hallucination rule #1 (hours as ranges). Target: 1000 字 zh / 700 words en.

**Files:**
- Modify: both journey files.

- [ ] **Step 1: Draft §5.0 intro paragraph (disclaimer)**

Open Part 5 with: "以下工时均为基于 session 记录的粗略估算，并未做精确工时追踪。各阶段范围反映'工作规模'，不反映'精确投入'。" (or English equivalent). This disclaimer must appear BEFORE any number.

- [ ] **Step 2: Draft §5.1 — Per-phase hours (ranges only)**

Per spec outline. Each phase gets "约 N-M hours" + brief note. Example format:
- Phase 0 设计 baseline: 约 15-25 小时 (根据 docs/phase0/* 规模推断)
- Phase 1-9 scaffold → evidence: 约 80-120 小时
- Phase 11 (11A-E): 约 20-30 小时
- Phase 12 Path B UX refactor: 约 30-40 小时
- Phase H UNECE/ISO enrichment: 约 10-15 小时
- Phase I breadth (I.1-I.6, 45 new rules): 约 20-30 小时
- Phase J (production readiness): 约 15-25 小时
- Phase J human-review rounds 1-3: 约 5-8 小时
- Phase K (K.1-K.4 UX + docs): 约 4-6 小时

Total: ~200-300 hours cumulative.

Write 250-350 字 / 180-260 words including the table.

- [ ] **Step 3: Draft §5.2 — Per-rule unit economics**

From spec: 1 rule SEED → ACTIVE ≈ 15-20 min (fast path); complex rule ≈ 1-2 h.

Write 140-200 字 / 100-150 words.

- [ ] **Step 4: Draft §5.3 — Expansion cost curve**

From spec:
- 73 → 100 ACTIVE: ~9 hours
- 100 → 150 ACTIVE: ~20 hours (marginal cost rises)
- Authoring a new member-state overlay from scratch (DE-depth): ~40-60 hours

Write 180-260 字 / 130-200 words.

- [ ] **Step 5: Draft §5.4 — Maintenance cost (long-term)**

- 6-month freshness review: ~5 hours per cycle
- Major EUR-Lex change re-author trigger: 10-20 hours each

Write 120-180 字 / 90-130 words.

- [ ] **Step 6: Draft §5.5 — Commercialization unit economics (NO specific pricing)**

Three paths with human-hour estimates only:
- Research/OSS: 0 revenue, unsustainable long-term
- Consulting-embedded: 1 OEM partner + 1 senior regulatory expert can maintain + extend
- SaaS subscription: requires automation (EUR-Lex sync + UI polish), minimum viable ~3-6 FTE for 1 year

NO $/seat or €/month numbers. Only FTE and hour counts.

Write 220-300 字 / 160-220 words.

- [ ] **Step 7: Grep check**

Run: `grep -nE "\\$[0-9]|€[0-9]|¥[0-9]" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: ZERO matches (no specific currency amounts).

Run: `grep -n "\\[verify\\]" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: at most 0-2 markers, and only in appendix or footnote if any. NOT in main prose.

No commit yet.

---

## Task 7: Draft Part 1 (Opening narrative) + navigation map

Writes last because it summarizes everything else. Target: 500-700 字 zh / 350-500 words en for narrative; ~100 字 / 70 words for navigation map.

**Files:**
- Modify: both journey files. Insert Part 1 at the top (after table of contents).

- [ ] **Step 1: Draft Part 1 — Opening narrative**

Structure:
- 起点 (2-3 sentences): Phase 0 baseline — 13 legal families taxonomy, 34 seed rules, 4-layer architecture designed
- 关键转折 (4-5 bullets): Phase 11 shift to pilot-driven / Phase I breadth + engine flags / Phase J human-review rounds / Phase K management-friendly UX + this doc
- 当前 (2-3 sentences): 73 ACTIVE / 196 rules / 230 tests / DE+UK production-grade / ES+FR indicative
- 下一步 (2 sentences): NL batch / UNECE Annex II / Phase L new features

Target: anyone reading just Part 1 understands "what / where are we / where are we going" in 1 page.

Write 500-700 字 / 350-500 words.

- [ ] **Step 2: Draft navigation map (end-of-file)**

Append to end of each file. Table mapping reader persona → sections:

```
新工程师 (onboarding): Part 1 → Part 2 → Part 6.1 → Part 6.2 → Part 6.5
潜在 OEM buyer:        Part 1 → Part 4 → Part 5 (约 10 分钟)
投资人:                Part 1 → Part 4.4 → Part 4.6 → Part 5.5 → Part 6.1
技术面试展示:          Part 1 → Part 2 → Part 3
交接 (我 → 下一任 maintainer): 全读
```

- [ ] **Step 3: Update table of contents**

Fix the `## 目录 / ## Table of Contents` near top of each file so all 6 Parts are present (replacing any stubs) + "Reader Navigation Map" as the last entry.

No commit yet.

---

## Task 8: Cross-file mirror + consistency check

Both files must have the same 6 parts, same terminology, same commit SHA references. Target: zero drift between zh and en.

**Files:**
- Modify: both files (corrections only, no new content)

- [ ] **Step 1: Structural diff**

Run: `grep -nE "^## " docs/PROJECT-JOURNEY.md > /tmp/zh-toc.txt && grep -nE "^## " docs/PROJECT-JOURNEY-EN.md > /tmp/en-toc.txt && diff -u /tmp/zh-toc.txt /tmp/en-toc.txt`
Expected: same number of Part / subsection headings. If zh has a subsection en doesn't (or vice versa), add to the missing side.

- [ ] **Step 2: Commit SHA consistency**

Run: `grep -oE "\`[0-9a-f]{7}\`" docs/PROJECT-JOURNEY.md | sort -u > /tmp/zh-shas.txt && grep -oE "\`[0-9a-f]{7}\`" docs/PROJECT-JOURNEY-EN.md | sort -u > /tmp/en-shas.txt && diff /tmp/zh-shas.txt /tmp/en-shas.txt`
Expected: both files cite the same set of commit SHAs.

- [ ] **Step 3: Stats consistency**

Both files must say "196 rules", "73 ACTIVE", "230 tests". Run:
`grep -n "196\|73 ACTIVE\|230 tests" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Confirm consistency. Fix any stale numbers.

- [ ] **Step 4: Terminology alignment**

Both files should use the same UI terms:
- "Verified / Indicative / Pending" (not "trusted / maybe / blank")
- "APPLICABLE / CONDITIONAL / FUTURE / NOT_APPLICABLE / UNKNOWN" (engine enum)
- "lifecycle_state" (code term, stays in code formatting)

Grep each for variants; if alternatives used in one file but not the other, align.

No commit yet.

---

## Task 9: Verification + DoD check

Spec §8 DoD items. Go through each.

**Files:**
- Read: both journey files for final review.

- [ ] **Step 1: Word counts per file + per section**

Run: `wc -w docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected:
- zh: 8000-11000 字
- en: 5500-7500 words

If below, identify which Part is thin and expand. If massively above (more than 15% over), consider trimming non-essential prose.

Also verify Part 2 specifically: extract Part 2 content with sed and count.
Target: 3000-4000 字 zh / 2200-3000 words en for Part 2 alone.

- [ ] **Step 2: [verify] marker check**

Run: `grep -nE "\\[verify\\]" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: zero matches in main prose. If any appear, they must be in an explicit appendix or footnote clearly marked as such.

- [ ] **Step 3: Competitor fabrication check**

Run: `grep -nEi "TÜV|SGS|UL |Dekra|IDIADA|RDW|VCA|KBA|UTAC" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
For each match, verify it's either (a) listing a type of organization, (b) mentioning an authority without specific business claim, or (c) in a documented context with source. No "TÜV charges X" style claims.

- [ ] **Step 4: Budget number hedge check**

Run: `grep -nE "[0-9]+\s*(小时|hours?)" docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md`
Expected: every hour number is either (a) in a range ("20-30 hours"), (b) qualified with "约/approximately/estimated", or (c) inside the §5.0 disclaimer paragraph. No naked "Phase X took 27 hours" claims.

- [ ] **Step 5: Cross-reference hygiene**

Each Part should have at least one cross-reference to an existing doc. Run: `grep -nE "\\[.+\\]\\(\\./" docs/PROJECT-JOURNEY.md` and confirm links to README, USER-GUIDE, DEVELOPER, HOMOLOGATION-HANDBOOK, docs/phase0, docs/phase-j are present where natural.

- [ ] **Step 6: Gates (should be trivially green; documentation only)**

Run:
```bash
npx tsc --noEmit
npm run lint
npx vitest run
```
All three should pass. If tests fail, a snapshot must have drifted unrelated to this work — stash the journey files, verify prior main state, re-apply. Any test failure blocks the commit.

- [ ] **Step 7: Clean up scratch files**

Delete `/tmp/journey-source-inventory.md` (if created in Task 1) and any other /tmp files.

No commit yet.

---

## Task 10: Commit + push

**Files:**
- Commit: both journey files.

- [ ] **Step 1: Stage files**

```bash
git add docs/PROJECT-JOURNEY.md docs/PROJECT-JOURNEY-EN.md
```

- [ ] **Step 2: Commit with clear message**

```bash
git commit -m "$(cat <<'EOF'
docs: project journey retrospective (zh + en)

Dual-use reference doc per approved spec (5668a73):
- Internal retrospective for future-self / new team members
- External-facing narrative for stakeholders / OEM prospects / investors

Six parts + navigation map in both files:
1. Opening narrative (500-700 字 / 350-500 words)
2. Technical distillation (3000-4000 字 / 2200-3000 words) — 17
   subsections covering architecture, hard-gate, load-bearing schema
   fields, factory patterns, regression anchor, multi-layer anti-
   hallucination stack, data-model decisions, rule splitting (ADR-H7),
   subagent-driven lessons, file org, UI/engine language mapping,
   schema-boundary-acknowledgment, actionable evidence tasks,
   three-axis trust insight, 17-aphorism catalog, rejected decisions
3. Product/UX decisions — progressive disclosure, 3-tier trust,
   Why-indicative callout story, five-tab hierarchy, ScopeBanner
4. Business/market insights — target users, pain points, value prop,
   competitive landscape (anti-hallucination pass), commercialization
   tradeoffs, moat + replication risk
5. Budget/effort/ROI — per-phase hour ranges (session-estimated),
   per-rule unit economics, expansion cost curve, maintenance cost,
   commercialization unit economics (no specific pricing)
6. Open risks + structural/test/process debt + would-do-differently

zh primary: 8000-11000 字. en companion: 5500-7500 words.

Cross-references to README, USER-GUIDE, DEVELOPER, HOMOLOGATION-HANDBOOK,
docs/phase0, docs/phase-j throughout. Navigation map at end of each
file maps reader persona → recommended sections.

Anti-hallucination guardrails applied per spec §5: hour ranges with
session-estimated disclaimer; no fabricated competitor business
practices; no specific pricing forecasts; [verify] markers absent
from main prose.

Zero code changes. 230 tests green.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected output: commit created on main, two files changed.

- [ ] **Step 3: Push to origin**

```bash
git push origin main
```

Expected output: `main -> main` confirmation.

---

## Self-review

**Spec coverage check:** Every spec §3.1 outline item has a task:
- Part 1 → Task 7 ✓
- Part 2 (17 subsections) → Task 3 (17 steps) ✓
- Part 3 (5 subsections) → Task 4 (5 steps) ✓
- Part 4 (6 subsections) → Task 5 (6 steps + grep check) ✓
- Part 5 (5 subsections + disclaimer) → Task 6 (7 steps) ✓
- Part 6 (5 subsections) → Task 2 (6 steps) ✓
- Navigation map → Task 7 Step 2 ✓
- Spec §5 anti-hallucination rules → Task 5 Step 7 + Task 6 Step 7 + Task 9 Steps 2/3/4 ✓
- Spec §8 DoD → Task 9 (all 7 steps map to DoD items) ✓

**Placeholder scan:** No TBD / TODO in plan. Every task step has concrete action.

**Type consistency:** File paths consistent throughout (`docs/PROJECT-JOURNEY.md` + `docs/PROJECT-JOURNEY-EN.md`). Commit message in Task 10 Step 2 references spec commit `5668a73` correctly.

Plan looks clean. Ready for execution.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-project-journey.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent for the whole job (it's one coherent documentation task, not 10 independent features). Single dispatch with the plan + spec as context. Subagent does Tasks 1-10 sequentially, reports back with commit SHA.

**2. Inline Execution** — I execute the 10 tasks directly in this session. Takes longer but full visibility per step.

**Which approach?**
