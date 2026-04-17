# EU Vehicle Compliance Navigator — Seed Rule Candidate List

**Version:** Phase 0 Final Baseline  
**Date:** 2026-04-14  
**Author:** © Yanhao FU  

---

## Conventions

- **lifecycle_state** uses only the canonical enum: PLACEHOLDER / DRAFT / SEED_UNVERIFIED / ACTIVE / ARCHIVED.
- Rules marked ACTIVE have verified OJ references and known dates. Their `sources[0].official_url` must be confirmed against EUR-Lex at implementation time; until then, `manual_review_required` remains `true` with reason "EUR-Lex URL verification pending."
- `trigger_logic` uses declarative mode by default. Custom evaluator mode only where documented.
- `OwnerHint` uses the controlled vocabulary enum.
- Temporal fields use `RuleTemporalScope`. Horizontal regulations use `applies_from_generic`. Type-approval regulations use `applies_to_new_types_from` / `applies_to_all_new_vehicles_from`.

Abbreviated notation: only fields that differ from defaults or carry substantive content are shown per rule. Full schema per final data model.

---

## 1. Vehicle Approval Core (`vehicle_approval`)

### REG-TA-001 — EU WVTA Framework (M/N/O)

| Field | Value |
|-------|-------|
| stable_id | REG-TA-001 |
| title | EU Whole Vehicle Type-Approval Framework |
| short_label | WVTA (2018/858) |
| legal_family | vehicle_approval |
| ui_package | wvta_core |
| process_stage | type_approval |
| jurisdiction / level | EU / EU |
| framework_group | [MN, O] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ label: "Framework regulation", source_family: "EUR-Lex", reference: "Regulation (EU) 2018/858", oj_reference: "OJ L 151, 14.6.2018" }] |
| temporal | entry_into_force: 2018-09-01, applies_to_new_types_from: 2020-09-01, applies_to_all_new_vehicles_from: 2022-09-01 |
| trigger_logic | declarative, match_mode: "any", conditions: [{ field: "frameworkGroup", operator: "in", value: ["MN","O"] }], fallback_if_missing: "unknown" |
| obligation_text | Motor vehicles (M, N) and their trailers (O) placed on the EU market require whole vehicle type-approval under this framework regulation. |
| evidence_tasks | [Type-approval application, Technical documentation package, Certificate of Conformity (CoC), Test reports from designated technical service] |
| owner_hint | homologation |
| planning_lead_time_months | 24 |
| manual_review_required | true |
| manual_review_reason | EUR-Lex URL verification pending at implementation. |

### REG-TA-002 — L-category Framework

| Field | Value |
|-------|-------|
| stable_id | REG-TA-002 |
| title | L-category Vehicle Type-Approval Framework |
| short_label | L-cat (168/2013) |
| framework_group | [L] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) No 168/2013", oj_reference: "OJ L 60, 2.3.2013" }] |
| temporal | entry_into_force: 2013-03-22, applies_to_new_types_from: 2016-01-01 |
| trigger_logic | declarative, conditions: [{ field: "frameworkGroup", operator: "eq", value: "L" }] |
| obligation_text | L-category vehicles require type-approval under Regulation (EU) No 168/2013, separate from the M/N/O framework. |
| owner_hint | homologation |

### REG-TA-003 — Agricultural/Forestry Framework

| Field | Value |
|-------|-------|
| stable_id | REG-TA-003 |
| **lifecycle_state** | **PLACEHOLDER** |
| sources | [{ reference: "Regulation (EU) No 167/2013" }] |
| obligation_text | PLACEHOLDER — details not yet authored. |
| owner_hint | homologation |

---

## 2. General Safety (`general_safety`)

### REG-GSR-001 — GSR2 Framework

| Field | Value |
|-------|-------|
| stable_id | REG-GSR-001 |
| title | General Safety Regulation 2 |
| short_label | GSR2 (2019/2144) |
| framework_group | [MN] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) 2019/2144", oj_reference: "OJ L 325, 16.12.2019" }] |
| temporal | entry_into_force: 2020-01-05, applies_to_new_types_from: 2022-07-06, applies_to_all_new_vehicles_from: 2024-07-07, notes: "Individual features have different phase-in per their delegated acts." |
| trigger_logic | declarative, conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }] |
| obligation_text | Mandates advanced safety features for M and N category vehicles. Specific system requirements are in delegated acts with individual phase-in dates. |
| owner_hint | safety_engineering |

