#!/usr/bin/env node
/**
 * EUR-Lex SPARQL watcher for ACTIVE rules.
 *
 * Usage:
 *   node scripts/eur-lex-watch.mjs              # check all rules with CELEX references
 *   node scripts/eur-lex-watch.mjs --since YYYY-MM-DD
 *   node scripts/eur-lex-watch.mjs --dry-run    # don't write change-signal file
 *
 * Output:
 *   docs/freshness/last-check.json   -- machine-readable report
 *   docs/freshness/change-signals.json -- rules with detected changes
 *
 * Designed to run as a GitHub Action cron (see .github/workflows/eur-lex-watch.yml).
 *
 * NOTE: This is a minimal watcher. It uses the EUR-Lex SPARQL endpoint (cellar.api)
 * to check whether a CELEX reference has been modified since the last human review.
 * UNECE regulations are checked via a simpler HTTP HEAD on the UNECE page since
 * UNECE does not expose a SPARQL endpoint.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs", "freshness");

const SPARQL_ENDPOINT = "https://publications.europa.eu/webapi/rdf/sparql";

/**
 * ACTIVE rules whose source is CELEX-backed.
 * Keep in sync with freshness-data.ts entries that use "eur-lex-sparql".
 */
const CELEX_WATCHLIST = [
  { stable_id: "REG-TA-001", celex: "32018R0858", label: "WVTA 2018/858" },
  { stable_id: "REG-GSR-001", celex: "32019R2144", label: "GSR2 2019/2144" },
  { stable_id: "REG-BAT-001", celex: "32023R1542", label: "Battery Reg 2023/1542" },
  { stable_id: "REG-AI-001", celex: "32024R1689", label: "AI Act 2024/1689" },
  { stable_id: "REG-AI-004", celex: "32024R1689", label: "AI Act 2024/1689 Art.6" },
  { stable_id: "REG-PV-001", celex: "32016R0679", label: "GDPR 2016/679" },
  { stable_id: "REG-DA-001", celex: "32023R2854", label: "Data Act 2023/2854" },
  { stable_id: "REG-EM-001", celex: "32024R1257", label: "Euro 7 2024/1257" },
  { stable_id: "REG-CL-001", celex: "32024L2853", label: "PLD 2024/2853" },
  { stable_id: "REG-TA-002", celex: "32013R0168", label: "L-cat 168/2013" },
];

const UNECE_WATCHLIST = [
  { stable_id: "REG-CS-001", regulation: "155", label: "R155 CSMS" },
  { stable_id: "REG-CS-002", regulation: "156", label: "R156 SUMS" },
  { stable_id: "REG-UN-100", regulation: "100", label: "R100 EV Safety" },
  { stable_id: "REG-AD-001", regulation: "157", label: "R157 ALKS" },
  { stable_id: "REG-AD-002", regulation: "171", label: "R171 DCAS" },
];

function parseArgs(argv) {
  const args = { dryRun: false, since: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--since" && argv[i + 1]) {
      args.since = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function sparqlQuery(celex) {
  // Ask EUR-Lex: when was the CELEX document last modified?
  const query = `
    PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
    SELECT ?work ?modified WHERE {
      ?work cdm:resource_legal_id_celex "${celex}" .
      OPTIONAL { ?work cdm:work_date_last_modification ?modified }
    }
    LIMIT 1
  `;

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=application/sparql-results+json`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/sparql-results+json",
        "Accept-Language": "en",
        "User-Agent": "eu-compliance-navigator-freshness-watcher/1.0",
      },
    });

    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    const binding = data?.results?.bindings?.[0];
    return {
      ok: true,
      modified: binding?.modified?.value ?? null,
      work: binding?.work?.value ?? null,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function uneceHeadCheck(regulation) {
  // UNECE doesn't expose SPARQL. Do a HEAD on a known stable URL pattern
  // and capture the Last-Modified header if present.
  const url = `https://unece.org/transport/documents/standards/regulation-no-${regulation}`;

  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "eu-compliance-navigator-freshness-watcher/1.0",
      },
      redirect: "follow",
    });

    return {
      ok: res.ok,
      status: res.status,
      lastModified: res.headers.get("last-modified"),
      etag: res.headers.get("etag"),
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const now = new Date().toISOString();

  const report = {
    run_at: now,
    dry_run: args.dryRun,
    since: args.since,
    eur_lex: [],
    unece: [],
    errors: [],
  };

  console.log(`[freshness-watch] Starting run at ${now}`);

  for (const item of CELEX_WATCHLIST) {
    console.log(`  EUR-Lex: ${item.stable_id} (${item.label})`);
    const result = await sparqlQuery(item.celex);
    report.eur_lex.push({
      stable_id: item.stable_id,
      celex: item.celex,
      label: item.label,
      result,
    });
    if (!result.ok) {
      report.errors.push(`${item.stable_id}: ${result.error ?? "unknown"}`);
    }
  }

  for (const item of UNECE_WATCHLIST) {
    console.log(`  UNECE: ${item.stable_id} (R${item.regulation})`);
    const result = await uneceHeadCheck(item.regulation);
    report.unece.push({
      stable_id: item.stable_id,
      regulation: item.regulation,
      label: item.label,
      result,
    });
    if (!result.ok) {
      report.errors.push(`${item.stable_id}: ${result.error ?? `HTTP ${result.status}`}`);
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  if (!args.dryRun) {
    const reportFile = path.join(OUT_DIR, "last-check.json");
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2), "utf8");
    console.log(`[freshness-watch] Wrote ${reportFile}`);

    // Filter change signals: rules where lastModified > since
    if (args.since) {
      const sinceDate = new Date(args.since);
      const signals = [];
      for (const entry of report.eur_lex) {
        if (entry.result.ok && entry.result.modified) {
          const modified = new Date(entry.result.modified);
          if (modified > sinceDate) {
            signals.push({
              stable_id: entry.stable_id,
              detected_at: now,
              source: "eur-lex-sparql",
              modified_at: entry.result.modified,
            });
          }
        }
      }
      const signalsFile = path.join(OUT_DIR, "change-signals.json");
      await fs.writeFile(signalsFile, JSON.stringify(signals, null, 2), "utf8");
      console.log(`[freshness-watch] Wrote ${signalsFile} (${signals.length} signals)`);
    }
  }

  const okCount =
    report.eur_lex.filter((e) => e.result.ok).length +
    report.unece.filter((e) => e.result.ok).length;
  const total = report.eur_lex.length + report.unece.length;

  console.log(
    `[freshness-watch] Done. ${okCount}/${total} sources reachable. ${report.errors.length} errors.`,
  );

  if (report.errors.length > 0) {
    console.error("[freshness-watch] Errors:");
    for (const err of report.errors) console.error(`  - ${err}`);
  }

  // Exit non-zero if more than half failed (alert trigger)
  if (report.errors.length > total / 2) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[freshness-watch] Fatal error:", err);
  process.exit(1);
});
