# AGENTS.md

## Mission
Build the EU Vehicle Compliance Navigator incrementally toward pilot-driven work guidance for EU 27 + UK + EEA (NO/IS/LI) + CH.

## Canonical baseline
- docs/phase0/architecture.md
- docs/phase0/data-model.md
- docs/phase0/implementation-plan.md
- docs/phase0/seed-rule-candidate-list.md
- docs/phase11/roadmap.md (to be authored — pilot-driven work guidance plan)
- fixtures/pilot-my2027-bev.ts + fixtures/pilot-my2027-bev.expected.ts (regression anchor)

## Current allowed scope
- Phases 1–9: complete (scaffold, engine, UI, persistence, compare, report, coverage, evidence).
- Phase 11: active. Sub-phases 11A (pilot fixture), 11B (evidence enrichment + source verification), 11C (member-state overlays — DE first, FR/NL next), 11D (freshness contract), 11E (timeline + executive summary).

## Out of scope (geographic)
Do not add or evaluate rules for: CN, JP, US, Turkey, Western Balkans (RS/ME/MK/BA/AL/XK). EU 27 + UK + EEA (NO/IS/LI) + CH only.

## Hard constraints (unchanged)
- Do not fabricate official URLs or Official Journal references.
- Do not weaken lifecycle governance.
- Do not let non-ACTIVE rules return APPLICABLE.
- PLACEHOLDER rules always return UNKNOWN.
- If a seed rule is labeled ACTIVE in prose but lacks verified source fields in code, downgrade to SEED_UNVERIFIED.
- Declarative trigger logic is the default; custom evaluators only for documented exceptions.
- If prose conflicts with schema or governance rules, schema/governance wins.

## Phase 11 additional constraints
- `fixtures/pilot-my2027-bev.expected.ts` is the regression anchor. `applicable_rule_ids` may grow but must not shrink without recorded review.
- When schema (src/config/schema.ts, src/shared/constants.ts, src/registry/schema.ts) changes, update affected tests in the same PR — tests/unit/*.test.ts and tests/ui/*.test.tsx must stay green.
- Source verification (SEED_UNVERIFIED → ACTIVE) requires all three: `official_url`, `oj_reference`, `last_verified_on`. No promotion without human verification recorded in `promotionLog`.
- Freshness: `last_human_review_at` and `review_cadence_days` must be filled when a rule is promoted to ACTIVE.