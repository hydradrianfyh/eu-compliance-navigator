import type { VehicleConfig } from "@/config/schema";
import type { EvaluationResult } from "@/engine/types";
import type { TimelineOutput } from "@/engine/timeline";
import { summarizeFreshness } from "@/registry/freshness";
import type { Rule } from "@/registry/schema";

export interface BlockerItem {
  stable_id: string;
  title: string;
  short_label: string;
  owner_hint: string;
  reason: string;
  severity: "high" | "medium" | "low";
}

export interface DeadlineItem {
  stable_id: string;
  title: string;
  deadline: string;
  months_remaining: number;
  owner_hint: string;
}

export interface ExecutiveSummary {
  canEnterMarket: boolean;
  confidence: "high" | "medium" | "low";
  topBlockers: BlockerItem[];
  topDeadlines: DeadlineItem[];
  countriesAtRisk: string[];
  freshnessOverview: {
    fresh: number;
    due_soon: number;
    overdue: number;
    critically_overdue: number;
    never_verified: number;
    total: number;
  };
  coverageScore: number;
  verified_count: number;
  indicative_count: number;
  pending_authoring: number;
  /**
   * Registry-wide lifecycle totals (independent of this project's
   * applicability). Added in UX-002 so the Status tab can reconcile its
   * project-scoped counts with the Coverage tab's registry-scoped counts,
   * e.g. "Indicative applicable: 0 · Registry SEED_UNVERIFIED: 57".
   */
  registry_totals: {
    active: number;
    seed_unverified: number;
    draft: number;
    placeholder: number;
    archived: number;
    total: number;
  };
  generated_at: string;
}

const SEVERITY_RANK: Record<BlockerItem["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function monthStartUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthKeyToDate(monthKey: string): Date {
  return new Date(`${monthKey}-01T00:00:00Z`);
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth())
  );
}

function requiredEvidenceCount(rule: Rule, result?: EvaluationResult): number {
  const docs = rule.required_documents?.length ?? 0;
  if (docs > 0) return docs;
  return result?.evidence_tasks.length ?? 0;
}

function isJurisdictionInScope(rule: Rule, config: VehicleConfig): boolean {
  if (
    rule.jurisdiction_level === "MEMBER_STATE" ||
    rule.jurisdiction_level === "NON_EU_MARKET"
  ) {
    return config.targetCountries.includes(rule.jurisdiction);
  }
  // EU / UNECE rules are always in jurisdictional scope for EU-targeted vehicles.
  return true;
}

