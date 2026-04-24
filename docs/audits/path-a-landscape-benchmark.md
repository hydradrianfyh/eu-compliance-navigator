# Coverage Audit — Are 205 Rules Comprehensive?

Generated: 2026-04-23  
Audit mode: read-only. No changes to `src/registry/seed/*`.

## One-line Answer

205 条**不是**“全欧盟车辆合规景观”的全面库；它是一个面向当前 pilot 的、带显式 backlog 的工作指导库。按本次审计口径：对基准 B（pilot work guidance）是 **35% rule-present / 26% verified-ACTIVE**；对基准 A（全景）是 **32% rule-present / 16% raw-ACTIVE**；对基准 C（known backlog）是 **96% runtime backlog captured / 63% source-only promotion-realistic**。Phase M+ 建议锁定基准 B，先做 **100 条 pilot-priority 补齐/提升**，目标把 pilot verified coverage 从 71/278 提到约 171/278。

## Method

1. Loaded `rawSeedRules` and `allSeedRules` through a read-only TypeScript loader because `tsx` was blocked by sandbox process spawning.
2. Evaluated the three current pilots with `buildEngineConfig()` + `evaluateAllRules()`.
3. Compared local registry against Phase 0 seed baseline, Phase J/L docs, `verification-backlog.md`, `source-policy.md`, `rule-authoring-guide.md`, and `homologation-5min.md`.
4. Cross-checked against Tier-1 official source families only: EUR-Lex/OJ, UNECE WP.29, European Commission official pages, ECHA/EDPB, national gazettes/authorities, UK legislation.gov.uk/GOV.UK, CH/EEA national authorities.

Key official sources consulted include:

| Source area | Official source |
|---|---|
| EU type approval framework | EUR-Lex Regulation (EU) 2018/858, Annex II and type-approval articles: https://eur-lex.europa.eu/eli/reg/2018/858 |
| GSR2 | EUR-Lex Regulation (EU) 2019/2144 and delegated acts such as 2021/1958: https://eur-lex.europa.eu/eli/reg/2019/2144 |
| Euro 7 | EUR-Lex Regulation (EU) 2024/1257 and Implementing Regulations 2025/1706 / 2025/1707: https://eur-lex.europa.eu/eli/reg/2024/1257 |
| UNECE WP.29 | UNECE WP.29 outcomes and Status of the 1958 Agreement: https://unece.org/transportvehicle-regulations/wp29-outcomes and https://unece.org/status-1958-agreement-and-annexed-regulations |
| Battery Regulation | EUR-Lex Regulation (EU) 2023/1542: https://eur-lex.europa.eu/legal-content/en/TXT/?uri=CELEX%3A32023R1542 |
| AI Act | EUR-Lex Regulation (EU) 2024/1689: https://eur-lex.europa.eu/eli/reg/2024/1689 |
| Data Act | EUR-Lex Regulation (EU) 2023/2854: https://eur-lex.europa.eu/eli/reg/2023/2854 |
| Roadworthiness / registration documents | EUR-Lex Directive 2014/45/EU and Directive 1999/37/EC: https://eur-lex.europa.eu/legal-content/en/TXT/?uri=celex%3A32014L0045 and https://eur-lex.europa.eu/eli/dir/1999/37/oj |
| ELV / circularity | EUR-Lex Directive 2000/53/EC summary and Commission ELV page: https://eur-lex.europa.eu/EN/legal-content/summary/end-of-life-vehicles.html and https://environment.ec.europa.eu/topics/waste-and-recycling/end-life-vehicles_en |
| AFIR | Regulation (EU) 2023/1804 and Commission transport page: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1804 and https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure_en |
| DE | gesetze-im-internet FZV 2023: https://www.gesetze-im-internet.de/fzv_2023/BJNR0C70B0023.html |
| ES | BOE Reglamento General de Vehículos RD 2822/1998: https://www.boe.es/buscar/act.php?id=BOE-A-1999-1826 |
| FR | Légifrance Code de la route registration / inspection / Crit'Air: https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006159586 and https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034621562 |
| NL | wetten.overheid.nl vehicle tax and related road-vehicle law source family: https://wetten.overheid.nl/BWBR0006324/ |
| UK | legislation.gov.uk Automated Vehicles Act 2024 and Road Vehicles Approval Regulations 2020: https://www.legislation.gov.uk/ukpga/2024/10 and https://www.legislation.gov.uk/uksi/2020/818 |
| CH / EEA overlays | ASTRA/FEDRO homologation, Iceland Transport Authority, Liechtenstein NRO: https://www.astra.admin.ch/astra/en/home/services/fahrzeuge/homologation.html, https://island.is/en/o/transport-authority/vehicle-registrations, https://www.llv.li/en/national-administration/national-road-office-nro-/vehicles/vehicle-registration |

