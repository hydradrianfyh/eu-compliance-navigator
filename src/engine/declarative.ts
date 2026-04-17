import type { EngineConfig } from "@/config/schema";
import type { TriggerCondition, TriggerLogicDeclarative } from "@/registry/schema";
import type { TriggerResult } from "@/engine/types";

function getValueByPath(config: EngineConfig, field: string): unknown {
  return field.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in (current as object)) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, config);
}

function matchesCondition(actual: unknown, condition: TriggerCondition): boolean {
  switch (condition.operator) {
    case "eq":
      return actual === condition.value;
    case "neq":
      return actual !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(actual);
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(actual);
    case "includes":
      return Array.isArray(actual) && actual.includes(condition.value);
    case "includes_any":
      return (
        Array.isArray(actual) &&
        Array.isArray(condition.value) &&
        condition.value.some((item) => actual.includes(item))
      );
    case "gt":
      return typeof actual === "number" && typeof condition.value === "number" && actual > condition.value;
    case "gte":
      return typeof actual === "number" && typeof condition.value === "number" && actual >= condition.value;
    case "lt":
      return typeof actual === "number" && typeof condition.value === "number" && actual < condition.value;
    case "lte":
      return typeof actual === "number" && typeof condition.value === "number" && actual <= condition.value;
    case "is_true":
      return actual === true;
    case "is_false":
      return actual === false;
    case "is_null":
      return actual === null || actual === undefined;
    case "is_not_null":
      return actual !== null && actual !== undefined;
    default:
      return false;
  }
}

export interface DeclarativeEvaluation {
  result: TriggerResult;
  missingInputs: string[];
}

export function interpretDeclarativeTrigger(
  triggerLogic: TriggerLogicDeclarative,
  config: EngineConfig,
): DeclarativeEvaluation {
  const matchedConditions: string[] = [];
  const unmatchedConditions: string[] = [];
  const missingInputs: string[] = [];

  for (const condition of triggerLogic.conditions) {
    const actual = getValueByPath(config, condition.field);
    const label = condition.label ?? `${condition.field} ${condition.operator}`;

    if (actual === undefined || actual === null) {
      missingInputs.push(condition.field);
      continue;
    }

    if (matchesCondition(actual, condition)) {
      matchedConditions.push(label);
    } else {
      unmatchedConditions.push(label);
    }
  }

  if (missingInputs.length > 0) {
    return {
      result: {
        match: false,
        reason:
          triggerLogic.fallback_if_missing === "unknown"
            ? "Cannot determine applicability because at least one required input is missing."
            : "Required inputs are missing, so the rule is treated as not applicable.",
        matched_conditions: matchedConditions,
        unmatched_conditions: unmatchedConditions,
      },
      missingInputs,
    };
  }

  const didMatch =
    triggerLogic.match_mode === "all"
      ? unmatchedConditions.length === 0
      : matchedConditions.length > 0;

  if (didMatch && triggerLogic.conditional_reason) {
    return {
      result: {
        match: "conditional",
        reason: triggerLogic.conditional_reason,
        matched_conditions: matchedConditions,
        unmatched_conditions: unmatchedConditions,
      },
      missingInputs,
    };
  }

  return {
    result: {
      match: didMatch,
      reason: didMatch ? "Declarative trigger matched." : "Declarative trigger did not match.",
      matched_conditions: matchedConditions,
      unmatched_conditions: unmatchedConditions,
    },
    missingInputs,
  };
}
