# Rule Authoring Guide

## Purpose
This document defines how rules must be authored in this repository.

## Canonical baseline
For the full model, see:
- `docs/phase0/data-model.md`
- `docs/phase0/architecture.md`

## Authoring principles
1. Rules are source-governed.
2. Rules are not legal memos.
3. Declarative trigger logic is the default.
4. Custom evaluators are allowed only for exceptional cases.
5. Non-ACTIVE rules must never return `APPLICABLE`.
6. `PLACEHOLDER` rules must always evaluate to `UNKNOWN`.

## Required rule fields
Every rule must define, at minimum:

- `stable_id`
- `title`
- `short_label`
- `legal_family`
- `jurisdiction`
- `jurisdiction_level`
- `framework_group`
- `lifecycle_state`
- `sources`
- `temporal`
- `trigger_logic`
- `obligation_text`
- `owner_hint`
- `ui_package`
- `process_stage`

## Required source fields
Each `SourceReference` should include:
- `label`
- `source_family`
- `reference`
- `official_url`
- `oj_reference`
- `last_verified_on`

## Lifecycle states
Allowed values:
- `PLACEHOLDER`
- `DRAFT`
- `SEED_UNVERIFIED`
- `ACTIVE`
- `ARCHIVED`

## Trigger logic rules
### Default path
Use declarative trigger logic whenever possible.

### Exception path
Use custom evaluators only when declarative conditions are not enough, for example:
- DCAS `if fitted`
- mixed or derived system logic
- unusually complex temporal or capability interactions

### Engine flags and fields authors may key on

The `EngineConfig` (see `src/config/schema.ts`) exposes both direct user input
fields and derived flags. Rules should prefer derived flags over re-deriving
logic inside trigger conditions. The Phase I breadth expansion added five new
combustion-related derived flags plus the direct `fuelType` field:

| Flag / field | Type | Derived from | Use for |
|---|---|---|---|
| `fuelType` | `"petrol" \| "diesel" \| "lpg" \| "cng" \| "lng" \| "h2" \| "none" \| null` | `fuel.tankType` | Fuel-specific rules (R67 LPG, R110 CNG, R134 H2, petrol-vs-diesel splits) |
| `hasCombustionEngine` | boolean | `powertrain ∈ {ICE, HEV, PHEV}` AND `fuelType ∉ {none, h2}` | Euro 7 combustion path (REG-EM-013), exhaust-emission UNECE (R83, R51 noise) |
| `hasDieselEngine` | boolean | `hasCombustionEngine` AND `fuelType = "diesel"` | Diesel-specific NOx/particulate, R49 HD-diesel, AdBlue / SCR obligations |
| `hasFuelTank` | boolean | `fuelType ∉ {none, null}` | Fuel-tank rules (R34 liquid-fuel tank, R67 LPG tank, R110 CNG tank) |
| `hasOBD` | boolean | `hasCombustionEngine` | OBD/OBFCM reporting obligations |
| `isPlugInHybrid` | boolean | `powertrain = "PHEV"` | PHEV-only rules (utility-factor-weighted CO2, charging-connected emissions) |

#### Example — Euro 7 combustion exhaust rule

```ts
{
  stable_id: "REG-EM-013",
  trigger_logic: {
    mode: "declarative",
    match_mode: "all",
    conditions: [
      { field: "frameworkGroup", operator: "eq", value: "MN" },
      { field: "vehicleCategory", operator: "in", value: ["M1", "N1"] },
      { field: "hasCombustionEngine", operator: "is_true",
        label: "Vehicle has a combustion engine burning a regulated fuel" },
    ],
    fallback_if_missing: "not_applicable",
  },
  // ...
}
```

Prefer `hasCombustionEngine` over expanding `powertrain in [ICE, HEV, PHEV]`
conditions — the derived flag already accounts for edge cases (e.g., H2-ICE
exclusion, BEV + range-extender cases). Rules in the Euro 7 / UNECE-emissions
families should key on these flags, not on `powertrain` directly.

## Authoring flow
1. Create the rule in `DRAFT` or `SEED_UNVERIFIED`.
2. Add source references.
3. Add temporal fields.
4. Add obligation text.
5. Add evidence tasks.
6. Add owner hint.
7. Add trigger logic.
8. Add tests.
9. Promote only after human source verification.

## Promotion rule
A rule may be promoted to `ACTIVE` only if:
- source is authoritative;
- `official_url` is verified;
- `last_verified_on` is filled;
- obligation text is sufficiently grounded;
- trigger logic is reviewable;
- human reviewer approves.

## Minimal authoring expectation
Do not write vague prose such as:
- “probably applies”
- “likely mandatory”
- “roughly from 2026”

Use:
- clear scope
- clear date structure
- clear lifecycle state
- clear source status