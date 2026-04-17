# EU Vehicle Compliance Navigator — Implementation Plan

**Version:** Phase 0 Final Baseline  
**Date:** 2026-04-14  
**Author:** © Yanhao FU  

---

## Phase 1: Scaffold & Foundation

**Goal:** Next.js project structure, type system, documentation stubs.

### Deliverables

1. **Project scaffold**
   - `npx create-next-app` with App Router, TypeScript strict, Tailwind CSS
   - Zustand installed
   - Zod installed
   - Vitest + Playwright configured
   - `next.config.ts` configured for static export
   - Folder structure per architecture document

2. **Type system**
   - All enumerations as TypeScript types: `FrameworkGroup`, `LegalFamily`, `JurisdictionLevel`, `RuleLifecycleState`, `ApplicabilityResult`, `SourceFamily`, `OwnerHint`, `UIPackage`, `ProcessStage`, `OutputKind`
   - Zod schemas for: `Rule`, `SourceReference`, `RuleTemporalScope`, `TriggerLogic` (declarative + custom union), `VehicleConfig`, `EngineConfig`, `EvaluationResult`, `ExportRow`, `UserState`
   - Runtime validation functions

3. **Documentation stubs**
   - README.md (scope, limitations, "not a complete legal library", how to add rules)
   - AGENTS.md, CLAUDE.md
   - docs/data-model.md → final data model
   - docs/rule-authoring-guide.md → stub
   - docs/correction-ledger.md → final correction ledger

### Exit criteria

- [ ] All types compile without errors
- [ ] Zod schemas validate sample data correctly
- [ ] `npm run build` succeeds
- [ ] Folder structure matches architecture document
- [ ] README clearly states "not complete legal library" and "all non-ACTIVE seeds require verification"

### Open items for human review
- Confirm 13-family taxonomy matches team's mental model
- Confirm FrameworkGroup split (MN/L/O/AGRI) is correct

---

## Phase 2: Registry & Rule Engine

**Goal:** Source-governed registry, seed rules, declarative evaluation engine.

### Deliverables

1. **Rule registry**
   - `RuleRegistry` class with typed storage, query, filter
   - `governance.ts`: lifecycle state validation, promotion gate logic, integrity checks
   - `adapter.ts`: `RegistryAdapter` interface for future DB migration
   - Registry integrity validator

2. **Seed rules (~34 rules)**
   - Rules organized by legal family in `src/registry/seed/` modules
   - Every rule uses the canonical schema: `SourceReference[]`, `RuleTemporalScope`, `TriggerLogic`, `OwnerHint` enum
   - ACTIVE rules: foundational instruments with verified EUR-Lex URLs (see seed-rule-candidate-list). All ACTIVE rules have `sources[0].official_url != null` and `sources[0].last_verified_on` set.
   - SEED_UNVERIFIED rules: plausible content, no fabricated URLs
   - DRAFT rules: known regulations with significant unknowns
   - PLACEHOLDER rules: known gaps, empty shells
   - No fabricated URLs or article numbers in any lifecycle state

3. **Rule engine**
   - `evaluateRule(rule, config)` → `EvaluationResult` with full explainability
   - Declarative condition interpreter: `interpretConditions(conditions, config)` handles field matching, operator evaluation, missing-field handling
   - Custom evaluator registry: `customEvaluators` map for exception cases (e.g., DCAS "if fitted" logic)
   - **Hard evaluation gate**: non-ACTIVE rules cannot return APPLICABLE; engine downgrades to CONDITIONAL with explanation
   - Date-aware evaluation: compare temporal scope against SOP / approvalType / firstRegistrationDate
   - Missing input detection
   - Config builder: `VehicleConfig → EngineConfig` with derived flags
   - `computeSummary(results)` → aggregate statistics
   - `evaluateAllRules(rules, config)` → batch evaluation

