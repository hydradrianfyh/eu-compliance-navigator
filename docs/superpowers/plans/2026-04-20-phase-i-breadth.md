# Phase I — Breadth Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the EU Vehicle Compliance Navigator from "BEV × DE only" to "BEV + PHEV + ICE × DE / FR / UK / ES at pilot quality" via one coordinated wave of engine fixes + 50 new authored rules.

**Architecture:** Six sub-phases executed sequentially, each committed independently and gated on `tsc` + `eslint` + `vitest` green. Foundation first (engine schema + derived flags), then content waves (ICE/PHEV emissions, UK overlay, ES overlay, DE/FR fill-in), then fixtures + docs. Parallel research agents dispatched before each content wave to cross-check facts.

**Tech Stack:** TypeScript 6 / Next.js 16 / Zod / Vitest. No new runtime dependencies.

**Spec reference:** `docs/superpowers/specs/2026-04-20-phase-i-breadth-design.md` (commit `5b7d22a`) — the design doc is authoritative for rule content; this plan is authoritative for execution sequence + code shape.

---

## File touchpoints

**Modified:**
- `src/shared/constants.ts` — confirm `fuelTypeSchema` enum (already exists; no change if complete)
- `src/config/schema.ts` — extend EngineConfig with 5 derived flags
- `src/config/defaults.ts` — default `fuel.tankType` on new configs
- `src/engine/config-builder.ts` — derive 5 new flags from VehicleConfig
- `src/registry/seed/shared.ts` — no change (factory stays as-is)
- `src/registry/seed/emissions-co2.ts` — 1 refactor + 9 new rules
- `src/registry/seed/unece-technical.ts` — 1 enrichment + 6 new rules (via uneceRule factory)
- `src/registry/seed/materials-chemicals.ts` — promote REG-BAT-003 ELV to SEED_UNVERIFIED authored
- `src/registry/seed/non-eu-market.ts` — add 12 UK rules
- `src/registry/seed/member-state-overlay.ts` — add 13 ES rules, 4 DE rules, 6 FR rules, remove UK + ES from factory priorityCountries
- `src/components/setup/ConfigPanelV2.tsx` — add Fuel type select
- `fixtures/pilot-my2027-bev.ts` — add `fuel.tankType: "none"`
- `fixtures/pilot-my2027-bev.expected.ts` — update applicable set
- `fixtures/pilot-my2028-phev.ts` — ensure `fuel.tankType: "petrol"`, add "FR" to targetCountries
- `fixtures/pilot-my2028-phev.expected.ts` — update applicable set + conditional range
- `tests/unit/config-builder.test.ts` — new flag derivation cases
- `tests/unit/governance.test.ts` — update totalRules count
- `tests/unit/__snapshots__/*.snap` — regenerate with `vitest run -u`
- `README.md` — rule count + test count refresh
- `docs/USER-GUIDE.md` + `docs/USER-GUIDE-EN.md` — document fuelType field
- `docs/rule-authoring-guide.md` — note new engine flags

**Created:**
- `fixtures/pilot-my2027-ice-m1-es.ts`
- `fixtures/pilot-my2027-ice-m1-es.expected.ts`
- `tests/unit/pilot-ice-es-acceptance.test.ts`
- `docs/adr/ADR-H7-euro-7-rule-split.md`

---

## Phase I.1 — Engine + Schema Foundation

### Task I.1.1 — Add new derived flags to EngineConfig Zod schema

**Files:**
- Modify: `src/config/schema.ts` (engineConfigSchema object literal, before `readiness:` line)

- [ ] **Step 1: Read current engineConfigSchema (lines ~91-127)** to locate insertion point (after `hasESP: z.boolean(),` near line 121).

- [ ] **Step 2: Add 5 new derived-flag fields to `engineConfigSchema`**

Insert immediately after `hasESP: z.boolean(),`:

```ts
  fuelType: z.enum(["petrol", "diesel", "lpg", "cng", "lng", "h2", "none"]).nullable(),
  hasCombustionEngine: z.boolean(),
  hasDieselEngine: z.boolean(),
  hasFuelTank: z.boolean(),
  hasOBD: z.boolean(),
  isPlugInHybrid: z.boolean(),
```

- [ ] **Step 3: Run type-check**

Run: `npx tsc --noEmit`
Expected: Errors in `config-builder.ts` because `engineConfigSchema.parse()` now requires these 6 fields. This is correct — Task I.1.2 resolves.

### Task I.1.2 — Derive new flags in config-builder

**Files:**
- Modify: `src/engine/config-builder.ts` (buildEngineConfig function)

- [ ] **Step 1: Add a constant near top of file** (after `const safetyAiLevels = new Set(...)` line ~41):

```ts
const combustionPowertrains = new Set(["ICE", "HEV", "PHEV"]);
const fuelTankFuels = new Set(["petrol", "diesel", "lpg", "cng", "lng"]);
```

- [ ] **Step 2: Add derivation logic inside buildEngineConfig before the return**

Insert between the `const targetsNonEU = ...` block (~line 48) and the `return engineConfigSchema.parse({...})` call:

```ts
  const fuelType = config.fuel?.tankType ?? null;
  const hasCombustionEngine =
    config.powertrain !== null &&
    combustionPowertrains.has(config.powertrain) &&
    fuelType !== "none" &&
    fuelType !== "h2";
  const hasDieselEngine = hasCombustionEngine && fuelType === "diesel";
  const hasFuelTank =
    hasCombustionEngine ||
    (fuelType !== null && fuelTankFuels.has(fuelType)) ||
    fuelType === "h2";
  const hasOBD = hasCombustionEngine;
  const isPlugInHybrid = config.powertrain === "PHEV";
```

- [ ] **Step 3: Pass flags into `engineConfigSchema.parse({...})`**

Add before `readiness: config.readiness,`:

```ts
    fuelType,
    hasCombustionEngine,
    hasDieselEngine,
    hasFuelTank,
    hasOBD,
    isPlugInHybrid,
```

- [ ] **Step 4: Run type-check**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

### Task I.1.3 — Add config-builder unit tests

**Files:**
- Modify (or create): `tests/unit/config-builder.test.ts`

- [ ] **Step 1: Write failing tests covering all 5 new flags**

Add a new `describe` block:

```ts
describe("powertrain + fuel flag derivation", () => {
  const baseConfig = buildVehicleConfigFixture({
    frameworkGroup: "MN",
    vehicleCategory: "M1",
    sopDate: "2027-01-15",
    targetCountries: ["DE"],
  });

  it("BEV + fuel.tankType none → no combustion flags", () => {
    const engine = buildEngineConfig({
      ...baseConfig,
      powertrain: "BEV",
      fuel: { tankType: "none" },
    });
    expect(engine.fuelType).toBe("none");
    expect(engine.hasCombustionEngine).toBe(false);
    expect(engine.hasDieselEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(false);
    expect(engine.hasOBD).toBe(false);
    expect(engine.isPlugInHybrid).toBe(false);
    expect(engine.batteryPresent).toBe(true);
  });

  it("ICE petrol → combustion + fuel tank + OBD, no diesel", () => {
    const engine = buildEngineConfig({
      ...baseConfig,
      powertrain: "ICE",
      fuel: { tankType: "petrol" },
    });
    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasDieselEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
    expect(engine.isPlugInHybrid).toBe(false);
    expect(engine.batteryPresent).toBe(false);
  });

  it("ICE diesel → all combustion flags incl. diesel", () => {
    const engine = buildEngineConfig({
      ...baseConfig,
      powertrain: "ICE",
      fuel: { tankType: "diesel" },
    });
    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasDieselEngine).toBe(true);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(true);
  });

  it("PHEV petrol → both combustion and battery flags, plus isPlugInHybrid", () => {
    const engine = buildEngineConfig({
      ...baseConfig,
      powertrain: "PHEV",
      fuel: { tankType: "petrol" },
    });
    expect(engine.hasCombustionEngine).toBe(true);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.isPlugInHybrid).toBe(true);
    expect(engine.batteryPresent).toBe(true);
  });

  it("FCEV h2 → fuel tank present but no combustion engine", () => {
    const engine = buildEngineConfig({
      ...baseConfig,
      powertrain: "FCEV",
      fuel: { tankType: "h2" },
    });
    expect(engine.hasCombustionEngine).toBe(false);
    expect(engine.hasFuelTank).toBe(true);
    expect(engine.hasOBD).toBe(false);
    expect(engine.batteryPresent).toBe(true);
  });

  it("ICE + missing fuel.tankType → combustion still true, fuelType null", () => {
    const engine = buildEngineConfig({
      ...baseConfig,
      powertrain: "ICE",
      fuel: undefined,
    });
    expect(engine.fuelType).toBe(null);
    expect(engine.hasCombustionEngine).toBe(false); // can't confirm combustion without fuelType
  });
});
```

