# EU Vehicle Compliance Navigator — Data Model

**Version:** Phase 0 Final Baseline  
**Date:** 2026-04-14  
**Author:** © Yanhao FU  

---

## 1. Enumerations

### 1.1 Jurisdiction level

```typescript
type JurisdictionLevel = "EU" | "UNECE" | "MEMBER_STATE" | "NON_EU_MARKET";
```

### 1.2 Vehicle framework group

```typescript
type FrameworkGroup = "MN" | "L" | "O" | "AGRI";

const FRAMEWORK_DEFINITIONS: Record<FrameworkGroup, {
  label: string;
  primary_framework: string;
  categories: string[];
}> = {
  MN: {
    label: "M/N categories (cars, buses, trucks)",
    primary_framework: "Regulation (EU) 2018/858",
    categories: ["M1", "M2", "M3", "N1", "N2", "N3"],
  },
  L: {
    label: "L-category (two/three-wheelers, quadricycles)",
    primary_framework: "Regulation (EU) No 168/2013",
    categories: ["L1e", "L2e", "L3e", "L4e", "L5e", "L6e", "L7e"],
  },
  O: {
    label: "O-category (trailers)",
    primary_framework: "Regulation (EU) 2018/858",
    categories: ["O1", "O2", "O3", "O4"],
  },
  AGRI: {
    label: "Agricultural/forestry vehicles",
    primary_framework: "Regulation (EU) No 167/2013",
    categories: ["T1", "T2", "T3", "T4", "T5", "C", "R", "S"],
  },
};
```

### 1.3 Legal families (13 families — canonical count)

```typescript
type LegalFamily =
  | "vehicle_approval"
  | "general_safety"
  | "unece_technical"
  | "cybersecurity"
  | "dcas_automated"
  | "privacy_connected"
  | "data_access"
  | "ai_governance"
  | "materials_chemicals"
  | "emissions_co2"
  | "consumer_liability"
  | "member_state_overlay"
  | "non_eu_market";
```

### 1.4 UI package (display-only — NOT a legal ontology)

```typescript
type UIPackage =
  | "wvta_core"
  | "market_access"
  | "country_overlay"
  | "horizontal";
```

### 1.5 Process stage

```typescript
type ProcessStage = "pre_ta" | "type_approval" | "sop" | "post_market";
```

### 1.6 Rule lifecycle state

```typescript
type RuleLifecycleState =
  | "PLACEHOLDER"
  | "DRAFT"
  | "SEED_UNVERIFIED"
  | "ACTIVE"
  | "ARCHIVED";
```

### 1.7 Applicability result

```typescript
type ApplicabilityResult =
  | "APPLICABLE"
  | "NOT_APPLICABLE"
  | "CONDITIONAL"
  | "UNKNOWN"
  | "FUTURE";
```

### 1.8 Source family

```typescript
type SourceFamily =
  | "EUR-Lex"
  | "UNECE"
  | "European Commission"
  | "EDPB"
  | "ECHA"
  | "National legislation"
  | "UK Parliament"
  | "Other official";
```

### 1.9 Output kind

```typescript
type OutputKind = "obligation" | "planning_item" | "information";
```

### 1.10 Owner hint (controlled vocabulary)

```typescript
type OwnerHint =
  | "homologation"
  | "safety_engineering"
  | "cybersecurity"
  | "software_ota"
  | "privacy_data_protection"
  | "ai_governance"
  | "sustainability_materials"
  | "legal"
  | "aftersales"
  | "regulatory_affairs"
  | "powertrain_emissions"
  | "connected_services"
  | "other";
```

---

## 2. Source reference

Each rule carries an array of source references. The first entry is the primary authoritative source.

```typescript
interface SourceReference {
  label: string;                    // "Framework regulation", "Delegated act", "Implementing regulation"
  source_family: SourceFamily;
  reference: string;                // "Regulation (EU) 2024/1257"
  official_url: string | null;      // EUR-Lex URL. null = not yet verified. NEVER fabricated.
  oj_reference: string | null;      // "OJ L, 2024/1257, 8 May 2024"
  last_verified_on: string | null;  // ISO date of last human check
}
```

**Integrity constraint for ACTIVE rules:** `sources.length >= 1` AND `sources[0].official_url != null` AND `sources[0].last_verified_on != null`.

---

## 3. Temporal scope

Replaces the single `effective_from` / `effective_to` pair. Supports the automotive phase-in pattern.

```typescript
interface RuleTemporalScope {
  entry_into_force: string | null;
  applies_to_new_types_from: string | null;
  applies_to_all_new_vehicles_from: string | null;
  applies_to_first_registration_from: string | null;
  applies_from_generic: string | null;       // For horizontal regs without TA phase-in
  effective_to: string | null;               // Sunset / repeal date
  small_volume_derogation_until: string | null;
  notes: string | null;
}
```

**Engine logic:** When evaluating dates, the engine selects the relevant field based on `config.approvalType`:
- `new_type` → compare SOP against `applies_to_new_types_from`
- `carry_over` / `facelift` / `major_update` → compare against `applies_to_all_new_vehicles_from`
- If `firstRegistrationDate` is set → also compare against `applies_to_first_registration_from`
- Horizontal regulations → compare against `applies_from_generic`

