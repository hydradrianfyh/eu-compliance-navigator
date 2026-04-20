# Docs Overhaul — Design Spec

**Date**: 2026-04-19
**Status**: Approved (brainstorming gate passed)
**Author**: © Yanhao FU
**Origin**: brainstorming skill dialogue (4 decision gates passed)

---

## 0. Origin & scope

The current [README.md](../../../README.md) is a Phase 11 artifact that:

- advertises outdated counts ("35 seed rules across 13 legal families"; actual: 137 rules / 17 families)
- predates the Phase 12 Path B shell (5-tab workspace: Setup / Status / Plan / Rules / Coverage)
- has no coverage of `ScopeBanner`, `content_provenance`, `SHADOW` lifecycle state, `drifted` freshness state, demo scripts, or ADRs
- mixes developer concerns with end-user concerns in one long document
- gives stakeholders (homologation, domain leaders, management) no usable starting point

This spec fixes those problems by **splitting the documentation into three files** and adding **per-field usage instructions** so every target user can understand and use the tool.

The user approved **Phase 1 (Y) → Phase 2 (X)** sequencing via the brainstorming dialogue:

- Phase 1: Chinese USER-GUIDE + English README + English DEVELOPER + 5 screenshots
- Phase 2 (later): Add English USER-GUIDE-EN.md as a translated & condensed variant

---

## 1. Deliverables

### Phase 1 · 5-6 days (ship first)

| File | Language | Rough size | Purpose |
|---|---|---|---|
| `README.md` | English | ~250 lines | GitHub landing page. 5-minute overview, links to all depth docs. |
| `docs/USER-GUIDE.md` | **Chinese** | ~2500 lines | Task-oriented business-user guide with full field reference. |
| `docs/DEVELOPER.md` | English | ~900 lines | Architecture, code layout, contribution guide. |
| `docs/screenshots/*.png` | — | 5 images | Setup · Status hero · Plan timeline · Rules tri-layer · RuleCardV2 expanded |

### Phase 2 · ~3 days (after Phase 1 lands + independent user testing)

| New file | Notes |
|---|---|
| `docs/USER-GUIDE-EN.md` | Translation of the Chinese guide with depth reduced one notch (6-item field explanations collapsed to 4-item). |

README.md gets a small **Language** section in Phase 2 linking to both variants.

---

## 2. README.md new skeleton (replaces the existing 617-line version)

```markdown
# EU Compliance Navigator

A config-driven compliance workbench for EU vehicle programs.
Status: Phase 12 Path B shipped · 204 tests · DE demo live.

⚠ Not legal advice. See [Disclaimer](#disclaimer).

---

## What you want to do

- 👤 Business users (homologation, leaders, management)
  → [docs/USER-GUIDE.md](docs/USER-GUIDE.md) (中文) — 5-minute demo + full field reference
- 🛠 Developers (contribute, integrate, extend)
  → [docs/DEVELOPER.md](docs/DEVELOPER.md)
- 🎬 Just want to see it
  → npm install && npm run dev → http://localhost:3000
  → Click ⚙ → "Load MY2027 BEV sample"

---

## 30-second tour (for reviewers)

[3 screenshots side-by-side: Setup · Status · Plan]

Configure a vehicle program → see which EU rules apply → drill into
evidence requirements → export for stakeholders.

---

## Architecture snapshot

[layered diagram: UI / Engine / Registry / Config]

137 rules · 17 legal families · 6 lifecycle states · 6 freshness states
DE overlay 5 ACTIVE · FR/NL pending Phase 13+ · 13 non-goals honored.

---

## Scope (and what's out)

[condensed ScopeBanner content]

---

## Quick links

- [Spec](docs/phase12/ux-refactor-spec-v2.md)
- [ADRs](docs/adr/)
- [Sprint 10 Go/No-Go](docs/phase12/sprint-10-go-no-go.md)
- [Stakeholder demo scripts](docs/phase12/demo-scripts/)

## Tech stack

Next.js 16 · React 19 · TypeScript 6 · zustand · Tailwind · vitest · Playwright

## Disclaimer

[existing disclaimer text]

## License / Attribution

© Yanhao FU
```

**Dropped from README**:

- 27-item TOC (too long; replaced by "What you want to do" triage)
- "Configuration panel — every field explained" (moved to USER-GUIDE §2)
- "Applicability results / Lifecycle states" (moved to USER-GUIDE Appendix B glossary)
- "Implemented phases" (will become CHANGELOG.md later)
- "Intentionally out of scope" (replaced by link to spec + ScopeBanner summary)

---

## 3. USER-GUIDE.md outline (Chinese, task-organized)