> Note: If `buildVehicleConfigFixture` doesn't exist, use the existing pattern in the test file — whichever helper already produces a valid `VehicleConfig`. If none exists, construct one inline using `src/config/defaults.ts`.

- [ ] **Step 2: Run tests — expect failure**

Run: `npx vitest run tests/unit/config-builder.test.ts`
Expected: FAIL on the new `describe` block. (Prior tests unchanged.)

- [ ] **Step 3: If failures are due to missing imports, fix imports only.** The derivation logic from I.1.2 should make tests pass without further changes.

- [ ] **Step 4: Run tests again — expect pass**

Run: `npx vitest run tests/unit/config-builder.test.ts`
Expected: PASS. All 6 new cases + prior cases green.

### Task I.1.4 — Update ConfigPanelV2 UI with Fuel type select

**Files:**
- Modify: `src/components/setup/ConfigPanelV2.tsx` (Powertrain section)

- [ ] **Step 1: Read current Powertrain section** in ConfigPanelV2.tsx (grep for `"powertrain"` in the file).

- [ ] **Step 2: Add Fuel Type select conditional on powertrain choice**

Insert below the existing powertrain selector. Shape:

```tsx
{config.powertrain && config.powertrain !== "BEV" && (
  <label className="block text-sm">
    <span className="text-ink-secondary">Fuel type</span>
    <select
      value={config.fuel?.tankType ?? ""}
      onChange={(e) =>
        update({
          fuel: { tankType: e.target.value as VehicleConfig["fuel"]["tankType"] },
        })
      }
      className="mt-1 w-full rounded-md border-subtle bg-surface px-3 py-2"
    >
      <option value="">— choose —</option>
      <option value="petrol">Petrol</option>
      <option value="diesel">Diesel</option>
      <option value="lpg">LPG</option>
      <option value="cng">CNG</option>
      <option value="lng">LNG</option>
      <option value="h2">Hydrogen</option>
    </select>
  </label>
)}

{config.powertrain === "BEV" && (
  <p className="text-xs text-ink-muted">Fuel type: <strong>none</strong> (BEV)</p>
)}
```

Adjust class names / imports to match existing code style in the file.

- [ ] **Step 3: Run lint + type-check**

Run: `npm run lint && npx tsc --noEmit`
Expected: PASS.

### Task I.1.5 — Commit I.1

- [ ] **Step 1: Stage + commit**

```bash
git add src/config/schema.ts src/engine/config-builder.ts tests/unit/config-builder.test.ts src/components/setup/ConfigPanelV2.tsx
git commit -m "$(cat <<'EOF'
feat(phase-i.1): fuelType + ICE/PHEV derived flags in engine + config

Adds 5 derived flags to EngineConfig — hasCombustionEngine, hasDieselEngine,
hasFuelTank, hasOBD, isPlugInHybrid — plus fuelType (nullable) — so rules can
trigger on powertrain specifics without re-deriving ICE/PHEV logic in every
trigger. ConfigPanelV2 gets a Fuel Type select that appears for non-BEV
powertrains. Derives from existing vehicleConfig.fuel.tankType (enum already
defined in shared/constants).

Foundation for Phase I.2 ICE/PHEV emissions content. Pilot fixtures get the
fuel.tankType field updated in Phase I.6 together with snapshot regen.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2: Verify gates green**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: all green. Existing snapshot tests may fail after fuelType flag addition — if any do, they'll regen in I.6. For I.1, only config-builder + governance + schema tests should be touched. If other tests fail due to engineConfig shape drift, run `npx vitest run -u` to regen those specific snapshots and amend commit.

---

## Phase I.2 — ICE/PHEV Emissions Content + UNECE Enrichment

### Task I.2.1 — Dispatch parallel research agents to verify facts

Before authoring 15 new emissions/UNECE rules, verify official URLs, dates, and regulation numbers in parallel — this is the user's explicit anti-hallucination directive.

- [ ] **Step 1: Dispatch 3 parallel research agents** (use Agent tool with subagent_type "Explore")

Send a single message with three Agent tool calls:

**Agent A — Euro 6 & Euro 7 verification:**
```
Research and confirm the following EU emissions regulations — return verified
official URLs (EUR-Lex ELI format) + dates. Mark anything uncertain as [verify].
Target format: machine-parseable JSON-like.

1. Euro 6 baseline: Regulation (EC) 715/2007 + Reg (EU) 2017/1151 (WLTP) +
   Reg (EU) 2018/1832 (RDE amendments). Verify: CELEX numbers, OJ refs, dates.
2. Euro 7 battery-durability delegated act: is it published? If pending, name
   the pending act. If published, cite CELEX + OJ.
3. On-Board Diagnostics (OBD/EOBD): Dir 98/69/EC + Reg 715/2007 Annex XI +
   ISO 15031 references.
4. Evaporative emissions: Reg 715/2007 Annex III + 692/2008 Annex VI + SHED
   test procedure per Reg (EU) 2017/1151.
5. PHEV utility factor revised 2025: Commission Reg (EU) 2023/443 — confirm
   CELEX + effective date.
6. AdBlue/SCR / diesel NOx Euro 6d → Euro 7: Reg (EU) 2024/1257 Euro 7 NOx
   limit value + Reg 2017/1151 Annex IIIA RDE.
7. CO2 labeling: Dir 1999/94/EC — confirm CELEX + OJ.
8. VECTO heavy-duty: Reg (EU) 2017/2400 + Reg (EU) 2019/1242.

