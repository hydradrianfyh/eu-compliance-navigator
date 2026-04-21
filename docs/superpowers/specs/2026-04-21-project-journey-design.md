# Project Journey Document — Design Spec

**Date:** 2026-04-21
**Author:** © Yanhao FU (brainstormed with Claude)
**Status:** Approved — ready for writing-plans
**Branch:** main

---

## 1. Goal

Produce a **dual-use retrospective reference document** at `docs/PROJECT-JOURNEY.md` (中文 primary) + `docs/PROJECT-JOURNEY-EN.md` (English companion) that captures the useful + potentially-useful information from building the EU Vehicle Compliance Navigator, organized by **theme (not chronology)**.

**Dual-use = two reader personas served in one file**:

1. **Future self / new team member** reads the Technical + Process + Open-risks sections to continue the project without re-discovery cost.
2. **Stakeholder / prospect OEM / potential partner** reads the Opening + Product + Business + Budget sections to understand the bet and its value in 20 minutes.

The file structure lets either reader skip to their sections without reading the whole thing.

---

## 2. Why this document

Every non-trivial project accumulates **structural knowledge** that lives in the committers' heads and in scattered commit messages / ADRs / phase plans. When a project transitions hands (new engineer, handoff to partner, acquisition conversation, investor pitch), that knowledge evaporates.

The retrospective docs already in `docs/` address specific angles:
- `README.md` — marketing-style summary + stats
- `USER-GUIDE*.md` — user reference (field-level)
- `DEVELOPER.md` — code architecture reference
- `HOMOLOGATION-HANDBOOK*.md` — operational manual (homologation engineer workflow)
- `docs/phase0/*` — baseline architecture decisions
- `docs/phase12/*`, `docs/phase-j/*` — phase-specific notes

**What's missing**: a single **cross-phase, cross-dimension** document that captures *why we made the decisions we made*, *what didn't work*, *what the reusable artifacts are*, and *where the project actually stands from business + technical perspectives*.

This document fills that gap.

---

## 3. File structure

Two files, mirror structure.

### 3.1 `docs/PROJECT-JOURNEY.md` (中文 primary, ~6000-8000 字)

Six parts + navigation map:

