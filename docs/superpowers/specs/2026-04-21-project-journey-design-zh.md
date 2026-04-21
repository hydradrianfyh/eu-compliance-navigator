# 项目历程文档 — 设计 Spec（中文版）

**日期**：2026-04-21
**作者**：© Yanhao FU（与 Claude 协作头脑风暴）
**状态**：已批准 — 准备进入 writing-plans
**分支**：main
**英文对照**：[2026-04-21-project-journey-design.md](./2026-04-21-project-journey-design.md)

---

## 1. 目标

在 `docs/PROJECT-JOURNEY.md`（中文主版）+ `docs/PROJECT-JOURNEY-EN.md`（英文伴随版）生成一份**双重用途的回顾参考文档**，把 EU Vehicle Compliance Navigator 开发过程中沉淀的**有用信息 + 潜在有用信息**按**主题（而非时间线）**组织。

**双重用途 = 一份文件服务两种读者**：

1. **未来的自己 / 接手的工程师** 读 Technical + Process + Open-risks 章节，不用重新挖历史就能继续项目。
2. **合作方 / 潜在 OEM 客户 / 投资人** 读 Opening + Product + Business + Budget 章节，20 分钟内理解这个项目的赌注和价值。

文件结构让两种读者**各取所需、不用通读**。

---

## 2. 为什么要做这个文档

任何非 trivial 项目都会积累**结构性知识** — 散落在作者头脑里、零碎 commit message 里、散落的 ADR + phase plan 里。当项目换手（新工程师、交接给合作方、并购对话、投资人路演），这些知识就挥发了。

`docs/` 里已有的回顾文档各有侧重：
- `README.md` — 营销向摘要 + stats
- `USER-GUIDE*.md` — 用户参考（字段级）
- `DEVELOPER.md` — 代码架构参考
- `HOMOLOGATION-HANDBOOK*.md` — 准入工程师操作手册
- `docs/phase0/*` — 基础架构决策
- `docs/phase12/*`、`docs/phase-j/*` — 各 phase 具体笔记

**缺失的**：一份**跨 phase、跨维度**的统一文档，记录**为什么做这些决策**、**什么没 work**、**有哪些可复用的产出**、以及**项目从商业 + 技术角度实际走到哪里**。

这份文档补的就是这个 gap。

---

## 3. 文件结构

两个文件，结构对齐。

### 3.1 `docs/PROJECT-JOURNEY.md`（中文主版，约 8000-11000 字 — Part 2 扩充后的新目标）

六部分 + 导航 map：

