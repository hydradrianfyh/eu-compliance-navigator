import { z } from "zod";

import {
  missingSourceFieldSchema,
  reviewerDecisionSchema,
  sourceFamilySchema,
  verificationStatusSchema,
  verificationWorkflowStatusSchema,
  type MissingSourceField,
  type ReviewerDecision,
  type VerificationWorkflowStatus,
} from "@/shared/constants";
import type { VerificationReviewEntry } from "@/config/schema";
import { applyGovernanceToRule } from "@/registry/governance";
import { RuleRegistry } from "@/registry/registry";
import { ruleSchema, type Rule } from "@/registry/schema";
import { requiresOjReference } from "@/registry/source-validation";

const authoritativeSourceFamilies = new Set([
  "EUR-Lex",
  "UNECE",
  "European Commission",
  "Commission legal act",
  "Commission guidance",
  "EDPB",
  "ECHA",
  "National legislation",
  "UK Parliament",
  "Other official",
] as const);

export const verificationQueueItemSchema = z.object({
  stable_id: z.string(),
  title: z.string(),
  current_lifecycle_state: ruleSchema.shape.lifecycle_state,
  missing_source_fields: z.array(missingSourceFieldSchema),
  expected_authoritative_source_family: sourceFamilySchema,
  expected_legal_reference: z.string(),
  verification_status: verificationStatusSchema,
  reviewer_notes: z.string().nullable(),
});

export interface RulePromotabilityAssessment {
  stable_id: string;
  current_lifecycle_state: Rule["lifecycle_state"];
  promotable: boolean;
  missing_source_fields: MissingSourceField[];
  expected_authoritative_source_family: Rule["sources"][number]["source_family"];
  expected_legal_reference: string;
  reasons: string[];
}

export interface SourceCompletenessReport {
  queue_size: number;
  incomplete_rules: RulePromotabilityAssessment[];
}

export interface VerificationQueueWorkflowItem {
  stableId: string;
  title: string;
  reviewEntry: VerificationReviewEntry;
  assessment: RulePromotabilityAssessment;
}

export type VerificationQueueItem = z.infer<typeof verificationQueueItemSchema>;

export const reviewerWorkflowEntrySchema = z.object({
  official_url: z.string().nullable(),
  oj_reference: z.string().nullable(),
  last_verified_on: z.string().nullable(),
  reviewer_identity: z.string(),
  reviewer_decision: reviewerDecisionSchema,
  reviewer_notes: z.string(),
  workflow_status: verificationWorkflowStatusSchema,
  promoted_in_session: z.boolean(),
});

export function getMissingSourceFields(rule: Rule): MissingSourceField[] {
  const primarySource = rule.sources[0];
  const missingFields: MissingSourceField[] = [];

  if (!primarySource?.official_url) {
    missingFields.push("official_url");
  }

  if (
    requiresOjReference(primarySource?.source_family ?? "EUR-Lex") &&
    !primarySource?.oj_reference
  ) {
    missingFields.push("oj_reference");
  }

  if (!primarySource?.last_verified_on) {
    missingFields.push("last_verified_on");
  }

  return missingFields;
}

function hasAuthoritativePrimarySource(rule: Rule): boolean {
  return authoritativeSourceFamilies.has(rule.sources[0]?.source_family);
}

export function assessRulePromotability(rule: Rule): RulePromotabilityAssessment {
  const governedRule = applyGovernanceToRule(ruleSchema.parse(rule));
  const missingSourceFields = getMissingSourceFields(rule);
  const reasons: string[] = [];

  if (!hasAuthoritativePrimarySource(rule)) {
    reasons.push("Primary source family is not authoritative for ACTIVE promotion.");
  }

  if (missingSourceFields.length > 0) {
    reasons.push(
      `Primary source is missing required fields: ${missingSourceFields.join(", ")}.`,
    );
  }

  if (governedRule.lifecycle_state === "PLACEHOLDER") {
    reasons.push("PLACEHOLDER rules cannot be promoted to ACTIVE.");
  }

  if (governedRule.lifecycle_state === "ARCHIVED") {
    reasons.push("ARCHIVED rules cannot be promoted to ACTIVE.");
  }

  return {
    stable_id: governedRule.stable_id,
    current_lifecycle_state: governedRule.lifecycle_state,
    promotable: reasons.length === 0,
    missing_source_fields: missingSourceFields,
    expected_authoritative_source_family: rule.sources[0].source_family,
    expected_legal_reference: rule.sources[0].reference,
    reasons,
  };
}

export function getVerificationStatus(
  assessment: RulePromotabilityAssessment,
): VerificationQueueItem["verification_status"] {
  if (
    assessment.current_lifecycle_state === "PLACEHOLDER" ||
    assessment.current_lifecycle_state === "ARCHIVED"
  ) {
    return "BLOCKED";
  }

  if (assessment.promotable) {
    return "VERIFIED_READY_FOR_PROMOTION";
  }

  if (assessment.missing_source_fields.length > 0) {
    return "PENDING_SOURCE_FIELDS";
  }

  return "READY_FOR_REVIEW";
}

export function buildVerificationQueue(rules: Rule[]): VerificationQueueItem[] {
  return rules
    .filter((rule) => rule.lifecycle_state === "ACTIVE")
    .map((rule) => {
      const assessment = assessRulePromotability(rule);

      return {
        stable_id: rule.stable_id,
        title: rule.title,
        current_lifecycle_state: assessment.current_lifecycle_state,
        missing_source_fields: assessment.missing_source_fields,
        expected_authoritative_source_family:
          assessment.expected_authoritative_source_family,
        expected_legal_reference: assessment.expected_legal_reference,
        verification_status: getVerificationStatus(assessment),
        reviewer_notes:
          assessment.reasons.length > 0 ? assessment.reasons.join(" ") : null,
      };
    })
    .filter(
      (item) =>
        item.current_lifecycle_state === "SEED_UNVERIFIED" &&
        item.verification_status === "PENDING_SOURCE_FIELDS",
    )
    .map((item) => verificationQueueItemSchema.parse(item));
}

