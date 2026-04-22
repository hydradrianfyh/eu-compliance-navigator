# Phase J — Production Readiness Sprint

Phase J artifacts. For the prior Phase I plan see
`docs/superpowers/plans/2026-04-20-phase-i-breadth.md`. The full Phase J plan
lives outside the repository (`~/.claude/plans/velvety-popping-anchor.md`).

Phase J's focus is cleaning up the verification debt accumulated during the
breadth expansion: promoting SEED_UNVERIFIED / DRAFT / PLACEHOLDER rules to
ACTIVE once a human reviewer has attached an authoritative source, recorded
the OJ/gazette citation, and stamped a verification date.

## Current status (post Phase L.6, 2026-04-22)

**Registry state**: 205 rules · **101 ACTIVE** (up from 34 at Phase J ship) · 236 tests green.

> Phase L.1–L.6 extended Phase J's source-governance work: UNECE factory unlock (L.1) + 11 authored stubs (L.2) + 12 BEV-priority promotions (L.3) + 9 new R-numbers as stubs (L.4) + 14 second-batch promotions (L.5) + 2 ES SEED cleanups (L.6). Net effect: 73 → 101 ACTIVE (+28), backlog 123 → 104. See [docs/phase-l/README.md](../phase-l/README.md).

### Human-review rounds completed

| Round | Scope | Outcome |
|---|---|---|
| **Round 1** | DE targeted | `379e574`, `b23ebfb` — promoted REG-MS-DE-006 E-Kennzeichen, DE-008, DE-010 to ACTIVE; enriched DE-007 + DE-009 (DE-009 flagged for architectural split follow-up). |
| **Round 2a** | EU emissions + battery | `8fa919b` — 8 emissions rules + 2 battery sub-obligations promoted to ACTIVE (Euro 7 combustion split, OBD, EVAP, AdBlue family). |
| **Round 2c** | ES country batch | `b8fdc7c` — 7 Spain rules promoted to ACTIVE with honest per-rule "why pending" reasons on the remaining 7. |
| **Round 3 · UK** | UK non-EU market | `79e3574` — 10 UK rules promoted to ACTIVE (AV Act 2024 cluster + post-Brexit registration + UK ETS). |
| **Round 3 · FR** | FR country batch | `d42ec2f` — 5 France rules promoted to ACTIVE; 7 remaining at null-URL / DRAFT. |
| **Round 3 · EU** | EU residual | `afc4f50` — 4 remaining EU-horizontal rules promoted to ACTIVE. |

**Total promoted since Phase J ship**: 39 rules (34 → 73 ACTIVE) in rounds 1–3; plus 28 more in Phase L.3 / L.5 / L.6 (73 → 101 ACTIVE).

### Backlog state

After Phase L.6, **104 rules** remain non-ACTIVE. Regenerate with `npm run verification-backlog` — [verification-backlog.md](./verification-backlog.md) is the live snapshot.

### Next up

- **NL batch** — 5 SEED_UNVERIFIED rules authored, awaiting EUR-Lex (NL gazette) URL verification. 0 ACTIVE today.
- **DE-009 architectural split** — KBA rule needs separation into cleaner sub-rules (flagged during round 1).
- **UNECE Annex II residual** — 17 SEED_UNVERIFIED technical regulations (down from 43): HD / bus / niche rules (R13, R49, R58, R66, R67, R85, R110, R115, R118, R135, R137) + 6 L.5 holdouts (R25, R51, R101, R140, R34, R145). L.3 + L.5 promoted 26 R-series rules to ACTIVE.
- **L.4 new stubs** — 9 R-numbers (R7, R28, R30, R87, R112, R113, R116, R125, R128) await deep-link verification in L.7.
- **ES-008 Homologación Individual** — RD 750/2010 BOE URL confirmed, Orden ministerial citation still pending (L.6 research documented).
- **FR remainder** — 7 rules at null-URL / DRAFT.
- **Phase K+ / L+ UX** — K.0 (Why-indicative callout), K.1 (scope banner refresh), K.2 (exec summaries), K.3 (doc refresh) shipped; K.4 (homologation manual) live; L.1-L.6 shipped.

## Contents

- [`verification-backlog.md`](./verification-backlog.md) — auto-generated
  list of rules pending human source verification, grouped by jurisdiction,
  with per-rule URL / OJ / verification-date status, recommended reviewer
  track (from `owner_hint`), and a domain-based effort estimate (S/M/L).

## Regenerating the backlog

After any rule is added, any `lifecycle_state` changes, or any source field
is updated, regenerate the markdown:

```bash
npm run verification-backlog
git diff docs/phase-j/verification-backlog.md  # audit what changed
```

Equivalent long form:

```bash
npx tsx scripts/emit-verification-backlog.ts > docs/phase-j/verification-backlog.md
```

The script reads `rawSeedRules` (post-enrichment) and filters to rules whose
`lifecycle_state` is one of `SEED_UNVERIFIED`, `DRAFT`, `PLACEHOLDER`. It
has no network access, writes nothing other than stdout, and is safe to run
in any environment.

## Human-verification flow

For each rule in the backlog:

1. Look up the authoritative source (EUR-Lex ELI URL, UNECE portal, national
   gazette — see `docs/source-policy.md` for the Tier-1 source list).
2. On the rule's seed entry, populate:
   - `sources[0].official_url` — verified, resolvable URL.
   - `sources[0].oj_reference` — Official Journal / national gazette citation
     (if applicable for the source family).
   - `sources[0].last_verified_on` — today's date in ISO form.
3. Populate `content_provenance.human_reviewer` with the reviewer's identity
   and `content_provenance.retrieved_at` with the retrieval date.
4. Ensure `last_human_review_at` and `review_cadence_days` are set (required
   for ACTIVE per `docs/phase0/architecture.md` §6.2).
5. Change `lifecycle_state` from `SEED_UNVERIFIED` / `DRAFT` to `ACTIVE`
   (PLACEHOLDER requires full authoring first, not just promotion).
6. Add a `promotionLog` entry per `src/config/schema.ts` promotion-log
   schema, naming the reviewer and the date.
7. Run `npx tsc --noEmit`, `npm run lint`, `npx vitest run` — all must stay
   green. Update any regression-anchor expected outputs in the same PR if
   applicability changes.
8. Open a PR and require review by another domain specialist before merge.

## Scope

Phase J.4 ships the backlog artifact and the generator script. The
promotions themselves are a separate human-review workstream — this
directory is where the backlog lives; `src/registry/seed/*.ts` is where
the edits happen once a rule is verified.
