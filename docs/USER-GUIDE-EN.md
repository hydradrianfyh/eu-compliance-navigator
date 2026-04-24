# EU Compliance Navigator · User Guide (English)

**Version**: Phase M (2026-04-24) · 211 rules / **137 ACTIVE** · 248 tests green
**Pilots in use**: MY2027 BEV × DE · PHEV × DE·FR·NL · ICE × ES
**中文版**: see [USER-GUIDE.md](./USER-GUIDE.md) (deeper per-field reference)

---

## Preface · Who this guide is for

This tool is a **config-driven EU vehicle compliance workbench**. You enter a vehicle-program configuration (category, markets, SOP date, automation level, electrical architecture, ...) and it outputs the list of **EU regulations** that apply, a **timeline**, **owner-grouped tasks**, and **per-rule evidence requirements**.

### Three target users

| Role | Cares about | Primary tab |
|---|---|---|
| 👤 **Homologation / Regulatory lead** | What documents does each rule need? Which technical service? What's my Type-Approval path? | **Rules tab** |
| 👤 **Domain team leader** (cybersecurity / privacy / AI / battery / ADAS) | What does my team owe the program? When is it due? Which rule is the trigger? | **Plan tab** |
| 👤 **Management / decision-maker** | Can this program enter the market? Any blockers? Which countries are at risk? | **Status tab** |

### What this guide is **not**

- Not legal advice — the tool outputs a structured checklist, not a legal opinion.
- Not a complete legal library — 211 seed rules (**137 ACTIVE** after Phase L.1–L.6 + Phase M, including 43 UNECE R-series + 52 EU horizontal + DE/UK/FR/ES overlay) cover the major EU + DE / UK / FR / ES + UNECE frameworks; remaining 74 gaps are explicitly marked non-ACTIVE with a per-rule "why pending" reason.
- Not a universal market tool — currently DE (8 ACTIVE) + UK (14 ACTIVE) + FR (**11 ACTIVE**, production-grade after Phase M.3) + ES (9 ACTIVE); NL is seed-only (0 ACTIVE); 22 other EU member states deferred; non-EU markets (CN/US/JP/TR) unsupported.

### How to read this guide

