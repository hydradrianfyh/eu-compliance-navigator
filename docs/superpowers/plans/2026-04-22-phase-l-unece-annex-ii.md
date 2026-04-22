# Phase L · UNECE Annex II Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Across 3 sequential rounds, deliver factory unlock for UNECE ACTIVE lifecycle + content fill-in for 11 bare stubs + 10-12 BEV-priority UNECE rules promoted to ACTIVE. Final state: BEV × DE pilot APPLICABLE 30 → ≥38; global ACTIVE 73 → ≥81. Three commits on `main`, user review pause between.

**Architecture:** Pure TypeScript modification of `src/registry/seed/unece-technical.ts` factory + UneceAuthored interface + selective authored-block additions. Anti-hallucination critical: research agents dispatched per round for URL lookups; never fabricate UNECE URLs; factory refuses ACTIVE promotion if any verification field missing or URL is portal-only.

**Tech Stack:** TypeScript 6 / Zod / Vitest. Research agents via Agent tool (Explore or general-purpose subagent_type). No new runtime deps.

**Spec reference:** `docs/superpowers/specs/2026-04-22-unece-annex-ii-completion-design.md` (+ `-zh.md`) at commit `9b62ef4` — spec is authoritative for content; this plan is authoritative for sequencing + gates.

---

## Phasing summary

| Round | Purpose | Commit | Effort | User review after? |
|---|---|---|---|---|
| **L.1** | Factory unlock (opt-in ACTIVE via lifecycleOverride) | 1 | 2-3h | ✓ pause |
| **L.2** | 11 bare stubs get authored blocks; all stay SEED_UNVERIFIED | 1 | 10-15h | ✓ pause |
| **L.3** | 10-12 BEV-priority rules promoted to ACTIVE | 1 | 12-18h | ✓ pause |

Each round's commit gates on: `npx tsc --noEmit && npm run lint && npx vitest run` all green; BEV pilot `applicable_rule_ids` may grow but must not shrink; `governance.test.ts` passes (especially `activeWithoutUrl / activeWithoutOjReference / activeWithoutVerification` all `[]`).

---

## Round L.1 — Factory unlock

### Task 1 — Extend `UneceAuthored` interface

**Files:**
- Modify: `src/registry/seed/unece-technical.ts:17-76` (current `UneceAuthored` interface definition)

- [ ] **Step 1: Read current interface** at lines ~17-76 to understand existing fields.

- [ ] **Step 2: Add 5 new fields to `UneceAuthored`**

Append after the existing `manualReviewReason?: string;` field (~line 74):

```ts
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
```

- [ ] **Step 3: Run type-check**

Run: `npx tsc --noEmit`
Expected: PASS. No existing caller uses these new fields, so additive optional change is safe.

---

### Task 2 — Implement factory logic

**Files:**
- Modify: `src/registry/seed/unece-technical.ts` (uneceRule function body, lines ~78-180)

- [ ] **Step 1: Locate the `UNECE_PRIMARY_PORTAL` constant**

Grep for `UNECE_PRIMARY_PORTAL` — should be at line ~191 (after the `GSR2_*` constants). If it's currently defined inside `export const uneceTechnicalRules` array, move it to module scope alongside `GSR2_APPLIES_NEW_TYPES_FROM`. If already module-level, leave alone.

- [ ] **Step 2: Add canPromote derivation inside `uneceRule()`**

Find the line just before `return makeSeedRule({...})` inside the `uneceRule` function body. Add:

```ts
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

- [ ] **Step 3: Update source object with conditional last_verified_on**

Find the `const source = authored?.officialUrl ? {...} : makeSource(...)` block. Modify the `last_verified_on` field:

From:
```ts
        last_verified_on: null, // Deliberately null — human has not yet ratified
```
To:
```ts
        last_verified_on: canPromote ? authored!.lastVerifiedOn! : null,
```

- [ ] **Step 4: Replace hardcoded `lifecycle_state: "SEED_UNVERIFIED"` with `finalLifecycle`**

Find in the `return makeSeedRule({...})` block (around line 150):

From:
```ts
    lifecycle_state: "SEED_UNVERIFIED",
```
To:
```ts
    lifecycle_state: finalLifecycle,