```
前言：本指南给谁看？
    · Homologation / Regulatory lead
    · Domain team leader
    · 管理层 / 决策人

第一部分 · 3 分钟快速上手
    1.1 打开页面 · 加载 sample
    1.2 看 Status tab 判断项目状态
    1.3 切到 Plan tab 看本月任务
    1.4 深入 Rules tab 查特定规则

第二部分 · 任务 1 · 配置项目（Setup tab）
    2.1 何时打开这个 tab
    2.2 必填 vs 选填
    2.3 Program & Market
    2.4 Homologation Basis
    2.5 Propulsion & Energy
    2.6 ADAS & Automated Driving
    2.7 Digital & Cockpit
    2.8 Readiness
    2.9 Advanced Vehicle Systems (折叠区)
    2.10 Setup progress 完整度条
    2.11 Load sample 的用法

第三部分 · 任务 2 · 看项目能不能进市场（Status tab）
    3.1 四档判定：LIKELY OK / OK WITH CAVEATS / AT RISK / INDETERMINATE
    3.2 Confidence 计算
    3.3 四个 metric cards
    3.4 Top blockers
    3.5 Top deadlines
    3.6 Countries at risk
    3.7 Generated at 时间戳

第四部分 · 任务 3 · 看什么时候做什么（Plan tab）
    4.1 SOP-anchored 时间分段
    4.2 每个 milestone 的 3 列
    4.3 Owner Dashboard 的 bucket
    4.4 blocked_count
    4.5 点击 rule 跳到 Rules tab 深链

第五部分 · 任务 4 · 查特定法规的细节（Rules tab）
    5.1 三分层：Verified / Indicative / Pending / Needs your input
    5.2 FilterBar 的使用
    5.3 打开 RuleCardV2 看什么
         5.3.1 Summary
         5.3.2 Why it applies
         5.3.3 What to do
         5.3.4 Reference
         5.3.5 My tracking
    5.4 Plain ↔ Engineering 切换
    5.5 "Needs your input" 的处理
    5.6 related_rules 深链
    5.7 prerequisite_standards

第六部分 · 任务 5 · 看治理与覆盖（Coverage tab）
    6.1 Lifecycle / Freshness 分布
    6.2 Domain × Process coverage matrix
    6.3 Member-state chips
    6.4 Verification Queue
    6.5 Promotion Log

第七部分 · 任务 6 · 导出与分享
    7.1 URL 分享
    7.2 JSON / CSV 导出
    7.3 Export as PDF
    7.4 发给 stakeholder 的姿势

第八部分 · 常见问题 (FAQ)
    8.1 UNKNOWN 是什么意思
    8.2 Source not verified 怎么办
    8.3 Applies from 2027-08-02 是什么
    8.4 FR/NL overlay pending 是什么
    8.5 Drifted freshness 什么时候出现
    8.6 SHADOW lifecycle 是什么

第九部分 · 三类 stakeholder 的日常路径
    9.1 Homologation lead
    9.2 Team leader
    9.3 管理层 3 分钟扫视

附录 A · 字段快速索引（字母序）
附录 B · 术语表（与 GlossaryModal 保持一致）
附录 C · 不在本工具范围的问题（13 non-goals 人话版）
```

### Field-explanation depth (Part 2 key contract)

Every field in Part 2 gets **6 items**:

1. 字段名（中 + 英 code name）
2. 作用（一句话说明）
3. 何时填（前置条件 / 项目阶段）
4. 示例值（至少 1 个真实的 pilot 值）
5. 常见错误（新人易错点）
6. 影响哪些规则触发（rule_id 列表或"触发 R155 的 connectivity 条件"之类）

Field count estimate: 37 fields across 6 primary sections + 6 advanced sub-forms ≈ **~2500 lines of Part 2 alone**.

---

## 4. DEVELOPER.md outline (English)

```
1. Getting started (5 min dev setup)
2. Architecture
   - Layered diagram
   - Key principle: UI never computes applicability
3. Repo structure (annotated tree)
4. Rule authoring
   - Schema reference
   - CSV DSL (content/authoring.csv)
   - Shadow mode workflow
5. Content quality gates
   - Golden dataset + CI regression
   - Drift alert
   - EUR-Lex watcher
6. Testing
   - Unit · UI · Regression · E2E
   - How to add a test
7. State management (zustand store)
8. Design system (tokens, badges)
9. Reusable layer seams (ref ADR-P6)
10. How to contribute a new rule
11. How to add a new member-state overlay
12. Release process
13. Known limitations / tech debt
14. Phase 13+ roadmap
```

---

## 5. Screenshot capture list

| # | Page | Used in | Capture requirement |
|---|---|---|---|
| 1 | Setup (MY2027 BEV sample loaded) | README 30-sec tour + USER-GUIDE §2 | scrolled to top, 6 primary sections visible |
| 2 | Status hero (LIKELY OK · Confidence medium) | README + USER-GUIDE §3 | medium confidence most instructive (not OK, not risk) |
| 3 | Plan timeline (SOP-anchored segments) | README + USER-GUIDE §4 | at least 3 segments visible + Owner Dashboard on the right |
| 4 | Rules tri-layer (Verified/Indicative/Pending) | USER-GUIDE §5 | all three layers populated |
| 5 | RuleCardV2 expanded (REG-CS-001 Plain view) | USER-GUIDE §5.3 | all 5 sections visible including provenance |

