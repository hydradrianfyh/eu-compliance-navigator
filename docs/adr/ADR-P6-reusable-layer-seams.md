# ADR-P6 · Architecture reusable-layer seams (identify, do NOT extract)

**Status**: Proposed · Sprint 9 spike output
**Date**: 2026-04-19
**Reviewer**: yanhao
**Related ADRs**: ADR-P1 (keep localStorage), ADR-P7 (defer variant delta)

## Context

The product's long-term positioning (plan §0.2 IS NOT list) rules out
multi-tenant rebuild, but the hidden goal (plan §1.8) asks us to know
which layers could be lifted and shipped to another OEM project without
a rewrite. Sprint 9 is a 1-week spike: **read the code, draw the seams,
write this ADR, do NOT change code**.

Deliberate scope: do not pre-abstract, do not carve a monorepo, do not
introduce an adapter layer. Only identify where the natural seam is so
a future Phase 14+ extraction has a clear-eyed starting point.

## Decision

Treat the codebase as having three layers with different degrees of
project-coupling. Mark the seams in this ADR; leave extraction for
Phase 14+ unless a second OEM project materializes.

### Layer 1 · Project-invariant core (truly reusable)

| Path | Role | Why invariant |
|------|------|---------------|
| `src/registry/schema.ts` | Rule, ContentProvenance, TemporalScope, TriggerLogic schemas | Domain-neutral — the shapes hold for any regulated product (medical devices, aviation, food) |
| `src/registry/governance.ts` | Lifecycle state machine (PLACEHOLDER..SHADOW..ACTIVE) + promotion gate | Independent of what's being regulated |
| `src/registry/freshness.ts` | 6-state freshness model (Sprint 5) | Pure date math + enum |
| `src/registry/registry.ts` | Registry query/filter API | Generic over Rule schema |
| `src/registry/verification.ts` | Verification queue workflow | Generic process pattern |
| `src/registry/coverage-matrix.ts` | Lifecycle distribution / gap analysis | Generic over LegalFamily × ProcessStage |
| `src/engine/declarative.ts` | Trigger interpreter | Generic expression language, no automotive knowledge |
| `src/engine/temporal.ts` | Temporal-scope evaluator | Date math |
| `src/engine/governance` (in evaluator) | Hard-gate: non-ACTIVE → max CONDITIONAL | Invariant |
| `src/lib/classify-trust.ts` | Trust classification | Schema-generic |
| `src/lib/condition-to-text.ts` | NL translator for conditions | String transformation |
| `src/lib/format-months.ts` | Overdue/remaining formatter | Pure |
| `src/lib/golden-dataset.ts` | Golden dataset loader + diff | Generic over rule shape |
| `src/components/shared/*` | TrustBadge / ApplicabilityBadge / EmptyState / ExpandAllToggle / ExportAsPdfButton / CompareToggle | UI primitives |
| `src/components/shell/*` | AppShell / GlobalNav / TabNav / StatusBar / LastActiveTabTracker | Shell chrome |
| `src/state/app-shell-store.ts` | zustand store pattern | Generic |
| `src/styles/tokens.css` | Semantic tokens | Generic |

**~60-70% of LOC sit in Layer 1** and could be packaged as
`@ocn/compliance-core` in a future monorepo.

### Layer 2 · Automotive-domain bindings

| Path | Role | Why coupled |
|------|------|-------------|
| `src/config/schema.ts` | `VehicleConfig` shape | Automotive-specific fields (frameworkGroup M/N/O/AGRI, vehicleCategory M1/N1, powertrain ICE/HEV/PHEV/BEV, automationLevel L0-L4+, etc.) |
| `src/engine/config-builder.ts` | VehicleConfig → EngineConfig derived flags | Knows automotive semantics (batteryPresent, hasAI, targetsEU) |
| `src/engine/by-owner.ts` | Owner dashboard | Owner hints are automotive roles (homologation, cybersecurity) |
| `src/engine/executive-summary.ts` | canEnterMarket + blockers | References automotive concepts (third_party_verification_required, type approval) |
| `src/engine/timeline.ts` | SOP-anchored timeline | SOP = Start-Of-Production is automotive terminology |
| `src/shared/constants.ts` | Enums (LegalFamily, FrameworkGroup, OwnerHint, VehicleCategory, …) | Automotive vocabularies |
| `src/components/setup/*` | Config panel fields | Automotive input domain |
| `src/components/rules/RuleCardV2.tsx` | Rule card 5-section layout | References VehicleConfig indirectly via result |