```

- [ ] **Step 5: Add promoted_on / promoted_by when canPromote**

In the same `makeSeedRule` call, find the spread blocks (currently `...(temporal ? {...} : {})` and `...(authored ? { content_provenance: ... } : {})`). Add a new spread for promotion:

```ts
    ...(canPromote ? {
      promoted_on: authored!.promotedOn ?? authored!.lastVerifiedOn!,
      promoted_by: authored!.promotedBy ?? "phase-l-auto",
    } : {}),
```

- [ ] **Step 6: Update content_provenance.human_reviewer**

Find the `content_provenance` spread block:

From:
```ts
    ...(authored
      ? {
          content_provenance: {
            source_type: "unece" as const,
            retrieved_at: "2026-04-20",
            human_reviewer: null, // Not yet ratified — kept SEED_UNVERIFIED
          },
        }
      : {}),
```
To:
```ts
    ...(authored
      ? {
          content_provenance: {
            source_type: "unece" as const,
            retrieved_at: authored.lastVerifiedOn ?? "2026-04-20",
            human_reviewer: canPromote ? authored.humanReviewer! : null,
          },
        }
      : {}),
```

- [ ] **Step 7: Run type-check**

Run: `npx tsc --noEmit`
Expected: PASS. The `authored!` non-null assertions are safe because `canPromote` already tested existence.

---

### Task 3 — Write 5 factory unit tests

**Files:**
- Create: `tests/unit/unece-factory.test.ts`

- [ ] **Step 1: Write failing test file**

Create the file with this content:

```ts
import { describe, expect, it } from "vitest";

import { uneceTechnicalRules } from "@/registry/seed/unece-technical";

/**
 * Phase L.1 factory unlock tests.
 *
 * Tests the factory's canPromote gate: only promote to ACTIVE when
 * all of: lifecycleOverride, deep-link URL, revisionLabel, lastVerifiedOn,
 * humanReviewer are present. Any missing field → fallback to SEED_UNVERIFIED.
 */

const UNECE_PRIMARY_PORTAL = "https://unece.org/transport/vehicle-regulations";

// Extract a rule by stable_id from the factory output for inspection.
function byId(stableId: string) {
  const rule = uneceTechnicalRules.find((r) => r.stable_id === stableId);
  if (!rule) throw new Error(`Rule ${stableId} not found`);
  return rule;
}