**Capture standards**:

- Browser viewport width 1440px
- Single color scheme (light mode)
- No PII (reviewer_identity field empty or "homologation lead" role)
- PNG format
- File naming: `docs/screenshots/01-setup.png` ... `05-rulecard-expanded.png`

---

## 6. Content sync strategy

| Change | Required docs action |
|---|---|
| Schema adds a field | DEVELOPER.md "Rule authoring"; if user-visible, USER-GUIDE Part 2 also |
| UI copy change | USER-GUIDE relevant section; screenshots only if the user action path changed |
| New rule | No doc change (field explanations are generic) |
| New ADR | README "Quick links" if significant |

**Future automation** (Phase 13 ticket): `.github/workflows/docs-stale-check.yml` — warn if `src/config/schema.ts` changed but `docs/USER-GUIDE.md` didn't in the same PR (warning only, not blocking).

---

## 7. Acceptance criteria

### Phase 1 (Y) acceptance

- ✅ README.md renders cleanly on GitHub; every link resolves
- ✅ USER-GUIDE.md: a non-author Chinese-native reader (with basic automotive-compliance vocabulary) can read any task chapter and complete the matching UI action without help
- ✅ DEVELOPER.md: a new engineer can read it in ≤30 minutes and then `git clone` + `npm test` successfully
- ✅ All 5 screenshots committed under `docs/screenshots/`
- ✅ Appendix A field index has zero missing fields (cross-check against `src/config/schema.ts` + `src/registry/schema.ts`)
- ✅ Appendix B glossary wording matches `GlossaryModal` UI content exactly (prevents UI/doc drift)

### Phase 2 (X) acceptance

- ✅ USER-GUIDE-EN.md exists with 4-item field explanations
- ✅ README.md has a Language section linking to both variants
- ✅ Chapter structure identical between zh and en versions (for parallel reading)

---

## 8. Execution schedule

| Step | Owner | Output |
|---|---|---|
| 0 | User | Approves this spec |
| 1 | Agent | Writes this spec to `docs/superpowers/specs/` (**DONE**) |
| 2 | User | Reviews this spec file |
| 3 | Agent | Phase 1 Y implementation (5-6 days) |
| 4 | User | Captures 5 screenshots (day 1 of Phase 1 ideally) |
| 5 | User | Reviews draft README + USER-GUIDE + DEVELOPER |
| 6 | Agent | Revises + commits Phase 1 |
| 7 | User | Independent Chinese-reader acceptance test |
| 8 | Agent | Phase 2 X implementation (~3 days) |
| 9 | User | Reviews + commits Phase 2 |

---

## 9. Out of scope (explicit rejections during brainstorming)

- ❌ Complete ADR narrative inside docs (ADRs stay in `docs/adr/`, only linked)
- ❌ Full TypeScript API reference (tsdoc-generated is future work)
- ❌ Tutorial video / GIF animations (Phase 14+)
- ❌ i18n beyond zh/en (no FR/DE docs)
- ❌ Interactive docs site (Docusaurus / GitBook / etc.) — plain markdown
- ❌ Auto-generated screenshots via Playwright (manual capture for now)

---

## 10. Self-review (brainstorming skill § Spec Self-Review)

1. **Placeholder scan**: No TBD / TODO markers. Every `[placeholder]` in the README skeleton is intentional (indicates where real content will be inserted during Phase 1).
2. **Internal consistency**: Field count (~37) / section count / line count estimates cross-check across §1, §3, §5, §7.
3. **Scope check**: Split into 2 phases with explicit sequencing; Phase 1 alone is a single coherent deliverable, not pre-requisite-bundled to Phase 2.
4. **Ambiguity check**:
   - "Field-explanation depth" quantified to 6 items (not "detailed").
   - "Business users" enumerated to 3 roles (not "stakeholders").
   - "Non-author Chinese-native reader" is a specific test subject, not "end user".

Issues found: none blocking. Moving to user review gate.

---

## 11. Links

- Existing [README.md](../../../README.md) (to be replaced)
- [Phase 12 spec](../../phase12/ux-refactor-spec-v2.md) (source-of-truth for product definition; this spec must not contradict it)
- [ADR-P6 Reusable layer seams](../../adr/ADR-P6-reusable-layer-seams.md) (DEVELOPER.md §9 references this)
- [Stakeholder demo scripts](../../phase12/demo-scripts/) (Part 1 in USER-GUIDE adapts these into Chinese)
- [Sprint 10 Go/No-Go](../../phase12/sprint-10-go-no-go.md) (status reference for README snapshot)

---

© Yanhao FU · 2026-04-19
