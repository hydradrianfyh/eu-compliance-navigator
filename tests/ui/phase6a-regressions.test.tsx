// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Phase3MainPage } from "@/components/phase3/Phase3MainPage";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});

function expandCard(card: HTMLElement) {
  const header = card.querySelector(".rule-card-toggle");
  if (header) fireEvent.click(header);
}

describe("Phase 6A regressions", () => {
  it("defaults to single mode", () => {
    render(<Phase3MainPage />);

    expect(
      screen.queryByRole("heading", { name: /left configuration/i }),
    ).not.toBeInTheDocument();
  });

  it("hides compare configuration panels when switching compare mode into report mode", () => {
    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /compare mode/i }));
    expect(
      screen.getByRole("heading", { name: /left configuration/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /report mode/i }));

    expect(
      screen.queryByRole("heading", { name: /left configuration/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/compare results/i)).toBeInTheDocument();
  });

  it("preserves user status and note across compare/report/single mode switches", () => {
    render(<Phase3MainPage />);

    const gdprCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article")!;

    expandCard(gdprCard);

    fireEvent.change(
      within(gdprCard).getByRole("combobox", { name: /user status/i }),
      { target: { value: "done" } },
    );
    fireEvent.change(
      within(gdprCard).getByRole("textbox", { name: /user note/i }),
      { target: { value: "Carry through modes" } },
    );

    fireEvent.click(screen.getByRole("button", { name: /compare mode/i }));
    fireEvent.click(screen.getByRole("button", { name: /single mode/i }));
    fireEvent.click(screen.getByRole("button", { name: /report mode/i }));
    fireEvent.click(screen.getByRole("button", { name: /interactive mode/i }));

    const restoredCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article")!;

    expandCard(restoredCard);

    expect(
      within(restoredCard).getByRole("combobox", { name: /user status/i }),
    ).toHaveValue("done");
    expect(
      within(restoredCard).getByRole("textbox", { name: /user note/i }),
    ).toHaveValue("Carry through modes");
  });
});
