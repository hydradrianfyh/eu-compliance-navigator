/**
 * Phase C unit tests for condition-to-text (NL translator).
 * Written before the implementation per TDD.
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import { conditionToHumanText } from "@/lib/condition-to-text";
import type { TriggerCondition } from "@/registry/schema";

describe("conditionToHumanText · single-value operators", () => {
  it("eq renders as 'X is Y'", () => {
    const condition: TriggerCondition = {
      field: "frameworkGroup",
      operator: "eq",
      value: "MN",
    };
    expect(conditionToHumanText(condition)).toBe("Framework group is MN");
  });

  it("neq renders as 'X is not Y'", () => {
    expect(
      conditionToHumanText({
        field: "powertrain",
        operator: "neq",
        value: "ICE",
      }),
    ).toBe("Powertrain is not ICE");
  });

  it("gt renders as 'X is greater than Y'", () => {
    expect(
      conditionToHumanText({
        field: "batteryCapacity",
        operator: "gt",
        value: 50,
      }),
    ).toBe("Battery capacity is greater than 50");
  });

  it("gte renders as 'X is at least Y'", () => {
    expect(
      conditionToHumanText({
        field: "automationLevel",
        operator: "gte",
        value: "l3",
      }),
    ).toBe("Automation level is at least l3");
  });

  it("lt / lte render correctly", () => {
    expect(
      conditionToHumanText({
        field: "sopDate",
        operator: "lt",
        value: "2027-01-01",
      }),
    ).toBe("Sop date is less than 2027-01-01");
    expect(
      conditionToHumanText({
        field: "sopDate",
        operator: "lte",
        value: "2027-01-01",
      }),
    ).toBe("Sop date is at most 2027-01-01");
  });
});

describe("conditionToHumanText · list operators", () => {
  it("in renders as 'X is one of …'", () => {
    expect(
      conditionToHumanText({
        field: "vehicleCategory",
        operator: "in",
        value: ["M1", "N1"],
      }),
    ).toBe("Vehicle category is one of M1, N1");
  });

  it("not_in renders as 'X is not one of …'", () => {
    expect(
      conditionToHumanText({
        field: "frameworkGroup",
        operator: "not_in",
        value: ["L", "AGRI"],
      }),
    ).toBe("Framework group is not one of L, AGRI");
  });

  it("includes renders as 'X includes Y'", () => {
    expect(
      conditionToHumanText({
        field: "targetCountries",
        operator: "includes",
        value: "DE",
      }),
    ).toBe("Target countries includes DE");
  });

  it("includes_any renders as 'X includes any of …'", () => {
    expect(
      conditionToHumanText({
        field: "connectivity",
        operator: "includes_any",
        value: ["telematics", "ota"],
      }),
    ).toBe("Connectivity includes any of telematics, ota");
  });
});

describe("conditionToHumanText · boolean operators", () => {
  it("is_true renders as 'X is true' for non-overridden fields", () => {
    expect(
      conditionToHumanText({
        field: "motorwayAssistant",
        operator: "is_true",
        value: true,
      }),
    ).toBe("Motorway assistant is true");
  });

  it("is_false renders as 'X is false' (FIELD_PHRASING suppressed)", () => {
    expect(
      conditionToHumanText({
        field: "hasAI",
        operator: "is_false",
        value: false,
      }),
    ).toBe("Has AI is false");
  });
});

describe("conditionToHumanText · nullability", () => {
  it("is_null renders as 'X is not set'", () => {
    expect(
      conditionToHumanText({
        field: "sopDate",
        operator: "is_null",
        value: null,
      }),
    ).toBe("Sop date is not set");
  });

  it("is_not_null renders as 'X is set'", () => {
    expect(
      conditionToHumanText({
        field: "firstRegistrationDate",
        operator: "is_not_null",
        value: null,
      }),
    ).toBe("First registration date is set");
  });
});

describe("conditionToHumanText · label override", () => {
  it("uses the condition.label verbatim when provided", () => {
    expect(
      conditionToHumanText({
        field: "hasSafetyRelevantAI",
        operator: "is_true",
        value: true,
        label: "Vehicle uses AI as a safety component",
      }),
    ).toBe("Vehicle uses AI as a safety component");
  });
});

describe("conditionToHumanText · well-known field label mapping", () => {
  it("maps frameworkGroup to 'Framework group'", () => {
    expect(
      conditionToHumanText({
        field: "frameworkGroup",
        operator: "eq",
        value: "MN",
      }),
    ).toBe("Framework group is MN");
  });

  it("maps isL3Plus to 'Automation level is L3 or higher'", () => {
    expect(
      conditionToHumanText({
        field: "isL3Plus",
        operator: "is_true",
        value: true,
      }),
    ).toBe("Automation level is L3 or higher");
  });

  it("maps batteryPresent to a readable phrase", () => {
    expect(
      conditionToHumanText({
        field: "batteryPresent",
        operator: "is_true",
        value: true,
      }),
    ).toBe("Vehicle has a battery");
  });
});