### REG-GSR-002 through REG-GSR-006 — Individual GSR2 features

Five rules, one per mandatory system: ISA (002), EDR (003), DMS/DDW (004), AEB (005), TPMS (006).

| Field | Pattern for all |
|-------|----------------|
| **lifecycle_state** | **SEED_UNVERIFIED** |
| trigger_logic | declarative, conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }] |
| temporal | Per-feature dates from specific delegated acts — to be verified individually |
| manual_review_reason | Exact delegated act reference and per-feature phase-in dates need verification. |
| owner_hint | safety_engineering |

---

## 3. Cybersecurity (`cybersecurity`)

### REG-CS-001 — R155 CSMS

| Field | Value |
|-------|-------|
| stable_id | REG-CS-001 |
| title | Cybersecurity Management System |
| short_label | R155 CSMS |
| jurisdiction / level | UNECE / UNECE |
| framework_group | [MN] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ source_family: "UNECE", reference: "UNECE Regulation No. 155" }] |
| temporal | applies_to_new_types_from: 2022-07-01, applies_to_all_new_vehicles_from: 2024-07-01 |
| trigger_logic | declarative, conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }] |
| obligation_text | Manufacturer must obtain CSMS certificate and vehicle type-approval for cybersecurity. CSMS certificate valid max 3 years. |
| owner_hint | cybersecurity |
| planning_lead_time_months | 24 |

### REG-CS-002 — R156 SUMS

| Field | Value |
|-------|-------|
| stable_id | REG-CS-002 |
| title | Software Update Management System |
| short_label | R156 SUMS |
| jurisdiction / level | UNECE / UNECE |
| framework_group | [MN] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ source_family: "UNECE", reference: "UNECE Regulation No. 156" }] |
| temporal | applies_to_new_types_from: 2022-07-01, applies_to_all_new_vehicles_from: 2024-07-01 |
| trigger_logic | declarative, conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }] |
| obligation_text | Manufacturer must establish SUMS and obtain type-approval for software update processes, including OTA where applicable. |
| owner_hint | software_ota |

### REG-CS-003 — Cyber Resilience Act

| Field | Value |
|-------|-------|
| stable_id | REG-CS-003 |
| **lifecycle_state** | **DRAFT** |
| sources | [{ reference: "Regulation (EU) 2024/2847" }] |
| manual_review_reason | CRA exclusion scope for type-approved vehicles needs verification. |
| owner_hint | cybersecurity |

---

## 4. DCAS / Automated Driving (`dcas_automated`)

### REG-AD-001 — R157 ALKS

| Field | Value |
|-------|-------|
| stable_id | REG-AD-001 |
| title | Automated Lane Keeping System |
| short_label | R157 ALKS |
| jurisdiction / level | UNECE / UNECE |
| framework_group | [MN] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ source_family: "UNECE", reference: "UNECE Regulation No. 157" }] |
| temporal | applies_to_new_types_from: 2023-01-01, notes: "R157 amendments (speed limit, lane change) need tracking." |
| trigger_logic | declarative, match_mode: "all", conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }, { field: "isL3Plus", operator: "is_true" }], fallback_if_missing: "not_applicable" |
| obligation_text | ALKS system must be type-approved per R157 including dynamic driving task, minimal risk condition, HMI, and DSSAD. |
| evidence_tasks | [ALKS system specification, ODD definition, MRC strategy, DSSAD specification, R157 test reports, ALKS type-approval certificate] |
| owner_hint | safety_engineering |
| planning_lead_time_months | 36 |

### REG-AD-002 — UN R171 DCAS