```
Part 1 — 开场叙事 (500-700 字)
  "从 0 到 73 ACTIVE" 的紧凑故事：
  - 起点：13 legal families taxonomy + 34 seed rules (Phase 0)
  - 关键转折：
    * Phase 11: pilot-driven work guidance shifted the tool from "rule catalog" to "SOP-anchored workbench"
    * Phase I breadth + ICE/PHEV engine flags broke the BEV-only bias
    * Phase J human-review rounds converted 39 rules from SEED to ACTIVE
    * Phase K delivered management-friendly UX + this doc
  - 当前：73 ACTIVE / 196 rules / 230 tests / DE + UK production-grade
  - 下一步：NL batch / UNECE Annex II / Phase L features
  目标：任何读者读这 1 页后知道整个项目 "是什么 / 做到哪了 / 要去哪"。

Part 2 — 技术沉淀 (Technical; ~1500 字)
  2.1 架构四层 (UI / Evaluation / Registry / Configuration) — 为什么这样分
  2.2 Hard-gate 原则：非 ACTIVE rules 不能返回 APPLICABLE — 保护用户不被噪音误导
  2.3 Load-bearing schema fields:
      - lifecycle_state — governance 的唯一真相
      - content_provenance — 反幻觉的基础 (human_reviewer: null = not trusted yet)
      - manual_review_reason — 承认不确定性，surfacing 在 UI
  2.4 Factory patterns: makeSeedRule + uneceRule — 为什么工厂锁 lifecycle
  2.5 Pilot fixture 作为 regression anchor — applicable_rule_ids "可增不可减" 原则
  2.6 反幻觉栈：
      - [verify] markers confined to notes/manual_review_reason
      - source-policy.md 的 3-field ACTIVE gate
      - Research agent parallel dispatch 作为防编造机制
      - 人工核验轮 catches real errors (StVZO §23 例)

Part 3 — 产品 / UX 决策 (Product; ~1200 字)
  3.1 Progressive disclosure 原则 — 管理层 3 秒 / 工程师深挖
  3.2 三层信任 (Verified / Indicative / Pending) — 为什么比二元 OK/not-OK 更诚实
  3.3 "Why indicative only" callout — K.0 的故事：从用户困惑到 schema 字段显式化
  3.4 五个标签页的分层:
      - Setup: 配置输入
      - Status: 管理层主要落点
      - Plan: 项目经理落点
      - Rules: homologation 工程师落点
      - Coverage: 治理 + 验证队列
  3.5 ScopeBanner 四层分组 — 对管理层说真话

Part 4 — 商业 / 市场 insights (Business; ~1500 字)
  4.1 目标用户：中国 OEM 进欧洲（具体厂商列表 + 他们的 EU 进度阶段）
  4.2 真正的痛点:
      - 法规不透明 (语言 + 数量 + 变化速度)
      - 成员国差异 (DE KBA vs UK VCA vs FR UTAC vs RDW NL vs IDIADA ES)
      - 审计证据链 (KBA / TÜV / UTAC 来问，需要 SOP-anchored 证据)
      - 软件/OTA lifecycle (CSMS + SUMS 每次更新都要管)
      - 横向法规急加速 (AI Act / Battery Reg / Data Act / Euro 7 连续)
  4.3 工具的价值主张：
      - 不是替代律师
      - 是 homologation team 的 "日常工作台"
      - 解决的是 "我下周要做什么" 而非 "这个法律是什么"
  4.4 竞争格局：
      - 咨询公司 (TÜV Rheinland / SGS / UL) — 公开信息，凡超出需要 [verify]
      - 内部 Excel + 团队 Confluence
      - 开源规则库 (如 EC Lex, UNECE WP.29 web)
      - 这个工具的位置：在 Excel + 咨询 之间，一个可持久化的 compliance workbench
  4.5 非商业化路径 vs 商业化路径 tradeoffs (不给具体定价)
  4.6 护城河 + 可复制风险:
      - 护城河：human-verified rule registry 是真正的难复制资产
      - 可复制风险：一个工程师花 6 个月可以 clone UI；但复制不了 73 条 ACTIVE 的 verification work
      - 真正的差异化：ACTIVE rules + 持续 freshness review 的 bandwidth

Part 5 — 预算 / 投入 / ROI (Budget; ~1000 字)
  只用范围 + 明说 "基于 session 记录估算"；不编造精确数字
  5.1 实际投入按 phase 粗略:
      - Phase 0 设计 baseline: 估 15-25h (根据 docs/phase0/* 范围)
      - Phase 1-9 scaffold → evidence: 估 80-120h (根据 docs/phase12 注释推断)
      - Phase 11 (11A-E): 估 20-30h
      - Phase 12 Path B UX refactor: 估 30-40h
      - Phase H UNECE/ISO enrichment: 估 10-15h
      - Phase I breadth (I.1-I.6, 45 新 rules): 估 20-30h
      - Phase J (production readiness): 估 15-25h
      - Phase J human-review rounds 1-3: 估 5-8h
      - Phase K (K.1-K.4 UX + docs): 估 4-6h
      明说："以上为 session 记录估算，非精确工时。"
  5.2 单位经济 (per-rule):
      - 1 条 SEED → ACTIVE 升级 ≈ 10-15 min URL 核验 + 5 min 元数据填写 = 约 15-20 min/条 (精简路径)
      - 复杂规则 (需要拆分或重新 author) ≈ 1-2 h/条
  5.3 扩展成本曲线:
      - 73 → 100 ACTIVE: 估 27 × 20 min = 约 9 hours 人工
      - 100 → 150 ACTIVE: 估 50 × 25 min = 约 20 hours (边际成本升高，剩下的都是难的)
      - 从 0 新 author 一个 member-state overlay (DE 档位): 估 40-60 hours
  5.4 维护成本 (长期):
      - 6 个月一轮 freshness review: 估 30 rules × 10 min = 5 hours
      - EUR-Lex / UNECE 重大变更触发: 估每次 10-20 hours (个别鲜活规则需要全重 author)
  5.5 商业化假设下的 unit economics (粗估 ranges 不给具体定价):
      - 研究 / 开源 / 社区: 零 revenue，persona = 爱好者 + 学术 (不现实长期)
      - 咨询嵌入: 1 OEM partner + 1 senior regulatory expert 可以维护 + 深化
      - SaaS 订阅: 需要自动化 (EUR-Lex 同步 + UI polish)，minimum viable 估 3-6 FTE 一年
      不给金额，只给人力 range

Part 6 — Open risks + technical debt + what we'd do differently (~1000 字)
  6.1 仍未关闭的风险:
      - NL 5 条 SEED_UNVERIFIED 未 authored
      - UNECE Annex II 43 条 PLACEHOLDER (pilot-triggered 之外)
      - DE-009 KBA 权威链需要拆成 2 条 rules
      - ES 的 Comunidad Autónoma 变异没有 sub-country 覆盖
      - Commission delegated acts pending (Euro 7 battery durability / BAT-010 recycled content)
  6.2 结构债:
      - member-state-overlay.ts 约 2,400 行 — 接近拆分阈值
      - emissions-co2.ts 约 960 行 — 也到临界
      - 两种 factory (uneceRule 锁 lifecycle vs makeSeedRule 不锁) 不一致
      - Verification backlog 脚本是 manual run，非 CI
  6.3 测试债:
      - E2E (Playwright) 只有 scaffold，没有 smoke suite
      - UI regression 只靠 snapshot 测试 + 个别 component 测试
      - 没有 cross-browser matrix
      - Rule 语义正确性只靠 pilot fixtures，没有 formal verification
  6.4 流程债:
      - 人工核验 bandwidth 是永久瓶颈 — 现在只有 1 reviewer (yanhao)
      - EUR-Lex 自动监测只有 CI drift-alert，没有 pushdown 到 rule level
      - 没有 release 流程或版本号
      - 文档更新滞后 commit (在 K.3 之前 README 说 187 rules，实际已经是 196)
  6.5 如果重来会这样做:
      - 依旧: hard-gate + content_provenance + pilot regression anchor — 核心防线
      - 会换:
        * 把 human_reviewer 从 single person 做成 reviewer ID list，允许并行核验
        * lifecycle_state 加个 ACTIVE_AUTOMATIC vs ACTIVE_HUMAN 区分 (EUR-Lex scripted 抓 vs human 核)
        * 更早引入 evidence pack export format (给 TÜV audit pack 而非 CSV)
        * UX 上 exec-summary layer 应该 Phase 0 就有，不是 Phase K 补课

附：Reader navigation map (按角色推荐)
  - 新工程师 (onboarding): 1 → 2 → 6.1 → 6.2 → 6.5
  - 潜在 OEM buyer: 1 → 4 → 5 (最多 10 分钟)
  - 投资人: 1 → 4.4 → 4.6 → 5.5 → 6.1
  - 技术面试者展示: 1 → 2 → 3
  - 交接 (我 → 下一任 maintainer): 全读
```