## Three Baselines

| Baseline | Denominator used | Current represented | Current verified | Score | Interpretation |
|---|---:|---:|---:|---:|---|
| A. Full EU/UK/EEA/CH vehicle compliance landscape | 650 | 205 | 101 raw ACTIVE / 97 governed ACTIVE / 50 strict-sourced | 31.5% represented; 15.5% raw ACTIVE; 14.9% governed ACTIVE; 7.7% strict-sourced | Not comprehensive. This is a curated subset. Sensitivity vs 500-800 range: 25.6%-41.0% represented. |
| B. Current pilot work guidance | 278 | 98 pilot-triggerable | 71 ACTIVE pilot-triggerable | 35.3% represented; 25.5% verified | Usable for demo/pilot, not yet complete enough for end-to-end homologation work planning. |
| C. Known backlog completeness | 108 runtime non-ACTIVE | 104 in generated raw backlog | n/a | 96.3% captured | Backlog generator is good, but misses 4 governance-downgraded raw ACTIVE rules. Sample quality: 19/30 realistic source-only promotion; 11/30 need split/re-authoring. |

The denominator for A is an audit benchmark, not a claim that EU law has exactly 650 legal acts. It decomposes the practical landscape into roughly 95-120 EU/UNECE type-approval and technical obligations, 80-120 EU horizontal/product-lifecycle obligations, 250-320 national overlay obligations across 32 target markets, and 150-210 implementation/evidence/workflow sub-obligations.

The denominator for B is intentionally narrower: what a homologation/compliance engineer would expect for MY2027 BEV × DE, MY2028 PHEV × DE/FR/NL, and MY2027 ICE × ES before they can say the plan is workflow-complete.

## Current Pilot Coverage

| Pilot | APPLICABLE | CONDITIONAL | FUTURE | UNKNOWN | Existing pilot-relevant rules | ACTIVE pilot-relevant |
|---|---:|---:|---:|---:|---:|---:|
| MY2027 BEV × DE/FR/NL | 51 | 27 | 4 | 78 | 82 | 51 |
| MY2028 PHEV × DE/FR/NL | 57 | 28 | 0 | 78 | 85 | 57 |
| MY2027 ICE M1 × ES | 44 | 16 | 3 | 78 | 63 | 44 |
| Union of all pilots | n/a | n/a | n/a | n/a | 98 | 71 |

Important regression note: `fixtures/pilot-my2027-bev.expected.ts` still documents 16 as the minimum and old comments, while runtime now evaluates 51 APPLICABLE. Tests pass because the assertion is a minimum. This should be updated as a documentation/anchor hygiene task, not as a rules edit.

## Gap Classification