```
Part 1 — 开场叙事（500-700 字）
  "从 0 到 73 ACTIVE" 的紧凑故事：
  - 起点：13 个 legal families taxonomy + 34 条 seed rules（Phase 0）
  - 关键转折：
    * Phase 11: pilot-driven work guidance 把工具从"规则目录"变成
      "SOP-锚定的工作台"
    * Phase I breadth + ICE/PHEV engine flags 打破了 BEV-only 偏见
    * Phase J human-review rounds 把 39 条规则从 SEED 升到 ACTIVE
    * Phase K 交付管理层友好 UX + 本文档
  - 当前：73 ACTIVE / 196 rules / 230 tests / DE + UK 达到 production-grade
  - 下一步：NL batch / UNECE Annex II / Phase L features
  目标：任何读者读完这一页后能回答 "是什么 / 做到哪了 / 要去哪"。

Part 2 — 技术沉淀（Technical; 扩充到约 3000-4000 字，最重的一部分）
  理念：即使某个观察当时看起来平常，未来可能是关键灵感。宁多不漏。

  2.1 架构四层（UI / Evaluation / Registry / Configuration）
    2.1.1 为什么这么分层（责任分离 + 可测试 + 可迁移数据层）
    2.1.2 每层的严格边界:
      - UI 不计算（只 render EvaluationResult）
      - Evaluator 无副作用（pure function of config × rule → result）
      - Registry 是 pure data (Zod validated)
      - Configuration 是 input (VehicleConfig → EngineConfig 派生)
    2.1.3 怎么知道边界被破坏 — code reviewer 重复 flag 一句话：
      "UI 开始计算了，移回 engine"（Phase J.5 就这样被 reviewer 指出）
    2.1.4 可迁移：任何有"决策逻辑 + 可变 input + 规则数据"的系统都受益
      类似系统：权限引擎、feature flag 系统、报销审批、合规扫描

  2.2 Hard-gate 原则：governance 在评估层强制，不在 authoring 层
    2.2.1 规则：非 ACTIVE rules 永远不能返回 APPLICABLE
    2.2.2 实现位置：src/engine/evaluator.ts:113-121（硬编码降级）
    2.2.3 反面教训：如果在 authoring 层依赖 "自觉"，一定漏
      → 应该让评估层强制执行，让作者无法违背
    2.2.4 可迁移：任何 data quality tier × output confidence 的系统都能用
      例：数据质量 → 决策置信度、模型版本 → 预测 surface、证据等级 → 诊断建议

  2.3 Schema 里承重的三个字段
    2.3.1 lifecycle_state — governance 的唯一真相
      5 状态：PLACEHOLDER / DRAFT / SEED_UNVERIFIED / ACTIVE / ARCHIVED
      promotion gate 不是 "编辑字段" 而是 "满足条件"
    2.3.2 content_provenance.human_reviewer — 真正的信任信号
      **关键洞察**：不是 lifecycle_state — 可以有 ACTIVE 但 human_reviewer:null
      的规则（早期 ACTIVE 推广但未经核验）。Phase J 反幻觉就是把 "信任" 从
      lifecycle 抽离到独立字段。
      → governance 状态 vs 数据血统 = 两个正交维度
    2.3.3 manual_review_reason — 承认不确定性并在 UI 上 surface
      **关键洞察**：用户困惑不是因为"不知道"，是因为"不知道为什么不知道"。
      把 meta-information（为什么 pending）提升为 primary information（UI
      里 "Why indicative only" callout）就解决了混乱。Phase K.0 发现的，
      schema 里早就有这字段只是没 surface。
    2.3.4 可迁移模式：任何产品凡是显示"灰色/待定/未决" 状态的，都应该附带
      "为什么" 字段显式化

  2.4 Factory patterns（工厂比约定强）
    2.4.1 makeSeedRule — 应用 schema 默认值 + 让 Zod 运行时验证
    2.4.2 uneceRule — 强制锁 lifecycle 到 SEED_UNVERIFIED
      教训：factory 可以 enforce invariants 是 prose / convention 做不到的
      （无论文档怎么写，新人都会绕过；工厂强制则绕不过）
    2.4.3 Additive extension — 可选字段保留向后兼容
      - UneceAuthored.evidenceTasks / manualReviewReason 是 Phase J.1 加的
      - 老 callers 不填 → 默认值；新 callers 可用
      - Zod `.optional().default(false)` 让 Phase I.3 的
        offersPublicChargingInfra 加进来而没打破用户 localStorage
    2.4.4 可迁移：schema 演进 + factory pattern 是长期系统的必备基础设施

  2.5 Pilot fixture 作为 regression anchor
    2.5.1 "applicable_rule_ids 可增不可减" 原则
      Phase I/J 每个 commit 前必 verify: BEV × DE pilot 的 APPLICABLE 集合不能缩水
      如果缩了，说明有 regression — 需要记录理由才能接受
    2.5.2 用 fixture 验证 end-to-end 行为，不用 unit test 验证内部细节
      (fixture = 一个真实项目配置；evaluation 必须在这个配置下稳定)
    2.5.3 Soft range assertions: `conditional_count_range: [25, 60]`
      表达测试意图（"应该有几十条 CONDITIONAL"）而非具体数字（避免因
      authoring 增量持续 churn）
    2.5.4 Snapshot tests 作为 audit artifacts
      `git diff tests/unit/__snapshots__/` 是每次提交前的 manual review step —
      snapshot 不是真相，是审计证据
    2.5.5 可迁移：任何有"配置 → 结果"的系统都应该有 golden fixture

  2.6 反幻觉栈（多层防御，不是单点）
    2.6.1 Schema 层：content_provenance.human_reviewer: null = "不可信"
      governance test 跑 validateRegistryIntegrity(activeWithoutUrl / 
      activeWithoutOjReference / activeWithoutVerification) 作为 hard gate
    2.6.2 Authoring 层：[verify] markers
      **严格约束**：只能出现在 notes / manual_review_reason / 
      source.oj_reference，**不能**污染 obligation_text（用户看到的文字）
      Phase I.4 ES 批次因 [verify] 漏到 obligation 被 code reviewer 打回
    2.6.3 Review 层：两轮 loop（spec reviewer + code reviewer）
    2.6.4 Test 层：governance test 看 registry integrity
      pilot acceptance test 看行为稳定性
    2.6.5 UI 层：lifecycle badges + "Why indicative only" callout
      向用户 surfacing "我不是完全相信这条"
    2.6.6 Human 层：人工核验轮真的抓到 AI 抓不到的错
      例：StVZO §23 引用是 Oldtimer，不是 Kennzeichen — research agent
      没抓到，人工浏览器打开页面一看立刻发现
    2.6.7 AI-vs-AI 层：parallel research agents triangulate 信息
      例：ES 批次 research agent 查出 5 处 spec 错误（RD 559/2010 是
      Industrial Registry 不是 homologación individual；Ley 7/2021 ZEV
      target 是 2040 不是 2035；RD 110/2015 是 RAEE 不是 batteries）
    2.6.8 **关键教训**：每层都有失败模式，多层冗余才靠谱
      各层抓到的错类型互补：
      - Schema 层抓缺字段
      - Review 层抓内容 vs scope 偏差
      - Test 层抓行为 regression
      - UI 层抓用户认知盲区
      - Human 抓事实错误（最贵但最 ground-truth）
      - AI research 抓 citation 错误（便宜可并行）

  2.7 数据模型的关键决策
    2.7.1 RuleTemporalScope 7-field 结构（替代单 effective_from/to）
      entry_into_force / applies_to_new_types_from / applies_to_all_new_vehicles_from
      / applies_to_first_registration_from / applies_from_generic /
      effective_to / small_volume_derogation_until
      支持 automotive phase-in pattern — 一条法规可能对新型号从 YYYY 开始，
      对所有新车从 YYYY+2 开始，对小批量延迟到 YYYY+5
      **可迁移**：任何"多时点生效"的法规/政策系统都需要这个
    2.7.2 Trigger logic: 声明式为主 + escape hatch 到 custom evaluator
      80% declarative / 20% custom — 选择性复杂（selective complexity）
      避免了"要么全 DSL 要么全代码"的二元陷阱
    2.7.3 OwnerHint 受控词汇表（12 个预定义 owner 类别）
      homologation / safety_engineering / cybersecurity / software_ota /
      privacy_data_protection / ai_governance / sustainability_materials /
      legal / aftersales / regulatory_affairs / powertrain_emissions /
      connected_services / other
      enable: filtering + aggregation + 跨规则 ownership dashboard
      **可迁移**：controlled vocabulary > free text, 任何要支持跨切面视图的系统
    2.7.4 Related rules 作为 directed graph
      `{ rule_id: "REG-CS-001", relation: "complements" | "requires" | "conflicts" }`
      enable 导航 + 一致性检查 + 依赖可视化

  2.8 Engine 层的 config-as-pure-input 模式
    2.8.1 VehicleConfig → EngineConfig 派生
    2.8.2 整个 evaluation 是 pure function of config — 无副作用
    2.8.3 Phase I.1 加的 5 个派生 flag 保持这个 invariant:
      hasCombustionEngine / hasDieselEngine / hasFuelTank / hasOBD / isPlugInHybrid
      都是 VehicleConfig.powertrain + VehicleConfig.fuel 的派生
    2.8.4 **教训**：如果 state immutable + derivable，其他系统跟着简化
      URL 分享、localStorage persist、undo/redo、time-travel debug 全都 cheap

  2.9 规则拆分：ADR-H7 Euro 7 三分
    一条"regulation"（Reg (EU) 2024/1257 Euro 7）太粗粒度，按 powertrain 拆为：
    - REG-EM-001 Euro 7 框架 (M1/N1 所有车型)
    - REG-EM-013 Euro 7 combustion exhaust + OBFCM (hasCombustionEngine)
    - REG-EM-014 Euro 7 battery durability (batteryPresent)
    **可迁移原则**：如果一条规则的 trigger 条件内部有分支，拆成多条更清晰
    否则用户看到 evidence_tasks 会是 ICE + BEV 的混合，没法直接 assign

  2.10 Subagent-driven development 经验
    2.10.1 新 subagent + clean prompt > 单 agent + 长 history
    2.10.2 Context switching cost（新 agent spin-up）< context pollution cost
      （session 变长导致模型注意力分散）
    2.10.3 但 parallel implementer 有冲突风险（两个 agent 同时改一个文件）
      → 序列化 commits，不并行 implement
    2.10.4 Research agents parallel OK — 他们不写 code，天然无冲突
    2.10.5 **金句**：agent-to-agent 工作模式，每个 agent 是一个 "disposable
      worker" — 用完即弃；不要和 agent 建立长对话。

  2.11 文件组织（per-responsibility, not per-domain）
    src/registry/seed/*.ts 按 legal_family 分：
    - vehicle-approval.ts / general-safety.ts / cybersecurity.ts / 
      emissions-co2.ts / materials-chemicals.ts 等
    另外还有横切文件:
    - shared.ts — 工厂
    - classification.ts — 横切 enrichment
    - evidence-enrichment.ts — 横切
    - freshness-data.ts — 横切
    - index.ts — composition（applyEnrichments 合并）
    **教训**：一个文件一个 responsibility，便于定位 + review + reason。
    当某文件超过 ~1500-2000 行（member-state-overlay.ts 到 2400），就该拆

  2.12 UI 语言 vs Engine 语言的显式映射
    Engine 说: ACTIVE / SEED_UNVERIFIED / DRAFT / PLACEHOLDER / ARCHIVED
    UI 说: Verified / Indicative / Pending
    TrustBadge 组件做翻译
    **教训**：用户词汇 ≠ 治理词汇；给 schema 原生 term 保留精确语义，
    用户表达用更直观、更少的概念。

  2.13 Schema 不支持的东西怎么办
    ES CCAA 子国家地区变异：schema 没 region 字段
    → 不 hack schema，加一条 aggregate advisory rule（REG-MS-ES-014）
      告诉用户 "这个维度需要你自己另做尽调"
    **教训**：承认工具边界比强行扩展 schema 好 — 工具不对用户撒谎

  2.14 Evidence tasks 必须可操作
    ❌ "Ensure compliance with Art. 13"
    ✓ "Battery label artwork approval per Annex VI format including QR linking to passport"
    ✓ "Demontage-Informationen sheet in German within 6 months of new-type launch"
    每条 evidence_task 是一个具体的 deliverable（文档、测试、sign-off），
    可 checkbox 化、可 assign 到 owner_hint
    **教训**：抽象义务在 authoring 时就要变具体 — 工具不把锅甩给用户

  2.15 信任的三个正交轴（关键抽象洞察）
    人们常把这三个混在一起，实际是独立的：
    - 信任（Trust）: 这条规则的源头可不可信？→ lifecycle_state / human_reviewer
    - 适用性（Applicability）: 对当前项目适用吗？→ trigger logic
    - 新鲜度（Freshness）: 最近核验过吗？→ last_verified_on + review cadence
    **可迁移**：任何规则引擎 / 政策系统 / 知识库都受益于这个分离

  2.16 金句 / 可复用 principles 集（以后拿出来直接用）
    - "Non-ACTIVE rules must never return APPLICABLE"（governance 第一原则）
    - "UI renders, engine computes"
    - "[verify] 活在 notes 里，永远不进 obligation_text"
    - "Pilot regression anchor: applicable_rule_ids may grow but must not shrink"
    - "Silent under-serving 是最差的失败模式" (PHEV fixture 诊断)
    - "Fresh subagent beats long conversation"
    - "Dispatch parallel research agents BEFORE writing anything"
    - "Human verification catches real errors AI verification cannot"
    - "Trust ≠ Lifecycle ≠ Applicability — three separate axes"
    - "Factories enforce invariants, prose/convention cannot"
    - "Controlled vocabulary > free text"
    - "If your data is immutable + derivable, the rest of the system simplifies"
    - "Schema 不支持的事情，告诉用户而不是 hack"
    - "Test snapshot 是 audit artifact，不是 baseline"
    - "Additive schema changes should default; existing data shouldn't break"
    - "承认工具边界比假装全能强" (CCAA 例)
    - "Evidence tasks 是 deliverable，不是 aspiration"

  2.17 反例：session 里讨论过但没采用的决策（以备后用）
    - 考虑过：把 CCAA 拆成 per-region rules — 拒绝（schema 不支持，hack 代价过高）
    - 考虑过：引入后端 API — 拒绝（AGENTS.md non-goal，保持零后端）
    - 考虑过：UNECE R161 独立规则 — 拒绝（ADB 在 R149 内部，新规则是幻觉）
    - 考虑过：LLM runtime 评估 — 拒绝（reproducibility + cost + latency 三重代价）
    - 考虑过：把 Ley 3/2023 ES 标 ACTIVE — 拒绝（enactment 未核实）
    教训：这些"没做"的决策记下来比"做了"的更有 reference 价值

Part 3 — 产品 / UX 决策（Product; 约 1200 字）
  3.1 Progressive disclosure 原则 — 管理层 3 秒可懂 / 工程师能深挖
  3.2 三层信任（Verified / Indicative / Pending）— 为什么比二元 OK/not-OK 更诚实
  3.3 "Why indicative only" callout — K.0 的故事：从用户困惑到 schema
      字段被显式化
  3.4 五个标签页的分层：
      - Setup: 配置输入
      - Status: 管理层主要落点
      - Plan: 项目经理落点
      - Rules: homologation 工程师落点
      - Coverage: 治理 + 验证队列
  3.5 ScopeBanner 四层分组 — 对管理层说真话

Part 4 — 商业 / 市场 insights（Business; 约 1500 字）
  4.1 目标用户：进欧洲的中国 OEM（具体厂商列表 + 他们的 EU 进度阶段）
  4.2 真正的痛点：
      - 法规不透明（语言 + 数量 + 变化速度）
      - 成员国差异（DE KBA / UK VCA / FR UTAC / NL RDW / ES IDIADA）
      - 审计证据链（KBA / TÜV / UTAC 来问，需要 SOP 锚定的证据）
      - 软件/OTA lifecycle（CSMS + SUMS 每次更新都要管）
      - 横向法规急加速（AI Act / Battery Reg / Data Act / Euro 7 连续落地）
  4.3 工具的价值主张：
      - 不是替代律师
      - 是 homologation 团队的 "日常工作台"
      - 解决的是 "我下周要做什么"，不是 "这条法律是什么"
  4.4 竞争格局：
      - 咨询公司（TÜV Rheinland / SGS / UL）— 公开信息，凡超出就 [verify]
      - 内部 Excel + 团队 Confluence
      - 开源规则库（如 EUR-Lex, UNECE WP.29 web）
      - 这个工具的位置：在 Excel + 咨询 之间，一个可持久化的 compliance
        workbench
  4.5 非商业化路径 vs 商业化路径 tradeoffs（不给具体定价）
  4.6 护城河 + 可复制风险：
      - 护城河：human-verified rule registry 是真正难复制的资产
      - 可复制风险：一个工程师花 6 个月可以 clone UI；但复制不了 73 条 ACTIVE
        的人工核验投入
      - 真正的差异化：ACTIVE rules + 持续 freshness review 的 bandwidth

Part 5 — 预算 / 投入 / ROI（Budget; 约 1000 字）
  只用范围 + 明说 "基于 session 记录估算"；不编造精确数字
  5.1 实际投入按 phase 粗略：
      - Phase 0 设计 baseline: 约 15-25h（根据 docs/phase0/* 规模推断）
      - Phase 1-9 scaffold → evidence: 约 80-120h（根据 docs/phase12 注释推断）
      - Phase 11 (11A-E): 约 20-30h
      - Phase 12 Path B UX refactor: 约 30-40h
      - Phase H UNECE/ISO enrichment: 约 10-15h
      - Phase I breadth (I.1-I.6, 45 条新 rules): 约 20-30h
      - Phase J (production readiness): 约 15-25h
      - Phase J human-review rounds 1-3: 约 5-8h
      - Phase K (K.1-K.4 UX + docs): 约 4-6h
      明说："以上为 session 记录估算，非精确工时记录。"
  5.2 单位经济（per-rule）：
      - 1 条 SEED → ACTIVE 升级 ≈ 10-15 min URL 核验 + 5 min 元数据填写
        ≈ 约 15-20 min/条（快速路径）
      - 复杂规则（需要拆分或重新 author）≈ 1-2 h/条
  5.3 扩展成本曲线：
      - 73 → 100 ACTIVE: 约 27 × 20 min = 约 9 hours 人工
      - 100 → 150 ACTIVE: 约 50 × 25 min = 约 20 hours（边际成本升高，
        剩下的都是难的）
      - 从 0 新 author 一个 member-state overlay（DE 档位）: 约 40-60 hours
  5.4 维护成本（长期）：
      - 每 6 个月一轮 freshness review: 约 30 rules × 10 min = 5 hours
      - EUR-Lex / UNECE 重大变更触发：每次约 10-20 hours（少数活跃规则需要
        全重 author）
  5.5 商业化假设下的 unit economics（粗估范围，不给具体定价）：
      - 研究 / 开源 / 社区：零 revenue，persona = 爱好者 + 学术（长期不可持续）
      - 咨询嵌入：1 OEM partner + 1 senior regulatory expert 可维护 + 深化
      - SaaS 订阅：需要自动化（EUR-Lex 同步 + UI polish），minimum viable
        约 3-6 FTE 持续一年
      不给金额，只给人力 range

Part 6 — Open risks + technical debt + 重来会怎么做（约 1000 字）
  6.1 仍未关闭的风险：
      - NL 5 条 SEED_UNVERIFIED 未 author
      - UNECE Annex II 43 条 PLACEHOLDER（pilot-triggered 之外）
      - DE-009 KBA 权威链需要拆成 2 条 rules
      - ES 的 Comunidad Autónoma 变异没有 sub-country 覆盖
      - Commission delegated acts pending（Euro 7 battery durability /
        BAT-010 recycled content）
  6.2 结构债：
      - member-state-overlay.ts 约 2,400 行 — 接近拆分阈值
      - emissions-co2.ts 约 960 行 — 也到临界
      - 两种 factory（uneceRule 锁 lifecycle / makeSeedRule 不锁）不一致
      - Verification backlog 脚本是 manual run，非 CI
  6.3 测试债：
      - E2E（Playwright）只有 scaffold，没有 smoke suite
      - UI regression 只靠 snapshot 测试 + 个别 component 测试
      - 没有 cross-browser matrix
      - Rule 语义正确性只靠 pilot fixtures，没有 formal verification
  6.4 流程债：
      - 人工核验 bandwidth 是永久瓶颈 — 目前只有 1 个 reviewer（yanhao）
      - EUR-Lex 自动监测只有 CI drift-alert，没 push 到 rule level
      - 没有 release 流程或版本号
      - 文档更新滞后 commit（K.3 之前 README 还说 187 rules，实际已经 196）
  6.5 如果重来会这样做：
      - 依旧：hard-gate + content_provenance + pilot regression anchor — 核心防线
      - 会换：
        * 把 human_reviewer 从 single person 做成 reviewer ID list，允许并行核验
        * lifecycle_state 加个 ACTIVE_AUTOMATIC vs ACTIVE_HUMAN 区分
          （EUR-Lex scripted 抓 vs 人工核）
        * 更早引入 evidence pack export format（给 TÜV audit pack 而非 CSV）
        * UX 上 exec-summary layer 应该 Phase 0 就有，不是 Phase K 补课

附：Reader navigation map（按角色推荐读哪几节）
  - 新工程师（onboarding）: 1 → 2 → 6.1 → 6.2 → 6.5
  - 潜在 OEM buyer: 1 → 4 → 5（最多 10 分钟）
  - 投资人: 1 → 4.4 → 4.6 → 5.5 → 6.1
  - 技术面试展示: 1 → 2 → 3
  - 交接（我 → 下一任 maintainer）: 全读
```