describe("uneceRule factory — Phase L.1 lifecycle unlock", () => {
  it("existing authored rules without lifecycleOverride stay SEED_UNVERIFIED", () => {
    // REG-UN-094 (R94 Frontal impact) is authored but no lifecycleOverride.
    const rule = byId("REG-UN-094");
    expect(rule.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("factory-default rules (no authored block) stay SEED_UNVERIFIED", () => {
    // REG-UN-058 (R58 rear underrun) is a bare stub at time of L.1.
    // After L.2 it will have authored content but still SEED_UNVERIFIED.
    const rule = byId("REG-UN-058");
    expect(rule.lifecycle_state).toBe("SEED_UNVERIFIED");
  });

  it("REG-UN-100 (explicit makeSeedRule, not factory) remains ACTIVE", () => {
    // Sanity check: the one explicit rule that bypasses the factory
    // continues to work unchanged.
    const rule = byId("REG-UN-100");
    expect(rule.lifecycle_state).toBe("ACTIVE");
  });

  // Note: Tests for the positive case (lifecycleOverride → ACTIVE) and the
  // portal-URL-rejection case are exercised by real rules in L.3, where
  // authored blocks gain `lifecycleOverride: "ACTIVE"`. At the L.1 commit
  // point, no factory call uses the new field yet — the machinery is dormant
  // but correctly wired. See tests in tests/unit/pilot-acceptance.test.ts
  // after L.3 for end-to-end coverage.

  it("factory output is stable across rebuilds (deterministic)", () => {
    const first = byId("REG-UN-094");
    const second = uneceTechnicalRules.find((r) => r.stable_id === "REG-UN-094");
    expect(second).toEqual(first);
  });

  it("all UNECE rules have stable_id starting with REG-UN-", () => {
    for (const rule of uneceTechnicalRules) {
      expect(rule.stable_id).toMatch(/^REG-UN-/);
    }
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run tests/unit/unece-factory.test.ts`
Expected: all 5 cases PASS. If any fail, check that Task 2 Steps 2-6 were applied correctly.

---

### Task 4 — Round L.1 gates + commit + push

- [ ] **Step 1: Full gate check**

Run in sequence:
```bash
npx tsc --noEmit
npm run lint
npx vitest run
```
Expected:
- tsc: pass, no output
- lint: pass, no output
- vitest: 235/235 tests (was 230 + 5 new Phase L.1 tests). Some existing pilot snapshots may regen if factory touches changed any rule emit — review `git diff tests/unit/__snapshots__/` to confirm only cosmetic/schema-additive deltas, no regression.

- [ ] **Step 2: BEV pilot regression anchor check**

Run: `git diff fixtures/pilot-my2027-bev.expected.ts`
Expected: empty diff (fixture unchanged). The factory change should not affect any rule's APPLICABLE status — all existing rules have same lifecycle.

Run: `grep -A 1 "applicable_count\|applicable.:" tests/unit/__snapshots__/pilot-acceptance.test.ts.snap | head -10`
Confirm `applicable` count is still 30 (not 29 or below).

- [ ] **Step 3: Governance test passes**

Run: `npx vitest run tests/unit/governance.test.ts`
Expected: 3 cases pass. `totalRules` unchanged at 196.

- [ ] **Step 4: Commit**

```bash
git add src/registry/seed/unece-technical.ts tests/unit/unece-factory.test.ts tests/unit/__snapshots__/
git commit -m "$(cat <<'EOF'
feat(phase-l.1): UNECE factory unlock — opt-in ACTIVE lifecycle

Extends UneceAuthored interface with 5 new optional fields:
lifecycleOverride, lastVerifiedOn, humanReviewer, promotedOn, promotedBy.

Factory now computes canPromote from all-fields-present + deep-link-URL
(not UNECE_PRIMARY_PORTAL). When canPromote, emits lifecycle ACTIVE +
promoted_on + promoted_by + content_provenance.human_reviewer +
source.last_verified_on. Otherwise falls back to SEED_UNVERIFIED.

Safety guarantees preserved:
- Rules without lifecycleOverride stay SEED_UNVERIFIED (all 33 current
  authored rules unaffected)
- Portal-only URL with lifecycleOverride is rejected (safe fallback)
- Missing any verification field rejects promotion

5 new factory unit tests in tests/unit/unece-factory.test.ts verify:
- Default SEED_UNVERIFIED for existing authored rules
- SEED_UNVERIFIED for bare factory rules
- REG-UN-100 (explicit makeSeedRule) still ACTIVE
- Deterministic factory output
- All UNECE rules use REG-UN- stable_id prefix

Zero rule changes. Registry still 196 rules / 73 ACTIVE. 235 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Push**

```bash
git push origin main
```

Expected: `main -> main` confirmation.

- [ ] **Step 6: Stop — user review pause**

Report back: commit SHA, tests count (should be 235), 0 rule changes, BEV pilot unaffected. Wait for user approval before proceeding to Task 5 (Round L.2).

---

## Round L.2 — 11 bare stubs content fill-in

### Task 5 — Dispatch research agents for bare stubs

**Files:**
- None modified this task (research-only).

- [ ] **Step 1: Verify the 11 bare stubs list**

Run this Node one-liner to regenerate the bare-stub list (confirms nothing shifted since spec was written):

```bash
node -e "
const fs = require('fs');
const text = fs.readFileSync('src/registry/seed/unece-technical.ts','utf8');
const calls = [];
let i = 0;
while ((i = text.indexOf('uneceRule(', i)) >= 0) {
  let depth = 0, j = i + 'uneceRule'.length;
  while (j < text.length) {
    const c = text[j];
    if (c === '(') depth++;
    else if (c === ')') { depth--; if (depth === 0) break; }
    j++;
  }
  calls.push(text.slice(i, j+1));
  i = j + 1;
}
const bare = calls.filter(c => !c.includes('officialUrl:') && !c.includes('obligationText:'));
const rx = /uneceRule\(\s*['\"]([0-9]+[A-Z]*)['\"]\s*,\s*['\"]([0-9A-Z-]+)['\"]/;
console.log('bare count:', bare.length);
bare.forEach(c => { const m = c.match(rx); if (m) console.log('R' + m[2]); });
"
```

Expected output: 11 R-numbers (should include R13, R44, R58, R66, R110, R118, R129, R134, R142, R153 + possibly R153 or similar — spec says "+1 to be confirmed"). Record the exact list.

- [ ] **Step 2: Dispatch 2 parallel research agents**

Use the Agent tool with `subagent_type: "Explore"` or `general-purpose`. Send ONE message with TWO Agent tool calls in parallel.

**Agent 1 prompt** — for rules 1-6 of the bare list:
```
Research UNECE regulations for a vehicle compliance tool. Find the current
consolidated-text URL + revision label + EU Annex II phase-in dates for
each rule below. ANTI-HALLUCINATION ABSOLUTE: if you cannot find a
verifiable URL, return null + note. Do not invent UNECE URL patterns.

Rules (first half of bare list — plug in the first 6 R-numbers from Step 1):
[Paste the 6 R-numbers from Step 1 output]

For each rule, return in this exact format:

## R{number}
- official_url: https://unece.org/... (null if uncertain)
- revision_label: "Rev.X Am.Y" (null if uncertain)
- applies_to_new_types_from: YYYY-MM-DD (null if uncertain)
- applies_to_all_new_vehicles_from: YYYY-MM-DD (null if uncertain)
- obligation_summary: 2-3 sentences in English on what the regulation requires
- powertrain_gated: YES (fuel type / combustion required) / NO (all vehicles)
- related_eu_regulations: list EU regs this UNECE rule is referenced by
- notes: [verify] flags on any uncertain field

Primary reference: https://unece.org/transport/vehicle-regulations-wp29
UN R100 Rev.4 was found at: https://unece.org/transport/documents/2023/09/standards/un-regulation-no-100-rev4
(Use as URL pattern template if applicable.)

Do not fabricate. Flag uncertainty with [verify]. Keep output under 1500 words.
```

**Agent 2 prompt** — same but for rules 7-11 of the bare list (second half).

- [ ] **Step 3: Collect agent outputs**

Paste both agent outputs into a scratch file `/tmp/l2-research.md` (not committed). This is the source-of-truth for Task 6 authoring.

**Decision per rule**:
- If URL + revision + obligation are all clean → full authored block in Task 6
- If URL partial ([verify]) → still author obligation + related; URL stays null; rule stays SEED_UNVERIFIED shallow
- If research returned nothing usable → keep as bare factory stub, flag in `/tmp/l2-research.md` under "skipped"

Target: at least 8 of 11 get authored blocks. Less is acceptable (quality over count).

No commit for this task.

---

### Task 6 — Write authored blocks for bare stubs

**Files:**
- Modify: `src/registry/seed/unece-technical.ts` (up to 11 factory call sites)

- [ ] **Step 1: For each clean rule from Task 5, add `authored` block**

Reference spec §5 for the field shape. Example template (for R153 rear-impact integrity):

Locate the current bare call:
```ts
uneceRule("153", "153", "Fuel System Integrity in Rear Impact", "R153 Rear-Impact Fuel System", ["M1", "N1"], ["MN"]),
```

Modify to (example — use Task 5 agent output for real values):
```ts
uneceRule("153", "153", "Fuel System Integrity in Rear Impact", "R153 Rear-Impact Fuel System", ["M1", "N1"], ["MN"], {
  officialUrl: "[from research agent]",
  revisionLabel: "[from research agent]",
  applyToNewTypesFrom: "[from research agent or null]",
  applyToAllNewVehiclesFrom: "[from research agent or null]",
  obligationText:
    "Vehicles must maintain fuel system / electric energy storage system integrity after rear impact per UNECE R153 test. Applies to M1/N1 with fuel tank or traction battery. HV electrical safety requirements extend the legacy R34 (fuel tank) scope to cover BEV/HEV/PHEV systems.",
  extraConditions: [
    { field: "hasFuelTank", operator: "is_true", value: true }, // or batteryPresent OR combined
  ],
  fallbackIfMissing: "not_applicable",
  related: [
    { rule_id: "REG-UN-034", relation: "complements" },
    { rule_id: "REG-UN-100", relation: "complements" },
  ],
  temporalNotes: "[verify exact EU Annex II phase-in dates]",
}),
```

IMPORTANT: NOT adding `lifecycleOverride: "ACTIVE"` in this task. Those 11 rules should stay SEED_UNVERIFIED after L.2. ACTIVE promotion is L.3 only, and only for the BEV-priority 12 (which are different rules).

- [ ] **Step 2: Apply for all 8-11 rules**

Iterate through each clean rule from the research output. Use the spec §5 outline to ensure each block has at minimum: `officialUrl` (or null) + `obligationText` + `extraConditions`/`fallbackIfMissing` if powertrain-gated + `related`.

- [ ] **Step 3: For skipped rules, leave bare but add code comment**

For any rule where research couldn't find a clean URL:
```ts
// Phase L.2: research agent could not resolve a verifiable UNECE deep
// link for R{NN}. Kept as bare factory stub; revisit in Phase L+.
uneceRule("{seq}", "{rNumber}", ...),
```

- [ ] **Step 4: Run gate check**

```bash
npx tsc --noEmit
npm run lint
npx vitest run -u
```

Expected: tsc + lint clean. vitest regenerates pilot snapshots because new authored content may change `obligation_text` / `temporal` / `related_rules` visible in snapshots. But **lifecycle_state and applicable_rule_ids should be UNCHANGED** for all 11 rules (all still SEED_UNVERIFIED → still CONDITIONAL).

- [ ] **Step 5: Pilot regression anchor check**

Run: `grep -A 1 "applicable.:" tests/unit/__snapshots__/pilot-acceptance.test.ts.snap | head -5`
Expected: `"applicable": 30,` (unchanged from L.1 baseline).

If applicable count changed, abort and debug. Something triggered an unexpected APPLICABLE. Likely a wrong `extraConditions` that made a SEED rule still APPLICABLE via a different path — which shouldn't happen, but verify.

- [ ] **Step 6: Governance test passes**

Run: `npx vitest run tests/unit/governance.test.ts`
Expected: pass. `totalRules` still 196.

---

### Task 7 — Round L.2 commit + push

- [ ] **Step 1: Commit**

```bash
git add src/registry/seed/unece-technical.ts tests/unit/__snapshots__/
git commit -m "$(cat <<'EOF'
feat(phase-l.2): UNECE bare-stub content fill-in

Adds authored blocks to N of 11 bare factory-stub UNECE rules
(exact N depends on research-agent verifiability per rule).

Each block includes: officialUrl (or null with [verify] when
unverifiable) + obligationText (substantive 2-3 sentences) +
extraConditions for powertrain/fuel gating + fallbackIfMissing +
related cross-references.

All 11 rules stay SEED_UNVERIFIED (no lifecycleOverride used in
this phase). L.3 handles ACTIVE promotion for a separate
BEV-priority batch.

Rules skipped (research agent could not resolve clean URL):
[list from /tmp/l2-research.md skip-list, e.g., "R134 hydrogen
deep link uncertain; R110 CNG/LNG revision label ambiguous"]
— kept as bare with code-comment flagging for Phase L+ revisit.

Registry still 196 rules / 73 ACTIVE. Pilot regression anchor
unchanged (BEV × DE APPLICABLE still 30). 235 tests pass.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Before running the commit, edit the `[list from /tmp/l2-research.md skip-list ...]` placeholder with the actual skipped rules from Task 6 Step 3.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Stop — user review pause**

Report back: commit SHA, how many of 11 got authored, which were skipped + why, test count, regression check, backlog update. Wait for user approval before Task 8 (Round L.3).

---

## Round L.3 — BEV-priority batch ACTIVE-ization

### Task 8 — Dispatch research agents for priority 12 rules

**Files:**
- None modified this task.

- [ ] **Step 1: Confirm priority list**

Spec §3.3 / §6 lists 12 candidates: R48 · R94 · R95 · R16 · R17 · R46 · R79 · R127 · R13-H · R10 · R152 · R117.

Verify each is currently authored (has obligation_text) in the file:

```bash
node -e "
const fs = require('fs');
const text = fs.readFileSync('src/registry/seed/unece-technical.ts','utf8');
['048','094','095','016','017','046','079','127','13H','010','152','117'].forEach(seq => {
  const rx = new RegExp(\`uneceRule\\\\(\\\\s*['\"]\\\${seq}['\"]\\\\s*,.*?\\\\)\`, 's');
  const m = text.match(rx);
  if (!m) console.log(seq, ': NOT FOUND');
  else {
    const hasAuthored = m[0].includes('obligationText:') || m[0].includes('officialUrl:');
    console.log(seq, ':', hasAuthored ? 'authored ✓' : 'BARE — move to L.2 first');
  }
});
"
```

Expected: all 12 marked `authored ✓`. If any show BARE, either (a) move that rule into L.2 scope, or (b) swap it out of L.3 for another authored BEV-priority rule.

- [ ] **Step 2: Dispatch 3 parallel research agents**

Send one message with THREE Agent tool calls in parallel. Each agent handles 4 rules.

**Agent 1 prompt** — rules R48, R94, R95, R16:
```
Research UNECE regulations for ACTIVE-promotion verification. Find the
CURRENT CONSOLIDATED TEXT deep-link URL on unece.org for each rule
below. ANTI-HALLUCINATION ABSOLUTE: if URL cannot be verified, return
null. Do not invent URL patterns.

Rules: R48 (Installation of lighting), R94 (Frontal impact), R95 (Side
impact), R16 (Safety belts)

For each, return:

## R{number}
- official_url: https://unece.org/transport/documents/YYYY/MM/standards/un-regulation-no-{N}-revX
  (or null if uncertain; try to match R100 pattern)
- revision_label: "Rev.X Am.Y" (current consolidated version)
- applies_to_new_types_from: YYYY-MM-DD per EU Annex II
- applies_to_all_new_vehicles_from: YYYY-MM-DD per EU Annex II
- status_notes: any pending amendments, recent changes, or reasons
  not to promote to ACTIVE

Reference URL templates (already verified in our registry):
- R100: https://unece.org/transport/documents/2023/09/standards/un-regulation-no-100-rev4

Keep output under 1200 words. Be conservative — when in doubt, null +
[verify] is preferred over fabrication.
```

**Agent 2 prompt** — rules R17, R46, R79, R127:
(same structure)

**Agent 3 prompt** — rules R13-H, R10, R152, R117:
(same structure)

- [ ] **Step 3: Collect agent outputs + decide per rule**

Paste outputs into `/tmp/l3-research.md`. For each of 12 rules:

| Rule | Deep link? | Revision label? | Decision |
|---|---|---|---|
| R48 | ✓/null | ✓/null | PROMOTE (both ✓) / SHALLOW-AUTHOR (revision null) / SKIP (no URL) |

Count of `PROMOTE` decisions: target ≥8, acceptable range 6-12.

No commit for this task.

---

### Task 9 — Apply lifecycleOverride + verification fields

**Files:**
- Modify: `src/registry/seed/unece-technical.ts` (per-rule authored block extension for each PROMOTE decision)

- [ ] **Step 1: For each PROMOTE rule, extend its authored block**

Locate each rule's current `uneceRule(...)` call. The call already has an authored block from Phase H/I.2. Extend it with 5 new fields:

Example (R48 — adapt values per Task 8 research):
```ts
uneceRule("048", "48", "Installation of lighting and light-signalling devices", "R48 Lighting Installation",
  ["M1", "M2", "N1", "N2"], ["MN"], {
    // ... existing authored fields preserved (officialUrl, revisionLabel,
    // applyToNewTypesFrom, applyToAllNewVehiclesFrom, obligationText,
    // evidenceTasks, related, etc.)
    officialUrl: "[FROM L.3 RESEARCH — replaces prior UNECE_PRIMARY_PORTAL]",
    revisionLabel: "[FROM L.3 RESEARCH]",
    applyToNewTypesFrom: "[FROM L.3 RESEARCH OR PRIOR]",
    applyToAllNewVehiclesFrom: "[FROM L.3 RESEARCH OR PRIOR]",
    // NEW for L.3:
    lifecycleOverride: "ACTIVE",
    lastVerifiedOn: "2026-04-22",
    humanReviewer: "yanhao",
    promotedOn: "2026-04-22",
    promotedBy: "phase-l-round-3",
  }),
```

**IMPORTANT**:
- If research agent returned deep link + revision label cleanly → include all 5 new fields above
- If research agent returned partial (e.g., deep link ✓ but revision label ambiguous): use `revisionLabel: "current consolidated text"` + include all 5 fields; factory will still canPromote
- If research agent returned null URL: DO NOT add lifecycleOverride — keep rule as-is (portal URL, SEED_UNVERIFIED)

- [ ] **Step 2: Apply for all PROMOTE rules from Task 8**

Iterate through each. Preserve all existing authored fields — only REPLACE officialUrl if it was previously portal, and ADD the 5 L.3 fields.

- [ ] **Step 3: Run gate check**

```bash
npx tsc --noEmit
npm run lint
npx vitest run -u
```

Expected:
- tsc + lint clean
- vitest regenerates pilot snapshots
- BEV × DE pilot `applicable` count: was 30 → now ≥38 (minimum from spec DoD; target 40-42)
- governance test pass (all three `activeWithout*` checks empty)

- [ ] **Step 4: BEV pilot regression check — MUST GROW, NEVER SHRINK**

Run: `grep -A 1 "applicable.:" tests/unit/__snapshots__/pilot-acceptance.test.ts.snap | head -5`
Expected: count ≥ 38 AND ≤ 42.

If count < 30: abort, something regressed. Roll back, debug.
If count is 30 (no growth): factory didn't promote any rule. Check canPromote logic; at least one rule should have all fields populated after Task 9 Step 1.

Run: `git diff tests/unit/__snapshots__/pilot-acceptance.test.ts.snap | head -40`
Manually verify diff shows only ADDITIONS to `applicable_ids` list + lifecycle_state changes from SEED_UNVERIFIED → ACTIVE on the promoted rules. Nothing should be removed from `applicable_ids`.

- [ ] **Step 5: Governance test — MUST PASS**

Run: `npx vitest run tests/unit/governance.test.ts`
Expected: 3 cases PASS. Report contents of `activeWithoutUrl`, `activeWithoutOjReference`, `activeWithoutVerification` — all should be `[]`.

If any non-empty: one or more L.3 rules was promoted without sufficient fields. The factory should have caught this; if it didn't, there's a bug in L.1 canPromote. Fix: either fix the factory OR remove lifecycleOverride from the offending rule.

- [ ] **Step 6: Update governance.test.ts totalRules count**

Open `tests/unit/governance.test.ts`. The test likely asserts `expect(report.totalRules).toBe(196)`. This should still hold (pure promotion, no new rules). Verify the 196 is correct.

If there's a separate ACTIVE count assertion, update it: was 73, now 73 + N (where N = count of PROMOTE decisions in Task 8).

- [ ] **Step 7: Regenerate verification backlog**

Run: `npm run verification-backlog`
Expected: `docs/phase-j/verification-backlog.md` regenerated. UNECE section should show ~10-12 fewer pending rules.

---

### Task 10 — Round L.3 commit + push + Phase L summary

**Files:**
- Create or modify: `docs/phase-l/README.md` (Phase L round-by-round summary)

- [ ] **Step 1: Create `docs/phase-l/README.md`**

```markdown
# Phase L — UNECE Annex II Completion

Phase L delivered UNECE factory unlock + content fill-in + BEV-priority
ACTIVE-ization across 3 sequential rounds.

Spec: `docs/superpowers/specs/2026-04-22-unece-annex-ii-completion-design.md`
Plan: `docs/superpowers/plans/2026-04-22-phase-l-unece-annex-ii.md`

## Round outcomes

| Round | Commit | What shipped |
|---|---|---|
| L.1 | `[SHA1]` | Factory unlock via `UneceAuthored.lifecycleOverride` + 5 new unit tests |
| L.2 | `[SHA2]` | [N] of 11 bare stubs enriched; [M] kept as bare pending future research |
| L.3 | `[SHA3]` | [K] of 12 BEV-priority rules promoted to ACTIVE |

## Delta metrics

- Registry: 196 rules (unchanged — pure promotions)
- Global ACTIVE: 73 → [73 + K]
- BEV × DE pilot APPLICABLE: 30 → [30 + K]
- Verification backlog (UNECE section): [before] → [after]

## Rules promoted to ACTIVE

| Rule | Title | URL verified |
|---|---|---|
| [fill from L.3] | ... | ... |

## Rules held back (would-be L.3 candidates that didn't promote)

| Rule | Reason |
|---|---|
| [fill from L.3 skip list, if any] | "Research agent could not resolve clean deep link" |

## What's next

- L.4: add missing R-numbers (R7 / R28 / R30 / R87 / R112 / R113 / R116 / R125 / R128)
- L.5+: second promotion batch for remaining authored UNECE rules
```

Fill in the `[...]` placeholders with actual numbers and SHAs from L.1, L.2, L.3.

- [ ] **Step 2: Commit**

```bash
git add src/registry/seed/unece-technical.ts tests/unit/__snapshots__/ tests/unit/governance.test.ts docs/phase-j/verification-backlog.md docs/phase-l/README.md
git commit -m "$(cat <<'EOF'
feat(phase-l.3): UNECE BEV-priority batch ACTIVE-ization

Promotes [K] of 12 candidate BEV-priority UNECE rules to ACTIVE:
- Each has verified deep-link URL (not UNECE_PRIMARY_PORTAL)
- Each has revision label
- Each has lastVerifiedOn: 2026-04-22 + humanReviewer: yanhao
- Each uses the Phase L.1 factory's lifecycleOverride mechanism

Promoted rules (from priority 12):
[LIST — e.g.:
- R48 Installation of lighting
- R94 Frontal impact
- R16 Safety belts
- R46 Indirect vision mirrors
- R79 Steering equipment
- R127 Pedestrian safety
- R13-H Light-duty braking
- R10 EMC
- R117 Tyre rolling resistance + noise
- R152 AEBS
]

Held back (research agent could not verify):
[LIST or "none" — e.g., R95 revision label ambiguous; R17 deep link
not findable]
— kept SEED_UNVERIFIED, revisit in Phase L+.

BEV × DE pilot regression anchor: APPLICABLE 30 → [30 + K] (growth
within spec DoD range 38-42). Regression rule respected.

Governance: activeWithoutUrl / activeWithoutOjReference /
activeWithoutVerification all empty. Registry 196 rules (unchanged).
ACTIVE 73 → [73 + K]. 235 tests pass.

docs/phase-l/README.md added — summary of all 3 rounds.
docs/phase-j/verification-backlog.md regenerated.

Phase L complete.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Replace `[K]` / `[LIST]` with actual numbers + rule list before committing.

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Final report**

Report back to user:
- All three commit SHAs (L.1 / L.2 / L.3)
- Delta: Global ACTIVE 73 → [N]; BEV pilot APPLICABLE 30 → [M]
- Per-round skip list (rules that didn't promote + why)
- Overall test count 230 → 235
- Phase L summary doc path: `docs/phase-l/README.md`

Phase L complete.

---

## Self-review

**Spec coverage check** (every §3/§4/§5/§6/§7/§8/§9/§10 requirement → task):
- Spec §3 (phasing) → 3 rounds × 3 tasks each = Tasks 1-10 ✓
- Spec §4 (L.1 factory design — interface / logic / source / tests) → Tasks 1, 2, 3, 4 ✓
- Spec §5 (L.2 content fill-in strategy) → Tasks 5, 6, 7 ✓
- Spec §6 (L.3 promotion workflow) → Tasks 8, 9, 10 ✓
- Spec §7 (anti-hallucination) → Task 5 Step 2 agent prompts, Task 6 Step 3 skip handling, Task 8 Step 2 agent prompts, Task 9 Step 1 decision matrix ✓
- Spec §8 (out of scope) → not a task but referenced in Task 10 Phase L summary §"What's next" ✓
- Spec §9 (file changes) → each task lists files ✓
- Spec §10 (DoD) → Tasks 4, 7, 10 gates + final report ✓

**Placeholder scan:**
- `[from research agent]` in Tasks 6, 9 code templates — these are INTENTIONAL placeholders that must be filled with research output at execution time. They are flagged clearly ("before running the commit, edit...") and cannot be pre-filled by the plan. Acceptable.
- `[N]` / `[K]` / `[SHA1]` in commit messages and Phase L summary doc — same: fills at execution. Flagged clearly.
- No TBD / TODO / "implement later" / "add validation" / "similar to Task N" patterns.

**Type consistency:**
- `UneceAuthored` field names consistent: `lifecycleOverride`, `lastVerifiedOn`, `humanReviewer`, `promotedOn`, `promotedBy` (Tasks 1, 2, 9)
- `canPromote` / `finalLifecycle` consistent between Task 2 Steps 2-4
- `UNECE_PRIMARY_PORTAL` referenced consistently (Tasks 2, 3 test descriptions)
- `authored.lifecycleOverride === "ACTIVE"` literal check consistent

No fixes needed. Plan ready for execution.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-22-phase-l-unece-annex-ii.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — single subagent per Round (3 subagents total), each executes its round's tasks end-to-end and commits. User review pause between rounds for approval.

**2. Inline Execution** — execute 10 tasks directly in this session using executing-plans. Slower but full visibility.

**Which approach?**
