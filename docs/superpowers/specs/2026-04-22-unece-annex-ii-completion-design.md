# Phase L · UNECE Annex II Completion — Design Spec

**Date:** 2026-04-22
**Author:** © Yanhao FU (brainstormed with Claude)
**Status:** Approved — ready for writing-plans
**Branch:** main
**Chinese version:** [2026-04-22-unece-annex-ii-completion-design-zh.md](./2026-04-22-unece-annex-ii-completion-design-zh.md)

---

## 1. Goal

Deliver **meaningful UNECE Annex II completion** across three sequential rounds — not "fill every PLACEHOLDER", but **take BEV × DE pilot-path UNECE rules that can credibly be promoted to ACTIVE and actually promote them**.

Concrete deliverables:
- **L.1 Factory unlock**: modify `uneceRule()` so rules with sufficient verification fields can be ACTIVE (currently hard-locked to SEED_UNVERIFIED)
- **L.2 Content fill-in**: 11 bare factory-stub rules get authored content (obligation / temporal / URL)
- **L.3 Priority batch ACTIVE-ization**: 10-12 high-value BEV-relevant UNECE rules get deep-link URLs + revision labels + verification dates, then get promoted to ACTIVE

Expected outcomes:
- BEV × DE pilot `applicable_rule_ids`: 30 → **~40-42** (each promoted UNECE rule fires APPLICABLE for M1 BEV in DE)
- Global ACTIVE count: 73 → **~83-85**
- 3 commits with user review pause between (same rhythm as Phase J / Human-review Rounds 1-3)

---

## 2. Background — why now

**Current UNECE coverage state** (audited at commit `57f5b53`):
- 44 UNECE rules via `uneceRule()` factory + 1 explicit (REG-UN-100 R100 EV Safety) = **45 total**
- **33 have authored content**: obligation_text + temporal + related_rules + prerequisite_standards (built up through Phase H + I.2 + J.1)
- **11 are bare factory stubs**: R13 (HD braking) · R44 (legacy child restraints) · R58 (rear underrun protection) · R66 (bus superstructure) · R110 (CNG/LNG fuel) · R118 (bus flammability) · R129 (i-Size child restraints) · R134 (hydrogen vehicle safety) · R142 (tyre installation) · R153 (rear-impact fuel/electric integrity) · plus one more
- **Only REG-UN-100 is ACTIVE** (explicit `makeSeedRule` bypasses the factory)

**Key bug**: the factory hard-locks `lifecycle_state: "SEED_UNVERIFIED"` (see `src/registry/seed/unece-technical.ts:150`). Meaning even if we verify 33 authored rules' deep-link URLs + revision labels + dates, the factory still emits SEED_UNVERIFIED. The hard-gate downgrades them to CONDITIONAL, and the user sees "Indicative".

**So merely filling bare stubs does not change user experience**. What actually moves the needle is unlock + verify + promote.

**Most authored rules' URL points at `UNECE_PRIMARY_PORTAL`** (`https://unece.org/transport/vehicle-regulations`), not a per-regulation deep link. REG-UN-100 is the exception (uses `/transport/documents/2023/09/standards/un-regulation-no-100-rev4`). Phase L needs to find real deep links for every promoted rule.

---

## 3. Three-round phasing

One commit + push per round, with user review pause between.

### L.1 — Factory unlock

- Purpose: let the factory optionally emit ACTIVE lifecycle when verification fields are complete. Default stays SEED_UNVERIFIED (backward-compat for the 33 existing authored rules).
- Scope: **0 new rules**, pure infra change
- Files: `src/registry/seed/unece-technical.ts` (factory logic + `UneceAuthored` interface extension) · `tests/unit/unece-factory.test.ts` (new) · `tests/unit/governance.test.ts` (integrity check for UNECE ACTIVE rules)
- Effort estimate: 2-3 hours
- Deliverable: 1 commit

### L.2 — Content fill-in for 11 bare stubs

- Purpose: make sure every one of the 44 UNECE rules has authored content. **Still all SEED_UNVERIFIED** (L.3 handles promotion).
- Scope: 11 rules upgraded (factory calls get `authored` block)
- Files: `src/registry/seed/unece-technical.ts` (11 factory calls modified) · snapshot regen
- Effort estimate: 10-15 hours (~1-1.5h/rule: research agent dispatch + I review + write authored block)
- Deliverable: 1 commit

#### L.2 priority order for the 11 bare stubs

Ranked by BEV M1 pilot relevance (high-relevance first; low-relevance can defer to L.4+ if time-pressed):