4. **Registry integrity validation**
   - All ACTIVE rules have `sources[0].official_url != null`
   - All ACTIVE rules have `sources[0].last_verified_on != null`
   - No duplicate `stable_id` values
   - All `legal_family` values are valid enum members
   - All `framework_group` values are valid enum members
   - Coverage report per legal family

### Exit criteria

- [ ] All ~34 seed rules pass Zod schema validation
- [ ] Engine correctly evaluates: APPLICABLE (ACTIVE only), NOT_APPLICABLE, CONDITIONAL, UNKNOWN, FUTURE
- [ ] Hard gate verified: SEED_UNVERIFIED rule never returns APPLICABLE
- [ ] Explainability payload non-empty for every evaluation
- [ ] Declarative conditions cover ~80% of rules; custom evaluators used only where documented
- [ ] Registry integrity check passes
- [ ] Engine is pure — no global state, no side effects, no UI imports

### Open items for human review
- Validate trigger logic for each legal family
- Confirm seed rules accurately represent obligation scope
- Verify ACTIVE rule EUR-Lex URLs resolve

---

## Phase 3: Configuration UI

**Goal:** Full input interface for vehicle program configuration.

### Deliverables

1. **Sidebar configuration panel (desktop)**
   - Project section: name, code, SOP date, first registration date (recommended), sales model
   - Vehicle section: framework group → category (dependent), body type, approval type, steering, completion
   - Powertrain section: type → battery flags (conditional), charging capability
   - Automation section: level → ADAS features (conditional), parking/motorway/lane-change
   - Connectivity section: flag chips
   - Data/privacy section: flag chips
   - AI section: level → inventory toggle (conditional)
   - Readiness section: checkboxes
   - Market section: country chips with EU / non-EU separation, UK warning

2. **Dependent field behavior** per data model §8.2

3. **Config persistence**
   - Save/load via localStorage
   - Save named configurations
   - Reset to defaults
   - URL query parameter serialization for sharing

4. **Responsive layout**
   - Desktop: left sidebar + right results
   - Tablet: collapsible top config section
   - Mobile: vertically stacked (wizard-style in post-MVP)

### Exit criteria

- [ ] All VehicleConfig fields editable
- [ ] Dependent fields show/hide correctly
- [ ] Config persists across reloads
- [ ] URL encode/decode round-trips correctly
- [ ] Reset works
- [ ] Named config save/load works

### Open items for human review
- UX review of field ordering
- Verify controlled vocabulary (body types, completion states) matches industry terminology

---

## Phase 4: Results View & Explainability

**Goal:** Display evaluation results with grouping, filtering, badges, and full explainability.

### Deliverables

1. **Summary metrics** — cards for: applicable, conditional, future, unknown, not applicable, manual review
2. **Three view modes** — business (ui_package), legal (legal_family), process (process_stage)
3. **Group display** — collapsible headers with counts
4. **Rule card** with:
   - Applicability badge, lifecycle state badge, manual review badge
   - Title, stable_id, source references, jurisdiction
   - Explanation (always visible)
   - Expandable detail: obligation, evidence, owner, temporal scope, exclusions, matched/unmatched conditions, missing inputs, sources list, notes
   - `was_downgraded_from_applicable` indicator where relevant
5. **Filtering** — search box, applicability dropdown, real-time update
6. **Disclaimer banner** — persistent, non-dismissible

### Exit criteria

- [ ] All three view modes render correctly
- [ ] Rule cards show all required fields
- [ ] Explainability payload visible in expanded view
- [ ] Manual review badge on all `manual_review_required: true` rules
- [ ] Lifecycle state badges distinguish ACTIVE from SEED/DRAFT
- [ ] Search and filter work
- [ ] Results update on config change

### Open items for human review
- Verify badge colors are accessible
- Confirm information density is manageable

---

## Phase 5: Annotations, Comparison, Export

**Goal:** User workflow features.

### Deliverables

1. **Annotations** — per-rule status (todo/in_progress/done/not_relevant), per-rule notes, bulk status update
2. **Comparison** — load saved config as baseline, show delta badges, exit compare mode
3. **Export** — CSV, JSON, Markdown, print-friendly view (all include disclaimer and copyright)
4. **Tabs** — Sources, Evidence Pack (aggregated/deduped), Assumptions, Change Log

