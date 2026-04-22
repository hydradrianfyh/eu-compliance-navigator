# EU Compliance Navigator · 用户使用指南

**版本**：Phase L.6（2026-04-22）· 205 条规则 / **101 条 ACTIVE** · 236 个测试通过
**适用 pilot**：MY2027 BEV × DE · PHEV × DE·FR·NL · ICE × ES
**语言**：中文（English: [USER-GUIDE-EN.md](./USER-GUIDE-EN.md)）

---

## 前言 · 本指南给谁看？

本工具是一个**配置驱动的欧盟整车合规工作台**。你输入一份车辆项目配置（车型、市场、SOP 日期、智能化等级、电动架构等），它给你这辆车进入欧洲市场要遵守的**法规清单**、**时间线**、**部门任务**和**每条法规的详细要求**。

### 本指南面向三类用户

| 角色 | 关心什么 | 主要使用 |
|---|---|---|
| 👤 **Homologation / 认证 lead** | 每条法规要什么文档？哪家 TÜV/UTAC 做？我的 Type-Approval 路径长什么样？ | **Rules tab** 为主 |
| 👤 **Domain team leader**（cybersecurity / privacy / AI / battery / ADAS） | 这个项目里我的团队欠哪些任务？什么时候要交？跟哪条法规挂钩？ | **Plan tab** 为主 |
| 👤 **管理层 / 决策人** | 这个项目现在能不能进欧洲市场？有没有 blocker？哪些国家有风险？ | **Status tab** 为主 |

### 本指南**不**是什么

- **不是法律意见**。工具输出是结构化合规清单，不替代律师、TÜV、DEKRA、UTAC 等专业审核。
- **不是完整法规库**。205 条 seed 规则（经 Phase L.1–L.6 之后已有 **101 条 ACTIVE**，含 27 条 UNECE R-系列 + 9 条 ES overlay）覆盖主要 EU + DE / UK / ES / FR + UNECE 框架；剩余 104 条非 ACTIVE 规则在卡片上都会注明"为什么还未 promoted"的具体原因。
- **不是万能市场工具**。当前覆盖 DE（8 ACTIVE）+ UK（11 ACTIVE）+ ES（**9 ACTIVE**）+ FR（5 ACTIVE，部分覆盖）；NL 仅 seed（0 ACTIVE）；其他 22 个 EU 国延后；非欧盟市场（CN/US/JP/TR）不支持。

### 怎么读这份指南