### 3.2 `docs/PROJECT-JOURNEY-EN.md` (English companion, ~4000-5500 字)

Same 6-part structure, condensed. Targets the subset of audiences who don't read Chinese (international partners, TÜV liaisons, investor conversations with non-Chinese participants). Cross-references to the Chinese version for detail.

---

## 4. Content scope

### 4.1 Include

- **Quantified metrics**: rule counts / ACTIVE count / test count over time, tied to phase-level commit SHAs
- **Decisions + reasoning**: e.g., why BEV × DE as pilot anchor — actual reasoning, not post-hoc justification
- **Commit references**: major anchor commits (`ff5f6de`, `54ee504`, `b8fdc7c`, `7850bf4`, etc.) so readers can `git show` for deep context
- **Errors + corrections**: StVZO §23 citation error caught by human verification; RD 559/2010 → corrected; Windsor Framework / NI EU alignment; ES 2035 vs 2040 ZEV target confusion
- **Process patterns**: subagent-driven-development / dispatching-parallel-agents / 3-tier review loop — with "when it worked / when it didn't"
- **Reusable artifacts**: emit-verification-backlog.ts generator, golden-regression CI, content_provenance schema, factory patterns
- **Reader-transferable decisions**: code patterns, workflow patterns, process rules that can move to another project

### 4.2 Exclude

- **Chronological log** ("on April 21 I did X") — organized by theme/section, not date
- **Fabricated budget numbers** — hours given as ranges with "session-record-estimated, exact not tracked" disclaimer
- **Fabricated competitor details** — any claim about TÜV Rheinland / SGS / UL practices requires either a verifiable public source or omission
- **Fabricated market data** — "Chinese OEM Europe market share" claims require cited source or omission
- **Over-claiming current product maturity** — explicit: 73/196 = 37% ACTIVE, rest is still pilot quality
- **Confidential info** — no personal names beyond what's already in commits (yanhao) and attribution, no internal team processes beyond what's in public docs

---

## 5. Anti-hallucination guardrails

Journey docs are uniquely hallucination-prone because they invite over-precision on budget / market / competition. Hard constraints:

1. **Phase effort hours**: only ranges (e.g., "20-30 hours"). Explicit disclaimer: "Estimated from session records; exact hours not tracked." Don't fabricate precision.

2. **Market + competition**: Any claim about "how TÜV Rheinland charges" / "Chinese OEM Europe sales volumes" / "consulting hourly rates" requires a cited public source link OR must be omitted. 宁缺毋滥.

3. **ROI / revenue model**: Don't predict specific financial figures. Give maintenance cost in human-hours (verifiable from what we did). Don't give "assumed pricing at $X/seat".

4. **"If we did it again" section**: Only reference decisions we actually made and their actual consequences observed in this session. No hindsight fabrication of paths we didn't explore.

