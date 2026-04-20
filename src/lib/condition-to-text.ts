/**
 * Condition-to-text — translates an engine TriggerCondition into a plain-
 * English sentence suitable for the RuleCardV2 "Why it applies" section.
 *
 * Per UX Refactor v2 spec §7.3, Plain view hides raw JSON and renders
 * conditions as human sentences; Engineering view keeps the raw object.
 *
 * The translator honours `condition.label` when present (it is an
 * authored phrase) and otherwise derives a sentence from operator +
 * well-known field-name mapping. Unknown fields fall back to sentence-
 * cased field names (e.g. `myCustomField` → "My custom field").
 *
 * © Yanhao FU
 */

import type { TriggerCondition, TriggerLogicCustom } from "@/registry/schema";

/**
 * Field-name overrides for fields whose raw names do not read naturally
 * when sentence-cased, or where a semantic phrasing is clearer.
 */
const FIELD_PHRASING: Record<string, string> = {
  isL3Plus: "Automation level is L3 or higher",
  isDriverless: "Vehicle is driverless (L4 driverless)",
  batteryPresent: "Vehicle has a battery",
  hasOTA: "Vehicle supports over-the-air updates",
  hasConnectedServices: "Vehicle has connected services",
  processesPersonalData: "Vehicle processes personal data",
  hasAI: "Vehicle uses AI beyond conventional software",
  hasSafetyRelevantAI: "Vehicle uses AI as a safety component",
  targetsEU: "Market includes at least one EU country",
  targetsUK: "Market includes the UK",
};

/**
 * Fields that already carry a subject-phrase in FIELD_PHRASING. For these
 * we do not add another " is true" / " is set" clause because the phrase
 * itself is already a complete predicate.
 */
const SELF_CONTAINED_PHRASING = new Set(Object.keys(FIELD_PHRASING));

function toSentenceCase(field: string): string {
  // Split camelCase / snake_case into word segments, taking care to
  // preserve all-caps acronyms like "AI" or "OTA" as standalone segments.
  const segments = field
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase -> "camel Case"
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // "AIInventory" -> "AI Inventory"
    .split(/\s+/)
    .filter(Boolean);

  if (segments.length === 0) return "";

  const processed = segments.map((seg) =>
    /^[A-Z]{2,}$/.test(seg) ? seg : seg.toLowerCase(),
  );

  // Capitalize only the first segment unless it is already an acronym.
  const first = processed[0];
  processed[0] = /^[A-Z]{2,}$/.test(first)
    ? first
    : first.charAt(0).toUpperCase() + first.slice(1);

  return processed.join(" ");
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value === null || value === undefined) {
    return "unset";
  }
  return String(value);
}

export function conditionToHumanText(condition: TriggerCondition): string {
  // 1. Authored label always wins — it is the most readable form.
  if (condition.label && condition.label.trim().length > 0) {
    return condition.label;
  }

  // 2. Self-contained phrase (e.g. "Vehicle has a battery") for is_true /
  // is_false / is_not_null operators where a second clause would be noisy.
  if (
    SELF_CONTAINED_PHRASING.has(condition.field) &&
    (condition.operator === "is_true" ||
      condition.operator === "is_not_null")
  ) {
    return FIELD_PHRASING[condition.field];
  }

  const subject = toSentenceCase(condition.field);
  const formatted = formatValue(condition.value);

  switch (condition.operator) {
    case "eq":
      return `${subject} is ${formatted}`;
    case "neq":
      return `${subject} is not ${formatted}`;
    case "in":
      return `${subject} is one of ${formatted}`;
    case "not_in":
      return `${subject} is not one of ${formatted}`;
    case "includes":
      return `${subject} includes ${formatted}`;
    case "includes_any":
      return `${subject} includes any of ${formatted}`;
    case "gt":
      return `${subject} is greater than ${formatted}`;
    case "gte":
      return `${subject} is at least ${formatted}`;
    case "lt":
      return `${subject} is less than ${formatted}`;
    case "lte":
      return `${subject} is at most ${formatted}`;
    case "is_true":
      return `${subject} is true`;
    case "is_false":
      return `${subject} is false`;
    case "is_null":
      return `${subject} is not set`;
    case "is_not_null":
      return `${subject} is set`;
    default: {
      // Exhaustiveness check — add a new operator ⇒ TypeScript will error here.
      const exhaustiveCheck: never = condition.operator;
      return `${subject} ${exhaustiveCheck}`;
    }
  }
}

/**
 * Render a custom evaluator's description as a bullet string for the
 * "Why it applies" section.
 */
export function customEvaluatorToHumanText(
  logic: TriggerLogicCustom,
): string {
  return `Custom logic: ${logic.description}`;
}