For each rule, return:
- official_url (eur-lex.europa.eu/eli/... preferred, null if can't verify)
- oj_reference (OJ L, YYYY/NNNN, DD Month YYYY)
- authoritative_reference (CELEX:NNNNNNNNNN)
- applies_from_generic / applies_to_new_types_from / applies_to_all_new_vehicles_from
- any pending status notes
```

**Agent B — UNECE regulations verification:**
```
Research and confirm UNECE R-series regulations. Return the latest official
text references, any EU transposition links, and mark uncertainty.

1. UN R34 (Fuel Tanks — Fire Prevention): current revision, EU binding via
   Reg (EU) 2018/858 Annex II. Applies_to_new_types_from.
2. UN R49 (Heavy-duty exhaust emissions): Euro VI → Euro VII transition.
3. UN R67 (LPG fuel system original equipment).
4. UN R85 (engine power measurement).
5. UN R101 (CO2 + fuel consumption light-duty, incl. PHEV utility factor).
6. UN R115 (LPG/CNG retrofit systems).
7. UN R117 (tyre rolling resistance + wet grip + noise).
8. Confirm UN R83 (light-duty emissions Euro 6) status — archived under
   Euro 7 or still applicable for pre-2026 approvals?

For each: official_url (unece.org preferred), current series (e.g. R85 Rev.1
Amend.2), and notes on EU applicability.
```

**Agent C — ELV directive + revision status:**
```
Research: EU End-of-Life Vehicles Directive 2000/53/EC and its pending revision
into a Regulation. Confirm:

1. Current directive CELEX + consolidated text URL.
2. Commission proposal COM(2023) 451 status — adopted? In trilogue? Text URL.
3. National transpositions relevant to DE/FR/UK/ES — one-line each, no fabrication.
4. Planned repeal date of 2000/53/EC per the new regulation.

Do not speculate. Mark pending items with [verify].
```

- [ ] **Step 2: Collect agent outputs into a working notes file**

Create a scratch file: `docs/superpowers/plans/i2-research-findings.md` pasting all three agent responses. This will feed the rule authoring step.

### Task I.2.2 — Refactor REG-EM-001 (Euro 7) to framework-only

**Files:**
- Modify: `src/registry/seed/emissions-co2.ts` (REG-EM-001 object)

- [ ] **Step 1: Read REG-EM-001 current state** (lines ~3-110). Keep the `sources` array, temporal, and identity fields. Change only `obligation_text`, `evidence_tasks`, and trigger scope.

- [ ] **Step 2: Rewrite `obligation_text`:**

```ts
    obligation_text:
      "Euro 7 framework applies to all M1/N1 light-duty vehicles regardless of powertrain, but individual obligations vary: combustion vehicles must meet exhaust PN10/NOx/HC/CO limits, EVAP + OBM + OBFCM (see REG-EM-013); battery electric, hybrid, and plug-in hybrid vehicles with traction batteries must meet battery durability standards (see REG-EM-014); all M1/N1 regardless of powertrain are subject to non-exhaust emissions monitoring (tyre wear + brake particulate from 2028) and the Environmental Vehicle Passport (EVP).",
```

- [ ] **Step 3: Rewrite `evidence_tasks` to framework-only**

```ts
    evidence_tasks: [
      "Euro 7 framework type-approval application (M1/N1)",
      "Environmental Vehicle Passport (EVP) data structure",
      "Non-exhaust emissions monitoring plan (tyre + brake particulate, from 2028)",
      "Powertrain-specific evidence tracked in REG-EM-013 (combustion) / REG-EM-014 (battery durability)",
    ],
```

- [ ] **Step 4: Add `related_rules`**

```ts
    related_rules: [
      { rule_id: "REG-EM-013", relation: "complements" },
      { rule_id: "REG-EM-014", relation: "complements" },
    ],
```

- [ ] **Step 5: Run lint + tsc**

Run: `npm run lint && npx tsc --noEmit`
Expected: PASS.

### Task I.2.3 — Author 9 new emissions rules

**Files:**
- Modify: `src/registry/seed/emissions-co2.ts` (append to `emissionsCo2Rules` array)

- [ ] **Step 1: Dispatch a subagent** to author the 9 new emissions rules using research findings from Task I.2.1 as source-of-truth.

Subagent prompt template:

```
Append 9 new rules to src/registry/seed/emissions-co2.ts using the existing
makeSeedRule factory. Use the research findings in docs/superpowers/plans/
i2-research-findings.md for verified sources/URLs/dates. Mark any uncertain
fact with [verify] in `notes`. All rules land as lifecycle_state: SEED_UNVERIFIED
with content_provenance.human_reviewer: null.

Rules to author (see spec §6.1 for full scope):

1. REG-EM-006 "Euro 6 Light-Duty (Legacy Baseline)"
   - legal_family: "emissions_co2"
   - framework_group: ["MN"]
   - trigger: declarative, all, [{ frameworkGroup eq "MN" }, { vehicleCategory in ["M1","N1"] }, { hasCombustionEngine is_true }]
   - fallback_if_missing: "not_applicable"
   - temporal: applies_to_new_types_from "2015-09-01", effective_to "2026-11-29"
   - source: Reg (EC) 715/2007 + Reg (EU) 2017/1151 (WLTP) + Reg (EU) 2018/1832 (RDE)
   - obligation_text: "M1/N1 combustion vehicles with SOP before 2026-11-29 must meet Euro 6 limits (CO, HC, NOx, PM, PN, evap), WLTP + RDE testing, 5y/100k-km durability. Superseded by Euro 7 (REG-EM-013) for SOP from 2026-11-29."
   - evidence_tasks: ["Euro 6 type-approval certificate", "WLTP test report", "RDE conformity factor report", "OBD diagnostics specification", "5y/100k-km durability demonstration"]
   - owner_hint: "powertrain_emissions"
   - ui_package: "wvta_core"
   - process_stage: "type_approval"

2. REG-EM-007 "On-Board Diagnostics (OBD/EOBD)"
   - trigger: [{ hasCombustionEngine is_true }]
   - fallback: "not_applicable"
   - temporal: applies_from_generic "2001-01-01" (petrol), notes: "2003-01-01 for diesel"
   - source: Dir 98/69/EC + Reg 715/2007 Annex XI + ISO 15031
   - obligation_text: "Combustion and plug-in-hybrid vehicles must provide on-board diagnostics monitoring emission-related systems. Standardized DTCs, OBD connector accessible, readiness monitors, ISO 15031 / SAE J1979 scan-tool protocol compliance."
   - evidence_tasks: ["OBD specification", "DTC list + translations", "Scan-tool protocol conformance (ISO 15031)", "Readiness monitor coverage report", "Dealer diagnostic training plan"]
   - prerequisite_standards: ["ISO 15031 (communication between vehicle and external equipment)", "SAE J1979 (OBD-II)"]
   - owner_hint: "powertrain_emissions"

3. REG-EM-008 "Evaporative Emissions (EVAP)"
   - trigger: all, [{ hasFuelTank is_true }, { fuelType in ["petrol","lpg","cng","lng"] }]
   - fallback: "not_applicable"
   - source: Reg 715/2007 Annex III + Reg 692/2008 Annex VI + Reg (EU) 2017/1151 Annex VI (SHED)
   - obligation_text: "Petrol/LPG/CNG/LNG-fueled vehicles must prevent HC vapor escape via charcoal canister + purge valve + leak detection system. SHED test demonstrates compliance."
   - evidence_tasks: ["SHED test report", "Charcoal canister sizing calc", "Purge valve specification", "ORVR leak-detect documentation"]
   - owner_hint: "powertrain_emissions"
   - notes: "Diesel excluded — negligible EVAP."

4. REG-EM-009 "PHEV CO2 Utility-Factor (R101)"
   - trigger: [{ isPlugInHybrid is_true }, { vehicleCategory in ["M1","N1"] }]
   - fallback: "not_applicable"
   - temporal: applies_from_generic "2025-01-01" (revised UF)
   - source: Commission Reg (EU) 2023/443 + UN R101 + Reg (EU) 2019/631 Annex I
   - obligation_text: "PHEV CO2 = CS-mode CO2 × (1 − UF) + CD-mode CO2 × UF, where UF is derived from WLTP electric range. Revised UF methodology from 1 Jan 2025 reduces real-world mismatch → higher declared CO2 → lower fleet CO2 credit."
   - evidence_tasks: ["R101 test report", "WLTP electric-range determination", "UF calculation worksheet", "Combined CO2 declaration", "Charge-depleting vs charge-sustaining CO2 breakdown"]
   - related_rules: [{ rule_id: "REG-UN-101", relation: "requires" }, { rule_id: "REG-EM-003", relation: "complements" }]
   - owner_hint: "powertrain_emissions"

5. REG-EM-010 "Diesel NOx After-Treatment (AdBlue/SCR)"
   - trigger: [{ hasDieselEngine is_true }]
   - fallback: "not_applicable"
   - source: Reg (EC) 715/2007 Euro 6d (80 mg/km) + Reg (EU) 2024/1257 Euro 7 (60 mg/km) + Reg 2017/1151 Annex IIIA
   - obligation_text: "Diesel vehicles must meet NOx limit via SCR after-treatment with DEF/AdBlue dosing; tamper-proof fill, driver warnings on low tank, engine degradation (not shutdown) when empty. Euro 7 tightens to 60 mg/km incl. cold-start + extended RDE."
   - evidence_tasks: ["SCR architecture specification", "AdBlue consumption rate", "Anti-tampering documentation", "Driver HMI warnings per Reg 2017/1151", "In-service compliance (ISC) test plan", "RDE NOx compliance report"]
   - prerequisite_standards: ["ISO 22241 (DEF / AUS32 quality)"]
   - related_rules: [{ rule_id: "REG-UN-083", relation: "complements" }]
   - owner_hint: "powertrain_emissions"

6. REG-EM-011 "CO2 + Fuel Consumption Consumer Labeling"
   - trigger: [{ frameworkGroup eq "MN" }, { vehicleCategory eq "M1" }]
   - fallback: "not_applicable"
   - temporal: applies_from_generic "2001-01-18" (framework), notes: "WLTP values required from 2018-01-01; national label format varies per MS transposition (DE PKW-EnVKV, FR arrêté 10/04/2003, ES RD 837/2002)"
   - source: Dir 1999/94/EC + MS transpositions
   - obligation_text: "New passenger cars (M1) must display a label showing official fuel consumption (l/100km) and CO2 (g/km) at point of sale; brochures and online listings must include same data. PHEV: combined WLTP CO2 + electric-mode range. BEV: kWh/100km."
   - evidence_tasks: ["Label artwork approval per MS format", "Dealer training on label placement", "Brochure template audit", "Web-listing audit"]
   - owner_hint: "homologation"
   - ui_package: "market_access"
   - process_stage: "sop"

7. REG-EM-012 "Heavy-Duty CO2 / VECTO"
   - trigger: all, [{ vehicleCategory in ["M2","M3","N2","N3"] }, { hasCombustionEngine is_true }]
   - fallback: "not_applicable"
   - temporal: applies_from_generic "2019-01-01" (VECTO monitoring), applies_to_new_types_from "2025-07-01" (HD CO2 targets phase 1 −15%)
   - source: Reg (EU) 2017/2400 (VECTO) + Reg (EU) 2019/1242 (HD CO2 targets)
   - obligation_text: "HD manufacturers must simulate vehicle CO2 using VECTO, declare per vehicle, meet fleet targets: −15% (2025), −45% (2030), −65% (2035), −90% (2040)."
   - evidence_tasks: ["VECTO simulation reports per vehicle", "Component test certificates (engine, transmission, axle, tyres)", "Fleet CO2 compliance plan", "Annual monitoring data per Reg 2018/956"]
   - owner_hint: "powertrain_emissions"
   - notes: "Applies primarily to Chinese HD OEMs (Foton, Sany, Yutong). Out of pilot M1 scope but registry completeness."

8. REG-EM-013 "Euro 7 — Combustion Exhaust + OBFCM"
   - trigger: all, [{ frameworkGroup eq "MN" }, { vehicleCategory in ["M1","N1"] }, { hasCombustionEngine is_true }]
   - fallback: "not_applicable"
   - temporal: applies_to_new_types_from "2026-11-29", applies_to_all_new_vehicles_from "2027-11-29"
   - source: Reg (EU) 2024/1257 + Impl Reg (EU) 2025/1706 (exhaust/evap) + Impl Reg (EU) 2025/1707 (OBFCM/OBM/EVP)
   - obligation_text: "M1/N1 combustion/hybrid vehicles must meet Euro 7 exhaust limits (PN10, NOx, HC, CO), OBM on-board monitoring, OBFCM on-board fuel consumption monitoring, extended RDE including cold-start."
   - evidence_tasks: ["Euro 7 exhaust test reports (PN10, NOx, HC, CO)", "OBM system compliance per Impl Reg 2025/1707", "OBFCM device compliance", "Extended RDE cold-start test report"]
   - related_rules: [{ rule_id: "REG-EM-001", relation: "complements" }, { rule_id: "REG-EM-014", relation: "complements" }]
   - owner_hint: "powertrain_emissions"
   - planning_lead_time_months: 24

9. REG-EM-014 "Euro 7 — Battery Durability"
   - trigger: all, [{ frameworkGroup eq "MN" }, { vehicleCategory in ["M1","N1"] }, { batteryPresent is_true }]
   - fallback: "not_applicable"
   - temporal: applies_to_new_types_from "2026-11-29", notes: "Detailed technical thresholds pending in delegated act [verify Commission adoption]"
   - source: Reg (EU) 2024/1257 + pending delegated act on battery durability
   - obligation_text: "M1/N1 vehicles with traction batteries (BEV, HEV, PHEV) must demonstrate battery durability: SOH ≥ 80% at 5y / 100k km; SOH ≥ 70% at 8y / 160k km. On-board monitoring of SOH per OBM specification."
   - evidence_tasks: ["Battery durability test plan", "SOH measurement methodology", "5y/100k-km and 8y/160k-km durability reports", "OBM SOH data recording"]
   - related_rules: [{ rule_id: "REG-EM-001", relation: "complements" }, { rule_id: "REG-BAT-001", relation: "complements" }]
   - manual_review_reason: "Battery durability delegated act adoption status pending [verify]"
   - owner_hint: "powertrain_emissions"

All 9 rules: set content_provenance: { source_type: "eurlex", retrieved_at: "2026-04-20", human_reviewer: null }
```

- [ ] **Step 2: Review the subagent's output** — check that every rule has content_provenance, the trigger conditions reference the new flags correctly, and no fabricated URLs exist. If URLs are marked [verify], leave them — do not invent.

- [ ] **Step 3: Run `npx tsc --noEmit`** — expect pass. If type errors, fix imports or field shapes.

### Task I.2.4 — UNECE enrichment + R34 enrichment

**Files:**
- Modify: `src/registry/seed/unece-technical.ts`

- [ ] **Step 1: Dispatch subagent** to:

1. Enrich existing REG-UN-034 (fuel tank) — change `triggerRequires` on the uneceRule factory call to include `hasFuelTank`, add authored obligation_text, evidence_tasks.

2. Add 6 new UNECE rules via the factory pattern `uneceRule(...)`:
   - REG-UN-049 (HD exhaust emissions): trigger M2/M3/N2/N3 + hasCombustionEngine
   - REG-UN-067 (LPG fuel system OEM): trigger fuelType eq "lpg"
   - REG-UN-085 (engine power measurement): trigger hasCombustionEngine
   - REG-UN-101 (light-duty CO2 + fuel consumption): trigger M1/N1
   - REG-UN-115 (LPG/CNG retrofit): trigger fuelType in ["lpg","cng"], notes: "Aftermarket retrofit approval — OEM responsibility only if shipping retrofit kits"
   - REG-UN-117 (tyre rolling resistance + noise): trigger frameworkGroup in ["MN","O"]

   Use research findings from Task I.2.1 Agent B for URLs/dates.
   All land as SEED_UNVERIFIED, content_provenance.human_reviewer: null.
   Add prerequisite_standards where relevant:
   - REG-UN-117 → ISO 28580, ISO 10844

- [ ] **Step 2: Run `npx tsc --noEmit`** — expect pass.

### Task I.2.5 — Promote REG-BAT-003 ELV to authored SEED_UNVERIFIED

**Files:**
- Modify: `src/registry/seed/materials-chemicals.ts` (REG-BAT-003 object)

- [ ] **Step 1: Update REG-BAT-003** — change `lifecycle_state` from `"DRAFT"` to `"SEED_UNVERIFIED"`, add authored content per research findings Agent C.

New fields:
```ts
    trigger_logic: {
      mode: "declarative",
      match_mode: "any",
      conditions: [
        { field: "batteryPresent", operator: "is_true", value: true },
        { field: "vehicleCategory", operator: "in", value: ["M1", "N1"] },
      ],
      fallback_if_missing: "not_applicable",
    },
    temporal: {
      entry_into_force: "2000-10-21",
      applies_from_generic: "2000-10-21",
      effective_to: null,
      notes: "Directive 2000/53/EC current; revision into Regulation proposed COM(2023) 451 pending legislative finalisation [verify adoption].",
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      small_volume_derogation_until: null,
    },
    obligation_text:
      "End-of-life vehicles must be taken back by producers at no cost, dismantled with ≥85% reuse/recovery + ≥80% reuse/recycling targets (rising to 95%/85% post-revision). Battery/fuel-tank/HV components disposed per annex. Pending Regulation revision will strengthen circularity requirements.",
    evidence_tasks: [
      "ELV take-back network agreement per MS",
      "Producer-responsibility scheme registration (SIG in ES, ADEME in FR, …)",
      "Dismantling information sheet per 2000/53/EC Art. 8",
      "Recyclate-content declaration (per pending Regulation revision)",
    ],
    content_provenance: {
      source_type: "eurlex",
      retrieved_at: "2026-04-20",
      human_reviewer: null,
    },
```

- [ ] **Step 2: Run `npx tsc --noEmit`** — expect pass.

### Task I.2.6 — I.2 tests + snapshot regen + commit

- [ ] **Step 1: Run tests + regen snapshots**

Run: `npx vitest run -u`
Expected: all green. Governance count will fail — that's expected and fixed in I.6. For I.2 commit, temporarily update governance test count or accept 1 failure:

If governance test fails: update `tests/unit/governance.test.ts` line `expect(report.totalRules).toBe(142)` → `toBe(157)` (142 + 9 emissions + 6 UNECE = 157, R34 enrichment doesn't add a rule, ELV promotion doesn't add a rule).

- [ ] **Step 2: Run `npx tsc --noEmit && npm run lint`** — expect pass.

- [ ] **Step 3: Commit**

```bash
git add src/registry/seed/emissions-co2.ts src/registry/seed/unece-technical.ts src/registry/seed/materials-chemicals.ts tests/unit/__snapshots__/ tests/unit/governance.test.ts docs/superpowers/plans/i2-research-findings.md
git commit -m "$(cat <<'EOF'
feat(phase-i.2): ICE/PHEV emissions rules + UNECE enrichment

Splits Euro 7 (REG-EM-001) into framework (001), combustion path (013), and
battery durability (014). Adds Euro 6 legacy baseline (006), OBD/EOBD (007),
evaporative emissions (008), PHEV CO2 utility factor (009), AdBlue/SCR diesel
NOx (010), CO2 consumer labeling (011), VECTO HD CO2 (012). Enriches UNECE
factory stubs: R34 (authored), adds R49, R67, R85, R101, R115, R117 as
SEED_UNVERIFIED authored. Promotes REG-BAT-003 ELV from DRAFT to authored
SEED_UNVERIFIED.

Registry delta: 157 → 172 rules (+15 net; all new SEED_UNVERIFIED, no
promotions). PHEV pilot snapshot grows materially — intentional (new ICE-side
coverage). Pre-Euro-7 ICE paths now correctly distinguishable from Euro 7 via
temporal.effective_to short-circuit.

All new content_provenance.human_reviewer: null. [verify] markers on battery
durability delegated act (pending) and Commission ELV revision timing.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase I.3 — UK Overlay

### Task I.3.1 — Dispatch UK research agent

- [ ] **Step 1: Dispatch research agent**

Agent prompt:
```
Research and verify 12 UK regulations for a Chinese OEM market-entry compliance
tool. For each, return: legal SI number, primary legislation citation, URL at
legislation.gov.uk or gov.uk, effective dates, 1-sentence summary. Mark anything
not verifiable against official sources as [verify].

Spec in docs/superpowers/specs/2026-04-20-phase-i-breadth-design.md §7:

1. GB Type-Approval (GBTA) + EU-TA provisional recognition — Vehicle Technical
   Regulations 2022/1273 + VSO post-Brexit SIs + DfT guidance on provisional EU-TA.
2. DVLA V5C Registration — Motor Vehicles (Registration and Licensing) Regs
   2002/2742 + Vehicle Excise and Registration Act 1994.
3. MoT Roadworthiness — Road Vehicles (Construction and Use) Regs 1986 +
   Road Vehicles (Testing) Regs 2003/2498.
4. VED — Vehicle Excise and Registration Act 1994 as amended by Finance Act 2025.
5. Motor Insurance — Road Traffic Act 1988 §143-145.
6. London ULEZ — Greater London Low Emission Zone Charging Order 2006 as amended.
7. Regional Clean Air Zones — Environment Act 2021 + local authority CAZ orders.
8. Scotland LEZ — Transport (Scotland) Act 2019 + Glasgow/Edinburgh/Aberdeen/
   Dundee LEZ orders.
9. ZEV Mandate — Vehicle Emissions Trading Schemes Order 2023/1633.
10. Windsor Framework NI Alignment — Windsor Framework (Feb 2023) + Protocol
    on Ireland/NI (TCA).
11. UK GDPR + DPA 2018 — Data Protection Act 2018 c.12 + UK GDPR retained EU
    regulation 2016/679.
12. Public Charge Point Regs — Public Charge Point Regulations 2023/1168.

No fabrication. Return verified URLs.
```

- [ ] **Step 2: Save response to `docs/superpowers/plans/i3-uk-research.md`.**

### Task I.3.2 — Author 12 UK rules

**Files:**
- Modify: `src/registry/seed/non-eu-market.ts` (append to `nonEuMarketRules`)
- Modify: `src/registry/seed/member-state-overlay.ts` (remove UK from factory priorityCountries if listed)

- [ ] **Step 1: Dispatch subagent** to author REG-UK-002 through REG-UK-013 following the pattern of existing REG-UK-001.

Subagent briefing:
```
Append 12 new rules to src/registry/seed/non-eu-market.ts using makeSeedRule
pattern (see REG-UK-001 at top of file as template). Use verified facts from
docs/superpowers/plans/i3-uk-research.md.

All rules share:
- legal_family: "non_eu_market"
- jurisdiction: "UK"
- jurisdiction_level: "NON_EU_MARKET"
- framework_group: ["MN"] (or ["MN","L","O","AGRI"] where universal)
- lifecycle_state: "SEED_UNVERIFIED" or "DRAFT" (per spec §7 table)
- content_provenance: { source_type: "uk_legislation", retrieved_at: "2026-04-20", human_reviewer: null }
- source_family: "UK Parliament" for primary legislation; "Other official" for SIs
- owner_hint: appropriate (homologation, regulatory_affairs, cybersecurity, etc.)
- ui_package: "market_access" unless specifically horizontal
- process_stage: appropriate

Per-rule spec (condensed — full detail in spec §7):

REG-UK-002 GBTA: trigger targetsUK; lifecycle SEED_UNVERIFIED; source VTR 2022/1273
REG-UK-003 DVLA V5C: targetsUK; SEED_UNVERIFIED; Motor Vehicles (Reg+Licensing) 2002/2742
REG-UK-004 MoT: targetsUK; SEED_UNVERIFIED; RV(Testing) Regs 2003/2498; note "first MoT 3y post-reg"
REG-UK-005 VED: targetsUK; SEED_UNVERIFIED; VERA 1994 + FA 2025; note "BEV lost zero-rate 1 Apr 2025"
REG-UK-006 Motor Insurance: targetsUK; SEED_UNVERIFIED; RTA 1988 §143-145
REG-UK-007 London ULEZ: targetsUK; SEED_UNVERIFIED; GLLEZ Charging Order 2006 (as amended 2023)
REG-UK-008 Regional CAZ (England): targetsUK; SEED_UNVERIFIED; Environment Act 2021
REG-UK-009 Scotland LEZ: targetsUK; SEED_UNVERIFIED; Transport (Scotland) Act 2019
REG-UK-010 ZEV Mandate: targetsUK + M1/N1; SEED_UNVERIFIED; VETS Order 2023/1633; obligation is fleet-average, not vehicle-level — note in obligation_text
REG-UK-011 Windsor Framework: targetsUK + dataFlags includes "targets_ni"; DRAFT; Windsor Framework Feb 2023
REG-UK-012 UK GDPR / DPA 2018: targetsUK + (processesPersonalData || hasConnectedServices); SEED_UNVERIFIED; DPA 2018 c.12
REG-UK-013 Public Charge Point Regs: targetsUK + readiness.offersPublicChargingInfra; DRAFT; PCPR 2023/1168

For REG-UK-011: add "targets_ni" to allowed dataFlag values in src/shared/constants.ts
if that enum is strict. Grep for the existing dataFlags enum first.

For REG-UK-013: add offersPublicChargingInfra: boolean to readinessSchema in
src/config/schema.ts (default false in src/config/defaults.ts).

Every rule needs full obligation_text (2-3 sentences grounded in research findings),
evidence_tasks (3-5 items), and related_rules where cross-references apply (e.g.
REG-UK-002 complements REG-TA-001; REG-UK-011 complements REG-TA-001 for NI).
```

- [ ] **Step 2: Check UK is in factory priorityCountries in `src/registry/seed/member-state-overlay.ts`** — if present, remove. Grep for `"UK"` and confirm.

- [ ] **Step 3: Run `npx tsc --noEmit && npm run lint`** — expect pass.

### Task I.3.3 — I.3 tests + commit

- [ ] **Step 1: Regen snapshots + verify tests**

Run: `npx vitest run -u`
If governance count fails: update to 172 + 12 = 184 (minus any UK factory stubs removed — verify count after factory change).

- [ ] **Step 2: Commit**

```bash
git add src/registry/seed/non-eu-market.ts src/registry/seed/member-state-overlay.ts src/config/schema.ts src/config/defaults.ts src/shared/constants.ts tests/unit/__snapshots__/ tests/unit/governance.test.ts docs/superpowers/plans/i3-uk-research.md
git commit -m "feat(phase-i.3): UK non-EU-market overlay — 12 authored rules

Appends REG-UK-002..013 to non-eu-market.ts: GBTA + DVLA V5C + MoT + VED +
motor insurance + London ULEZ + regional CAZ + Scotland LEZ + ZEV mandate +
Windsor Framework NI + UK GDPR + Public Charge Point Regs. Adds two schema
additions: dataFlags value 'targets_ni' + readiness.offersPublicChargingInfra.
UK removed from factory priorityCountries. Existing REG-UK-001 AV Act untouched.

All new SEED_UNVERIFIED or DRAFT. content_provenance.human_reviewer: null
pending human URL verification round.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase I.4 — ES Overlay

### Task I.4.1 — Dispatch ES research agent

- [ ] **Step 1: Dispatch research agent** (same pattern as I.3.1)

Prompt the agent to verify the 13 ES regulations per spec §8:
- RD 2822/1998 (Reglamento General de Vehículos) + Orden INT/2453/2023 for matriculación
- RD 920/2017 for ITV
- RD Legislativo 8/2004 + RD 9/2017 + Ley 5/2024 for seguro
- Ley 38/1992 + RD 1165/1995 + RDL 6/2023 for IEDMT
- RD Legislativo 2/2004 (LRHL) for IVTM
- Ley 7/2021 + RD 1052/2022 for ZBE
- Resolución DGT 13 abril 2016 for Etiqueta Ambiental
- RD 559/2010 + Orden ITC/1644/2011 for Homologación Individual
- RD 750/2010 + Orden IET/2065/2011 for WVTA transposition
- Ley 7/2021 Art. 14 for ZEV phase-out 2035
- Ley 3/2023 de Movilidad Sostenible
- RD 266/2021 + extensions RD 821/2023 for Plan MOVES III
- RD 110/2015 + RD 184/2022 for battery waste management

Verify BOE URLs. Mark thresholds (IEDMT brackets, IVTM rates, MOVES III subsidy) [verify].

Save response to `docs/superpowers/plans/i4-es-research.md`.

### Task I.4.2 — Author/replace 13 ES rules

**Files:**
- Modify: `src/registry/seed/member-state-overlay.ts`

- [ ] **Step 1: Dispatch subagent** to:

1. Find factory-generated REG-MS-ES-001..005 in member-state-overlay.ts — replace with authored versions per spec §8.
2. Append REG-MS-ES-006..013 (8 new).
3. Remove "ES" from factory priorityCountries.

Subagent briefing: use spec §8 table + research findings at `docs/superpowers/plans/i4-es-research.md`.

All rules:
- legal_family: "member_state_overlay"
- jurisdiction: "ES"
- jurisdiction_level: "MEMBER_STATE"
- framework_group: ["MN"] or ["MN","L","O","AGRI"] per rule scope
- lifecycle_state: "SEED_UNVERIFIED" (most) or "DRAFT" (ES-010, 011, 012)
- content_provenance: { source_type: "spanish_legislation", retrieved_at: "2026-04-20", human_reviewer: null }
- source_family: "National legislation" for BOE; "Other official" for DGT resolutions
- trigger: every rule must include `{ field: "targetCountries", operator: "includes", value: "ES" }` as base condition
- `related_rules`: ES-007 gates ES-006 (Etiqueta → ZBE access); ES-004 gates ES-001 (IEDMT at matriculación); ES-013 complements REG-BAT-001; ES-010 complements REG-EM-003

Special:
- ES-008 uses new readiness flag `smallVolumeFlag` — add to readinessSchema.
- ES-007 obligation_text must document Etiqueta classes (0 / ECO / C / B / none) clearly.
- ES-004 IEDMT tariff brackets must use `[verify]` on specific percentages (sliding by autonomous community).

- [ ] **Step 2: Run `npx tsc --noEmit && npm run lint`** — expect pass.

### Task I.4.3 — I.4 tests + commit

- [ ] **Step 1: Regen snapshots**

Run: `npx vitest run -u`
Update governance count per new total.

- [ ] **Step 2: Commit**

```bash
git add src/registry/seed/member-state-overlay.ts src/config/schema.ts src/config/defaults.ts tests/unit/__snapshots__/ tests/unit/governance.test.ts docs/superpowers/plans/i4-es-research.md
git commit -m "feat(phase-i.4): ES member-state overlay — 13 authored rules

Authors REG-MS-ES-001..013: matriculación + ITV + seguro + IEDMT + IVTM + ZBE
+ Etiqueta Ambiental + Homologación Individual + WVTA transposition + ZEV
phase-out 2035 + Ley 3/2023 Movilidad + Plan MOVES III + RD 184/2022 battery
waste. Replaces factory stubs REG-MS-ES-001..005 with authored versions;
removes ES from factory priorityCountries.

Adds readiness.smallVolumeFlag to schema. All new SEED_UNVERIFIED or DRAFT.
content_provenance.human_reviewer: null. [verify] markers on IEDMT brackets
+ MOVES III subsidy levels (autonomous-community variation).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase I.5 — DE + FR Targeted Fill-in

### Task I.5.1 — Author 4 DE + 6 FR additions

**Files:**
- Modify: `src/registry/seed/member-state-overlay.ts`

- [ ] **Step 1: Dispatch subagent** to author:

**DE additions (4 rules — append to existing DE block):**
- REG-MS-DE-006 E-Kennzeichen (EmoG §2-3 + StVZO §23): SEED_UNVERIFIED
- REG-MS-DE-007 AFIR Transposition (Reg (EU) 2023/1804 + LSV revision): DRAFT; readiness flag `offersPublicChargingInfra`
- REG-MS-DE-008 Dienstwagenbesteuerung (EStG §6(1)Nr.4 + §8(2)): SEED_UNVERIFIED; trigger targetCountries includes "DE", salesModel in ["fleet","mixed"]
- REG-MS-DE-009 KBA National TA Authority (KBA-Zuständigkeitsverordnung + StVZO): SEED_UNVERIFIED; trigger targetCountries includes "DE"

**FR additions (6 rules):**
- REG-MS-FR-006 Crit'Air Vignette (Arrêté 21 juin 2016 + CE R318-2): SEED_UNVERIFIED; trigger targetCountries includes "FR"
- REG-MS-FR-007 Prime à la Conversion (Décret 2022-1761 + revisions): DRAFT
- REG-MS-FR-008 TVS → TAVE + TAPVP (CGI Art. 1010 + LF 2025): SEED_UNVERIFIED
- REG-MS-FR-009 TICPE Fuel Tax (CIBS Art. L312-35): SEED_UNVERIFIED; trigger hasCombustionEngine
- REG-MS-FR-010 LOM — Loi d'Orientation des Mobilités (Loi 2019-1428): DRAFT
- REG-MS-FR-011 Malus Masse 2025 (LF 2024 + LF 2025): SEED_UNVERIFIED; trigger targetCountries includes "FR" + vehicleCategory eq "M1"

All: content_provenance.human_reviewer: null. source_family: "National legislation" (legifrance.gouv.fr / gesetze-im-internet.de). URLs verified via existing research findings or [verify] marker.

- [ ] **Step 2: Run `npx tsc --noEmit && npm run lint`** — expect pass.

### Task I.5.2 — I.5 tests + commit

- [ ] **Step 1: Regen snapshots**

Run: `npx vitest run -u`

- [ ] **Step 2: Commit**

```bash
git add src/registry/seed/member-state-overlay.ts tests/unit/__snapshots__/ tests/unit/governance.test.ts
git commit -m "feat(phase-i.5): DE + FR targeted fill-in

DE: REG-MS-DE-006 E-Kennzeichen, -007 AFIR transposition, -008 Dienstwagen-
besteuerung (company-car tax), -009 KBA national TA authority. FR: REG-MS-FR-006
Crit'Air standalone, -007 Prime à la Conversion scrappage, -008 TVS→TAVE+TAPVP
2025 fleet tax, -009 TICPE fuel tax, -010 LOM sustainable mobility, -011 Malus
masse weight tax.

10 new rules, all SEED_UNVERIFIED or DRAFT. content_provenance.human_reviewer:
null.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase I.6 — Fixtures + Tests + Governance + Docs

### Task I.6.1 — Update BEV pilot fixture

**Files:**
- Modify: `fixtures/pilot-my2027-bev.ts`
- Modify: `fixtures/pilot-my2027-bev.expected.ts`

- [ ] **Step 1: Add `fuel: { tankType: "none" }` to pilot-my2027-bev.ts** config block.

- [ ] **Step 2: Expected file update** — the expected `applicable_rule_ids` list grows: add `REG-EM-014` (battery durability for M1 with batteryPresent) — which now triggers even for pure BEV. REG-EM-013 should NOT be in the BEV applicable set. No FR additions here (BEV fixture stays DE-targeted only). Run snapshot test + update `conditional_count_range` if needed.

### Task I.6.2 — Update PHEV pilot fixture

**Files:**
- Modify: `fixtures/pilot-my2028-phev.ts`
- Modify: `fixtures/pilot-my2028-phev.expected.ts`

- [ ] **Step 1: Ensure `fuel: { tankType: "petrol" }` on config.**

- [ ] **Step 2: Add "FR" to `targetCountries`** — currently should be `["DE"]` or similar; make it `["DE","FR"]` to exercise FR overlay.

- [ ] **Step 3: Expected file update** — PHEV applicable set gains REG-EM-007 (OBD), REG-EM-008 (EVAP), REG-EM-009 (PHEV UF), REG-EM-013 (Euro 7 combustion), REG-EM-014 (battery durability), REG-UN-034 (fuel tank), REG-UN-085 (engine power), REG-UN-101 (CO2/FC), plus FR overlay rules that apply. `conditional_count_range: [25, 60]` → `[50, 110]`.

### Task I.6.3 — Create new ICE-ES pilot fixture

**Files:**
- Create: `fixtures/pilot-my2027-ice-m1-es.ts`
- Create: `fixtures/pilot-my2027-ice-m1-es.expected.ts`
- Create: `tests/unit/pilot-ice-es-acceptance.test.ts`

- [ ] **Step 1: Author fixture** — Chery/BYD/Great Wall-style M1 petrol ICE SUV for Spain:

```ts
// fixtures/pilot-my2027-ice-m1-es.ts
import type { VehicleConfig } from "@/config/schema";

export const pilotMy2027IceM1Es: VehicleConfig = {
  projectName: "MY2027 ICE M1 (ES Market Pilot)",
  vehicleCode: "Chinese OEM Petrol SUV",
  targetCountries: ["ES"],
  sopDate: "2027-04-01",
  firstRegistrationDate: "2027-05-01",
  consumerOrFleet: "consumer",
  salesModel: "dealer",
  frameworkGroup: "MN",
  vehicleCategory: "M1",
  bodyType: "suv",
  approvalType: "new_type",
  steeringPosition: "LHD",
  completionState: "complete",
  powertrain: "ICE",
  batteryCapacityBand: null,
  chargingCapability: { ac: false, dc: false, bidirectional: false },
  automationLevel: "basic_adas",
  adasFeatures: ["aeb", "lka", "acc"],
  parkingAutomation: false,
  motorwayAssistant: false,
  systemInitiatedLaneChange: false,
  connectivity: ["telematics", "mobile_app"],
  dataFlags: ["location_tracking"],
  aiLevel: "conventional",
  aiInventoryExists: false,
  fuel: { tankType: "petrol" },
  readiness: {
    csmsAvailable: true,
    sumsAvailable: false,
    dpiaCompleted: false,
    technicalDocStarted: true,
    evidenceOwnerAssigned: true,
    registrationAssumptionsKnown: true,
  },
};
```

- [ ] **Step 2: Author expected snapshot**

```ts
// fixtures/pilot-my2027-ice-m1-es.expected.ts
export const pilotMy2027IceM1EsExpected = {
  applicable_rule_ids: [
    "REG-TA-001", "REG-GSR-001", "REG-CS-001", "REG-CS-002",
    "REG-EM-001", "REG-EM-006", "REG-EM-007", "REG-EM-008", "REG-EM-011",
    "REG-EM-013",
    "REG-UN-010", "REG-UN-013H", "REG-UN-034", "REG-UN-051",
    "REG-UN-079", "REG-UN-083", "REG-UN-085", "REG-UN-094",
    "REG-UN-095", "REG-UN-101", "REG-UN-117",
    "REG-MS-ES-001", "REG-MS-ES-002", "REG-MS-ES-003",
    "REG-MS-ES-004", "REG-MS-ES-005", "REG-MS-ES-006",
    "REG-MS-ES-007", "REG-MS-ES-009", "REG-MS-ES-010",
  ],
  not_applicable_rule_ids: [
    "REG-UN-100", // BEV-only
    "REG-BAT-001", "REG-BAT-004", "REG-BAT-005", "REG-BAT-006",
    "REG-EM-009", // PHEV-only
    "REG-EM-010", // diesel-only
    "REG-EM-014", // battery durability not applicable to pure ICE
    "REG-UK-001", // UK only
    "REG-UK-002", "REG-UK-003", "REG-UK-004", "REG-UK-005",
    "REG-UK-006", "REG-UK-007", "REG-UK-008", "REG-UK-009",
    "REG-UK-010", "REG-UK-012", "REG-UK-013",
    "REG-MS-DE-001", "REG-MS-DE-002", "REG-MS-DE-003", "REG-MS-DE-004", "REG-MS-DE-005",
    "REG-MS-FR-001", "REG-MS-FR-002", "REG-MS-FR-003", "REG-MS-FR-004", "REG-MS-FR-005",
    "REG-MS-NL-001", "REG-MS-NL-002", "REG-MS-NL-003", "REG-MS-NL-004", "REG-MS-NL-005",
  ],
  applicable_count_range: [25, 35],
  conditional_count_range: [30, 80],
};
```

> Exact `applicable_rule_ids` may differ slightly after execution — accept whatever the snapshot test produces as long as it's sensible (ES + EM + UN rules that match the trigger logic). Don't hand-tune against reality; let the test be the source of truth.

- [ ] **Step 3: Author acceptance test**

```ts
// tests/unit/pilot-ice-es-acceptance.test.ts
import { describe, expect, it } from "vitest";
import { evaluateAllRules } from "@/engine/evaluator";
import { buildEngineConfig } from "@/engine/config-builder";
import { allSeedRules } from "@/registry/seed";
import { pilotMy2027IceM1Es } from "../../fixtures/pilot-my2027-ice-m1-es";

describe("pilot MY2027 ICE M1 × ES acceptance", () => {
  it("evaluates against authored ES overlay + ICE emissions rules", () => {
    const engineConfig = buildEngineConfig(pilotMy2027IceM1Es);
    const results = evaluateAllRules(allSeedRules, engineConfig);
    const applicable = results
      .filter((r) => r.applicability === "APPLICABLE")
      .map((r) => r.rule_id)
      .sort();
    expect(applicable).toMatchSnapshot();
  });
});
```

- [ ] **Step 4: Run test — expect first run to create snapshot**

Run: `npx vitest run tests/unit/pilot-ice-es-acceptance.test.ts`
Expected: PASS with snapshot auto-written on first run.

### Task I.6.4 — Update governance + README + docs

**Files:**
- Modify: `tests/unit/governance.test.ts` (final count)
- Modify: `README.md`
- Modify: `docs/USER-GUIDE.md`
- Modify: `docs/USER-GUIDE-EN.md`
- Modify: `docs/rule-authoring-guide.md`
- Create: `docs/adr/ADR-H7-euro-7-rule-split.md`

- [ ] **Step 1: Update governance.test.ts** — set `totalRules` to final count (grep the registry after all prior phases landed to get exact number; expected ~192).

- [ ] **Step 2: Update README.md** — replace rule count (142 → final) + test count (210 → 210 + new config-builder cases + new acceptance = ~217). Bump 5 locations per prior Phase H.6 commit pattern.

- [ ] **Step 3: Add fuelType documentation** — append a section to USER-GUIDE.md (zh) and USER-GUIDE-EN.md under Powertrain section explaining the Fuel Type field and its impact on rule applicability.

- [ ] **Step 4: Update rule-authoring-guide.md** — add the 5 new engine flags (hasCombustionEngine, hasDieselEngine, hasFuelTank, hasOBD, isPlugInHybrid) to the list of available trigger fields.

- [ ] **Step 5: Write ADR-H7**

```markdown
# ADR-H7 — Euro 7 Rule Split into Framework + Combustion + Battery Durability

Status: Accepted
Date: 2026-04-20
Context: Phase I breadth expansion

## Context

Euro 7 Regulation (EU) 2024/1257 applies to all M1/N1 light-duty vehicles but
contains obligations that vary dramatically by powertrain:
- Combustion: exhaust PN10/NOx/HC/CO limits, OBM, OBFCM, extended RDE
- Battery-electric: battery durability (SOH thresholds at 5y/100k + 8y/160k km)
- All powertrains: non-exhaust emissions (tyre/brake particulate from 2028), EVP

Before Phase I, REG-EM-001 mushed these into one rule with mixed evidence_tasks
("Exhaust emission test reports" shown to BEV teams). This silently under-served
PHEV programs (missing ICE-side evidence) and over-served BEV programs (irrelevant
evidence clutter).

## Decision

Split REG-EM-001 into three rules:
- REG-EM-001: Euro 7 framework — applies to all M1/N1, covers EVP + non-exhaust
- REG-EM-013: Euro 7 combustion exhaust + OBFCM — trigger hasCombustionEngine
- REG-EM-014: Euro 7 battery durability — trigger batteryPresent

Rules are linked via related_rules for navigability.

## Consequences

Positive:
- Evidence tasks now match the vehicle's actual scope
- PHEV correctly receives both 013 (combustion) and 014 (battery) — no silent gap
- BEV correctly receives only 001 + 014; does not see 013 exhaust items
- New ICE programs see 001 + 013 without irrelevant battery-durability tasks

Negative:
- Rule count +2 for one regulation (minor navigability cost)
- Human reviewers must verify each rule independently for promotion to ACTIVE

## Alternatives considered

1. Keep single REG-EM-001 with conditional evidence_tasks. Rejected because the
   Rule schema does not support conditional evidence, and tagging evidence with
   `[ICE]` / `[BEV]` prefixes requires user interpretation — not clean.
2. Separate only combustion out (013) and keep battery durability in 001.
   Rejected because the symmetry is useful — both specialized rules are visible
   as distinct Applicable entries in the tool.
```

- [ ] **Step 6: Run all tests**

Run: `npx tsc --noEmit && npm run lint && npx vitest run`
Expected: ALL GREEN.

### Task I.6.5 — Final commit

- [ ] **Step 1: Stage + commit**

```bash
git add fixtures/pilot-my2027-bev.ts fixtures/pilot-my2027-bev.expected.ts fixtures/pilot-my2028-phev.ts fixtures/pilot-my2028-phev.expected.ts fixtures/pilot-my2027-ice-m1-es.ts fixtures/pilot-my2027-ice-m1-es.expected.ts tests/unit/pilot-ice-es-acceptance.test.ts tests/unit/__snapshots__/ tests/unit/governance.test.ts README.md docs/USER-GUIDE.md docs/USER-GUIDE-EN.md docs/rule-authoring-guide.md docs/adr/ADR-H7-euro-7-rule-split.md
git commit -m "$(cat <<'EOF'
feat(phase-i.6): fixtures + tests + governance + docs

New fixture: pilot-my2027-ice-m1-es (Chinese OEM petrol SUV × Spain) —
regression anchor for ICE + ES overlay path. Updates BEV fixture (fuel.tankType:
"none") and PHEV fixture (fuel.tankType: "petrol" + targetCountries ["DE","FR"])
to exercise FR overlay + new ICE-side rules. New acceptance test
pilot-ice-es-acceptance.test.ts.

Governance count updated to final rule total. README stats refreshed. USER-
GUIDE (zh + en) documents the Fuel Type field. rule-authoring-guide.md lists
the 5 new engine flags available to trigger conditions. ADR-H7 records the
Euro 7 rule-split decision.

Phase I complete: BEV + PHEV + ICE × DE / FR / UK / ES at pilot quality.
Human-verification round (SEED_UNVERIFIED → ACTIVE for ~60 new rules) is the
separate follow-up work.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 2: Push to origin**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage check:** Every spec section maps to tasks:
- Spec §5 (I.1 foundation) → Tasks I.1.1–I.1.5 ✓
- Spec §6.1 (emissions rules) → Tasks I.2.2 (refactor) + I.2.3 (9 new) ✓
- Spec §6.2 (UNECE enrichment) → Task I.2.4 ✓
- Spec §6.3 (ELV promotion) → Task I.2.5 ✓
- Spec §6.4 (ISO prerequisites) → embedded in I.2.3 rule specs ✓
- Spec §6.5 (related_rules) → embedded in rule specs ✓
- Spec §7 (UK 12 rules) → Tasks I.3.1–I.3.3 ✓
- Spec §8 (ES 13 rules) → Tasks I.4.1–I.4.3 ✓
- Spec §9 (DE+FR fill-in) → Tasks I.5.1–I.5.2 ✓
- Spec §10 (fixtures + tests + docs) → Tasks I.6.1–I.6.5 ✓
- Spec §11 (anti-hallucination) → enforced via research agent dispatches + [verify] markers ✓
- Spec §12 (anti-regression) → enforced via gated tests per phase ✓

**Placeholder scan:** No "TBD", "fill in later", or vague "add validation" language. Rule content deferred to subagent dispatches but each dispatch has a concrete briefing + source file reference.

**Type consistency:** `hasCombustionEngine`, `hasDieselEngine`, `hasFuelTank`, `hasOBD`, `isPlugInHybrid`, `fuelType` used consistently across config-builder, schema, rule triggers, and tests.

**Risk: Rule count drift.** The exact final count depends on how many UK/ES factory stubs are replaced vs added. After I.3 and I.4 land, run `grep -c "stable_id:" src/registry/seed/*.ts` to get real count, then update governance test in I.6.4. Accept reality over spec estimate.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-phase-i-breadth.md`.**

Two execution options:

**1. Subagent-Driven (recommended for this plan)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Especially valuable here because:
- Research agents + authoring agents can work in parallel
- Each phase is independently reviewable
- Context doesn't bloat across 6 sub-phases

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Acceptable if you want to see every decision inline, but will consume context quickly with 26 tasks + ~60 rule authoring decisions.

**Which approach?**