| Field | Value |
|-------|-------|
| stable_id | REG-AD-002 |
| title | Driver Control Assistance Systems (DCAS) |
| short_label | UN R171 DCAS |
| jurisdiction / level | UNECE / UNECE |
| framework_group | [MN] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ label: "UN Regulation", source_family: "UNECE", reference: "UN Regulation No. 171", oj_reference: "OJ L, 2024/2689, 4 November 2024" }, { label: "EU transposition into GSR2", source_family: "EUR-Lex", reference: "Commission Delegated Regulation (EU) 2025/1122", oj_reference: "OJ L, 2025/1122, 12 August 2025" }] |
| temporal | entry_into_force: 2025-09-01, applies_from_generic: 2025-09-01, notes: "'If fitted' basis — no mandatory fitment. Single application date; no separate new-types / all-new-vehicles phase-in. Adds row E10 to Annex II of Regulation (EU) 2019/2144. Vehicle categories: M1, M2, M3, N1, N2, N3." |
| trigger_logic | **custom**, evaluator_id: "dcas_if_fitted", description: "Returns APPLICABLE when vehicle has sustained lateral + longitudinal control capability (DCAS-type system fitted), based on automationLevel ≥ l2plus AND (motorwayAssistant OR parkingAutomation with lat+long). Returns NOT_APPLICABLE if no such system. Returns CONDITIONAL if automationLevel is l2plus but system configuration details are ambiguous." |
| obligation_text | Where a vehicle is equipped with a system performing sustained lateral and longitudinal vehicle control while requiring driver engagement (DCAS), that system must be type-approved per UN Regulation No. 171. Application is on an "if fitted" basis — fitment is not mandatory. |
| evidence_tasks | [UN R171 type-approval application, DCAS system specification, Driver engagement monitoring documentation, Transition demand / minimal risk manoeuvre documentation, R171 test reports] |
| exclusions | ["Vehicles without DCAS-type systems", "Systems that provide only lateral OR only longitudinal control (not both sustained)"] |
| owner_hint | safety_engineering |
| planning_lead_time_months | 18 |
| manual_review_required | true |
| manual_review_reason | EUR-Lex URL verification pending. "If fitted" trigger requires system-level knowledge beyond simple field matching; custom evaluator must be validated against R171 scope definition. |
| notes | DCAS = Driver Control Assistance Systems (official title per UN R171). Do NOT use "Dynamically Commanded Assistive Driving System." |

### REG-AD-003 — EU L4/Driverless Framework

| Field | Value |
|-------|-------|
| stable_id | REG-AD-003 |
| **lifecycle_state** | **PLACEHOLDER** |
| obligation_text | PLACEHOLDER — no EU-level regulation for fully driverless (L4) vehicles adopted. Monitor legislative developments. |
| owner_hint | regulatory_affairs |

---

## 5. Privacy / Connected Vehicle (`privacy_connected`)

### REG-PV-001 — GDPR

| Field | Value |
|-------|-------|
| stable_id | REG-PV-001 |
| title | General Data Protection Regulation |
| short_label | GDPR |
| ui_package | horizontal |
| framework_group | [MN, L, O, AGRI] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) 2016/679", oj_reference: "OJ L 119, 4.5.2016" }] |
| temporal | entry_into_force: 2016-05-24, applies_from_generic: 2018-05-25 |
| trigger_logic | declarative, match_mode: "any", conditions: [{ field: "processesPersonalData", operator: "is_true", label: "Vehicle processes personal data" }, { field: "hasConnectedServices", operator: "is_true", label: "Connected vehicle likely processes personal data" }], fallback_if_missing: "unknown", conditional_reason: "Connected vehicle likely processes personal data — GDPR applicability should be assessed" |
| obligation_text | Data controller must comply with GDPR principles: lawfulness, purpose limitation, data minimization, storage limitation, integrity, accountability. |
| owner_hint | privacy_data_protection |
| planning_lead_time_months | 18 |

### REG-PV-002 — ePrivacy Directive

| Field | Value |
|-------|-------|
| stable_id | REG-PV-002 |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| sources | [{ reference: "Directive 2002/58/EC (as amended by 2009/136/EC)" }] |
| trigger_logic | declarative, conditions: [{ field: "connectivity", operator: "includes_any", value: ["telematics","mobile_app","remote_control"] }] |
| manual_review_reason | Directive — member state transposition varies. ePrivacy Regulation replacement status uncertain. |
| owner_hint | privacy_data_protection |

---

## 6. Data Access (`data_access`)

### REG-DA-001 — EU Data Act