export function validateSourceCompleteness(rules: Rule[]): SourceCompletenessReport {
  const incompleteRules = rules
    .filter((rule) => rule.lifecycle_state === "ACTIVE")
    .map((rule) => assessRulePromotability(rule))
    .filter((assessment) => !assessment.promotable);

  return {
    queue_size: incompleteRules.length,
    incomplete_rules: incompleteRules,
  };
}

export function mergeReviewEntryIntoRule(
  rule: Rule,
  entry: VerificationReviewEntry,
): Rule {
  const primarySource = rule.sources[0];
  const nextSources = [
    {
      ...primarySource,
      official_url: entry.official_url,
      oj_reference: entry.oj_reference,
      last_verified_on: entry.last_verified_on,
    },
    ...rule.sources.slice(1),
  ];

  return {
    ...rule,
    sources: nextSources,
    manual_review_reason: entry.reviewer_notes || rule.manual_review_reason,
  };
}

export function deriveWorkflowStatus(
  assessment: RulePromotabilityAssessment,
  entry: VerificationReviewEntry,
): VerificationWorkflowStatus {
  if (
    assessment.promotable &&
    entry.reviewer_decision === "promote_now" &&
    entry.reviewer_identity.trim()
  ) {
    return "promoted";
  }

  if (assessment.promotable) {
    return "promotable";
  }

  const hasCoreVerificationProgress = Boolean(
    entry.official_url || entry.last_verified_on,
  );
  const hasOjProgress =
    entry.oj_reference !== null &&
    entry.oj_reference.trim().length > 0 &&
    assessment.missing_source_fields.includes("oj_reference");

  return hasCoreVerificationProgress || hasOjProgress
    ? "partially_verified"
    : "blocked";
}

export function buildDefaultReviewEntry(
  rule: Rule,
): VerificationReviewEntry {
  return {
    official_url: rule.sources[0]?.official_url ?? null,
    oj_reference: rule.sources[0]?.oj_reference ?? null,
    last_verified_on: rule.sources[0]?.last_verified_on ?? null,
    reviewer_identity: "",
    reviewer_decision: "pending",
    reviewer_notes: "",
    workflow_status: "blocked",
    promoted_in_session: false,
  };
}

export function tryPromoteReviewedRule(
  rule: Rule,
  entry: VerificationReviewEntry,
): { promotedRule: Rule | null; assessment: RulePromotabilityAssessment } {
  const mergedRule = mergeReviewEntryIntoRule(rule, entry);
  const assessment = assessRulePromotability(mergedRule);

  if (
    assessment.promotable &&
    entry.reviewer_decision === "promote_now" &&
    entry.reviewer_identity.trim()
  ) {
    return {
      promotedRule: prepareRuleForActivePromotion(
        mergedRule,
        entry.reviewer_identity.trim(),
      ),
      assessment,
    };
  }

  return {
    promotedRule: null,
    assessment,
  };
}

export function buildPriorityVerificationQueueState(
  rules: Rule[],
  reviewState: Record<string, VerificationReviewEntry>,
  priorityIds: string[],
): VerificationQueueWorkflowItem[] {
  return priorityIds
    .map((stableId) => {
      const baseRule = rules.find((rule) => rule.stable_id === stableId);
      if (!baseRule) {
        return null;
      }

      const reviewEntry =
        reviewState[stableId] ?? buildDefaultReviewEntry(baseRule);
      const mergedRule = mergeReviewEntryIntoRule(baseRule, reviewEntry);
      const assessment = assessRulePromotability(mergedRule);

      return {
        stableId,
        title: baseRule.title,
        reviewEntry: {
          ...reviewEntry,
          workflow_status: deriveWorkflowStatus(assessment, reviewEntry),
        },
        assessment,
      };
    })
    .filter((item): item is VerificationQueueWorkflowItem => item !== null);
}

export function materializeRulesFromReviewState(
  rules: Rule[],
  reviewState: Record<string, VerificationReviewEntry>,
): Rule[] {
  const mergedRules = rules.map((rule) => {
    const reviewEntry = reviewState[rule.stable_id];
    return reviewEntry ? mergeReviewEntryIntoRule(rule, reviewEntry) : rule;
  });

  let registry = new RuleRegistry(mergedRules);

  for (const rule of mergedRules) {
    const reviewEntry = reviewState[rule.stable_id];
    if (!reviewEntry) {
      continue;
    }

    const { assessment } = tryPromoteReviewedRule(rule, reviewEntry);
    if (
      assessment.promotable &&
      reviewEntry.reviewer_decision === "promote_now" &&
      reviewEntry.reviewer_identity.trim()
    ) {
      registry = registry.promoteRuleToActive(
        rule.stable_id,
        reviewEntry.reviewer_identity.trim(),
      );
    }
  }

  return registry.getAllRules();
}

export function assertRulePromotableToActive(rule: Rule): RulePromotabilityAssessment {
  const assessment = assessRulePromotability(rule);

  if (!assessment.promotable) {
    throw new Error(
      `Rule ${assessment.stable_id} is not promotable to ACTIVE: ${assessment.reasons.join(" ")}`,
    );
  }

  return assessment;
}

export function prepareRuleForActivePromotion(rule: Rule, reviewer: string): Rule {
  assertRulePromotableToActive(rule);

  return {
    ...rule,
    lifecycle_state: "ACTIVE",
    manual_review_required: false,
    manual_review_reason: null,
    promoted_by: reviewer,
  };
}
