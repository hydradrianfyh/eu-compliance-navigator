# Phase L · UNECE Annex II 完善 — Design Spec（中文版）

**日期**：2026-04-22
**作者**：© Yanhao FU（与 Claude 协作头脑风暴）
**状态**：已批准 — 准备进入 writing-plans
**分支**：main
**英文对照**：[2026-04-22-unece-annex-ii-completion-design.md](./2026-04-22-unece-annex-ii-completion-design.md)

---

## 1. 目标

在 3 个 sequential rounds 里完成 EU Vehicle Compliance Navigator 的 UNECE Annex II 规则覆盖的**有意义完善** — 不是把所有 PLACEHOLDER 填满，而是**把 BEV × DE pilot 路径上可升级到 ACTIVE 的 UNECE 规则真正升到 ACTIVE**。

具体交付：
- **L.1 工厂解锁**：修改 `uneceRule()` 工厂允许带足够核验字段的规则升到 ACTIVE（之前硬锁 SEED_UNVERIFIED）
- **L.2 内容补齐**：11 条 bare factory 桩规则加 authored 内容（obligation / temporal / URL）
- **L.3 优先批次 ACTIVE 化**：10-12 条 BEV 相关的高价值 UNECE 规则做深链接 + 修订号 + 核验日期，然后 promote 到 ACTIVE

预期效果：
- BEV × DE pilot `applicable_rule_ids`：30 → **约 40-42**（每条升级 ACTIVE 的 UNECE 规则为 M1 BEV 在 DE 触发 APPLICABLE）
- 全局 ACTIVE 总数：73 → **约 83-85**
- 3 个 commit，之间有 user review pause（同 Phase J / Human-review Round 1-3 节奏）

---

## 2. 背景 / 为什么现在做

**当前 UNECE 覆盖状态**（commit `57f5b53` 时点审计）：
- 44 条 UNECE 规则通过 `uneceRule()` 工厂创建 + 1 条显式（REG-UN-100 R100 EV Safety）= **45 条 total**
- **33 条已有 authored 内容**：obligation_text + temporal + related_rules + prerequisite_standards（Phase H + I.2 + J.1 补齐的）
- **11 条还是 bare factory 桩**：R13（HD braking）· R44（legacy 儿童安全系统）· R58（后下边防护）· R66（客车车身强度）· R110（CNG/LNG 燃料）· R118（客车阻燃）· R129（i-Size 儿童约束）· R134（氢能车安全）· R142（轮胎安装）· R153（后碰撞燃油系统）· 以及 1 条其他
- **唯一 ACTIVE 的 UNECE 规则是 REG-UN-100**（显式 `makeSeedRule` 绕过工厂）

**关键 bug**：工厂硬锁 `lifecycle_state: "SEED_UNVERIFIED"`（见 `src/registry/seed/unece-technical.ts:150`）。意味着即使我们把 33 条 authored 规则的 URL 深链接 + 修订号 + 日期全部核验好，工厂也会继续把它们标成 SEED_UNVERIFIED。硬 gate 把它们降到 CONDITIONAL，用户看到的还是"指示性"。

**所以单纯补 bare 桩不改变用户体验**。真正移动 needle 的是解锁 + 核验 + promote。

**大多数 authored 规则的 URL 只指向 `UNECE_PRIMARY_PORTAL`**（`https://unece.org/transport/vehicle-regulations`），不是 per-regulation 的深链接。REG-UN-100 是例外（使用 `/transport/documents/2023/09/standards/un-regulation-no-100-rev4`）。Phase L 需要给每条 promoted 规则找真实的深链接。

---

## 3. 三个 rounds 的 phasing

每 round 一次 commit + push，中间 user review pause。

### L.1 — 工厂解锁