| Field | Value |
|-------|-------|
| stable_id | REG-DA-001 |
| title | EU Data Act |
| short_label | Data Act |
| ui_package | horizontal |
| framework_group | [MN, L, O, AGRI] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) 2023/2854", oj_reference: "OJ L, 2023/2854, 22 December 2023" }] |
| temporal | entry_into_force: 2024-01-11, applies_from_generic: 2025-09-12 |
| trigger_logic | declarative, conditions: [{ field: "hasConnectedServices", operator: "is_true" }], fallback_if_missing: "not_applicable" |
| obligation_text | Users of connected products must be able to access data generated by their vehicle in a structured, machine-readable format. |
| owner_hint | connected_services |
| planning_lead_time_months | 18 |

---

## 7. AI Governance (`ai_governance`)

### REG-AI-001 — AI Act: Prohibited Practices & AI Literacy

| Field | Value |
|-------|-------|
| stable_id | REG-AI-001 |
| title | AI Act — Prohibited Practices and AI Literacy |
| short_label | AI Act Phase 1 |
| ui_package | horizontal |
| process_stage | pre_ta |
| framework_group | [MN, L, O, AGRI] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) 2024/1689, Chapters I-II (Art. 1-5)", oj_reference: "OJ L, 2024/1689, 12 July 2024" }] |
| temporal | entry_into_force: 2024-08-01, applies_from_generic: 2025-02-02 |
| trigger_logic | declarative, conditions: [{ field: "hasAI", operator: "is_true" }], fallback_if_missing: "not_applicable" |
| obligation_text | Prohibited AI practices (Art. 5) must not be deployed. AI literacy obligations (Art. 4) apply to providers and deployers of AI systems. |
| owner_hint | ai_governance |

### REG-AI-002 — AI Act: GPAI Model Obligations

| Field | Value |
|-------|-------|
| stable_id | REG-AI-002 |
| title | AI Act — General-Purpose AI Model Obligations |
| short_label | AI Act GPAI |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| temporal | applies_from_generic: 2025-08-02 |
| trigger_logic | declarative, conditions: [{ field: "aiLevel", operator: "eq", value: "foundation_model" }], fallback_if_missing: "not_applicable" |
| obligation_text | Providers of GPAI models must comply with documentation, copyright, and (for systemic-risk models) additional obligations per Articles 51-56. |
| manual_review_reason | Applicability depends on whether OEM is a GPAI provider or deployer. |
| owner_hint | ai_governance |

### REG-AI-003 — AI Act: High-Risk AI (Annex III standalone use cases)

| Field | Value |
|-------|-------|
| stable_id | REG-AI-003 |
| title | AI Act — High-Risk AI Systems (Art. 6(2) / Annex III) |
| short_label | AI Act Annex III |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| temporal | applies_from_generic: 2026-08-02 |
| trigger_logic | declarative, match_mode: "any", conditions: [{ field: "dataFlags", operator: "includes", value: "cabin_camera", label: "Biometric processing" }, { field: "dataFlags", operator: "includes", value: "driver_profiling", label: "Driver profiling" }], conditional_reason: "Vehicle may contain Annex III high-risk AI — classification review required" |
| obligation_text | AI systems under Annex III high-risk categories must comply with conformity assessment, documentation, and monitoring from 2 August 2026. |
| manual_review_reason | Annex III category mapping to in-vehicle AI use cases needs expert review. |
| owner_hint | ai_governance |

### REG-AI-004 — AI Act: Safety Components in Vehicles (Art. 6(1))

| Field | Value |
|-------|-------|
| stable_id | REG-AI-004 |
| title | AI Act — Safety Components in Regulated Products |
| short_label | AI Act Art. 6(1) Automotive |
| ui_package | horizontal |
| framework_group | [MN, L, O, AGRI] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) 2024/1689, Art. 6(1) and Annex I Section B", oj_reference: "OJ L, 2024/1689, 12 July 2024" }] |
| temporal | entry_into_force: 2024-08-01, applies_from_generic: **2027-08-02**, notes: "Art. 6(1) classifies AI as high-risk when it is a safety component of a product under Annex I harmonisation legislation requiring third-party conformity assessment. Annex I, Section B lists Regulation (EU) 2018/858 and Regulation (EU) 2019/2144." |
| trigger_logic | declarative, conditions: [{ field: "hasSafetyRelevantAI", operator: "is_true", label: "Vehicle uses AI as a safety component" }], fallback_if_missing: "not_applicable" |
| obligation_text | AI systems used as safety components in vehicles under Regulation (EU) 2018/858 or 2019/2144 are classified as high-risk per Art. 6(1). Conformity assessment, technical documentation, quality management, and post-market monitoring required from 2 August 2027. |
| evidence_tasks | [AI system inventory, Risk classification per Art. 6(1)/Annex I, Conformity assessment documentation, Technical documentation per Art. 11, Quality management system, Post-market monitoring plan] |
| owner_hint | ai_governance |
| planning_lead_time_months | 24 |
| manual_review_required | true |
| manual_review_reason | EUR-Lex URL pending. Interaction between AI Act conformity assessment and type-approval conformity assessment under 2018/858 not yet clarified by Commission guidance. |