### Exit criteria

- [ ] Statuses and notes persist across reloads
- [ ] Bulk status update works
- [ ] Comparison deltas correct
- [ ] All exports produce valid output with all `ExportRow` fields
- [ ] Sources tab lists all rules with governance metadata
- [ ] Evidence pack aggregates without duplication

### Open items for human review
- Confirm export fields match compliance team needs
- Review evidence aggregation logic

---

## Phase 6: Testing, Documentation, Cleanup

**Goal:** Comprehensive testing and finalized documentation.

### Deliverables

1. **Unit tests (Vitest)**
   - Declarative condition interpreter: all operator types
   - Hard evaluation gate: SEED_UNVERIFIED → max CONDITIONAL
   - Date-aware evaluation: multi-date temporal scope
   - Missing input → UNKNOWN
   - Config builder: derived flags
   - Export format validation
   - Registry integrity

2. **Integration tests**
   - Full pipeline: config → engine → results → summary
   - Comparison: two configs produce correct delta
   - Persistence round-trip

3. **Source integrity tests**
   - No ACTIVE rule with null `sources[0].official_url`
   - No ACTIVE rule with null `sources[0].last_verified_on`
   - All `stable_id` unique
   - All enum fields valid

4. **E2E smoke tests (Playwright)**
   - Select MN → M1 → BEV → verify Battery Regulation applicable
   - Select L → verify L-cat rules fire, MN-only rules do not
   - Select L3 → verify R157 triggers
   - Add UK → verify UK rules appear
   - CSV export → verify file content

5. **Documentation finalized**
   - README.md complete
   - docs/rule-authoring-guide.md with examples (declarative + custom)
   - All docs updated to final state
   - Copyright in all source files: © Yanhao FU

### Exit criteria

- [ ] All unit tests pass
- [ ] Source integrity tests pass
- [ ] E2E smoke tests pass
- [ ] README accurately describes current state
- [ ] Rule authoring guide is usable by a new team member

---

## Risk list

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| R-01 | Seed rules contain inaccurate trigger logic | HIGH | HIGH | Hard gate prevents non-ACTIVE from returning APPLICABLE. Manual review required for all. |
| R-02 | Users treat output as legal advice | HIGH | CRITICAL | Persistent disclaimer. Exports include disclaimer. README states limitations. |
| R-03 | Regulations change, making seeds stale | HIGH | MEDIUM | Review cadence. Stale rules flagged. last_verified_on displayed. |
| R-04 | Trigger logic too simplistic for edge cases | MEDIUM | MEDIUM | CONDITIONAL result with explanation. Custom evaluators for complex cases. |
| R-05 | Missing regulatory families | MEDIUM | MEDIUM | 13-family taxonomy with PLACEHOLDER support. |
| R-06 | L-category / O-category undertested | HIGH | LOW | Secondary scope, clearly marked. |
| R-07 | UI overwhelms users | MEDIUM | MEDIUM | Three view modes. Search/filter. Collapsible groups. |
| R-08 | Declarative conditions insufficient for some rules | LOW | LOW | Custom evaluator hook escape hatch. |
| R-09 | ACTIVE promotion too slow | MEDIUM | MEDIUM | 14 ACTIVE candidates identified. Clear promotion criteria. |
| R-10 | Fabricated legal content | LOW | CRITICAL | No fabricated URLs. Integrity tests. Correction ledger. |

---

## Post-MVP roadmap

1. Rule decomposition (Battery Reg phases, AI Act interactions)
2. UNECE regulation matrix (full Annex II mapping)
3. Rule authoring UI for non-developers
4. Database migration via registry adapter
5. Automated URL liveness checking in CI
6. Multi-user collaboration
7. Registry version control and diff
8. API layer for tool integration
9. Review cadence notifications
10. Extended market coverage (CH, TR, JP, CN, US)