5. **Phase 0 content**: Phase 0 predates this session. For Part 1 narrative and any Phase-0-specific references, cite `docs/phase0/*` directly rather than re-invent.

6. **Competitive moat claims**: framed honestly — "73 verified rules is the real asset; UI can be cloned in 6 months". Don't claim proprietary algorithms we don't have.

---

## 6. Implementation notes (for writing-plans stage)

The writing-plans skill will produce an implementation plan with these sub-tasks:

### 6.1 Source material inventory

Before writing, collect:
- `git log --oneline` for major phase commits (Phase H/I/J/K) — get anchor SHAs
- `docs/phase0/architecture.md` + `data-model.md` + `implementation-plan.md` for Phase 0 facts
- `docs/phase12/*` for Phase 12 context
- `docs/phase-j/verification-backlog.md` for current state
- `README.md` stats section
- Session memory + TodoWrite history for phase sequence

### 6.2 Per-part draft order

Write in this order (each part is independent):
1. Part 1 narrative last (summarizes the rest)
2. Part 6 (risks + debt + would-do-differently) first — easiest, factual
3. Part 2 (technical) — dense, draw from code structure
4. Part 3 (product/UX) — draw from Phase J K.1/K.2 + Phase 12 Path B
5. Part 4 (business) — requires careful anti-hallucination pass
6. Part 5 (budget) — requires careful range estimation
7. Part 1 + navigation map

### 6.3 Cross-reference hygiene

- Link to existing docs, don't duplicate: USER-GUIDE for schema, DEVELOPER for architecture, HOMOLOGATION-HANDBOOK for operational manual, docs/phase0/* for baseline
- Include a "how to read this file" intro (2-3 sentences) pointing at the navigation map
- Each Part ends with "see also: [existing doc]" where there's natural overlap

### 6.4 Verification before commit

Before the final `git commit`:
- Run `grep -nE "\\[verify\\]" docs/PROJECT-JOURNEY*.md` — every [verify] marker must be in a footnote or appendix, NOT in main body prose
- Spot-check any specific number (hours, rule counts, commit SHAs) against source
- Confirm no fabricated competitor names / market stats
- Run `wc -w` on each file — zh should be 6000-8000 words, EN 4000-5500

### 6.5 No test changes

This is pure documentation. `tsc / lint / vitest` should not be affected. Run the full suite once at the end to confirm 230/230 still green.

---

## 7. Out of scope

- **ADR creation**: decisions retroactively encoded here are NOT ADRs. If a decision deserves an ADR, it goes in `docs/adr/` separately.
- **Marketing content**: this is a retrospective + reference, not a product pitch.
- **Generated diagrams**: no Mermaid / ASCII architecture diagrams in this doc — rely on existing ones in README + DEVELOPER.
- **Per-phase deep dives**: existing `docs/phase*/` directories own phase-specific detail. This doc abstracts across phases.
- **Privacy / compliance audit**: we're the compliance tool, but this doc is about the tool's own history, not a GDPR/SOC-2 compliance artifact.
- **Update cadence commitment**: this doc is written at 2026-04-21 state; future updates are opt-in, not automatic. Phase L+ is NOT required to keep this doc in sync.

---

## 8. Definition of Done

- Both files exist at `docs/PROJECT-JOURNEY.md` (zh) + `docs/PROJECT-JOURNEY-EN.md` (en)
- Zh version is 6000-8000 字, En version is 4000-5500 words
- All 6 parts + navigation map present in both files
- Every numerical claim in budget section has range + "session-estimated" disclaimer
- No fabricated competitor / market data
- Major commit SHAs cited (at least 8-10 as phase anchors)
- Cross-references to README / USER-GUIDE / DEVELOPER / HOMOLOGATION-HANDBOOK / docs/phase0 present where natural
- Navigation map at end of each file
- `grep -nE "\\[verify\\]"` returns zero results in main prose of either file (markers OK in appendix)
- `npx tsc --noEmit && npm run lint && npx vitest run` → all green
- Single commit with clear message; pushed to origin/main

---

## 9. Open questions — none

All 3 design sections (outline / scope / anti-hallucination) approved by user before writing this spec. Proceeding to writing-plans.

---

## 10. What happens next

After user reviews this spec:
1. (if approved) invoke `superpowers:writing-plans` to produce the implementation plan
2. The plan will be saved to `docs/superpowers/plans/2026-04-21-project-journey.md`
3. Plan executes via `executing-plans` or `subagent-driven-development`
4. Final deliverables: 2 files in `docs/`, 1 commit, pushed to main

No code changes. Pure documentation work. Estimated effort: 45-90 minutes of agent work.
