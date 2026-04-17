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

describe("Phase 10A.2 verification workflow", () => {
  it("renders the priority source verification queue with status buckets", () => {
    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /coverage contract/i }));

    expect(screen.getByText(/priority source verification queue/i)).toBeInTheDocument();
    expect(screen.getAllByText(/blocked/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/partial/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/promotable/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/promoted/i).length).toBeGreaterThan(0);
  });

  it("allows reviewer input for a queued rule", () => {
    render(<Phase3MainPage />);

    fireEvent.click(screen.getByRole("button", { name: /coverage contract/i }));

    const queueItem = screen.getAllByText(/REG-TA-001/i)[0].closest("article")!;

    fireEvent.change(within(queueItem).getByLabelText(/official url/i), {
      target: { value: "https://eur-lex.example.test" },
    });
    fireEvent.change(within(queueItem).getByLabelText(/reviewer identity/i), {
      target: { value: "reviewer@example.com" },
    });
    fireEvent.change(within(queueItem).getByLabelText(/reviewer notes/i), {
      target: { value: "Ready for verification" },
    });

    expect(within(queueItem).getByLabelText(/official url/i)).toHaveValue(
      "https://eur-lex.example.test",
    );
    expect(within(queueItem).getByLabelText(/reviewer identity/i)).toHaveValue(
      "reviewer@example.com",
    );
    expect(within(queueItem).getByLabelText(/reviewer notes/i)).toHaveValue(
      "Ready for verification",
    );
  });
});
