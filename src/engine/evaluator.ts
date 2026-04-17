import type { EngineConfig } from "@/config/schema";
import { interpretDeclarativeTrigger } from "@/engine/declarative";
import { evaluateTemporalScope } from "@/engine/temporal";
import type { EvaluationResult, TriggerResult } from "@/engine/types";
import { customEvaluators } from "@/registry/custom-evaluators";
import { computeFreshnessStatus } from "@/registry/freshness";
import { applyGovernanceToRule } from "@/registry/governance";
import type { Rule } from "@/registry/schema";

function computeApplicability(
  rule: Rule,
  triggerResult: TriggerResult,
  missingInputs: string[],
  temporal: ReturnType<typeof evaluateTemporalScope>,
): Pick<
  EvaluationResult,
  | "applicability"
  | "explanation"
  | "was_downgraded_from_applicable"
  | "is_future_dated"
  | "is_date_unknown"
  | "months_until_effective"
> {
  if (rule.lifecycle_state === "PLACEHOLDER") {
    return {
      applicability: "UNKNOWN",
      explanation: "PLACEHOLDER rules always return UNKNOWN until authored and verified.",
      was_downgraded_from_applicable: false,
      is_future_dated: false,
      is_date_unknown: true,
      months_until_effective: null,
    };
  }

  if (missingInputs.length > 0) {
    return {
      applicability: "UNKNOWN",
      explanation: "Rule evaluation has at least one missing input and cannot be resolved.",
      was_downgraded_from_applicable: false,
      is_future_dated: false,
      is_date_unknown: true,
      months_until_effective: null,
    };
  }

  if (temporal.isDateUnknown) {
    return {
      applicability: "UNKNOWN",
      explanation: temporal.explanation,
      was_downgraded_from_applicable: false,
      is_future_dated: false,
      is_date_unknown: true,
      months_until_effective: null,
    };
  }

  if (temporal.isExpired) {
    return {
      applicability: "NOT_APPLICABLE",
      explanation: temporal.explanation,
      was_downgraded_from_applicable: false,
      is_future_dated: false,
      is_date_unknown: false,
      months_until_effective: null,
    };
  }

  if (temporal.isFuture) {
    if (rule.lifecycle_state !== "ACTIVE") {
      return {
        applicability: "CONDITIONAL",
        explanation:
          "Rule source not yet verified — future applicability is indicative only.",
        was_downgraded_from_applicable: false,
        is_future_dated: true,
        is_date_unknown: false,
        months_until_effective: temporal.monthsUntilEffective,
      };
    }

    return {
      applicability: "FUTURE",
      explanation: temporal.explanation,
      was_downgraded_from_applicable: false,
      is_future_dated: true,
      is_date_unknown: false,
      months_until_effective: temporal.monthsUntilEffective,
    };
  }

  if (triggerResult.match === false) {
    return {
      applicability: "NOT_APPLICABLE",
      explanation: triggerResult.reason,
      was_downgraded_from_applicable: false,
      is_future_dated: false,
      is_date_unknown: false,
      months_until_effective: temporal.monthsUntilEffective,
    };
  }

  if (triggerResult.match === "conditional") {
    return {
      applicability: "CONDITIONAL",
      explanation: triggerResult.reason,
      was_downgraded_from_applicable: false,
      is_future_dated: false,
      is_date_unknown: false,
      months_until_effective: temporal.monthsUntilEffective,
    };
  }

  if (rule.lifecycle_state !== "ACTIVE") {
    return {
      applicability: "CONDITIONAL",
      explanation: "Rule source not yet verified — applicability is indicative only.",
      was_downgraded_from_applicable: true,
      is_future_dated: false,
      is_date_unknown: false,
      months_until_effective: temporal.monthsUntilEffective,
    };
  }

  return {
    applicability: "APPLICABLE",
    explanation: triggerResult.reason,
    was_downgraded_from_applicable: false,
    is_future_dated: false,
    is_date_unknown: false,
    months_until_effective: temporal.monthsUntilEffective,
  };
}

export function evaluateRule(rule: Rule, config: EngineConfig): EvaluationResult {
  const governedRule = applyGovernanceToRule(rule);

  const triggerEvaluation =
    governedRule.trigger_logic.mode === "declarative"
      ? interpretDeclarativeTrigger(governedRule.trigger_logic, config)
      : {
          result:
            customEvaluators[governedRule.trigger_logic.evaluator_id]?.(config) ?? {
              match: "conditional",
              reason: `Custom evaluator ${governedRule.trigger_logic.evaluator_id} is not registered.`,
              matched_conditions: [],
              unmatched_conditions: [],
            },
          missingInputs: [],
        };

  const temporalAssessment = evaluateTemporalScope(governedRule.temporal, {
    approvalType: config.approvalType,
    sopDate: config.sopDate,
    firstRegistrationDate: config.firstRegistrationDate,
  });

  const applicability = computeApplicability(
    governedRule,
    triggerEvaluation.result,
    triggerEvaluation.missingInputs,
    temporalAssessment,
  );

  return {
    rule_id: governedRule.stable_id,
    title: governedRule.title,
    short_label: governedRule.short_label,
    legal_family: governedRule.legal_family,
    ui_package: governedRule.ui_package,
    process_stage: governedRule.process_stage,
    jurisdiction: governedRule.jurisdiction,
    jurisdiction_level: governedRule.jurisdiction_level,
    sources: governedRule.sources,
    lifecycle_state: governedRule.lifecycle_state,
    applicability: applicability.applicability,
    explanation:
      triggerEvaluation.missingInputs.length > 0
        ? `${applicability.explanation} At least one required field is a missing input.`
        : applicability.explanation,
    matched_conditions: triggerEvaluation.result.matched_conditions ?? [],
    unmatched_conditions: triggerEvaluation.result.unmatched_conditions ?? [],
    missing_inputs: triggerEvaluation.missingInputs,
    trigger_path: governedRule.trigger_logic.mode,
    applicability_summary: governedRule.applicability_summary,
    obligation_text: governedRule.obligation_text,
    evidence_tasks: governedRule.evidence_tasks,
    owner_hint: governedRule.owner_hint,
    planning_lead_time_months: governedRule.planning_lead_time_months,
    exclusions: governedRule.exclusions,
    temporal: governedRule.temporal,
    manual_review_required: governedRule.manual_review_required,
    manual_review_reason: governedRule.manual_review_reason,
    notes: governedRule.notes,
    is_future_dated: applicability.is_future_dated,
    is_date_unknown: applicability.is_date_unknown,
    months_until_effective: applicability.months_until_effective,
    was_downgraded_from_applicable: applicability.was_downgraded_from_applicable,
    freshness_status:
      governedRule.freshness_status ?? computeFreshnessStatus(governedRule),
  };
}

export function evaluateAllRules(
  rules: Rule[],
  config: EngineConfig,
): EvaluationResult[] {
  return rules.map((rule) => evaluateRule(rule, config));
}