- 目的：让工厂可选地发布 ACTIVE lifecycle，条件是 authored 块里所有核验字段齐全。默认保持 SEED_UNVERIFIED（向后兼容，33 条已有 authored 规则不受影响）。
- 规模：**0 new rules**，纯 infra 改动
- 文件：`src/registry/seed/unece-technical.ts`（工厂逻辑 + `UneceAuthored` 接口扩展）· `tests/unit/unece-factory.test.ts`（新增单元测试）· `tests/unit/governance.test.ts`（确认没 UNECE ACTIVE 漏掉核验字段）
- 工时估算：2-3 小时
- 交付：1 commit

### L.2 — 11 条 bare 桩的内容补齐

- 目的：让所有 44 条 UNECE 规则都有 authored 内容。**仍全部 SEED_UNVERIFIED**（L.3 才升级）。
- 规模：11 条规则升级（factory call 加 authored 块）
- 文件：`src/registry/seed/unece-technical.ts`（11 处 factory call 修改）· snapshot regen（pilot acceptance tests）
- 工时估算：10-15 小时（每条 1-1.5h：research agent dispatch + 我 review + 写 authored block）
- 交付：1 commit

#### 11 条 bare 桩优先排序

按 M1 BEV pilot 相关度排（相关度高的先补，相关度低的可延到 L.4+ 如果时间紧）：

| # | Rule | 重点 | BEV M1 相关度 |
|---|---|---|---|
| 1 | R153 | 后碰撞 fuel/electric system integrity（涵盖 BEV HV） | ⭐⭐⭐ 高 |
| 2 | R58 | 后下边防护装置 | ⭐⭐ 中（M1 不强制，N1+ 强制） |
| 3 | R134 | 氢能车安全（FCEV） | ⭐ BEV 不触发 |
| 4 | R13 | HD braking（M2/M3/N2/N3） | ⭐ M1 用 R13-H 已 authored |
| 5 | R142 | 轮胎安装（所有 M/N） | ⭐⭐ 中 |
| 6 | R44 | legacy 儿童安全系统（M1 座位） | ⭐⭐ 中 |
| 7 | R129 | i-Size 儿童约束（现代版 R44） | ⭐⭐ 中 |
| 8 | R66 | 客车车身强度（M2/M3） | ⭐ BEV M1 不触发 |
| 9 | R118 | 客车阻燃（M2/M3） | ⭐ BEV M1 不触发 |
| 10 | R110 | CNG/LNG 燃料系统 | ⭐ BEV 不触发 |
| +1 | [待确认] | — | — |

**工作策略**：先补 1-5（高/中相关度），再补 6-11（低相关度）。如果时间紧 L.4+ 处理低相关的。

### L.3 — BEV 优先批次 ACTIVE 化

- 目的：把 10-12 条 BEV × DE 高优先 UNECE 规则 promote 到 ACTIVE，让用户真正看到 APPLICABLE 数量上升
- 规模：10-12 条规则升级：每条需要 **real deep link URL + current revision label + lastVerifiedOn + humanReviewer**，然后加 `lifecycleOverride: "ACTIVE"`
- 文件：`src/registry/seed/unece-technical.ts`（10-12 处 authored 块扩展 + lifecycleOverride）· snapshot regen · governance test count update
- 工时估算：12-18 小时（含 2-3 轮并行 research agent dispatch）
- 交付：1 commit

#### 优先批次候选规则（12 条）

筛选标准：
1. 已有 authored 内容（本阶段不做新 author）
2. BEV × DE pilot 触发 APPLICABLE（M1 + frameworkGroup MN）
3. 在 UNECE 公开文档上能找到当前版本的深链接
4. 安全 / 运行关键（非 niche）