---

## 8. Materials / Chemicals / Circularity (`materials_chemicals`)

### REG-BAT-001 — Battery Regulation

| Field | Value |
|-------|-------|
| stable_id | REG-BAT-001 |
| title | EU Battery Regulation |
| short_label | Battery Regulation |
| ui_package | horizontal |
| framework_group | [MN, L] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ reference: "Regulation (EU) 2023/1542", oj_reference: "OJ L 191, 28.7.2023" }] |
| temporal | entry_into_force: 2023-08-17, applies_from_generic: 2024-02-18, notes: "Multiple sub-obligations with different dates (2024-2031). Parent rule; decomposition planned post-MVP." |
| trigger_logic | declarative, conditions: [{ field: "batteryPresent", operator: "is_true" }], fallback_if_missing: "not_applicable" |
| obligation_text | Traction batteries must comply with sustainability, labeling, digital battery passport, due diligence, and end-of-life requirements per phased schedule. |
| owner_hint | sustainability_materials |

### REG-BAT-002 — REACH

| Field | Value |
|-------|-------|
| stable_id | REG-BAT-002 |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| sources | [{ reference: "Regulation (EC) No 1907/2006" }] |
| trigger_logic | declarative, conditions: [] (applies to all vehicles) |
| obligation_text | Communicate SVHC presence (>0.1% w/w) in articles. Comply with REACH restrictions (Annex XVII). |
| owner_hint | sustainability_materials |

### REG-BAT-003 — End-of-Life Vehicles

| Field | Value |
|-------|-------|
| stable_id | REG-BAT-003 |
| **lifecycle_state** | **DRAFT** |
| notes | ELV Directive revision into Regulation pending. |
| owner_hint | sustainability_materials |

---

## 9. Emissions / CO2 (`emissions_co2`)

### REG-EM-001 — Euro 7 Light-Duty (M1/N1)

| Field | Value |
|-------|-------|
| stable_id | REG-EM-001 |
| title | Euro 7 Emission Standard — Light-Duty Vehicles |
| short_label | Euro 7 (M1/N1) |
| ui_package | wvta_core |
| process_stage | type_approval |
| framework_group | [MN] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ label: "Framework regulation", source_family: "EUR-Lex", reference: "Regulation (EU) 2024/1257", oj_reference: "OJ L, 2024/1257, 8 May 2024" }, { label: "Implementing regulation (exhaust/evaporative)", reference: "Implementing Regulation (EU) 2025/1706", oj_reference: "OJ L, 2025/1706, 5 September 2025" }, { label: "Implementing regulation (OBFCM/OBM/EVP)", reference: "Implementing Regulation (EU) 2025/1707", oj_reference: "OJ L, 2025/1707, 5 September 2025", last_verified_on: null }] |
| temporal | entry_into_force: 2024-05-28, applies_to_new_types_from: **2026-11-29**, applies_to_all_new_vehicles_from: **2027-11-29**, small_volume_derogation_until: 2030-07-01, notes: "2025/1707 primarily M1/N1 with relevant extension logic for designated N2 cases." |
| trigger_logic | declarative, match_mode: "all", conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }, { field: "vehicleCategory", operator: "in", value: ["M1","N1"] }], fallback_if_missing: "unknown" |
| obligation_text | M1/N1 vehicles must comply with Euro 7 emission limits including PN measurement ≥10 nm, OBM, OBFCM, Environmental Vehicle Passport (EVP), and battery durability requirements. Emission compliance durability: 8 years / 160,000 km. |
| evidence_tasks | [Euro 7 type-approval application, Exhaust emission test reports per 2025/1706, OBM system compliance, OBFCM device compliance per 2025/1707, EVP generation, Battery durability documentation (if applicable)] |
| owner_hint | powertrain_emissions |
| planning_lead_time_months | 24 |

