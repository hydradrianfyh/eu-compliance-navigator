# Homologation Engineer Handbook

**Version**: Phase L.6 (2026-04-22) · 205 rules / **101 ACTIVE** · 236 tests green
**Audience**: Working-level homologation / regulatory affairs engineers at Chinese OEMs planning EU market entry. **Not for managers.**
**Language**: English companion — Chinese primary at [HOMOLOGATION-HANDBOOK.md](./HOMOLOGATION-HANDBOOK.md)
**Related**: General reference in [USER-GUIDE-EN.md](./USER-GUIDE-EN.md); developer docs in [DEVELOPER.md](./DEVELOPER.md)

---

## Table of contents

- [Part 0 · Before you start (Preflight)](#part-0--before-you-start-preflight)
- [Part 1 · Your first 30 minutes (Quickstart)](#part-1--your-first-30-minutes-quickstart)
- [Part 2 · Reading the Status page](#part-2--reading-the-status-page)
- [Part 3 · Building your compliance plan](#part-3--building-your-compliance-plan)
- [Part 4 · Working through rules (the core)](#part-4--working-through-rules-the-core)
- [Part 5 · Tracking verification coverage](#part-5--tracking-verification-coverage)
- [Part 6 · Common scenarios (walkthroughs)](#part-6--common-scenarios-walkthroughs)
- [Part 7 · Exporting evidence and handoff](#part-7--exporting-evidence-and-handoff)
- [Part 8 · Workflow cadence](#part-8--workflow-cadence)
- [Part 9 · FAQ and troubleshooting](#part-9--faq-and-troubleshooting)

---

## Part 0 · Before you start (Preflight)

### 0.1 Who this manual is for

**Audience**: a working-level **homologation / regulatory affairs engineer** at a Chinese OEM. You are responsible for delivering a specific vehicle program from type-approval application through volume production. You interact daily with TÜV, DEKRA, UTAC, KBA, DGT, DVSA and equivalent technical services and approval authorities.

**Not the target**: senior management, commercial leadership, market strategy. Managers should read [USER-GUIDE-EN.md](./USER-GUIDE-EN.md) preface + Status tab — the top-line verdict is enough for them.

### 0.2 What to have on hand before opening the tool

Assemble this information (paper or spreadsheet) before launching:

| Field | Source | Example |
|---|---|---|
| Project name + internal vehicle code | PM / project charter | `MY2027 BEV Pilot` / `B9-REFRESH` |
| **SOP date** | Production plan | `2027-01-15` |
| First registration date (estimate) | Sales plan | `2027-04-01` |
| **Framework group** + vehicle category | Vehicle classification | `MN` / `M1` |
| **Powertrain** + fuel type (if applicable) | Electrical architecture / powertrain spec | `BEV` · `none`; or `ICE` · `petrol` |
| Battery capacity band (EV/HEV) | Battery spec | `large` (>75 kWh) |
| **Automation level** (SAE) | ADAS spec | `l2plus` (pilot default) |
| ADAS feature list | ADAS spec | `lane_keeping`, `adaptive_cruise`, ... |
| Connectivity | E/E architecture | `telematics`, `mobile_app`, `ota` |
| **Target countries** | Market plan | `["DE", "FR", "NL"]` |
| Sales model + consumer/fleet | Commercial | `dealer`, `consumer` |
| AI level | ADAS / cockpit spec | `ai_perception` |

These inputs determine the rule set the tool gives you. The **day-one pitfall** is getting frameworkGroup / vehicleCategory / approvalType wrong — an incorrect combination misrouts the entire ruleset.

### 0.3 What this tool WILL do for you

1. Auto-list the EU + UNECE + member-state regulations applicable to your configuration.
2. For each **ACTIVE** (verified) rule, surface `obligation_text` (what to do), `evidence_tasks` (deliverables), `official_url` (clickable EUR-Lex / UNECE), and `last_verified_on` (date of last human check).
3. SOP-anchor the task list across six windows: Immediate / Pre-SOP critical / Pre-SOP final / Post-SOP / Later / Unscheduled.
4. Group tasks by owner department (homologation / cybersecurity / privacy / battery / …).
5. Export CSV / JSON / Markdown / Print for internal trackers or audit packs.

### 0.4 What this tool will NOT do

1. **Not legal advice.** The output is a **navigation aid**, never a substitute for lawyers, technical services, or approval authorities.
2. **Not multi-program**. One config per browser session; switch via ⚙ → Load / Reset / Save variant.
3. **No live EUR-Lex sync.** URL verification happens in human review rounds. `last_verified_on` tells you when. New amendments require a new round.
4. **Not universal country coverage.** Production-grade: DE + UK. Partial: ES + FR. Seed-only (authored, unverified): NL. The other 22 EU member states and non-EU markets (CN/US/JP/TR) are **explicitly out of scope**.
5. **Not a substitute for ISO standard compliance** (ISO 26262, ISO/SAE 21434, ISO 21448, ISO 8800). The tool lists **regulations**; the `prerequisite_standards` field flags ISO dependencies but does not evaluate them.

### 0.5 The single most important principle

> **Verified (ACTIVE) rules are safe to act on (still cross-check the official text). Indicative (CONDITIONAL / UNKNOWN) rules are pointers — always cross-check the official text before you commit engineering resources.**

The **hard-gate** mechanism ensures that non-ACTIVE rules **never** return APPLICABLE: even if your config matches every trigger condition, a SEED_UNVERIFIED rule can at best return CONDITIONAL. This is deliberate governance — rules that haven't passed human source verification must not be treated as "definitely required."

---

## Part 1 · Your first 30 minutes (Quickstart)

### 1.1 Launch the tool

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first visit lands on the Setup tab.

### 1.2 Load the sample first

Click the **⚙ gear icon** (top-right) → **"Load MY2027 BEV sample"**. The tool populates the pilot config (MY2027 BEV launching in Germany) and jumps to Status. 30 APPLICABLE rules are generated instantly.

### 1.3 Scan the 5 tabs

| Tab | One-line | Your (homologation) attention |
|---|---|---|
| **Setup** | Enter the vehicle program config | ★★★★★ (day one) |
| **Status** | Top-line market-entry verdict | ★★★ (daily glance) |
| **Plan** | SOP-anchored timeline + owner dashboard | ★★★★★ (weekly/monthly) |
| **Rules** | Per-rule cards (Summary / Why / What to do / Reference / Tracking) | ★★★★★ (main working surface) |
| **Coverage** | Rule governance + verification coverage | ★★ (quarterly) |

### 1.4 Replace the sample with your real program

Return to Setup, fill in order:

1. **Program & Market** — projectName / targetCountries / sopDate.
2. **Homologation Basis** — frameworkGroup (MN/L/O/AGRI) → vehicleCategory (M1/.../N3) → bodyType → **approvalType** (`new_type` vs `carry_over` / `facelift` / `major_update`). **Mis-entering approvalType is the most common mistake**: a facelift marked `new_type` advances regulation applicability by 2 years.
3. **Propulsion & Energy** — powertrain + fuel.tankType + battery band + charging capability.
4. **ADAS & Automated Driving** — automationLevel + ADAS features + motorway assist / parking / system-initiated lane change.
5. **Digital & Cockpit** — connectivity + data flags + AI level.
6. **Readiness** — six self-check boxes (CSMS, SUMS, DPIA, tech docs started, etc.).

For per-field detail see [USER-GUIDE-EN.md Part 2](./USER-GUIDE-EN.md); this handbook does not duplicate that.

### 1.5 Save the config

localStorage auto-saves. For variant analysis (e.g. "what if we add FR?") use ⚙ → **Save variant**. The URL also encodes the config for sharing.

### 1.6 Open Status — exec summary first, then the hero

Post-edit evaluation is automatic. The first block on Status is the K.2 exec summary:

```
Market entry status:  LIKELY OK · 30 applicable · 12 weeks to SOP
Top urgent action: Submit R155 CSMS certificate (due 2026-10-15)
  [See full breakdown ↓]
```

This is the **3-second management block**. As the engineer, you mostly look at the StatusHero + Top blockers + Top deadlines + Countries at risk — that is your working evidence.

---

## Part 2 · Reading the Status page

### 2.1 Exec summary block (management-facing)

- **Market entry status**: 4-tier verdict (see below).
- **X applicable / Y weeks to SOP**: ACTIVE APPLICABLE rule count + SOP countdown.
- **Top urgent action**: highest-priority single task (tool selects by deadline + lifecycle).

Engineer use: upward reporting only. Real work planning happens below.

### 2.2 StatusHero (verdict card)

```
Market entry status:  LIKELY OK
Confidence: Medium
Coverage 82/100  Verified 30  Indicative 8  Pending 12
Generated 2026-04-21 15:30 UTC
```

- **Verdict**: four tiers (next section).
- **Confidence**: Low / Medium / High. Depends on (a) how many target countries are production-grade (DE / UK) vs seed-only (NL), (b) how many rules needed human input to evaluate.
- **Coverage /100**: % of project-relevant rules that are ACTIVE + verified.
- **Verified / Indicative / Pending**: three buckets (ACTIVE / SEED_UNVERIFIED+DRAFT+SHADOW / PLACEHOLDER).

### 2.3 Coverage by target country (K.2)

The middle of Status lists coverage per target country, e.g.:

```
DE — production-grade · 8/8 ACTIVE
UK — production-grade · 11/11 ACTIVE
ES — partial · 7/14 ACTIVE, 7 pending (null_url / draft)
FR — partial · 5/12 ACTIVE, 7 pending
NL — seed-only · 0/5 ACTIVE, 5 pending
```

This is your starting point for **per-country due diligence**. The tool has told you the coverage ceiling; everything pending you verify yourself.

### 2.4 Countries at risk signal

If a target country is seed-only (e.g. NL), Status lists it under Countries at risk. **At-risk ≠ "cannot enter"** — it means the tool only has indicative-level coverage and you cannot treat the output as final.

### 2.5 Engineer action playbook per verdict

The tool gives the verdict and first clue; the decisions are yours.

| Verdict | Tool is saying | Engineer action |
|---|---|---|
| **LIKELY OK** | No blockers; target markets covered; timeline has headroom | Export Plan tab timeline into internal tracker; kick off evidence tasks; watch top 10 deadlines |
| **OK WITH CAVEATS** | OK, but has CONDITIONAL or missing_input issues | Check Top blockers: missing_input → Setup; CONDITIONAL → open the card, read why-indicative, cross-check official text, then register internally regardless of tool verdict |
| **AT RISK** | Blocker: unsupported target country, FUTURE-dated critical rule crossing SOP, or readiness gap | See [Part 6 · Scenario D](#scenario-d-status-shows-at-risk--what-to-do) for the playbook |
| **INDETERMINATE** | Insufficient evidence (usually incomplete Setup) | Go back to Setup; check frameworkGroup / approvalType / sopDate (high-impact fields) |

Engineer mindset: the verdict is a **reference line**. Final market entry depends on the official text you cross-check plus the TÜV / KBA sign-off.

---

## Part 3 · Building your compliance plan

### 3.1 SOP-anchored timeline logic

Plan tab anchors on **sopDate** and places each rule's deadline (`applies_to_new_types_from`, `applies_to_all_new_vehicles_from`, `applies_from_generic`, `applies_to_first_registration_from`) on the axis, classified into six windows:

| Window | Meaning | Engineer action |
|---|---|---|
| ⚠ **Overdue** | Deadline < today | **Escalate immediately**. Either approvalType is wrong or SOP is too soon |
| **Immediate** | Next 3 months | Confirm owner has started this week |
| **Pre-SOP critical** | SOP minus 12–3 months | Most TA-related docs land here; R155/R156 certificates, GSR2 delegated act test reports |
| **Pre-SOP final** | SOP minus 3 months to SOP | Final sprint. Assess whether deliverables can still ship on time; slip may require re-planning SOP |
| **Post-SOP** | SOP + 12 months | Monitoring obligations (post-market surveillance, event data, AI Act next phases) |
| **Later** | Far-future | E.g. AI Act Art 6(1) safety component (2027-08-02), Euro 7 HD (2028-05-29) |
| **Unscheduled** | No hard deadline | Horizontal rules (GDPR, PLD, Data Act) — ongoing obligations |

### 3.2 How engineers use the timeline (back-planning from SOP)

1. Plan tab → scan **Pre-SOP critical** → count rules with hard deadlines.
2. Per rule → read `evidence_tasks`: the deliverables to complete before deadline.
3. Estimate time per task → back-plan → check if you are already late.
4. Examples: R155 CSMS certificate needs ~6 months TÜV review; R157 ALKS test campaign ~12–18 months.

### 3.3 Owner Dashboard — assigning tasks

The right column of Plan groups by `owner_hint`. Twelve buckets:

| owner_hint | Department | Example rules |
|---|---|---|
| `homologation` | Type approval | REG-TA-001 WVTA · REG-UN-100 R100 · ES/FR/DE WVTA transpositions |
| `safety_engineering` | Passive safety + ADAS safety | GSR2 5 delegated acts · REG-AD-001 R157 ALKS · R79 steering |
| `cybersecurity` | Cyber | REG-CS-001 R155 CSMS · REG-CS-003 CRA |
| `software_ota` | Software / OTA | REG-CS-002 R156 SUMS |
| `privacy_data_protection` | Privacy / DPO | REG-PV-001 GDPR · REG-PV-002 ePrivacy |
| `ai_governance` | AI governance | REG-AI-001..004 (AI Act phases) |
| `sustainability_materials` | Materials & circularity | REG-BAT-001 Battery · REACH · ELV |
| `legal` | Legal | REG-CL-001 PLD · REG-CL-002 GPSR · Sale of Goods |
| `aftersales` | Aftersales | UNECE R156 OTA post-market · periodic inspection |
| `regulatory_affairs` | Reg-affairs | AI Act spanning · member-state overlays · UK AV Act |
| `powertrain_emissions` | Powertrain & emissions | REG-EM-001..014 (Euro 7, OBD, EVAP, AdBlue, CO2 fleet, WLTP, RDE) |
| `connected_services` | Connected services | REG-DA-001 Data Act |

**Task assignment flow**:
1. Plan tab → Owner Dashboard shows task count + blocked count per bucket.
2. Click a bucket → full rule list for that department.
3. Sort by deadline ascending; filter to Pre-SOP critical / Immediate.
4. Click "View in Rules tab" on any rule → copy `evidence_tasks` into your department's Jira / Confluence.
5. In-tool My tracking supports todo / in_progress / done, but for large programs use an external tracker (localStorage only, no backend multi-user).

### 3.4 Exporting task lists

**Export** (top-right):
- **CSV** for Excel / Jira CSV import.
- **JSON** for scripted pipelines.
- **Markdown** for Confluence / Notion.
- **Print** for A4 printing (disclaimer auto-included).

All exports include `stable_id`, `obligation_text`, `evidence_tasks`, `owner_hint`, `official_url`, `last_verified_on`, `lifecycle_state` — audit-trail ready.

---

## Part 4 · Working through rules (the core)

This tab is where you spend **the most time**. Read this part thoroughly.

### 4.1 Rule card anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ [Verified] REG-CS-001 · R155 CSMS                  [Applies] │
│ Cybersecurity Management System                              │
│ UNECE · cybersecurity                                        │
│                                                              │
│ Summary ───                                                  │
│ Manufacturer must obtain CSMS certificate and vehicle type-  │
│ approval. CSMS valid max 3 years.                            │
│                                                              │
│ Why it applies ───                                           │
│ ✓ Framework group is MN (matched)                            │
│ ✓ Approval type is new_type (matched)                        │
│                                                              │
│ What to do ───                                               │
│ Required documents: CSMS certificate, Risk assessment, ...   │
│ Required evidence: Pen test report, IR plan, ...             │
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

Field-by-field:

| Field | Source | Engineer use |
|---|---|---|
| **Trust badge** | `lifecycle_state` → UI | **Verified** = ACTIVE (plan work); **Indicative** = SEED_UNVERIFIED/DRAFT/SHADOW (cross-check); **Pending** = PLACEHOLDER (empty) |
| **Applicability badge** | engine `applicability` | **Applies** = act now; **May apply** = condition to verify; **Applies from YYYY** = FUTURE; **Does not apply** = skip (log reason); **Source not verified / Not authored / Missing input** = 3 UNKNOWN sub-states |
| **Lifecycle badge** | raw `lifecycle_state` | For triage: is Indicative actually SEED_UNVERIFIED or DRAFT? |
| **Legal family + Jurisdiction** | `legal_family` + `jurisdiction` + `jurisdiction_level` | Cross-reference: family · level (EU/UNECE/MEMBER_STATE/NON_EU_MARKET) · country |
| **Obligation text** | `obligation_text` | One-paragraph "what you must do" |
| **Required docs + evidence** | `required_documents[]` + `required_evidence[]` + `submission_timing` | **Most used field**: copy directly into department tracker |
| **Sources** | `sources[]`, `sources[0]` is primary | Click `official_url` for EUR-Lex; verify `oj_reference` and `last_verified_on` |
| **Related rules** | `related_rules[]` | Chain relationships: `complements` / `requires` / `conflicts` |
| **Temporal fields** | 4 fields on `temporal` | Next section |
| **Why indicative only (K.0)** | `manual_review_reason` | Every non-ACTIVE card shows this — explains why not yet ACTIVE |

### 4.2 Reading the 4 temporal date fields

A rule's `temporal` has up to 7 date fields; you mostly use these 4:

| Field | Meaning | When used |
|---|---|---|
| `applies_to_new_types_from` | Effective for **new types** (approvalType=new_type) from this date | New-type project |
| `applies_to_all_new_vehicles_from` | Effective for **all new vehicles** (carry-over / facelift / major_update) from this date | Facelift / carry-over |
| `applies_to_first_registration_from` | Based on **first registration date** | Some member-state overlays |
| `applies_from_generic` | Non-TA horizontal regulation effective date | GDPR, PLD, AI Act, Data Act |

**How the engine picks**: based on your `approvalType` and whether `firstRegistrationDate` is set. Horizontal rules use `applies_from_generic`.

**Worked example — GSR2 ISA**:
- `applies_to_new_types_from: 2022-07-06`
- `applies_to_all_new_vehicles_from: 2024-07-07`

SOP 2027-01-15 + new_type → 2022-07 is already past → APPLICABLE.
SOP 2023-06 + carry_over → 2024-07-07 is in the future → FUTURE.
SOP 2023-06 + new_type → 2022-07-06 is already past → APPLICABLE.

### 4.3 Applicability states in depth

```
APPLICABLE       — mandatory, plan the work
CONDITIONAL      — may apply, verify
FUTURE           — will apply, back-plan the deadline
NOT_APPLICABLE   — skip, log reason
UNKNOWN          — cannot evaluate; 3 sub-states:
  · source_not_verified  (lifecycle not ACTIVE, hard-gated)
  · not_authored         (PLACEHOLDER)
  · missing_input        (Setup field missing)
```

| State | Meaning | Action |
|---|---|---|
| **APPLICABLE** | ACTIVE rule + all triggers matched + temporal within SOP | Track immediately; dispatch by `evidence_tasks` |
| **CONDITIONAL** | Some condition unresolved, or hard-gated (SEED_UNVERIFIED regardless of match) | Read why-indicative; if truly applicable, treat as APPLICABLE in your tracker |
| **FUTURE** | Rule valid but applicability date > SOP | Use `months_until_effective`; place in Later or Pre-SOP final |
| **NOT_APPLICABLE** | Trigger doesn't fire (e.g. BEV for Euro 7 ICE) | Skip but **log the reason** in handoff (future scope change may flip it) |
| **UNKNOWN: source_not_verified** | Rule is SEED_UNVERIFIED / DRAFT, not ACTIVE | Treat as "verify yourself"; read `manual_review_reason` |
| **UNKNOWN: not_authored** | PLACEHOLDER (empty shell) | Skip; if your program truly needs this topic, flag to curator |
| **UNKNOWN: missing_input** | Setup missing a required field | Go back to Setup; typical cases: frameworkGroup / powertrain / targetCountries |

### 4.4 Filters and search

Rules tab toolbar:

- **Applicability filter**: Applies / May apply / Future / Does not apply / Missing input / All.
- **Legal family filter**: 13 families, multi-select.
- **Lifecycle filter**: ACTIVE / SEED_UNVERIFIED / DRAFT / SHADOW / PLACEHOLDER.
- **Trust filter**: Verified / Indicative / Pending.
- **Search**: full-text across title / short_label / stable_id / obligation_text.
- **View mode**: Business (by ui_package) / Legal (by legal_family) / Process (by process_stage).

**Common combos**:
- "Show me everything I must do": Applicability=Applies + Trust=Verified.
- "Cybersecurity department tasks": Owner filter=cybersecurity.
- "DE-specific rules": search `REG-MS-DE` or Legal family=member_state_overlay.
- "Indicative rules I need to verify": Applicability=May apply + Trust=Indicative.

### 4.5 Dealing with indicative rules (CONDITIONAL) — standard procedure

Five steps when you hit a CONDITIONAL:

1. **Read the "Why indicative only" callout** (K.0 — present on every non-ACTIVE card). Typical reasons:
   - `"Awaiting EUR-Lex URL verification — CELEX ID pending SPARQL confirmation"`
   - `"KBA architectural split pending — see DE-009 follow-up"`
   - `"Windsor Framework NI provisions staged for 2026-10"`
2. **Open the official source** referenced in `sources[0].reference`. Paste the CELEX ID into EUR-Lex search.
3. **Cross-check** the obligation_text and trigger conditions against the official text. Focus on: scope (does it really cover your vehicle category), temporal dates, exclusions.
4. **Conclude**:
   - Matches → treat as APPLICABLE in your internal tracker regardless of the tool verdict.
   - Doesn't match → record the discrepancy and file an issue for the rules curator.
5. **Record the result** in My tracking as a one-line note (e.g. `"Cross-checked EUR-Lex 2026-05-03, matches. Owned by Cyber Team."`) — useful for later audit.

---

## Part 5 · Tracking verification coverage

The Coverage tab is a **governance view** — the overall registry distribution and verification status.

### 5.1 Coverage metrics (top)

```
Total 196 · Verified 73 (37%) · Indicative 90 (46%) · Pending 33 (17%)
Fresh 52 · Due soon 15 · Overdue 6 · Never verified 90
```

- **Verified 37%** grows with each Phase K+/L+ round.
- **Freshness**: `fresh` (within `review_cadence_days`), `due_soon`, `overdue`, `critically_overdue` (>2× cadence), `never_verified`, `drifted`.

### 5.2 Lifecycle distribution

Pie chart across PLACEHOLDER / DRAFT / SEED_UNVERIFIED / SHADOW / ACTIVE / ARCHIVED. Use it to gauge "how reliable is the rule pool I depend on." If your family (e.g. cybersecurity) is >80% ACTIVE, trust is high.

### 5.3 Freshness distribution

Same 6-bucket distribution. Rising `overdue` counts signal the curator is falling behind — escalate if it affects rules your program depends on.

### 5.4 Domain × Process coverage matrix

Heatmap of 13 legal families × 4 process stages (pre_ta / type_approval / sop / post_market). Greener = better coverage.

Engineer use: identify gap quadrants relevant to your project. E.g. `ai_governance × post_market` amber → AI Act later phases (2027-08-02+) are thinly covered; add human cross-check.

### 5.5 Member-state chips (4-tier coloring)

```
DE [ACTIVE 8 / 10]          production-grade
UK [ACTIVE 11 / 15]         production-grade
ES [ACTIVE 7 / 14]          partial
FR [ACTIVE 5 / 12]          partial
NL [ACTIVE 0 / 5]           seed-only
IT / PL / BE / AT / SE      not authored (out of scope)
```

Tiers: production-grade (≥80% ACTIVE) / partial (30–80%) / seed-only (<30%) / not authored.

### 5.6 Verification queue (K.2 expanded)

The curator's queue. Engineers use it to **preview** which rules the next round will promote from CONDITIONAL to APPLICABLE so you can schedule re-review.

Queue priority: `overdue` first → pilot-fixture impact → `critical` owner_hint → null-URL SEED_UNVERIFIED.

---

## Part 6 · Common scenarios (walkthroughs)

Six scenarios covering your daily work. Each uses a pilot or real variant with specific rule IDs for direct search.

### Scenario A · Launching MY2027 BEV × Germany (fully verified path)

**Config**: `frameworkGroup=MN · vehicleCategory=M1 · powertrain=BEV · fuel.tankType=none · automationLevel=l2plus · targetCountries=["DE"] · sopDate=2027-01-15 · approvalType=new_type`

**Expected**: 30 APPLICABLE (pilot regression anchor).

**Key rules triggered**:
- **EU horizontal ACTIVE**: REG-TA-001 WVTA · REG-GSR-001..006 (framework + 5 delegated acts: ISA/EDR/DMS/AEB/TPMS) · REG-CS-001 R155 CSMS · REG-CS-002 R156 SUMS · REG-AD-002 R171 DCAS (l2plus + motorwayAssistant) · REG-BAT-001 Battery · REG-UN-100 R100 EV Safety · REG-PV-001 GDPR · REG-DA-001 Data Act · REG-AI-004 AI Act Art 6(1) safety component · REG-CL-001 PLD.
- **DE overlay 8 ACTIVE**: REG-MS-DE-001 FZV (registration) · REG-MS-DE-002 §29 StVZO HU/AU (inspection) · REG-MS-DE-003 PflVG (insurance) · REG-MS-DE-004 KraftStG (BEV 10-yr tax break) · REG-MS-DE-005 Umweltzonen · REG-MS-DE-006 E-Kennzeichen · REG-MS-DE-008 Dienstwagensteuer · REG-MS-DE-010 AltfahrzeugV (ELV).

**Engineer actions**:
1. Plan tab → count Pre-SOP critical → back-plan work start dates.
2. Rules tab → dispatch by owner (CSMS → cyber, SUMS → software, Battery → battery team).
3. Per rule click `official_url` to confirm EUR-Lex resolvable; confirm `last_verified_on` within 6 months.
4. Export CSV → import to internal Jira project.
5. **You can rely on all 30 conclusions in this scenario**: all ACTIVE + APPLICABLE, DE production-grade. This is the tool's most robust use case.

**Caveat**: even production-grade output still needs a manual check that EUR-Lex hasn't had a corrigendum in the last 1–2 weeks (no live sync).

### Scenario B · Launching MY2028 PHEV × DE + FR + NL (mixed path)

**Config**: `frameworkGroup=MN · vehicleCategory=M1 · powertrain=PHEV · fuel.tankType=petrol · automationLevel=l2 · targetCountries=["DE","FR","NL"] · sopDate=2028-03-01 · approvalType=new_type`

**Expected**: ~35–40 APPLICABLE (DE 8 + FR 5 + EU horizontal) + 10–15 CONDITIONAL (FR pending 7 + NL seed 5).

**Key triggers**:
- **Euro 7 split (PHEV fires all three)**: REG-EM-001 Euro 7 framework (M1/N1) · REG-EM-013 Euro 7 Combustion + OBFCM · REG-EM-014 Euro 7 Battery Durability. PHEV has both combustion and battery — all three fire. **This is the PHEV signature**.
- **REG-EM-009 PHEV CO2 Utility Factor (R101)** — the central PHEV CO2 math. **Read carefully.** PHEV CO2 declaration depends on UF (utility factor) derived from electric range + charging frequency assumptions. The tool's obligation_text + evidence_tasks are the starting point.
- **REG-EM-007 OBD** + **REG-EM-008 EVAP**: standard for combustion.
- **REG-EM-011 AdBlue/SCR**: diesel-only; PHEV petrol does not fire.
- **DE 8 ACTIVE**: as Scenario A.
- **FR 5 ACTIVE**: REG-MS-FR-001 Carte grise · REG-MS-FR-002 Contrôle technique · REG-MS-FR-003 Assurance RC · REG-MS-FR-005 ZFE-m · REG-MS-FR-006 Crit'Air vignette.
- **FR 7 pending (CONDITIONAL)**: REG-MS-FR-004 Malus/Bonus écologique (PHEV depends on CO2 band) · REG-MS-FR-011 Malus Masse 2025 · others.
- **NL 5 SEED_UNVERIFIED (CONDITIONAL)**: all indicative — you **must** cross-check RDW / Belastingdienst official text.

**Engineer indicative workflow**:
1. For the FR 7 pending: open each `manual_review_reason` — typically "URL verification pending for Service-Public fiche."
2. Go to official source (EUR-Lex / Legifrance / Service-Public.fr) and confirm effective date and calculation method.
3. For Malus/Bonus (FR-004) pay special attention: PHEV tax depends on WLTP CO2 bracket + electric range. Malus is a one-time tax; Bonus is a subsidy (consumer-facing — the OEM provides eligibility documentation).
4. For NL 5 seeds: NL type-approval is administered by RDW. ACTIVE requires Phase L+ authoring + human review. **Do not treat NL tool output as definitive.**

**Verdict**: the tool gives you **reliable coverage** (EU + DE + part of FR) plus **indicative pointers** (rest of FR + all NL) you must cross-check yourself.

### Scenario C · Launching MY2027 ICE M1 petrol SUV × Spain (ICE + partial country coverage)

**Config**: `frameworkGroup=MN · vehicleCategory=M1 · bodyType=suv · powertrain=ICE · fuel.tankType=petrol · automationLevel=basic_adas · targetCountries=["ES"] · sopDate=2026-09-01 · approvalType=new_type`

**Expected**: ~25–30 APPLICABLE + 7–10 CONDITIONAL (ES pending 7).

**BEV vs ICE triggers differ**:

| Dimension | BEV (Scenario A) | ICE petrol (here) |
|---|---|---|
| Euro 7 split | Not triggered (BEV exempt) | REG-EM-001 + REG-EM-013 trigger; REG-EM-014 battery durability does not |
| Euro 6 baseline | Not triggered | **Depends on SOP**: SOP 2026-09-01 is before Euro 7 new-types date 2026-11-29 → Euro 7 is FUTURE → you actually certify to **Euro 6** (REG-EM-005 Euro 6 M1/N1) |
| OBD (REG-EM-007) | Not triggered | Triggered |
| EVAP (REG-EM-008) | Not triggered | Triggered (evaporative emissions — petrol only) |
| AdBlue/SCR (REG-EM-011) | Not triggered | Not triggered (petrol does not need AdBlue; diesel only) |
| R100 EV Safety | Triggered | Not triggered |
| Battery Reg | Triggered | Not triggered (ICE 12V Pb-acid exempt) |
| R51 Noise | Triggered (with BEV AVAS special) | Triggered (standard ICE noise limits) |

**Critical SOP-date trap**: SOP 2026-09-01 is **before** Euro 7 M1/N1 new-types effective date (2026-11-29). This means:
- Euro 7 returns **FUTURE** (not APPLICABLE).
- You actually certify to **Euro 6** (REG-EM-005).
- But: if SOP slips past 2026-11-30, Euro 7 flips to APPLICABLE, and authorization work must be redone.
- **Engineer action**: when Euro 7 shows FUTURE on Plan, verify `applies_to_new_types_from` is well after SOP. If SOP date is volatile, consider a dual-stream certification path in advance.

**ES coverage (scenario-specific)**:
- **ES 9 ACTIVE** (after L.6): REG-MS-ES-001 Matriculación (DGT) · REG-MS-ES-002 ITV (inspection) · REG-MS-ES-003 Seguro Obligatorio · REG-MS-ES-004 IEDMT (registration tax — petrol ICE has CO2-bracket rate) · REG-MS-ES-005 IVTM (municipal vehicle tax) · REG-MS-ES-006 ZBE · REG-MS-ES-007 Etiqueta Ambiental (DGT environmental sticker) · REG-MS-ES-009 WVTA RD 750/2010 · REG-MS-ES-013 Pilas y Acumuladores (RD 106/2008 + RD 710/2015). Remaining REG-MS-ES-008 Homologación Individual still SEED_UNVERIFIED pending Orden ministerial citation.
- **ES 7 pending (CONDITIONAL)**: REG-MS-ES-007 Etiqueta Ambiental (DGT sticker; petrol Euro 6/7 usually ECO or C) · REG-MS-ES-010 ZEV 2040 · REG-MS-ES-012 MOVES III (BEV subsidy, irrelevant for ICE) · others.

**CCAA (autonomous-community) variation alert**: Spain has 17 CCAAs with their own ITV / ZBE implementation details. **The tool provides national-level rules only**. Per-CCAA due diligence is yours (e.g. Madrid Central ZBE vs Barcelona ZBE have distinct entry rules).

**Engineer actions**:
1. Euro 6 vs Euro 7 decision: lock by SOP date.
2. ES 7 pending mostly don't affect ICE (MOVES III and ZEV 2040 are BEV-relevant), but Etiqueta Ambiental matters — petrol Euro 6/7 usually gets class C or ECO.
3. For CCAA variation, ask your Spanish importer/distributor to produce a per-region matrix.

### Scenario D · Status shows AT RISK — what to do

Three common causes. Check each.

#### Cause 1 · Missing Setup inputs

**Symptoms**: Confidence = Low; many rules UNKNOWN: missing_input; Top blockers include "Cannot evaluate without frameworkGroup / powertrain / targetCountries."

**Action**:
1. Go to Setup and check each section header for the green tick.
2. Verify the **9 required fields**: projectName, sopDate, targetCountries, frameworkGroup, vehicleCategory, approvalType, powertrain, automationLevel.
3. On re-save, AT RISK should drop to OK WITH CAVEATS or LIKELY OK.

#### Cause 2 · FUTURE-dated critical rule crossing SOP

**Symptoms**: Timeline "Later" bucket includes important rules (e.g. REG-AI-004 AI Act Art 6(1) at 2027-08-02; if SOP > 2027-08-02 this is in the FUTURE→APPLICABLE transition zone); tool flags a transitional obligation.

**Action**:
1. Clarify pre-/post-effective vehicle state: pre-date vehicles follow the old rule; post-date follow the new.
2. For cross-window production (SOP spans the date), consider a **facelift re-approval strategy**: post-date vehicles may require re-certification.
3. In My tracking, mark todo; deadline = effective date minus 12 months.

#### Cause 3 · Target country is seed-only / not authored

**Symptoms**: Countries at risk lists NL, IT, PL, …; some member-state rules return UNKNOWN: source_not_verified / not_authored.

**Action**:
1. **Fill the gap manually**. Open the national transport authority site (NL: RDW · IT: Motorizzazione · PL: Transportowy Dozór Techniczny).
2. Cover the 5 baseline items: registration pathway · mandatory insurance · periodic inspection · local tax · low-emission zones.
3. Register the out-of-tool rules in My tracking.
4. Propose the country to the curator (see FAQ) for the next authoring phase.

### Scenario E · I added a new target country

**Situation**: Pilot was DE-only; management says "add FR to see what happens."

**Steps**:
1. Setup tab → multi-select FR in targetCountries → save.
2. **Watch the 4 tabs change**:

| Tab | What changes |
|---|---|
| Status | New row in Coverage by target country; "partial"; At-risk list may add "FR 5 ACTIVE / 7 pending" |
| Plan | 5 new FR ACTIVE tasks appear (carte grise / contrôle technique / assurance RC / ZFE-m / Crit'Air) |
| Rules | Search "REG-MS-FR" shows 12 rules |
| Coverage | FR member-state chip updates to middle-tier partial color |

3. **The ScopeBanner reflects coverage tier depth** — tier 2–3 (partial + seed) counts update.
4. If the country is NL / IT / PL / etc. (not authored), Status immediately shows Countries at risk; external due diligence is mandatory.
5. **Report the country need to the curator**: file an issue stating "Pilot X needs IT overlay, SOP date Y"; the curator prioritizes for Phase L+.

### Scenario F · A rule flipped to CONDITIONAL after a config change

**Situation**: A rule that was APPLICABLE is now CONDITIONAL after a Setup edit.

**Common causes**:
1. **approvalType changed**: from new_type to carry_over — temporal field selection changes.
2. **powertrain changed**: BEV → PHEV activates the whole Euro 7 family (adds REG-EM-013 / REG-EM-014), but some derived fields (e.g. `hasDieselEngine`) remain unconfirmed → CONDITIONAL.
3. **targetCountries drops DE**: DE overlay rules become NOT_APPLICABLE (not CONDITIONAL — a hard transition).

**Triage steps**:
1. Open the rule card → **Engineering toggle** → read raw trigger_logic JSON + matched / unmatched conditions.
2. Diff Setup values against trigger requirements; find the mismatching field.
3. Check `missing_inputs`; fill in Setup.
4. If the condition cannot be met (substantive config change), the rule should be NOT_APPLICABLE not CONDITIONAL — verify derived EngineConfig flags (`batteryPresent`, `hasCombustionEngine`, etc.) in Setup.

---

## Part 7 · Exporting evidence and handoff

### 7.1 What exports are available

**Export** menu (top-right):

| Format | Best for |
|---|---|
| **CSV** | Excel / Jira CSV importer / SAP QMS |
| **JSON** | Scripted pipelines, automation |
| **Markdown** | Confluence / Notion / Slack |
| **Print** | A4 printing, disclaimer included, external files to technical services |

Dedicated Sources / Evidence Pack / Assumptions / Change Log tabs were scoped in Phase 12 early drafts but not shipped in the current UI. Evidence aggregation currently uses CSV export + the `evidence_tasks` field.

### 7.2 What a good evidence pack contains

For submission to **KBA (DE) / TÜV / DEKRA / UTAC (FR) / IDIADA (ES) / DVSA (UK)**:

| Item | From tool | Status |
|---|---|---|
| Applicable rule list | Rules tab → CSV export | ✓ |
| Per-rule `stable_id` + `official_url` + `oj_reference` + `last_verified_on` | Sources column | ✓ |
| Per-rule `required_documents[]` | CSV | ✓ |
| Per-rule `required_evidence[]` + `submission_timing` | CSV | ✓ |
| Prerequisite ISO standards (e.g. ISO/SAE 21434, ISO 26262) | `prerequisite_standards` | ✓ |
| Technical documents (test reports, DVP, DPIA) | **External** — produced by each department | Assemble |
| Disclaimer | Auto-attached to exports | ✓ |

Engineering tip: combine the CSV export with department-provided documents into a zipped pack + a README that links each regulation to its evidence files. This is the most TÜV/KBA-friendly first-pass intake format.

### 7.3 Handoff to legal / external counsel

Legal doesn't want a rule list; they want:
- **Obligation text** and **exclusions** (discuss whether to pursue an exclusion path).
- `manual_review_reason` caveats for known ambiguities.
- **Related rules** (`complements` / `requires` / `conflicts`) — legal checks conflicts across rules.
- Specifically: PLD (REG-CL-001) is critical for vehicles with software update / AI systems; bundle related CS / AI rules.

### 7.4 Handoff to external suppliers (Tier 1 / software vendors)

Give suppliers a **trimmed** package:
- Only relevant rules (e.g. cybersecurity supplier gets the R155 / CS family only).
- Don't share the full CSV — filter by family → export.
- Attach SOP + internal deadline so suppliers can back-plan.

---

## Part 8 · Workflow cadence

The tool is not a one-shot audit. It spans the program lifecycle from pre-TA through post-SOP.

### 8.1 Daily (5 min)

- Open Status → glance exec summary: did the verdict change? any new CONDITIONAL?
- If Plan shows a new "Immediate" task → dispatch to the owner.
- Fits alongside morning email.

### 8.2 Weekly (30 min)

- Plan tab → scan timeline front-to-back → update My tracking status per rule (todo → in_progress → done).
- Owner Dashboard → chase blocked owners for progress.
- Scan Coverage → Freshness → any new `overdue`? If it affects a rule you depend on, file an issue to push the next curator round.

### 8.3 Sprint / monthly (2 hours)

- Rules tab → Filter Trust=Indicative → work through them end-to-end. Per rule:
  - Re-cross-check EUR-Lex if needed?
  - Ready for promotion to ACTIVE (trigger curator round review)?
- Diff last month's CSV export vs this month's (git diff or Excel compare) — spot state / content changes.
- Sync with curator: which rules should the next round prioritize?

### 8.4 Quarterly (half day)

- **Full scope review**:
  - Does targetCountries match the current market plan?
  - New frameworkGroup (e.g. adding O for trailer)?
  - New automationLevel?
- Gap-analysis tool output vs internal homologation plan.
- On Coverage tab check member-state chips: are the countries we depend on still well covered? If pilot adds IT / PL etc., file a Phase L+ authoring issue.
- Attend the curator's quarterly review (if scheduled) and share feedback.

---

## Part 9 · FAQ and troubleshooting

### Q1 · The tool says CONDITIONAL but I know the rule applies to my vehicle

**A**: Check `lifecycle_state` first.
- ACTIVE rule returning CONDITIONAL → trigger contains a "may apply" field (e.g. unclear `hasConnectedServices`). Open Engineering toggle, read unmatched_conditions, fix Setup.
- SEED_UNVERIFIED / DRAFT rule → hard-gate: **even with 100% match, the tool only returns CONDITIONAL**. Deliberate governance. Treat as APPLICABLE in your external tracker, but record "tool indicates, manually cross-checked EUR-Lex."

### Q2 · A rule disappeared from Rules tab after a config change

**A**: Not a bug. NOT_APPLICABLE rules are hidden by default. In the Applicability filter, enable "Does not apply" to see it. The trigger no longer matches your config (e.g. ICE → BEV switched off Euro 7 ICE-only rules).

### Q3 · I want to share the result with an external supplier

**A**: Options:
1. **URL share**: Setup tab → top-right **Copy URL** button — the URL encodes your config; the supplier sees the same evaluation (read-only).
2. **CSV / Markdown export** for email.
3. **Filter before export**: narrow by owner or legal_family first, then export. **Do not** send the full CSV externally — it may include unrelated confidential work items.

### Q4 · Rule notes contain a [verify] marker — is it safe to act on?

**A**:
- If the core fields (`obligation_text`, `sources[0].official_url`, `last_verified_on`) are populated and `lifecycle_state` is ACTIVE → [verify] is a minor annotation (typically on a secondary date or source). Act on it, but note the flag.
- If `lifecycle_state` is not ACTIVE → [verify] is a primary signal. Don't act without the §4.5 cross-check procedure.

### Q5 · The tool only covers DE / UK / ES / FR / NL (partial); my program needs IT / PL / BE

**A**:
- The tool explicitly **does not support** IT / PL / BE / AT / SE / CZ / etc. (22 EU member states). Phase L+ plans expansion without a committed timeline.
- Short-term: manual per-country due diligence per country — minimum check: registration authority + ITV/MOT equivalent + mandatory insurance + registration tax + LEZ policy.
- Report the need to the curator: file an issue naming the pilot and SOP date; the curator evaluates Phase L+ prioritization.

### Q6 · My SOP is before Euro 7 effective — Euro 6 or Euro 7?

**A**: Classic transition-window question.
- Euro 7 M1/N1 `applies_to_new_types_from: 2026-11-29`; `applies_to_all_new_vehicles_from: 2027-11-29`.
- SOP 2026-09-01 + new_type → Euro 7 FUTURE (new-types not yet effective) → **certify to Euro 6** (REG-EM-005).
- SOP 2027-06-01 + new_type → Euro 7 APPLICABLE → Euro 7 (REG-EM-001 framework + REG-EM-013 combustion + REG-EM-014 battery durability subset per powertrain).
- SOP spans the window → use MY-split strategy (MY26 Euro 6, MY27+ Euro 7). The tool's FUTURE badge clearly shows `months_until_effective`.

### Q7 · I see a SEED_UNVERIFIED rule — can I help promote it to ACTIVE?

**A**:
- Promotion requires a **human-review round** (see `docs/phase-j/verification-backlog.md`). Governance is mandatory.
- As a user you can **push** by filing an issue with: confirmed `sources[0].official_url`, `oj_reference`, suggested `last_verified_on`. The curator evaluates promotion.
- Merge gate for ACTIVE: Tier-1 source verified + human reviewer signoff + `content_provenance` filled + `promotionLog` entry + all tests green. See `docs/review-checklist.md`.

### Q8 · How do I add a new rule?

**A**: See `docs/rule-authoring-guide.md`. Short form:
1. Assign `stable_id` (e.g. `REG-MS-IT-001`).
2. Start with `lifecycle_state = PLACEHOLDER` or `DRAFT` (never start at ACTIVE).
3. Add via `makeSeedRule` in `src/registry/seed/<family>.ts`.
4. Use declarative trigger_logic (>90% of rules fit).
5. `npx vitest run` green.
6. PR + human review. Promotion to ACTIVE only after reviewer sign-off + `sources[0].official_url` verified.

### Q9 · UK post-Brexit — how does it work?

**A**:
- UK is `jurisdiction_level: NON_EU_MARKET`, separate from EU. Selecting UK in targetCountries triggers 11 ACTIVE UK rules (REG-UK-001..015 family including AV Act 2024, GB Type-Approval, DVLA V5C, MoT, RTA 1988, ULEZ, ZEV Mandate, etc.).
- **Northern Ireland (NI) special case**: REG-UK-011 Windsor Framework — NI stays aligned with EU rules. If you ship into NI, add EU rules on top of GB Type-Approval. The tool handles this as a UK overlay with a ScopeBanner note on NI specificity.

### Q10 · Can I integrate the tool into our QMS / PLM?

**A**:
- Current tool is a standalone Next.js app with localStorage persistence — **no API layer**.
- Unofficial integration paths:
  1. Periodic CSV export → feed QMS / PLM.
  2. Parse JSON export → push to internal data warehouse.
  3. URL query params to auto-generate "rules for config X" (`?config=<encoded>`).
- Roadmap note (see README non-goals): multi-tenant SaaS, SSO/RBAC, backend API, PLM/ERP/QMS integration are **out of scope**. Deep integration requires a custom fork — discuss with the tool maintainer.

---

## Closing

This manual is for the **working-level homologation engineer** whose day is spent with regulation text, official sources, and TÜV / KBA auditors. The tool does not replace your judgment; it organizes the 101 ACTIVE regulations you use daily into a searchable, exportable, SOP-anchored working surface.

**Best way to use this manual**: walk through [Part 1 Quickstart](#part-1--your-first-30-minutes-quickstart) (30 min), then use [Part 6 scenarios](#part-6--common-scenarios-walkthroughs) as a reference during real work. When you start a new program, put the [Part 8 cadence](#part-8--workflow-cadence) into your calendar.

**Escalation order when stuck**: this handbook FAQ → [USER-GUIDE-EN.md](./USER-GUIDE-EN.md) per-field detail → file an issue to the curator.

One last reminder:

> **ACTIVE rules are trustworthy (with a final manual cross-check of the official text); Indicative rules are pointers (verify yourself); Pending is gap coverage (tool doesn't cover — fill it externally). The tool is navigation, not decision.**

Good luck with your program.

© Yanhao FU · 2026