| # | Rule | 标题 | 触发 BEV pilot？ |
|---|---|---|---|
| 1 | R48 | Installation of lighting（照明安装，照明总览） | ✓ |
| 2 | R94 | Frontal impact（正面碰撞） | ✓ |
| 3 | R95 | Side impact（侧面碰撞） | ✓ |
| 4 | R16 | Safety belts（安全带） | ✓ |
| 5 | R17 | Seats + anchorages（座椅 + 固定点） | ✓ |
| 6 | R46 | Indirect vision/mirrors（后视镜） | ✓ |
| 7 | R79 | Steering equipment（转向装置） | ✓ |
| 8 | R127 | Pedestrian safety（行人安全） | ✓ |
| 9 | R13-H | Light-duty braking（轻型车制动） | ✓ |
| 10 | R10 | EMC（电磁兼容） | ✓ |
| 11 | R152 | AEBS（自动紧急制动） | ✓ |
| 12 | R117 | Tyre rolling resistance + noise（轮胎） | ✓ |

**质量优先原则**：如果某条规则 research agent 找不到 clean deep link，**保留 SEED_UNVERIFIED，不强行 promote**。宁少勿滥。

---

## 4. L.1 工厂解锁设计细节

### 4.1 `UneceAuthored` 接口扩展

在 `src/registry/seed/unece-technical.ts` 现有 `UneceAuthored` interface 增加字段：

```ts
interface UneceAuthored {
  // ... 现有字段 (officialUrl, revisionLabel, applyToNewTypesFrom, ...)

  /**
   * Phase L.1: opt-in ACTIVE lifecycle for properly verified rules.
   * Only applied when ALL of these are satisfied:
   * - officialUrl is set and NOT equal to UNECE_PRIMARY_PORTAL (must be deep link)
   * - revisionLabel is non-null
   * - lastVerifiedOn is non-null ISO date
   * - humanReviewer is non-null identifier
   * Defaults undefined → rule stays SEED_UNVERIFIED.
   */
  lifecycleOverride?: "ACTIVE";

  /** ISO date string; required if lifecycleOverride === "ACTIVE". */
  lastVerifiedOn?: string;

  /** Reviewer identifier (e.g. "yanhao"); required if lifecycleOverride === "ACTIVE". */
  humanReviewer?: string;

  /** ISO date when promotion happened; required if lifecycleOverride === "ACTIVE". */
  promotedOn?: string;

  /** Promotion session/round identifier; required if lifecycleOverride === "ACTIVE". */
  promotedBy?: string;
}
```

### 4.2 工厂逻辑

在 `uneceRule()` 工厂的 `makeSeedRule` 调用之前：

```ts
const UNECE_PRIMARY_PORTAL = "https://unece.org/transport/vehicle-regulations";

const canPromote = !!(
  authored?.lifecycleOverride === "ACTIVE" &&
  authored.officialUrl &&
  authored.officialUrl !== UNECE_PRIMARY_PORTAL &&
  authored.revisionLabel &&
  authored.lastVerifiedOn &&
  authored.humanReviewer
);

const finalLifecycle = canPromote ? "ACTIVE" : "SEED_UNVERIFIED";
```

然后把 `finalLifecycle` 传给 `makeSeedRule`，同时当 `canPromote` 时把 `promoted_on` + `promoted_by` + 更完整的 `content_provenance.human_reviewer` 传进去：

```ts
return makeSeedRule({
  // ... 现有字段
  lifecycle_state: finalLifecycle,
  ...(canPromote ? {
    promoted_on: authored.promotedOn,
    promoted_by: authored.promotedBy,
  } : {}),
  // content_provenance: when authored set human_reviewer from field
  ...(authored ? {
    content_provenance: {
      source_type: "unece" as const,
      retrieved_at: authored.lastVerifiedOn ?? "2026-04-20",
      human_reviewer: canPromote ? authored.humanReviewer! : null,
    },
  } : {}),
  // ... 其余
});
```

### 4.3 Source object 增强

当 `canPromote` 时，source object 的 `last_verified_on` 也要填：

```ts
const source = authored?.officialUrl
  ? {
      label: "UNECE regulation",
      source_family: "UNECE" as const,
      reference: `UNECE Regulation No. ${rNumber}${authored.revisionLabel ? ` ${authored.revisionLabel}` : ""}`,
      official_url: authored.officialUrl,
      oj_reference: null,
      authoritative_reference: authored.revisionLabel ?? null,
      last_verified_on: canPromote ? authored.lastVerifiedOn! : null,
    }
  : makeSource("UNECE regulation", "UNECE", `UNECE Regulation No. ${rNumber}`);
```