### REG-EM-002 — Euro 7 Heavy-Duty (M2/M3/N2/N3)

| Field | Value |
|-------|-------|
| stable_id | REG-EM-002 |
| title | Euro 7 Emission Standard — Heavy-Duty Vehicles |
| short_label | Euro 7 (HD) |
| framework_group | [MN] |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| sources | [{ reference: "Regulation (EU) 2024/1257", oj_reference: "OJ L, 2024/1257, 8 May 2024" }] |
| temporal | entry_into_force: 2024-05-28, applies_to_new_types_from: **2028-05-29**, applies_to_all_new_vehicles_from: **2029-05-29**, small_volume_derogation_until: 2031-07-01 |
| trigger_logic | declarative, match_mode: "all", conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }, { field: "vehicleCategory", operator: "in", value: ["M2","M3","N2","N3"] }] |
| obligation_text | Heavy-duty vehicles must comply with Euro 7 including reduced NOx limits (230 mg/kWh) and new N₂O/NH₃ limits. |
| manual_review_reason | Heavy-duty implementing acts not yet adopted as of April 2026. Framework dates known from 2024/1257 but technical details pending. |
| owner_hint | powertrain_emissions |

### REG-EM-003 — CO2 Fleet Targets (Cars/Vans)

| Field | Value |
|-------|-------|
| stable_id | REG-EM-003 |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| sources | [{ reference: "Regulation (EU) 2019/631 (as amended)" }] |
| temporal | applies_from_generic: 2020-01-01 |
| trigger_logic | declarative, conditions: [{ field: "frameworkGroup", operator: "eq", value: "MN" }, { field: "vehicleCategory", operator: "in", value: ["M1","N1"] }] |
| obligation_text | Fleet-average CO2 emission targets: 2025 interim, 2030, and 2035. Fleet-level manufacturer obligation — individual vehicle contributes to fleet average. |
| owner_hint | powertrain_emissions |

---

## 10. Consumer / Liability (`consumer_liability`)

### REG-CL-001 — Product Liability Directive (revised)

| Field | Value |
|-------|-------|
| stable_id | REG-CL-001 |
| title | Product Liability Directive (revised) |
| short_label | PLD (2024/2853) |
| ui_package | horizontal |
| process_stage | post_market |
| jurisdiction / level | EU / EU |
| framework_group | [MN, L, O, AGRI] |
| **lifecycle_state** | **ACTIVE** |
| sources | [{ label: "Directive", source_family: "EUR-Lex", reference: "Directive (EU) 2024/2853 of the European Parliament and of the Council of 23 October 2024 on liability for defective products and repealing Council Directive 85/374/EEC", oj_reference: "OJ L, 2024/2853, 18 November 2024" }] |
| temporal | entry_into_force: **2024-12-08** (20 days after OJ publication), applies_from_generic: **2026-12-09** (transposition deadline and application date), effective_to: null, notes: "Directive — member states must transpose by 9 December 2026. Applies to products placed on market after transposition. Repeals Directive 85/374/EEC with effect from 9 December 2026 (old directive continues to apply to products placed on market before that date)." |
| trigger_logic | declarative, conditions: [], fallback_if_missing: "unknown", conditional_reason: "Product liability applies to all products. Specific implications depend on vehicle features, AI components, software update obligations, and member state transposition." |
| obligation_text | Manufacturer liable for damage caused by defective products. Explicitly covers software, AI systems, and cybersecurity-related defects. Scope expanded to include online platforms. Disclosure obligations for technical documentation in litigation. |
| evidence_tasks | [Product safety documentation, Defect reporting mechanisms, Software update / cybersecurity lifecycle documentation, Insurance / risk assessment for software-related liability, Monitor member state transposition progress] |
| owner_hint | legal |
| planning_lead_time_months | 18 |
| manual_review_required | true |
| manual_review_reason | EUR-Lex URL verification pending. Directive requires member state transposition — national variations will emerge. German draft bill published; other states in progress. |