| Gap class | Count / estimate | Examples | Disposition |
|---|---:|---|---|
| Already in backlog | 104 raw non-ACTIVE rules | NL 5 seeds; FR 7 pending; 27 UNECE backlog; EU REACH/ELV/market surveillance/import/consumer info | Prioritize by pilot relevance, not FIFO. |
| Runtime backlog not in generated backlog | 4 | REG-TA-002, REG-AD-001, REG-AD-002, REG-DA-001 | Add generator guard or separate governance-downgrade backlog view. |
| Should enter backlog | ~120 | CoP, technical service workflow, RMI, EU small series / individual approval / end-of-series, 2014/45 roadworthiness, 1999/37 registration docs, current ELV Directive, AFIR, national PLD transpositions | Add as DRAFT/SEED_UNVERIFIED with Tier-1 sources. |
| Unknown-unknown risk | ~220-320 | EEA/CH overlays; national tax/incentive churn; local LEZ/ZFE; Euro 7 implementing act split; AI Act automotive guidance; PLD national transpositions | Establish source-watch queues; do not bulk-author without a pilot need. |
| Intentional non-scope | 31 placeholder skeletons + non-target geographies | IT/PL/BE/AT/SE/CZ skeletons; CN/JP/US/TR/Western Balkans | Keep explicitly non-claiming in UI/docs. |

## Unknown-Unknowns With Tier-1 Source Anchors

| Gap | Why it matters | Tier-1 source anchor | Recommended status |
|---|---|---|---|
| EEA/CH national overlays are effectively absent | Scope includes NO/IS/LI/CH, but registry has no real rules for them. | ASTRA/FEDRO homologation, Iceland Transport Authority, Liechtenstein National Road Office | Add as source-watch backlog, not ACTIVE. |
| EU roadworthiness and registration-document framework not modelled as EU-level work items | Current member-state overlays cover some local workflows, but EU baseline obligations drive documentation assumptions. | Directive 2014/45/EU; Directive 1999/37/EC | Add SEED_UNVERIFIED EU-horizontal rules. |
| Current ELV Directive is not cleanly separated from ELV revision | Existing rule is revision-oriented; current Directive 2000/53/EC still creates design/recyclability/material restrictions. | Directive 2000/53/EC; Commission ELV page | Split current ELV from proposed/revision rule. |
| AFIR only appears indirectly through country/charging context | If OEM or affiliate offers public charging, payment/user-information/interoperability obligations matter. | Regulation (EU) 2023/1804; Commission AFIR page | Add trigger on `offersPublicChargingInfra`. |
| Type-approval operational workflow is under-modelled | Homologation work needs CoP, technical services, CoC/eCoC, extension, small-series, end-of-series, not just framework rule. | Regulation (EU) 2018/858 | Add workflow rules with `output_kind: planning_item`. |
| France and Netherlands national overlays are not production-grade | PHEV pilot explicitly targets FR/NL, but NL has 0 ACTIVE and FR remainder is pending. | Légifrance, RDW/wetten.overheid.nl | Phase M priority. |
| UK AV Act implementation is moving through secondary implementation | UK is production-grade for current seed, but AV implementation programme points to continuing 2027 rollout. | legislation.gov.uk AV Act; GOV.UK implementation programme | Add freshness/source-watch SLA. |

## Backlog Quality Sample — 30 Rules

Sample outcome: 30/30 are real backlog or governance-debt items; 0/30 are promotable as-is because none have complete human verification; 19/30 are realistic source-only promotions; 11/30 need split, re-authoring, or a stronger trigger model.