### 3.2 `docs/PROJECT-JOURNEY-EN.md`（英文伴随版，约 5500-7500 words）

同样的 6 部分结构，Part 2 同样扩充。目标读者：不读中文的子集（国际合作方、TÜV 联络人、有非中文参与者的投资人对话）。交叉引用中文版以取详细内容；但 Part 2 的技术 principles + 金句在英文版里要完整保留（因为是可迁移给其他项目的"code smell / design smell" 级别的洞察，英文读者更可能在新项目复用）。

---

## 4. 内容范围

### 4.1 要包含

- **量化 metrics**：rule counts / ACTIVE count / test count 的时间演变，挂到 phase-level commit SHA
- **决策 + 理由**：比如"为什么选 BEV × DE 作 pilot anchor" — 真实推理，不是事后辩护
- **Commit references**：关键 anchor commits（`ff5f6de`, `54ee504`, `b8fdc7c`, `7850bf4` 等），读者能 `git show` 拉到深度上下文
- **错误 + 修正**：人工核验抓到 StVZO §23 引用错误；research agent 修正了 RD 559/2010；Windsor Framework / NI EU alignment；ES 2035 vs 2040 ZEV 目标混淆
- **流程模式**：subagent-driven-development / dispatching-parallel-agents / 3-tier review loop — 含"什么时候 work / 什么时候不 work"
- **可复用产出**：emit-verification-backlog.ts generator、golden-regression CI、content_provenance schema、factory patterns
- **可搬走的决策**：代码 pattern、工作流 pattern、流程规则——可以挪到下一个项目的

