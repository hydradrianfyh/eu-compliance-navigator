# Correction Ledger

## Purpose
This file is the short governance-facing summary of the major design corrections already incorporated into the project baseline.

## Canonical detailed sources
For the full merged baseline, see:
- `docs/phase0/architecture.md`
- `docs/phase0/data-model.md`
- `docs/phase0/implementation-plan.md`
- `docs/phase0/merge-report.md`

## Core corrections already adopted
1. L-category is not evaluated under the M/N/O framework path.
2. UK is not treated as an EU member-state overlay.
3. UI grouping is display-only, not the legal ontology.
4. Source governance is mandatory.
5. Lifecycle state is distinct from evaluation certainty.
6. Multi-date temporal scope is required for automotive phase-in logic.
7. Declarative trigger logic is default; custom evaluators are exceptional.
8. Non-ACTIVE rules cannot return `APPLICABLE`.
9. `PLACEHOLDER` rules must return `UNKNOWN`.
10. Canonical baseline lives in `docs/phase0/*`.

## Review reminder
If prose in seed candidate notes conflicts with:
- schema rules,
- governance rules,
- lifecycle rules,
the canonical governance and schema rules win.

## Implementation reminder
These corrections are not optional design preferences.
They are implementation constraints.