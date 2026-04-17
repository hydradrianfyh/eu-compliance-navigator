// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Phase3MainPage } from "@/components/phase3/Phase3MainPage";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("Phase 5B compare mode", () => {
  it(
    "toggles from single mode to compare mode and shows two configuration panels",
    () => {
    render(<Phase3MainPage />);

    expect(
      screen.queryByRole("heading", { name: /left configuration/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /right configuration/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /compare mode/i }));

    expect(
      screen.getByRole("heading", { name: /left configuration/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /right configuration/i }),
    ).toBeInTheDocument();
      expect(screen.getByText(/left results/i)).toBeInTheDocument();
      expect(screen.getByText(/right results/i)).toBeInTheDocument();
    },
    10000,
  );

  it("shows lightweight rule comparison signals when left and right applicability differ", async () => {
    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /compare mode/i }));

    const leftPanel = screen
      .getByRole("heading", { name: /left configuration/i })
      .closest("aside");
    const rightPanel = screen
      .getByRole("heading", { name: /right configuration/i })
      .closest("aside");

    expect(leftPanel).not.toBeNull();
    expect(rightPanel).not.toBeNull();

    fireEvent.change(
      within(leftPanel!).getByRole("combobox", { name: /framework group/i }),
      { target: { value: "MN" } },
    );
    fireEvent.change(
      within(leftPanel!).getByLabelText(/sop date/i),
      { target: { value: "2026-01-01" } },
    );
    fireEvent.change(
      within(rightPanel!).getByRole("combobox", { name: /framework group/i }),
      { target: { value: "L" } },
    );
    fireEvent.change(
      within(rightPanel!).getByLabelText(/sop date/i),
      { target: { value: "2026-01-01" } },
    );

    await waitFor(() => {
      expect(screen.getAllByText(/applicability changed/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/eu whole vehicle type-approval framework/i)).toBeInTheDocument();
    expect(screen.getByText(/l-category vehicle type-approval framework/i)).toBeInTheDocument();
  });
});