**~20% of LOC**. Could be repackaged for another **vehicle/homologation**
project (e.g. VW vs Stellantis) with only content swaps. Would need
adapter work for a **different industry** (aviation, pharma).

### Layer 3 · Pilot-specific content & wiring (MY2027 BEV × DE)

| Path | Role |
|------|------|
| `src/registry/seed/*` (17 files) | 137 rule seeds |
| `content/golden-dataset.json` | 21 anchor rules |
| `fixtures/pilot-*.ts` | Pilot configurations |
| `src/components/shell/ScopeBanner.tsx` | Hard-codes "EU horizontal + DE overlay · FR/NL pending" |
| `src/components/shell/GlossaryModal.tsx` | Domain glossary |
| `src/components/setup/OnboardingBanner.tsx` | "Load MY2027 BEV sample" |
| `src/app/(workspace)/*/page.tsx` | Tab pages wired to pilot context |
| `docs/phase12/demo-scripts/*` | Demo scripts named after pilot personas |

**~10-15% of LOC**. Fully project-specific. Would be rewritten per
engagement.

## Consequences

- **Positive**: if a second OEM project arrives, the team can credibly
  say "~60% of the code comes for free" after identifying Layer 1
  vs Layer 3. The schema and engine patterns do most of the heavy
  lifting.
- **Positive**: the ADR anchors future discussion — no one has to
  re-derive the seam map.
- **Negative**: the seams are **not enforced**; nothing stops a drive-by
  commit from importing `fixtures/pilot-my2027-bev` into
  `src/engine/`. A CI lint rule (future) could enforce it.
- **Negative / known debt**: `src/shared/constants.ts` mixes invariant
  enums (ApplicabilityResult, RuleLifecycleState) with automotive
  enums (OwnerHint, FrameworkGroup). Splitting would be a ~1-day task
  but is explicitly deferred (plan §3.6 Non-goal #12).
- **Negative / known debt**: `engine/by-owner.ts` uses OwnerHint
  directly, so it's currently Layer 2. Generalising to any role
  vocabulary is feasible but deferred.

## Non-decisions (explicit)

Per plan §3.6 Non-goal #12 **"Not early code extraction"**, this ADR:

- Does **NOT** propose monorepo split.
- Does **NOT** propose extracting Layer 1 into `@ocn/compliance-core`.
- Does **NOT** propose an adapter interface between Layers 1 and 2.
- Does **NOT** add any `index.ts` / barrel file.
- Does **NOT** introduce CI lint rules.

These are Phase 14+ considerations that require a second OEM project
(or equivalent business case) to justify.

## Directory seam summary (one-glance map)

```
Layer 1 (~60-70% LOC, project-invariant)
├── src/registry/{schema,governance,freshness,registry,verification,coverage-matrix}.ts
├── src/engine/{declarative,temporal,evaluator(gate only)}.ts
├── src/lib/{classify-trust,condition-to-text,format-months,golden-dataset}.ts
├── src/components/shared/*
├── src/components/shell/{AppShell,GlobalNav,TabNav,StatusBar,LastActiveTabTracker}.tsx
├── src/state/app-shell-store.ts
└── src/styles/tokens.css

Layer 2 (~20% LOC, automotive-bound)
├── src/config/schema.ts
├── src/engine/{config-builder,by-owner,executive-summary,timeline}.ts
├── src/shared/constants.ts (partial — automotive enums)
├── src/components/setup/*
└── src/components/rules/RuleCardV2.tsx

Layer 3 (~10-15% LOC, pilot-specific)
├── src/registry/seed/* (17 files)
├── content/golden-dataset.json
├── fixtures/*
├── src/components/shell/{ScopeBanner,GlossaryModal,OnboardingBanner}.tsx
├── src/app/(workspace)/*/page.tsx
└── docs/phase12/demo-scripts/*
```

## Related

- Plan doc §1.8 (hidden goal), §3.5 (ADRs), §3.6 Non-goal #12
- Future Phase 14+ ADR-P6-bis will decide extraction strategy **if** a
  second OEM project materialises.

---

© Yanhao FU