| # | Rule | Topic | BEV M1 relevance |
|---|---|---|---|
| 1 | R153 | Rear-impact fuel/electric system integrity (covers BEV HV) | ⭐⭐⭐ high |
| 2 | R58 | Rear underrun protective devices | ⭐⭐ medium (M1 not mandatory; N1+ mandatory) |
| 3 | R134 | Hydrogen vehicle safety (FCEV) | ⭐ BEV doesn't trigger |
| 4 | R13 | HD braking (M2/M3/N2/N3) | ⭐ M1 uses R13-H (already authored) |
| 5 | R142 | Tyre installation (all M/N) | ⭐⭐ medium |
| 6 | R44 | Legacy child restraint systems (M1 seats) | ⭐⭐ medium |
| 7 | R129 | i-Size child restraints (modern R44) | ⭐⭐ medium |
| 8 | R66 | Bus superstructure strength (M2/M3) | ⭐ BEV M1 doesn't trigger |
| 9 | R118 | Bus flammability (M2/M3) | ⭐ BEV M1 doesn't trigger |
| 10 | R110 | CNG/LNG fuel systems | ⭐ BEV doesn't trigger |
| +1 | [to be confirmed] | — | — |

**Work strategy**: complete items 1-5 (high/medium relevance) first, then 6-11 (low relevance). If time-pressed, defer low-relevance to L.4+.

### L.3 — BEV-priority batch ACTIVE-ization

- Purpose: promote 10-12 BEV × DE high-priority UNECE rules to ACTIVE; user actually sees APPLICABLE count rise.
- Scope: 10-12 rules upgraded; each needs **real deep-link URL + current revision label + lastVerifiedOn + humanReviewer**, then add `lifecycleOverride: "ACTIVE"`.
- Files: `src/registry/seed/unece-technical.ts` (10-12 authored blocks extended with lifecycleOverride) · snapshot regen · governance test count update
- Effort estimate: 12-18 hours (includes 2-3 parallel research agent dispatches)
- Deliverable: 1 commit

#### L.3 priority batch candidates (12 rules)