### 4.4 安全 guarantees（保持不变）

- 默认：any authored 块 without `lifecycleOverride` → 仍 SEED_UNVERIFIED ✓
- 门卫：portal-only URL 即使传了 `lifecycleOverride: "ACTIVE"` 也不 promote ✓
- 门卫：缺 revisionLabel 或 lastVerifiedOn 或 humanReviewer 也不 promote ✓
- governance test：`activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification` 检查仍覆盖 UNECE 规则

### 4.5 新单元测试（`tests/unit/unece-factory.test.ts`）

- ✅ Test case 1: authored 无 lifecycleOverride → lifecycle 是 SEED_UNVERIFIED
- ✅ Test case 2: 有 lifecycleOverride + 齐全字段 → lifecycle 是 ACTIVE
- ✅ Test case 3: 有 lifecycleOverride + portal URL → 降级回 SEED_UNVERIFIED（安全 fallback）
- ✅ Test case 4: 有 lifecycleOverride 但缺 lastVerifiedOn → 降级回 SEED_UNVERIFIED
- ✅ Test case 5: 有 lifecycleOverride 但缺 humanReviewer → 降级回 SEED_UNVERIFIED

### 4.6 governance test 更新（`tests/unit/governance.test.ts`）

现有 `validateRegistryIntegrity` 已检查 `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification`。Phase L 升级的 UNECE 规则会经过这些检查。确认：

- 如果 Phase L.3 某条 UNECE 规则 ACTIVE 但 `last_verified_on: null`，governance test 会 fail
- 如果 ACTIVE 但 `official_url: null` 或 = portal，fail
- （如果现有 test 没 check 这些，L.1 里加上）

---

## 5. L.2 内容补齐策略（11 条 bare 桩）

每条 bare 规则，通过 **research agent dispatch** + **我 review** 添加 authored 块。Authored 块内容：
- `officialUrl`: UNECE primary PDF 或 portal URL（找到什么算什么）
- `revisionLabel`: 如 "Rev.3 Am.2"（需验证）
- `applyToNewTypesFrom`: 如 "2024-09-01"（基于 EU Annex II 的 phase-in，或 null）
- `applyToAllNewVehiclesFrom`: 同上
- `obligationText`: 2-3 句的实质 obligation 描述
- `related`: 相关 UN 或 EU 规则的 link
- `extraConditions`: 如果规则有 powertrain / fuel 特定触发
- `fallbackIfMissing`: 默认 "unknown"，特定规则 "not_applicable"
- `temporalNotes`: [verify] markers + context

**Research agent 工作流**：

1. 我 dispatch 2-3 个并行 research agents，每个负责 3-4 条规则
2. Agent 输出 markdown 表：per-rule URL + revision + notes
3. 我 review，apply 到 `unece-technical.ts`
4. 跑 gates
5. Commit

**关键 rule**：**不能编造 URL**。如果 agent 不确定，返回 null URL + `[verify]` note，保留 factory 默认。

**预期**：11 条里可能 8-10 条能 author 干净，1-3 条 URL 或 revision 不明朗保留 SEED_UNVERIFIED 浅层状态。OK。

---

## 6. L.3 BEV 优先批次 ACTIVE 化 — 详细流程

### 6.1 Per-rule 核验字段

每条 promotable 规则，authored 块要扩展：