| 你现在想做什么 | 跳去哪里 |
|---|---|
| 3 分钟快速上手看个样 | → [第一部分](#第一部分--3-分钟快速上手) |
| 我要给一辆具体的车填配置 | → [第二部分](#第二部分--任务-1--配置项目setup-tab) |
| 我要看这个项目能不能进市场 | → [第三部分](#第三部分--任务-2--看项目能不能进市场status-tab) |
| 我要看什么时候做什么 | → [第四部分](#第四部分--任务-3--看什么时候做什么plan-tab) |
| 我要查某条特定法规的细节 | → [第五部分](#第五部分--任务-4--查特定法规的细节rules-tab) |
| 我要看规则治理和整体覆盖 | → [第六部分](#第六部分--任务-5--看治理与覆盖coverage-tab) |
| 我要导出给别人看 | → [第七部分](#第七部分--任务-6--导出与分享) |
| 我看到一些术语不懂 | → [附录 B · 术语表](#附录-b--术语表) |
| 我想找某个字段的说明 | → [附录 A · 字段快速索引](#附录-a--字段快速索引字母序) |
| 我想知道工具**不做**什么 | → [附录 C · 不在本工具范围的问题](#附录-c--不在本工具范围的问题) |

---

## 第一部分 · 3 分钟快速上手

第一次打开工具，按下面的流程走一遍。你会看到工具对一个真实 pilot（MY2027 BEV 在德国上市）能给出哪些结果。

### 1.1 打开页面 · 加载 sample

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

页面最上面是蓝色的 **ScopeBanner**。K.1 改版之后是 **四层渐进式披露**：

> ✓ Scope：Germany + UK production-grade · ES + FR partial · NL + others indicative · CN/US/JP/customs out of scope

点击 banner 可展开四层网格（**production-grade** / **indicative / partial** / **pending authoring** / **out of scope**），每层显示每个 jurisdiction 下的规则数。这条 banner 告诉你工具**真的覆盖什么、明确不覆盖什么**。

第一次访问会落在 **Setup tab**，显示 Onboarding 提示。点右上角 **⚙ 齿轮图标** → 选 **"Load MY2027 BEV sample"**。

工具会自动填入 pilot 配置（30 条 APPLICABLE 规则），并把你带到 Status tab。

### 1.2 看 Status tab 判断项目状态

**K.2 新增 — 管理层友好的 3 秒判读块**。StatusHero **之上** 有一段紧凑 exec 块：

```
Market entry status:  LIKELY OK · 30 applicable · 12 weeks to SOP
Top urgent action: Submit R155 CSMS certificate (due 2026-10-15)
  [See full breakdown ↓]
```

再往下是完整的**判决卡**（verdict card）：

```
Market entry status:  LIKELY OK
Confidence: Medium
Coverage 82/100  Verified 30  Indicative 8  Pending 12
Generated 2026-04-21 15:30 UTC
```

四档判决的含义：

| 判决 | 含义 |
|---|---|
| **LIKELY OK** | 目前看能进市场，没发现阻断性问题 |
| **OK WITH CAVEATS** | 能进，但有条件（例如证据文档还没齐） |
| **AT RISK** | 有阻断性问题，需要解决 |
| **INDETERMINATE** | 证据不足，工具无法给结论（通常因为配置不完整） |

下方是三列：

- **Top blockers** — 当前最紧迫的问题（每一条都是深链，点进去跳到 Rules tab 自动展开）
- **Top deadlines** — 最近 10 个法规 deadline（过期的标红，未来的中性色）
- **Countries at risk** — 对目标市场哪些有风险。经 L.6 之后，**DE**（8 ACTIVE）+ **UK**（11 ACTIVE）+ **ES**（**9 ACTIVE** / 5 pending，含 Homologación Individual 仍待 Orden ministerial）不出现在高风险列表；**FR**（5 ACTIVE / 7 pending）以"partial"形式列出并标明剩余数量；**NL**（0 ACTIVE / 5 SEED_UNVERIFIED）诚实显示"seed-only: 5 条已撰写、0 条已验证"。每条 at-risk 都给出原因。

### 1.3 切到 Plan tab 看本月任务

点顶部导航 **Plan** 切换。**K.2 新增：顶部 exec summary 块**：

```
SOP: 2027-01-15  ·  12 weeks to go
Immediate: 4 tasks  ·  Pre-SOP critical: 11 tasks  ·  Pre-SOP final: 6 tasks
Top 3 upcoming deadlines:
  · R155 CSMS certificate — 2026-10-15
  · R156 SUMS type-approval — 2026-11-30
  · GSR2 ISA delegated act — 2026-12-15
```

再往下，左边是 **Timeline**，按 SOP 日期锚定分段：

- ⚠ **Overdue** — 已过期任务（红色警示）
- **Immediate**（未来 3 个月内）
- **Pre-SOP critical**（SOP 前 12-3 个月）
- **Pre-SOP final**（SOP 前 3 个月 - SOP）
- **Post-SOP**（SOP 后 12 个月）
- **Later**
- **Unscheduled**（无明确 deadline）

右边是 **Owner Dashboard**，按部门分组（homologation / cybersecurity / privacy / ADAS / battery / legal / ...）。每个 bucket 显示这个部门当前有几个任务，以及几个 blocked。

**场景**：你是 cybersecurity leader，点右栏 **Cybersecurity (3 tasks)** 下的 **REG-CS-001 R155** → 自动跳到 Rules tab 并展开 R155 详情。

### 1.4 深入 Rules tab 查特定规则

Rules tab 的规则分**三层 + 一个条件层**：

- ✓ **VERIFIED** — 源已验证，可以信赖（K.2 后 73 条 ACTIVE）
- ⚠ **INDICATIVE** — 已撰写但源未验证，仅供参考（SEED_UNVERIFIED / DRAFT / SHADOW 共 90 条）
- ○ **PENDING AUTHORING** — 占位，未写（33 条）
- — **NEEDS YOUR INPUT** — 你的项目配置缺字段导致无法评估

**K.0 新增 —"为什么只有参考等级" 提示**：每一张非 ACTIVE 的规则卡片都会内联显示 `manual_review_reason` 字段的内容。你再也不用打开 Coverage tab 就能知道 *为什么* 这条规则还没升为 ACTIVE。典型原因例如：
- "Awaiting EUR-Lex URL verification — CELEX ID pending SPARQL confirmation."
- "KBA architectural split pending — see DE-009 follow-up."
- "Windsor Framework NI provisions staged for 2026-10."
- "OJ reference located; last_verified_on pending reviewer sign-off."

一张 Indicative 卡片**没有**原因是 bug，请开 issue。

展开 **REG-CS-001 R155 CSMS** 看到 5 个段落：

1. **Summary** — 一句话
2. **Why it applies** — 为什么适用（列出匹配的触发条件 ✓）
3. **What to do** — 要做什么（required documents + required evidence + submission timing）
4. **Reference** — 依据（EUR-Lex / UNECE 链接 + 最后验证日期）
5. **My tracking** — 你的个人跟踪（todo / in progress / done + 自由 note）

右上角有 **Plain ↔ Engineering** 切换：**Plain 给业务人看**，**Engineering 显示引擎内部的触发条件 JSON**（给工程师看）。

---

**3 分钟走完这 4 步，你对工具就有完整心智模型了。** 继续往下读具体任务。

---

## 第二部分 · 任务 1 · 配置项目（Setup tab）

### 2.1 何时打开这个 tab

- 你有一个**新的车辆项目**要评估合规（从零开始填）
- 你要**克隆一个已有项目**做变体分析（先 Load sample，然后改几个字段）
- 某个字段填错了，结果看起来不对劲，要回来改

Setup tab **始终是合规分析的起点**。所有其他 tab 的结果都来自 Setup 的输入。

### 2.2 必填 vs 选填 · 配置完整度条

Setup tab 顶部有一个**完整度进度条**：

```
Setup progress: ████████░░ 5 of 6 sections complete
```

意思是 6 个主分组中 5 个已填齐**必填项**。未填齐的 section header 会显示缺哪个字段。

**6 个主分组 + 1 个折叠 Advanced 区**：

| # | 分组 | 必填字段 | 默认展开 |
|---|---|---|---|
| 1 | Program & Market | projectName · targetCountries · sopDate | ✅ |
| 2 | Homologation Basis | frameworkGroup · vehicleCategory · approvalType | ✅ |
| 3 | Propulsion & Energy | powertrain | ✅ |
| 4 | ADAS & Automated Driving | automationLevel | ✅ |
| 5 | Digital & Cockpit | （全可选） | ✅ |
| 6 | Readiness | （全可选） | ✅ |
| — | Advanced vehicle systems | （全可选专业字段） | ⬜ 折叠 |

**最快可评估的配置**：填齐 §2.3-§2.6 四个分组的必填字段（共 9 个字段），工具就能给出第一版评估结果。

### 2.3 Program & Market · 项目与市场基本信息

这一段回答"**谁在哪里什么时候卖**"三个问题。

---

#### 2.3.1 `projectName` — 项目名

| 属性 | 值 |
|---|---|
| UI 标签 | "Project name" |
| 数据类型 | 字符串 |
| 必填 | ✅ |

**作用**：给项目起一个人类可读的名字，在 Global nav 顶部的 Project chip、Status bar、URL 分享都用它。

**何时填**：项目启动第一件事。

**示例值**：`MY2027 BEV Pilot`（pilot 样例）、`NextGen SUV Launch`、`Model X Facelift 2028`

**常见错误**：
- 填空字符串：UI 会显示 "Untitled program"，不易识别
- 填过长名字（>60 字符）：Project chip 会被截断

**影响哪些规则触发**：不触发任何规则，纯显示字段。

---

#### 2.3.2 `vehicleCode` — 车辆代号

| 属性 | 值 |
|---|---|
| UI 标签 | "Vehicle code" |
| 数据类型 | 字符串 |
| 必填 | ⬜ |

**作用**：项目内部代号（如 VW 的 B9、BMW 的 G20）。纯标识，便于内部追踪。

**何时填**：项目已分配内部代号后。

**示例值**：`PILOT-MY27-BEV`（pilot）、`B9-REFRESH`、`G20-LCI`

**常见错误**：和 projectName 混淆。projectName 是对外名，vehicleCode 是内部代号。

**影响哪些规则触发**：无触发影响。

---

#### 2.3.3 `targetCountries` — 目标市场

| 属性 | 值 |
|---|---|
| UI 标签 | "Target countries — EU" + "Target countries — Non-EU" |
| 数据类型 | 字符串数组 |
| 选项 | EU 27 国代码（AT · BE · BG · CY · CZ · DE · DK · EE · ES · FI · FR · GR · HR · HU · IE · IT · LT · LU · LV · MT · NL · PL · PT · RO · SE · SI · SK）+ 非 EU（UK · CH · NO · IS · LI · TR） |
| 必填 | ✅ |

**作用**：声明这辆车要在哪些国家销售。**是国别规则（member-state overlay）触发的核心条件**。

**何时填**：项目市场策略一确定就填。

**示例值**：`["DE", "FR", "NL"]`（pilot）、`["DE"]` 单市场最快见结果、`["DE","FR","IT","ES","PL"]` 五大 EU

**常见错误**：
- **勾选 NL 后看到大量 NL 规则显示 UNKNOWN** —— 这**不是 bug**。NL overlay 目前是 seed-only（0 ACTIVE / 5 SEED_UNVERIFIED），Phase K+ 批次才升 ACTIVE。**FR（5 ACTIVE / 7 pending）和 ES（9 ACTIVE / 5 pending）已部分覆盖**，剩余 pending 会在规则卡片上标注"why indicative only"。ScopeBanner 4 层网格会显式告知。
- **勾选非 EU 国家（CN、US、JP 等）** —— 这些国家根本不在下拉选项里。工具明确只服务 EU + UK + EEA + CH 之内。
- **只勾 NL 不勾 DE / UK / FR / ES** —— NL 目前 seed-only，意味着 Status tab 会显示 "Countries at risk"。可以测试但不是有效 demo 配置。

**影响哪些规则触发**：
- `DE` 触发 8 条 ACTIVE 国别规则（注册 FZV、路检 §29 StVZO HU/AU、保险 PflVG、机动车税 KraftStG、Umweltzone 低排区、E-Kennzeichen 等）+ 2 条 indicative
- `FR` 触发 5 条 ACTIVE + 7 条 pending verification；`ES` 触发 7 条 ACTIVE + 7 条 pending；`NL` 触发 5 条 SEED_UNVERIFIED（0 ACTIVE），每条卡片带"why indicative only"
- 整体决定 `targetsEU` / `targetsUK` / `targetsMemberStates` 等 EngineConfig 衍生 flag

---

#### 2.3.4 `sopDate` — Start of Production 日期

| 属性 | 值 |
|---|---|
| UI 标签 | "SOP date" |
| 数据类型 | 日期（YYYY-MM-DD 或 null） |
| 必填 | ✅ |

**作用**：车辆首台量产下线日期。工具用它判断 **FUTURE** vs **CURRENT** vs **NOT_APPLICABLE**（法规到期），也用它锚定 Plan tab 的时间线分段。

**何时填**：项目 SOP 日期一确定。如果未定，填预估日期，工具会基于此提前提醒。

**示例值**：`2027-01-15`（pilot）

**常见错误**：
- **填过去的日期**：工具会把项目当"已上市"，触发 `post_market` 法规而非 `type_approval` 法规
- **留空**：Plan tab 的 SOP-anchored 分段会回退到"按 firstRegistrationDate 锚定"，都没填则回退到日历月分段
- **把 SOP 和 first registration 混淆**：SOP 是**量产开始**，first registration 是**首辆上牌**，两者通常相差 2-4 个月

**影响哪些规则触发**：
- 触发 `applies_to_new_types_from` / `applies_to_all_new_vehicles_from` 的时间判断
- 对比 `applies_to_new_types_from` 在 SOP 之后的法规 → 返回 FUTURE
- 锚定 Plan tab 的 Pre-SOP critical / Pre-SOP final 分段

---

#### 2.3.5 `firstRegistrationDate` — 首次注册日期

| 属性 | 值 |
|---|---|
| UI 标签 | "First registration date" |
| 数据类型 | 日期（YYYY-MM-DD 或 null） |
| 必填 | ⬜ |

**作用**：首辆车实际上牌日期。部分法规用 `applies_to_first_registration_from` 判断适用性（例如某些国别注册要求）。

**何时填**：SOP 之后 2-4 个月的预估日期。如果项目早期不用填。

**示例值**：`2027-04-01`（pilot，SOP 后约 10 周）

**常见错误**：把这个当成 SOP 日期填。

**影响哪些规则触发**：部分 member-state overlay 规则（如 REG-MS-DE-001 FZV 注册）用它判断 applicability。

---

#### 2.3.6 `consumerOrFleet` — 消费者或车队

| 属性 | 值 |
|---|---|
| UI 标签 | "Consumer or fleet" |
| 数据类型 | 枚举 |
| 选项 | `consumer` · `fleet` · `mixed` |
| 必填 | ⬜（默认 `consumer`） |

**作用**：这辆车是卖给私人消费者还是车队客户。影响部分消费者保护法规（如 PLD 产品责任）和税费（如 DE KraftStG BEV 私车 10 年免税 vs 商用车不同规则）。

**何时填**：通常默认 `consumer` 够用。只有商用车队项目才改。

**示例值**：`consumer`（pilot）

**常见错误**：乘用车项目勾 `fleet`，导致触发错误的税费规则。

**影响哪些规则触发**：影响部分 member-state 税费规则 + PLD 部分条款。

---

#### 2.3.7 `salesModel` — 销售模式

| 属性 | 值 |
|---|---|
| UI 标签 | "Sales model" |
| 数据类型 | 枚举 |
| 选项 | `dealer` · `direct` · `leasing` · `subscription` · `mixed` |
| 必填 | ⬜（默认 `dealer`） |

**作用**：分销模式。影响数据保护（订阅模式下用户持续在线 → 影响 GDPR / Data Act）、消费者权益 warranty、售后等。

**何时填**：项目商业模式一确定。

**示例值**：`dealer`（pilot，传统经销商）

**常见错误**：subscription 模式勾 dealer，错过订阅特有的数据合规要求。

**影响哪些规则触发**：影响部分 PV / DA / CL 家族规则的细化条件。

---

### 2.4 Homologation Basis · 类型认证基础

这一段回答"**这是一辆什么车，走什么认证路径**"。

---

#### 2.4.1 `frameworkGroup` — 框架分类

| 属性 | 值 |
|---|---|
| UI 标签 | "Framework group" |
| 数据类型 | 枚举 |
| 选项 | `MN`（乘用车/商用车）· `L`（两三轮/四轮车）· `O`（拖车）· `AGRI`（农林机械） |
| 必填 | ✅ |

**作用**：车辆大分类。**决定走哪个框架法规**：
- `MN` → Regulation (EU) 2018/858（WVTA）
- `L` → Regulation (EU) No 168/2013
- `O` → Regulation (EU) 2018/858
- `AGRI` → Regulation (EU) No 167/2013

**何时填**：项目第一天就要确定。

**示例值**：`MN`（pilot，乘用车）

**常见错误**：
- 电动自行车项目勾 `MN` 而非 `L`（e-bike 是 L1e-A）
- 微型拖车勾 `MN` 而非 `O`

**影响哪些规则触发**：
- `MN` 触发 REG-TA-001 WVTA + 全部 UNECE M/N 族
- `L` 触发 REG-TA-002 L-category
- 错选会导致**完全不同的规则集**

---

#### 2.4.2 `vehicleCategory` — 车辆类别

| 属性 | 值 |
|---|---|
| UI 标签 | "Vehicle category" |
| 数据类型 | 字符串（依 frameworkGroup 动态变化） |
| 选项 | 依 frameworkGroup：<br>MN: `M1` · `M2` · `M3` · `N1` · `N2` · `N3`<br>L: `L1e`..`L7e`<br>O: `O1`..`O4`<br>AGRI: `T1`..`T5` · `C` · `R` · `S` |
| 必填 | ✅ |

**作用**：更细粒度的车辆分类。**决定 UNECE Annex II 的具体触发行**：
- `M1` = 乘用车（8 座以内）
- `M2` = 中型客车（<5 吨）
- `M3` = 大巴（>5 吨）
- `N1` = 轻型货车（<3.5 吨）
- `N2` = 中型货车（3.5-12 吨）
- `N3` = 重型货车（>12 吨）

**何时填**：紧跟 frameworkGroup。

**示例值**：`M1`（pilot）

**常见错误**：N1 皮卡勾 M1、7 座 MPV 勾 M2（应该勾 M1）

**影响哪些规则触发**：多数 UNECE 技术规则（R100 / R13-H / R94 / R95 等）都按 M1/N1/M2 等精确匹配。`M1` 特有：R135 Pole Impact、R137 Full-Width Frontal、R141 TPMS、R145 ISOFIX。

---

#### 2.4.3 `bodyType` — 车身类型

| 属性 | 值 |
|---|---|
| UI 标签 | "Body type" |
| 数据类型 | 枚举 |
| 选项 | `sedan` · `suv` · `hatchback` · `wagon` · `coupe` · `convertible` · `van` · `pickup` · `bus` · `truck` · `chassis_cab` · `other` |
| 必填 | ⬜ |

**作用**：车身类型。影响部分被动安全规则（如敞篷车的侧撞要求不同）、视野规则（如 van 的盲区要求）。

**何时填**：车型定义阶段。

**示例值**：`suv`（pilot）

**常见错误**：把 crossover 勾 `sedan`（应该勾 `suv` 或 `hatchback`）

**影响哪些规则触发**：影响部分 UNECE 技术规则的可选触发条件（目前工具里 body type 主要用于显示，未来会影响更多规则）。

---

#### 2.4.4 `approvalType` — 认证类型

| 属性 | 值 |
|---|---|
| UI 标签 | "Approval type" |
| 数据类型 | 枚举 |
| 选项 | `new_type` · `carry_over` · `facelift` · `major_update` |
| 必填 | ✅ |

**作用**：这是**新认证还是现有认证的扩展**。影响非常多法规的 applicability 日期：
- `new_type` → 用 `applies_to_new_types_from` 判断
- `carry_over` / `facelift` / `major_update` → 用 `applies_to_all_new_vehicles_from`（通常更晚几年）

**何时填**：项目定义之初就要确定。

**示例值**：`new_type`（pilot，从零开始新认证）

**常见错误**：
- **改款车项目勾 `new_type`** —— 导致法规适用期提前 2 年
- **全新车勾 `carry_over`** —— 错过应该必须做的 GSR2 等法规

**影响哪些规则触发**：几乎所有带时间维度的法规都依赖这个字段。例如 GSR2 ISA 对 `new_type` 从 2022-07-06 生效，对 `all new vehicles` 从 2024-07-07 生效。

---

#### 2.4.5 `steeringPosition` — 方向盘位置

| 属性 | 值 |
|---|---|
| UI 标签 | "Steering position" |
| 数据类型 | 枚举 |
| 选项 | `LHD`（左舵） · `RHD`（右舵） · `both` |
| 必填 | ⬜（默认 `LHD`） |

**作用**：纯欧洲大陆项目默认 LHD。UK / IE / MT / CY 是 RHD 市场。

**何时填**：市场确定后。

**示例值**：`LHD`（pilot）

**常见错误**：卖英国项目勾 `LHD`。

**影响哪些规则触发**：影响部分 UK / IE 国别规则的适用（当前工具 UK / IE 都 out of scope，影响有限）。

---

#### 2.4.6 `completionState` — 完工状态

| 属性 | 值 |
|---|---|
| UI 标签 | "Completion state" |
| 数据类型 | 枚举 |
| 选项 | `complete` · `incomplete` · `multi_stage` |
| 必填 | ⬜（默认 `complete`） |

**作用**：这辆车是一步到位还是多阶段完工。例如卡车底盘在 OEM 出厂是 `incomplete`（基础车），买家再改成罐车 / 冷藏车 (`multi_stage`)。乘用车通常都是 `complete`。

**何时填**：通常默认 `complete`。商用车底盘项目才改。

**示例值**：`complete`（pilot）

**常见错误**：乘用车 demo 勾 `multi_stage`，触发错误的多阶段完工规则。

**影响哪些规则触发**：影响部分 market access / import / type-approval 规则（目前影响有限）。

---

### 2.5 Propulsion & Energy · 动力与能源架构

这一段回答"**这辆车怎么驱动、能量从哪来**"。

---

#### 2.5.1 `powertrain` — 动力系统

| 属性 | 值 |
|---|---|
| UI 标签 | "Powertrain" |
| 数据类型 | 枚举 |
| 选项 | `ICE`（内燃机）· `HEV`（油电混合）· `PHEV`（插电混合）· `BEV`（纯电）· `FCEV`（燃料电池） |
| 必填 | ✅ |

**作用**：最核心的动力分类。**决定大量动力、排放、电安全、电池相关规则的触发**：
- `BEV` / `HEV` / `PHEV` / `FCEV` → `batteryPresent: true` → 触发 R100、Battery Regulation、充电相关规则
- `ICE` / `HEV` / `PHEV` → 触发 Euro 7 排放规则（BEV 豁免）
- `FCEV` → 特殊的 R134 氢安全规则

**何时填**：项目定义之初就要。

**示例值**：`BEV`（pilot）

**常见错误**：
- PHEV 勾 HEV：PHEV 额外需要遵守"插电混合动力"特有规则
- BEV 勾 FCEV：工具会触发氢燃料特有规则，全部错配

**影响哪些规则触发**：
- `BEV` 触发：REG-UN-100（R100 EV Safety）、REG-BAT-001（Battery Reg）、`hasRegen` 衍生 flag
- `ICE` 触发：REG-EM-001（Euro 7）、R83 排放、R51 噪声
- `FCEV` 额外触发：R134 Hydrogen
- 决定 `batteryPresent` / `hasRegen` / `batteryCapacityBand` 可用性等衍生 flag

---

#### 2.5.2 `batteryCapacityBand` — 电池容量档位

| 属性 | 值 |
|---|---|
| UI 标签 | "Battery capacity band" |
| 数据类型 | 枚举（可空） |
| 选项 | `small` · `medium` · `large` |
| 必填 | ⬜（只在 powertrain 含电池时出现） |

**作用**：电池容量粗分档：
- `small` ≈ < 30 kWh（典型 city EV、HEV）
- `medium` ≈ 30-75 kWh（典型 compact BEV / PHEV）
- `large` ≈ > 75 kWh（典型中大型 BEV）

**何时填**：BEV / PHEV / FCEV 项目，电池规格定下来就填。

**示例值**：`large`（pilot，MY2027 BEV ~80 kWh）

**常见错误**：
- **ICE 项目看到这个字段**：不会看到，该字段只在 powertrain 包含电池时出现
- **档位粗略**：这是工具已知的局限（真实应用需要精确 kWh 数值），当前档位够用

**影响哪些规则触发**：影响 Battery Regulation 的某些条款适用性（小电池 vs 大电池不同申报阈值）。

---

#### 2.5.3 `chargingCapability` — 充电能力

| 属性 | 值 |
|---|---|
| UI 标签 | "AC charging" · "DC charging" · "Bidirectional" |
| 数据类型 | 三个布尔 |
| 必填 | ⬜（只在 powertrain 含电池时出现） |

**作用**：
- `ac` — 是否支持交流充电（家用 wallbox）
- `dc` — 是否支持直流快充（高速公路 fast charger）
- `bidirectional` — 是否支持双向充放（V2G / V2L）

**何时填**：电动车项目，充电架构定下来就填。

**示例值**：`{ ac: true, dc: true, bidirectional: true }`（pilot）

**常见错误**：
- 所有都勾 false：工具会当纯 range-extender，错过大量充电规则
- 不勾 bidirectional：V2G 的未来法规（如 Battery Reg V2X 条款）不会被提醒

**影响哪些规则触发**：影响部分 R100 充电安全条款、Battery Reg 双向充放相关条款、部分 member-state 充电基础设施规则。

---

#### 2.5.4 `fuel.tankType` — 燃料类型（Phase I 新增）

| 属性 | 值 |
|---|---|
| UI 标签 | "Fuel type" |
| 数据类型 | 枚举（可空） |
| 选项 | `petrol`（汽油）· `diesel`（柴油）· `lpg`（液化石油气）· `cng`（压缩天然气）· `lng`（液化天然气）· `h2`（氢）· `none`（无燃料，纯电） |
| 必填 | ⬜（仅在 powertrain 非 BEV 时出现） |

**作用**：为内燃机/混动车型提供精确燃料信息。与 `powertrain` 互补——`powertrain` 说"**这辆车有内燃机**"，`fuel.tankType` 说"**它烧的是汽油/柴油/其他**"。BEV 和纯电两轮车应选 `none`。

**何时填**：项目定义内燃/混动动力配置时。BEV 可跳过（缺省 `none`）。

**示例值**：`petrol`（ICE×ES pilot、PHEV pilot）· `none`（BEV pilot）

**常见错误**：
- 柴油车填成汽油：会漏掉柴油专属 OBD/NOx 规则（REG-EM-013、R49 HD-diesel、NOx 后处理）
- LPG/CNG 填成汽油：会漏掉 R67/R110 改装相关规则

**影响哪些规则触发**：驱动衍生 flag `hasCombustionEngine` / `hasDieselEngine` / `hasFuelTank` / `hasOBD` / `isPlugInHybrid`。影响 Euro 7 三拆规则（框架 REG-EM-001 + 内燃 REG-EM-013 + 电池耐久 REG-EM-014）及 UNECE 排放族规则。

---

### 2.6 ADAS & Automated Driving · 辅助驾驶与自动驾驶

这一段回答"**这辆车能自己开到什么程度**"。

---

#### 2.6.1 `automationLevel` — 自动化等级

| 属性 | 值 |
|---|---|
| UI 标签 | "Automation level" |
| 数据类型 | 枚举 |
| 选项 | `none` · `basic_adas` · `l2` · `l2plus` · `l3` · `l4` · `l4_driverless` |
| 必填 | ✅ |

**作用**：SAE 自动驾驶分级。**决定 DCAS / ALKS 相关法规的触发**：
- `none` / `basic_adas` → 无 L-level 法规
- `l2` → 基础 ADAS 法规
- `l2plus` → 触发 REG-AD-002 R171 DCAS
- `l3` / `l4` → 触发 REG-AD-001 R157 ALKS
- `l4_driverless` → 额外触发 driverless 特有的 R157-plus 条款

**何时填**：产品能力定义阶段。

**示例值**：`l2plus`（pilot，主动式 lane-keeping + ACC + lane change support）

**常见错误**：
- L2 车勾 `l3`：触发 ALKS 的全部要求（过度），包括司机监控摄像头、DSSAD 等
- L3 车勾 `l2plus`：错过 R157 ALKS 必要的 type-approval 流程

**影响哪些规则触发**：
- `l2plus` 触发 REG-AD-002 R171 DCAS（pilot 的情况）
- `l3`+ 触发 REG-AD-001 R157 ALKS
- 衍生 `isL3Plus` / `isDriverless` flag

---

#### 2.6.2 `adasFeatures` — ADAS 功能清单

| 属性 | 值 |
|---|---|
| UI 标签 | "ADAS features"（多选） |
| 数据类型 | 字符串数组 |
| 选项 | `lane_keeping` · `adaptive_cruise` · `blind_spot` · `cross_traffic` · `traffic_sign` · `night_vision` · `surround_view` |
| 必填 | ⬜ |

**作用**：具体装备的 ADAS 功能清单。

**何时填**：产品功能 spec 定下来就勾。

**示例值**：`["lane_keeping", "adaptive_cruise", "blind_spot", "cross_traffic", "traffic_sign", "surround_view"]`（pilot）

**常见错误**：漏勾 lane_keeping（R79 方向控制会少触发某些测试）。

**影响哪些规则触发**：影响部分 GSR2 delegated acts（TSR traffic sign）、R79 steering、R152 AEB 的具体触发条件。

---

#### 2.6.3 `motorwayAssistant` — 高速公路辅助

| 属性 | 值 |
|---|---|
| UI 标签 | "Motorway assistant" |
| 数据类型 | 布尔 |
| 必填 | ⬜ |

**作用**：是否装备高速公路集成辅助（ACC + lane keeping + auto lane change 组合）。

**何时填**：高速功能 spec 定下就勾。

**示例值**：`true`（pilot）

**常见错误**：勾了但没勾 `lane_keeping` / `adaptive_cruise`（逻辑不一致）。

**影响哪些规则触发**：配合 automationLevel=l2plus 触发 REG-AD-002 R171 DCAS 的 custom evaluator。

---

#### 2.6.4 `parkingAutomation` — 自动泊车

| 属性 | 值 |
|---|---|
| UI 标签 | "Parking automation" |
| 数据类型 | 布尔 |
| 必填 | ⬜ |

**作用**：是否支持自动泊车（APA、Remote Parking、Home-zone auto-park 等）。

**示例值**：`false`（pilot 无此功能）

**影响哪些规则触发**：部分 R79 steering 自动泊车特有子测试 + 部分数据保护规则（因为 remote parking 涉及车外遥控 → 数据流）。

---

#### 2.6.5 `systemInitiatedLaneChange` — 系统主动变道

| 属性 | 值 |
|---|---|
| UI 标签 | "System-initiated lane change" |
| 数据类型 | 布尔 |
| 必填 | ⬜ |

**作用**：是否支持车辆自主主动变道（不用司机拨转向灯触发）。这是 R157 ALKS 的 Amendment 2 功能。

**示例值**：`false`（pilot，只 L2+，不含主动变道）

**常见错误**：L2+ 车勾 `true` —— 主动变道是 L3 特性。

**影响哪些规则触发**：配合 l3+ 触发 R157 特定条款。

---

### 2.7 Digital & Cockpit · 数字与座舱

这一段回答"**这辆车有哪些数字能力、数据流、AI**"。**这一段集中了 SDV（软件定义汽车）相关法规的触发源**。

---

#### 2.7.1 `connectivity` — 连接能力

| 属性 | 值 |
|---|---|
| UI 标签 | "Connectivity"（多选） |
| 数据类型 | 字符串数组 |
| 选项 | `telematics` · `mobile_app` · `remote_control` · `ota` |
| 必填 | ⬜ |

**作用**：车辆的连接方式：
- `telematics` — 车载联网系统（eCall、数据回传）
- `mobile_app` — 手机 app 绑定
- `remote_control` — 远程控制功能（远程启动、开门、召唤）
- `ota` — Over-the-Air 软件更新

**示例值**：`["telematics", "mobile_app", "remote_control", "ota"]`（pilot，全联网）

**常见错误**：勾了 OTA 但没勾 CSMS ready（第 2.9 Readiness）—— 工具会提示 R156 SUMS 无法 promote。

**影响哪些规则触发**：
- 任一勾选 → `hasConnectedServices: true` → 触发 REG-CS-001 R155 CSMS
- `ota` 勾选 → `hasOTA: true` → 触发 REG-CS-002 R156 SUMS
- 整体触发 REG-DA-001 Data Act

---

#### 2.7.2 `dataFlags` — 数据处理标识

| 属性 | 值 |
|---|---|
| UI 标签 | "Data processing flags"（多选） |
| 数据类型 | 字符串数组 |
| 选项 | `cabin_camera` · `driver_profiling` · `biometric_data` · `location_tracking` |
| 必填 | ⬜ |

**作用**：车辆会处理哪些类型的个人数据：
- `cabin_camera` — 车内摄像头（DMS / OMS）
- `driver_profiling` — 司机画像（习惯、偏好）
- `biometric_data` — 生物识别（面部识别解锁、心跳监测）
- `location_tracking` — 位置追踪

**示例值**：`["cabin_camera", "driver_profiling", "biometric_data", "location_tracking"]`（pilot，全启用）

**常见错误**：勾了 biometric_data 但没做 DPIA（第 2.9 Readiness 的 dpiaCompleted）—— 工具会提示 GDPR Art. 35 未满足。

**影响哪些规则触发**：
- 任一勾选 → `processesPersonalData: true` → 触发 REG-PV-001 GDPR
- `cabin_camera` + `biometric_data` → 触发 AI Act Art. 5（禁止的实时远程生物识别）边界检查

---

#### 2.7.3 `aiLevel` — AI 集成等级

| 属性 | 值 |
|---|---|
| UI 标签 | "AI level" |
| 数据类型 | 枚举 |
| 选项 | `none` · `conventional`（规则式）· `ai_perception`（感知）· `ai_dms`（司机监控）· `ai_analytics`（数据分析）· `ai_safety`（安全决策）· `foundation_model`（基础模型集成） |
| 必填 | ⬜（默认 `none`） |

**作用**：最高的 AI 使用等级。**决定 AI Act 的 applicability**：
- `none` / `conventional` → 不触发 AI Act
- `ai_perception` / `ai_dms` / `ai_analytics` → AI Act Art. 4 literacy 要求
- `ai_safety` → AI Act Art. 6(1) high-risk AI（安全组件）
- `foundation_model` → 额外触发 GPAI 义务

**何时填**：AI 功能 spec 定下来。

**示例值**：`ai_dms`（pilot，DMS 是 AI 驱动的司机监控）

**常见错误**：
- `ai_dms` 项目勾 `conventional`：错过 AI Act literacy 训练要求
- `ai_safety` 项目勾 `ai_perception`：错过 high-risk conformity assessment

**影响哪些规则触发**：
- `ai_dms` / `ai_perception` / `ai_safety` → `hasAI: true` → 触发 REG-AI-001 AI Act 横向
- `ai_dms` / `ai_safety` → `hasSafetyRelevantAI: true` → 触发 REG-AI-004 AI Act Art. 6(1) 汽车安全组件

---

#### 2.7.4 `aiInventoryExists` — AI 清单存在

| 属性 | 值 |
|---|---|
| UI 标签 | "AI inventory exists" |
| 数据类型 | 布尔 |
| 必填 | ⬜ |

**作用**：项目是否已建立 AI 系统内部清单（用来跟踪 AI Act 合规）。

**示例值**：`true`（pilot）

**常见错误**：aiLevel=ai_safety 但勾 false —— 工具会提示 AI Act risk management system 缺失。

**影响哪些规则触发**：影响 REG-AI-001 / REG-AI-004 的 evidence 要求。

---

### 2.8 Readiness · 项目准备度

这一段**不是描述车辆本身，而是描述项目组织准备度**。全部可选但非常影响评估结果。

---

#### 2.8.1 `csmsAvailable` — CSMS 已就位

| 属性 | 值 |
|---|---|
| UI 标签 | "CSMS available (Cybersecurity Management System)" |
| 数据类型 | 布尔 |

**作用**：是否已有 R155 要求的 CSMS（网络安全管理体系）认证。**没有 CSMS 证书，R155 vehicle type approval 无法通过**。

**示例值**：`true`（pilot）

**影响规则**：REG-CS-001 R155 会检查这个 flag，未就位显示 blocker。

---

#### 2.8.2 `sumsAvailable` — SUMS 已就位

| 属性 | 值 |
|---|---|
| UI 标签 | "SUMS available (Software Update Management System)" |
| 数据类型 | 布尔 |

**作用**：R156 要求的软件更新管理体系。connectivity 里勾 `ota` 就必须有 SUMS。

**示例值**：`true`（pilot）

**影响规则**：REG-CS-002 R156 SUMS。

---

#### 2.8.3 `dpiaCompleted` — DPIA 已完成

| 属性 | 值 |
|---|---|
| UI 标签 | "DPIA completed (Data Protection Impact Assessment)" |
| 数据类型 | 布尔 |

**作用**：GDPR Art. 35 要求的数据保护影响评估。处理生物识别 / 系统性监控 等高风险数据时必须做。

**示例值**：`true`（pilot）

**影响规则**：REG-PV-001 GDPR。

---

#### 2.8.4 `technicalDocStarted` — 技术文件开工

| 属性 | 值 |
|---|---|
| UI 标签 | "Technical documentation started" |
| 数据类型 | 布尔 |

**作用**：WVTA 技术档案（Annex I）是否已经开始编制。

**示例值**：`true`（pilot）

**影响规则**：REG-TA-001 WVTA 准备度检查。

---

#### 2.8.5 `evidenceOwnerAssigned` — 证据责任人已指派

| 属性 | 值 |
|---|---|
| UI 标签 | "Evidence owner assigned" |
| 数据类型 | 布尔 |

**作用**：每条法规是否已分配责任人（homologation engineer / domain lead / ...）。影响 Owner Dashboard 的可用性。

**示例值**：`true`（pilot）

---

#### 2.8.6 `registrationAssumptionsKnown` — 注册假设已明确

| 属性 | 值 |
|---|---|
| UI 标签 | "Registration assumptions known" |
| 数据类型 | 布尔 |

**作用**：目标市场的注册流程假设（经销商 vs 个人 / 多国并行 vs 逐国）是否已明确。

**示例值**：`true`（pilot）

---

### 2.9 Advanced vehicle systems · 高级车辆系统（折叠区）

默认折叠。打开后有 6 个子分组，全部可选。只有 homologation engineer 需要填这些（给业务用户：可忽略）。

#### 2.9.1 Braking（制动）
- `type` — `conventional` · `regen` · `mixed`（pilot: `regen`）
- `absFitted` — 布尔（pilot: `true`）
- `espFitted` — 布尔（pilot: `true`）

#### 2.9.2 Steering（转向）
- `type` — `mechanical` · `electric` · `steer_by_wire`（pilot: `electric`）
- `eps` — 布尔（pilot: `true`）

#### 2.9.3 Cabin（车厢）
- `airbagCount` — 整数（pilot: `8`）
- `isofixAnchors` — 布尔（pilot: `true`）
- `seatbeltReminder` — 布尔（pilot: `true`）

#### 2.9.4 Lighting（灯光）
- `headlampType` — `halogen` · `led` · `matrix_led`（pilot: `matrix_led`）
- `avas` — 布尔（pilot: `true`，BEV 必须有）

#### 2.9.5 Fuel（燃油）
- `tankType` — `petrol` · `diesel` · `lpg` · `cng` · `lng` · `h2` · `none`（pilot: `none`，BEV）

#### 2.9.6 HMI（人机界面）
- `touchscreenPrimary` — 布尔（pilot: `true`）
- `voiceControl` — 布尔（pilot: `true`）

每个子字段影响特定 UNECE 技术规则（R13H 制动、R79 转向、R43 玻璃、R16 安全带、R48 灯光安装、AVAS、R138 等）。**业务用户不填这些不会错过主干规则** —— 只会错过 Annex II 细节规则（大多数仍是 placeholder）。

### 2.10 Setup progress · 完整度条怎么看

```
Setup progress: ████████░░ 5 of 6 sections complete
```

- 6 个主分组（§2.3–§2.8，Advanced 不计入）
- "complete" = 所有**必填字段**非空
- 点 section header 展开看缺哪个字段
- **建议先达到 6/6 再切去其他 tab** —— 不然 Status tab 会有一半规则显示 "Needs your input"

### 2.11 Load sample 的用法

右上角 ⚙ → **Load MY2027 BEV sample**。

**用途**：
- 第一次上手演示
- 测试工具行为时的标准配置
- 回归基线（pilot 的评估结果已被 236 tests 中的 `pilot-acceptance.test.ts` 固化）

**注意**：Load sample 会**覆盖当前 config**。如果正在填自己项目，先 ⚙ → **Clear saved state** 备份（实际是导出 JSON），再 Load sample。

---

## 第三部分 · 任务 2 · 看项目能不能进市场（Status tab）

### 3.0 Exec summary 块（K.2 新增 · 管理层友好）

Status tab 顶部、StatusHero **之上** 是一段紧凑 exec 块，**3 秒内回答关键问题**：

```
Market entry status:  LIKELY OK  ·  30 applicable  ·  12 weeks to SOP
Top urgent action: Submit R155 CSMS certificate (due 2026-10-15)
  [See full breakdown ↓]
```

适用场景：你只有 30 秒 standup 或 exec 汇报时间，这块告诉你"项目能否进市场 + 最紧要做什么"。`[See full breakdown]` 链接滚动到下面完整的 hero card + 4 个指标。这是给 VP / 项目经理看的，他们不需要看 4 指标 reconciliation。


这是**管理层**最常看的 tab。

### 3.1 四档判定 · LIKELY OK / OK WITH CAVEATS / AT RISK / INDETERMINATE

页面顶部 hero 卡显示判决：

```
Market entry status:  LIKELY OK
Confidence: Medium
```

| 判决 | 含义 | 触发条件 |
|---|---|---|
| **LIKELY OK** | 目前看能进市场 | `canEnterMarket=true` + `confidence=high` |
| **OK WITH CAVEATS** | 能进，但有条件 | `canEnterMarket=true` + `confidence=medium/low` |
| **AT RISK** | 有阻断问题 | `canEnterMarket=false` + `confidence=high` |
| **INDETERMINATE** | 数据不足给结论 | `canEnterMarket=false` + `confidence=low` |

**"能进市场"的定义**：当前项目没有任一 high-severity blocker 且所有 target country overlay 有至少一条 ACTIVE。

**注意**：这是**描述性判决**，不是**法律结论**。工具避免用 "YES" / "NO"，用 "LIKELY OK" / "AT RISK"，因为工具本身不具有法律签字权威。任何上市决策必须由律所和 homologation partner 签字确认。

### 3.2 Confidence · 可信度

| Confidence | 含义 |
|---|---|
| **High** | ≥ 60% 的 in-scope 规则是 Verified |
| **Medium** | 25-60% 的 in-scope 规则是 Verified |
| **Low** | < 25% 的 in-scope 规则是 Verified，或项目缺字段 |

"in-scope 规则" = Verified + Indicative + Pending authoring（三分层前三类）的总和。

### 3.3 四个 metric cards

| Metric | 含义 | 从哪来 |
|---|---|---|
| **Coverage score** | 0-100 综合评分：verified × weight / total | `src/engine/executive-summary.ts` |
| **Verified applicable** | ACTIVE 且 APPLICABLE 的规则数 | 引擎评估结果 |
| **Indicative applicable** | SEED_UNVERIFIED / DRAFT / SHADOW 且 APPLICABLE-or-CONDITIONAL 的数 | 同上 |
| **Pending authoring** | 在 scope 内但 PLACEHOLDER 的规则数 | 同上 |

**每张 card 都有"project-scoped"或"of M in registry"的 reconciliation 子行**，意思是：
- "Verified applicable: 17 / of 18 ACTIVE in registry" → 当前项目触发了 17 条，registry 里总共有 18 条 ACTIVE（1 条因项目配置不触发）

这个 reconciliation 设计是为了让 Status 和 Coverage 两 tab 数字对得上（Sprint 2 UX-002 修复）。

### 3.4 Top blockers

列最多 5 条阻断性规则，每条显示：
- **Severity badge**：HIGH / MED / LOW
- **标题** + **short_label**
- **Reason**：为什么是 blocker（例如"Verified but missing required documents"）
- **Owner**：该规则归谁负责（homologation / cybersecurity / privacy / ...）

每条是**深链** —— 点击跳到 Rules tab 自动展开该规则。

**Severity 算法**：
- **HIGH** = ACTIVE + third_party_verification_required + missing evidence + deadline ≤ 6 个月
- **MED** = ACTIVE + APPLICABLE + deadline ≤ 12 个月
- **LOW** = 其他

### 3.5 Top deadlines

列最近 10 个法规 deadline，按时间升序：
- **过期项** → "14 months overdue"（红色）
- **未来项** → "in 7 months"（中性色）
- **本月** → "this month"

Sprint 1 UX-001 修复：以前会显示 "-14 mo remaining"（负数），现在**一律用 "overdue" 措辞**。

### 3.6 Countries at risk

K.2 之后的最新覆盖状态（73 条 ACTIVE 跨所有 jurisdiction）：

- `DE` ✓（8 条 ACTIVE overlay）—— 不出现在 at-risk 列表
- `UK` ✓（11 条 ACTIVE，含 AV Act 2024）—— 作为 production-grade 非欧盟市场
- `ES` 🟡（7 条 ACTIVE + 7 条 indicative）—— 列出并注明剩余数；每条 indicative 规则卡片都标注"why pending"
- `FR` 🟡（5 条 ACTIVE + 7 条 pending）—— 部分覆盖
- `NL` ⚠（0 ACTIVE、5 条 SEED_UNVERIFIED）—— "seed-only: 5 条已撰写但 0 条验证，需本地确认"
- 其他 EU 国（IT/PL/BE/AT/SE/CZ/…）—— out of scope，明确标注

**每条 at-risk 都显示"原因"** —— 不是单纯"有问题"，而是告诉你**为什么**有问题。

### 3.7 Generated at 时间戳

hero 卡底部显示：
```
Generated 2026-04-19 15:30 UTC
```

这是**这次评估**的时间戳。**每次 config 变化**都会重算 summary。

如果时间戳比你的 config 最后编辑时间还早 → 刷新浏览器。

---

## 第四部分 · 任务 3 · 看什么时候做什么（Plan tab）

**Domain team leader** 最常看的 tab。

### 4.0 Plan exec summary（K.2 新增）

Timeline **之上** 是一块紧凑的 summary：

```
SOP: 2027-01-15  ·  12 weeks to go  ·  42 tasks total
Immediate (next 3mo): 4     Pre-SOP critical (−12mo→−3mo): 11
Pre-SOP final (−3mo→SOP): 6 Post-SOP: 8   Later: 13

Top 3 upcoming deadlines:
  · 2026-10-15 — R155 CSMS certificate
  · 2026-11-30 — R156 SUMS type-approval
  · 2026-12-15 — GSR2 ISA delegated act
```

给 team leader / 项目经理 5 秒内回答"我要不要担心"的问题，再深入下面的 timeline + Owner Dashboard。

### 4.1 SOP-anchored 时间分段

左侧 Timeline 按 SOP 日期锚定，共 7 段：

| Segment | 锚定窗口 | 默认状态 |
|---|---|---|
| ⚠ **Overdue** | deadline < today | 展开（红色） |
| **Immediate** | today → today + 3 months | 展开 |
| **Pre-SOP critical** | SOP − 12mo → SOP − 3mo | 展开 |
| **Pre-SOP final** | SOP − 3mo → SOP | 展开 |
| **Post-SOP** | SOP → SOP + 12mo | 折叠 |
| **Later** | > SOP + 12mo | 折叠 |
| **Unscheduled** | no date | 折叠（显示数字） |

**回退逻辑**：
- SOP null → 用 firstRegistrationDate 锚
- 两者都 null → 按日历月（today / next 3mo / next 6mo / next 12mo / later）

### 4.2 每个 milestone 的三列

每个月（在分段内）是一个 **milestone**，有三列：
- **Deadline rules** — 这个月有硬 deadline 的规则
- **Evidence due** — 这个月该把证据文档准备好的规则
- **Review due** — 这个月该做人工复审的规则（freshness 快过期）

大多数月只填 1-2 列，空列显示"—"。

### 4.3 Owner Dashboard · 按部门分组

右侧 Owner Dashboard 按 `owner_hint` 字段分组。默认展示**前 3 个最大 bucket** 展开，其他折叠。

Bucket header 显示四个徽章：
- **Applicable**（绿）— APPLICABLE 的数
- **Conditional**（黄）— CONDITIONAL 的数
- **Unknown**（灰）— UNKNOWN 的数
- **Blocked**（红）— blocked 任务数

**空 bucket 自动隐藏**（Sprint 8 之前的 bug：所有 11 个 owner 都显示，其中 8 个 0 任务，现已修）。

### 4.4 blocked_count · 什么叫 blocked

一条规则被算作 **blocked** 当且仅当：
- `applicability === APPLICABLE`
- `third_party_verification_required === true`
- `required_documents` 为空或未填

意思是：**法规适用、需要第三方认证（TÜV / DEKRA / UTAC 等）、但还没准备文档**。

### 4.5 点 rule 跳 Rules tab

Owner Dashboard 或 Timeline 里每条规则都是**深链**。点击 `REG-CS-001 R155` 会跳到 `/rules?rule=REG-CS-001`，该 rule card 自动展开。

---

## 第五部分 · 任务 4 · 查特定法规的细节（Rules tab）

**Homologation lead** 最常看的 tab。

### 5.1 三分层 · Verified / Indicative / Pending / Needs your input

Rules tab 的规则按**可信度**分 4 段（post-K.2 当前状态）：

| 分段 | 图标 | 含义 | 数量 | 默认状态 |
|---|---|---|---|---|
| **Verified** | ✓ | ACTIVE + source 已验证，可以信 | 73 | 展开 |
| **Indicative** | ⚠ | SEED_UNVERIFIED / DRAFT / SHADOW，已撰写但源未验证 | 90 | 展开 |
| **Pending authoring** | ○ | PLACEHOLDER，未撰写 | 33 | 折叠（显示数量） |
| **Needs your input** | — | 你的 config 缺字段导致 UNKNOWN | 可变 | 展开（仅非空时） |

**每段 header** 显示规则数 + 说明 hint，例如：
- ✓ VERIFIED (30 applicable) — "You can rely on these"
- ⚠ INDICATIVE (8) — "Review before trusting"
- ○ PENDING AUTHORING (12) — "Not yet written up"
- — NEEDS YOUR INPUT (3) — "Fill highlighted fields in Setup to evaluate"

#### 5.1.1 "Why indicative only" 卡内提示（K.0 新增）

每一张 **Indicative** 和 **Pending** 的卡片会在头部**内联显示**一段高亮 callout，内容来自规则的 `manual_review_reason` 字段。这样你不用打开 Coverage tab 的 Verification Queue 就能直接看到 *为什么* 这条规则未升 ACTIVE。真实示例：

- "Awaiting EUR-Lex URL verification — CELEX ID pending SPARQL confirmation."
- "KBA architectural split pending — see DE-009 follow-up."
- "Windsor Framework NI provisions staged for 2026-10; Public Charge Point Regulations staging parallel."
- "OJ reference located; last_verified_on pending reviewer sign-off."

如果一条 Indicative 卡片**没有** callout —— 是 bug，请开 issue。

### 5.2 FilterBar 的使用

FilterBar 在三分层上方：

| Filter | 选项 |
|---|---|
| **Search** | 自由搜索（rule ID / title / legal_family / explanation） |
| **Applicability** | All / Applies / May apply / Applies from / Does not apply / Unknown |
| **Freshness** | All / Fresh / Due soon / Overdue / Critical / Never verified / Drifted |

**场景**：想看"所有真正 applicable 的 cybersecurity 规则"→ search "cyber" + Applicability=Applies。

### 5.3 打开 RuleCardV2 看什么

每条规则是一张可折叠卡片。展开后有 5 个 section。

#### 5.3.1 Summary · 概要

一段话说明这条法规是什么、为什么相关。

**示例**（REG-CS-001 R155 CSMS）：

> UNECE R155 mandates a Cybersecurity Management System (CSMS) certificate for vehicle type-approval. Applies to M/N categories from 2022-07-06 (new types) / 2024-07-07 (all new vehicles).

#### 5.3.2 Why it applies · 为什么适用

列出匹配的触发条件，每条打 ✓：

```
✓ Framework group is MN
✓ Vehicle category is one of M1, M2, M3, N1, N2, N3
✓ Connected services present
```

**Plain 模式**（默认）：自然语言描述，不出现字段代号。
**Engineering 模式**：显示原始 `trigger_logic` JSON + `matched_conditions` / `unmatched_conditions`。

切换按钮在卡片右上角。

**Needs your input 的处理**（5.5）：如果某个触发条件需要的字段缺失，会在这段显示：

```
⚠ Missing input: automationLevel (needed to evaluate R171 DCAS trigger)
[Go to Setup and fill this field →]
```

点击回到 Setup tab，该字段高亮。

#### 5.3.3 What to do · 要做什么

展示执行要求：
- **Required documents** (N) — 要准备的文档列表
- **Required evidence** (M) — 要收集的证据列表
- **Submission timing** — 什么时候递交
- **Prerequisite standards** — 前置 ISO 标准（如 ISO/SAE 21434 for R155）

**示例**（REG-CS-001）：

```
Required documents (4):
 · CSMS certificate application
 · CSMS process documentation
 · Vehicle type cybersecurity assessment
 · Threat Analysis and Risk Assessment (TARA)

Required evidence (3):
 · CSMS certificate from approval authority
 · Vehicle type-approval for cybersecurity
 · Continuous monitoring evidence

Submission timing:
CSMS certificate before vehicle type-approval; certificate valid max 3 years.
```

#### 5.3.4 Reference · 依据

依据来源：

```
UNECE Regulation No. 155 (Revision 5)
Source: UNECE (official)
Last verified by yanhao on 2026-04-16
Review cadence: 180 days
[Open on UNECE ↗]

Prerequisite standards: ISO/SAE 21434
Related: REG-CS-002 (complements), REG-AD-001 (requires)
```

**Provenance 行**（`Source: X · Reviewed by Y · Retrieved YYYY-MM-DD`）是 Sprint 3 新增的**内容可追溯性**。**每一条 ACTIVE 规则都有**。没有 provenance 的 ACTIVE 规则是 bug，请开 issue。

**Related 深链**：点 `REG-CS-002` 跳到该规则卡片。

#### 5.3.5 My tracking · 个人跟踪

你的**项目内跟踪**：

- **Status**：todo / in_progress / done（自己设）
- **Note**：自由文本（例如"TÜV 已确认 ok")

**每条规则独立，跨 session 持久化**（localStorage）。

### 5.4 Plain ↔ Engineering 切换

| 模式 | 给谁看 | 显示什么 |
|---|---|---|
| **Plain** | 业务人员、管理层、审核 reviewer | 自然语言、✓ 匹配条件、中文化的文案 |
| **Engineering** | 工程师、debug | 原始 JSON、matched/unmatched conditions、missing inputs 列表 |

默认 Plain。切到 Engineering 需要手动点击（默认不暴露 raw data）。

### 5.5 "Needs your input" 的处理

如果 config 缺字段，工具不会**默默给 UNKNOWN**。相反会：
1. 把该规则放进 "Needs your input" 分段
2. 在 Why-it-applies 段落高亮缺的字段
3. 提供深链"Go to Setup and fill this field →"

**点击深链会跳回 Setup，对应字段高亮 30 秒，方便定位**。

### 5.6 related_rules 深链

每条规则的 Reference 段可能列出 related_rules，4 种关系：
- **requires** — 这条规则的适用前提是另一条也适用
- **complements** — 互补（一起用更完整）
- **supersedes** — 替代（新规则替代旧规则）
- **conflicts** — 冲突（需要人工判断优先级）

**场景**：R155 CSMS 显示 "Related: REG-CS-002 (complements), REG-AD-001 (requires)"，点 REG-AD-001 立即跳到 R157 ALKS。这让"R155 是 ALKS 审批前提"的关系一眼可见，省掉 Confluence 页面。

### 5.7 prerequisite_standards

规则可能依赖 ISO 标准做 prerequisite：

| 法规 | 常见 prerequisite |
|---|---|
| R155 CSMS | ISO/SAE 21434（Road vehicles — Cybersecurity engineering） |
| R157 ALKS | ISO 26262（Functional Safety） + ISO 21448（SOTIF） |
| PLD 2024 | ISO 26262（Functional Safety） + ISO/SAE 21434（Cybersecurity） |
| AI Act Art. 6(1) | ISO 8800 (AI for road vehicles)（drafting） |

**工具只显示依赖关系，不验证 ISO 合规** —— ISO 标准层是 out of scope（Phase 14+）。

---

## 第六部分 · 任务 5 · 看治理与覆盖（Coverage tab）

**合规 reviewer** 或**工具维护者**看的 tab。业务用户通常不用。

### 6.1 Lifecycle 分布

显示 205 条规则按 lifecycle 分布（L.6 之后最新）：

```
ACTIVE           101
SEED_UNVERIFIED   56
DRAFT             15
SHADOW             0
PLACEHOLDER       33
ARCHIVED           0
```

### 6.2 Freshness 分布

显示 ACTIVE 规则的 freshness 分布（只 ACTIVE 有 freshness 概念）：

```
Fresh             12
Due soon           4
Overdue            1
Critically overdue 0
Never verified     0
Drifted            1
```

### 6.3 Domain × Process coverage matrix

一张 20 行（domain）× 4 列（process stage）的矩阵，显示每个 domain 在每个 stage 有多少条规则。空格子 = 空 domain gap。

筛选器：
- **Process stage**：all / pre_ta / type_approval / sop / post_market
- **Gap cause**：all / no_rules / placeholder_only / source_unverified

### 6.4 Member-state chips（K.1 更新）

与 4 层 ScopeBanner 对齐：

- 🟢 **DE (8 ACTIVE + 2 indicative)** — Production-grade guidance available
- 🟢 **UK (11 ACTIVE + 2 DRAFT)** — Production-grade 非欧盟市场 overlay，含 AV Act 2024
- 🟢 **ES (9 ACTIVE + 5 indicative/DRAFT/PLACEHOLDER)** — 部分覆盖（L.6 promoted Etiqueta Ambiental + RD 106/2008），Homologación Individual 仍需 Orden ministerial 核查
- 🟡 **FR (5 ACTIVE + 7 null-URL/DRAFT)** — 部分覆盖，剩余 verification 进行中
- 🟠 **NL (0 ACTIVE / 5 SEED_UNVERIFIED)** — Seed-only，已撰写但未验证；Phase K+ 批量推 ACTIVE
- 🟠 **IT / PL / BE / AT / SE / CZ（各 5 条 PLACEHOLDER）** — Placeholder — 覆盖空档，需本地确认

### 6.5 Verification Queue

列出所有 `SEED_UNVERIFIED` 的规则（ACTIVE 被 governance 降级的也在这），每条显示缺哪些 source field（official_url / oj_reference / last_verified_on）。Reviewer 可以在这里逐条补齐。

### 6.6 Promotion Log

历史记录：谁、什么时候、从哪个 state、把哪条规则推到 ACTIVE。审计链。

---

## 第七部分 · 任务 6 · 导出与分享

### 7.1 URL 分享

每改一次 config，URL 的 query string 会自动同步（例如 `?sopDate=2027-01-15&frameworkGroup=MN&...`）。

**复制 URL 发给同事** → 他打开看到**完全一样的**评估结果（前提：他本地启动了这个工具）。

### 7.2 JSON / CSV 导出

Results 面板底部（Rules tab）有 **Export JSON** / **Export CSV** 按钮。

- **JSON** = 完整 config + 完整 evaluation result + 用户 note / status
- **CSV** = 扁平化的规则列表（rule_id, applicability, explanation, ...）适合 Excel

**限制**：当前 localStorage 只存一份 project。要保存多个 project，每个导出 JSON 单独存盘。

### 7.3 Export as PDF

浏览器 Print (Ctrl+P / Cmd+P) → 选 "Save as PDF"。每个 tab 都有专门的 print CSS 优化：

- Setup tab → 项目配置 summary PDF
- Status tab → 管理层 dashboard PDF
- Plan tab → 时间线 + 部门任务 PDF
- Rules tab → 所有适用规则 + 详情 PDF
- Coverage tab → 治理报告 PDF

**5 份 PDF 组合起来**就是给 stakeholder 的完整 demo 包。

### 7.4 发给 stakeholder 的姿势

| Stakeholder | 发什么 |
|---|---|
| 管理层 | Status tab PDF（3 页内） |
| Homologation lead | Rules tab PDF（按需 filter）+ Reference 链接 |
| Team leader | Plan tab PDF + 个人 domain 的 bucket 截图 |
| 外部律所 / TÜV | JSON 导出（结构化原始数据）+ Status tab PDF |

---

## 第八部分 · 常见问题 FAQ

### 8.1 我看到 "UNKNOWN" 是什么意思

UNKNOWN 在引擎里是单一状态，但 UI 把它细分为 3 种：

| UNKNOWN sub-state | UI 文案 | 怎么处理 |
|---|---|---|
| `not_authored` | "Not authored yet" | 等 Phase K+ 撰写，或在 content/authoring.csv 里贡献 |
| `source_not_verified` | "Source not verified" | reviewer 在 Coverage tab → Verification Queue 补齐 source field |
| `missing_input` | "Missing project input" | 回 Setup tab 补字段 |

### 8.2 "Source not verified" 怎么办

说明这条规则的 governance gate 发现它声明了 ACTIVE 但 source 不完整（缺 official_url / oj_reference / last_verified_on）。

**处理**：
1. 打开 Coverage tab → Verification Queue
2. 找到这条规则
3. 填入缺的 source field（需要人工去 EUR-Lex / UNECE 查证）
4. Reviewer 点 Promote → 升级到 ACTIVE

### 8.3 为什么我的规则显示 "Applies from 2027-08-02"

这条规则**未来生效**（FUTURE applicability）。例如 AI Act Art. 6(1) Automotive 是 2027-08-02 才开始适用 high-risk AI 义务。

你的项目 SOP 如果在这个日期之后，规则会从 FUTURE 变成 APPLICABLE；SOP 在之前不触发。

### 8.4 ScopeBanner 的 4 层 coverage 网格说明

K.1 改版之后，banner 分 4 层 —— 点击展开：

1. **Production-grade** — DE（8 条 ACTIVE）+ UK（11 条 ACTIVE）+ ES（**9 ACTIVE** 经 L.6）+ UNECE 技术法规（27 条 ACTIVE 经 L.3 + L.5）+ EU 横向（~45 条 ACTIVE）。可以信赖。
2. **Partial / Indicative** — ES 剩余 5 pending（含 Homologación Individual 待 Orden ministerial）+ FR（5 ACTIVE / 7 pending）。配合每条卡片"why pending"使用。
3. **Seed-only / Pending** — NL（5 条 SEED_UNVERIFIED，0 条 ACTIVE）+ L.4 新增 9 条 R-numbers（R7/R28/R30/R87/R112/R113/R116/R125/R128）待 L.7 深链验证。
4. **Out of scope** — IT / PL / BE / AT / SE / CZ（placeholder），以及 CN / US / JP / TR / 海关 / CBAM / HS / ISO 标准。

**勾选 NL 作为 target country 工具不会假装覆盖** —— Status tab 的 "Countries at risk" 会列出，每张 NL 规则卡片自己会显示"why indicative only"。

**Phase L.7+ 会填充 NL ACTIVE 内容 + 完成 L.4 stubs / L.5 holdouts / ES-008 的深链验证。**

### 8.5 "Drifted" freshness 状态什么时候出现

当 `.github/workflows/drift-alert.yml` 发现某条 ACTIVE 规则的 EUR-Lex / UNECE 源发生了 metadata 变化（OJ reference 变了、effective date 变了），该规则的 freshness 被设为 `drifted`。

**出现 `drifted` 意味着**：规则的源已经更新，但工具还没同步。reviewer 应该尽快查看变化并决定是否更新规则内容。

### 8.6 "SHADOW" lifecycle 是什么

Sprint 7 新增的**灰度发布状态**。新撰写的规则默认进 SHADOW 阶段 4 周：
- 参与引擎评估
- UI 上显示在 Indicative 段（不升 Verified）
- 4 周后通过 review → 升到 SEED_UNVERIFIED 或 ACTIVE

**业务用户看到 SHADOW 规则通常不用管**，它们会出现在 Indicative 层。

---

## 第九部分 · 三类 stakeholder 的日常路径

### 9.1 Homologation lead 的日常（5 分钟）

详见：[docs/phase12/demo-scripts/homologation-5min.md](./phase12/demo-scripts/homologation-5min.md)

核心路径：
1. `/rules?rule=REG-TA-001` → 看 WVTA 卡片 5 份文档要求
2. Filter = Applicable → 看当前适用规则全清单
3. 展开 R155 → Plain / Engineering 切换
4. GSR-002..006 → 看 phase-in 日期
5. PLD → 看 provenance 链

### 9.2 Team leader 的日常（5 分钟）

详见：[docs/phase12/demo-scripts/team-leader-5min.md](./phase12/demo-scripts/team-leader-5min.md)

核心路径：
1. `/plan` → Owner Dashboard 找自己 domain
2. 点 R155 → 跳 Rules tab 看 required docs
3. 点 related → 跳 R157 看依赖关系
4. 回 Plan → 按 Pre-SOP critical / final 看任务节奏
5. Status tab 快速扫视 overdue 项

### 9.3 管理层 3 分钟扫视

详见：[docs/phase12/demo-scripts/management-3min.md](./phase12/demo-scripts/management-3min.md)

核心路径：
1. `/status` → verdict + confidence
2. 4 metric cards 看整体状态
3. Top blockers + Top deadlines 看紧迫事项
4. Countries at risk 看市场覆盖诚实性

---

## 附录 A · 字段快速索引（字母序）

按字母序索引，便于快速查找某个字段的详细说明。

| 字段 | Setup section | 详见 |
|---|---|---|
| `adasFeatures` | ADAS & Automated Driving | §2.6.2 |
| `aiInventoryExists` | Digital & Cockpit | §2.7.4 |
| `aiLevel` | Digital & Cockpit | §2.7.3 |
| `approvalType` | Homologation Basis | §2.4.4 |
| `batteryCapacityBand` | Propulsion & Energy | §2.5.2 |
| `bodyType` | Homologation Basis | §2.4.3 |
| `braking.absFitted` | Advanced | §2.9.1 |
| `braking.espFitted` | Advanced | §2.9.1 |
| `braking.type` | Advanced | §2.9.1 |
| `cabin.airbagCount` | Advanced | §2.9.3 |
| `cabin.isofixAnchors` | Advanced | §2.9.3 |
| `cabin.seatbeltReminder` | Advanced | §2.9.3 |
| `chargingCapability.ac` | Propulsion & Energy | §2.5.3 |
| `chargingCapability.bidirectional` | Propulsion & Energy | §2.5.3 |
| `chargingCapability.dc` | Propulsion & Energy | §2.5.3 |
| `completionState` | Homologation Basis | §2.4.6 |
| `connectivity` | Digital & Cockpit | §2.7.1 |
| `consumerOrFleet` | Program & Market | §2.3.6 |
| `dataFlags` | Digital & Cockpit | §2.7.2 |
| `firstRegistrationDate` | Program & Market | §2.3.5 |
| `frameworkGroup` | Homologation Basis | §2.4.1 |
| `fuel.tankType` | Advanced | §2.9.5 |
| `hmi.touchscreenPrimary` | Advanced / Digital & Cockpit | §2.9.6 |
| `hmi.voiceControl` | Advanced / Digital & Cockpit | §2.9.6 |
| `lighting.avas` | Advanced | §2.9.4 |
| `lighting.headlampType` | Advanced / ADAS | §2.9.4 |
| `motorwayAssistant` | ADAS & Automated Driving | §2.6.3 |
| `automationLevel` | ADAS & Automated Driving | §2.6.1 |
| `parkingAutomation` | ADAS & Automated Driving | §2.6.4 |
| `powertrain` | Propulsion & Energy | §2.5.1 |
| `projectName` | Program & Market | §2.3.1 |
| `readiness.csmsAvailable` | Readiness | §2.8.1 |
| `readiness.dpiaCompleted` | Readiness | §2.8.3 |
| `readiness.evidenceOwnerAssigned` | Readiness | §2.8.5 |
| `readiness.registrationAssumptionsKnown` | Readiness | §2.8.6 |
| `readiness.sumsAvailable` | Readiness | §2.8.2 |
| `readiness.technicalDocStarted` | Readiness | §2.8.4 |
| `salesModel` | Program & Market | §2.3.7 |
| `sopDate` | Program & Market | §2.3.4 |
| `steering.eps` | Advanced | §2.9.2 |
| `steering.type` | Advanced | §2.9.2 |
| `steeringPosition` | Homologation Basis | §2.4.5 |
| `systemInitiatedLaneChange` | ADAS & Automated Driving | §2.6.5 |
| `targetCountries` | Program & Market | §2.3.3 |
| `vehicleCategory` | Homologation Basis | §2.4.2 |
| `vehicleCode` | Program & Market | §2.3.2 |

---

## 附录 B · 术语表

与 UI 内 GlossaryModal（⚙ 菜单 → Open glossary）内容对齐。

### B.1 Trust levels · 可信度（Rule card 左侧 badge）

| Badge | 含义 |
|---|---|
| ✓ **Verified** | 规则是 ACTIVE 且主要 source（EUR-Lex / UNECE）已被 reviewer 验证。可以放心采信。 |
| ⚠ **Indicative** | 规则已撰写但 source 尚未验证。作为指针用，实际行动前务必对照官方原文。 |
| ○ **Pending** | 占位符——规则在清单里但还没写出内容。视为 coverage gap。 |

### B.2 Applicability · 适用性（Rule card 旁边 badge）

| Badge | 含义 |
|---|---|
| ● **Applies** | 所有触发条件匹配，规则适用。 |
| ◐ **May apply** | 部分条件匹配，取决于还没做的选择。做完后再来重看。 |
| ◷ **Applies from {date}** | 未来某日起适用。从那个日期倒推排工作。 |
| — **Does not apply** | 触发条件不匹配。可以跳过。 |
| ? **Not authored yet** | 规则是 placeholder，未撰写。无法评估。 |
| ? **Source not verified** | 规则标为 ACTIVE 但 source 缺失或过期。reviewer 要先重新验证。 |
| ? **Missing project input** | 引擎需要项目字段尚未填写。回 Setup 完成该字段。 |

### B.3 Source freshness · 源新鲜度（Rule card badge）

| Badge | 含义 |
|---|---|
| ✓ **Fresh** | 在 review cadence 内验证过。无需动作。 |
| ⏱ **Review due soon** | 在 cadence window 最后 20%。下一 sprint 安排 review。 |
| ⚠ **Overdue** | review cadence 已过。使用前重新验证 source。 |
| ✕ **Critically overdue** | 严重逾期——未重新验证前不应依赖。 |
| ○ **Never verified** | 本规则无人工 review 记录。 |
| **Drifted** | 检测到源 metadata 有变化，需要人工查看同步。 |

### B.4 Member-state overlay status · 成员国 overlay 状态（Coverage tab chips · K.1 更新）

| 状态 | 文案 | 示例 |
|---|---|---|
| 🟢 **Production-grade** | "Production-grade guidance available" | DE（8 ACTIVE）、UK（11 ACTIVE）、ES（9 ACTIVE 经 L.6） |
| 🟡 **Partial** | "Partial — some ACTIVE, remaining pending verification" | ES 剩余 5 pending、FR（5 / 7 pending） |
| 🟠 **Seed-only** | "Seed-only — authored but 0 verified; confirm locally" | NL（0 ACTIVE / 5 SEED_UNVERIFIED） |
| 🟠 **Placeholder** | "Placeholder — scope gap, verify locally" | IT / PL / BE / AT / SE / CZ |

### B.5 Rule lifecycle · 规则生命周期（Coverage tab，业务用户一般不用）

| State | 含义 |
|---|---|
| `ACTIVE` | 规则已撰写且主 source (official_url + oj_reference + last_verified_on) 完整。 |
| `SEED_UNVERIFIED` | 规则已撰写但 source 字段不完整；或最初 ACTIVE 被 governance gate 降级。 |
| `DRAFT` | 正在撰写；可能有 gap。 |
| `SHADOW` | 4 周灰度发布中的新规则；capped at CONDITIONAL，UI 显示为 Indicative。 |
| `PLACEHOLDER` | 占位条目，让该域被 coverage tracking 跟踪，但尚未撰写内容。 |
| `ARCHIVED` | 规则已退役，不再参与评估。 |

每条非 ACTIVE 规则都在 `manual_review_reason` 字段承载"为什么还未 promoted"（K.0 之后内联显示于卡片）。典型原因：**"Awaiting EUR-Lex URL verification"** / **"Pending OJ reference"** / **"KBA architectural split — see follow-up"** / **"Authored; last_verified_on pending reviewer sign-off"**。

---

## 附录 C · 不在本工具范围的问题

**本工具是 Phase 12 Path B 的 DE-demo-first workbench**。以下问题**明确不在本工具范围**，不是 bug，是设计决策。全部 13 条 non-goals（详见 [docs/phase12/ux-refactor-spec-v2.md](./phase12/ux-refactor-spec-v2.md)）：

| # | Non-goal | 人话解释 |
|---|---|---|
| 1 | **Multi-tenant SaaS** | 单机工具，不做云端多租户。数据在你本地浏览器。 |
| 2 | **SSO / RBAC / audit log / SOC 2** | 无企业级身份管理。没有 login，也没有角色权限。 |
| 3 | **PLM / ERP / QMS / Jira 集成** | 不对接 Teamcenter / 3DEXPERIENCE / SAP / Salesforce / Jira 等。只有 JSON / CSV 导出。 |
| 4 | **Supplier portal** | 没有供应商（Tier-1 / Tier-2）的独立入口。 |
| 5 | **签字 workflow** | 工具不是法律 signatory。任何 "通过 / 不通过" 签字由律所和 homologation partner 确认。 |
| 6 | **Variant × market 四层模型** | 当前只支持单一 project config。一个项目多 variant（base / + AD pack / + sport）本期不支持。 |
| 7 | **CBAM / HS / RoO / FTA / ISO standards** | 碳边境调节、HS 税号、原产地规则、自由贸易协定、ISO 标准层全部 Phase 14+。 |
| 8 | **Panoramic 挑漏 KPI** | 成功标准是"3 类 stakeholder 场景走得通"，不是"规则无一漏"。 |
| 9 | **RegPulse-Agent feeder** | 工具是终产品，不是任何下游 agent 的中间物。 |
| 10 | **Backend server** | 没有后端。全部 localStorage。 |
| 11 | **27 国 content 扩展** | 当前 DE + UK + ES + FR（部分覆盖）。NL seed-only；其他 22 个 EU 国 placeholder。 |
| 12 | **早期代码抽取** | Sprint 9 spike 只识别可复用接缝，不做 monorepo 拆分 / core 层抽取。 |
| 13 | **Related_rules 依赖图 UI** | related_rules 是数据字段，不做可视化图。 |

**如果你需要上述能力，这不是本工具的错**。请考虑其他工具（SAP RCS / Siemens Teamcenter / Dassault 3DEXPERIENCE / ComplianceQuest）或等待 Phase 13+ / Phase 14+ 的功能扩展。

---

## 最后 · 反馈与贡献

- **发现 UI bug**：[docs/phase12/ux-refactor-spec-v2.md](./phase12/ux-refactor-spec-v2.md) UX-001..006 列表外的 bug 属于新问题，欢迎开 issue
- **规则内容错误**：参考 [docs/AUTHORING.md](./AUTHORING.md) 用 CSV DSL 修正
- **文档不清楚**：开 issue 指出具体哪段不清楚、哪个字段解释不够
- **想加新 feature**：先对照 [附录 C](#附录-c--不在本工具范围的问题)，确认不在 non-goals 里，再开讨论

---

© Yanhao FU · 2026