### REG-CL-002 — General Product Safety Regulation

| Field | Value |
|-------|-------|
| stable_id | REG-CL-002 |
| **lifecycle_state** | **DRAFT** |
| sources | [{ reference: "Regulation (EU) 2023/988" }] |
| manual_review_reason | Applicability to type-approved vehicles and aftermarket components needs review. |
| owner_hint | legal |

### REG-CL-003 — Sale of Goods Directive

| Field | Value |
|-------|-------|
| stable_id | REG-CL-003 |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| sources | [{ reference: "Directive (EU) 2019/771" }] |
| trigger_logic | declarative, conditions: [{ field: "salesModel", operator: "in", value: ["direct","dealer","leasing","subscription","mixed"] }], conditional_reason: "Consumer sales trigger conformity and remedy obligations under Sale of Goods Directive as transposed." |
| obligation_text | Conformity requirements and consumer remedies for goods sold to consumers. Relevant for digital content/services integrated with the vehicle. |
| owner_hint | legal |

---

## 11. Member State Overlay (`member_state_overlay`)

### REG-MS-DE-001 — Germany StVZO

| Field | Value |
|-------|-------|
| stable_id | REG-MS-DE-001 |
| jurisdiction / level | DE / MEMBER_STATE |
| **lifecycle_state** | **PLACEHOLDER** |
| sources | [{ source_family: "National legislation", reference: "StVZO (Straßenverkehrs-Zulassungs-Ordnung)" }] |
| trigger_logic | declarative, conditions: [{ field: "targetCountries", operator: "includes", value: "DE" }, { field: "frameworkGroup", operator: "eq", value: "MN" }], conditional_reason: "Germany selected as target market — StVZO overlay may apply" |
| owner_hint | homologation |

### REG-MS-FR-001 — France

| Field | Value |
|-------|-------|
| stable_id | REG-MS-FR-001 |
| **lifecycle_state** | **PLACEHOLDER** |
| owner_hint | homologation |

---

## 12. Non-EU Market (`non_eu_market`)

### REG-UK-001 — UK Automated Vehicles Act 2024

| Field | Value |
|-------|-------|
| stable_id | REG-UK-001 |
| jurisdiction / level | UK / NON_EU_MARKET |
| **lifecycle_state** | **SEED_UNVERIFIED** |
| sources | [{ source_family: "UK Parliament", reference: "Automated Vehicles Act 2024" }] |
| trigger_logic | declarative, match_mode: "all", conditions: [{ field: "targetCountries", operator: "includes", value: "UK" }, { field: "isL3Plus", operator: "is_true" }], fallback_if_missing: "not_applicable" |
| obligation_text | UK self-driving vehicle authorization requirements. Separate regulatory pathway from EU. |
| manual_review_reason | Secondary legislation still developing. |
| owner_hint | regulatory_affairs |

---

## 13. UNECE Technical (`unece_technical`)

### REG-UN-001 — UNECE Regulation Matrix

| Field | Value |
|-------|-------|
| stable_id | REG-UN-001 |
| **lifecycle_state** | **PLACEHOLDER** |
| notes | Full vehicle-category × UNECE-regulation matrix is in Annex II of Regulation (EU) 2018/858 and its amendments (including Delegated Reg 2025/1122). Not yet authored. |
| owner_hint | homologation |

---

## Summary

| lifecycle_state | Count | IDs |
|----------------|-------|-----|
| **ACTIVE** | 14 | REG-TA-001, TA-002, GSR-001, CS-001, CS-002, AD-001, AD-002, PV-001, DA-001, AI-001, AI-004, BAT-001, EM-001, CL-001 |
| **SEED_UNVERIFIED** | 11 | REG-GSR-002–006 (5), PV-002, AI-002, AI-003, EM-002, EM-003, CL-003 |
| **DRAFT** | 3 | REG-CS-003, BAT-003, CL-002 |
| **PLACEHOLDER** | 5 | REG-TA-003, AD-003, MS-DE-001, MS-FR-001, UN-001 |
| **Total** | **33** | |

All 14 ACTIVE rules have OJ references recorded. Their `sources[0].official_url` must be confirmed against EUR-Lex at implementation time.