| I want to… | Jump to |
|---|---|
| See a 3-minute tour | → [Part 1](#part-1--3-minute-quick-start) |
| Fill a real project's config | → [Part 2](#part-2--task-1--configure-a-project-setup-tab) |
| See if the project can enter the market | → [Part 3](#part-3--task-2--assess-market-entry-status-tab) |
| Understand the task timeline | → [Part 4](#part-4--task-3--what-to-do-when-plan-tab) |
| Drill into a specific rule | → [Part 5](#part-5--task-4--rule-detail-rules-tab) |
| See governance and coverage | → [Part 6](#part-6--task-5--governance-and-coverage-coverage-tab) |
| Export to stakeholders | → [Part 7](#part-7--task-6--export-and-share) |
| Unfamiliar terms | → [Appendix B · Glossary](#appendix-b--glossary) |
| Find a specific field | → [Appendix A · Field index](#appendix-a--field-index-alphabetical) |
| See what the tool **does not** do | → [Appendix C · Out of scope](#appendix-c--out-of-scope) |

---

## Part 1 · 3-minute quick start

Follow this to see what the tool gives you on a real pilot (MY2027 BEV launching in Germany).

### 1.1 Open the page and load the sample

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). At the top you'll see the blue **ScopeBanner** with a 4-tier progressive-disclosure grid (refreshed in K.1):

> ✓ Scope: Germany + UK + France + Spain production-grade · Netherlands + others pending · CN/US/JP/customs out of scope

Click the banner's "see full coverage" link to expand the 4 tiers (**production-grade** / **indicative** / **pending authoring** / **out of scope**), each showing rule counts per jurisdiction. This banner tells you **what the tool really covers and what it doesn't pretend to cover**.

First visit lands on **Setup tab** with an Onboarding banner. Click **⚙** → **"Load MY2027 BEV sample"**. The tool fills the pilot config (30 APPLICABLE rules) and takes you to Status.

### 1.2 Status tab verdict

**New in K.2 — management-friendly exec summary at the top**. Before the full StatusHero you'll see a 3-second block:

```
Market entry status:  LIKELY OK · 30 applicable · 12 weeks to SOP
Top urgent action: Submit R155 CSMS certificate (due 2026-10-15)
  [See full breakdown ↓]
```

Below the exec block is the full **verdict card**:

```
Market entry status:  LIKELY OK
Confidence: Medium
Coverage 82/100  Verified 30  Indicative 8  Pending 12
Generated 2026-04-21 15:30 UTC
```

| Verdict | Meaning |
|---|---|
| **LIKELY OK** | Looks OK today, no blocking issues found |
| **OK WITH CAVEATS** | Can proceed but with conditions |
| **AT RISK** | Blocking issues exist |
| **INDETERMINATE** | Not enough data (usually incomplete config) |

Below: **Top blockers** · **Top deadlines** · **Countries at risk**. For **NL** the tool honestly says "seed-only — 5 rules authored but 0 ACTIVE; confirm locally before relying". For **FR** (production-grade after Phase M.3) the tool surfaces the 11 ACTIVE rules and flags the 1 remaining DRAFT (UTAC-CERAM — no JORF designation decree found).

### 1.3 Plan tab · what to do when

Click **Plan** tab. **New in K.2 — exec summary at the top**:

```
SOP: 2027-01-15  ·  12 weeks to go
Immediate: 4 tasks  ·  Pre-SOP critical: 11 tasks  ·  Pre-SOP final: 6 tasks
Top 3 upcoming deadlines:
  · R155 CSMS certificate — 2026-10-15
  · R156 SUMS type-approval — 2026-11-30
  · GSR2 ISA delegated act — 2026-12-15
```

Below: Left: **Timeline** anchored on SOP (Overdue / Immediate / Pre-SOP critical / Pre-SOP final / Post-SOP / Later / Unscheduled). Right: **Owner Dashboard** grouped by domain (cybersecurity / privacy / ADAS / …).

Click a rule deep-link → jumps to Rules tab with the rule auto-expanded.

### 1.4 Rules tab · rule detail

Rules are in three trust layers:

- ✓ **VERIFIED** — source verified, trust it (137 ACTIVE rules after Phase M)
- ⚠ **INDICATIVE** — authored but source not yet verified (SEED_UNVERIFIED / DRAFT / SHADOW)
- ○ **PENDING AUTHORING** — placeholder, not written
- — **NEEDS YOUR INPUT** — your config is missing a required field

**New in K.0**: non-ACTIVE rule cards (Indicative and Pending) display an inline **"Why indicative only"** callout sourced from `manual_review_reason`. This tells you — on every card — *why* the rule isn't production-grade (e.g. "awaiting EUR-Lex URL verification", "KBA architectural split pending — see DE-009 follow-up", "Windsor Framework NI provisions staged for 2026-10").

Expand **REG-CS-001 R155 CSMS** to see 5 sections: Summary / Why it applies / What to do / Reference / My tracking. Top-right toggle: **Plain** (for business) ↔ **Engineering** (for devs).

---

**3 minutes covers the tool's mental model**. Read on for specific tasks.

---

## Part 2 · Task 1 · Configure a project (Setup tab)

### 2.1 When to use this tab

- Evaluating a **new vehicle program** from scratch
- Cloning an **existing config** to explore a variant (Load sample, then tweak)
- A field was wrong and the results look off

Setup is **always the starting point** for compliance analysis. All other tabs derive from Setup inputs.

### 2.2 Required vs optional · completeness bar

```
Setup progress: ████████░░ 5 of 6 sections complete
```

| # | Section | Required fields | Default |
|---|---|---|---|
| 1 | Program & Market | projectName · targetCountries · sopDate | Expanded |
| 2 | Homologation Basis | frameworkGroup · vehicleCategory · approvalType | Expanded |
| 3 | Propulsion & Energy | powertrain | Expanded |
| 4 | ADAS & Automated Driving | automationLevel | Expanded |
| 5 | Digital & Cockpit | (all optional) | Expanded |
| 6 | Readiness | (all optional) | Expanded |
| — | Advanced vehicle systems | (optional specialist fields) | Collapsed |

**Minimum evaluable config**: fill the 9 required fields in §2.3–§2.6 and the tool produces a first-pass result.

### 2.3 Program & Market

"Who, where, when."

#### 2.3.1 `projectName`
- UI: "Project name" · string · **required**
- **Purpose**: Human-readable program name. Shown in Global nav chip, Status bar, URL share.
- **Example**: `MY2027 BEV Pilot` · `NextGen SUV Launch`
- **Pitfall**: Empty string renders as "Untitled program". Does not trigger rules; display-only.

#### 2.3.2 `vehicleCode`
- UI: "Vehicle code" · string · optional
- **Purpose**: Internal code (e.g. VW's `B9`, BMW's `G20`). Identifier for internal tracking.
- **Example**: `PILOT-MY27-BEV`
- **Pitfall**: Don't confuse with projectName (outward-facing vs internal). No rule impact.

#### 2.3.3 `targetCountries`
- UI: "Target countries — EU" + "Non-EU" · string[] · **required**
- Options: EU 27 codes + Non-EU (UK, CH, NO, IS, LI, TR)
- **Purpose**: Markets the vehicle will be sold in. **Primary trigger for member-state overlay rules**.
- **Example**: `["DE", "FR", "NL"]` (pilot)
- **Pitfall & impact**: Selecting FR/NL today surfaces UNKNOWN for all FR/NL rules (not a bug — placeholder overlay). `DE` triggers REG-MS-DE-001..005. Drives `targetsEU` / `targetsUK` / `targetsMemberStates` derived flags.

#### 2.3.4 `sopDate`
- UI: "SOP date" · date (YYYY-MM-DD, nullable) · **required**
- **Purpose**: First production-line-off date. Anchors Plan-tab timeline and determines FUTURE vs CURRENT vs NOT_APPLICABLE.
- **Example**: `2027-01-15` (pilot)
- **Pitfall & impact**: Past date flips the project to "post-market" rules. Null falls back to firstRegistrationDate, then calendar-month timelines. Compares against `applies_to_new_types_from` / `applies_to_all_new_vehicles_from` on every temporal rule.

#### 2.3.5 `firstRegistrationDate`
- UI: "First registration date" · date (nullable) · optional
- **Purpose**: First plate issued. Used by rules with `applies_to_first_registration_from` (some national registrations).
- **Example**: `2027-04-01` (pilot, ~10 weeks after SOP)
- **Pitfall & impact**: Often confused with SOP. Not a substitute. Affects some member-state rules (e.g. FZV).

#### 2.3.6 `consumerOrFleet`
- UI: "Consumer or fleet" · enum (`consumer` / `fleet` / `mixed`) · optional (default `consumer`)
- **Purpose**: End-customer type. Affects consumer-protection rules (PLD) and some tax rules (e.g. BEV private-vehicle 10-year tax exemption in DE).
- **Example**: `consumer` (pilot)
- **Pitfall & impact**: Commercial fleet projects flagged as consumer trigger wrong tax rules.

#### 2.3.7 `salesModel`
- UI: "Sales model" · enum (`dealer` / `direct` / `leasing` / `subscription` / `mixed`) · optional (default `dealer`)
- **Purpose**: Distribution model. Subscription/leasing create ongoing data-processing obligations (GDPR / Data Act).
- **Example**: `dealer` (pilot)
- **Pitfall & impact**: Subscription projects flagged as dealer miss ongoing-data-processing obligations. Affects some PV / DA / CL family conditions.

### 2.4 Homologation Basis

"What vehicle is this, what approval path."

#### 2.4.1 `frameworkGroup`
- UI: "Framework group" · enum · **required**
- Options: `MN` (cars/commercial) · `L` (two-three-wheelers) · `O` (trailers) · `AGRI` (agri/forestry)
- **Purpose**: Determines the **framework regulation**: `MN`→2018/858 (WVTA), `L`→168/2013, `AGRI`→167/2013.
- **Example**: `MN` (pilot)
- **Pitfall & impact**: E-bike projects flagged as `MN` miss the L-category track. `MN` triggers REG-TA-001 WVTA + the full UNECE M/N family.

#### 2.4.2 `vehicleCategory`
- UI: "Vehicle category" · string (depends on frameworkGroup) · **required**
- Options (MN): `M1` · `M2` · `M3` · `N1` · `N2` · `N3`
- **Purpose**: Finer category. Determines the **specific UNECE Annex II row**.
- **Example**: `M1` (pilot, passenger car)
- **Pitfall & impact**: N1 pickups labelled M1, or 7-seat MPVs labelled M2 (should be M1 if <5 t). Rules like R135 / R137 / R141 / R145 are M1-only.

#### 2.4.3 `bodyType`
- UI: "Body type" · enum · optional
- Options: `sedan` · `suv` · `hatchback` · `wagon` · `coupe` · `convertible` · `van` · `pickup` · `bus` · `truck` · `chassis_cab` · `other`
- **Purpose**: Body shape. Affects some passive-safety rules (e.g. convertible side-impact), visibility rules (van blind spot).
- **Example**: `suv` (pilot)
- **Pitfall & impact**: Mostly display today. Future rules may narrow triggers further.

#### 2.4.4 `approvalType`
- UI: "Approval type" · enum · **required**
- Options: `new_type` · `carry_over` · `facelift` · `major_update`
- **Purpose**: New approval vs extending an existing one. Drives **which phase-in date applies**.
- **Example**: `new_type` (pilot)
- **Pitfall & impact**: Facelifts mislabelled `new_type` pull earlier effective dates; fresh types mislabelled `carry_over` miss mandatory GSR2 obligations. Every temporal rule branches on this.

#### 2.4.5 `steeringPosition`
- UI: "Steering position" · enum (`LHD` / `RHD` / `both`) · optional (default `LHD`)
- **Purpose**: LHD for continental EU; RHD for UK/IE/MT/CY.
- **Example**: `LHD` (pilot)
- **Pitfall & impact**: UK project set to LHD misses future RHD-specific rules (currently UK is out of scope, so limited impact).

#### 2.4.6 `completionState`
- UI: "Completion state" · enum (`complete` / `incomplete` / `multi_stage`) · optional (default `complete`)
- **Purpose**: Single-stage vs multi-stage vehicle. Passenger cars are `complete`; truck chassis often `incomplete`.
- **Example**: `complete` (pilot)
- **Pitfall & impact**: Passenger car set to `multi_stage` triggers wrong multi-stage rules.

### 2.5 Propulsion & Energy

"How is this vehicle powered?"

#### 2.5.1 `powertrain`
- UI: "Powertrain" · enum · **required**
- Options: `ICE` · `HEV` · `PHEV` · `BEV` · `FCEV`
- **Purpose**: Core propulsion. Drives many EV-safety, emissions, battery rules.
- **Example**: `BEV` (pilot)
- **Pitfall & impact**: PHEV as HEV misses plug-in-specific rules; BEV as FCEV triggers irrelevant hydrogen rules. BEV sets `batteryPresent=true` → R100, Battery Reg. ICE/HEV/PHEV triggers Euro 7 (BEV exempt). FCEV adds R134 Hydrogen.

#### 2.5.2 `batteryCapacityBand`
- UI: "Battery capacity band" · enum (nullable) · optional (shown only when powertrain has battery)
- Options: `small` (<30 kWh) · `medium` (30-75 kWh) · `large` (>75 kWh)
- **Purpose**: Rough capacity bucket. Affects Battery Regulation thresholds.
- **Example**: `large` (pilot, ~80 kWh)
- **Pitfall & impact**: Known coarse-grained limitation; future work may accept exact kWh.

#### 2.5.3 `chargingCapability`
- UI: "AC charging" / "DC charging" / "Bidirectional" · three booleans · optional (shown only with battery)
- **Purpose**: Charging architecture. Affects R100 charging safety + Battery Reg V2X clauses.
- **Example**: `{ ac: true, dc: true, bidirectional: true }` (pilot)
- **Pitfall & impact**: All false treats EV as range-extender and misses charging rules. Not marking `bidirectional` misses future V2G/V2L obligations.

#### 2.5.4 `fuel.tankType` — Fuel type (Phase I)
- UI: "Fuel type" · enum (nullable) · optional (shown for non-BEV powertrains)
- Options: `petrol` · `diesel` · `lpg` · `cng` · `lng` · `h2` · `none`
- **Purpose**: Precise fuel specification for combustion and hybrid vehicles. Complements `powertrain`: where `powertrain` says *"the vehicle has a combustion engine"*, `fuel.tankType` says *"and it burns petrol (or diesel, etc.)"*. BEV and pure-electric two-wheelers should use `none`.
- **Example**: `petrol` (ICE×ES pilot) · `petrol` (PHEV pilot) · `none` (BEV pilot)
- **Pitfall & impact**: Wrong fuel type can under-trigger diesel-specific OBD/NOx rules (REG-EM-013, R49 HD-diesel, NOx aftertreatment) or over-trigger LPG/CNG-specific R67/R110 conversion rules. Drives the derived flags `hasCombustionEngine`, `hasDieselEngine`, `hasFuelTank`, `hasOBD`, `isPlugInHybrid` used by the Euro 7 rule split (framework REG-EM-001 + combustion REG-EM-013 + battery durability REG-EM-014) and by emissions-family UNECE regulations.

### 2.6 ADAS & Automated Driving

"How self-driving is this vehicle?"

#### 2.6.1 `automationLevel`
- UI: "Automation level" · enum · **required**
- Options: `none` · `basic_adas` · `l2` · `l2plus` · `l3` · `l4` · `l4_driverless`
- **Purpose**: SAE level. Drives DCAS / ALKS rule triggers.
- **Example**: `l2plus` (pilot)
- **Pitfall & impact**: L2 labelled `l3` triggers the full ALKS set (over-triggering); L3 labelled `l2plus` misses required R157 ALKS approval. `l2plus` → REG-AD-002 R171 DCAS. `l3+` → REG-AD-001 R157 ALKS. Drives `isL3Plus` / `isDriverless` flags.

#### 2.6.2 `adasFeatures`
- UI: "ADAS features" (multi) · string[] · optional
- Options: `lane_keeping` · `adaptive_cruise` · `blind_spot` · `cross_traffic` · `traffic_sign` · `night_vision` · `surround_view`
- **Purpose**: Specific ADAS functions equipped.
- **Example**: the six above (pilot)
- **Pitfall & impact**: Missing `lane_keeping` under-triggers R79 sub-tests. Affects GSR2 delegated acts (TSR) + R152 AEB conditions.

#### 2.6.3 `motorwayAssistant`
- UI: "Motorway assistant" · boolean · optional
- **Purpose**: ACC + lane-keeping + auto lane-change combined motorway aid.
- **Example**: `true` (pilot)
- **Pitfall & impact**: Enabled without underlying `lane_keeping` / `adaptive_cruise` is inconsistent. Combined with `l2plus` triggers REG-AD-002 R171 DCAS custom evaluator.

#### 2.6.4 `parkingAutomation`
- UI: "Parking automation" · boolean · optional
- **Purpose**: APA / Remote Parking / Home-zone auto-park.
- **Example**: `false` (pilot)
- **Pitfall & impact**: Affects R79 self-parking sub-tests + data-flow implications (remote parking = off-board control → data-protection rules).

#### 2.6.5 `systemInitiatedLaneChange`
- UI: "System-initiated lane change" · boolean · optional
- **Purpose**: Vehicle autonomously changes lane (no driver turn-signal). R157 ALKS Amendment 2 feature.
- **Example**: `false` (pilot, L2+ without active lane change)
- **Pitfall & impact**: L2+ with this = true is inconsistent (active lane change is an L3 feature). Drives specific R157 clauses.

### 2.7 Digital & Cockpit

"Digital capability, data flows, AI." **This section concentrates the SDV-related rule triggers.**

#### 2.7.1 `connectivity`
- UI: "Connectivity" (multi) · string[] · optional
- Options: `telematics` · `mobile_app` · `remote_control` · `ota`
- **Purpose**: Connection stack. Any selection → `hasConnectedServices=true`; `ota` → `hasOTA=true`.
- **Example**: all four (pilot)
- **Pitfall & impact**: `ota` without `readiness.sumsAvailable=true` → R156 SUMS cannot promote. Any selection triggers REG-CS-001 R155 CSMS. `ota` triggers REG-CS-002 R156 SUMS. Overall triggers REG-DA-001 Data Act.

#### 2.7.2 `dataFlags`
- UI: "Data processing flags" (multi) · string[] · optional
- Options: `cabin_camera` · `driver_profiling` · `biometric_data` · `location_tracking`
- **Purpose**: Types of personal data the vehicle processes.
- **Example**: all four (pilot)
- **Pitfall & impact**: `biometric_data` without `readiness.dpiaCompleted=true` → GDPR Art. 35 not met. Any selection → `processesPersonalData=true` → REG-PV-001 GDPR. `cabin_camera` + `biometric_data` triggers AI Act Art. 5 boundary check (prohibited real-time remote biometric ID).

#### 2.7.3 `aiLevel`
- UI: "AI level" · enum · optional (default `none`)
- Options: `none` · `conventional` · `ai_perception` · `ai_dms` · `ai_analytics` · `ai_safety` · `foundation_model`
- **Purpose**: Highest AI usage level. Drives **AI Act applicability**.
- **Example**: `ai_dms` (pilot — AI-driven Driver Monitoring)
- **Pitfall & impact**: `ai_dms` flagged `conventional` misses AI Act Art. 4 literacy; `ai_safety` flagged `ai_perception` misses high-risk conformity assessment. `ai_dms/ai_perception/ai_safety` → `hasAI=true` → REG-AI-001. `ai_dms/ai_safety` → `hasSafetyRelevantAI=true` → REG-AI-004 Art. 6(1).

#### 2.7.4 `aiInventoryExists`
- UI: "AI inventory exists" · boolean · optional
- **Purpose**: Has the project established an internal AI system inventory (for AI Act governance).
- **Example**: `true` (pilot)
- **Pitfall & impact**: `aiLevel=ai_safety` with inventory=false flags Risk Management System gap. Affects evidence requirements on REG-AI-001 / REG-AI-004.

### 2.8 Readiness

"Not describing the vehicle — describing project organizational readiness." All optional but significantly impact assessment.

| Field | Meaning | Impacts |
|---|---|---|
| `csmsAvailable` | R155 CSMS certification in place | REG-CS-001 blocker if false |
| `sumsAvailable` | R156 Software Update MS in place (required when OTA) | REG-CS-002 blocker if false |
| `dpiaCompleted` | GDPR Art. 35 Data Protection Impact Assessment done | REG-PV-001 readiness check |
| `technicalDocStarted` | WVTA Annex I technical file underway | REG-TA-001 readiness check |
| `evidenceOwnerAssigned` | Responsible person assigned per rule | Owner Dashboard usability |
| `registrationAssumptionsKnown` | Registration-path assumptions explicit | Status-tab confidence |

pilot: all true.

### 2.9 Advanced vehicle systems (collapsed)

Default collapsed. 6 sub-sections, all optional. Business users can skip; only homologation engineers need these.

- **Braking** · `type` (`conventional` / `regen` / `mixed` — pilot: `regen`), `absFitted`, `espFitted`
- **Steering** · `type` (`mechanical` / `electric` / `steer_by_wire` — pilot: `electric`), `eps`
- **Cabin** · `airbagCount` (pilot: `8`), `isofixAnchors`, `seatbeltReminder`
- **Lighting** · `headlampType` (`halogen` / `led` / `matrix_led` — pilot: `matrix_led`), `avas` (pilot: `true`, required for BEV)
- **Fuel** · `tankType` (`petrol` / `diesel` / `lpg` / `cng` / `lng` / `h2` / `none` — pilot: `none`)
- **HMI** · `touchscreenPrimary`, `voiceControl`

Each sub-field triggers specific UNECE technical rules (R13H / R79 / R43 / R16 / R48 / AVAS / R138). Leaving them unfilled only misses Annex II details (most still placeholder anyway).

### 2.10 Setup progress bar

6 primary sections counted (Advanced not counted). "Complete" = all required fields non-empty. Click a section header to see what's missing. **Recommended**: reach 6/6 before switching tabs.

### 2.11 Load sample

**⚙** → **Load MY2027 BEV sample**. First-time demo, standard config for regression, baseline of the 248 tests (`pilot-acceptance.test.ts`).

**Caveat**: Load sample **overwrites** current config. If filling your own project, **⚙** → **Clear saved state** first to back up (actually exports JSON), then load.

---

## Part 3 · Task 2 · Assess market entry (Status tab)

Management's primary tab.

### 3.0 Exec summary block (K.2 addition · management-friendly)

At the very top of Status, **above** the StatusHero, is a compact exec block that answers in **3 seconds**:

```
Market entry status:  LIKELY OK  ·  30 applicable  ·  12 weeks to SOP
Top urgent action: Submit R155 CSMS certificate (due 2026-10-15)
  [See full breakdown ↓]
```

Read this when you only have 30 seconds in a standup or an exec conversation. The `[See full breakdown]` link scrolls to the full hero card + metrics below. This is the piece meant for VPs and program managers who don't need the 4-metric reconciliation.

### 3.1 Four verdicts · LIKELY OK / OK WITH CAVEATS / AT RISK / INDETERMINATE

Hero card (below the exec block):

```
Market entry status:  LIKELY OK
Confidence: Medium
```

| Verdict | Condition |
|---|---|
| **LIKELY OK** | `canEnterMarket=true` + `confidence=high` |
| **OK WITH CAVEATS** | `canEnterMarket=true` + `confidence=medium/low` |
| **AT RISK** | `canEnterMarket=false` + `confidence=high` |
| **INDETERMINATE** | `canEnterMarket=false` + `confidence=low` |

**"Can enter market" definition**: no high-severity blockers + every target-country overlay has at least one ACTIVE rule.

**Descriptive, not legal**: tool avoids "YES"/"NO" because it has no legal authority. Any go/no-go decision must be signed off by legal counsel and homologation partner.

### 3.2 Confidence

- **High**: ≥60% of in-scope rules are Verified
- **Medium**: 25-60%
- **Low**: <25% or config incomplete

"In-scope" = Verified + Indicative + Pending authoring.

### 3.3 Four metric cards

| Metric | Meaning |
|---|---|
| **Coverage score** | 0-100 composite (verified × weight / total) |
| **Verified applicable** | ACTIVE + APPLICABLE count |
| **Indicative applicable** | SEED_UNVERIFIED/DRAFT/SHADOW + APPLICABLE-or-CONDITIONAL |
| **Pending authoring** | In-scope but PLACEHOLDER count |

Each card shows a **reconciliation sub-line** ("17 / of 18 ACTIVE in registry") so Status and Coverage tabs reconcile (Sprint 2 UX-002 fix).

### 3.4 Top blockers

Up to 5 blocking rules: severity (HIGH/MED/LOW) · title+short_label · reason · owner. Each is a deep-link to Rules tab.

**Severity**:
- **HIGH** = ACTIVE + third_party_verification_required + missing evidence + deadline ≤ 6mo
- **MED** = ACTIVE + APPLICABLE + deadline ≤ 12mo
- **LOW** = other

### 3.5 Top deadlines

Up to 10 rules nearest deadline, ascending:
- Past → "14 months overdue" (red). Never negative numbers (Sprint 1 UX-001 fix).
- Future → "in 7 months"
- This month → "this month"

### 3.6 Countries at risk

Post-Phase-M state (137 ACTIVE across all jurisdictions):

- `DE` ✓ (8 ACTIVE overlays) — not listed as at-risk
- `UK` ✓ (14 ACTIVE overlays after Phase M.4, incl. AV Act 2024, Windsor Framework NI, Public Charge Point Regs, UK REACH) — treated as production-grade non-EU market; UK-015 ETS road-transport scope remains DRAFT
- `FR` 🟢 (11 ACTIVE + 1 DRAFT after Phase M.3) — production-grade; UTAC-CERAM designation stays DRAFT (no JORF designation decree found)
- `ES` 🟢 (9 ACTIVE + 5 indicative) — listed; Homologación Individual + ZEV 2040 + MOVES III remain at current lifecycle by design
- `NL` ⚠ (0 ACTIVE, 5 SEED_UNVERIFIED) — "seed-only: 5 rules authored, 0 verified; confirm locally"
- Other EU states (IT/PL/BE/AT/SE/CZ/…) — out of scope, flagged as such

Each at-risk entry includes **reason** — not just "has issues" but why.

### 3.7 Generated at timestamp

`Generated 2026-04-19 15:30 UTC` is **this evaluation's** timestamp. Every config change re-computes. Timestamp older than your last edit → refresh browser.

---

## Part 4 · Task 3 · What to do when (Plan tab)

Team leader's primary tab.

### 4.0 Plan exec summary (K.2 addition)

Above the timeline, K.2 adds a compact summary block:

```
SOP: 2027-01-15  ·  12 weeks to go  ·  42 tasks total
Immediate (next 3mo): 4     Pre-SOP critical (−12mo→−3mo): 11
Pre-SOP final (−3mo→SOP): 6 Post-SOP: 8   Later: 13

Top 3 upcoming deadlines:
  · 2026-10-15 — R155 CSMS certificate
  · 2026-11-30 — R156 SUMS type-approval
  · 2026-12-15 — GSR2 ISA delegated act
```

This gives a team leader or program manager a "do I need to worry?" answer in 5 seconds, before drilling into the full timeline + Owner Dashboard below.

### 4.1 SOP-anchored segments

| Segment | Window | Default |
|---|---|---|
| ⚠ Overdue | deadline < today | Expanded (red) |
| Immediate | today → +3 months | Expanded |
| Pre-SOP critical | SOP−12mo → SOP−3mo | Expanded |
| Pre-SOP final | SOP−3mo → SOP | Expanded |
| Post-SOP | SOP → SOP+12mo | Collapsed |
| Later | > SOP+12mo | Collapsed |
| Unscheduled | no date | Collapsed (count shown) |

**Fallback**: SOP null → use firstRegistrationDate → else calendar months.

### 4.2 Three columns per milestone

Each month in a segment is a milestone with:
- **Deadline rules** — hard deadlines this month
- **Evidence due** — documents due this month
- **Review due** — rules due for human review (freshness expiring)

Empty columns show "—".

### 4.3 Owner Dashboard

Grouped by `owner_hint`. Top 3 buckets expanded, rest collapsed. Bucket header shows four badges (Applicable/Conditional/Unknown/Blocked counts).

**Empty buckets auto-hidden** (pre-Sprint 8 showed all 11 owners including 8 with zero tasks).

### 4.4 Blocked definition

A rule is **blocked** iff:
- `applicability === APPLICABLE`
- `third_party_verification_required === true`
- `required_documents` is empty/unfilled

Meaning: applicable, requires third-party certification (TÜV/DEKRA/UTAC), but documents not ready.

### 4.5 Rule deep-linking

Every rule in Timeline or Owner Dashboard is a deep-link. Clicking `REG-CS-001 R155` navigates to `/rules?rule=REG-CS-001` with auto-expand.

---

## Part 5 · Task 4 · Rule detail (Rules tab)

Homologation lead's primary tab.

### 5.1 Trust tri-layer + input layer

| Segment | Icon | Meaning | Default |
|---|---|---|---|
| Verified | ✓ | ACTIVE + verified source — trust it (73 rules in current registry) | Expanded |
| Indicative | ⚠ | SEED_UNVERIFIED / DRAFT / SHADOW — authored but source unverified (90 rules) | Expanded |
| Pending authoring | ○ | PLACEHOLDER — not written (33 rules) | Collapsed (count shown) |
| Needs your input | — | UNKNOWN due to missing config field | Expanded (if non-empty) |

Each header shows rule count + hint, e.g. "✓ VERIFIED (30 applicable) — You can rely on these".

#### 5.1.1 "Why indicative only" callout (K.0 addition · inline on every non-ACTIVE card)

Every **Indicative** and **Pending** rule card surfaces the `manual_review_reason` as a highlighted callout **inside** the card header. This means you no longer need to open a separate Coverage-tab queue to learn *why* a rule hasn't been promoted. Examples of real callouts you'll see:

- "Awaiting EUR-Lex URL verification — CELEX ID pending SPARQL confirmation."
- "KBA architectural split pending — see DE-009 follow-up."
- "Windsor Framework NI provisions staged for 2026-10; Public Charge Point Regulations staging parallel."
- "OJ reference located; last_verified_on pending reviewer sign-off."

If a rule shows **Indicative** but you don't see a reason, that's a bug — open an issue.

### 5.2 FilterBar

| Filter | Options |
|---|---|
| Search | Free-text (rule ID / title / legal_family / explanation) |
| Applicability | All / Applies / May apply / Applies from / Does not apply / Unknown |
| Freshness | All / Fresh / Due soon / Overdue / Critical / Never verified / Drifted |

**Example**: see all truly applicable cybersecurity rules → search "cyber" + Applicability=Applies.

### 5.3 Inside RuleCardV2

Each rule is a collapsible card. Expanded has 5 sections.

#### 5.3.1 Summary

One paragraph: what the regulation is, why it's relevant.

**Example** (REG-CS-001 R155 CSMS):
> UNECE R155 mandates a Cybersecurity Management System (CSMS) certificate for vehicle type-approval. Applies to M/N categories from 2022-07-06 (new types) / 2024-07-07 (all new vehicles).

#### 5.3.2 Why it applies

Matched trigger conditions, each with ✓:

```
✓ Framework group is MN
✓ Vehicle category is one of M1..N3
✓ Connected services present
```

**Plain mode** (default): natural language, no field codes.
**Engineering mode**: raw `trigger_logic` JSON + matched/unmatched conditions.

Toggle in the card header.

**Needs-your-input handling** (§5.5): if a required field is missing:

```
⚠ Missing input: automationLevel (needed to evaluate R171 DCAS trigger)
[Go to Setup and fill this field →]
```

#### 5.3.3 What to do

- **Required documents** (N) — list
- **Required evidence** (M) — list
- **Submission timing** — when to submit
- **Prerequisite standards** — e.g. ISO/SAE 21434 for R155

**Example** (REG-CS-001):
```
Required documents (4):
 · CSMS certificate application
 · CSMS process documentation
 · Vehicle type cybersecurity assessment
 · Threat Analysis and Risk Assessment (TARA)
```

#### 5.3.4 Reference

Source authority:

```
UNECE Regulation No. 155 (Revision 5)
Source: UNECE (official)
Last verified by yanhao on 2026-04-16
Review cadence: 180 days
[Open on UNECE ↗]

Prerequisite standards: ISO/SAE 21434
Related: REG-CS-002 (complements), REG-AD-001 (requires)
```

**Provenance line** (`Source: X · Reviewed by Y · Retrieved YYYY-MM-DD`) was added in Sprint 3. **Every ACTIVE rule has it**. Missing provenance on an ACTIVE rule is a bug — open an issue.

**Related deep-links**: click `REG-CS-002` to jump to that card.

#### 5.3.5 My tracking

Your **project-local** tracking:
- **Status**: todo / in_progress / done
- **Note**: free text

Per-rule, persisted in localStorage across sessions.

### 5.4 Plain ↔ Engineering toggle

| Mode | For whom | Shows |
|---|---|---|
| **Plain** | Business, management, reviewers | Natural language, ✓ icons, curated text |
| **Engineering** | Engineers, debug | Raw JSON, matched/unmatched conditions, missing inputs |

Default Plain. Engineering requires manual click (raw data not exposed by default).

### 5.5 Handling "Needs your input"

When the config is missing a trigger field, the tool **does not silently UNKNOWN**. Instead:
1. Rule lands in "Needs your input" segment
2. Why-it-applies highlights missing field
3. Deep-link "Go to Setup and fill this field →"

Clicking navigates back to Setup with the field highlighted for 30 seconds.

### 5.6 `related_rules` deep-links

Every rule's Reference may list related rules, 4 relations:
- **requires** — this rule's applicability presupposes another
- **complements** — works together
- **supersedes** — replaces an older rule
- **conflicts** — contradicts (human judgment needed)

**Example**: R155 shows "Related: REG-CS-002 (complements), REG-AD-001 (requires)". Click REG-AD-001 to jump to R157 ALKS card immediately. This makes "R155 is a prerequisite for ALKS" visible without a Confluence page.

### 5.7 Prerequisite standards

Rules may depend on ISO standards:

| Rule | Typical prerequisites |
|---|---|
| R155 CSMS | ISO/SAE 21434 |
| R157 ALKS | ISO 26262 + ISO 21448 |
| PLD 2024 | ISO 26262 + ISO/SAE 21434 |
| AI Act Art. 6(1) | ISO 8800 (drafting) |

**Tool only shows the dependency — it does not verify ISO compliance**. ISO standards layer is out of scope (Phase 14+).

---

## Part 6 · Task 5 · Governance and coverage (Coverage tab)

For compliance reviewers or tool maintainers. Business users rarely need this.

### 6.1 Lifecycle distribution

All 211 rules by lifecycle. Current snapshot (post Phase M):

```
ACTIVE           137
SEED_UNVERIFIED   30
DRAFT             11
SHADOW             0
PLACEHOLDER       33
ARCHIVED           0
```

### 6.2 Freshness distribution

Only ACTIVE rules (freshness applies only to ACTIVE). Fresh / Due soon / Overdue / Critical / Never verified / Drifted.

### 6.3 Domain × Process coverage matrix

20-row (domain) × 4-column (process stage) grid. Empty cells = domain gap.

Filters: Process stage, Gap cause (all / no_rules / placeholder_only / source_unverified).

### 6.4 Member-state chips (refreshed in K.1)

Aligned with the 4-tier ScopeBanner:

- 🟢 **DE (8 ACTIVE + 2 indicative)** — Production-grade guidance available
- 🟢 **UK (14 ACTIVE + 1 DRAFT)** — Production-grade non-EU market overlay (Phase M.4 added Windsor Framework NI + Public Charge Point Regs + UK REACH); UK-015 ETS road scope remains DRAFT
- 🟢 **FR (11 ACTIVE + 1 DRAFT)** — Production-grade (Phase M.3 promoted 5 → 11: Crit'Air / TVS→TAVE-TAPVP / TICPE / LOM / Malus masse / Prime à la conversion terminated marker); UTAC-CERAM stays DRAFT (no JORF designation decree found)
- 🟢 **ES (9 ACTIVE + 5 indicative/DRAFT/PLACEHOLDER)** — Production-grade (L.6 promoted Etiqueta Ambiental + RD 106/2008); Homologación Individual, ZEV 2040, MOVES III kept at current lifecycle by design
- 🟠 **NL (0 ACTIVE, 5 SEED_UNVERIFIED)** — Seed-only — authored but not yet verified; authoring batch deferred to Phase N+
- 🟠 **IT / PL / BE / AT / SE / CZ (5 PLACEHOLDER each)** — Placeholder — scope gap, verify locally

### 6.5 Verification Queue

All `SEED_UNVERIFIED` rules (including ACTIVE rules downgraded by governance). Each shows missing source fields (official_url / oj_reference / last_verified_on). Reviewers fill in-place.

### 6.6 Promotion Log

Audit trail: who, when, from which state, promoted which rule to ACTIVE.

---

## Part 7 · Task 6 · Export and share

### 7.1 URL sharing

Every config change auto-syncs to URL query string (`?sopDate=2027-01-15&frameworkGroup=MN&...`). Share the URL → colleague sees **identical** evaluation (prereq: they run the tool locally).

### 7.2 JSON / CSV export

Results panel (Rules tab) bottom: **Export JSON** / **Export CSV** buttons.

- **JSON** = full config + full evaluation result + user notes/status
- **CSV** = flattened rule list (rule_id, applicability, explanation, …), Excel-friendly

**Limit**: localStorage holds one project. Multiple projects → export JSON separately.

### 7.3 Export as PDF

Browser Print (Ctrl+P / Cmd+P) → "Save as PDF". Each tab has print CSS:

- Setup → project config summary PDF
- Status → management dashboard PDF
- Plan → timeline + owner tasks PDF
- Rules → applicable rules + detail PDF
- Coverage → governance report PDF

**5 PDFs combined = complete stakeholder demo pack**.

### 7.4 Sharing with stakeholders

| Stakeholder | Send |
|---|---|
| Management | Status tab PDF (≤3 pages) |
| Homologation lead | Rules tab PDF (filter as needed) + Reference links |
| Team leader | Plan tab PDF + domain-bucket screenshot |
| External counsel / TÜV | JSON export (structured raw) + Status tab PDF |

---

## Part 8 · FAQ

### 8.1 What does "UNKNOWN" mean?

UNKNOWN is one engine state but UI splits it:

| Sub-state | UI wording | Action |
|---|---|---|
| `not_authored` | "Not authored yet" | Wait for Phase 13+ or contribute via `content/authoring.csv` |
| `source_not_verified` | "Source not verified" | Reviewer fills source fields via Coverage tab Verification Queue |
| `missing_input` | "Missing project input" | Return to Setup and fill the missing field |

### 8.2 What about "Source not verified"?

Governance detected the rule claims ACTIVE but has incomplete source fields (missing official_url / oj_reference / last_verified_on).

**Fix**:
1. Coverage tab → Verification Queue
2. Find the rule
3. Fill missing source fields (requires manual EUR-Lex / UNECE lookup)
4. Reviewer clicks Promote → ACTIVE

### 8.3 Why does my rule say "Applies from 2027-08-02"?

Rule is **future-active** (FUTURE). E.g. AI Act Art. 6(1) Automotive starts applying 2027-08-02.

If your SOP is after that date, rule flips to APPLICABLE. Before, doesn't trigger.

### 8.4 What does the ScopeBanner's tiered-coverage grid show?

The banner (refreshed in K.1) has 4 tiers — click to expand:

1. **Production-grade** — DE (8 ACTIVE) + UK (14 ACTIVE) + FR (11 ACTIVE) + ES (9 ACTIVE) + EU horizontal (52 ACTIVE) + UNECE (43 ACTIVE). Trust these.
2. **Indicative** — ES remaining 5 (Homologación Individual, ZEV 2040, MOVES III, Movilidad Sostenible, CCAA variation) + FR 1 DRAFT (UTAC-CERAM) + UK 1 DRAFT (ETS road scope) + DE 2 indicative. Use with the per-rule "why pending" reason on each card.
3. **Seed-only / Pending** — NL (5 SEED_UNVERIFIED, 0 ACTIVE). Not yet verified.
4. **Out of scope** — IT / PL / BE / AT / SE / CZ (placeholder), plus CN / US / JP / TR / customs / CBAM / HS / ISO standards.

**Selecting NL as target does not pretend coverage** — Status "Countries at risk" lists it and the rule cards themselves show "why indicative only".

**Phase N+ fills NL ACTIVE content.**

### 8.5 When does "Drifted" freshness appear?

`.github/workflows/drift-alert.yml` detects EUR-Lex / UNECE source metadata changes (OJ reference changed, effective date changed) on ACTIVE rules. Affected rule's freshness becomes `drifted`.

**Drifted means**: source updated, tool not yet synced. Reviewer should inspect the change and update rule content.

### 8.6 What's "SHADOW" lifecycle?

Sprint 7 addition — **4-week gray-release state**. New rules default to SHADOW for 4 weeks:
- Evaluated by engine
- Shown in Indicative (not promoted to Verified)
- After 4 weeks with no issue → promote to SEED_UNVERIFIED or ACTIVE

**Business users seeing SHADOW rules usually needn't worry** — they surface in the Indicative layer.

---

## Part 9 · Three stakeholder daily paths

### 9.1 Homologation lead (5 min)

See: [docs/phase12/demo-scripts/homologation-5min.md](./phase12/demo-scripts/homologation-5min.md)

Core path:
1. `/rules?rule=REG-TA-001` → WVTA card 5 documents
2. Filter=Applicable → full current rule list
3. Expand R155 → Plain / Engineering toggle
4. GSR-002..006 → phase-in dates
5. PLD → provenance chain

### 9.2 Team leader (5 min)

See: [docs/phase12/demo-scripts/team-leader-5min.md](./phase12/demo-scripts/team-leader-5min.md)

Core path:
1. `/plan` → Owner Dashboard find own domain
2. Click R155 → Rules tab required docs
3. Click related → R157 dependency
4. Back to Plan → Pre-SOP critical/final cadence
5. Status tab quick scan overdue

### 9.3 Management (3 min)

See: [docs/phase12/demo-scripts/management-3min.md](./phase12/demo-scripts/management-3min.md)

Core path:
1. `/status` → verdict + confidence
2. 4 metric cards → overall
3. Top blockers + deadlines → urgency
4. Countries at risk → honest coverage

---

## Appendix A · Field index (alphabetical)

Cross-reference to the detailed explanations in Part 2.

| Field | Setup section | See |
|---|---|---|
| `adasFeatures` | ADAS & Automated Driving | §2.6.2 |
| `aiInventoryExists` | Digital & Cockpit | §2.7.4 |
| `aiLevel` | Digital & Cockpit | §2.7.3 |
| `approvalType` | Homologation Basis | §2.4.4 |
| `automationLevel` | ADAS & Automated Driving | §2.6.1 |
| `batteryCapacityBand` | Propulsion & Energy | §2.5.2 |
| `bodyType` | Homologation Basis | §2.4.3 |
| `braking.*` | Advanced | §2.9 |
| `cabin.*` | Advanced | §2.9 |
| `chargingCapability.*` | Propulsion & Energy | §2.5.3 |
| `completionState` | Homologation Basis | §2.4.6 |
| `connectivity` | Digital & Cockpit | §2.7.1 |
| `consumerOrFleet` | Program & Market | §2.3.6 |
| `dataFlags` | Digital & Cockpit | §2.7.2 |
| `firstRegistrationDate` | Program & Market | §2.3.5 |
| `frameworkGroup` | Homologation Basis | §2.4.1 |
| `fuel.tankType` | Advanced | §2.9 |
| `hmi.*` | Advanced / Digital & Cockpit | §2.9 |
| `lighting.*` | Advanced / ADAS | §2.9 |
| `motorwayAssistant` | ADAS & Automated Driving | §2.6.3 |
| `parkingAutomation` | ADAS & Automated Driving | §2.6.4 |
| `powertrain` | Propulsion & Energy | §2.5.1 |
| `projectName` | Program & Market | §2.3.1 |
| `readiness.*` | Readiness | §2.8 |
| `salesModel` | Program & Market | §2.3.7 |
| `sopDate` | Program & Market | §2.3.4 |
| `steering.*` | Advanced | §2.9 |
| `steeringPosition` | Homologation Basis | §2.4.5 |
| `systemInitiatedLaneChange` | ADAS & Automated Driving | §2.6.5 |
| `targetCountries` | Program & Market | §2.3.3 |
| `vehicleCategory` | Homologation Basis | §2.4.2 |
| `vehicleCode` | Program & Market | §2.3.2 |

---

## Appendix B · Glossary

Aligned with the in-UI GlossaryModal (⚙ menu → Open glossary).

### B.1 Trust levels (left badge on rule cards)

| Badge | Meaning |
|---|---|
| ✓ Verified | Rule is ACTIVE and its primary source (EUR-Lex / UNECE) is reviewer-verified. Safe to act on. |
| ⚠ Indicative | Rule is authored but source not yet verified. Use as a pointer; always confirm with the official text before acting. |
| ○ Pending | Placeholder — rule listed but not written. Treat as coverage gap. |

### B.2 Applicability (badge next to trust)

| Badge | Meaning |
|---|---|
| ● Applies | All trigger conditions match. Rule applies. |
| ◐ May apply | Some conditions match, others depend on inputs not yet finalised. |
| ◷ Applies from {date} | Future-active. Plan work backwards from that date. |
| — Does not apply | Conditions don't match. Skip. |
| ? Not authored yet | Placeholder, no content. Cannot evaluate. |
| ? Source not verified | Marked ACTIVE but source missing/stale. Reviewer must re-verify. |
| ? Missing project input | Engine needs a field you haven't filled yet. |

### B.3 Source freshness

| Badge | Meaning |
|---|---|
| ✓ Fresh | Reviewed within cadence. No action. |
| ⏱ Review due soon | Within last 20% of cadence window. Schedule review. |
| ⚠ Overdue | Cadence exceeded. Re-verify before relying. |
| ✕ Critically overdue | Severely overdue — should not rely until re-verified. |
| ○ Never verified | No human review record. |
| Drifted | Source metadata changed; review needed. |

### B.4 Member-state overlay status (Coverage tab chips · refreshed K.1)

| Status | Wording | Examples |
|---|---|---|
| 🟢 Production-grade | "Production-grade guidance available" | DE (8 ACTIVE), UK (14 ACTIVE), FR (11 ACTIVE), ES (9 ACTIVE) |
| 🟡 Partial | "Partial — some ACTIVE, remaining pending verification" | (Phase M closed the FR partial gap; no country currently sits in this tier by default, but the tier remains for future member-state additions) |
| 🟠 Seed-only | "Seed-only — authored but 0 verified; confirm locally" | NL (0 ACTIVE / 5 SEED_UNVERIFIED) |
| 🟠 Placeholder | "Placeholder — scope gap, verify locally" | IT / PL / BE / AT / SE / CZ |

### B.5 Rule lifecycle (Coverage tab; business users usually don't need this)

| State | Meaning |
|---|---|
| `ACTIVE` | Rule authored and primary source complete (official_url + oj_reference + last_verified_on) |
| `SEED_UNVERIFIED` | Authored but source fields incomplete, or downgraded from ACTIVE by governance gate |
| `DRAFT` | Being drafted; may have gaps |
| `SHADOW` | New rule in 4-week gray release; capped at CONDITIONAL; shown as Indicative |
| `PLACEHOLDER` | Stub entry, tracked for coverage but no content |
| `ARCHIVED` | Retired, no longer evaluates |

Every non-ACTIVE rule carries a `manual_review_reason` field (surfaced inline on the rule card since K.0) explaining *why* the rule hasn't been promoted. Typical values: "Awaiting EUR-Lex URL verification", "Pending OJ reference", "KBA architectural split — see follow-up", "Authored; last_verified_on pending reviewer sign-off".

---

## Appendix C · Out of scope

**This tool is Phase 12 Path B DE-demo-first workbench**. The following are **explicitly out of scope** — not bugs, design decisions. All 13 non-goals (see [docs/phase12/ux-refactor-spec-v2.md](./phase12/ux-refactor-spec-v2.md)):

| # | Non-goal | Plain meaning |
|---|---|---|
| 1 | Multi-tenant SaaS | Single-machine tool. Your data is in your browser. |
| 2 | SSO / RBAC / audit log / SOC 2 | No enterprise identity. No login, no role permissions. |
| 3 | PLM / ERP / QMS / Jira integration | No Teamcenter / 3DEXPERIENCE / SAP / Salesforce / Jira. Only JSON / CSV export. |
| 4 | Supplier portal | No separate Tier-1 / Tier-2 entry point. |
| 5 | Sign-off workflow | Tool is not a legal signatory. Sign-offs by counsel + homologation partner. |
| 6 | Variant × market four-layer model | Single project config only. Base / + AD pack / + sport variants out of scope this phase. |
| 7 | CBAM / HS / RoO / FTA / ISO standards | Carbon Border, HS codes, Rules of Origin, FTAs, ISO layer — all Phase 14+. |
| 8 | Panoramic "find gaps" KPI | Success = 3 stakeholders walk their 5-min paths. Not exhaustive coverage. |
| 9 | RegPulse-Agent feeder | Tool is a final product, not upstream for any downstream agent. |
| 10 | Backend server | No backend. All localStorage. |
| 11 | 27-country content expansion | DE + UK + FR + ES (all production-grade after Phase M). NL seed-only; 22 other EU states placeholder. |
| 12 | Early code extraction | Sprint 9 spike identifies reusable seams only — no monorepo / core-layer split. |
| 13 | Related_rules dependency graph UI | related_rules is a data field; no visualization. |

**If you need any of the above**, this isn't the wrong tool per se, but you need a different one (SAP RCS / Siemens Teamcenter / Dassault 3DEXPERIENCE / ComplianceQuest) or wait for Phase 13+ / 14+.

---

## Finally · Feedback and contribution

- **UI bug**: anything outside UX-001..006 in [ux-refactor-spec-v2.md](./phase12/ux-refactor-spec-v2.md) is new — open an issue
- **Rule content error**: see [AUTHORING.md](./AUTHORING.md) — fix via the CSV DSL
- **Doc unclear**: open an issue noting which section / which field explanation is insufficient
- **Want a new feature**: check [Appendix C](#appendix-c--out-of-scope) first; if not in non-goals, open discussion

---

© Yanhao FU · 2026
