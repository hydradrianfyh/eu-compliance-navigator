/**
 * UX-001 regression test: months-remaining formatter must handle
 * negative (overdue), zero (this month), and positive (future).
 *
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import { breakdownMonths, formatMonthsLabel } from "@/lib/format-months";

describe("formatMonthsLabel", () => {
  it("returns 'this month' for zero", () => {
    expect(formatMonthsLabel(0)).toBe("this month");
  });

  it("returns 'in N months' for positive", () => {
    expect(formatMonthsLabel(1)).toBe("in 1 month");
    expect(formatMonthsLabel(7)).toBe("in 7 months");
    expect(formatMonthsLabel(25)).toBe("in 25 months");
  });

  it("returns 'N months overdue' for negative (UX-001 fix)", () => {
    expect(formatMonthsLabel(-1)).toBe("1 month overdue");
    expect(formatMonthsLabel(-7)).toBe("7 months overdue");
    expect(formatMonthsLabel(-14)).toBe("14 months overdue");
  });

  it("handles non-finite input defensively", () => {
    expect(formatMonthsLabel(Number.NaN)).toBe("unknown");
    expect(formatMonthsLabel(Number.POSITIVE_INFINITY)).toBe("unknown");
  });
});

describe("breakdownMonths", () => {
  it("classifies future deadlines", () => {
    expect(breakdownMonths(7)).toEqual({ magnitude: 7, status: "remaining" });
  });

  it("classifies this-month deadlines", () => {
    expect(breakdownMonths(0)).toEqual({ magnitude: 0, status: "due_now" });
  });

  it("classifies overdue deadlines", () => {
    expect(breakdownMonths(-14)).toEqual({ magnitude: 14, status: "overdue" });
  });

  it("handles non-finite defensively", () => {
    expect(breakdownMonths(Number.NaN)).toEqual({
      magnitude: 0,
      status: "due_now",
    });
  });
});