Selection criteria:
1. Already has authored content (this phase doesn't author new rules)
2. Triggers APPLICABLE for BEV × DE pilot (M1 + frameworkGroup MN)
3. Current version's deep link is findable on UNECE public docs
4. Safety/operationally critical (not niche)

| # | Rule | Title | Triggers BEV pilot? |
|---|---|---|---|
| 1 | R48 | Installation of lighting and light-signalling (lighting umbrella) | ✓ |
| 2 | R94 | Frontal impact | ✓ |
| 3 | R95 | Side impact | ✓ |
| 4 | R16 | Safety belts | ✓ |
| 5 | R17 | Seats + anchorages | ✓ |
| 6 | R46 | Indirect vision/mirrors | ✓ |
| 7 | R79 | Steering equipment | ✓ |
| 8 | R127 | Pedestrian safety | ✓ |
| 9 | R13-H | Light-duty braking | ✓ |
| 10 | R10 | EMC | ✓ |
| 11 | R152 | AEBS | ✓ |
| 12 | R117 | Tyre rolling resistance + noise | ✓ |

**Quality-over-count principle**: if a rule's research agent can't find a clean deep link, **keep it SEED_UNVERIFIED and do NOT force-promote**. Prefer shipping 6 clean promotions than 12 dubious ones.

---

## 4. L.1 Factory unlock — technical design

### 4.1 `UneceAuthored` interface extension

In `src/registry/seed/unece-technical.ts`, extend the existing `UneceAuthored` interface:

```ts
interface UneceAuthored {
  // ... existing fields (officialUrl, revisionLabel, applyToNewTypesFrom, ...)

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

### 4.2 Factory logic

Inside `uneceRule()` before the `makeSeedRule` call:

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

Then pass `finalLifecycle` to `makeSeedRule`, and when `canPromote` emit `promoted_on` / `promoted_by` / a fully-populated `content_provenance.human_reviewer`:

```ts
return makeSeedRule({
  // ... existing fields
  lifecycle_state: finalLifecycle,
  ...(canPromote ? {
    promoted_on: authored.promotedOn,
    promoted_by: authored.promotedBy,
  } : {}),
  ...(authored ? {
    content_provenance: {
      source_type: "unece" as const,
      retrieved_at: authored.lastVerifiedOn ?? "2026-04-20",
      human_reviewer: canPromote ? authored.humanReviewer! : null,
    },
  } : {}),
  // ... rest
});
```

### 4.3 Source object enhancement

When `canPromote`, also populate `last_verified_on` on the source:

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

### 4.4 Safety guarantees (unchanged)

- Default: any `authored` block without `lifecycleOverride` → still SEED_UNVERIFIED ✓
- Gate: portal-only URL even with `lifecycleOverride: "ACTIVE"` → won't promote ✓
- Gate: missing revisionLabel OR lastVerifiedOn OR humanReviewer → won't promote ✓
- governance test: `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification` still covers UNECE rules

### 4.5 New unit tests (`tests/unit/unece-factory.test.ts`)

- ✅ Test case 1: authored without lifecycleOverride → lifecycle is SEED_UNVERIFIED
- ✅ Test case 2: lifecycleOverride + all fields present → lifecycle is ACTIVE
- ✅ Test case 3: lifecycleOverride + portal URL → safe fallback to SEED_UNVERIFIED
- ✅ Test case 4: lifecycleOverride but missing lastVerifiedOn → fallback to SEED_UNVERIFIED
- ✅ Test case 5: lifecycleOverride but missing humanReviewer → fallback to SEED_UNVERIFIED

### 4.6 governance test update (`tests/unit/governance.test.ts`)

The existing `validateRegistryIntegrity` already checks `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification`. Phase L-promoted UNECE rules flow through these checks. Confirm:

- If a Phase L.3 UNECE rule is ACTIVE but `last_verified_on: null` → governance test fails
- If ACTIVE but `official_url: null` or == portal → fails
- (If the existing test doesn't cover these, add in L.1)

---

## 5. L.2 Content fill-in strategy (11 bare stubs)

For each bare rule, via **research agent dispatch** + **I review**, add an `authored` block. Contents:
- `officialUrl`: UNECE primary PDF or portal URL (whatever exists)
- `revisionLabel`: e.g. "Rev.3 Am.2" (requires verification)
- `applyToNewTypesFrom`: e.g. "2024-09-01" (based on EU Annex II phase-in, or null)
- `applyToAllNewVehiclesFrom`: same
- `obligationText`: 2-3 substantive sentences on the obligation
- `related`: links to related UN or EU rules
- `extraConditions`: if the rule has powertrain / fuel specific triggering
- `fallbackIfMissing`: default "unknown", specific rules "not_applicable"
- `temporalNotes`: [verify] markers + context

**Research agent workflow**:

1. Dispatch 2-3 parallel research agents, each handling 3-4 rules
2. Agent outputs markdown table: per-rule URL + revision + notes
3. I review, apply to `unece-technical.ts`
4. Run gates
5. Commit

**Hard rule**: **do not fabricate URLs**. If the agent is uncertain, return null URL + `[verify]` note, keep factory defaults.

**Expectation**: 8-10 of 11 will be authorable cleanly; 1-3 with unclear URL or revision stay at shallow SEED_UNVERIFIED state. OK.

---

## 6. L.3 BEV priority batch ACTIVE-ization — detailed workflow

### 6.1 Per-rule verification fields

For each promotable rule, extend the authored block:

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

Phase I.2 + ES Round pattern proved effective: 2-3 parallel agents, each handling 4-5 rules' URL + revision label + dates lookup.

Each agent prompt template:
- UNECE website structure overview (unece.org + per-regulation deep link pattern)
- Rules to look up (4-5)
- Output format: per-rule markdown with URL + revision + entry_into_force date + notes
- Emphasis: **prefer null + `[verify]` over fabrication**

### 6.3 Verification + promotion decision

After agent returns:
1. I spot-check 2-3 URL patterns against R100's pattern (`/transport/documents/YYYY/MM/standards/un-regulation-no-N-revX`)
2. Per rule:
   - URL deep link + revision label both clear → **promote to ACTIVE**
   - URL clear but revision ambiguous → promote with `revisionLabel: "current consolidated text"`
   - URL unclear → **do not promote**, keep SEED_UNVERIFIED + `[verify]` note
3. Write commit

### 6.4 Expected outcome

**Worst case**: 6 of 12 candidates promote (research agents can't find half). BEV pilot +6 APPLICABLE.

**Typical case**: 10 promote. BEV pilot +10 APPLICABLE.

**Best case**: 12 all promote. BEV pilot +12 APPLICABLE.

Global ACTIVE count: 73 → 79-85. Quality over numbers.

---

## 7. Anti-hallucination hard rules

1. **URLs must be verifiable**: no fabricated UNECE URLs. If research agent is uncertain, keep null + portal fallback, do not promote.

2. **Revision label conservatism**: if "Rev.3 Am.2" is uncertain, use "current consolidated text" or null.

3. **Date ranges**: if `applyToNewTypesFrom` etc. can't be found, null + `[verify]` note. No guessing.

4. **Regression anchor protection**: `fixtures/pilot-my2027-bev.expected.ts` `applicable_rule_ids` may grow but must not shrink. Pre-commit diff check each round.

5. **governance test is final gate**: if L.3 commit fails `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification`, roll back — demote failing rules to SEED_UNVERIFIED.

6. **Pilot fixture snapshot review**: each round after `vitest run -u`, manually `git diff tests/unit/__snapshots__/*.snap` and confirm only expected changes (new ACTIVE / new authored), no accidental regression.

---

## 8. Out of Phase L scope (explicitly deferred)

Not in Phase L:

1. **Adding missing R-numbers** (R7 / R28 / R30 / R87 / R112 / R113 / R116 / R125 / R128) — handled in L.4
2. **Second promotion batch** (remaining ~20 authored UNECE rules) — L.5+
3. **Deep authoring of heavy-duty / bus / trailer specific rules** (R49 HD emissions full / R66 bus strength / R107 bus construction / R110 CNG full) — far from Chinese OEM M1 BEV pilot, not prioritized
4. **Per-member-state UNECE transposition variations** — continue to live under member-state-overlay
5. **Per-rule ISO standards prerequisite deepening** (beyond what's already in prerequisite_standards) — current coverage is sufficient
6. **UI-layer changes** — Phase K.1/K.2 already handled UNECE display
7. **CBAM / customs / non-EU market UNECE expansion** — existing AGENTS.md non-goal

---

## 9. File change summary

| Round | File | Change type |
|---|---|---|
| L.1 | `src/registry/seed/unece-technical.ts` | `UneceAuthored` interface + factory logic |
| L.1 | `tests/unit/unece-factory.test.ts` | new (5 test cases) |
| L.1 | `tests/unit/governance.test.ts` | possibly add integrity check (if not already covering UNECE ACTIVE) |
| L.2 | `src/registry/seed/unece-technical.ts` | 11 factory calls get authored blocks |
| L.2 | `tests/unit/__snapshots__/*.snap` | pilot snapshot regen |
| L.3 | `src/registry/seed/unece-technical.ts` | 10-12 authored blocks extended with lifecycleOverride |
| L.3 | `tests/unit/__snapshots__/*.snap` | pilot snapshot regen |
| L.3 | `tests/unit/governance.test.ts` | update totalRules + ACTIVE count |
| L.3 | `docs/phase-j/verification-backlog.md` | `npm run verification-backlog` regen |

One commit + push per round.

---

## 10. Definition of Done

### L.1 complete
- [ ] `UneceAuthored` interface has `lifecycleOverride` + `lastVerifiedOn` + `humanReviewer` + `promotedOn` + `promotedBy` fields
- [ ] Factory logic correct: all conditions required for promotion; missing any field falls back to SEED_UNVERIFIED
- [ ] 5 unit tests pass
- [ ] `npx tsc --noEmit && npm run lint && npx vitest run` all green
- [ ] 230 tests stays same or increases (not decreases)

### L.2 complete
- [ ] All 11 bare stubs have authored blocks (`officialUrl` at least portal, `obligationText` substantive)
- [ ] No forced promotion: all 11 still SEED_UNVERIFIED
- [ ] Pilot snapshots regen with no unexpected regression
- [ ] Gates all green

### L.3 complete
- [ ] 10-12 authored UNECE rules have `lifecycleOverride: "ACTIVE"` + all verification fields
- [ ] BEV × DE pilot `applicable_rule_ids` has ≥8 more rules than before L.3 (regression anchor check passes)
- [ ] `governance.test.ts` shows `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification` all `[]`
- [ ] `totalRules` count unchanged (pure promotion, no new rules added)
- [ ] `docs/phase-j/verification-backlog.md` regen shows UNECE pending count down by 10-12
- [ ] Gates all green

### Phase L overall
- [ ] 3 commits on `origin/main`
- [ ] Phase L delivery summary appended to `docs/phase-j/README.md` or created `docs/phase-l/README.md`
- [ ] No hallucinated URLs (all ACTIVE-promoted UNECE rule URLs browser-resolvable)
- [ ] BEV pilot APPLICABLE 30 → ≥38 (minimum +8)
- [ ] Global ACTIVE count 73 → ≥81 (minimum +8)

---

## 11. Open questions — none

All 4 brainstorming sections approved. Proceeding to writing-plans.

---

## 12. Implementation notes (for writing-plans stage)

writing-plans will expand this spec into tasks. Rough decomposition:

- **Tasks 1-3**: L.1 (schema + factory + test)
- **Tasks 4-5**: L.2 research agent dispatch + write authored blocks
- **Task 6**: L.2 commit + review
- **Tasks 7-8**: L.3 research agent dispatch for priority 12 rules + URL review
- **Task 9**: L.3 write lifecycleOverride blocks + governance check + commit
- **Task 10**: Phase L summary doc update + push

User review pause between each Round (user approves → next round).