### 4.2 要避免

- **流水账**（"4 月 21 号我做了什么"）— 按主题/章节组织，而非日期
- **编造预算数字** — 小时数给范围 + "session-record-estimated，精确未记录"免责声明
- **编造竞品细节** — 凡说 TÜV Rheinland / SGS / UL 做法的都要可查 public source，否则省略
- **编造市场数据** — "中国 OEM 欧洲销量份额"之类必须有可查 source 或省略
- **夸大当前产品成熟度** — 明说：73/196 = 37% ACTIVE，其余仍是 pilot quality
- **机密信息** — 没有 commit 里之外的个人名字（yanhao 已在 commits + attribution），没有超出公开 docs 的内部团队流程

---

## 5. 反幻觉硬规则

历程文档有独特的幻觉风险：它引诱我们在预算 / 市场 / 竞品上过度精确。硬约束：

1. **Phase 工时**：只给范围（如"20-30 hours"）。明确免责："Estimated from session records; exact hours not tracked."  不编造精度。

2. **市场 + 竞品**：凡是关于"TÜV Rheinland 怎么收费" / "中国 OEM 欧洲销量" / "咨询费率"的说法 — 要么有可查 public source link，要么省略。宁缺毋滥。

3. **ROI / revenue model**：不预测具体金额数字。维护成本给人工小时（可从我们做的事反推），不给"假设定价 $X/seat"。

