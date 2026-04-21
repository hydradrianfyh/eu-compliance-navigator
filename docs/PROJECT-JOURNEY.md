# 项目历程 · Project Journey

**版本**：Phase K.4+（2026-04-21 截面） · 196 规则 / 73 ACTIVE · 230 tests green
**性质**：跨 phase、跨维度的回顾参考文档（**retrospective reference**），不是营销材料，也不是 phase 细节归档
**对象**：未来接手的工程师 / 潜在合作方 / OEM 客户 / 投资人 / 自己（以后回来翻）
**英文对照**：[PROJECT-JOURNEY-EN.md](./PROJECT-JOURNEY-EN.md)
**相关文档**：[README.md](../README.md) · [DEVELOPER.md](./DEVELOPER.md) · [USER-GUIDE.md](./USER-GUIDE.md) · [HOMOLOGATION-HANDBOOK.md](./HOMOLOGATION-HANDBOOK.md) · [docs/phase0/](./phase0/) · [docs/phase-j/](./phase-j/)

> **怎么读这份文档**：6 个 Part 彼此独立，按主题不按时间线组织。读完 Part 1 开场叙事（1 页）之后，根据你的角色跳到末尾的 **Reader Navigation Map** 找推荐路径。不用通读。

---

## 目录

- [Part 1 · 开场叙事：从 0 到 73 ACTIVE](#part-1--开场叙事从-0-到-73-active)
- [Part 2 · 技术沉淀（Technical）](#part-2--技术沉淀technical)
- [Part 3 · 产品与 UX 决策（Product / UX）](#part-3--产品与-ux-决策product--ux)
- [Part 4 · 商业与市场 insights（Business）](#part-4--商业与市场-insightsbusiness)
- [Part 5 · 预算 / 投入 / ROI（Budget）](#part-5--预算--投入--roibudget)
- [Part 6 · Open risks + 技术债 + 重来会怎么做](#part-6--open-risks--技术债--重来会怎么做)
- [Reader Navigation Map](#reader-navigation-map)

---

## Part 1 · 开场叙事：从 0 到 73 ACTIVE

EU Vehicle Compliance Navigator 从一份 Phase 0 baseline 起步：13 个 legal families taxonomy、34 条 seed rules、4 层架构（Configuration / Registry / Evaluation / Presentation）在 `docs/phase0/architecture.md` 与 `docs/phase0/data-model.md` 里确立了下来。那一阶段所有能声称 ACTIVE 的规则都只有 14 条，其余是 SEED_UNVERIFIED / DRAFT / PLACEHOLDER 的占位 — 工具是一个"声明了方向但空心"的骨架。

**关键转折**有四次：

- **Phase 11 — pilot-driven work guidance**（Sprint 10 关账）把工具从"规则目录"变成了"SOP 锚定的工作台"：同一组规则在 Setup + Status + Plan 三个视图下分别服务输入者、管理层、项目经理；`fixtures/pilot-my2027-bev` 成为 regression anchor，任何 commit 都要对齐它的 APPLICABLE 集合。
- **Phase H UNECE 补强 → Phase I breadth 扩张**（Phase H.6 关账 `54ee504`，Phase I 从 `0dd20ca` → `ff5f6de`）引入 `fuelType` 字段与 5 个派生 flag（`hasCombustionEngine` / `hasDieselEngine` / `hasFuelTank` / `hasOBD` / `isPlugInHybrid`），打破了早期 BEV-only 的偏见；Phase I.2（`1e20189`）补 ICE/PHEV emissions 与 UNECE enrichment，同批次新增 45 条规则（emissions/UNECE/UK/ES/DE/FR overlay），把 registry 从 ~150 推到 196。
- **Phase J 人工核验轮**（commits `379eb1a` → `afc4f50`）在大约一个月内跑了三轮 human-review，把 39 条规则从 SEED_UNVERIFIED 升到 ACTIVE：Round 1 DE 深挖（`379eb1a` / `b23ebfb`：DE-006/008/010），Round 2a EU emissions + battery 分项（`8fa919b`），Round 2c ES 批次（`b8fdc7c`），Round 3 UK/FR/EU residual（`79e3574` / `d42ec2f` / `afc4f50`）。结果是 **34 → 73 ACTIVE**。
- **Phase K 管理层友好 UX + 文档刷新**（commits `1556ada` → `7850bf4`）：K.0（`1556ada`）让 schema 里早就存在的 `manual_review_reason` 在 UI surface；K.1（`1bf6e79`）刷新 ScopeBanner；K.2（`3afaf9a`）给 Status/Plan 加 3 秒可读的 exec summary；K.3（`cea18c1`）刷新全部 README/USER-GUIDE/DEVELOPER；K.4（`7850bf4`）新增 Homologation Handbook。本文档（spec `5668a73`）属于 K.4+。

**当前状态**：196 规则 / 73 ACTIVE（37%）/ 230 tests green；DE 与 UK 达到 production-grade 覆盖（DE 5 条 ACTIVE overlay + UK 10 条 AV Act 2024 集群），ES 与 FR 是 indicative（authored 但部分 URL 未核验），NL 还是 placeholder。MY2027 BEV × DE pilot 落在 **30 条 APPLICABLE**，从 Phase 0 的 16 → Phase I 的 21 → Round 2c 的 25 → 当前 30，一路可增不可减。

**下一步**：NL 批次 URL 核验（5 条 SEED_UNVERIFIED 已 authored）；UNECE Annex II 残余 43 条 PLACEHOLDER 按 pilot-triggered 节奏继续；DE-009 KBA 权威链拆分。长期方向是 Phase L 级别的能力扩张（未来再决定优先级）。

整条路径是一次"从 scaffold 到 production-grade 覆盖 1-2 个国家"的典型案例：绝大部分工程化投入不在 UI 或 engine 上，而在 **规则内容的 provenance 与 human verification 流水** 上。

---

## Part 2 · 技术沉淀（Technical）

本部分最重，约 3000-4000 字。理念：即使某个观察当时看起来平常，未来可能是关键灵感。宁多不漏。

### 2.1 四层架构（UI / Evaluation / Registry / Configuration）

Phase 0 一开始就在 `docs/phase0/architecture.md` §1.1 固化了四层责任：**Configuration** 是 input（`VehicleConfig → EngineConfig` 派生），**Registry** 是 pure data（Zod 验证的 `Rule[]`），**Evaluation** 是纯函数（`config × rule → EvaluationResult`），**Presentation** 只 render。每一层的边界是硬约束：

- UI 不算东西（只消费 `EvaluationResult`）
- Evaluator 无副作用（不写存储、不打日志、不 fetch）
- Registry 是纯数据（`rule` 对象 literal + Zod schema）
- Configuration 单向派生（`VehicleConfig → EngineConfig`）

**为什么这么分**：责任分离 + 可测试 + 可迁移数据层。今天 `RegistryAdapter` 接口让未来迁移到数据库只需要换一个 adapter，engine 和 UI 都不动。

**怎么知道边界被破坏**：code reviewer 反复 flag 同一句话——"UI 开始计算了，移回 engine"。Phase J.5（`2f95c4b`）就是这样被抓到的；后来这句话变成了一个 catchphrase。

**可迁移性**：任何"决策逻辑 + 可变 input + 规则数据"的系统都能套这个分层。类似案例：权限引擎、feature flag 系统、报销审批、合规扫描、税率计算。

### 2.2 Hard-gate 原则：governance 在评估层强制

第一原则：**非 ACTIVE rules 永远不能返回 APPLICABLE**。实现位置在 `src/engine/evaluator.ts:113-121`——一段硬编码 downgrade 逻辑，把 SEED_UNVERIFIED / DRAFT 的任何 match 降成 CONDITIONAL，PLACEHOLDER 总是 UNKNOWN。

**为什么放评估层而不是 authoring 层**：如果靠作者"自觉"标 lifecycle，一定漏。人会忘记，新人会绕过。**把约束放到评估层，让作者无法违背**——写得再离谱，运行时也会被拉回。

**可迁移**：凡是"数据质量档 × 输出置信度"的系统都能套。数据质量 → 决策置信度、模型版本 → 预测 surface、证据等级 → 诊断建议——都是同一个模式：元数据控制输出权限，且控制点在消费端。

### 2.3 Schema 里承重的三个字段

#### 2.3.1 `lifecycle_state` — governance 的唯一真相

5 个状态：`PLACEHOLDER` / `DRAFT` / `SEED_UNVERIFIED` / `ACTIVE` / `ARCHIVED`。promotion gate 不是"编辑这个字段"而是"满足这些条件"（`official_url`、`oj_reference`、`last_verified_on` 三者齐备 + human reviewer 签字）。`promotionLog` 记录每次 transition 与 reviewer identity。

#### 2.3.2 `content_provenance.human_reviewer` — 真正的信任信号

**关键洞察**：**真正的信任信号不是 `lifecycle_state`，是 `human_reviewer` 字段**。早期的 ACTIVE 规则里有 `human_reviewer: null`——lifecycle 是 ACTIVE 但没有具体人签过字。Phase J 反幻觉工作就是把"信任"从 lifecycle 抽离到独立字段。

→ **governance 状态**（rule 进到哪一档）和 **数据血统**（谁核验过）是两个正交维度。这个分离在之后的每一次验证轮都起作用：Round 2c 能在 ES 批次里一边把 URL 填进 `sources[0].official_url`（推进 lifecycle），一边在 `human_reviewer` 里记 `yanhao`（推进 provenance），两件事独立进展。

#### 2.3.3 `manual_review_reason` — 承认不确定性并在 UI surface（最重要的 insight 之一）

**Phase K.0（`1556ada`）的故事**：工具早就有 `manual_review_reason` 字段，但只在 Coverage tab 的 VerificationQueuePanel 里 surface。用户（homologation 工程师）看着 Rules 页的 RuleCard 里一堆 "Indicative" 徽章，不理解"为什么还是 indicative"——**不是"不知道"，而是"不知道为什么不知道"**。

K.0 的动作就一条：把 `manual_review_reason` 在每一张 SEED_UNVERIFIED / DRAFT / PLACEHOLDER 的 RuleCardV2 顶部 inline 显示，字段早就在 schema 里，只是没 surface。这次 UX 改动只改了 UI render 层，registry 一行没碰。直接解决的是 6 条 ES 规则（它们在 K.0 一起补了 `manual_review_reason`），更重要的是改变了未来所有非 ACTIVE rule 的呈现方式。

**可迁移模式**：**凡是产品显示"灰色/待定/未决"状态的，都应该附带一个"为什么"字段并且显式化**。Stripe 的 `decline_reason`、Kubernetes 的 `condition.message`、GitHub Actions 的 skip-reason——都是一类。

#### 2.3.4 这三个字段为什么是"承重"

如果只能保留三个字段用来表达 "规则可不可靠"，就是这三个：**lifecycle 表示该不该进 evaluation，provenance 表示谁签过字，manual_review_reason 表示若 pending 是卡在哪**。其他一切（source family、oj_reference、temporal scope）都是细节。

### 2.4 Factory patterns（工厂比约定强）

Registry 里用两个 factory:

- **`makeSeedRule()`**：应用 schema 默认值 + 运行时 Zod 验证；作者只写差异字段。
- **`uneceRule()`**：把 lifecycle **硬锁到 SEED_UNVERIFIED**，任何 UNECE R-series 规则经它产出一定是 SEED，作者无法绕过。

**教训**：factory 可以 enforce invariants 是 prose / convention 做不到的。无论文档写得多清楚，新作者都会绕过；工厂强制则绕不过。Phase J.1（`c6ce6e7`）把 `UneceAuthored.evidenceTasks` / `manualReviewReason` 加进 factory 时，老调用方不填照用默认，新调用方可选项更多——**additive extension** 保留了向后兼容。Phase I.3（`47b51a3`）给 `EngineConfig` 加 `offersPublicChargingInfra` 时走同样的思路：`.optional().default(false)`，让旧的用户 localStorage 不破；Phase I.6（`ff5f6de`）又补了一次 back-compat 修复确认。

**可迁移**：schema 演进 + factory pattern 是长期系统的必备基础设施。短命项目可以不管，任何预期超过一年的 schema 都要从第一天就按 additive-only + 工厂封装 的规则来改。

### 2.5 Pilot fixture 作为 regression anchor

`fixtures/pilot-my2027-bev.ts` + `fixtures/pilot-my2027-bev.expected.ts` 是整个系统的行为基准线。规则：

- **`applicable_rule_ids` 可增不可减**。BEV × DE pilot 在 Phase 0 是 16 条 APPLICABLE，Phase I 底 21 条，Round 2c 25 条，当前 30 条——一路只增。若 commit 导致减少，必须在 PR 里记录理由才接受（通常只有 "此规则本就不该对 BEV 适用" 这种诊断性修正才配）。
- **用 fixture 验证 end-to-end 行为，不用 unit test 验证内部细节**。Fixture 是"一个真实项目配置"，evaluation 必须在这个配置下稳定。
- **Soft range assertions**：例如 `conditional_count_range: [25, 60]`，表达"应该有几十条 CONDITIONAL"这种意图，避免每次 authoring 增量都要改具体数字。
- **Snapshot tests 是 audit artifacts**：`git diff tests/unit/__snapshots__/` 是每次 commit 前的手工 review step——snapshot 不是真相，是审计证据。

**可迁移**：任何有"配置 → 结果"的系统都应该有 golden fixture。哪怕一个（BEV × DE）也比零个强，它让"这次改动到底影响了什么"变得可见。

### 2.6 反幻觉栈：多层防御不是单点（关键段落）

这是整个项目投入时间最多的 meta-concern。八层：

1. **Schema 层**：`content_provenance.human_reviewer: null` = "不可信"；governance test 跑 `validateRegistryIntegrity(activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification)` 作为 hard gate——ACTIVE 规则缺 URL / OJ / 核验日期直接测试失败。
2. **Authoring 层（[verify] 标记）**：`[verify]` 只能出现在 `notes` / `manual_review_reason` / `source.oj_reference` 里，**不能污染 `obligation_text`**（用户看到的文字）。Phase I.4 ES 批次（`cc55a82`）就是因为 `[verify]` 漏到了 obligation_text 被 code reviewer 打回去过一次——后来在 Round 2c 审查中作为模式记录下来。
3. **Review 层**：spec reviewer + code reviewer 两轮 loop。spec reviewer 负责"这条规则 scope 是否与它引用的条文对齐"，code reviewer 负责"代码变更没打破既有契约"。两种视角互补。
4. **Test 层**：governance test 看 registry integrity；pilot acceptance test 看行为稳定性（就是 §2.5 的 fixture）；单测看 evaluator 的 edge case。
5. **UI 层**：lifecycle badge（TrustBadge 把 lifecycle 翻译成 Verified/Indicative/Pending）+ "Why indicative only" callout 显式告诉用户"我不完全相信这条"。
6. **Human 层**：人工核验轮真的抓到 AI 抓不到的错。**StVZO §23 是 Oldtimer（历史车辆）不是 Kennzeichen（牌照）**——Round 1 DE（`379eb1a` / `b23ebfb`）由人把 gesetze-im-internet.de 页面打开看了一眼就发现了，AI research agents 之前 missed。人工核验贵，但产出的是 ground truth。
7. **AI-vs-AI 层**：parallel research agents 做 citation triangulation。ES 批次里 research agent 抓出了 5 处 spec 错误——RD 559/2010 是 **Industrial Registry** 而不是 homologación individual；Ley 7/2021 ZEV target 是 **2040** 不是 2035；RD 110/2015 是 **RAEE**（WEEE 电子废物）不是 batteries。每个都是 citation 错配，人工不容易瞬间抓到，但 parallel agents 便宜，可以同时跑 5-10 个独立查。
8. **关键教训**：**每层都有失败模式，多层冗余才靠谱**。各层抓到的错类型互补——Schema 层抓缺字段，Review 层抓内容 vs scope 偏差，Test 层抓行为 regression，UI 层抓用户认知盲区，Human 抓事实错误（最贵最 ground-truth），AI research 抓 citation 错误（便宜可并行）。把八层当成栈，每一条 suspicious 规则都应该在至少三层上留痕。

### 2.7 数据模型的关键决策

#### 2.7.1 `RuleTemporalScope` 七字段结构

替代了早期的 `effective_from` / `effective_to` 二字段方案，改为：`entry_into_force` / `applies_to_new_types_from` / `applies_to_all_new_vehicles_from` / `applies_to_first_registration_from` / `applies_from_generic` / `effective_to` / `small_volume_derogation_until`。这直接对应 automotive 的 phase-in 模式——一条 EU regulation 可能**对新型号从 YYYY 开始，对所有新车从 YYYY+2 开始，对小批量延迟到 YYYY+5**。

Engine 侧根据 `config.approvalType` 选字段：`new_type` 比 `applies_to_new_types_from`，`carry_over` / `facelift` 比 `applies_to_all_new_vehicles_from`，横向法规比 `applies_from_generic`。

**可迁移**：任何"多时点生效"的法规 / 政策系统都需要这个维度拆开。税法、医保目录、进口限制——都有类似 phase-in 结构。

#### 2.7.2 Trigger logic：declarative 为主 + custom evaluator escape hatch

80% 声明式 + 20% custom——"选择性复杂"（selective complexity）。声明式条件（`{ field, operator, value }`）对绝大多数规则够用；**DCAS R171 "if fitted"** 这种需要系统级推理的用 `customEvaluators["dcas_if_fitted"]` 命名挂出来。避免了"要么全 DSL 要么全代码"的二元陷阱。

**教训**：DSL 设计里最大的陷阱是贪心——想用 DSL 表达所有东西。**留一个 named escape hatch，把 20% 不好表达的留给代码**，80% 的声明性优势照样拿到。

#### 2.7.3 `OwnerHint` 受控词汇表

12 个预定义的 owner 类别：`homologation` / `safety_engineering` / `cybersecurity` / `software_ota` / `privacy_data_protection` / `ai_governance` / `sustainability_materials` / `legal` / `aftersales` / `regulatory_affairs` / `powertrain_emissions` / `connected_services` / `other`。这个 enum 让 Plan tab 的 Owner Dashboard 能聚合——按 owner 分组、按 owner 过滤、按 owner 生成跨规则清单。

**可迁移**：**controlled vocabulary > free text**，任何要支持跨切面视图的系统都需要。自由文本字段里 "Safety Team" / "safety" / "SafetyEng" / "safety-eng" 都存在过，聚合就崩了。

#### 2.7.4 Related rules 作为有向图

`{ rule_id: "REG-CS-001", relation: "complements" | "requires" | "conflicts" }`——让规则之间的依赖被 first-class 表达出来。enable 三件事：rule card 上的"参见"导航、一致性检查（如 A requires B 但 B 已 ARCHIVED 触发 warning）、依赖可视化。

### 2.8 Config-as-pure-input 模式

`VehicleConfig → EngineConfig` 派生一次，之后整条 evaluation 管线就是 pure function of config。Phase I.1（`0dd20ca`）加的 5 个派生 flag（`hasCombustionEngine` / `hasDieselEngine` / `hasFuelTank` / `hasOBD` / `isPlugInHybrid`）都是 `VehicleConfig.powertrain + VehicleConfig.fuel` 的派生，保持了这个 invariant。

**教训**：**如果 state 是 immutable + derivable，其他子系统全都简化**。URL sharing（`VehicleConfig` JSON encode 进 query string）、localStorage persist、undo/redo、time-travel debug——全都是"便宜的"，不需要单独建架构。相反，如果 config 里有派生的 mutable state，任何持久化都要额外处理。

### 2.9 规则拆分：ADR-H7 Euro 7 三分

`docs/adr/ADR-H7-euro-7-rule-split.md` 记录了一条看似奇怪的决策：**把 Regulation (EU) 2024/1257 Euro 7 拆成三条规则**（而不是一条大规则），按 powertrain 分：

- `REG-EM-001` Euro 7 框架（所有 M1/N1 都 trigger）
- `REG-EM-013` Euro 7 combustion exhaust + OBFCM（只在 `hasCombustionEngine` trigger）
- `REG-EM-014` Euro 7 battery durability（只在 `batteryPresent` trigger）

**为什么拆**：如果一条规则的 trigger 内部有 branching（"这条对 ICE 是 A 测试、对 BEV 是 B 测试"），evidence_tasks 就会变成 ICE + BEV 的混合，用户看到没法直接 assign。拆开之后每条规则的 evidence 都干净：combustion 的给 powertrain_emissions owner，battery 的给 sustainability_materials owner。

**可迁移原则**：**如果一条规则的 trigger 条件内部有分支，拆成多条更清晰**。宁可规则数量多一点，保持每条规则 monomorphic（单一形态）。

### 2.10 Subagent-driven development 的经验

Phase H / I / J 大量用 subagent。几条用出来的经验：

1. **Fresh subagent + clean prompt > 单 agent + 长 history**。新 agent 的 context switching cost（spin-up）永远小于 long-session 的 context pollution cost（模型注意力分散、早期错误 compound）。
2. **Parallel implementer 有冲突风险**——两个 agent 同时改一个文件，merge 时一定出错。所以 implement 阶段 serialize commits，**只在 research 阶段并行**。
3. **Research agents 可以放心并行**。他们不写 code，天然无冲突；而且 triangulation（多个独立来源得到同一结论）是反幻觉最强武器。ES 批次里 3 个 research agent 同时查各自一片，收上来的 citation 错误全部是独立发现的。
4. **新 subagent 不等于无状态**——要给它一份当前 registry snapshot 和明确的 scope 边界（"只动 `src/registry/seed/member-state-overlay.ts`，不碰 engine"），不然会越界。
5. **金句**：**agent-to-agent 工作模式，每个 agent 是一个"disposable worker"——用完即弃；不要和 agent 建立长对话**。把工作切成能被清晰 prompt 描述的任务块。

### 2.11 文件组织（per-responsibility, not per-domain）

`src/registry/seed/*.ts` 按 legal_family 切：`vehicle-approval.ts` / `general-safety.ts` / `cybersecurity.ts` / `emissions-co2.ts` / `materials-chemicals.ts` / ... 横切的逻辑放外面：

- `shared.ts`——factory
- `classification.ts`——横切 enrichment
- `evidence-enrichment.ts`——横切 evidence 补强
- `freshness-data.ts`——横切 review cadence
- `index.ts`——composition（`applyEnrichments` 合并所有）

**教训**：**一个文件一个 responsibility**，便于定位 + review + reason。

**阈值**：当某文件超过 1500-2000 行就该拆。`member-state-overlay.ts` 已经到 2692 行（见 §6.2），接近临界。`emissions-co2.ts` 998 行，也在警戒区。

### 2.12 UI 语言 vs Engine 语言的显式映射

Engine 说：`ACTIVE / SEED_UNVERIFIED / DRAFT / PLACEHOLDER / ARCHIVED`。UI 说：**Verified / Indicative / Pending**。`TrustBadge` 组件做翻译，`src/lib/classify-trust.ts` 里定义映射表。

**教训**：**用户词汇 ≠ 治理词汇**。schema-native term 保留精确语义（governance 需要 5 个状态），UI 用更少、更直观的概念（用户只关心 "我能信到什么程度"）。不要让用户学你的内部 enum。

### 2.13 Schema 不支持的东西怎么办

ES CCAA（Comunidad Autónoma）子国家地区差异：Madrid 的 ZBE（低排放区）和 Catalonia 的不同，但我们 schema 的 `targetCountries` 只到国家粒度，没有 region 字段。两条路：

- 选项 A：给 schema 加 `targetRegions: string[]`——代价：所有 registry 规则、engine、UI、config persistence 全要改，为一个 country 动全局。
- 选项 B：**承认工具边界**，加一条 aggregate advisory rule `REG-MS-ES-014`——告诉用户"ES 有 CCAA 变异，这个维度需要你自己另做尽调"。用户知道这个盲点，不会被工具误导。

选了 B。**教训**：**承认工具边界比强行扩展 schema 强——工具不对用户撒谎**。如果有 10% 的真实世界维度是 schema 不支持的，与其扩一个半生不熟的字段，不如显式写明"这方面不 cover"。

### 2.14 Evidence tasks 必须可操作

对比：

- 反例：`Ensure compliance with Art. 13`
- 正例：`Battery label artwork approval per Annex VI format including QR linking to passport`（REG-BAT-009 里的）
- 正例：`Demontage-Informationen sheet in German within 6 months of new-type launch`（REG-MS-DE-010 AltfahrzeugV 里的）

每一条 `evidence_task` 是一个具体的 deliverable（文档、测试、sign-off），可 checkbox 化、可 assign 到 `owner_hint`。

**教训**：**抽象义务在 authoring 时就要变具体——工具不把锅甩给用户**。规则里写 "符合 Art. 13" 等于没说，换个位置还是要求工程师自己去翻法条。在 authoring 时做一次 unpack，所有后续读者受益。

### 2.15 信任的三个正交轴（关键抽象洞察）

**人们常把这三个混在一起，实际是独立的维度**：

1. **信任（Trust）**：这条规则的源头可不可信？——由 `lifecycle_state` + `content_provenance.human_reviewer` 回答。ACTIVE 且 `human_reviewer: yanhao` 才算"可信"。
2. **适用性（Applicability）**：对当前项目适不适用？——由 `trigger_logic` + `EngineConfig` 回答。BEV × DE 的 30 条 APPLICABLE 是这一轴的输出。
3. **新鲜度（Freshness）**：最近核验过吗？——由 `last_verified_on` + `review_cadence_days` 回答。即便 lifecycle 是 ACTIVE 且 human_reviewer 有值，如果 `last_verified_on` 已经过了 6 个月 review cadence，就进 `overdue` / `critically_overdue` / `drifted` 状态。

**为什么这分离很重要**：三轴之间没有 derivation 关系，任何两轴都可能一个 green 一个 red。常见场景：

- Trust ✓ / Applicability ✓ / Freshness ✗：规则是 ACTIVE、适用、但 stale — 需要 re-verify，不删规则。
- Trust ✗ / Applicability ✓ / Freshness N/A：规则对项目适用但来源不可信 — 标 Indicative，提示人工审。
- Trust ✓ / Applicability ✗ / Freshness ✓：规则可信、新鲜，但对该项目不 trigger — 不进 checklist。

**可迁移**：**任何规则引擎 / 政策系统 / 知识库都受益于这个分离**。医疗决策（证据等级 × 病人匹配 × 指南时效）、法务合规（法条状态 × 企业关联 × 最后更新）、安全扫描（CVE 可信度 × 系统受影响 × 最后扫描时间）——同一套三轴。**这可能是整个项目里抽象价值最高的一段**。

### 2.16 金句 / 可复用 principles 集（以后直接拿出来用）

17 条一句话 principles。每条一两句上下文。

1. **"Non-ACTIVE rules must never return APPLICABLE"** — governance 第一原则。放 `src/engine/evaluator.ts` 最前面的 hard-gate。任何规则引擎都该从这一条开始设计。
2. **"UI renders, engine computes"** — 责任边界。任何 UI 里出现"如果 X 就 Y"的条件计算，先问能不能放 engine。
3. **"[verify] 活在 notes 里，永远不进 obligation_text"** — 反幻觉硬规则。Phase I.4 ES 批次就是这条被违反时抓的教训。
4. **"Pilot regression anchor: applicable_rule_ids may grow but must not shrink"** — 回归守护。所有跨 phase 的 behavior 变更都经这一关。
5. **"Silent under-serving 是最差的失败模式"** — PHEV fixture 诊断那次的教训。规则不 trigger 比规则错 trigger 更隐蔽更危险，用户不会抱怨一个没出现的东西。
6. **"Fresh subagent beats long conversation"** — subagent-driven-development 核心。新 prompt 从 clean slate 开始，比试图教老 agent 遗忘之前错误更省力。
7. **"Dispatch parallel research agents BEFORE writing anything"** — 写 authoring 之前多轮 citation triangulation，省下后面 review 轮的返工。
8. **"Human verification catches real errors AI verification cannot"** — StVZO §23 的教训。AI triangulation 强但不覆盖 primary source 细节差异。
9. **"Trust ≠ Lifecycle ≠ Applicability — three separate axes"** — §2.15 的浓缩版。
10. **"Factories enforce invariants, prose/convention cannot"** — 文档永远拗不过人的自觉，factory 能。
11. **"Controlled vocabulary > free text"** — owner_hint / legal_family / lifecycle 都是。跨切面视图的基础。
12. **"If your data is immutable + derivable, the rest of the system simplifies"** — config-as-pure-input 的核心回报。
13. **"Schema 不支持的事情，告诉用户而不是 hack"** — ES CCAA 的教训。
14. **"Test snapshot 是 audit artifact，不是 baseline"** — snapshot diff 是 review 素材，不是 "是什么就是什么" 的绝对真相。
15. **"Additive schema changes should default; existing data shouldn't break"** — `.optional().default(x)` 是长命系统的基础语法。
16. **"Acknowledge tool boundaries rather than fake omniscience"** — CCAA 案例。诚实显式的"不 cover"比 misleading 的"假 cover"强。
17. **"Evidence tasks are deliverables, not aspirations"** — "符合 X 条" 不是 evidence，"提交符合 X 条的 Y 报告" 才是。

### 2.17 反例：考虑过但拒绝的决策

**这部分比"做了什么"更有 reference 价值——它 encode 了 constraint knowledge**。

1. **考虑过：把 CCAA 拆成 per-region rules** —— 拒绝。schema 不支持，hack 代价过高。见 §2.13 的决策过程。替代方案：aggregate advisory `REG-MS-ES-014`。
2. **考虑过：引入后端 API** —— 拒绝。`AGENTS.md` 的 non-goal 明确要求零后端（Next.js static export）。如果加后端，host + auth + data-residency + cost 全是新问题，而当前 scope 不需要。
3. **考虑过：UNECE R161 作为独立规则** —— 拒绝。R161 覆盖的 ADB（Adaptive Driving Beam）实际在 R149 内部，独立规则是幻觉。Research agent 一开始把 R161 当 standalone 返回，human review 在 gesetze/UNECE portal 确认后拒掉。
4. **考虑过：LLM runtime 评估** —— 拒绝。三重代价：reproducibility（同配置不同输出）、cost（每次 evaluation 开销）、latency（秒级 vs 毫秒级）。评估层必须是 deterministic 纯函数（见 §2.2）。
5. **考虑过：把 Ley 3/2023 ES 标 ACTIVE** —— 拒绝。enactment 状态未核实（ES 有法律"发布"和"生效"的时间差）。要求 URL 打开能看到 "En vigor" 状态后再升。留在 SEED_UNVERIFIED 作为 honest 状态。

**教训**：把"没做"的决策记下来比"做了"的更有 reference 价值——新人第一反应往往是这些已经被探索过的死胡同。写下来 = 防止后继者再走一遍。

---

## Part 3 · 产品与 UX 决策（Product / UX）

### 3.1 Progressive disclosure 原则

Phase K.2（`3afaf9a`）把 Status 与 Plan tab 改成**3 秒 exec block + 下面展开的详情**两段式：管理层打开看第一屏就知道 "OK WITH CAVEATS / AT RISK"，工程师往下翻能读到每条规则的条件与 evidence tasks。这是整个工具对 "异质受众同一数据" 的核心回应——同一个 `EvaluationResult`，三种深度呈现（3 秒 / 30 秒 / 3 分钟），谁都不被架空。

**教训**：不是所有受众都需要同样的信息密度。管理层扫的是 verdict + 3 个 top blocker，工程师扫的是 per-rule evidence 与 owner assignment。**同一 payload，分层 render**。

### 3.2 三层信任（Verified / Indicative / Pending）

Engine 有 5 档 lifecycle，UI 只暴露 3 档：`ACTIVE → Verified` / `SEED_UNVERIFIED + DRAFT → Indicative` / `PLACEHOLDER → Pending`。`TrustBadge` 组件做映射，`src/lib/classify-trust.ts` 是映射表。

**为什么 3 档不是 2 档（OK / not-OK）**：二元呈现会把 "authored 但未核验" 的规则和 "空占位" 的规则混在一起，前者用户应该当 "indicative working copy" 用，后者应该当 "完全未知" 看。三档显式区分，用户信任校准更好。

**教训**：**诚实的不确定分层比假信心更值钱**。用户发现工具说 "Verified" 结果其实没核验过，信任崩盘一次之后再也抢不回来。

### 3.3 "Why indicative only" callout 的故事（K.0）

Phase K.0（`1556ada`）只做了一件事——把 `manual_review_reason` 从 Coverage tab 的末端 surface 到每一张 RuleCardV2 的顶部。背景：K.0 之前用户反馈都是 "为什么这条是 Indicative，我能不能 trust"。答案一直都在 `manual_review_reason` 字段里（例："enactment 状态未核实"、"实施 SI 滚动发布"），但藏在 Coverage tab 里只有少数人点得到。

这次 UX 改动的**杠杆**：改动范围只有 UI render（一个组件），registry 一行没碰，但改变了用户对整套 Indicative 规则的理解。同时 K.0 一起补齐了 6 条 ES 规则漏填的 `manual_review_reason`——因为 surface 到顶就强制 "必须填"。

**教训**：**有时最高价值的 UX 改动只是把已经在 schema 里的信息 surface 出来**。不需要加字段，需要加呈现。

### 3.4 五个标签页的分层

工具的 5 个 tab 各服务一个角色：

| Tab | 主要落点受众 | 信息层 |
|---|---|---|
| Setup | 输入者（认证工程师、PM） | 配置表单 |
| Status | 管理层（VP、domain lead） | Top-line verdict + 3 秒 exec block |
| Plan | 项目经理 | SOP-anchored timeline + Owner Dashboard |
| Rules | Homologation 工程师 | 逐条规则的 evidence / condition / 源 |
| Coverage | 治理（rule curator、外部审计） | Lifecycle 分布 / 验证队列 / 鲜度矩阵 |

**Setup → Status → Plan → Rules → Coverage** 也是 onboarding 的自然顺序：从 "我是谁" 到 "大局" 到 "每周干什么" 到 "这周具体做哪条" 到 "覆盖有没有漏洞"。

**教训**：**每个 tab 默认回答一个角色的一个问题**。不要把 5 个 tab 都做成 "所有信息在所有视图下都能看到"——那等于没有 tab。

### 3.5 ScopeBanner 四层分组

Phase K.1（`1bf6e79`）把 ScopeBanner 重写成 4 层分组：**In scope / Pending / Pilot / Out of scope**。之前的 banner 把所有 jurisdiction 混在一起显示，管理层看不出 "DE 是 production-grade 而 FR 是 indicative" 的差别。新版本在首页就说清楚——DE + UK in scope（ACTIVE 覆盖），ES + FR pending（authored but partial verification），NL 仍在 pilot，其他 EU 国家 out of scope。

**教训**：**对管理层说真话**比 optimistic 表达更有长期价值。管理层只要第二次发现工具过度声明（"你之前说 FR 也 cover 的……"），就永远不再信第一屏的 verdict。ScopeBanner 把这个赌注押在 "诚实 > 好看"。

---

## Part 4 · 商业与市场 insights（Business）

### 4.1 目标用户：进欧洲的中国 OEM

直接用户画像是**进欧洲的中国新能源 OEM**——NIO、BYD、Xpeng、Zeekr、Geely/Lynk&Co、Leapmotor、Chery、Great Wall/ORA、SAIC MG、Li Auto 这一类。他们的 EU 进度分三档：

- **已经有活跃 EU 运营**（部分已在多国销售、有本地 homologation 合作）——工具价值在 freshness monitoring 与跨国协调，不是"第一次知道"这些法规。
- **试水阶段**（单国 pilot 在做，正在搭认证团队）——这是工具最高价值段，能替代一半"从零研究 EU 法规" 的时间。
- **只有计划**（还没 TA 申请）——工具帮他们把"要做什么"的 taxonomy 建出来，但仍需要律师和咨询伙伴。

用户不是律师、也不是管理层——**是做 homologation / regulatory affairs 的一线工程师**（见 `docs/HOMOLOGATION-HANDBOOK.md`）。

### 4.2 真正的痛点

五个具体痛点，每个都有工具的针对性回应：

1. **法规不透明**——EU 法规 24 种官方语言，一条 regulation 同时挂在 EUR-Lex、Commission 页、各成员国 gazette 上，找最新 consolidated 版本本身就是一门技能。工具用 `sources[0].official_url` + `oj_reference` + `last_verified_on` 把 "最新权威版本 + 谁核过 + 什么时候" 打包进 rule card。
2. **成员国差异**——KBA（DE）/ VCA（UK）/ UTAC（FR）/ RDW（NL）/ IDIADA（ES）每家 TA 要求、文件清单、时间窗口都不同，`member_state_overlay` legal family 专门 cover 这些（目前 DE 5 条 ACTIVE + UK 10 条 + ES/FR indicative）。
3. **审计证据链**——TA 主管部门或技术服务（TÜV / DEKRA 等）来询时要求 SOP-anchored 证据，不是"我们有个 Word 文档"。工具的 `evidence_tasks` 字段就是为此设计，每条是一个 checkable deliverable（见 §2.14）。
4. **软件/OTA lifecycle**——R155 CSMS + R156 SUMS 要求每次 OTA 都有完整 change management，不是一次性 cert 之后放手。规则里 `review_cadence_days` + drift-alert CI 帮 track 这部分。
5. **横向法规急加速**——AI Act（2024/1689）、Battery Regulation（2023/1542）、Data Act（2023/2854）、Euro 7（2024/1257）在 2024-2026 集中落地，管理层一次接不住。工具的 Status tab + exec summary 专门解决"管理层一屏看懂现在哪几项紧迫"。

进一步操作手册见 [HOMOLOGATION-HANDBOOK.md](./HOMOLOGATION-HANDBOOK.md)——本段不重复 per-country 细节。

### 4.3 工具的价值主张

三句话：

- **不是替代律师**。具体 TA 申请、合约条款、争议解决还是要合作的律所 / 咨询伙伴。
- **是 homologation 团队的日常工作台**。每天登录、按 SOP 日期排 evidence deliverable、跟 TÜV 约 review、导出 audit pack——比起一次性 consulting deliverable，是可持续使用的 surface。
- **解决"我下周要做什么"而不是"这条法律是什么"**。对用户来说最重要的是把抽象义务（"符合 Art. 13"）转成 concrete task（"提交 Annex VI 格式的 battery label 样稿给 TÜV sign-off"），这是工具和单纯 reading EUR-Lex 的根本区别。

### 4.4 竞争格局（反幻觉 pass）

按公开可查信息描述，不声称具体商业做法：

- **咨询公司（TÜV Rheinland、SGS、UL、DEKRA 类 TIC 公司）**：根据公开信息提供 regulatory compliance consulting、type-approval 支持、pre-scan 服务。具体定价结构与 engagement model 在本文档无法核实——若需准确对比，参见其官方 service catalog。工具并非替代 TIC 服务：TA 申请本身必须通过 designated technical service。
- **内部 Excel + 团队 Confluence**：这是最普遍的现状——合规信息散落在个人文件与 wiki 页，跨项目复用难，新人 onboarding 长。不需要 source 即可自明。
- **开源/公开规则资源**：EUR-Lex、UNECE WP.29 documents、European Commission 的 delegated acts 页面——都是 primary source，任何工具的 ACTIVE 规则背后最终都指向这些。
- **工具的相对位置**：在 "Excel（ephemeral）" 与 "TIC consulting（expensive + episodic）" 之间，做一个**持久化的 compliance workbench**。不是竞争 TIC 的 technical-service 证书签发权；是减轻日常 tracking + evidence assembly 负担。

**硬规则**：任何具体到 "TÜV 怎么收费" / "SGS 市场份额" 的声明，本文档没有可核实 source，**故不作陈述**。宁缺毋滥。

### 4.5 商业化路径 tradeoffs（无具体定价）

三条路，只描述结构不给金额：

1. **非商业 / 开源 / 研究**：零 revenue。persona 是爱好者 + 学术用户 + 开源贡献者。好处是自由度最高；坏处是 freshness maintenance 完全靠个人 bandwidth，长期不可持续。
2. **咨询嵌入**：与 1-2 家 OEM partner + 1 位 senior regulatory expert 签定期协议，工具作为咨询交付物的一部分。好处是收入模型明确，坏处是 scale 到第三方 OEM 时合约要重谈。
3. **SaaS 订阅**：需要先完成 automation（EUR-Lex 同步 pipeline + UI polish + onboarding 流程），minimum viable team 估 3-6 FTE 一年。好处是规模化潜力最大，坏处是前期投入与 go-to-market 是重资产赌博。

每条路径的适用条件取决于团队与 OEM 关系网络，不是技术问题。

### 4.6 护城河 + 可复制风险

**诚实 framing**：

- **真正的护城河**：73 条 ACTIVE 规则背后是实打实的 human verification bandwidth——URL 核对、OJ reference、`last_verified_on`、human_reviewer 签字。这个 1-2 人的持续投入是**难复制**的——不是 IP 难复制，是**操作节奏和 domain judgement** 难复制。
- **可复制的部分**：UI 层一个 senior 前端工程师 6 个月可以 clone。Engine 的声明式 trigger 架构 3 个月可以仿。Registry schema 本身也公开（Zod schema + 13 legal families）。**所以不要声称专有算法 — 我们没有**。
- **真正的差异化**：**ACTIVE rules + 持续 freshness review 的 bandwidth**。一个新 competitor 从零开始，面对的不是"做一个工具"，而是"建立一个 rule-content 持续 verified 的 pipeline" — 这是操作性壁垒。
- **复制窗口**：如果竞争方有 3-6 FTE 和 18 个月，能达到当前工具 70% 覆盖；但要追上并保持 freshness，仍需要持续投入，这是一个 compounding 而不是 one-off 的战役。

---

## Part 5 · 预算 / 投入 / ROI（Budget）

> **免责声明**：以下工时均为基于 session 记录的粗略估算，并未做精确工时追踪。各阶段范围反映的是"工作规模"，不反映"精确投入"。具体 commit 时间戳可在 `git log --format='%h %ai %s'` 看到，但那只是提交时刻，不是真实 author 时长。

### 5.1 各 phase 粗略投入

按 phase 的 ballpark 估算（单位：小时，每条都是范围）：

- Phase 0 设计 baseline：**约 15-25 小时**（根据 `docs/phase0/*` 规模推断）
- Phase 1-9 scaffold → evidence：**约 80-120 小时**（根据 `docs/phase12` 注释推断）
- Phase 11（11A-E pilot-driven）：**约 20-30 小时**
- Phase 12 Path B UX refactor：**约 30-40 小时**
- Phase H UNECE / ISO enrichment：**约 10-15 小时**
- Phase I breadth（I.1-I.6，45 条新规则 + fuelType 引擎 flag）：**约 20-30 小时**
- Phase J（production readiness）：**约 15-25 小时**
- Phase J 人工核验 round 1-3：**约 5-8 小时**
- Phase K（K.1-K.4 UX + docs）：**约 4-6 小时**

累计大致 **200-300 小时** — 一个人断续地跨几个月。**再次提醒：这是 session 记录估算，精确工时未记录**。

### 5.2 单位经济（per-rule）

- **1 条 SEED_UNVERIFIED → ACTIVE 升级（快速路径）**：URL 核对约 10-15 分钟 + 元数据填写约 5 分钟 ≈ **约 15-20 分钟/条**。前提是 `sources[0]` 已有 candidate URL、`oj_reference` 已 draft 好、规则 scope 已 author 过。
- **复杂规则（需要拆分或重新 author）**：**约 1-2 小时/条**。例：`REG-MS-DE-009` 需要拆成 EU-TA + 国家小批量两条，predict 约 3-4 小时的 architectural work。

### 5.3 扩展成本曲线

- **73 → 100 ACTIVE**（再升 27 条）：估 **约 9 小时** 纯人工（快速路径）。
- **100 → 150 ACTIVE**（再升 50 条）：估 **约 20 小时**。边际成本上升——剩下的都是更难的规则（delegated acts pending、国家 gazette 多语言、权威链复杂）。
- **从 0 authored 一个新 member-state overlay（DE depth）**：估 **约 40-60 小时**。包含 legal family scoping、5-10 条规则 author、URL 核验、pilot fixture update、UI scope banner 更新。

### 5.4 维护成本（长期）

- **每 6 个月一轮 freshness review**：约 30 条规则 × 10 min ≈ **约 5 小时/轮**。前提是 EUR-Lex drift-alert CI 已抓出需要复核的子集，这 5 小时是人工二次确认。
- **EUR-Lex / UNECE 重大变更触发**（如 Euro 7 implementing act 发布）：**约 10-20 小时/次**。少数活跃规则需要全重 author（split / re-scope），不是简单 URL 更新。

### 5.5 商业化 unit economics（无具体定价）

三条路径的人力 range（只给 FTE 数，不给金额）：

1. **研究 / 开源 / 社区**：0 FTE 商业化投入。持续 bandwidth 靠个人兴趣，长期不可持续。
2. **咨询嵌入**：**1 OEM partner + 1 senior regulatory expert** 可以维护 + 深化（约 0.5-1 FTE 外部 expert + 1-2 人 tooling team）。合同以 retainer 或 project-based 形式，具体 billing model 与各 OEM 合约条款相关，不在本文档讨论范围。
3. **SaaS 订阅**：需要 EUR-Lex 同步自动化、UI 商品化、onboarding 流程——**minimum viable ~3-6 FTE 一年**。覆盖：2 工程（frontend + backend/automation）+ 1 regulatory expert + 0.5 design + 0.5 go-to-market + 残余管理。

**硬规则**：本节不给任何 `$/seat`、`€/月`、`¥/年` 数字——没有可核实的 pricing 数据。

---

## Part 6 · Open risks + 技术债 + 重来会怎么做

### 6.1 仍未关闭的风险

**六个尚未解决、需要持续关注的风险**：

1. **NL 覆盖仍是 placeholder**：5 条 SEED_UNVERIFIED 已 authored（`REG-MS-NL-001..005`），但 URL 核验未完成。对要进 NL 市场的项目不可靠，工具在 ScopeBanner 里显式 disclosed。
2. **UNECE Annex II 残余**：43 条 PLACEHOLDER（pilot-triggered 集之外）。按 pilot-driven 节奏增补，不大批次 author。如果用户 config 触发其中一条但规则仍是 PLACEHOLDER，结果是 UNKNOWN——诚实但不 actionable。
3. **REG-MS-DE-009 KBA 权威链**：Round 1 Phase J 就 flag 了需要拆成两条（EU-TA 条 + 国家 small-series 条）。currently 混在一起，evidence tasks 不干净。
4. **ES CCAA 子国家变异**：Madrid / Catalonia / 其他 CCAA 的 ZBE / 税收 / 支持金差异。schema 不 cover（见 §2.13），用 aggregate advisory `REG-MS-ES-014` 告诉用户"这方面不 cover"。
5. **Commission delegated acts pending**：Euro 7 battery durability（REG-EM-014）和 BAT-010 recycled content methodology 的 implementing acts 尚未发布，规则在 "`applies_from_generic` + notes 标 pending" 状态。一旦发布需要 re-author。
6. **Windsor Framework NI 处于 DRAFT**：UK AV Act 2024 的 Secondary Instrument 在 rolling 发布，Northern Ireland 与 EU 法律对齐部分尚未完全定稿。规则显式标 DRAFT 而不是假 SEED_UNVERIFIED。

### 6.2 结构性技术债

- **`src/registry/seed/member-state-overlay.ts` 已经 2692 行**，超过了 §2.11 提到的 1500-2000 行临界，接近需要按 country 拆分（`member-state-overlay-de.ts` / `-fr.ts` / `-nl.ts` / ...）。
- **`src/registry/seed/emissions-co2.ts` 998 行**，进入警戒区。如果 Euro 7 HD 后续 author，必定超阈值。
- **两种 factory 不一致**：`uneceRule` 硬锁 lifecycle 为 SEED_UNVERIFIED，`makeSeedRule` 不锁。这个不一致是历史演化的 artifact；长期应该统一成一个 factory 或至少把"lifecycle 锁定策略"作为 factory 参数显式出来。
- **Verification backlog 生成是 manual run**（`npm run verification-backlog`），不在 CI 路径上。所以 `docs/phase-j/verification-backlog.md` 有偶尔 drift 的风险。

### 6.3 测试债

- **E2E（Playwright）只 scaffold 存在**，没有 smoke suite。UI 大改时没有 automated end-to-end 检测。
- **UI regression 靠 snapshot + 个别 component test**，没有 cross-browser matrix（Chrome / Firefox / Safari / Edge）。
- **Rule 语义正确性只靠 pilot fixtures**（BEV × DE、PHEV × DE·FR·NL、ICE × ES），没有 formal verification——即某条规则的声明式 trigger 逻辑是否真的对应法规原文范围。这是人工 review 在 Phase J human-review round 里补的。

### 6.4 流程债

- **人工核验 bandwidth 是永久瓶颈**——目前只有一个 reviewer（yanhao）。`content_provenance.human_reviewer` 是 single string 字段而不是 list，限制了并行化。
- **EUR-Lex 自动监测只到 CI drift-alert 级**，没有 pushdown 到 rule level（"这条规则引用的 URL 的 HTML 变了" 不自动标红对应 rule）。drift-alert 抓的是 fetched body 哈希，不做细粒度 diff。
- **没有 release 流程或版本号**。commit 即部署，无 semver，无 changelog（除了 git log）。对单人项目 OK，对 2+ 人团队会成问题。
- **文档更新滞后 commit** 是常态。K.3 之前 README 还写 187 rules（实际 196），数据在 `src/registry/` 里早已更新。解决办法是加 `README stats` generator script（未实现）。

### 6.5 如果重来会这样做

**保留（核心防线不动）**：

- **Hard-gate + `content_provenance` + pilot regression anchor**——这三个是整个项目立得住的核心。任何 "重来" 都不换这三条。
- **四层架构 + 纯函数 evaluation**——§2.1 的分层让所有 UX / engine / registry 演进互不干扰。

**会换的地方**：

1. **`human_reviewer` 做成 reviewer ID list 而不是 single string**——允许多人并行核验与互 cross-check。第一版 schema 设成 single 字段完全是 Phase J 之前对 reviewer bandwidth 估计不足。
2. **lifecycle_state 加 `ACTIVE_AUTOMATIC` vs `ACTIVE_HUMAN` 两档细分**——EUR-Lex scripted watch 抓到的 "URL 仍然活、内容 hash 未变" 可以自动 bump 到 `ACTIVE_AUTOMATIC`（表示"至少来源还在且未 drift"），人工核过的才是 `ACTIVE_HUMAN`。目前一档 ACTIVE 掩盖了这个差别。
3. **更早引入 evidence-pack export format**——现在导出是 CSV + Markdown，对 TÜV audit pack 来说不够结构化。如果 Phase 5 就给 evidence pack 一个 structured JSON + PDF render 流水，后面 Phase J human-review round 可能快 30%。
4. **UX exec-summary layer 应该 Phase 0 就有，不是 Phase K 补课**——Status / Plan 的 3 秒 exec block（K.2 `3afaf9a`）是管理层 critical 的，但到 Phase K 才加上。原因是早期默认用户是工程师，后来才发现 VP / domain lead 的流量也很大。早一点识别受众多样性会省下重写成本。

---

## Reader Navigation Map

根据你的角色推荐阅读路径：

| 角色 | 推荐路径 | 预计时长 |
|---|---|---|
| **新工程师（onboarding）** | Part 1 → Part 2 → Part 6.1 → Part 6.2 → Part 6.5 | 30-45 分钟 |
| **潜在 OEM 买家** | Part 1 → Part 4 → Part 5 | 约 10 分钟 |
| **投资人** | Part 1 → Part 4.4 → Part 4.6 → Part 5.5 → Part 6.1 | 约 15 分钟 |
| **技术面试展示** | Part 1 → Part 2 → Part 3 | 约 20 分钟 |
| **交接（我 → 下一任 maintainer）** | 全读 | 1-2 小时 |

---

© Yanhao FU · 2026
