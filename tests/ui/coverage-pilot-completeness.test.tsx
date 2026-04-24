// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  CoveragePanel,
  type PilotCompletenessRow,
} from "@/components/phase3/CoveragePanel";
import { computeCoverageMatrix } from "@/registry/coverage-matrix";
import { RuleRegistry } from "@/registry/registry";
import { allSeedRules } from "@/registry/seed";

afterEach(() => {
  cleanup();
});

/**
 * Phase M Part C — pilot-completeness KPI is enforced in CI by
 * tests/unit/pilot-completeness.test.ts. This UI smoke test verifies the
 * same numbers are surfaced in the Coverage panel so stakeholders can see
 * coverage / denominator / missing count in-product, not only in CI.
 *
 * Finding 2 regression anchor (post-Phase-M audit 2026-04-24): prior to
 * this test, the KPI was implemented but never rendered anywhere — the
 * README claim that pilotCompleteness is "green" couldn't be validated by
 * a human opening the app. This test fails if the section is ever
 * accidentally removed from CoveragePanel.
 */

const sampleRows: PilotCompletenessRow[] = [
  {
    name: "MY2027 BEV × DE/FR/NL",
    matchedCount: 81,
    expectedCount: 100,
    missingCount: 19,
    applicableCount: 81,
    coveragePercent: 81.0,
    threshold: 0.8,
    passing: true,
    missingSample: ["REG-MS-NL-001", "REG-MS-NL-002", "REG-MS-NL-003"],
  },
  {
    name: "MY2027 ICE M1 × ES",
    matchedCount: 40,
    expectedCount: 78,
    missingCount: 38,
    applicableCount: 40,
    coveragePercent: 51.3,
    threshold: 0.7,
    passing: false,
    missingSample: ["REG-MS-ES-008"],
  },
];

const emptyCounts = {
  blocked: 0,
  partially_verified: 0,
  promotable: 0,
  promoted: 0,
};

describe("CoveragePanel — Phase M pilot-completeness section", () => {
  it("renders a pilot-completeness section when pilotCompleteness rows are provided", () => {
    const registry = new RuleRegistry(allSeedRules);
    const matrix = computeCoverageMatrix(
      registry.getAllRules(),
      registry.getEvaluableRules(),
    );

    const { container } = render(
      <CoveragePanel
        matrix={matrix}
        verificationQueueItems={[]}
        verificationCounts={emptyCounts}
        promotionLog={[]}
        onVerificationReviewChange={() => {}}
        pilotCompleteness={sampleRows}
      />,
    );

    // Expand the panel so the body is rendered. The toggle lives on the
    // <header role="button">, so click on the header container (parent of
    // the h2) rather than the heading itself.
    const heading = screen.getByText(/Coverage Contract/i);
    const headerEl = heading.closest(".coverage-header");
    if (!headerEl) throw new Error("coverage-header not found");
    fireEvent.click(headerEl);

    expect(screen.getByTestId("pilot-completeness-section")).toBeInTheDocument();
    expect(screen.getByText(/Pilot Completeness/i)).toBeInTheDocument();

    const bevRow = screen.getByTestId(
      "pilot-completeness-row-MY2027 BEV × DE/FR/NL",
    );
    expect(bevRow).toHaveAttribute("data-passing", "true");
    expect(bevRow).toHaveTextContent("81.0%");
    expect(bevRow).toHaveTextContent("81 / 100 expected rules APPLICABLE");
    expect(bevRow).toHaveTextContent("19 missing");

    const iceRow = screen.getByTestId(
      "pilot-completeness-row-MY2027 ICE M1 × ES",
    );
    expect(iceRow).toHaveAttribute("data-passing", "false");
    expect(iceRow).toHaveTextContent("51.3%");
    expect(iceRow).toHaveTextContent("below target");
    // container is provided for debugging assertions if this regression fires
    expect(container).toBeTruthy();
  });

  it("omits the pilot-completeness section when no rows are provided (back-compat)", () => {
    const registry = new RuleRegistry(allSeedRules);
    const matrix = computeCoverageMatrix(
      registry.getAllRules(),
      registry.getEvaluableRules(),
    );

    render(
      <CoveragePanel
        matrix={matrix}
        verificationQueueItems={[]}
        verificationCounts={emptyCounts}
        promotionLog={[]}
        onVerificationReviewChange={() => {}}
      />,
    );

    const heading = screen.getByText(/Coverage Contract/i);
    const headerEl = heading.closest(".coverage-header");
    if (!headerEl) throw new Error("coverage-header not found");
    fireEvent.click(headerEl);

    expect(
      screen.queryByTestId("pilot-completeness-section"),
    ).not.toBeInTheDocument();
  });
});
