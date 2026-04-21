// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  VerificationQueuePanel,
  type PendingRuleGroup,
} from "@/components/phase3/VerificationQueuePanel";

afterEach(() => {
  cleanup();
});

const emptyCounts = {
  blocked: 0,
  partially_verified: 0,
  promotable: 0,
  promoted: 0,
};

describe("VerificationQueuePanel — all-pending view (Phase J.5)", () => {
  it("renders the expanded backlog grouped by jurisdiction + legal family", () => {
    const groups: PendingRuleGroup[] = [
      {
        groupLabel: "DE · member_state_overlay",
        jurisdiction: "DE",
        legalFamily: "member_state_overlay",
        rules: [
          {
            stableId: "REG-MS-DE-001",
            title: "DE overlay rule 1",
            jurisdiction: "DE",
            legalFamily: "member_state_overlay",
            lifecycleState: "SEED_UNVERIFIED",
            ownerHint: "homologation",
          },
          {
            stableId: "REG-MS-DE-002",
            title: "DE overlay rule 2",
            jurisdiction: "DE",
            legalFamily: "member_state_overlay",
            lifecycleState: "DRAFT",
            ownerHint: "legal",
          },
        ],
      },
      {
        groupLabel: "EU · ai_governance",
        jurisdiction: "EU",
        legalFamily: "ai_governance",
        rules: [
          {
            stableId: "REG-AI-010",
            title: "AI Act edge case",
            jurisdiction: "EU",
            legalFamily: "ai_governance",
            lifecycleState: "PLACEHOLDER",
            ownerHint: "ai_governance",
          },
        ],
      },
      {
        groupLabel: "UK · non_eu_market",
        jurisdiction: "UK",
        legalFamily: "non_eu_market",
        rules: [
          {
            stableId: "REG-UK-100",
            title: "UK AV Act derogation",
            jurisdiction: "UK",
            legalFamily: "non_eu_market",
            lifecycleState: "SEED_UNVERIFIED",
            ownerHint: "regulatory_affairs",
          },
        ],
      },
    ];

    render(
      <VerificationQueuePanel
        items={[]}
        counts={emptyCounts}
        promotionLog={[]}
        onChange={() => undefined}
        viewMode="all-pending"
        allPendingGroups={groups}
      />,
    );

    expect(
      screen.getByText(/Verification backlog — all pending rules/i),
    ).toBeInTheDocument();

    // Group headers for all three jurisdictions present.
    expect(
      screen.getByTestId("backlog-group-DE-member_state_overlay"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("backlog-group-EU-ai_governance"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("backlog-group-UK-non_eu_market"),
    ).toBeInTheDocument();

    // Rule rows render with stable_id, lifecycle, and owner_hint.
    expect(screen.getByText("REG-MS-DE-001")).toBeInTheDocument();
    expect(screen.getByText("REG-MS-DE-002")).toBeInTheDocument();
    expect(screen.getByText("REG-AI-010")).toBeInTheDocument();
    expect(screen.getByText("REG-UK-100")).toBeInTheDocument();
    expect(screen.getByText("homologation")).toBeInTheDocument();
    expect(screen.getByText("ai_governance")).toBeInTheDocument();
    expect(screen.getByText("regulatory_affairs")).toBeInTheDocument();

    // Lifecycle badges present.
    expect(screen.getAllByText(/SEED_UNVERIFIED/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^DRAFT$/i)).toBeInTheDocument();
    expect(screen.getByText(/^PLACEHOLDER$/i)).toBeInTheDocument();
  });

  it("renders the empty-state message when no pending groups supplied", () => {
    render(
      <VerificationQueuePanel
        items={[]}
        counts={emptyCounts}
        promotionLog={[]}
        onChange={() => undefined}
        viewMode="all-pending"
        allPendingGroups={[]}
      />,
    );

    expect(
      screen.getByText(/No pending rules in the backlog/i),
    ).toBeInTheDocument();
  });

  it("defaults to priority-10 view when no viewMode prop given (backward compat)", () => {
    render(
      <VerificationQueuePanel
        items={[]}
        counts={emptyCounts}
        promotionLog={[]}
        onChange={() => undefined}
      />,
    );

    // Legacy priority-queue heading is still rendered.
    expect(
      screen.getByText(/Priority Source Verification Queue/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Verification backlog — all pending rules/i),
    ).not.toBeInTheDocument();
  });
});
