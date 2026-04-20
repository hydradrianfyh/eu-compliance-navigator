/**
 * Unit test for the single-source copyright / app-info helper.
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import {
  APP_AUTHOR_NAME,
  APP_COPYRIGHT_START_YEAR,
  APP_PRODUCT_NAME,
  APP_SHORT_NAME,
  getCopyrightLine,
  getCopyrightYearRange,
} from "@/lib/app-info";

describe("app-info · brand constants", () => {
  it("exposes stable product + author names", () => {
    expect(APP_PRODUCT_NAME).toBe("EU Vehicle Compliance Navigator");
    expect(APP_SHORT_NAME).toBe("EU Compliance Navigator");
    expect(APP_AUTHOR_NAME).toBe("Yanhao FU");
    expect(APP_COPYRIGHT_START_YEAR).toBe(2026);
  });
});

describe("app-info · getCopyrightYearRange", () => {
  it("returns just the start year when today's year equals start year", () => {
    expect(getCopyrightYearRange(new Date("2026-06-15T00:00:00Z"))).toBe(
      "2026",
    );
  });

  it("returns a year range when today is after the start year", () => {
    expect(getCopyrightYearRange(new Date("2028-01-01T00:00:00Z"))).toBe(
      "2026–2028",
    );
  });

  it("returns start year alone when today is before start year (defensive)", () => {
    expect(getCopyrightYearRange(new Date("2020-01-01T00:00:00Z"))).toBe(
      "2026",
    );
  });
});

describe("app-info · getCopyrightLine", () => {
  it("produces the full 'All rights reserved' line with author + range", () => {
    expect(getCopyrightLine(new Date("2026-04-20T00:00:00Z"))).toBe(
      "© 2026 Yanhao FU · All rights reserved.",
    );
  });

  it("updates year range as time passes", () => {
    expect(getCopyrightLine(new Date("2027-01-01T00:00:00Z"))).toBe(
      "© 2026–2027 Yanhao FU · All rights reserved.",
    );
  });
});