4. **"重来会怎么做" 部分**：仅限 session 内观察到的实际决策 + 实际后果。不反手编造没探索的路径。

5. **Phase 0 内容**：Phase 0 在本次 session 之前。Part 1 narrative 和任何 Phase 0 的引用都直接 cite `docs/phase0/*`，不重新发明。

6. **护城河声明**：诚实 framing — "73 条 verified rules 是真正的资产；UI 一个工程师 6 个月可以 clone"。不声称我们没有的专有算法。

---

## 6. 实现笔记（给 writing-plans 阶段参考）

writing-plans 技能会把这些做成实现 plan：

### 6.1 原料清单

开写前收集：
- `git log --oneline` 关键 phase commits（Phase H/I/J/K）— 拿到 anchor SHA
- `docs/phase0/architecture.md` + `data-model.md` + `implementation-plan.md` 作为 Phase 0 事实来源
- `docs/phase12/*` 作为 Phase 12 上下文
- `docs/phase-j/verification-backlog.md` 作为当前状态快照
- `README.md` stats 段
- Session memory + TodoWrite 历史作为 phase 顺序

### 6.2 各 part 草稿顺序

按这个顺序写（每 part 独立）：
1. **Part 1 叙事最后写**（总结其他部分）
2. **Part 6 先写**（最 factual，最容易）— risks + debt + would-do-differently
3. **Part 2 技术** — 密集，从代码结构取材
4. **Part 3 产品/UX** — 从 Phase J K.1/K.2 + Phase 12 Path B 取材
5. **Part 4 商业** — 需要严格反幻觉 pass
6. **Part 5 预算** — 需要严格范围估算
7. **Part 1 + navigation map**

