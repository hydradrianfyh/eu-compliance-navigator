# Phase J — Production Readiness Sprint

Phase J artifacts. For the prior Phase I plan see
`docs/superpowers/plans/2026-04-20-phase-i-breadth.md`. The full Phase J plan
lives outside the repository (`~/.claude/plans/velvety-popping-anchor.md`).

Phase J's focus is cleaning up the verification debt accumulated during the
breadth expansion: promoting SEED_UNVERIFIED / DRAFT / PLACEHOLDER rules to
ACTIVE once a human reviewer has attached an authoritative source, recorded
the OJ/gazette citation, and stamped a verification date.

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
