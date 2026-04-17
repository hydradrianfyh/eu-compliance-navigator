#!/usr/bin/env node
/**
 * Compliance Author DSL generator.
 *
 * Reads content/authoring.csv (a simple CSV that compliance specialists can
 * maintain in Excel/Google Sheets/Notion) and generates:
 *
 *   src/registry/seed/authoring-generated.ts
 *
 * which is merged into rule enrichment by src/registry/seed/index.ts.
 *
 * ============================================================
 * Why CSV?
 * ============================================================
 * Engineers commit TypeScript.
 * Compliance specialists commit CSV.
 * This script is the bridge.
 *
 * Compliance workflow:
 *   1. Open content/authoring.csv in Excel / Google Sheets / LibreOffice Calc.
 *   2. Fill or update a row for each rule you own.
 *   3. Save as CSV (UTF-8).
 *   4. Run: node scripts/generate-authoring-data.mjs
 *   5. Commit both the CSV and the generated .ts file.
 *
 * Columns (header row is required):
 *   stable_id                           REG-* identifier
 *   last_human_review_at                ISO date YYYY-MM-DD
 *   review_cadence_days                 integer (180 default for ACTIVE)
 *   change_watch_method                 eur-lex-sparql | unece-rss | national-manual
 *   third_party_verification_required   Y | N
 *   recurring_post_market_obligation    Y | N
 *   submission_timing                   free text
 *   language_or_localization_need       free text
 *   required_documents                  pipe(|)-separated list
 *   required_evidence                   pipe(|)-separated list
 *
 * Empty cell == skip that field (existing enrichment prevails).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "content", "authoring.csv");
const OUTPUT = path.join(ROOT, "src", "registry", "seed", "authoring-generated.ts");

function parseCsvLine(line) {
  // Minimal CSV parser: handles quoted fields with embedded commas.
  const fields = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  fields.push(cur);
  return fields.map((f) => f.trim());
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });

  return { headers, rows };
}

function parseBool(s) {
  if (!s) return undefined;
  const v = s.trim().toUpperCase();
  if (v === "Y" || v === "YES" || v === "TRUE" || v === "1") return true;
  if (v === "N" || v === "NO" || v === "FALSE" || v === "0") return false;
  return undefined;
}

function parseList(s) {
  if (!s) return undefined;
  const items = s
    .split("|")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  return items.length > 0 ? items : undefined;
}

function parseInt(s) {
  if (!s) return undefined;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseString(s) {
  const trimmed = s?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function toTypescript(entries) {
  const header = `// AUTO-GENERATED from content/authoring.csv
// Do NOT edit by hand -- run \`node scripts/generate-authoring-data.mjs\`.
// Owner: compliance team.

import type { Rule } from "@/registry/schema";

type AuthoringEntry = Pick<
  Rule,
  | "last_human_review_at"
  | "review_cadence_days"
  | "change_watch_method"
  | "third_party_verification_required"
  | "recurring_post_market_obligation"
  | "submission_timing"
  | "language_or_localization_need"
  | "required_documents"
  | "required_evidence"
>;

export const authoringGenerated: Record<string, AuthoringEntry> = `;

  const body = JSON.stringify(entries, null, 2);
  return `${header}${body};\n`;
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`[authoring] Input not found: ${INPUT}`);
    process.exit(1);
  }

  const text = fs.readFileSync(INPUT, "utf8");
  const { headers, rows } = parseCsv(text);

  const REQUIRED = ["stable_id"];
  for (const col of REQUIRED) {
    if (!headers.includes(col)) {
      console.error(`[authoring] Missing required column: ${col}`);
      process.exit(1);
    }
  }

  const entries = {};
  let skipped = 0;
  let processed = 0;

  for (const row of rows) {
    const id = row.stable_id?.trim();
    if (!id) {
      skipped++;
      continue;
    }
    if (!/^REG-[A-Z]+-[A-Z0-9-]+$/i.test(id)) {
      console.warn(`[authoring] Skipping invalid stable_id: ${id}`);
      skipped++;
      continue;
    }

    const entry = {};
    const last = parseString(row.last_human_review_at);
    if (last) entry.last_human_review_at = last;

    const cadence = parseInt(row.review_cadence_days);
    if (cadence !== undefined) entry.review_cadence_days = cadence;

    const watch = parseString(row.change_watch_method);
    if (watch) entry.change_watch_method = watch;

    const third = parseBool(row.third_party_verification_required);
    if (third !== undefined) entry.third_party_verification_required = third;

    const recurring = parseBool(row.recurring_post_market_obligation);
    if (recurring !== undefined) entry.recurring_post_market_obligation = recurring;

    const timing = parseString(row.submission_timing);
    if (timing) entry.submission_timing = timing;

    const lang = parseString(row.language_or_localization_need);
    if (lang) entry.language_or_localization_need = lang;

    const docs = parseList(row.required_documents);
    if (docs) entry.required_documents = docs;

    const evidence = parseList(row.required_evidence);
    if (evidence) entry.required_evidence = evidence;

    if (Object.keys(entry).length === 0) {
      skipped++;
      continue;
    }

    entries[id] = entry;
    processed++;
  }

  const output = toTypescript(entries);
  fs.writeFileSync(OUTPUT, output, "utf8");

  console.log(`[authoring] Processed ${processed} rule(s), skipped ${skipped}.`);
  console.log(`[authoring] Wrote ${OUTPUT}`);
}

main();
