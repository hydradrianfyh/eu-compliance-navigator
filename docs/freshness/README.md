# Freshness watcher

This directory holds outputs from the EUR-Lex / UNECE freshness watcher
(`scripts/eur-lex-watch.mjs`).

## Files

- `last-check.json` — most recent watcher run, all probes
- `change-signals.json` — rules detected as modified since `--since` date

## Running locally

```bash
# Check all sources, don't write anything
node scripts/eur-lex-watch.mjs --dry-run

# Check and write reports, detect changes since last week
node scripts/eur-lex-watch.mjs --since 2026-04-01
```

## GitHub Action

The workflow `.github/workflows/eur-lex-watch.yml` runs every Monday
at 06:00 UTC and:

1. Polls EUR-Lex SPARQL for every CELEX-backed ACTIVE rule.
2. Polls UNECE HEAD requests for every UNECE-backed ACTIVE rule.
3. If a change signal is detected since the previous run, opens a GitHub
   issue tagged `freshness,needs-review` listing the affected `stable_id`s.
4. Commits the updated `docs/freshness/*.json` so future runs have a baseline.

## Watchlist

Kept in sync with `src/registry/seed/freshness-data.ts`.

- **EUR-Lex** (10 rules): every CELEX-identified EU regulation
- **UNECE** (5 rules): every UN Regulation referenced by `REG-UN-*` or
  `REG-CS-*` with verified sources
- **National manual** (5 rules — DE overlay): excluded from automated watcher;
  relies on quarterly human review

## Interpreting signals

A change signal only means "the source document's metadata changed" —
not that the *rule in this registry is wrong*. A human reviewer must:

1. Read the EUR-Lex diff (or UNECE amendment note)
2. Decide if the rule's `obligation_text`, `evidence_tasks`,
   `required_documents`, `temporal` need updating
3. Update `last_human_review_at` in `src/registry/seed/freshness-data.ts`
4. Close the tracking issue
