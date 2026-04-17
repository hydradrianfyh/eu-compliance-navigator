import type { FreshnessStatus, Rule } from "@/registry/schema";

/**
 * Default review cadence in days based on lifecycle state.
 * ACTIVE rules are safety-critical and reviewed more often.
 */
export function defaultCadenceDays(lifecycle_state: string): number {
  return lifecycle_state === "ACTIVE" ? 180 : 365;
}

function parseIsoDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function diffDays(now: Date, past: Date): number {
  const ms = now.valueOf() - past.valueOf();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Compute the 5-state freshness status for a rule.
 *
 *   fresh              -- reviewed within 80% of cadence
 *   due_soon           -- within the cadence window (80%-100%)
 *   overdue            -- cadence exceeded up to +50%
 *   critically_overdue -- cadence exceeded beyond +50%
 *   never_verified     -- no last_human_review_at on record
 */
export function computeFreshnessStatus(rule: Rule, now: Date = new Date()): FreshnessStatus {
  const reviewed = parseIsoDate(rule.last_human_review_at);
  if (!reviewed) return "never_verified";

  const cadence = rule.review_cadence_days ?? defaultCadenceDays(rule.lifecycle_state);
  const days = diffDays(now, reviewed);

  if (days <= cadence * 0.8) return "fresh";
  if (days <= cadence) return "due_soon";
  if (days <= cadence * 1.5) return "overdue";
  return "critically_overdue";
}

export interface FreshnessSummary {
  fresh: number;
  due_soon: number;
  overdue: number;
  critically_overdue: number;
  never_verified: number;
  total: number;
}

export function summarizeFreshness(
  rules: Rule[],
  now: Date = new Date(),
): FreshnessSummary {
  const summary: FreshnessSummary = {
    fresh: 0,
    due_soon: 0,
    overdue: 0,
    critically_overdue: 0,
    never_verified: 0,
    total: rules.length,
  };

  for (const rule of rules) {
    const status = computeFreshnessStatus(rule, now);
    summary[status] += 1;
  }

  return summary;
}

/**
 * Annotate a rule with its computed freshness_status so UI layers can render it
 * without recomputing. Does not mutate the input.
 */
export function withFreshness<T extends Rule>(rule: T, now: Date = new Date()): T {
  return {
    ...rule,
    freshness_status: computeFreshnessStatus(rule, now),
  };
}