```ts
uneceRule("048", "48", "Installation of lighting and light-signalling devices", "R48 Lighting Installation",
  ["M1", "M2", "N1", "N2"], ["MN"], {
    officialUrl: "https://unece.org/transport/documents/YYYY/MM/standards/un-regulation-no-48-revX",
    revisionLabel: "R48 Rev.X Am.Y",
    applyToNewTypesFrom: "YYYY-MM-DD",
    applyToAllNewVehiclesFrom: "YYYY-MM-DD",
    obligationText: "...",
    evidenceTasks: [...],
    related: [...],
    // NEW (Phase L.3):
    lifecycleOverride: "ACTIVE",
    lastVerifiedOn: "2026-04-22",
    humanReviewer: "yanhao",
    promotedOn: "2026-04-22",
    promotedBy: "phase-l-round-3",
  });
```

### 6.2 Research agent dispatch

Phase I.2 + ES Round 的模式已证明有效：2-3 个并行 agents，每个负责 4-5 条规则 URL + revision label + dates 查找。

每个 agent 的 prompt 模板：
- UNECE 网站结构概述（unece.org + per-regulation deep link 模式）
- 要查的 rule 列表（4-5 条）
- 输出格式：per-rule markdown with URL + revision + entry_into_force date + notes
- 强调：**宁可返回 null + `[verify]` 也不编造**

### 6.3 验证 + promotion 决策

Agent 返回后：
1. 我 spot-check 2-3 条的 URL pattern 是否跟 R100 一致（`/transport/documents/YYYY/MM/standards/un-regulation-no-N-revX`）
2. 逐条判断：
   - URL 深链接 + revision label 都清晰 → **promote to ACTIVE**
   - URL 清晰但 revision 模糊 → promote 但 `revisionLabel: "current consolidated text"`
   - URL 不清晰 → **不 promote**，保持 SEED_UNVERIFIED + `[verify]` note
3. 写 commit

### 6.4 预期结果

**最坏 case**：12 条候选中 6 条成功 promote（research agent 找不到一半）。BEV pilot +6 APPLICABLE。

**典型 case**：10 条成功 promote。BEV pilot +10 APPLICABLE。

**最好 case**：12 条全 promote。BEV pilot +12 APPLICABLE。

ACTIVE 总数：73 → 79-85 之间。质量优先，不 force 数字。

---

## 7. 反幻觉硬规则

1. **URL 必须可核验**：不接受编造的 UNECE URL。如果 research agent 不确信，保留 null + portal fallback，不 promote。

2. **Revision label 保守**：不确信 exact "Rev.3 Am.2" 就用 "current consolidated text" 或 null。

3. **日期 ranges**：`applyToNewTypesFrom` 之类如果 research agent 找不到，null + `[verify]` note。不瞎填。

4. **回归锚保护**：`fixtures/pilot-my2027-bev.expected.ts` `applicable_rule_ids` 可增不可减。每次 commit 前 diff check。

5. **governance test 是最终闸门**：如果 L.3 commit 后 `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification` 非空 → 回滚、降级失败的规则到 SEED_UNVERIFIED。

6. **Pilot fixture snapshot review**：每 round `vitest run -u` 后手动 `git diff tests/unit/__snapshots__/*.snap` 审查，确保只有预期的变动（新 ACTIVE / 新 authored），没有意外 regression。

---

## 8. 超出 Phase L 范围（明确延期）

以下都**不在** Phase L 范围内：

1. **新增缺失 R-numbers**（R7 / R28 / R30 / R87 / R112 / R113 / R116 / R125 / R128）— L.4 阶段处理
2. **第二批次 promotion**（剩下 ~20 条 authored UNECE 规则）— L.5+
3. **Heavy-duty / bus / trailer 专用规则的深度 authoring**（R49 HD emissions full / R66 bus strength / R107 bus construction / R110 CNG full）— 跟 Chinese OEM M1 BEV pilot 距离远，不优先
4. **Member-state 具体 transposition 变化**（各国家对 UNECE 规则的国家层实施）— 继续归 member-state-overlay
5. **Per-rule ISO 标准 prerequisites 深化**（超过目前已有）— 现有的已经够用
6. **UI 层面改动** — Phase K.1/K.2 已做了 UNECE 的显示处理
7. **CBAM / customs / non-EU market UNECE 扩展** — AGENTS.md 既有非 goal