---

## 4. Trigger logic

Default is declarative (JSON-serializable). Custom evaluator hooks for exceptions only.

### 4.1 Declarative conditions (~80% of rules)

```typescript
interface TriggerCondition {
  field: string;            // EngineConfig field path
  operator:
    | "eq" | "neq"
    | "in" | "not_in"
    | "includes" | "includes_any"
    | "gt" | "gte" | "lt" | "lte"
    | "is_true" | "is_false"
    | "is_null" | "is_not_null";
  value: any;
  label?: string;           // Human-readable description of this condition
}

interface TriggerLogicDeclarative {
  mode: "declarative";
  match_mode: "all" | "any";
  conditions: TriggerCondition[];
  fallback_if_missing: "unknown" | "not_applicable";
  conditional_reason?: string;
}
```

### 4.2 Custom evaluator hooks (~20% of rules)

```typescript
interface TriggerLogicCustom {
  mode: "custom";
  evaluator_id: string;     // Key into customEvaluators registry
  description: string;      // What the custom logic does (human-readable)
}

type TriggerLogic = TriggerLogicDeclarative | TriggerLogicCustom;
```

The engine maintains `customEvaluators: Record<string, (config: EngineConfig) => TriggerResult>`. Custom evaluators are used for rules like DCAS (R171) where "if fitted" logic requires system-level knowledge beyond simple field matching.

---

## 5. Rule schema

```typescript
interface Rule {
  // === Identity ===
  stable_id: string;                  // Immutable. Format: REG-{FAMILY}-{SEQ}
  title: string;
  short_label: string;

  // === Legal classification ===
  legal_family: LegalFamily;
  jurisdiction: string;               // "EU", "UNECE", "DE", "FR", "UK", etc.
  jurisdiction_level: JurisdictionLevel;
  framework_group: FrameworkGroup[];

  // === Source governance ===
  sources: SourceReference[];         // First entry = primary source
  lifecycle_state: RuleLifecycleState;

  // === Scope ===
  vehicle_scope: string;
  applicability_summary: string;
  exclusions: string[];

  // === Trigger logic ===
  trigger_logic: TriggerLogic;

  // === Temporal ===
  temporal: RuleTemporalScope;
  planning_lead_time_months: number | null;

  // === Substance ===
  output_kind: OutputKind;
  obligation_text: string;
  evidence_tasks: string[];
  owner_hint: OwnerHint;
  owner_hint_detail?: string;

  // === Review ===
  manual_review_required: boolean;
  manual_review_reason: string | null;
  notes: string | null;

  // === Display ===
  ui_package: UIPackage;
  process_stage: ProcessStage;

  // === Audit (optional) ===
  created_on?: string;
  created_by?: string;
  promoted_on?: string;
  promoted_by?: string;
  archived_on?: string;
  archived_reason?: string;
}
```

---

## 6. Trigger result

```typescript
interface TriggerResult {
  match: boolean | "conditional";
  reason: string;
  matched_conditions?: string[];
  unmatched_conditions?: string[];
}
```

---

## 7. Evaluation result

```typescript
interface EvaluationResult {
  // Rule identity (copied for result independence)
  rule_id: string;
  title: string;
  short_label: string;
  legal_family: LegalFamily;
  ui_package: UIPackage;
  process_stage: ProcessStage;
  jurisdiction: string;
  jurisdiction_level: JurisdictionLevel;
  sources: SourceReference[];
  lifecycle_state: RuleLifecycleState;

  // Evaluation outcome
  applicability: ApplicabilityResult;
  explanation: string;

  // Explainability payload
  matched_conditions: string[];
  unmatched_conditions: string[];
  missing_inputs: string[];
  trigger_path: string;

  // Substance
  applicability_summary: string;
  obligation_text: string;
  evidence_tasks: string[];
  owner_hint: OwnerHint;
  planning_lead_time_months: number | null;
  exclusions: string[];
  temporal: RuleTemporalScope;

  // Review
  manual_review_required: boolean;
  manual_review_reason: string | null;
  notes: string | null;

  // Date-aware flags (computed by engine)
  is_future_dated: boolean;
  is_date_unknown: boolean;
  months_until_effective: number | null;

  // Hard gate flag (computed by engine)
  was_downgraded_from_applicable: boolean;
}
```

---

## 8. Input model: Vehicle program configuration

