// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import {
  CONFIG_STORAGE_KEY,
  RULE_NOTES_STORAGE_KEY,
  RULE_STATUSES_STORAGE_KEY,
  serializeRuleNotes,
  serializeRuleStatuses,
  serializeVehicleConfig,
} from "@/config/persistence";
import { Phase3MainPage } from "@/components/phase3/Phase3MainPage";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
});

function expandCard(card: HTMLElement) {
  const header = card.querySelector(".rule-card-toggle");
  if (header) fireEvent.click(header);
}

describe("Phase 4A persistence", () => {
  it("restores saved config, rule status, and rule notes on page load", async () => {
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      serializeVehicleConfig({
        ...defaultVehicleConfig,
        projectName: "Saved program",
      }),
    );
    window.localStorage.setItem(
      RULE_STATUSES_STORAGE_KEY,
      serializeRuleStatuses({
        "REG-PV-001": "done",
      }),
    );
    window.localStorage.setItem(
      RULE_NOTES_STORAGE_KEY,
      serializeRuleNotes({
        "REG-PV-001": "Needs DPO review",
      }),
    );

    render(<Phase3MainPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /project name/i }),
      ).toHaveValue("Saved program");
    });

    const gdprCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article")!;

    expandCard(gdprCard);

    expect(
      within(gdprCard).getByRole("combobox", { name: /user status/i }),
    ).toHaveValue("done");
    expect(
      within(gdprCard).getByRole("textbox", { name: /user note/i }),
    ).toHaveValue("Needs DPO review");
  });

  it("persists user status and note edits to localStorage", async () => {
    render(<Phase3MainPage />);

    const gdprCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article")!;

    expandCard(gdprCard);

    fireEvent.change(
      within(gdprCard).getByRole("combobox", { name: /user status/i }),
      { target: { value: "in_progress" } },
    );
    fireEvent.change(
      within(gdprCard).getByRole("textbox", { name: /user note/i }),
      { target: { value: "Review lawful basis" } },
    );

    await waitFor(() => {
      expect(window.localStorage.getItem(RULE_STATUSES_STORAGE_KEY)).toContain(
        '"REG-PV-001":"in_progress"',
      );
      expect(window.localStorage.getItem(RULE_NOTES_STORAGE_KEY)).toContain(
        '"REG-PV-001":"Review lawful basis"',
      );
    });
  });

  it("clears saved state and resets visible values", async () => {
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      serializeVehicleConfig({
        ...defaultVehicleConfig,
        projectName: "Saved program",
      }),
    );
    window.localStorage.setItem(
      RULE_STATUSES_STORAGE_KEY,
      serializeRuleStatuses({
        "REG-PV-001": "done",
      }),
    );
    window.localStorage.setItem(
      RULE_NOTES_STORAGE_KEY,
      serializeRuleNotes({
        "REG-PV-001": "Needs DPO review",
      }),
    );

    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /clear saved state/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
      expect(window.localStorage.getItem(RULE_STATUSES_STORAGE_KEY)).toBeNull();
      expect(window.localStorage.getItem(RULE_NOTES_STORAGE_KEY)).toBeNull();
    });

    expect(screen.getByRole("textbox", { name: /project name/i })).toHaveValue("");

    const gdprCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article")!;

    expandCard(gdprCard);

    expect(
      within(gdprCard).getByRole("combobox", { name: /user status/i }),
    ).toHaveValue("todo");
    expect(
      within(gdprCard).getByRole("textbox", { name: /user note/i }),
    ).toHaveValue("");
  });
});
