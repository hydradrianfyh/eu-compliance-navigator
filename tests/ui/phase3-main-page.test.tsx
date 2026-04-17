// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Phase3MainPage } from "@/components/phase3/Phase3MainPage";

afterEach(() => {
  cleanup();
});

describe("Phase3MainPage", () => {
  it("renders the configuration panel, summary metrics, and grouped results", () => {
    render(<Phase3MainPage />);

    expect(screen.getByRole("heading", { name: /configuration/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /results/i })).toBeInTheDocument();
    expect(screen.getByText(/visible rules/i)).toBeInTheDocument();
    expect(screen.getByText(/vehicle_approval/i)).toBeInTheDocument();
  });

  it("filters the rendered rule cards by search text without reimplementing engine logic", () => {
    render(<Phase3MainPage />);

    const search = screen.getByRole("textbox", { name: /search rules/i });
    fireEvent.change(search, { target: { value: "gdpr" } });

    expect(screen.getByText(/general data protection regulation/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/cybersecurity management system/i),
    ).not.toBeInTheDocument();
  });

  it("shows lifecycle and manual-review badges based on engine output", () => {
    render(<Phase3MainPage />);

    const gdprCard = screen
      .getByText(/general data protection regulation/i)
      .closest("article");

    expect(gdprCard).not.toBeNull();
    expect(within(gdprCard!).getByText(/active/i)).toBeInTheDocument();
  });
});
