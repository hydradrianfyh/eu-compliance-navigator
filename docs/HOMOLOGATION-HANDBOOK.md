# 准入工程师实操手册 · Homologation Engineer Handbook

**版本**：Phase M（2026-04-24）· 211 条规则 / **137 条 ACTIVE** · 248 tests green
**适用对象**：中国 OEM 计划欧盟市场准入的**一线 homologation / regulatory affairs 工程师**（非管理层）
**语言**：中文（English companion: [HOMOLOGATION-HANDBOOK-EN.md](./HOMOLOGATION-HANDBOOK-EN.md)）
**相关文档**：通用使用说明见 [USER-GUIDE.md](./USER-GUIDE.md)，开发者文档见 [DEVELOPER.md](./DEVELOPER.md)

---

## 目录

- [第 0 部分 · 开工之前（Preflight）](#第-0-部分--开工之前preflight)
- [第 1 部分 · 你的前 30 分钟（Quickstart）](#第-1-部分--你的前-30-分钟quickstart)
- [第 2 部分 · 读懂 Status 页](#第-2-部分--读懂-status-页)
- [第 3 部分 · 建立你的合规计划](#第-3-部分--建立你的合规计划)
- [第 4 部分 · 一条条过规则（重点）](#第-4-部分--一条条过规则重点)
- [第 5 部分 · 追踪验证覆盖率](#第-5-部分--追踪验证覆盖率)
- [第 6 部分 · 常见场景走查（Walkthroughs）](#第-6-部分--常见场景走查walkthroughs)
- [第 7 部分 · 导出证据与交接](#第-7-部分--导出证据与交接)
- [第 8 部分 · 日常工作节奏](#第-8-部分--日常工作节奏)
- [第 9 部分 · FAQ 与排障](#第-9-部分--faq-与排障)

---

## 第 0 部分 · 开工之前（Preflight）

### 0.1 这本手册写给谁

**对象**：在中国 OEM 里做 **homologation 认证 / regulatory affairs 法规事务** 的一线工程师。你负责一个具体项目从 TA（Type-Approval）申请到批量上市的合规交付，每天和 TÜV、DEKRA、UTAC、KBA、DGT、DVSA 这样的技术服务机构和发证机关打交道。

**非目标用户**：管理层、商业策略、market strategy。管理层请读 [USER-GUIDE.md](./USER-GUIDE.md) 前言与 Status tab；他们看 top-line verdict 就够。

### 0.2 开工前你手上要有什么

打开工具之前，请先把下面的信息整理成一份（纸面或 Excel 都行）：

| 信息 | 来源 | 举例 |
|---|---|---|
| 项目名 + 内部车型代号 | PM / project charter | `MY2027 BEV Pilot` / `B9-REFRESH` |
| **SOP 日期** | 生产计划 | `2027-01-15` |
| 首次注册日期（预估） | 市场计划 | `2027-04-01` |
| **Framework group** + vehicle category | 车辆分类表 | `MN` / `M1` |
| **Powertrain** + 燃料（如适用） | 电气架构 / 动力总成 spec | `BEV` · `none`；或 `ICE` · `petrol` |
| 电池容量档位（电动/混动车） | 电池 spec | `large`（>75 kWh） |
| **自动化等级**（SAE） | 智驾 spec | `l2plus`（pilot） |
| ADAS 功能清单 | 智驾 spec | `lane_keeping`, `adaptive_cruise`, ... |
| 连接能力 | E/E 架构 | `telematics`, `mobile_app`, `ota` |
| **目标国家列表** | 市场计划 | `["DE", "FR", "NL"]` |
| 销售模式 + consumer/fleet | 商务 | `dealer`, `consumer` |
| AI 使用情况（none / conventional / perception / safety / foundation） | 智驾 / cockpit spec | `ai_perception` |

这些字段决定了工具最终给你的规则集。**开工第一天最容易犯的错**就是 framework group / vehicle category / approvalType 填错 —— 后果是整个规则集错配。

### 0.3 这个工具**会**为你做什么

1. 根据你的配置自动列出应当遵守的 EU + UNECE + member-state 法规清单。
2. 给每条 ACTIVE（已验证）法规标出：`obligation_text`（你要做什么）、`evidence_tasks`（要准备什么文件/测试）、`official_url`（可点开的 EUR-Lex 或 UNECE 链接）、`last_verified_on`（最后人工核实日期）。
3. 以 SOP 为锚点把任务分到 Immediate / Pre-SOP critical / Pre-SOP final / Post-SOP 等时间窗。
4. 把任务按 owner（homologation / cybersecurity / privacy / battery / ...）分组，方便你给部门派活。
5. 一键导出 CSV / JSON / Markdown，用于内部 tracker 或 audit pack。

### 0.4 这个工具**不会**为你做什么

1. **不出具法律意见**。工具输出是**导航辅助（navigation aid）**，不替代律师、technical service、发证机关的专业审查。
2. **不做多项目管理**。一个浏览器 session 只跟一个项目 config；要切换就用 gear → Load sample / Reset / Save variant。
3. **不与 EUR-Lex 实时同步**。URL 验证是人工 round-review 的结果；`last_verified_on` 字段会显示最近一次人工核实的日期。发现法规更新需要 curator 手动跑新一轮 verification。
4. **不覆盖所有国家**。生产级覆盖：DE + UK。部分覆盖：ES + FR。Seed-only（仅撰写、未验证）：NL。其他 22 个 EU 成员国和非欧盟市场（CN/US/JP/TR）**完全不在本工具范围**。
5. **不替代 ISO 标准合规检查**（ISO 26262、ISO/SAE 21434、ISO 21448、ISO 8800 等）。工具仅列出**法规**要求，ISO 属于"前置标准"，由 `prerequisite_standards` 字段提示但不评估。

### 0.5 最重要的一条原则

> **ACTIVE（Verified / 已验证）的规则你可以直接据此排工作；CONDITIONAL / UNKNOWN（Indicative / 参考）的规则是线索 —— 在投入工程资源之前一定要对照官方原文自己核一遍。**

工具的 **hard-gate 机制**保证了 non-ACTIVE 规则**绝不会**返回 APPLICABLE 结论：即便你的配置 100% 命中触发条件，一条 SEED_UNVERIFIED 的规则**最高只能**返回 CONDITIONAL。这是故意为之的 **governance 防线**：未经过人工源验证的规则，不应当被当成"确定要做"的东西。

---

## 第 1 部分 · 你的前 30 分钟（Quickstart）

### 1.1 启动工具

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。首次进入落在 Setup tab。

### 1.2 先看一个完整的 sample

点右上角 **⚙ 齿轮图标** → 选 **"Load MY2027 BEV sample"**。工具自动载入 pilot 配置（MY2027 BEV 在德国上市），并跳到 Status tab。30 条 APPLICABLE 规则立刻生成。

### 1.3 扫一眼 5 个 tab，心里有底

| Tab | 一句话概括 | 你（homologation 工程师）关心程度 |
|---|---|---|
| **Setup** | 输入车辆项目配置 | ★★★★★（第一天用） |
| **Status** | 项目能不能进市场的 top-line verdict | ★★★（每日扫一下） |
| **Plan** | 按 SOP 锚定的任务 timeline + owner dashboard | ★★★★★（周/月看） |
| **Rules** | 每条规则的详细卡片（Summary / Why / What to do / Reference / Tracking） | ★★★★★（主要工作界面） |
| **Coverage** | 规则治理和验证覆盖率（管理 view） | ★★（季度看） |

### 1.4 把 sample 替换成你自己的项目

回到 Setup tab，按下列顺序填：

1. **Program & Market** —— 改 projectName / targetCountries / sopDate。
2. **Homologation Basis** —— frameworkGroup（选 MN/L/O/AGRI）→ vehicleCategory（选 M1/M2/.../N3）→ bodyType → **approvalType**（`new_type` vs `carry_over` / `facelift` / `major_update`）。**approvalType 填错是最常见错误**：改款车勾 `new_type` 会让法规适用期提前 2 年。
3. **Propulsion & Energy** —— powertrain + fuel.tankType + 电池档位 + 充电能力。
4. **ADAS & Automated Driving** —— automationLevel + ADAS features + 高速辅助 / 自动泊车 / 主动变道。
5. **Digital & Cockpit** —— connectivity + data flags + AI level。
6. **Readiness** —— 六个自检 checkbox（CSMS / SUMS / DPIA / 技术文档是否已启动等）。

每个字段详细说明见 [USER-GUIDE.md §第二部分](./USER-GUIDE.md#第二部分--任务-1--配置项目setup-tab)，本手册不重复。

### 1.5 保存配置

localStorage 自动保存。如果你要做**变体对比**（例如"如果目标国家加上 FR 会怎么样"），按 ⚙ → **Save variant** 起个名字保存。以后切回来点 Load。URL 也能编码当前配置（分享给同事可直接复现）。

### 1.6 打开 Status，先读 exec summary，再读 hero

Setup 改完自动评估。切到 Status 看到的第一块是 exec summary（K.2 新增）：

```
Market entry status:  LIKELY OK · 30 applicable · 12 weeks to SOP
Top urgent action: Submit R155 CSMS certificate (due 2026-10-15)
  [See full breakdown ↓]
```

这是**管理层 3 秒判读块**，给老板看。你作为工程师，主要看下面的 StatusHero（verdict 卡）+ Top blockers + Top deadlines + Countries at risk —— 那才是你排工作的依据。

---

## 第 2 部分 · 读懂 Status 页

### 2.1 Exec summary 块（管理向）

- **Market entry status**：四档 verdict（见下）。
- **X applicable / Y weeks to SOP**：当前 ACTIVE 且 APPLICABLE 的规则数 + 到 SOP 的倒计时。
- **Top urgent action**：最紧迫任务（工具根据 deadline + lifecycle 综合挑选一条）。

工程师视角：这块只用来**向上汇报**，详细做什么看下面。

### 2.2 StatusHero（判决卡）

```
Market entry status:  LIKELY OK
Confidence: Medium
Coverage 82/100  Verified 30  Indicative 8  Pending 12
Generated 2026-04-21 15:30 UTC
```

- **Verdict**：四档（下节详解）。
- **Confidence**：Low / Medium / High。取决于（a）你目标市场里有多少国家是 production-grade 覆盖（DE / UK）还是 seed-only（NL），（b）有多少规则需要人工 input 才能评估。
- **Coverage 分数 / 100**：该项目涉及的规则里多少已经 ACTIVE & verified。
- **Verified / Indicative / Pending**：三层分桶（对应 ACTIVE / SEED_UNVERIFIED & DRAFT & SHADOW / PLACEHOLDER）。

### 2.3 Coverage by target country（K.2 新增）

Status 中段会列每个 target country 的覆盖分布。例如：

```
DE — production-grade · 8/10 ACTIVE
UK — production-grade · 14/15 ACTIVE, 1 DRAFT (UK ETS road-transport scope)
FR — production-grade · 11/12 ACTIVE, 1 DRAFT (UTAC-CERAM)  ← Phase M.3 promotion
ES — production-grade · 9/14 ACTIVE, 5 indicative by design
NL — seed-only · 0/5 ACTIVE, 5 pending (Phase N scope)
```

这是你做 **per-country due diligence 清单**的起点。工具已经把每个国家能覆盖到什么程度告诉你了；pending 部分你必须**自己去查**。

### 2.4 Countries at risk 信号

如果某个 target country 是 seed-only（例如 NL），Status 会把它列进 countries at risk。注意：**at-risk 不等于"不能进"**，它意味着工具对这个国家只有 indicative-level 覆盖，你不能把工具的输出当成终审结论。

### 2.5 四档 verdict 的工程师动作表

工具给的是 verdict 和下一步线索，但**具体做什么是你的活**。下面是每档对应的 playbook：

| Verdict | 工具在说什么 | 工程师动作 |
|---|---|---|
| **LIKELY OK** | 没发现阻断，目标市场覆盖充分，时间线有冗余 | 把 Plan tab timeline 转成内部 tracker；按 evidence_tasks 启动文档/测试准备；关注 Top deadlines 前 10 条 |
| **OK WITH CAVEATS** | 能进，但有 **CONDITIONAL** 或 **missing_input** 类问题 | 先看 Top blockers：如果是 missing_input 回 Setup 补字段；如果是 CONDITIONAL 打开该规则卡片读 why-indicative 说明，去官方原文核实，然后登记到内部 tracker（工具 CONDITIONAL 不影响你自己的判断） |
| **AT RISK** | 发现阻断：未授权 target country、FUTURE-dated 关键规则过 SOP、或 readiness flag 缺失 | 见 [第 6 部分 · 场景 D](#场景-d-status-显示-at-risk-怎么办) 详细 playbook |
| **INDETERMINATE** | 证据不足，无法出结论（通常因为 Setup 不完整） | 回 Setup，对着红色未填完的 section header 逐个补齐；特别检查 frameworkGroup / approvalType / sopDate 三个高影响字段 |

工程师心态：verdict 是**参考线**，真正决定能不能进市场的是你去核的官方原文 + TÜV/KBA 的批文。

---

## 第 3 部分 · 建立你的合规计划

### 3.1 SOP 锚定 timeline 的逻辑

Plan tab 用你的 **sopDate** 作为锚点，把每条规则的 deadline（`applies_to_new_types_from`、`applies_to_all_new_vehicles_from`、`applies_from_generic`、`applies_to_first_registration_from`）放到时间轴上，并根据相对 SOP 的位置分到 6 个窗口：

| 窗口 | 含义 | 工程师动作 |
|---|---|---|
| ⚠ **Overdue** | 已过期（deadline < 今天） | **立即 escalate**。要么是 approvalType 勾错了，要么是 SOP 填得太近 |
| **Immediate** | 未来 3 个月内 | 本周确认 owner 已启动 |
| **Pre-SOP critical** | SOP 前 12~3 个月 | 绝大多数 TA 相关文档在这窗口完成；R155/R156 certificate、GSR2 各 delegated act 测试报告都落这里 |
| **Pre-SOP final** | SOP 前 3 个月 - SOP | 最后冲刺。评估各部门 deliverable 是否能按期交；晚了可能要重新 plan SOP |
| **Post-SOP** | SOP 后 12 个月 | monitoring 类义务（post-market surveillance、event data reporting、AI Act 后续阶段） |
| **Later** | 远期 | 比如 AI Act Art 6(1) safety component 2027-08-02 生效，Euro 7 HD 2028-05-29 生效 |
| **Unscheduled** | 没有明确 deadline | 横向规则（GDPR、PLD、Data Act 已生效）— 持续义务 |

### 3.2 工程师怎么用 timeline

**倒推法（Back-planning from SOP）**：

1. 打开 Plan tab → 扫 **Pre-SOP critical** 窗口 → 数出有多少条有硬 deadline 的规则。
2. 每条规则点开 → 看 `evidence_tasks`：这些是你需要在 deadline 之前完成的工作条目。
3. 估一下每个 evidence task 需要多久 → 往前推 → 检查是否已经 late。
4. 例如 R155 CSMS certificate 要 TÜV 审一轮 ≈ 6 个月；R157 ALKS 测试报告 ≈ 12-18 个月。

### 3.3 Owner Dashboard · 给部门派活

Plan tab 右栏是 Owner Dashboard，按 `owner_hint` 字段分组。工具用下面 12 个 owner buckets：

| owner_hint | 对应部门 | 典型规则示例 |
|---|---|---|
| `homologation` | 认证部 | REG-TA-001 WVTA · REG-UN-100 R100 EV safety · ES/FR/DE WVTA 转置 |
| `safety_engineering` | 被动安全 + ADAS 安全 | GSR2 5 个 delegated acts · R157 ALKS · R79 steering |
| `cybersecurity` | 网络安全 | REG-CS-001 R155 CSMS · REG-CS-003 CRA |
| `software_ota` | 软件 / OTA | REG-CS-002 R156 SUMS |
| `privacy_data_protection` | 隐私 / DPO | REG-PV-001 GDPR · REG-PV-002 ePrivacy |
| `ai_governance` | AI 治理 | REG-AI-001..004（AI Act 4 个阶段） |
| `sustainability_materials` | 材料与可持续 | REG-BAT-001 Battery Reg · REACH · ELV |
| `legal` | 法务 | REG-CL-001 PLD · REG-CL-002 GPSR · Sale of Goods |
| `aftersales` | 售后 | UNECE R156 OTA 流程 post-market · ES/DE periodic inspection |
| `regulatory_affairs` | 法规事务 | AI Act 跨越 · 多国 member-state overlay · UK AV Act |
| `powertrain_emissions` | 动力与排放 | REG-EM-001..014（Euro 7、OBD、EVAP、AdBlue、CO2 fleet、WLTP、RDE 等） |
| `connected_services` | 互联服务 | REG-DA-001 Data Act |

**给部门派活的流程**：
1. 切到 Plan tab，Owner Dashboard 会显示每个 bucket 的任务数 + 有几个 blocked。
2. 点任何一个 bucket，右侧列所有该部门的规则。
3. 筛选条件：按 deadline 近的在前排序；只看 Pre-SOP critical / Immediate。
4. 每条规则点 "View in Rules tab" → 进入该规则详情，复制 evidence_tasks 到部门的 Jira / Confluence。
5. 工具内也可以用 **My tracking** 设 todo / in_progress / done 状态，但大项目建议在外部 tracker 里跟踪（工具当前是 localStorage only，多人协作尚无后端）。

### 3.4 导出任务列表给外部 tracker

点右上角 **Export** 按钮：

- **CSV**：每条规则一行，适合导入 Excel / Jira CSV importer。
- **JSON**：原始结构化数据，适合 script 处理。
- **Markdown**：适合贴到 Confluence / Notion。
- **Print**：打印友好视图（A4 分页、免责声明自动带上）。

所有导出包含 `stable_id` / `obligation_text` / `evidence_tasks` / `owner_hint` / `official_url` / `last_verified_on` / `lifecycle_state` 等字段，方便审计回溯。

---

## 第 4 部分 · 一条条过规则（重点）

这是 homologation 工程师日常花**最多时间**的 tab。本章详细写。

### 4.1 Rule Card 解剖

每张规则卡片上的字段及其含义：

```
┌─────────────────────────────────────────────────────────────┐
│ [Verified] REG-CS-001 · R155 CSMS                    [Applies]│
│ Cybersecurity Management System                              │
│ UNECE · cybersecurity                                        │
│                                                              │
│ Summary ───                                                  │
│ Manufacturer must obtain CSMS certificate and vehicle        │
│ type-approval for cybersecurity. CSMS valid max 3 years.     │
│                                                              │
│ Why it applies ───                                           │
│ ✓ Framework group is MN (matched)                            │
│ ✓ Approval type is new_type (matched)                        │
│                                                              │
│ What to do ───                                               │
│ Required documents: CSMS certificate, Risk assessment, ...   │
│ Required evidence: Pen test report, Incident response plan, ...│
│ Submission timing: Before SOP                                │
│                                                              │
│ Reference ───                                                │
│ UNECE R155 (official) · https://unece.org/... ↗              │
│ OJ reference: UN Regulation No. 155                          │
│ Last verified: 2026-04-16 by yanhao                          │
│ Prerequisite standards: ISO/SAE 21434                        │
│ Related: REG-CS-002 (complements) · REG-AD-001 (requires)    │
│                                                              │
│ My tracking ───                                              │
│ Status: [ todo / in_progress / done ]                        │
│ Note: ...                                                    │
└─────────────────────────────────────────────────────────────┘
```

逐字段解释：

| 字段 | 来自哪里 | 工程师怎么用 |
|---|---|---|
| **Trust badge** | `lifecycle_state` → UI 映射 | **Verified** = ACTIVE（已验证，可直接据此排工作）；**Indicative** = SEED_UNVERIFIED/DRAFT/SHADOW（要自己核）；**Pending** = PLACEHOLDER（占位未写） |
| **Applicability badge** | 引擎输出的 `applicability` | **Applies** = 立即行动；**May apply** = 条件待核；**Applies from YYYY** = FUTURE，按时间倒推；**Does not apply** = 可跳但登记原因；**Source not verified / Not authored / Missing input** = 3 种 UNKNOWN 子类（下一节详解） |
| **Lifecycle badge** | 原始 `lifecycle_state` | 排障用：看卡上写 "Indicative" 但你想知道是 SEED_UNVERIFIED 还是 DRAFT |
| **Legal family + Jurisdiction** | `legal_family` + `jurisdiction` + `jurisdiction_level` | 交叉核：哪个家族 · 哪个法域（EU / UNECE / MEMBER_STATE / NON_EU_MARKET）· 哪国 |
| **Obligation text** | `obligation_text` | 你具体要做什么的一段话 |
| **Required documents + evidence** | `required_documents[]` + `required_evidence[]` + `submission_timing` | **最常用的字段**：直接复制进部门 tracker |
| **Sources** | `sources[]` 数组，`sources[0]` 为主源 | 点 `official_url` 开 EUR-Lex 原文。核对 `oj_reference` 和 `last_verified_on` |
| **Related rules** | `related_rules[]` | 链式规则关系：`complements`（配套）· `requires`（前置）· `conflicts`（冲突） |
| **Temporal fields** | `temporal` 对象的 4 个日期字段 | 下节详解 |
| **Why indicative only（K.0 新增）** | `manual_review_reason` | 每张 non-ACTIVE 卡片都有这行 —— 告诉你为什么这条还没升 ACTIVE |

### 4.2 读懂 4 个 temporal 日期字段

一条规则的 `temporal` 对象最多有 7 个日期字段，但你经常只看这 4 个：

| 字段 | 含义 | 何时用 |
|---|---|---|
| `applies_to_new_types_from` | 对**新型号**（approvalType=new_type）这天起生效 | 你的项目是全新车型 |
| `applies_to_all_new_vehicles_from` | 对**所有新车**（包括 carry_over / facelift）这天起生效 | 你的项目是改款、carry-over |
| `applies_to_first_registration_from` | 基于**首次注册日期**判断 | 某些 member-state overlay 按首牌时间算 |
| `applies_from_generic` | 横向规则（非 TA）的生效日 | GDPR、PLD、AI Act、Data Act 这类 |

**引擎怎么挑字段**：
- 你选 `approvalType = new_type` → 比较 SOP 和 `applies_to_new_types_from`
- 你选其他 approvalType → 比较 SOP 和 `applies_to_all_new_vehicles_from`
- 如果填了 `firstRegistrationDate` → 额外比 `applies_to_first_registration_from`
- 横向规则 → 比较 SOP 和 `applies_from_generic`

**案例**：GSR2 ISA（Intelligent Speed Assistance）
- `applies_to_new_types_from: 2022-07-06`
- `applies_to_all_new_vehicles_from: 2024-07-07`

SOP 2027-01-15 + approvalType=new_type → 已生效（2022-07 早就过了）→ 返回 APPLICABLE。
SOP 2023-06 + approvalType=carry_over → 2024-07-07 在 SOP 之后 → FUTURE。
SOP 2023-06 + approvalType=new_type → 2022-07-06 早就过了 → APPLICABLE。

### 4.3 深入理解 applicability 状态

```
APPLICABLE       ┌── 强制要求，排工作 ───────────────┐
CONDITIONAL      ┌── 可能适用，核证 ─────────────────┐
FUTURE           ┌── 将来适用，倒推 deadline ────────┐
NOT_APPLICABLE   ┌── 不适用，登记原因 ───────────────┐
UNKNOWN          ┌── 无法评估，3 个子类 ──────────────┘
  ├── source_not_verified   规则 lifecycle 非 ACTIVE（hard-gate）
  ├── not_authored          PLACEHOLDER 占位
  └── missing_input         你的配置缺字段（Setup 补）
```

**工程师应对策略**：

| 状态 | 含义 | 动作 |
|---|---|---|
| **APPLICABLE** | ACTIVE 规则 + 触发条件全中 + temporal 在 SOP 之前 | 立即排进 tracker，按 evidence_tasks 分派 |
| **CONDITIONAL** | 某条件未定（e.g. "可能处理个人数据"）或 hard-gated（SEED_UNVERIFIED 即使全中也被降级） | 读 why-indicative 或触发条件，判断是否真触发；若真触发则按 APPLICABLE 处理 |
| **FUTURE** | 规则有效但 applicability date 在 SOP 之后 | 按 `months_until_effective` 倒推 deadline；放进 Later 或 Pre-SOP final bucket |
| **NOT_APPLICABLE** | 条件不中（e.g. 勾了 BEV 但 Euro 7 只管 ICE） | 跳过，但在部门交接时**记录一下为什么不适用**（日后车型变更可能翻盘） |
| **UNKNOWN: source_not_verified** | 规则 SEED_UNVERIFIED / DRAFT，不是 ACTIVE | 当作"需要自己核"的线索。读 `manual_review_reason` 知道原因 |
| **UNKNOWN: not_authored** | 规则 PLACEHOLDER（纯占位，没内容） | 跳过，但如果你的项目确实需要这个主题，向 curator 报告 |
| **UNKNOWN: missing_input** | 你 Setup 没填某个必要字段 | 回 Setup 补齐；最常见是 frameworkGroup / powertrain / targetCountries 缺失 |

### 4.4 筛选和搜索

Rules tab 顶部工具栏：

- **Applicability filter**：Applies / May apply / Future / Does not apply / Missing input / All。
- **Legal family filter**：13 个家族多选。
- **Lifecycle filter**：ACTIVE / SEED_UNVERIFIED / DRAFT / SHADOW / PLACEHOLDER。
- **Trust filter**：Verified / Indicative / Pending。
- **Search box**：全文检索 title / short_label / stable_id / obligation_text。
- **View mode**：Business（按 ui_package）/ Legal（按 legal_family）/ Process（按 process_stage）。

**高频组合**：
- "给我所有必做的":   Applicability=Applies + Trust=Verified。
- "给我 cybersecurity 部门的活":   Owner filter=cybersecurity。
- "给我 DE-specific 规则":   Search "REG-MS-DE" 或 Legal family=member_state_overlay。
- "给我要核的 indicative 规则":   Applicability=May apply + Trust=Indicative。

### 4.5 对付 Indicative 规则（CONDITIONAL）的标准流程

遇到一条 CONDITIONAL 的规则不要慌，按下面 5 步做：

1. **读卡片的"Why indicative only"提示**（K.0 新增，每张 non-ACTIVE 卡都有）。你会看到类似：
   - `"Awaiting EUR-Lex URL verification — CELEX ID pending SPARQL confirmation"`（URL 验证未完成）
   - `"KBA architectural split pending — see DE-009 follow-up"`（规则本身需要重构）
   - `"Windsor Framework NI provisions staged for 2026-10"`（内容未完整撰写）
2. **打开 `sources[0].reference` 给出的官方引用**。例如 "Regulation (EU) 2023/1542" → 在 EUR-Lex 搜索框粘贴 CELEX ID。
3. **对照你的 obligation_text 和 trigger conditions**，看官方原文怎么说。重点核：scope（是否适用你的车辆类别）、temporal dates、exclusions。
4. **结论二选一**：
   - 和工具说的一致 → 把这条规则当 APPLICABLE 处理，加进你的部门 tracker。工具显示 CONDITIONAL 不影响你的实操。
   - 不一致 → 记下差异，提 issue 给 rules curator（见 [第 9 部分 FAQ](#第-9-部分--faq-与排障)）。
5. **把结果回到 My tracking 字段**写一行 note：`"Cross-checked against EUR-Lex on 2026-05-03, matches. Owned by Cyber Team."` 方便日后 audit。

---

## 第 5 部分 · 追踪验证覆盖率

Coverage tab 面向**治理 view** —— 让你看整个规则库的覆盖分布、验证状态、哪里欠账。

### 5.1 Coverage metrics（顶部指标）

```
Total 196 · Verified 73 (37%) · Indicative 90 (46%) · Pending 33 (17%)
Fresh 52 · Due soon 15 · Overdue 6 · Never verified 90
```

- **Verified 65%** —— 工具 round-reviewed 过多少（Phase M 后 137/211）。目标是随 Phase N+ 继续增长。
- **Freshness（新鲜度）**：
  - `fresh` = `last_verified_on` 在 `review_cadence_days` 内。
  - `due_soon` = 下个月到期。
  - `overdue` = 已过期（超过 cadence）。
  - `critically_overdue` = 超期 > 2x cadence。
  - `never_verified` = 从未验证（SEED_UNVERIFIED 默认）。
  - `drifted` = 源文本变更但规则没 catch up。

### 5.2 Lifecycle distribution

饼图：PLACEHOLDER / DRAFT / SEED_UNVERIFIED / SHADOW / ACTIVE / ARCHIVED 各有多少。

**工程师用处**：看懂"我现在依赖的规则池有多可靠"。如果 ACTIVE 比例 > 70% 且你依赖的家族（e.g. cybersecurity）90% ACTIVE，这个领域工具给的结果可信度高。

### 5.3 Freshness distribution

类似的 6 档分布。`overdue` 数值持续上升意味着 curator 跟不上节奏；这是管理信号。

### 5.4 Domain × Process coverage matrix

13 legal families × 4 process stages（pre_ta / type_approval / sop / post_market）的热力图。格子颜色越绿表示该领域该阶段覆盖越完整。

**工程师用处**：看你的项目涉及的领域在哪个 process stage 有欠账。例如 `ai_governance × post_market` 格子是橙色 → AI Act 后期义务（2027-08-02 之后）工具还没写透，你要多留一层人工核实。

### 5.5 Member-state chips（四层上色）

```
DE [ACTIVE 8 / 10]          ■■■■■■■■□□  production-grade
UK [ACTIVE 14 / 15]         ■■■■■■■■■■■■■■□  production-grade
FR [ACTIVE 11 / 12]         ■■■■■■■■■■■□  production-grade  ← Phase M.3
ES [ACTIVE 9 / 14]          ■■■■■■■■■□□□□□  production-grade
NL [ACTIVE 0 / 5]           □□□□□  seed-only
IT / PL / BE / AT / SE 等    not authored（不在工具范围）
```

四层着色：
- **Production-grade**（绿）：≥80% ACTIVE。
- **Partial**（蓝）：30%-80% ACTIVE。
- **Seed-only**（橙）：<30% ACTIVE。
- **Not authored**（灰）：完全未写。

### 5.6 Verification queue（K.2 扩展视图）

这是 curator 的队列。工程师可以用它**提前预知**哪些规则下个 round 会升 ACTIVE（从而从 CONDITIONAL 变 APPLICABLE），方便你安排 re-review。

Queue 按优先级排序：
1. `overdue` rules first。
2. 影响 pilot fixture 的规则（pilot 是 pilot-my2027-bev，其 expected output 是 regression anchor）。
3. `critical` owner_hint（e.g. safety_engineering 优先）。
4. 有 null URL 的 SEED_UNVERIFIED。

---

## 第 6 部分 · 常见场景走查（Walkthroughs）

下面 6 个场景覆盖你大部分的日常工作。每个场景用 pilot 或真实变体举例，给出**具体规则 ID**，便于你直接检索。

### 场景 A · 发布 MY2027 BEV × Germany（完全验证路径）

**配置**：`frameworkGroup=MN · vehicleCategory=M1 · powertrain=BEV · fuel.tankType=none · automationLevel=l2plus · targetCountries=["DE"] · sopDate=2027-01-15 · approvalType=new_type`

**预期**：30 APPLICABLE 规则（pilot 的 regression anchor）。

**关键规则触发**：
- **EU horizontal ACTIVE**（必做）：REG-TA-001 WVTA · REG-GSR-001..006（框架 + 5 delegated acts，ISA/EDR/DMS/AEB/TPMS）· REG-CS-001 R155 CSMS · REG-CS-002 R156 SUMS · REG-AD-002 R171 DCAS（因 l2plus + motorwayAssistant）· REG-BAT-001 Battery Reg · REG-UN-100 R100 EV Safety · REG-PV-001 GDPR · REG-DA-001 Data Act · REG-AI-004 AI Act Art 6(1) safety component · REG-CL-001 PLD。
- **DE overlay 8 ACTIVE**：REG-MS-DE-001 FZV（注册）· REG-MS-DE-002 §29 StVZO HU/AU（路检）· REG-MS-DE-003 PflVG（保险）· REG-MS-DE-004 KraftStG（BEV 10 年税优）· REG-MS-DE-005 Umweltzonen · REG-MS-DE-006 E-Kennzeichen · REG-MS-DE-008 Dienstwagensteuer · REG-MS-DE-010 AltfahrzeugV（ELV）。

**工程师行动**：
1. Plan tab → 数 Pre-SOP critical 条数 → 按 deadline 倒推工作 start date。
2. Rules tab → 按 owner 分派（CSMS 给网络安全部，SUMS 给软件部，Battery 给电池部）。
3. 每条点 `official_url` 确认 EUR-Lex URL 可用、`last_verified_on` 在 6 月内。
4. Export CSV → 导入内部 Jira project。
5. **建议 1 次交付里你可以信赖 30 条的全部结论**：它们都是 ACTIVE+APPLICABLE，DE 覆盖 production-grade。这是工具最稳的一种场景。

**注意**：即便 production-grade，仍需**人工核实 EUR-Lex 是否在过去 1-2 周有修正**（工具不实时同步）。

### 场景 B · 发布 MY2028 PHEV × DE + FR + NL（混合验证路径）

**配置**：`frameworkGroup=MN · vehicleCategory=M1 · powertrain=PHEV · fuel.tankType=petrol · automationLevel=l2 · targetCountries=["DE","FR","NL"] · sopDate=2028-03-01 · approvalType=new_type`

**预期**：约 35-40 APPLICABLE（DE 8 + FR 5 + EU horizontal）+ 10-15 CONDITIONAL（FR pending 7 + NL seed 5）。

**关键规则触发**：
- **Euro 7 三拆规则（PHEV 全部命中）**：REG-EM-001 Euro 7 框架（M1/N1）· REG-EM-013 Euro 7 Combustion + OBFCM · REG-EM-014 Euro 7 Battery Durability。PHEV 既有内燃又有电池，三条都触发 —— **这是 PHEV 的特色**。
- **REG-EM-009 PHEV CO2 Utility Factor（R101）**：PHEV 的 CO2 算法中枢，**仔细读**。PHEV 的 CO2 申报值取决于 UF（Utility Factor），UF 基于电动续航 + 充电频率假设。工具给的 obligation_text + evidence_tasks 是起点。
- **REG-EM-007 OBD** + **REG-EM-008 EVAP**：内燃车通用。
- **REG-EM-011 AdBlue/SCR**：柴油才触发，PHEV petrol 不触发。
- **DE 8 ACTIVE**：同场景 A。
- **FR 11 ACTIVE**（Phase M.3 将 5 → 11）：REG-MS-FR-001 Carte grise · REG-MS-FR-002 Contrôle technique · REG-MS-FR-003 Assurance RC · REG-MS-FR-004 Bonus/malus CO2 · REG-MS-FR-005 ZFE-m · REG-MS-FR-006 Crit'Air · REG-MS-FR-007 Prime à la Conversion（已终止，保留为 informational marker）· REG-MS-FR-008 TVS→TAVE/TAPVP · REG-MS-FR-009 TICPE · REG-MS-FR-010 LOM · REG-MS-FR-011 Malus masse。
- **FR 1 DRAFT**（返 CONDITIONAL）：REG-MS-FR-012 UTAC-CERAM —— JORF 指定令未找到，保留 DRAFT 并文档化 blocker。
- **NL 5 SEED_UNVERIFIED**（返 CONDITIONAL）：全部 indicative，你必须**对照 RDW / Belastingdienst 官方原文**自己核。

**工程师 indicative 处理流程**：
1. 对 FR 7 pending：打开每条的 `manual_review_reason`，读"why pending"。典型是"URL verification pending for Service-Public fiche"。
2. 访问官方源（EUR-Lex / Legifrance / Service-Public.fr），核对生效日期、计算方法。
3. 对 Malus/Bonus (FR-004) 特别注意：PHEV 根据 WLTP CO2 + 电动续航档位不同 → 适用条款不同。Malus 是一次性税，Bonus 是补贴（消费者端，你 OEM 主要提供证明文件）。
4. 对 NL 5 seed：NL 的 typgoedkeuring（TA）由 RDW 管。ACTIVE 需要等 Phase L+ authoring + 人工 review。**不要把 NL 工具结论当准**。

**结论**：这个配置工具给你**可靠覆盖**（EU + DE + FR 一部分），**另一半**（FR 剩余 + NL 全部）得你自己对照官方原文。

### 场景 C · 发布 MY2027 ICE M1 petrol SUV × Spain（ICE 配置 + 部分覆盖国家）

**配置**：`frameworkGroup=MN · vehicleCategory=M1 · bodyType=suv · powertrain=ICE · fuel.tankType=petrol · automationLevel=basic_adas · targetCountries=["ES"] · sopDate=2026-09-01 · approvalType=new_type`

**预期**：约 25-30 APPLICABLE + 7-10 CONDITIONAL（ES pending 7）。

**关键规则触发 —— ICE vs BEV 的差异**：

| 维度 | BEV（场景 A） | ICE petrol（此处） |
|---|---|---|
| Euro 7 三拆 | 不触发（BEV 豁免） | REG-EM-001 + REG-EM-013 都触发；REG-EM-014 battery durability 不触发 |
| Euro 6 baseline | 不触发 | **看 SOP 日期**：SOP 2026-09-01 在 Euro 7 new-types 日期 2026-11-29 之前 → 工具返回 FUTURE for Euro 7，你实际走 **Euro 6** 认证（REG-EM-005 Euro 6 M1/N1） |
| OBD (REG-EM-007) | 不触发 | 触发 |
| EVAP (REG-EM-008) | 不触发 | 触发（汽油车才有挥发） |
| AdBlue/SCR (REG-EM-011) | 不触发 | 不触发（petrol 车不用 AdBlue；仅柴油） |
| R100 EV Safety | 触发 | 不触发 |
| Battery Reg | 触发 | 不触发（ICE 车 12V 铅酸电池豁免） |
| R51 Noise | 触发（但 BEV 有特殊 AVAS 要求） | 触发（普通 ICE 噪声限值） |

**关键 SOP 日期陷阱**：SOP 2026-09-01 位于 Euro 7 M1/N1 new-types 生效日期（2026-11-29）**之前**。这意味着：
- Euro 7 返回 **FUTURE**（不是 APPLICABLE）。
- 你实际走 **Euro 6**（REG-EM-005）认证路径。
- 但是：如果 SOP 往后推到 2026-11-30 以后，Euro 7 变 APPLICABLE，你要重新做 authorization work。
- **工程师行动**：Plan tab 看到 Euro 7 FUTURE 时，排查 `applies_to_new_types_from` 是否在 SOP 之后的安全 margin。若 SOP 日期 volatility 高，提前做 Euro 7 可选 dual-stream 认证路径。

**ES 覆盖（场景特有）**：
- **ES 9 ACTIVE**（L.6 之后）：REG-MS-ES-001 Matriculación (DGT) · REG-MS-ES-002 ITV（路检）· REG-MS-ES-003 Seguro Obligatorio · REG-MS-ES-004 IEDMT（注册税，petrol ICE 有 CO2 档位税率）· REG-MS-ES-005 IVTM（市政车辆税）· REG-MS-ES-006 ZBE（低排放区）· REG-MS-ES-007 Etiqueta Ambiental（DGT 环保标）· REG-MS-ES-009 WVTA RD 750/2010 转置 · REG-MS-ES-013 Pilas y Acumuladores（RD 106/2008 + RD 710/2015）。剩余 REG-MS-ES-008 Homologación Individual 仍 SEED_UNVERIFIED，待 Orden ministerial 核实。
- **ES 7 pending**（CONDITIONAL）：REG-MS-ES-007 Etiqueta Ambiental（DGT 环保贴纸，petrol Euro 6/7 通常获 ECO 或 C 标）· REG-MS-ES-010 ZEV 2040（2040 年禁售内燃）· REG-MS-ES-012 MOVES III（BEV 补贴，ICE 无关）· 等等。

**CCAA（自治区）变异预警**：西班牙有 17 个 autonomous communities（CCAA），各自对 ITV、ZBE 有额外实施细则。**工具只给国家级规则**，CCAA 级要你自己做 per-region due diligence。例如 Madrid Central ZBE 和 Barcelona ZBE 各有不同进入限制。

**工程师行动**：
1. Euro 6 vs Euro 7 的决策：按 SOP 日期 lock-in。
2. ES 7 pending 对 ICE 大多数不重要（MOVES III、ZEV 2040 对 BEV 才关键），但 Etiqueta Ambiental 要关注 —— petrol Euro 6/7 默认是 C 或 ECO 级。
3. 对 CCAA 差异，建议让 Spain 分销商/进口商提供 per-region 清单。

### 场景 D · Status 显示 AT RISK · 怎么办

AT RISK 有三类常见成因，逐一排查：

#### 成因 1 · Setup 输入缺失导致评估退化

**症状**：Confidence 显示 Low；多条规则返回 `UNKNOWN: missing_input`；Top blockers 里出现"Cannot evaluate without frameworkGroup / powertrain / targetCountries"。

**行动**：
1. 回 Setup tab，看每个 section header 是否标绿勾。
2. 特别检查 **必填 9 项**：projectName、sopDate、targetCountries、frameworkGroup、vehicleCategory、approvalType、powertrain、automationLevel。
3. 填齐后自动重评，AT RISK 应降为 OK WITH CAVEATS 或 LIKELY OK。

#### 成因 2 · 有 FUTURE-dated 关键规则在 SOP 之后才生效

**症状**：Timeline 看到 "Later" bucket 有重要规则（例如 REG-AI-004 AI Act Art 6(1) 2027-08-02 才生效；如果 SOP 在 2027-08-02 之后，这条就是 FUTURE → APPLICABLE 的过渡态）；工具提示可能有 transitional obligation。

**行动**：
1. 明确这条规则生效前后你的车辆状态：SOP 前产的车按**旧规则**，SOP 后产的按**新规则**。
2. 如果跨期生产（SOP 前后都有量产），要考虑 **facelift re-approval 策略**：晚于生效日期的车型可能需要重新认证。
3. 在 My tracking 里标 todo，deadline 设在生效日期前 12 个月开始准备。

#### 成因 3 · 目标国家是 seed-only（工具未充分覆盖）

**症状**：Countries at risk 列出 NL、IT、PL 等；某些 member-state 规则返 UNKNOWN: source_not_verified 或 not_authored。

**行动**：
1. **工具覆盖缺口要靠人工补齐**。打开该国官方交通部 / 注册机关网站（NL: RDW · IT: Motorizzazione · PL: Transportowy Dozór Techniczny）。
2. 列出该国的基础 5 项：registration pathway · mandatory insurance · periodic inspection · local tax · low-emission zones。
3. 在 My tracking 里登记 out-of-tool 的规则项。
4. 把该国提议给 curator（见 FAQ），进入下一 Phase authoring。

### 场景 E · 我加了一个新 target country

**情形**：原本 pilot 只选 DE，老板说"加一个 FR 试试看"。

**操作步骤**：
1. Setup tab → targetCountries 多选加 FR → 保存。
2. **观察 4 个 tab 的变化**：

| Tab | 会变化的 |
|---|---|
| Status | Coverage by target country 新增一行 FR；Phase M.3 后 production-grade 覆盖；At-risk 列表不再含 FR |
| Plan | 出现 11 条 FR ACTIVE 任务（SIV / CT / assurance RC / bonus-malus CO2 / ZFE-m / Crit'Air / TAVE-TAPVP / TICPE / LOM / Malus masse / Prime à la conversion 终止标记） |
| Rules | 搜索 "REG-MS-FR" 看到 12 条规则（11 ACTIVE + 1 DRAFT UTAC-CERAM） |
| Coverage | FR 的 member-state chip 在 Phase M.3 后升级为 "production-grade" 绿色顶档 |

3. **ScopeBanner 会告诉你覆盖程度**。第 2-3 层（partial + seed）的数量会反应在 tier pill 上。
4. 如果你选的国家是 NL / IT / PL 等 not-authored，Status 立刻提示"Countries at risk"，要求你对该国做外部 due diligence。
5. **给 curator 报告新国家需求**：issue 里写明哪个 PILOT 需要这个国家 + SOP 日期，curator 会评估 Phase L+ 优先级。

### 场景 F · 某条规则在配置改动后变 CONDITIONAL 了

**情形**：原本返回 APPLICABLE 的规则，某次 Setup 字段一改就变 CONDITIONAL。

**常见原因**：
1. **approvalType 改了**：从 new_type 改到 carry_over，某些规则的 temporal 判断基准变了。
2. **powertrain 改了**：BEV → PHEV，Euro 7 family 忽然全部激活（多了 REG-EM-013 / 014）；但某些条件字段（`hasDieselEngine` 等）没再确认，导致 CONDITIONAL。
3. **targetCountries 里拿掉 DE**，DE overlay 规则变 NOT_APPLICABLE（这不是 CONDITIONAL，是 hard NOT_APPLICABLE）。

**排查步骤**：
1. 打开该规则卡 → **Engineering toggle** → 看 raw trigger_logic JSON + matched / unmatched 条件。
2. 对比 Setup 当前值和触发条件要求，找不匹配的字段。
3. 看 `missing_inputs`：如果有这字段，补齐。
4. 如果条件没办法满足（例如配置本质变了），这条就该是 NOT_APPLICABLE，不是 CONDITIONAL —— 这种情况回 Setup 确认 EngineConfig 衍生 flag 正确（`batteryPresent` / `hasCombustionEngine` 等）。

---

## 第 7 部分 · 导出证据与交接

### 7.1 工具内可导出的内容

右上角 **Export** 菜单：

| 格式 | 适合场景 |
|---|---|
| **CSV** | 导入 Excel / Jira CSV importer / SAP QMS |
| **JSON** | 脚本处理、用于自动化 pipeline |
| **Markdown** | 贴 Confluence / Notion / Slack |
| **Print** | A4 打印，免责声明自动带上，适合发文件给外部技术服务 |

目前没有 Sources / Evidence Pack / Assumptions / Change Log 独立 tab（Phase 12 早期规划过，当前 UI 未实装）—— Evidence 聚合靠 CSV 导出 + `evidence_tasks` 字段。

### 7.2 好的 evidence pack 应当包含什么

交给 **KBA（DE）/ TÜV / DEKRA / UTAC（FR）/ IDIADA（ES）/ DVSA（UK）** 审核，你需要准备：

| 条目 | 来自工具哪里 | 是否 Ready |
|---|---|---|
| 适用法规清单 | Rules tab export CSV | ✓ |
| 每条法规的 `stable_id` + `official_url` + `oj_reference` + `last_verified_on` | Sources 列 | ✓ |
| 每条的 `required_documents[]` | CSV 字段 | ✓ |
| 每条的 `required_evidence[]` + `submission_timing` | CSV 字段 | ✓ |
| 前置 ISO 标准（如 ISO/SAE 21434、ISO 26262） | `prerequisite_standards` 字段 | ✓ |
| 技术文件本身（测试报告、DVP、DPIA 等） | **外部**，由各部门提供 | 需你组织 |
| 免责声明 | Export 自动附加 | ✓ |

工程师建议：把 CSV 导出 + 各部门交的文档合成一个 `.zip` 包 + 一个 README（指向每个法规的对应文件）。这是 TÜV / KBA 初次 intake 审查最友好的形式。

### 7.3 交接给法务 / 外部律师

法务需要的不是法规清单，而是：
- **Obligation text** 和 **exclusions**（跟他们讨论"我们要不要走 exclusion"）。
- `manual_review_reason` 里的 known caveats。
- **Related rules**（`complements` / `requires` / `conflicts`）—— 法务要看规则间冲突。
- 特别：PLD（REG-CL-001）在有 software update / AI system 的车型上是**重点**，把相关 CS / AI 规则一起打包。

### 7.4 交接给外部供应商（Tier 1 / software vendor）

你给供应商的应该是**精简版**：
- 只给他们相关的规则（例如给 cybersecurity supplier 只给 R155 / CS 家族）。
- 不要给完整 CSV；Filter → 只选相关 family → Export。
- 附 SOP 日期 + 部门 deadline，让供应商按 deadline 交付。

---

## 第 8 部分 · 日常工作节奏

这个工具不是一次性 audit 工具，是**贯穿项目从 pre-TA 到 post-SOP 生命周期**的工作台。建议你按下面节奏使用：

### 8.1 每天（5 分钟）

- 打开 Status tab → 读 exec summary 一眼：verdict 是否变了？新 CONDITIONAL 出现了吗？
- 如果 timeline 显示新 "Immediate" bucket 出现任务 → 立即转给对应 owner。
- 这 5 分钟可以和你每天早上看邮件同步。

### 8.2 每周（30 分钟）

- Plan tab → Timeline 从前到后扫 → 更新每条规则的 My tracking 状态（todo → in_progress → done）。
- Owner Dashboard → 追 blocked 任务的 owner 要进度。
- 扫 Coverage tab 的 Freshness 指标 → 有无新增 `overdue`？若有且正好是你依赖的规则 → 提 issue 给 curator 推下一个 review round。

### 8.3 每 sprint / 每月（2 小时）

- Rules tab → Filter Trust=Indicative → 从头到尾过一遍。每条确认：
  - 是否需要重新 cross-check EUR-Lex？
  - 是否可以升 ACTIVE（触发 curator round-review）？
- 对比上月导出的 CSV 和本月的 CSV（git diff 或 Excel 对比）—— 看看哪些规则状态 / 内容变了。
- 与 curator 沟通：下个 round 我最想看哪些规则升 ACTIVE？

### 8.4 每季度（半天）

- **全面 scope review**：
  - Setup 中的 targetCountries 是否和最新市场计划一致？
  - 新 framework_group（例如把 MN 改成同时 MN+O 配拖车）？
  - 新 automationLevel？
- 对照工具输出和**内部 homologation 计划表**，查漏补缺。
- 对照 Coverage tab 的 member-state chips，评估"我们依赖的国家覆盖是否还够"；如果 pilot 添加了 IT / PL 等工具不覆盖的国家，提 Phase L+ authoring issue。
- 参加 curator 的 quarterly review meeting（如有），同步你的使用反馈。

---

## 第 9 部分 · FAQ 与排障

### Q1 · 工具说 CONDITIONAL，但我确认这条规则一定适用我的车，怎么办

**答**：先看 lifecycle_state：
- 如果是 ACTIVE 的规则返 CONDITIONAL → 说明触发条件里有"may apply"类的字段（例如 `hasConnectedServices` 你填不确定）。打开 Engineering toggle 看 unmatched_conditions，回 Setup 补清字段。
- 如果是 SEED_UNVERIFIED / DRAFT 的规则 —— 那是 hard-gate：**即使你 100% 确认适用，工具也只能给 CONDITIONAL**。这是故意的 governance 防线。你在外部 tracker 里当 APPLICABLE 处理即可，但要留档说明"工具 indicate 中、人工确认已核 EUR-Lex 原文"。

### Q2 · 某条规则在我改了配置之后从 Rules tab 消失了

**答**：这不是 bug，是规则 NOT_APPLICABLE 被默认隐藏。Rules tab 顶部的 Applicability filter 勾一下"Does not apply"就能看到了。该规则触发条件和你新配置不匹配（例如你从 ICE 改到 BEV，Euro 7 ICE 专属规则变 NOT_APPLICABLE）。

### Q3 · 我想把工具结果分享给外部供应商看

**答**：几种方法：
1. **URL 分享**：Setup tab 右上角 **Copy URL** 按钮，URL 里编码了当前配置。供应商打开这个 URL 就能看到同样的评估结果（但不能保存修改）。
2. **CSV/Markdown export**：打印友好，适合贴邮件。
3. **Filter 再导出**：先按 owner 或 legal_family filter 缩到供应商相关的部分，再 export。**不要**发完整 CSV 给外部，里面含其他部门的敏感工作项。

### Q4 · 规则 notes 里有 [verify] 标记，还能照做吗

**答**：
- 如果主字段（`obligation_text`、`sources[0].official_url`、`last_verified_on`）都已填且 lifecycle_state 是 ACTIVE → [verify] 只是小标注（常见于某些 minor 日期或二级 source），照做没问题但工作过程中留意那个标注点。
- 如果 lifecycle_state 不是 ACTIVE → [verify] 标记是主要线索，不要贸然照做，按 [第 4.5 节](#45-对付-indicative-规则conditional的标准流程) 流程自核。

### Q5 · 工具只覆盖 DE / UK / ES / FR / NL（部分）· 我的项目需要 IT / PL / BE

**答**：
- 工具目前明确**不支持** IT / PL / BE / AT / SE / CZ 等 22 个 EU 成员国。Phase L+ 会扩，但没有 timeline 承诺。
- 短期：你手动对每个未覆盖国家做 per-country due diligence —— 最少检查：注册机关 + ITV/MOT 等效流程 + 强制保险 + 注册税 + 低排放区政策。
- 报告需求给 curator：提 issue 写明"Pilot X 需要 IT overlay，SOP 日期 Y"，curator 评估进入 Phase L+ 的优先级。

### Q6 · 我的 SOP 日期在 Euro 7 生效之前，应该走 Euro 6 还是 Euro 7

**答**：这是典型"transition window"问题。
- Euro 7 M1/N1 `applies_to_new_types_from: 2026-11-29`；`applies_to_all_new_vehicles_from: 2027-11-29`。
- SOP 2026-09-01 + approvalType=new_type → Euro 7 FUTURE（新型号 2026-11-29 才生效），**你实际走 Euro 6**（REG-EM-005）。
- SOP 2027-06-01 + approvalType=new_type → Euro 7 APPLICABLE（新型号已生效），走 Euro 7（REG-EM-001 框架 + REG-EM-013 内燃 + REG-EM-014 电池耐久，按 powertrain 子集）。
- SOP 跨窗口 → 建议分 model-year 策略（MY 26 走 Euro 6，MY 27+ 走 Euro 7）。工具的 FUTURE 状态会清晰标 `months_until_effective`。

### Q7 · 我看到某条 SEED_UNVERIFIED 的规则，我自己能帮忙升到 ACTIVE 吗

**答**：
- 升 ACTIVE 必须通过 **human-review round**（见 `docs/phase-j/verification-backlog.md`）。这是 governance 强制流程。
- 你作为用户可以**提 issue 推动**：在 issue 里提供 `sources[0].official_url`（已验证可达）+ `oj_reference` + 建议的 `last_verified_on`。curator 会评估是否 promote。
- 升 ACTIVE 的 merge gate 包括：Tier-1 源认证 + human reviewer 签字 + `content_provenance` 填齐 + `promotionLog` 追加 entry + all tests green。见 `docs/review-checklist.md`。

### Q8 · 怎样新增一条规则

**答**：见 `docs/rule-authoring-guide.md`。精简流程：
1. 定规则的 `stable_id`（e.g. `REG-MS-IT-001`）。
2. 起始 `lifecycle_state` 为 `PLACEHOLDER` 或 `DRAFT`（绝不要直接 ACTIVE）。
3. 在 `src/registry/seed/<family>.ts` 里用 `makeSeedRule` 添加。
4. 用 declarative trigger_logic（90%+ 的规则都能用）。
5. `npx vitest run` 测试通过。
6. PR + 人工 review。只有 reviewer 签字 + `sources[0].official_url` 验证之后才 promote 到 ACTIVE。

### Q9 · UK 脱欧后怎么处理

**答**：
- UK 是 `jurisdiction_level: NON_EU_MARKET`，与 EU 分开。targetCountries 勾 UK 触发 11 条 ACTIVE UK rules（REG-UK-001..011 为主，含 AV Act 2024、GB Type-Approval、DVLA V5C、MoT、RTA 1988、ULEZ、ZEV Mandate 等）。
- **北爱尔兰（NI）特殊情况**：REG-UK-011 Windsor Framework 说的是 NI 继续与 EU 规则对齐。如果你的车也进 NI，除了 UK 的 GB Type-Approval，还要看 EU 的部分法规（工具按 UK overlay 处理 + ScopeBanner 提示 NI 特殊性）。

### Q10 · 能把工具集成到我们的 QMS / PLM 里吗

**答**：
- 当前工具是 standalone Next.js app，localStorage 持久化，**没有 API 层**。
- 集成路径（非官方）：
  1. 定期 CSV 导出 → 喂 QMS / PLM。
  2. 解析 JSON export → 推内部 data warehouse。
  3. 用 URL query 参数自动化生成"某配置下的规则清单"（`?config=<encoded>`）。
- 未来路径（见 README 的 non-goals + roadmap）：多租户 SaaS、SSO/RBAC、后端 API、PLM/ERP/QMS 集成 **当前都不在范围内**。如果 OEM 要深度集成，请与工具 maintainer 讨论定制化 fork。

---

## 结语

这本手册写给每天和法规条文、官方原文、TÜV / KBA 审核人打交道的**一线 homologation 工程师**。工具不替代你的专业判断，它**把你手边最常用的 73 条 ACTIVE 法规**组织成一个可检索、可导出、可倒推 SOP 时间轴的工作台。

**使用这本手册最有效的方式**：先走一遍 [第 1 部分 Quickstart](#第-1-部分--你的前-30-分钟quickstart)（30 分钟），然后把 [第 6 部分 的 6 个场景](#第-6-部分--常见场景走查walkthroughs) 当 reference 查阅。当你开始一个真实项目，把 [第 8 部分 日常节奏](#第-8-部分--日常工作节奏) 的每日/每周/每月 checklist 塞进你的日历。

**遇到问题按优先级**：先查这本手册 FAQ → 查 [USER-GUIDE.md](./USER-GUIDE.md) 的字段详细说明 → 提 issue 给 curator。

最后一遍强调一下最重要的原则：

> **ACTIVE 规则你可以信赖（但仍需人工最后 cross-check 官方原文）；Indicative 规则是线索（务必自己核）；Pending 规则是缺口（工具不覆盖，你要外部补齐）。工具是导航，不是决策。**

祝项目顺利。

© Yanhao FU · 2026
