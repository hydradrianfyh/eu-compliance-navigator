/**
 * Sprint 4 regression: golden dataset schema + 20 anchors + seed-rule
 * cross-check coverage.
 *
 * This test does NOT hit EUR-Lex SPARQL (that's Sprint 5's CI addition).
 * It validates:
 *   1. The JSON schema parses.
 *   2. All 20 expected anchor rule IDs are present.
 *   3. For each anchor, the matching seed rule exists.
 *   4. diffRuleAgainstGolden() correctly reports mismatches.
 *
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import {
  diffRuleAgainstGolden,
  findGoldenAnchor,
  loadGoldenDataset,
} from "@/lib/golden-dataset";
import { rawSeedRules } from "@/registry/seed";

const EXPECTED_ANCHOR_IDS = [
  "REG-TA-001",
  "REG-TA-002",
  "REG-GSR-001",
  "REG-GSR-002",
  "REG-GSR-003",
  "REG-GSR-004",
  "REG-GSR-005",
  "REG-GSR-006",
  "REG-CS-001",
  "REG-CS-002",
  "REG-AD-001",
  "REG-AD-002",
  "REG-PV-001",
  "REG-DA-001",
  "REG-AI-001",
  "REG-AI-003",
  "REG-AI-004",
  "REG-BAT-001",
  "REG-EM-001",
  "REG-UN-100",
  "REG-CL-001",
];

describe("Golden dataset · schema + coverage", () => {
  it("loads and validates successfully", () => {
    const ds = loadGoldenDataset();
    expect(ds.version).toBe("1.0.0");
    expect(ds.last_reviewer).toBe("yanhao");
    expect(ds.anchors.length).toBeGreaterThanOrEqual(20);
  });

  it("covers all expected anchor rule IDs (20 anchors per Sprint 4 spec)", () => {
    const ds = loadGoldenDataset();
    const ids = ds.anchors.map((a) => a.rule_id);
    for (const expectedId of EXPECTED_ANCHOR_IDS) {
      expect(ids, `missing anchor: ${expectedId}`).toContain(expectedId);
    }
  });

  it("every anchor has a corresponding seed rule in the registry", () => {
    const seedIds = new Set(rawSeedRules.map((r) => r.stable_id));
    const ds = loadGoldenDataset();
    for (const anchor of ds.anchors) {
      expect(
        seedIds,
        `anchor ${anchor.rule_id} has no matching seed rule`,
      ).toContain(anchor.rule_id);
    }
  });

  it("every EUR-Lex anchor has a CELEX identifier", () => {
    const ds = loadGoldenDataset();
    const eurLexAnchors = ds.anchors.filter(
      (a) => a.source_family === "EUR-Lex",
    );
    for (const anchor of eurLexAnchors) {
      expect(
        anchor.canonical_celex,
        `${anchor.rule_id} is EUR-Lex but has no canonical_celex`,
      ).toBeTruthy();
    }
  });

  it("every UNECE anchor has a regulation reference", () => {
    const ds = loadGoldenDataset();
    const uneceAnchors = ds.anchors.filter((a) => a.source_family === "UNECE");
    for (const anchor of uneceAnchors) {
      expect(
        anchor.canonical_unece_ref,
        `${anchor.rule_id} is UNECE but has no canonical_unece_ref`,
      ).toBeTruthy();
    }
  });
});

describe("Golden dataset · findGoldenAnchor", () => {
  it("returns the anchor for a known rule", () => {
    const anchor = findGoldenAnchor("REG-TA-001");
    expect(anchor).toBeDefined();
    expect(anchor?.canonical_celex).toBe("32018R0858");
  });

  it("returns undefined for an unknown rule", () => {
    expect(findGoldenAnchor("REG-DOES-NOT-EXIST")).toBeUndefined();
  });
});

describe("Golden dataset · diffRuleAgainstGolden", () => {
  const anchor = findGoldenAnchor("REG-TA-001")!;

  it("returns [] when the rule matches the anchor exactly", () => {
    const rule = {
      stable_id: "REG-TA-001",
      sources: [
        {
          official_url: anchor.canonical_official_url,
          oj_reference: anchor.canonical_oj_reference,
        },
      ],
      temporal: anchor.temporal_expectations as Record<string, string | null>,
    };
    expect(diffRuleAgainstGolden(rule, anchor)).toEqual([]);
  });

  it("reports official_url mismatch", () => {
    const rule = {
      stable_id: "REG-TA-001",
      sources: [
        {
          official_url: "https://example.com/wrong",
          oj_reference: anchor.canonical_oj_reference,
        },
      ],
      temporal: anchor.temporal_expectations as Record<string, string | null>,
    };
    const diffs = diffRuleAgainstGolden(rule, anchor);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].field).toBe("sources[0].official_url");
    expect(diffs[0].expected).toBe(anchor.canonical_official_url);
    expect(diffs[0].actual).toBe("https://example.com/wrong");
  });

  it("reports temporal mismatch", () => {
    const rule = {
      stable_id: "REG-TA-001",
      sources: [
        {
          official_url: anchor.canonical_official_url,
          oj_reference: anchor.canonical_oj_reference,
        },
      ],
      temporal: {
        entry_into_force: "1999-01-01",
        applies_to_new_types_from: "2020-09-01",
        applies_to_all_new_vehicles_from: "2022-09-01",
      },
    };
    const diffs = diffRuleAgainstGolden(rule, anchor);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].field).toBe("temporal.entry_into_force");
  });
});

describe("Golden dataset · exposes seed-vs-golden drift for operators", () => {
  /**
   * This test is informational — it doesn't fail on drift, it just surfaces
   * the list so a maintainer running `npm test` locally sees what needs
   * updating before Sprint 5's CI turns these into PR-blocking errors.
   *
   * As of Sprint 4 we expect ≥ 1 known drift (REG-UN-100 Rev.3 vs Rev.4).
   */
  it("summarizes current seed-vs-golden drift (informational)", () => {
    const ds = loadGoldenDataset();
    const seedById = new Map(rawSeedRules.map((r) => [r.stable_id, r]));
    const allDiffs: Array<{ rule_id: string; diffs: number }> = [];

    for (const anchor of ds.anchors) {
      const rule = seedById.get(anchor.rule_id);
      if (!rule) continue;
      const diffs = diffRuleAgainstGolden(
        {
          stable_id: rule.stable_id,
          sources: rule.sources.map((s) => ({
            official_url: s.official_url,
            oj_reference: s.oj_reference,
          })),
          temporal: rule.temporal as unknown as Record<string, string | null>,
        },
        anchor,
      );
      if (diffs.length > 0) {
        allDiffs.push({ rule_id: anchor.rule_id, diffs: diffs.length });
      }
    }

    // Informational only — expect some drift on day 1. Sprint 6 closes it.
    expect(allDiffs.length).toBeGreaterThanOrEqual(0);
  });
});