| Rule | Lifecycle | Source posture | Trigger / scope quality | Promotion judgement |
|---|---|---|---|---|
| REG-TA-003 AGRI framework | PLACEHOLDER | EUR-Lex ref missing URL/OJ/date | Empty conditions | Re-author first. |
| REG-BAT-002 REACH | SEED_UNVERIFIED | EUR-Lex missing URL/OJ/date | Empty applies-all trigger too coarse | Split REACH/SVHC/Annex XVII/SCIP. |
| REG-BAT-003 ELV revision | SEED_UNVERIFIED | URL+OJ, no date | BEV/PHEV M1/N1 trigger OK for pilot | Source-date then split current vs proposed ELV. |
| REG-BAT-010 recycled content | DRAFT | URL+OJ, no date | Battery/category trigger OK | Realistic after verification. |
| REG-CI-001 CO2 label | SEED_UNVERIFIED | OJ only | M1 trigger OK | Realistic after EUR-Lex URL/date. |
| REG-CI-002 tyre label | SEED_UNVERIFIED | OJ only | `targetsEU` too broad but acceptable | Realistic after source check. |
| REG-CL-002 GPSR | DRAFT | Missing all key source fields | Empty trigger | Re-author vehicle/aftermarket boundary. |
| REG-CS-003 CRA | DRAFT | Missing all key source fields | Connected-services trigger too broad | Re-author exclusion/vehicle boundary. |
| REG-EM-014 Euro 7 battery durability | SEED_UNVERIFIED | URL+OJ, no date | Good BEV/PHEV trigger | High-value promotion candidate. |
| REG-IMP-001 import CoC recognition | SEED_UNVERIFIED | OJ only | `targetsEU` OK but origin role missing | Add importer/manufacturer role if schema allows. |
| REG-IMP-002 UCC import procedures | SEED_UNVERIFIED | OJ only | `targetsEU` too broad | Needs import-origin trigger later. |
| REG-MS-001 market surveillance | SEED_UNVERIFIED | OJ only | `targetsEU` OK | Realistic after URL/date. |
| REG-MS-002 economic operator obligations | SEED_UNVERIFIED | OJ only | MN/O only misses L/AGRI variants | Adjust scope or document exclusion. |
| REG-MS-003 recall notification | SEED_UNVERIFIED | OJ only | `targetsEU` OK | Realistic after URL/date. |
| REG-PV-003 EDPB guidance | SEED_UNVERIFIED | EDPB missing URL/date | Connected + personal-data trigger good | Realistic after URL/date; not OJ. |
| REG-MS-DE-009 KBA authority path | SEED_UNVERIFIED | National URL, no ref/date | DE target OK | Split authority/designation vs national approval. |
| REG-MS-ES-008 individual approval | SEED_UNVERIFIED | BOE URL+OJ, no date | ES target OK | Needs Orden ministerial research. |
| REG-MS-ES-011 sustainable mobility law | PLACEHOLDER | Missing all | ES target only | Draft after adopted text confirmed. |
| REG-MS-FR-006 Crit'Air | SEED_UNVERIFIED | Missing all | FR target OK | High-value source-only promotion. |
| REG-MS-FR-012 UTAC pathway | SEED_UNVERIFIED | Other official missing URL/date | FR + new type OK | Needs official designation source, not commercial UTAC page alone. |
| REG-MS-NL-001 RDW registration | SEED_UNVERIFIED | URL only | NL target OK | High-value source-only promotion. |
| REG-MS-NL-005 milieuzones | SEED_UNVERIFIED | URL only | NL target OK but city variation broad | Promote only as national overview; city rules need sub-rules. |
| REG-UK-014 UK REACH | SEED_UNVERIFIED | Other official URL only | UK target OK | Realistic after official ref/date. |
| REG-UN-007 R7 lamps | SEED_UNVERIFIED | UNECE portal URL, no deep link/date | M/N trigger OK | Needs deep link. |
| REG-UN-025 R25 head restraints | SEED_UNVERIFIED | UNECE portal URL, no date | M1/N1 trigger OK | Needs deep link. |
| REG-UN-034 R34 fuel tank | SEED_UNVERIFIED | UNECE portal URL, no date | Fuel tank trigger good | Needs deep link. |
| REG-UN-051 R51 noise | SEED_UNVERIFIED | UNECE portal URL, no date | M/N trigger OK | Needs deep link. |
| REG-UN-101 R101 CO2/fuel | SEED_UNVERIFIED | UNECE portal URL, no date | M1/N1 trigger OK but supersession risk | Check R154/Euro 7 interaction before promotion. |
| REG-UN-140 R140 ESC | SEED_UNVERIFIED | UNECE portal URL, no date | M/N trigger OK | Needs deep link. |
| REG-UN-145 R145 ISOFIX | SEED_UNVERIFIED | UNECE portal URL, no date | M1 trigger OK | Needs deep link. |

## Product Judgement

