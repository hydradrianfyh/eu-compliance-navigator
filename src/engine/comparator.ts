import type { EvaluationResult } from "@/engine/types";

export function compareEvaluations(base: EvaluationResult[], candidate: EvaluationResult[]) {
  const baseMap = new Map(base.map((result) => [result.rule_id, result.applicability]));

  return candidate.map((result) => ({
    rule_id: result.rule_id,
    previous: baseMap.get(result.rule_id) ?? null,
    current: result.applicability,
    changed: baseMap.get(result.rule_id) !== result.applicability,
  }));
}

export interface EvaluationComparisonRow {
  rule_id: string;
  title: string;
  group_key: string;
  left: EvaluationResult | null;
  right: EvaluationResult | null;
  applicability_changed: boolean;
  lifecycle_changed: boolean;
  manual_review_changed: boolean;
  explanation_changed: boolean;
}

export function compareEvaluationRows(
  leftResults: EvaluationResult[],
  rightResults: EvaluationResult[],
  groupMode: "legal_family" | "ui_package",
): EvaluationComparisonRow[] {
  const leftMap = new Map(leftResults.map((result) => [result.rule_id, result]));
  const rightMap = new Map(rightResults.map((result) => [result.rule_id, result]));
  const ruleIds = Array.from(new Set([...leftMap.keys(), ...rightMap.keys()]));

  return ruleIds.map((ruleId) => {
    const left = leftMap.get(ruleId) ?? null;
    const right = rightMap.get(ruleId) ?? null;
    const reference = left ?? right;

    return {
      rule_id: ruleId,
      title: reference?.title ?? ruleId,
      group_key:
        groupMode === "legal_family"
          ? reference?.legal_family ?? "ungrouped"
          : reference?.ui_package ?? "ungrouped",
      left,
      right,
      applicability_changed: left?.applicability !== right?.applicability,
      lifecycle_changed: left?.lifecycle_state !== right?.lifecycle_state,
      manual_review_changed:
        left?.manual_review_required !== right?.manual_review_required,
      explanation_changed: left?.explanation !== right?.explanation,
    };
  });
}
