import type { ApprovalType } from "@/shared/constants";
import type { RuleTemporalScope } from "@/registry/schema";

interface TemporalInput {
  approvalType: ApprovalType | string;
  sopDate: string | null;
  firstRegistrationDate: string | null;
}

export interface TemporalAssessment {
  isFuture: boolean;
  isExpired: boolean;
  isDateUnknown: boolean;
  monthsUntilEffective: number | null;
  referenceField:
    | "applies_to_new_types_from"
    | "applies_to_all_new_vehicles_from"
    | "applies_to_first_registration_from"
    | "applies_from_generic"
    | null;
  explanation: string;
}

function toDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00Z`) : null;
}

function monthDiff(from: Date, to: Date): number {
  return Math.max(
    0,
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
      (to.getUTCMonth() - from.getUTCMonth()),
  );
}

function chooseReferenceField(
  temporal: RuleTemporalScope,
  input: TemporalInput,
): TemporalAssessment["referenceField"] {
  if (input.firstRegistrationDate && temporal.applies_to_first_registration_from) {
    return "applies_to_first_registration_from";
  }

  if (input.approvalType === "new_type" && temporal.applies_to_new_types_from) {
    return "applies_to_new_types_from";
  }

  if (
    ["carry_over", "facelift", "major_update"].includes(input.approvalType) &&
    temporal.applies_to_all_new_vehicles_from
  ) {
    return "applies_to_all_new_vehicles_from";
  }

  if (temporal.applies_from_generic) {
    return "applies_from_generic";
  }

  return null;
}

export function evaluateTemporalScope(
  temporal: RuleTemporalScope,
  input: TemporalInput,
): TemporalAssessment {
  const referenceField = chooseReferenceField(temporal, input);
  const comparisonDate = toDate(input.firstRegistrationDate ?? input.sopDate);
  const effectiveToDate = toDate(temporal.effective_to);
  const isExpired = effectiveToDate && comparisonDate ? comparisonDate > effectiveToDate : false;

  if (!referenceField) {
    return {
      isFuture: false,
      isExpired,
      isDateUnknown: !isExpired,
      monthsUntilEffective: null,
      referenceField: null,
      explanation: isExpired
        ? `Rule expired on ${temporal.effective_to}.`
        : "No applicable temporal date is available for this evaluation path.",
    };
  }

  const effectiveDate = toDate(temporal[referenceField]);
  const relevantComparisonDate = toDate(
    referenceField === "applies_to_first_registration_from"
      ? input.firstRegistrationDate
      : input.sopDate,
  );

  if (!effectiveDate || !relevantComparisonDate) {
    return {
      isFuture: false,
      isExpired,
      isDateUnknown: true,
      monthsUntilEffective: null,
      referenceField,
      explanation: "Temporal evaluation is incomplete because a relevant date input is missing.",
    };
  }

  const isFuture = relevantComparisonDate < effectiveDate;

  return {
    isFuture,
    isExpired,
    isDateUnknown: false,
    monthsUntilEffective: isFuture ? monthDiff(relevantComparisonDate, effectiveDate) : 0,
    referenceField,
    explanation: isExpired
      ? `Rule expired on ${temporal.effective_to}.`
      : isFuture
        ? `Rule becomes effective on ${temporal[referenceField]}.`
        : `Rule is in force for the selected date via ${referenceField}.`,
  };
}
