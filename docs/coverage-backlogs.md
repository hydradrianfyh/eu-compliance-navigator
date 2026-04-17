# Coverage Backlogs

Three structured backlogs for expanding the EU Vehicle Compliance Navigator rule registry.
Organized by compliance lifecycle stage. Each item is a candidate for a new seed rule.

## Backlog 1: Market Entry Backbone

Rules needed before a vehicle can be legally placed on the EU market.

| Priority | Gap area | Candidate rule | Domain | Status |
|---|---|---|---|---|
| 1 | Importer obligations | Economic operator duties for non-EU manufacturers (2018/858 Art. 13-14) | market_access_import | Not yet authored |
| 2 | Distributor obligations | Distributor verification duties (2018/858 Art. 15) | market_surveillance_enforcement | Not yet authored |
| 3 | Authorized representative | EU-based authorized representative requirement | market_access_import | Not yet authored |
| 4 | Conformity of Production | CoP audit obligations (2018/858 Art. 31-33) | type_approval_framework | Not yet authored |
| 5 | Technical service designation | Use of accredited technical services (2018/858 Art. 68-76) | type_approval_framework | Not yet authored |
| 6 | Multi-stage type-approval | Incomplete/multi-stage vehicle approval procedures | type_approval_framework | Not yet authored |
| 7 | Small series approval | Small series and individual approval limits | type_approval_framework | Not yet authored |
| 8 | End-of-series derogation | End-of-series vehicle placement (2018/858 Art. 51) | type_approval_framework | Not yet authored |

## Backlog 2: Registration / Road-Use Overlays

Rules needed after type-approval but before/during vehicle use on roads.

| Priority | Gap area | Candidate rule | Domain | Status |
|---|---|---|---|---|
| 1 | Roadworthiness testing | Directive 2014/45/EU — periodic technical inspection | member_state_national | Not yet authored |
| 2 | Roadside inspection | Directive 2014/47/EU — roadside technical inspection | member_state_national | Not yet authored |
| 3 | Vehicle registration docs | Directive 1999/37/EC — registration documents | member_state_national | Not yet authored |
| 4 | LEZ / ZFE compliance | Low-emission zone access rules per member state | member_state_national | Not yet authored |
| 5 | Digital vehicle passport | Future EU digital vehicle passport / maintenance record | member_state_national | Not yet authored |
| 6 | Missing member states | DK, FI, IE, PT, RO, GR, HU, SK, BG, HR, LT, LV, EE, SI, CY, LU, MT overlays | member_state_national | Not yet authored |
| 7 | Compulsory insurance proof | National implementation of Motor Insurance Directive | insurance_registration_tax | Not yet authored |

## Backlog 3: Aftersales / Liability / Due-Diligence

Rules applying during the vehicle's market life and end-of-life.

| Priority | Gap area | Candidate rule | Domain | Status |
|---|---|---|---|---|
| 1 | Battery due diligence | Battery Regulation supply chain due diligence (2023/1542 Art. 47-52) | materials_chemicals_circular | Not yet authored |
| 2 | Battery passport | Digital battery passport (2023/1542 Art. 65-70) | materials_chemicals_circular | Not yet authored |
| 3 | Battery reporting | Battery carbon footprint declaration (2023/1542 Art. 7) | materials_chemicals_circular | Not yet authored |
| 4 | Recall procedures | Vehicle recall notification and execution (2018/858 Art. 52-53) | market_surveillance_enforcement | Not yet authored |
| 5 | Market surveillance cooperation | Authority cooperation and RAPEX notifications | market_surveillance_enforcement | Not yet authored |
| 6 | Distance sales | Consumer rights for online/distance vehicle sales (Directive 2011/83/EU) | consumer_protection | Not yet authored |
| 7 | Aftermarket parts | Type-approval of replacement parts and equipment | type_approval_framework | Not yet authored |
| 8 | End-of-life vehicle reporting | ELV treatment and recycling reporting obligations | materials_chemicals_circular | Not yet authored |
| 9 | SCIP database notification | ECHA SCIP database for SVHC in vehicles | materials_chemicals_circular | Not yet authored |
| 10 | Tyre labelling enforcement | Market surveillance of tyre label compliance | consumer_information_labelling | Not yet authored |

## Usage

These backlogs inform the priority order for new seed rules.
Each item should be authored using `makeSeedRule()` with `lifecycle_state: "SEED_UNVERIFIED"` or `"DRAFT"`.
No item should be promoted to `ACTIVE` without source verification per `docs/source-policy.md`.