export function buildExecutiveSummary(args: {
  config: VehicleConfig;
  results: EvaluationResult[];
  rules: Rule[];
  timeline: TimelineOutput;
  now?: Date;
}): ExecutiveSummary {
  const { config, results, rules, timeline } = args;
  const now = args.now ?? new Date();
  const nowMonthStart = monthStartUtc(now);

  const rulesById = new Map<string, Rule>();
  for (const rule of rules) rulesById.set(rule.stable_id, rule);

  const resultsById = new Map<string, EvaluationResult>();
  for (const result of results) resultsById.set(result.rule_id, result);

  // Counts ---------------------------------------------------------------
  const verified_count = results.filter(
    (r) => r.lifecycle_state === "ACTIVE" && r.applicability === "APPLICABLE",
  ).length;

  const indicative_count = results.filter(
    (r) =>
      r.lifecycle_state === "SEED_UNVERIFIED" &&
      (r.applicability === "APPLICABLE" || r.applicability === "CONDITIONAL"),
  ).length;

  const pending_authoring = rules.filter(
    (r) =>
      r.lifecycle_state === "PLACEHOLDER" && isJurisdictionInScope(r, config),
  ).length;

  const unscheduled_count = timeline.unscheduled.length;

  // Coverage score -------------------------------------------------------
  const coverageDenom =
    verified_count + indicative_count + pending_authoring + unscheduled_count;
  const coverageScore =
    coverageDenom === 0
      ? 0
      : Math.max(
          0,
          Math.min(100, Math.round((100 * verified_count) / coverageDenom)),
        );

  // Confidence -----------------------------------------------------------
  const confidenceDenom = verified_count + indicative_count + pending_authoring;
  const confidenceRatio =
    confidenceDenom === 0 ? 0 : verified_count / confidenceDenom;
  const confidence: ExecutiveSummary["confidence"] =
    confidenceRatio >= 0.6
      ? "high"
      : confidenceRatio < 0.25
        ? "low"
        : "medium";

  // Freshness overview (ACTIVE rules only) -------------------------------
  const activeRules = rules.filter((r) => r.lifecycle_state === "ACTIVE");
  const freshnessOverview = summarizeFreshness(activeRules, now);

  // Countries at risk ----------------------------------------------------
  const countriesAtRisk: string[] = [];
  for (const country of config.targetCountries) {
    const jurisdictionRules = rules.filter((r) => r.jurisdiction === country);
    const total = jurisdictionRules.length;
    if (total === 0) continue;
    let unknownCount = 0;
    for (const rule of jurisdictionRules) {
      const result = resultsById.get(rule.stable_id);
      if (result?.applicability === "UNKNOWN") unknownCount += 1;
    }
    if (unknownCount / total > 0.5) countriesAtRisk.push(country);
  }

  // Top deadlines --------------------------------------------------------
  const allDeadlines: DeadlineItem[] = [];
  const seenDeadlineIds = new Set<string>();
  for (const milestone of timeline.milestones) {
    const deadlineDate = monthKeyToDate(milestone.month);
    const months = monthsBetween(nowMonthStart, deadlineDate);
    for (const item of milestone.deadline_rules) {
      if (seenDeadlineIds.has(item.stable_id)) continue;
      seenDeadlineIds.add(item.stable_id);
      allDeadlines.push({
        stable_id: item.stable_id,
        title: item.title,
        deadline: `${milestone.month}-01`,
        months_remaining: months,
        owner_hint: item.owner_hint,
      });
    }
  }
  const topDeadlines = [...allDeadlines]
    .sort((a, b) => a.months_remaining - b.months_remaining)
    .slice(0, 10);

  // Top blockers ---------------------------------------------------------
  interface BlockerWithDeadline extends BlockerItem {
    deadlineMonth: string;
    monthsAhead: number;
  }
  const blockers: BlockerWithDeadline[] = [];
  const seenBlockerIds = new Set<string>();

  for (const milestone of timeline.milestones) {
    const deadlineDate = monthKeyToDate(milestone.month);
    const monthsAhead = monthsBetween(nowMonthStart, deadlineDate);
    if (monthsAhead < 0 || monthsAhead > 12) continue;

    for (const item of milestone.deadline_rules) {
      if (seenBlockerIds.has(item.stable_id)) continue;
      const rule = rulesById.get(item.stable_id);
      const result = resultsById.get(item.stable_id);
      if (!rule || !result) continue;
      if (result.applicability !== "APPLICABLE") continue;

      const isActive = rule.lifecycle_state === "ACTIVE";
      const hasThirdParty = rule.third_party_verification_required === true;
      const evidenceCount = requiredEvidenceCount(rule, result);
      const hasNoEvidence = evidenceCount === 0;

      let severity: BlockerItem["severity"];
      if (isActive && hasThirdParty && monthsAhead <= 6) {
        severity = "high";
      } else if (monthsAhead <= 12) {
        severity = "medium";
      } else {
        severity = "low";
      }

      const reasonParts = ["APPLICABLE"];
      if (hasThirdParty) reasonParts.push("third_party_verification_required");
      if (hasNoEvidence) reasonParts.push("no evidence");
      const reason = reasonParts.join(" + ");

      seenBlockerIds.add(item.stable_id);
      blockers.push({
        stable_id: item.stable_id,
        title: item.title,
        short_label: item.short_label,
        owner_hint: item.owner_hint,
        reason,
        severity,
        deadlineMonth: milestone.month,
        monthsAhead,
      });
    }
  }

  const topBlockersSorted = [...blockers].sort((a, b) => {
    const severityDelta = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (severityDelta !== 0) return severityDelta;
    if (a.deadlineMonth < b.deadlineMonth) return -1;
    if (a.deadlineMonth > b.deadlineMonth) return 1;
    return a.stable_id < b.stable_id ? -1 : a.stable_id > b.stable_id ? 1 : 0;
  });

  const topBlockers: BlockerItem[] = topBlockersSorted.slice(0, 5).map(
    ({ stable_id, title, short_label, owner_hint, reason, severity }) => ({
      stable_id,
      title,
      short_label,
      owner_hint,
      reason,
      severity,
    }),
  );

  // canEnterMarket -------------------------------------------------------
  const hasActiveThirdPartyEvidenceGap = results.some((r) => {
    if (r.applicability !== "APPLICABLE") return false;
    if (r.lifecycle_state !== "ACTIVE") return false;
    const rule = rulesById.get(r.rule_id);
    if (!rule) return false;
    if (!rule.third_party_verification_required) return false;
    return requiredEvidenceCount(rule, r) === 0;
  });
  const canEnterMarket =
    !hasActiveThirdPartyEvidenceGap && countriesAtRisk.length === 0;

  // UX-002 reconciliation: expose registry-wide lifecycle totals so the
  // Status tab can explain "Indicative applicable: 0 (registry has 57
  // SEED_UNVERIFIED rules)" instead of looking like a silent contradiction
  // against the Coverage tab.
  const registry_totals = {
    active: 0,
    seed_unverified: 0,
    draft: 0,
    placeholder: 0,
    archived: 0,
    total: rules.length,
  };
  for (const rule of rules) {
    switch (rule.lifecycle_state) {
      case "ACTIVE":
        registry_totals.active += 1;
        break;
      case "SEED_UNVERIFIED":
        registry_totals.seed_unverified += 1;
        break;
      case "DRAFT":
        registry_totals.draft += 1;
        break;
      case "PLACEHOLDER":
        registry_totals.placeholder += 1;
        break;
      case "ARCHIVED":
        registry_totals.archived += 1;
        break;
    }
  }

  return {
    canEnterMarket,
    confidence,
    topBlockers,
    topDeadlines,
    countriesAtRisk,
    freshnessOverview,
    coverageScore,
    verified_count,
    indicative_count,
    pending_authoring,
    registry_totals,
    generated_at: now.toISOString(),
  };
}
