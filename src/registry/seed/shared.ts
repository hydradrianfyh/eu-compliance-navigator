import type { Rule } from "@/registry/schema";

type SeedRuleInput = Omit<
  Rule,
  | "vehicle_scope"
  | "applicability_summary"
  | "exclusions"
  | "temporal"
  | "planning_lead_time_months"
  | "output_kind"
  | "evidence_tasks"
  | "manual_review_required"
  | "manual_review_reason"
  | "notes"
> &
  Partial<
    Pick<
      Rule,
      | "vehicle_scope"
      | "applicability_summary"
      | "exclusions"
      | "temporal"
      | "planning_lead_time_months"
      | "output_kind"
      | "evidence_tasks"
      | "manual_review_required"
      | "manual_review_reason"
      | "notes"
      | "owner_hint_detail"
    >
  >;

export function makeSeedRule(input: SeedRuleInput): Rule {
  return {
    vehicle_scope: "See framework group and trigger logic.",
    applicability_summary: input.obligation_text,
    exclusions: [],
    temporal: {
      entry_into_force: null,
      applies_to_new_types_from: null,
      applies_to_all_new_vehicles_from: null,
      applies_to_first_registration_from: null,
      applies_from_generic: null,
      effective_to: null,
      small_volume_derogation_until: null,
      notes: null,
    },
    planning_lead_time_months: null,
    output_kind: "obligation",
    evidence_tasks: [],
    manual_review_required: input.lifecycle_state !== "ACTIVE",
    manual_review_reason:
      input.lifecycle_state === "ACTIVE"
        ? null
        : "Rule is not ACTIVE and requires source verification.",
    notes: null,
    ...input,
  };
}

export function makeSource(
  label: string,
  source_family: Rule["sources"][number]["source_family"],
  reference: string,
  oj_reference: string | null = null,
  authoritative_reference: string | null = null,
) {
  return {
    label,
    source_family,
    reference,
    official_url: null,
    oj_reference,
    authoritative_reference,
    last_verified_on: null,
  };
}
