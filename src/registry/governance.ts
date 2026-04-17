import { legalFamilies, ruleLifecycleStates } from "@/shared/constants";
import type { Rule, SourceReference } from "@/registry/schema";
import { requiresOjReference } from "@/registry/source-validation";

export interface RegistryValidationReport {
  totalRules: number;
  byLifecycleState: Record<(typeof ruleLifecycleStates)[number], number>;
  activeWithoutUrl: Rule[];
  activeWithoutOjReference: Rule[];
  activeWithoutVerification: Rule[];
  staleRules: Rule[];
  orphanedFamilies: string[];
  duplicateIds: string[];
}

function hasVerifiedPrimarySource(source: SourceReference | undefined): boolean {
  if (!source?.official_url || !source?.last_verified_on) {
    return false;
  }

  if (requiresOjReference(source.source_family) && !source.oj_reference) {
    return false;
  }

  return true;
}

export function applyGovernanceToRule(rule: Rule): Rule {
  if (rule.lifecycle_state === "PLACEHOLDER") {
    return {
      ...rule,
      manual_review_required: true,
      manual_review_reason: "PLACEHOLDER rules cannot be treated as verified obligations.",
    };
  }

  if (rule.lifecycle_state === "ACTIVE" && !hasVerifiedPrimarySource(rule.sources[0])) {
    return {
      ...rule,
      lifecycle_state: "SEED_UNVERIFIED",
      manual_review_required: true,
      manual_review_reason:
        "Downgraded from ACTIVE because verified official_url, oj_reference, and/or last_verified_on is missing.",
    };
  }

  if (rule.lifecycle_state !== "ACTIVE") {
    return {
      ...rule,
      manual_review_required: true,
      manual_review_reason:
        rule.manual_review_reason ??
        "Rule is not ACTIVE and therefore still requires human verification.",
    };
  }

  return {
    ...rule,
    manual_review_required: false,
    manual_review_reason: null,
  };
}

export function validateRegistryIntegrity(rules: Rule[]): RegistryValidationReport {
  const duplicateIds = rules
    .map((rule) => rule.stable_id)
    .filter((id, index, all) => all.indexOf(id) !== index)
    .filter((id, index, all) => all.indexOf(id) === index);

  const activeRules = rules.filter((rule) => rule.lifecycle_state === "ACTIVE");
  const activeWithoutUrl = activeRules.filter((rule) => !rule.sources[0]?.official_url);
  const activeWithoutOjReference = activeRules.filter(
    (rule) =>
      requiresOjReference(rule.sources[0]?.source_family ?? "EUR-Lex") &&
      !rule.sources[0]?.oj_reference,
  );
  const activeWithoutVerification = activeRules.filter(
    (rule) => !rule.sources[0]?.last_verified_on,
  );

  const byLifecycleState = Object.fromEntries(
    ruleLifecycleStates.map((state) => [
      state,
      rules.filter((rule) => rule.lifecycle_state === state).length,
    ]),
  ) as RegistryValidationReport["byLifecycleState"];

  const orphanedFamilies = legalFamilies.filter(
    (family) => !rules.some((rule) => rule.legal_family === family),
  );

  return {
    totalRules: rules.length,
    byLifecycleState,
    activeWithoutUrl,
    activeWithoutOjReference,
    activeWithoutVerification,
    staleRules: [],
    orphanedFamilies,
    duplicateIds,
  };
}
