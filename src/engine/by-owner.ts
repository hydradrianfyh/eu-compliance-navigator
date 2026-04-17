import type { EvaluationResult } from "@/engine/types";
import type { FreshnessStatus, Rule } from "@/registry/schema";

export interface OwnerTaskItem {
  stable_id: string;
  title: string;
  short_label: string;
  applicability: string;
  lifecycle_state: string;
  freshness_status?: FreshnessStatus;
  required_documents_count: number;
  required_evidence_count: number;
  submission_timing?: string;
  third_party_verification_required?: boolean;
  recurring_post_market_obligation?: boolean;
  planning_lead_time_months: number | null;
}

export interface OwnerBucket {
  owner_hint: string;
  owner_label: string;
  applicable_count: number;
  conditional_count: number;
  unknown_count: number;
  blocked_count: number;
  items: OwnerTaskItem[];
}

export interface OwnerDashboard {
  buckets: OwnerBucket[];
  total_owners: number;
  total_applicable: number;
}

const INCLUDED_APPLICABILITY = new Set([
  "APPLICABLE",
  "CONDITIONAL",
  "FUTURE",
  "UNKNOWN",
]);

function toOwnerLabel(ownerHint: string): string {
  return ownerHint
    .split("_")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toOwnerTaskItem(
  result: EvaluationResult,
  rule: Rule | undefined,
): OwnerTaskItem {
  const docs = rule?.required_documents?.length ?? 0;
  const evidence = rule?.required_evidence?.length ?? 0;
  return {
    stable_id: result.rule_id,
    title: result.title,
    short_label: result.short_label,
    applicability: result.applicability,
    lifecycle_state: result.lifecycle_state,
    freshness_status: result.freshness_status ?? rule?.freshness_status,
    required_documents_count: docs,
    required_evidence_count: evidence,
    submission_timing: rule?.submission_timing,
    third_party_verification_required: rule?.third_party_verification_required,
    recurring_post_market_obligation: rule?.recurring_post_market_obligation,
    planning_lead_time_months: result.planning_lead_time_months,
  };
}

function isBlocked(result: EvaluationResult, rule: Rule | undefined): boolean {
  if (result.applicability !== "APPLICABLE") return false;
  if (!rule?.third_party_verification_required) return false;
  const docs = rule.required_documents?.length ?? 0;
  return docs === 0;
}

function compareItems(a: OwnerTaskItem, b: OwnerTaskItem): number {
  const leadA = a.planning_lead_time_months ?? 0;
  const leadB = b.planning_lead_time_months ?? 0;
  if (leadA !== leadB) return leadB - leadA;
  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;
  return 0;
}

export function buildOwnerDashboard(args: {
  results: EvaluationResult[];
  rules: Rule[];
}): OwnerDashboard {
  const { results, rules } = args;

  const rulesById = new Map<string, Rule>();
  for (const rule of rules) rulesById.set(rule.stable_id, rule);

  const byOwner = new Map<string, OwnerBucket>();

  for (const result of results) {
    if (!INCLUDED_APPLICABILITY.has(result.applicability)) continue;

    const ownerHint = result.owner_hint;
    const rule = rulesById.get(result.rule_id);

    let bucket = byOwner.get(ownerHint);
    if (!bucket) {
      bucket = {
        owner_hint: ownerHint,
        owner_label: toOwnerLabel(ownerHint),
        applicable_count: 0,
        conditional_count: 0,
        unknown_count: 0,
        blocked_count: 0,
        items: [],
      };
      byOwner.set(ownerHint, bucket);
    }

    switch (result.applicability) {
      case "APPLICABLE":
        bucket.applicable_count += 1;
        break;
      case "CONDITIONAL":
        bucket.conditional_count += 1;
        break;
      case "UNKNOWN":
        bucket.unknown_count += 1;
        break;
      default:
        break;
    }

    if (isBlocked(result, rule)) {
      bucket.blocked_count += 1;
    }

    bucket.items.push(toOwnerTaskItem(result, rule));
  }

  for (const bucket of byOwner.values()) {
    bucket.items.sort(compareItems);
  }

  const buckets = Array.from(byOwner.values()).sort((a, b) => {
    if (a.applicable_count !== b.applicable_count) {
      return b.applicable_count - a.applicable_count;
    }
    if (a.owner_label < b.owner_label) return -1;
    if (a.owner_label > b.owner_label) return 1;
    return 0;
  });

  const total_applicable = buckets.reduce(
    (sum, bucket) => sum + bucket.applicable_count,
    0,
  );

  return {
    buckets,
    total_owners: buckets.length,
    total_applicable,
  };
}