```typescript
interface VehicleConfig {
  // A. Program / market
  projectName: string;
  vehicleCode: string;
  targetCountries: string[];
  sopDate: string | null;
  firstRegistrationDate: string | null;   // Strongly recommended input
  consumerOrFleet: "consumer" | "fleet" | "mixed";
  salesModel: "dealer" | "direct" | "leasing" | "subscription" | "mixed";

  // B. Vehicle core
  frameworkGroup: FrameworkGroup | null;
  vehicleCategory: string | null;
  bodyType: string;
  approvalType: "new_type" | "carry_over" | "facelift" | "major_update";
  steeringPosition: "LHD" | "RHD" | "both";
  completionState: "complete" | "incomplete" | "multi_stage";

  // C. Powertrain / battery
  powertrain: "ICE" | "HEV" | "PHEV" | "BEV" | "FCEV" | null;
  batteryCapacityBand: "small" | "medium" | "large" | null;
  chargingCapability: { ac: boolean; dc: boolean; bidirectional: boolean };

  // D. Driving / automation
  automationLevel: "none" | "basic_adas" | "l2" | "l2plus" | "l3" | "l4" | "l4_driverless";
  adasFeatures: string[];
  parkingAutomation: boolean;
  motorwayAssistant: boolean;
  systemInitiatedLaneChange: boolean;

  // E. Connectivity / software
  connectivity: string[];

  // F. Data / privacy
  dataFlags: string[];

  // G. AI
  aiLevel: "none" | "conventional" | "ai_perception" | "ai_dms" | "ai_analytics" | "ai_safety" | "foundation_model";
  aiInventoryExists: boolean;

  // H. Readiness (capability flags, NOT regulations)
  readiness: {
    csmsAvailable: boolean;
    sumsAvailable: boolean;
    dpiaCompleted: boolean;
    technicalDocStarted: boolean;
    evidenceOwnerAssigned: boolean;
    registrationAssumptionsKnown: boolean;
  };
}
```

### 8.1 Engine config (derived)

```typescript
interface EngineConfig {
  // Direct
  frameworkGroup: FrameworkGroup | null;
  vehicleCategory: string | null;
  powertrain: string | null;
  automationLevel: string;
  adasFeatures: string[];
  connectivity: string[];
  dataFlags: string[];
  aiLevel: string;
  targetCountries: string[];
  sopDate: string | null;
  firstRegistrationDate: string | null;
  salesModel: string;
  approvalType: string;

  // Derived flags
  batteryPresent: boolean;
  hasOTA: boolean;
  hasConnectedServices: boolean;
  processesPersonalData: boolean;
  hasAI: boolean;
  hasSafetyRelevantAI: boolean;
  isL3Plus: boolean;
  isDriverless: boolean;
  targetsEU: boolean;
  targetsUK: boolean;
  targetsMemberStates: string[];
  targetsNonEU: string[];

  // Readiness
  readiness: VehicleConfig["readiness"];
}
```

### 8.2 Dependent field logic

| Parent selection | Effect |
|-----------------|--------|
| `frameworkGroup = MN` | Show M1-N3 picker |
| `frameworkGroup = L` | Show L1e-L7e picker |
| `frameworkGroup = O` | Show O1-O4 picker |
| `powertrain ∈ [BEV, PHEV, HEV, FCEV]` | Set `batteryPresent = true`, show capacity band |
| `automationLevel ≥ l2plus` | Show ADAS features, parking/motorway/lane-change |
| `aiLevel ∉ [none, conventional]` | Show AI inventory question |
| `targetCountries includes UK` | Display "UK requires separate regulatory pathway" |

---

## 9. User state

```typescript
interface UserState {
  ruleStatuses: Record<string, "todo" | "in_progress" | "done" | "not_relevant">;
  ruleNotes: Record<string, string>;
  savedConfigs: Array<{ name: string; config: VehicleConfig; savedAt: string }>;
  preferences: {
    viewMode: "business" | "legal" | "process";
    expandedPackages: string[];
    filterApplicability: ApplicabilityResult | "all";
    searchTerm: string;
    showSidebar: boolean;
  };
}
```

---

## 10. Export model

```typescript
interface ExportRow {
  package: string;
  subPackage: string;
  legalTitle: string;
  stableId: string;
  applicability: string;
  reason: string;
  evidence: string;
  owner: OwnerHint;
  gate: string;
  effectiveFromNewTypes: string;
  effectiveFromAllNew: string;
  lifecycleState: string;
  manualReview: string;
  sourceRef: string;
  officialUrl: string;
  jurisdiction: string;
  userStatus: string;
  userNote: string;
}
```

---

## 11. Registry adapter interface

```typescript
interface RegistryAdapter {
  getAllRules(): Promise<Rule[]>;
  getEvaluableRules(): Promise<Rule[]>;  // Excludes PLACEHOLDER, ARCHIVED
  getRuleById(id: string): Promise<Rule | null>;
  getRulesByFamily(family: LegalFamily): Promise<Rule[]>;
  promoteRule(id: string, newState: RuleLifecycleState, by: string): Promise<void>;
  archiveRule(id: string, reason: string, by: string): Promise<void>;
  validateRegistry(): Promise<RegistryValidationReport>;
  getStaleRules(maxAgeDays: number): Promise<Rule[]>;
}

interface RegistryValidationReport {
  totalRules: number;
  byLifecycleState: Record<RuleLifecycleState, number>;
  activeWithoutUrl: Rule[];
  activeWithoutVerification: Rule[];
  staleRules: Rule[];
  orphanedFamilies: string[];
  duplicateIds: string[];
}
```