Q1 — Continue growing rule count or freeze and promote the 104?  
Do neither as a pure policy. Freeze broad growth, but allow pilot-targeted additions. The next phase should be “B-first”: promote the 21 pilot-relevant existing non-ACTIVE rules, fix the 4 governance downgrades, then add missing pilot workflow rules. Bulk growth toward A will look impressive but dilute verification.

Q2 — FR partial + NL seed-only: product debt or intentional scope?  
Both. It was intentional sequencing in Phase K/L, but it is product debt for the PHEV × DE/FR/NL pilot. FR can be sold as partial guidance; NL cannot be sold as verified guidance until the 5 seed rules are promoted and RDW/wetten sources are recorded.

Q3 — Primary KPI for Phase M+?  
Primary KPI should be **pilot-required ACTIVE coverage ratio**: ACTIVE pilot-required rules / total pilot-required rules. Secondary guardrails: verification SLA for pilot-blocking rules, freshness median for ACTIVE rules, and zero governance-downgraded raw ACTIVE rules. New rule count and country count should be secondary because they are too easy to game.

## Completeness Score Matrix

| Dimension | A full landscape | B pilot work guidance | C backlog known-unknowns |
|---|---:|---:|---:|
| Rule-present completeness | 205/650 = 31.5% | 98/278 = 35.3% | 104/108 = 96.3% runtime backlog capture |
| Verified usability | 97/650 = 14.9% governed ACTIVE | 71/278 = 25.5% pilot ACTIVE | 0/30 sample promotable as-is |
| Strict source-policy cleanliness | 50/650 = 7.7% | 50 strict-sourced rules, but not all pilot-relevant | 19/30 sample realistic after source-only review |
| Main blocker | Landscape size + national overlays | FR/NL + workflow obligations | Generator misses governance downgrades; several rules need splitting |

## Next 100 Priority List

The list mixes promotions, splits, and new backlog entries because Phase M+ value comes from verified pilot guidance, not raw rule count.

