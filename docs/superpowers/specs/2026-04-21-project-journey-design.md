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

### 3.1 `docs/PROJECT-JOURNEY.md` (中文 primary, ~8000-11000 字 — Part 2 expanded)

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

Part 2 — Technical distillation (~3000-4000 字 zh / ~2200-3000 words en; the heaviest part)
  Principle: even a seemingly small observation today may be the key inspiration
  later. Prefer over-documenting over losing.

  2.1 Four-layer architecture (UI / Evaluation / Registry / Configuration)
    2.1.1 Why this split (responsibility separation + testability + data-layer migratability)
    2.1.2 Strict boundaries per layer:
      - UI does not compute (only renders EvaluationResult)
      - Evaluator has no side effects (pure function of config × rule → result)
      - Registry is pure data (Zod validated)
      - Configuration is input (VehicleConfig → EngineConfig derived)
    2.1.3 How we know boundaries were breached — code reviewer flagged repeatedly:
      "UI is starting to compute — move it back to engine" (Phase J.5 caught this)
    2.1.4 Transferable: any system with "decision logic + mutable inputs + rule data"
      benefits. Similar systems: permission engines, feature-flag systems,
      expense approval, compliance scanning.

  2.2 Hard-gate principle: governance enforced at evaluation layer, not authoring
    2.2.1 Rule: non-ACTIVE rules can NEVER return APPLICABLE
    2.2.2 Implementation: src/engine/evaluator.ts:113-121 (hard-coded downgrade)
    2.2.3 Counter-lesson: if you rely on author "self-discipline" at authoring layer,
      it WILL leak. Enforce at evaluation layer so authors can't violate.
    2.2.4 Transferable: any data-quality-tier × output-confidence system can use this.
      E.g., data quality → decision confidence, model version → prediction surface,
      evidence level → diagnostic suggestion.

  2.3 Three load-bearing schema fields
    2.3.1 lifecycle_state — single source of truth for governance
      5 states: PLACEHOLDER / DRAFT / SEED_UNVERIFIED / ACTIVE / ARCHIVED
      Promotion gate is not "edit this field" but "satisfy these conditions"
    2.3.2 content_provenance.human_reviewer — the REAL trust signal
      **Key insight**: not lifecycle_state — you can have ACTIVE rules with
      human_reviewer: null (early ACTIVE promotions before verification).
      Phase J anti-hallucination separated "trust" from lifecycle into its
      own field.
      → governance state vs data lineage = two orthogonal axes
    2.3.3 manual_review_reason — acknowledge uncertainty AND surface in UI
      **Key insight**: user confusion is not "they don't know" — it's
      "they don't know why they don't know". Promoting meta-information
      (why pending) to primary information (UI callout "Why indicative only")
      solves the confusion. Phase K.0 discovered this; the field had been
      in the schema all along, just not surfaced.
    2.3.4 Transferable pattern: any product that shows "gray/pending/undecided"
      state should have a "why" field surfaced explicitly.

  2.4 Factory patterns (factories are stronger than conventions)
    2.4.1 makeSeedRule — applies schema defaults + enables Zod runtime validation
    2.4.2 uneceRule — hard-locks lifecycle to SEED_UNVERIFIED
      Lesson: factories can enforce invariants that prose/convention cannot
      (no matter what docs say, new authors bypass; factories block)
    2.4.3 Additive extension — optional fields preserving backward compat
      - UneceAuthored.evidenceTasks / manualReviewReason added in Phase J.1
      - Old callers omit → defaults kick in; new callers use extensions
      - Zod `.optional().default(false)` let Phase I.3's
        offersPublicChargingInfra land without breaking user localStorage
    2.4.4 Transferable: schema evolution + factory pattern = essential
      infrastructure for long-lived systems

  2.5 Pilot fixture as regression anchor
    2.5.1 "applicable_rule_ids may grow but must not shrink" rule
      Every Phase I/J commit verifies: BEV × DE pilot APPLICABLE set didn't shrink
      If shrunk, that's a regression — requires recorded justification to accept
    2.5.2 Use fixture to verify end-to-end behavior, not unit tests on internals
      (fixture = one real project config; evaluation must be stable under it)
    2.5.3 Soft range assertions: `conditional_count_range: [25, 60]`
      Tests express intent ("should have a few dozen CONDITIONALs"), not
      specific numbers (which churn constantly with authoring)
    2.5.4 Snapshot tests as audit artifacts
      `git diff tests/unit/__snapshots__/` is a manual review step before every
      commit — snapshots are evidence, not ground truth
    2.5.5 Transferable: any "config → result" system benefits from a golden fixture

  2.6 Anti-hallucination stack (multi-layer defense, not single point)
    2.6.1 Schema layer: content_provenance.human_reviewer: null = "untrusted"
      governance test runs validateRegistryIntegrity (activeWithoutUrl /
      activeWithoutOjReference / activeWithoutVerification) as hard gate
    2.6.2 Authoring layer: [verify] markers
      **Strict constraint**: appear only in notes / manual_review_reason /
      source.oj_reference — NEVER in obligation_text (user-facing prose).
      Phase I.4 ES batch got sent back by code reviewer for this violation.
    2.6.3 Review layer: two-loop review (spec reviewer + code reviewer)
    2.6.4 Test layer: governance test for registry integrity;
      pilot acceptance test for behavior stability
    2.6.5 UI layer: lifecycle badges + "Why indicative only" callout
      surface to user that "we don't fully trust this"
    2.6.6 Human layer: human verification catches errors AI cannot
      Example: StVZO §23 citation is Oldtimer, not Kennzeichen —
      research agents missed; human opened page in browser, found instantly
    2.6.7 AI-vs-AI layer: parallel research agents triangulate information
      Example: ES batch research agent caught 5 spec errors (RD 559/2010
      is Industrial Registry not homologación individual; Ley 7/2021 ZEV
      target is 2040 not 2035; RD 110/2015 is RAEE not batteries)
    2.6.8 **Key lesson**: every layer has failure modes; multi-layer redundancy
      is what works. Each layer catches different classes of errors:
      - Schema layer catches missing fields
      - Review layer catches content-vs-scope mismatch
      - Test layer catches behavioral regression
      - UI layer catches user cognition blind spots
      - Human catches factual errors (most expensive, most ground-truth)
      - AI research catches citation errors (cheap, parallelizable)

  2.7 Key data-model decisions
    2.7.1 RuleTemporalScope 7-field structure (replacing single effective_from/to)
      entry_into_force / applies_to_new_types_from / applies_to_all_new_vehicles_from
      / applies_to_first_registration_from / applies_from_generic /
      effective_to / small_volume_derogation_until
      Supports automotive phase-in pattern — one regulation may apply to new
      types from YYYY, to all new vehicles from YYYY+2, with small-volume
      derogation until YYYY+5
      **Transferable**: any "multi-date effective" regulation/policy system needs this
    2.7.2 Trigger logic: declarative-primary + custom-evaluator escape hatch
      80% declarative / 20% custom — selective complexity
      Avoided the "all-DSL or all-code" binary trap
    2.7.3 OwnerHint controlled vocabulary (12 predefined owner categories)
      homologation / safety_engineering / cybersecurity / software_ota /
      privacy_data_protection / ai_governance / sustainability_materials /
      legal / aftersales / regulatory_affairs / powertrain_emissions /
      connected_services / other
      Enables: filtering + aggregation + cross-rule ownership dashboard
      **Transferable**: controlled vocabulary > free text for any system
      requiring cross-cutting views
    2.7.4 Related rules as directed graph
      `{ rule_id: "REG-CS-001", relation: "complements" | "requires" | "conflicts" }`
      Enables navigation + consistency checking + dependency visualization

  2.8 Engine layer's config-as-pure-input pattern
    2.8.1 VehicleConfig → EngineConfig derivation
    2.8.2 Entire evaluation is a pure function of config — no side effects
    2.8.3 Phase I.1's 5 new derived flags preserve this invariant:
      hasCombustionEngine / hasDieselEngine / hasFuelTank / hasOBD / isPlugInHybrid
      All derived from VehicleConfig.powertrain + VehicleConfig.fuel
    2.8.4 **Lesson**: if state is immutable + derivable, other subsystems simplify
      URL sharing, localStorage persist, undo/redo, time-travel debug all become cheap

  2.9 Rule splitting: ADR-H7 Euro 7 three-way split
    One "regulation" (Reg (EU) 2024/1257 Euro 7) was too coarse-grained;
    split by powertrain into:
    - REG-EM-001 Euro 7 framework (all M1/N1)
    - REG-EM-013 Euro 7 combustion exhaust + OBFCM (hasCombustionEngine)
    - REG-EM-014 Euro 7 battery durability (batteryPresent)
    **Transferable principle**: if a single rule's trigger has conditional
    branching within itself, split into multiple rules. Otherwise evidence_tasks
    becomes a mix of ICE + BEV tasks, un-assignable.

  2.10 Subagent-driven development lessons
    2.10.1 Fresh subagent + clean prompt > single agent + long history
    2.10.2 Context switching cost (new agent spin-up) < context pollution cost
      (long session degrades model attention)
    2.10.3 But parallel implementer has conflict risk (two agents editing same file)
      → sequentialize commits, don't parallelize implementation
    2.10.4 Research agents CAN parallel — they don't write code, so no conflicts
    2.10.5 **Aphorism**: agent-to-agent workflow is "disposable workers" pattern —
      use once and discard; don't build long conversations with any single agent.

  2.11 File organization (per-responsibility, not per-domain)
    src/registry/seed/*.ts split by legal_family:
    - vehicle-approval.ts / general-safety.ts / cybersecurity.ts /
      emissions-co2.ts / materials-chemicals.ts / etc.
    Plus cross-cutting files:
    - shared.ts — factories
    - classification.ts — cross-cutting enrichment
    - evidence-enrichment.ts — cross-cutting
    - freshness-data.ts — cross-cutting
    - index.ts — composition (applyEnrichments merges)
    **Lesson**: one file per responsibility eases locate + review + reason.
    When a file exceeds ~1500-2000 lines (member-state-overlay.ts hit 2400),
    split.

  2.12 UI language vs Engine language — explicit mapping
    Engine says: ACTIVE / SEED_UNVERIFIED / DRAFT / PLACEHOLDER / ARCHIVED
    UI says: Verified / Indicative / Pending
    TrustBadge component does the translation
    **Lesson**: user vocabulary ≠ governance vocabulary. Keep schema-native
    terms for precise semantics; user-facing terms should be fewer and
    more intuitive.

  2.13 What to do when schema doesn't support something
    ES CCAA sub-country regional variations: schema has no region field
    → Don't hack the schema. Add one aggregate advisory rule (REG-MS-ES-014)
      telling the user "this dimension needs separate due diligence"
    **Lesson**: acknowledging tool boundaries beats force-extending schema —
    the tool shouldn't lie to the user.

  2.14 Evidence tasks must be actionable
    ❌ "Ensure compliance with Art. 13"
    ✓ "Battery label artwork approval per Annex VI format including QR
      linking to passport"
    ✓ "Demontage-Informationen sheet in German within 6 months of new-type
      launch"
    Each evidence_task is a specific deliverable (document, test, sign-off),
    checkable + assignable by owner_hint
    **Lesson**: abstract obligations must be concretized at authoring time —
    don't pass the buck to the user.

  2.15 Three orthogonal axes of trust (a key abstraction insight)
    People often conflate these; they're independent:
    - Trust: is the source of this rule trustworthy? → lifecycle_state / human_reviewer
    - Applicability: does it apply to the current project? → trigger logic
    - Freshness: recently verified? → last_verified_on + review cadence
    **Transferable**: any rule engine / policy system / knowledge base benefits
    from this separation.

  2.16 Aphorism + reusable principles catalog (pluck-and-use)
    - "Non-ACTIVE rules must never return APPLICABLE" (governance first-principle)
    - "UI renders, engine computes"
    - "[verify] lives in notes, never in obligation_text"
    - "Pilot regression anchor: applicable_rule_ids may grow but must not shrink"
    - "Silent under-serving is the worst failure mode" (PHEV fixture diagnosis)
    - "Fresh subagent beats long conversation"
    - "Dispatch parallel research agents BEFORE writing anything"
    - "Human verification catches real errors AI verification cannot"
    - "Trust ≠ Lifecycle ≠ Applicability — three separate axes"
    - "Factories enforce invariants, prose/convention cannot"
    - "Controlled vocabulary > free text"
    - "If your data is immutable + derivable, the rest of the system simplifies"
    - "When the schema doesn't support X, tell the user — don't hack"
    - "Test snapshot is audit artifact, not baseline"
    - "Additive schema changes should default; existing data shouldn't break"
    - "Acknowledge tool boundaries rather than fake omniscience" (CCAA example)
    - "Evidence tasks are deliverables, not aspirations"

  2.17 Counter-examples: decisions we considered but rejected (for future reference)
    - Considered: split CCAA into per-region rules. Rejected: schema doesn't
      support; hack cost too high.
    - Considered: introduce backend API. Rejected: AGENTS.md non-goal; keep
      zero-backend.
    - Considered: UNECE R161 as standalone rule. Rejected: ADB is inside R149;
      standalone would be a hallucination.
    - Considered: LLM runtime evaluation. Rejected: reproducibility + cost +
      latency triple penalty.
    - Considered: mark Ley 3/2023 ES ACTIVE. Rejected: enactment status unverified.
    Lesson: "rejected" decisions are more valuable reference than "adopted"
    decisions — they encode constraint knowledge.

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

### 3.2 `docs/PROJECT-JOURNEY-EN.md` (English companion, ~5500-7500 words)

Same 6-part structure, Part 2 equally expanded. Target audience: subset who don't read Chinese (international partners, TÜV liaisons, investor conversations with non-Chinese participants). Cross-references Chinese version for detail; but **Part 2 technical principles + aphorisms must be preserved in full in the English version** (they're transferable "code smell / design smell"-level insights, and English-speaking readers are more likely to reuse them on new projects).

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
- Zh version is 8000-11000 字, En version is 5500-7500 words (Part 2 expanded target)
- All 6 parts + navigation map present in both files
- **Part 2 Technical occupies 3000-4000 字 zh / 2200-3000 words en** — the heaviest part
- **Part 2's aphorism catalog (§2.16) + rejected-decisions (§2.17) must both be preserved** — highest reference value when returning later
- **Three-axis trust insight (§2.15) must have its own standalone section** — highest transferability
- Every numerical claim in budget section has range + "session-estimated" disclaimer
- No fabricated competitor / market data
- Major commit SHAs cited (at least 8-10 as phase anchors, with increased density in technical section)
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