### 6.3 交叉引用规则

- 链接到既有文档，不重复：USER-GUIDE 管 schema，DEVELOPER 管架构，HOMOLOGATION-HANDBOOK 管操作手册，docs/phase0/* 管 baseline
- 包含 "how to read this file" 简介（2-3 句），指向 navigation map
- 每 Part 结尾加 "see also: [existing doc]" 如果有自然 overlap

### 6.4 commit 前验证

最终 `git commit` 前：
- 跑 `grep -nE "\\[verify\\]" docs/PROJECT-JOURNEY*.md` — 每个 [verify] marker 必须在脚注或附录，**不能在正文**
- 抽查具体数字（小时数、rule counts、commit SHA）对源头
- 确认没有编造的竞品名 / 市场数据
- 跑 `wc -w`：中文版 6000-8000 字，英文版 4000-5500 字

### 6.5 不改测试

这是纯文档。`tsc / lint / vitest` 不应受影响。结尾跑一次全套，确认仍 230/230 绿。

---

## 7. 超出范围

- **不创建 ADR**：这里回溯性编码的决策**不是** ADR。如果某决策值得 ADR，单独放 `docs/adr/`。
- **不做营销内容**：这是回顾 + 参考，不是产品 pitch。
- **不生成图表**：不加 Mermaid / ASCII 架构图 — 依赖 README + DEVELOPER 里现有的
- **不做 phase 深挖**：`docs/phase*/` 目录归各 phase 具体细节所有。这份 doc 跨 phase 抽象
- **不做 privacy / compliance 审计**：我们做的是 compliance 工具，但这份 doc 是工具自身历史，不是 GDPR/SOC-2 合规产物
- **不承诺更新 cadence**：这份 doc 在 2026-04-21 截面写成；后续更新是 opt-in，不自动触发。Phase L+ **不**必保持同步

---

## 8. 完成的定义（DoD）

- 两个文件都存在：`docs/PROJECT-JOURNEY.md`（zh）+ `docs/PROJECT-JOURNEY-EN.md`（en）
- 中文版 8000-11000 字，英文版 5500-7500 words（Part 2 扩充后的新目标）
- 两份都有全部 6 parts + navigation map
- **Part 2 技术沉淀 独占 3000-4000 字（zh）/ 2200-3000 words（en）** — 是最重的一部分
- **Part 2 的"金句集"（§2.16）+ "反例决策"（§2.17）必须都保留** — 以后回来翻的最高价值部分
- **信任三轴（§2.15）的抽象洞察必须独立章节讲透** — 可复用性最高
- Budget 部分每个数字都有范围 + "session-estimated" 免责
- 无编造的竞品 / 市场数据
- 至少 8-10 个 phase anchor commit SHA 被引用（技术部分增加具体 commit refs 引用密度）
- 交叉引用 README / USER-GUIDE / DEVELOPER / HOMOLOGATION-HANDBOOK / docs/phase0 在自然的位置出现
- 每个文件末尾有 navigation map
- `grep -nE "\\[verify\\]"` 在正文部分返回零（附录的 marker OK）
- `npx tsc --noEmit && npm run lint && npx vitest run` → 全绿
- 一次性 commit，信息清楚；push 到 origin/main

---

## 9. Open questions — 无

全部 3 个 design section（outline / scope / 反幻觉）在 spec 写之前已经经用户批准。进入 writing-plans。

---

## 10. 下一步

用户批准这份 spec 后：
1. （approve）调用 `superpowers:writing-plans` 生成实现 plan
2. Plan 存在 `docs/superpowers/plans/2026-04-21-project-journey.md`
3. Plan 通过 `executing-plans` 或 `subagent-driven-development` 执行
4. 最终交付：`docs/` 里 2 个新文件，1 个 commit，push 到 main

无代码改动。纯文档工作。预计投入：45-90 分钟的 agent 工作。
