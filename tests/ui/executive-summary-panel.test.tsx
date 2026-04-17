// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ExecutiveSummaryPanel } from "@/components/phase3/ExecutiveSummaryPanel";
import type { ExecutiveSummary } from "@/engine/executive-summary";

afterEach(() => {
  cleanup();
});

function buildSummary(overrides: Partial<ExecutiveSummary> = {}): ExecutiveSummary {
  return {
    canEnterMarket: true,
    confidence: "high",
    topBlockers: [],
    topDeadlines: [],
    countriesAtRisk: [],
    freshnessOverview: {
      fresh: 10,
      due_soon: 2,
      overdue: 1,
      critically_overdue: 0,
      never_verified: 3,
      total: 16,
    },
    coverageScore: 75,
    verified_count: 12,
    indicative_count: 4,
    pending_authoring: 2,
    generated_at: "2026-04-17T10:00:00Z",
    ...overrides,
  };
}

function expandPanel() {
  const header = screen.getByRole("button", { name: /Executive Summary/i });
  fireEvent.click(header);
}

describe("ExecutiveSummaryPanel", () => {
  it("renders the canEnterMarket YES state with no-blockers message", () => {
    render(<ExecutiveSummaryPanel summary={buildSummary()} />);
    expandPanel();

    expect(
      screen.getByTestId("can-enter-market-large"),
    ).toHaveTextContent(/canEnterMarket: YES/i);
    expect(screen.getByTestId("no-blockers")).toBeInTheDocument();
    expect(screen.getByTestId("no-countries-at-risk")).toBeInTheDocument();
    expect(screen.getByText(/Coverage score/i)).toBeInTheDocument();
  });

  it("renders NO state and surfaces blockers, deadlines, and countries", () => {
    render(
      <ExecutiveSummaryPanel
        summary={buildSummary({
          canEnterMarket: false,
          confidence: "low",
          topBlockers: [
            {
              stable_id: "REG-X-001",
              title: "Cyber approval missing evidence",
              short_label: "CYB-001",
              owner_hint: "homologation",
              reason: "APPLICABLE + third_party_verification_required + no evidence",
              severity: "high",
            },
          ],
          topDeadlines: [
            {
              stable_id: "REG-X-001",
              title: "Cyber approval deadline",
              deadline: "2026-07-01",
              months_remaining: 3,
              owner_hint: "homologation",
            },
          ],
          countriesAtRisk: ["FR", "NL"],
        })}
      />,
    );
    expandPanel();

    expect(
      screen.getByTestId("can-enter-market-large"),
    ).toHaveTextContent(/canEnterMarket: NO/i);
    expect(
      screen.getByText(/Cyber approval missing evidence/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/2026-07-01/)).toBeInTheDocument();
    expect(screen.getByText("FR")).toBeInTheDocument();
    expect(screen.getByText("NL")).toBeInTheDocument();
  });
});
