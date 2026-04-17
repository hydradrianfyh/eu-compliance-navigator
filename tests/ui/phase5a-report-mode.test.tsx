// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  RULE_NOTES_STORAGE_KEY,
  RULE_STATUSES_STORAGE_KEY,
  serializeRuleNotes,
  serializeRuleStatuses,
} from "@/config/persistence";
import { Phase3MainPage } from "@/components/phase3/Phase3MainPage";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("Phase 5A report mode", () => {
  it(
    "toggles from interactive mode to report mode and reduces interactive controls",
    () => {
      render(<Phase3MainPage />);

      expect(screen.getByRole("button", { name: /export json/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /report mode/i }));

      expect(
        screen.queryByRole("button", { name: /export json/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/visible rules/i)).toBeInTheDocument();
    },
    15000,
  );

  it("keeps status and note content readable in report mode", () => {
    window.localStorage.setItem(
      RULE_STATUSES_STORAGE_KEY,
      serializeRuleStatuses({
        "REG-PV-001": "done",
      }),
    );
    window.localStorage.setItem(
      RULE_NOTES_STORAGE_KEY,
      serializeRuleNotes({
        "REG-PV-001": "Ready for privacy sign-off",
      }),
    );

    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /report mode/i }));

    const gdprCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article")!;

    const header = gdprCard.querySelector(".rule-card-toggle");
    if (header) fireEvent.click(header);

    expect(within(gdprCard).getByText(/user status/i)).toBeInTheDocument();
    expect(within(gdprCard).getByText(/done/i)).toBeInTheDocument();
    expect(within(gdprCard).getByText(/ready for privacy sign-off/i)).toBeInTheDocument();
  });
});
