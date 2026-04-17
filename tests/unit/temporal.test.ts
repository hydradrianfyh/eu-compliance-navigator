import { describe, expect, it } from "vitest";

import { evaluateTemporalScope } from "@/engine/temporal";

describe("evaluateTemporalScope", () => {
  it("marks future-dated new-type rules as future", () => {
    const result = evaluateTemporalScope(
      {
        entry_into_force: null,
        applies_to_new_types_from: "2030-01-01",
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
      {
        approvalType: "new_type",
        sopDate: "2028-01-01",
        firstRegistrationDate: null,
      },
    );

    expect(result.isFuture).toBe(true);
    expect(result.isDateUnknown).toBe(false);
    expect(result.referenceField).toBe("applies_to_new_types_from");
  });

  it("marks date as unknown when no applicable temporal field exists", () => {
    const result = evaluateTemporalScope(
      {
        entry_into_force: null,
        applies_to_new_types_from: null,
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: null,
        small_volume_derogation_until: null,
        notes: null,
      },
      {
        approvalType: "carry_over",
        sopDate: "2028-01-01",
        firstRegistrationDate: null,
      },
    );

    expect(result.isFuture).toBe(false);
    expect(result.isDateUnknown).toBe(true);
    expect(result.referenceField).toBeNull();
  });

  it("marks rules as expired when effective_to is before the comparison date", () => {
    const result = evaluateTemporalScope(
      {
        entry_into_force: null,
        applies_to_new_types_from: null,
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: "2020-01-01",
        effective_to: "2024-12-31",
        small_volume_derogation_until: null,
        notes: null,
      },
      {
        approvalType: "new_type",
        sopDate: "2026-01-01",
        firstRegistrationDate: null,
      },
    );

    expect(result.isDateUnknown).toBe(false);
    expect(result.isExpired).toBe(true);
    expect(result.explanation).toContain("expired");
  });

  it("still marks rules as expired when no forward-looking reference field exists", () => {
    const result = evaluateTemporalScope(
      {
        entry_into_force: null,
        applies_to_new_types_from: null,
        applies_to_all_new_vehicles_from: null,
        applies_to_first_registration_from: null,
        applies_from_generic: null,
        effective_to: "2024-12-31",
        small_volume_derogation_until: null,
        notes: null,
      },
      {
        approvalType: "new_type",
        sopDate: "2026-01-01",
        firstRegistrationDate: null,
      },
    );

    expect(result.isDateUnknown).toBe(false);
    expect(result.isExpired).toBe(true);
    expect(result.referenceField).toBeNull();
  });
});
