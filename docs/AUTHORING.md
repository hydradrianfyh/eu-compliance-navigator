# Authoring Workflow for Compliance Specialists

This guide is for compliance team members who need to add or update rule
content (evidence requirements, freshness, submission timing) **without writing
TypeScript**.

## Why this exists

The registry is defined in TypeScript for type safety, but compliance specialists
work with legal texts, not code. This workflow lets you maintain rule content
in a spreadsheet and have the system auto-generate the TypeScript.

## The workflow

### 1. Open `content/authoring.csv`

The file lives at the repository root under `content/authoring.csv`. Open it with:

- Microsoft Excel
- Google Sheets (File → Import → `authoring.csv`)
- LibreOffice Calc

### 2. Fill in one row per rule

Columns:

| Column | Required | Format | Example |
|---|---|---|---|
| `stable_id` | yes | REG-XX-NNN | `REG-EM-001` |
| `last_human_review_at` | when verified | YYYY-MM-DD | `2026-04-16` |
| `review_cadence_days` | no | integer | `180` |
| `change_watch_method` | no | one of: `eur-lex-sparql`, `unece-rss`, `national-manual` | `eur-lex-sparql` |
| `third_party_verification_required` | no | Y / N | `Y` |
| `recurring_post_market_obligation` | no | Y / N | `Y` |
| `submission_timing` | no | free text | `Before SOP` |
| `language_or_localization_need` | no | free text | `Privacy notice in local language` |
| `required_documents` | no | pipe(`|`)-separated | `DPIA|Record of processing|Privacy policy` |
| `required_evidence` | no | pipe(`|`)-separated | `DPIA completion record|Consent evidence` |

Rules:

- Leave a cell **empty** to skip that field (the existing TypeScript data stays).
- Use `|` (pipe) to separate items in list fields.
- Wrap fields containing commas in double quotes (`"`).
- Save as CSV (UTF-8).

### 3. Run the generator

From the project root:

```bash
node scripts/generate-authoring-data.mjs
```

This reads `content/authoring.csv` and writes `src/registry/seed/authoring-generated.ts`.

### 4. Verify locally

```bash
npx vitest run
```

All tests should pass. If they don't, the failing test will tell you which
rule you just changed and why.

### 5. Commit

Commit **both** files together:

```bash
git add content/authoring.csv src/registry/seed/authoring-generated.ts
git commit -m "content(authoring): update evidence for REG-XX-NNN"
```

Open a pull request. A reviewer will merge after verifying sources.

## Rules of thumb

- **Add one rule at a time** when you're learning. Batch later.
- **Always fill `last_human_review_at`** when you verify a rule against the
  official source (EUR-Lex, UNECE). This is what the freshness watcher uses.
- **Keep `required_documents` and `required_evidence` short and actionable.**
  Each item should be something a project team can produce.
- **Don't edit** `src/registry/seed/authoring-generated.ts` by hand -- your
  changes will be overwritten next time the generator runs.

## Troubleshooting

### "Skipping invalid stable_id"

The `stable_id` must match the `REG-XX-NNN` pattern (letters/digits, separated
by dashes). Check the registry for existing rule IDs.

### Generator says "Processed 0 rule(s)"

Every row was either blank or had only the `stable_id` column filled.
Fill at least one other column.

### Tests fail with type errors

A list field (documents/evidence) probably had a stray character that broke
the JSON. Open `authoring-generated.ts` and search for your `stable_id` to see
what was written.

## For engineers

The generator is deterministic and uses `Object.keys()` order to preserve
diff stability. `authoring-generated.ts` is checked in; CI will fail if you
edit `authoring.csv` but forget to re-run the generator.
