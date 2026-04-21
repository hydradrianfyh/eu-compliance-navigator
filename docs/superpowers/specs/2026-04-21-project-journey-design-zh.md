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

### 3.1 `docs/PROJECT-JOURNEY.md`（中文主版，约 6000-8000 字）

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

Part 2 — 技术沉淀（Technical; 约 1500 字）
  2.1 架构四层（UI / Evaluation / Registry / Configuration）— 为什么这么分
  2.2 Hard-gate 原则：非 ACTIVE rules 不能返回 APPLICABLE — 保护用户不被噪音误导
  2.3 Schema 里承重的三个字段：
      - lifecycle_state — governance 的唯一真相
      - content_provenance — 反幻觉的基础 (human_reviewer: null = not trusted yet)
      - manual_review_reason — 承认不确定性，在 UI 上 surface 出来
  2.4 Factory patterns: makeSeedRule + uneceRule — 为什么工厂锁 lifecycle
  2.5 Pilot fixture 作为 regression anchor — applicable_rule_ids "可增不可减" 原则
  2.6 反幻觉栈：
      - [verify] markers 限制在 notes / manual_review_reason
      - source-policy.md 的 3-field ACTIVE gate
      - Research agent parallel dispatch 作为防编造机制
      - 人工核验轮真的抓到错（StVZO §23 例）

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

### 3.2 `docs/PROJECT-JOURNEY-EN.md`（英文伴随版，约 4000-5500 字）

同样的 6 部分结构，精简英文版。目标读者：不读中文的子集（国际合作方、TÜV 联络人、有非中文参与者的投资人对话）。交叉引用中文版以取详细内容。

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
- 中文版 6000-8000 字，英文版 4000-5500 words
- 两份都有全部 6 parts + navigation map
- Budget 部分每个数字都有范围 + "session-estimated" 免责
- 无编造的竞品 / 市场数据
- 至少 8-10 个 phase anchor commit SHA 被引用
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
