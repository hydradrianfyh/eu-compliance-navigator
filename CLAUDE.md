@AGENTS.md

# EU Vehicle Compliance Navigator

## Canonical documents
- @README.md
- @docs/phase0/architecture.md
- @docs/phase0/data-model.md
- @docs/phase0/implementation-plan.md
- @docs/phase0/seed-rule-candidate-list.md
- @docs/source-policy.md
- @docs/rule-authoring-guide.md
- @docs/review-checklist.md

## Project rules
- Treat docs/phase0/* + docs/source-policy.md + docs/rule-authoring-guide.md as canonical.
- Do not invent legal sources or official URLs. No exceptions.
- Non-ACTIVE rules must never return APPLICABLE.
- PLACEHOLDER rules must always return UNKNOWN.
- Declarative trigger logic is the default.
- Custom evaluators are allowed only for exceptional cases (must be named and documented).
- If prose conflicts with schema/governance rules, schema/governance rules win.
- Current active work is Phase 11 (pilot-driven work guidance). Phases 1–9 are complete.
- Geographic scope is EU 27 + UK + EEA + CH only.
- `fixtures/pilot-my2027-bev.*` is the regression anchor — treat any change to expected output as needing explicit justification.