| # | Candidate | Action | Pilot link |
|---:|---|---|---|
| 1 | REG-AD-002 DCAS | Fix source gates / promote or keep downgraded visibly | BEV, PHEV |
| 2 | REG-DA-001 Data Act | Fix source gates | BEV, PHEV, ICE connected |
| 3 | REG-BAT-003 ELV | Split current ELV vs revision; verify source | BEV, PHEV |
| 4 | REG-EM-014 Euro 7 battery durability | Promote after source date | BEV, PHEV |
| 5 | REG-MS-DE-009 KBA authority path | Split and verify | BEV/PHEV DE |
| 6 | REG-MS-FR-006 Crit'Air | Add Légifrance source; promote | PHEV FR |
| 7 | REG-MS-FR-007 conversion incentive | Verify or downgrade scope | PHEV FR |
| 8 | REG-MS-FR-009 TICPE | Verify or mark non-OEM | PHEV FR |
| 9 | REG-MS-FR-010 LOM | Verify adopted provisions | PHEV FR |
| 10 | REG-MS-FR-011 malus masse | Verify tax source | PHEV FR |
| 11 | REG-MS-FR-012 UTAC pathway | Replace commercial source with official designation | PHEV FR |
| 12 | REG-MS-NL-001 RDW registration | Verify wetten/RDW source | PHEV NL |
| 13 | REG-MS-NL-002 APK | Verify source | PHEV NL |
| 14 | REG-MS-NL-003 WAM insurance | Verify source | PHEV NL |
| 15 | REG-MS-NL-004 MRB+BPM | Verify source | PHEV NL |
| 16 | REG-MS-NL-005 milieuzones | Verify national rule; split city overlays later | PHEV NL |
| 17 | REG-UN-025 head restraints | Find deep link; promote | BEV/PHEV/ICE M1 |
| 18 | REG-UN-051 noise | Find deep link; promote | BEV/PHEV/ICE M1 |
| 19 | REG-UN-135 pole side impact | Verify deep link | BEV/PHEV/ICE M1 |
| 20 | REG-UN-137 full-width frontal | Verify deep link | BEV/PHEV/ICE M1 |
| 21 | REG-UN-140 ESC | Verify deep link | BEV/PHEV/ICE M1 |
| 22 | REG-UN-145 ISOFIX | Verify deep link | BEV/PHEV/ICE M1 |
| 23 | REG-UN-007 lamps | Verify deep link | BEV/PHEV/ICE M1 |
| 24 | REG-UN-028 audible warning | Verify deep link | BEV/PHEV/ICE M1 |
| 25 | REG-UN-030 tyres | Verify deep link | BEV/PHEV/ICE M1 |
| 26 | REG-UN-087 DRL | Verify deep link | BEV/PHEV/ICE M1 |
| 27 | REG-UN-112 headlamps | Verify deep link | BEV/PHEV/ICE M1 |
| 28 | REG-UN-113 headlamps | Verify deep link | BEV/PHEV/ICE M1 |
| 29 | REG-UN-116 anti-theft | Verify deep link | BEV/PHEV/ICE M1 |
| 30 | REG-UN-125 forward field of view | Verify deep link | BEV/PHEV/ICE M1 |
| 31 | REG-UN-128 LED light sources | Verify deep link | BEV/PHEV/ICE M1 |
| 32 | WVTA Conformity of Production | New rule from 2018/858 | All pilots |
| 33 | WVTA information document/application | New planning item | All pilots |
| 34 | Certificate of Conformity / eCoC | New rule | All pilots |
| 35 | Multi-stage approval | New rule | All pilots where incomplete/multi-stage |
| 36 | EU small series approval | New conditional rule | Low-volume scenarios |
| 37 | EU individual vehicle approval | New conditional rule | ES individual approval interaction |
| 38 | National individual approval bridge | New member-state workflow | ES, DE, FR, NL |
| 39 | End-of-series derogation | New rule | SOP planning |
| 40 | Technical service engagement/designation | New planning item | All pilots |
| 41 | CoP surveillance tests | New rule | All pilots |
| 42 | Repair and Maintenance Information (RMI) | New data_access rule | All pilots |
| 43 | Replacement parts/equipment approval | New rule | Aftersales |
| 44 | Vehicle recall notification | Promote/split REG-MS-003 | All pilots post-market |
| 45 | Serious-risk safeguard procedure | New market-surveillance rule | All pilots |
| 46 | Importer obligations | Promote/split REG-IMP-004 | Non-EU OEM |
| 47 | Authorised representative | New import_customs/market access rule | Non-EU OEM |
| 48 | Distributor obligations | Promote REG-IMP-005 | Dealer/direct sales |
| 49 | TARIC/CN vehicle classification | New customs rule | ICE/BEV import |
| 50 | UCC import declaration/origin | Promote/split REG-IMP-002 | Non-EU OEM |
| 51 | BTI path for complex parts | New customs planning item | Parts/import |
| 52 | Registration documents Directive 1999/37 | New EU-horizontal rule | DE/FR/NL/ES |
| 53 | Periodic roadworthiness Directive 2014/45 | New EU-horizontal rule | DE/FR/NL/ES |
| 54 | Roadside inspection Directive 2014/47 | New EU-horizontal rule | Fleet / HD later |
| 55 | Deregistration / vehicle register data | New workflow rule | All member states |
| 56 | AFIR public charging obligations | New conditional rule | BEV/PHEV if public infra |
| 57 | Passenger car CO2 label | Promote REG-CI-001 | ICE, PHEV |
| 58 | Tyre labelling | Promote REG-CI-002 | All pilots |
| 59 | REACH Article 33 SVHC | Split REG-BAT-002 | All pilots |
| 60 | SCIP notification | New ECHA rule | All pilots |
| 61 | REACH Annex XVII restrictions | New rule | All pilots |
| 62 | CLP Annex VI watch | New materials rule | Materials |
| 63 | POPs restrictions | New materials rule | Materials |
| 64 | Current ELV hazardous substances | Split from REG-BAT-003 | All pilots |
| 65 | ELV recyclability 85/95 | New rule | All pilots |
| 66 | Dismantling info / destruction certificate | New ELV workflow | End-of-life |
| 67 | Battery carbon footprint declaration | Split battery rule | BEV/PHEV |
| 68 | Battery performance class | Split battery rule | BEV/PHEV |
| 69 | Battery QR/labelling | Split battery rule | BEV/PHEV |
| 70 | Digital battery passport | Split battery rule | BEV/PHEV |
| 71 | Battery due diligence | Split battery rule | BEV/PHEV |
| 72 | Battery recycled content | Promote/split REG-BAT-010 | BEV/PHEV |
| 73 | Battery removability/replaceability | Split battery rule | BEV/PHEV |
| 74 | Battery CE/DoC conformity assessment | Split battery rule | BEV/PHEV |
| 75 | Waste battery EPR | Split battery rule | BEV/PHEV |
| 76 | Euro 7 OBM/OBFCM reporting | Split REG-EM-001/2025/1707 | ICE/PHEV |
| 77 | Euro 7 EVP display/data | Split REG-EM-001/2025/1707 | ICE/PHEV/BEV |
| 78 | Euro 7 anti-tampering | Split 2025/1706/1707 | ICE/PHEV |
| 79 | Euro 7 in-service conformity | Split rule | ICE/PHEV |
| 80 | Euro 7 CoP emissions | Split rule | ICE/PHEV |
| 81 | OBD/RMI under Euro 7 | Split rule | ICE/PHEV |
| 82 | AI Act technical documentation | Split AI-004 evidence rule | BEV/PHEV with AI |
| 83 | AI Act post-market monitoring/incidents | New AI rule | BEV/PHEV AI |
| 84 | AI provider/deployer role classification | New planning item | BEV/PHEV AI |
| 85 | AI transparency / biometric cabin camera | Split AI/PV edge | BEV/PHEV |
| 86 | GDPR controller/processor role | Split privacy rule | Connected pilots |
| 87 | GDPR DPIA cabin monitoring | Split privacy rule | BEV/PHEV |
| 88 | GDPR retention/deletion telematics | Split privacy rule | Connected pilots |
| 89 | ePrivacy national implementation | Split by DE/FR/NL/ES | Connected pilots |
| 90 | Data Act user access interface | Split Data Act | Connected pilots |
| 91 | Data Act third-party sharing | Split Data Act | Connected pilots |
| 92 | Data Act contract/trade-secret controls | Split Data Act | Connected pilots |
| 93 | EDPB connected-vehicle guidance | Promote REG-PV-003 | Connected pilots |
| 94 | PLD national transposition tracker | New FR/NL/ES/DE tracker | All pilots |
| 95 | Sale of Goods digital elements/updates | Promote/split REG-CL-003 | Consumer sales |
| 96 | Digital Content contracts/subscriptions | Promote REG-CL-004 | Connected services |
| 97 | Consumer Rights distance/direct sales | Promote REG-CL-006 | Direct/dealer sales |
| 98 | GPSR vehicle/aftermarket boundary | Re-author REG-CL-002 | Aftersales |
| 99 | Warranty localization by target market | Promote/split REG-CL-005 | Consumer pilots |
| 100 | Safety Gate / rapid alert process | New recall workflow | Post-market |

## Phase M+ Recommendation

Phase M+ should be a pilot-readiness phase, not a library-expansion phase.

Recommended target: raise pilot-required ACTIVE coverage from 71/278 (25.5%) to about 171/278 (61.5%) by completing the 100-item list above. The first 31 items mostly convert existing known backlog into verified usable guidance; the remaining 69 add missing workflow and sub-obligation coverage needed by real homologation teams.

Do not claim “comprehensive EU vehicle compliance” until the A denominator has an explicit source-harvest process and member-state overlays for all in-scope markets. A defensible product claim today is narrower: “pilot-oriented EU vehicle compliance navigator with verified DE/UK/ES/UNECE core coverage and explicit FR/NL/backlog debt.”
