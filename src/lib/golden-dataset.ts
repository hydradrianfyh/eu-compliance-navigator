/**
 * Golden dataset loader + cross-check helpers (Sprint 4).
 *
 * The golden dataset lives at `content/golden-dataset.json`. It records
 * the canonical values of 20 anchor rules as verified by a human
 * reviewer (see last_reviewer field). Sprint 5 will extend this with
 * live SPARQL cross-check in CI; this module is the shared loader.
 *
 * © Yanhao FU
 */

import goldenData from "../../content/golden-dataset.json";
import { z } from "zod";

export const goldenAnchorSchema = z.object({
  rule_id: z.string(),
  title: z.string(),
  source_family: z.enum(["EUR-Lex", "UNECE"]),
  canonical_celex: z.string().optional(),
  canonical_unece_ref: z.string().optional(),
  canonical_official_url: z.string(),
  canonical_oj_reference: z.string().nullable(),
  temporal_expectations: z.record(z.string(), z.string()),
  review_notes: z.string(),
});

export const goldenDatasetSchema = z.object({
  version: z.string(),
  description: z.string(),
  last_updated: z.string(),
  last_reviewer: z.string(),
  review_notes: z.string(),
  anchors: z.array(goldenAnchorSchema).min(1),
});

export type GoldenAnchor = z.infer<typeof goldenAnchorSchema>;
export type GoldenDataset = z.infer<typeof goldenDatasetSchema>;

let cachedDataset: GoldenDataset | null = null;

export function loadGoldenDataset(): GoldenDataset {
  if (cachedDataset) return cachedDataset;
  cachedDataset = goldenDatasetSchema.parse(goldenData);
  return cachedDataset;
}

export function findGoldenAnchor(ruleId: string): GoldenAnchor | undefined {
  return loadGoldenDataset().anchors.find((a) => a.rule_id === ruleId);
}

export interface GoldenDiff {
  rule_id: string;
  field: string;
  expected: unknown;
  actual: unknown;
}

/**
 * Compare a single rule's seed values against the golden anchor.
 * Returns an empty array if the rule matches all canonical fields, or
 * a list of diffs otherwise. Used by Sprint 5 CI.
 *
 * Checks performed:
 *   1. primary source's official_url matches canonical_official_url
 *   2. primary source's oj_reference matches canonical_oj_reference
 *   3. temporal_expectations keys all match rule.temporal values
 */
export function diffRuleAgainstGolden(
  rule: {
    stable_id: string;
    sources: Array<{
      official_url: string | null;
      oj_reference: string | null;
    }>;
    temporal: Record<string, string | null>;
  },
  anchor: GoldenAnchor,
): GoldenDiff[] {
  const diffs: GoldenDiff[] = [];
  const primary = rule.sources[0];

  if (primary) {
    if (primary.official_url !== anchor.canonical_official_url) {
      diffs.push({
        rule_id: rule.stable_id,
        field: "sources[0].official_url",
        expected: anchor.canonical_official_url,
        actual: primary.official_url,
      });
    }
    if (primary.oj_reference !== anchor.canonical_oj_reference) {
      diffs.push({
        rule_id: rule.stable_id,
        field: "sources[0].oj_reference",
        expected: anchor.canonical_oj_reference,
        actual: primary.oj_reference,
      });
    }
  }

  for (const [key, expected] of Object.entries(anchor.temporal_expectations)) {
    const actual = rule.temporal[key];
    if (actual !== expected) {
      diffs.push({
        rule_id: rule.stable_id,
        field: `temporal.${key}`,
        expected,
        actual,
      });
    }
  }

  return diffs;
}