---

## 9. 文件变更汇总

| Round | 文件 | 改动类型 |
|---|---|---|
| L.1 | `src/registry/seed/unece-technical.ts` | 工厂 `UneceAuthored` 接口 + 工厂逻辑 |
| L.1 | `tests/unit/unece-factory.test.ts` | 新增（5 test cases） |
| L.1 | `tests/unit/governance.test.ts` | 可能加 integrity check（如果原有没覆盖 UNECE ACTIVE） |
| L.2 | `src/registry/seed/unece-technical.ts` | 11 处 factory call 补 authored 块 |
| L.2 | `tests/unit/__snapshots__/*.snap` | Pilot snapshot regen |
| L.3 | `src/registry/seed/unece-technical.ts` | 10-12 处 authored 块扩展 + lifecycleOverride 字段 |
| L.3 | `tests/unit/__snapshots__/*.snap` | Pilot snapshot regen |
| L.3 | `tests/unit/governance.test.ts` | 更新 totalRules + ACTIVE count |
| L.3 | `docs/phase-j/verification-backlog.md` | `npm run verification-backlog` 重 gen |

每 round 一次 commit + push。

---

## 10. DoD（Definition of Done）

整个 Phase L 完成的验收标准：

### L.1 完成
- [ ] `UneceAuthored` 接口有 `lifecycleOverride` + `lastVerifiedOn` + `humanReviewer` + `promotedOn` + `promotedBy` 字段
- [ ] 工厂逻辑正确：授权条件齐全才 promote；缺任一字段降级回 SEED_UNVERIFIED
- [ ] 5 个单元测试 pass
- [ ] `npx tsc --noEmit && npm run lint && npx vitest run` 全绿
- [ ] 230 tests 保持不变或增加（不减）

### L.2 完成
- [ ] 11 条 bare 桩全部有 authored 块（`officialUrl` 至少是 portal，`obligationText` 有实质内容）
- [ ] 不强 promote：11 条全部仍 SEED_UNVERIFIED
- [ ] Pilot snapshots regen 后无意外 regression
- [ ] Gates 全绿

### L.3 完成
- [ ] 10-12 条 authored UNECE 规则有 `lifecycleOverride: "ACTIVE"` + 全部核验字段
- [ ] BEV × DE pilot `applicable_rule_ids` 比 L.3 前多 ≥8 条（回归锚可增不可减 check 通过）
- [ ] `governance.test.ts` 里 `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification` 全部 `[]`
- [ ] `totalRules` count 不变（纯 promotion，没新增规则）
- [ ] `docs/phase-j/verification-backlog.md` 重 gen 后 UNECE 段 pending count 减 10-12
- [ ] Gates 全绿

### Phase L 整体完成
- [ ] 3 commits 在 `origin/main`
- [ ] Phase L 交付 summary 推入 `docs/phase-j/README.md` 或新建 `docs/phase-l/README.md`
- [ ] 无幻觉 URL（所有 ACTIVE promoted UNECE 规则的 URL 均可 browser-resolve）
- [ ] BEV pilot APPLICABLE 从 30 → ≥38（最少 +8）
- [ ] Global ACTIVE count 从 73 → ≥81（最少 +8）

---

## 11. Open questions — 无

4 个 brainstorming sections 都经过用户批准。进入 writing-plans。

---

## 12. 实现笔记（给 writing-plans 阶段参考）

writing-plans 会把这个 spec 展开成 tasks。大致拆分：

- **Task 1-3**: L.1 (schema + factory + test)
- **Task 4-5**: L.2 dispatch research agents + write authored blocks
- **Task 6**: L.2 commit + review
- **Task 7-8**: L.3 dispatch research agents for priority 12 rules + review URLs
- **Task 9**: L.3 write lifecycleOverride blocks + governance check + commit
- **Task 10**: Phase L summary doc update + push

每 Round 结尾有 user review pause 点（user approves → next round）。
