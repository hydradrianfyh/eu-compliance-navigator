# Source Policy

## Purpose
This document defines what qualifies as an authoritative source for this repository, and what may or may not be used to activate a rule.

## Canonical baseline
For repository architecture and rule model, see:
- `docs/phase0/architecture.md`
- `docs/phase0/data-model.md`
- `docs/phase0/seed-rule-candidate-list.md`

## Source hierarchy

### Tier 1 — authoritative legal source
These may support `ACTIVE` rules if verified:
1. EUR-Lex / Official Journal text
2. UNECE official regulation text
3. European Commission official adopted acts / official pages
4. Official EU agency guidance (EDPB, ECHA, etc.)
5. Official member-state authority / gazette sources
6. Official non-EU market authority sources (for non-EU market rules)

### Tier 2 — reference-only source
These may support authoring, taxonomy, or monitoring, but cannot alone activate a rule:
1. Uploaded PDFs
2. Internal summaries
3. Consultancy reports
4. Industry publications
5. News articles
6. LLM-generated analysis

## Activation rule
A rule may be stored as `ACTIVE` only if:
- it has at least one verified authoritative source;
- at least one `SourceReference` contains:
  - `official_url != null`
  - `last_verified_on != null`

If those fields are missing, the rule must remain at most:
- `SEED_UNVERIFIED`, or
- `DRAFT`

## Hard prohibitions
- Never fabricate official URLs.
- Never fabricate verification dates.
- Never use uploaded PDF / memo / LLM prose as the sole basis for `ACTIVE`.
- Never convert proposal-stage text into `ACTIVE`.

## Proposal vs adopted text
- Adopted legal text published in official channels may support `ACTIVE`.
- Proposals, consultations, roadmaps, and draft texts may support only `DRAFT` or `PLACEHOLDER`.

## Human responsibility
- Legal/source owner: human reviewer
- Code implementation owner: Codex / developer
- Final gatekeeper for promotion to `ACTIVE`: human reviewer