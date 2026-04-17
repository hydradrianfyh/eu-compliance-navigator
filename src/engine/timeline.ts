import type { VehicleConfig } from "@/config/schema";
import type { EvaluationResult } from "@/engine/types";
import { defaultCadenceDays } from "@/registry/freshness";
import type { Rule, RuleTemporalScope } from "@/registry/schema";

export interface RuleTimelineItem {
  stable_id: string;
  title: string;
  short_label: string;
  owner_hint: string;
  reason: string;
  required_documents_count: number;
  lifecycle_state: string;
  freshness_status?: string;
}

export interface TimelineMilestone {
  month: string;
  monthLabel: string;
  deadline_rules: RuleTimelineItem[];
  evidence_due: RuleTimelineItem[];
  review_due: RuleTimelineItem[];
}

export interface TimelineOutput {
  sop_month: string;
  first_registration_month: string;
  milestones: TimelineMilestone[];
  unscheduled: RuleTimelineItem[];
  range_start: string;
  range_end: string;
}

const DEFAULT_EVIDENCE_LEAD_TIME = 6;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const SCHEDULABLE_APPLICABILITY = new Set([
  "APPLICABLE",
  "CONDITIONAL",
  "FUTURE",
]);

function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
}

function toMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

function toMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const idx = Number.parseInt(month, 10) - 1;
  const label = MONTH_LABELS[idx] ?? month;
  return `${label} ${year}`;
}

function minDate(a: Date, b: Date): Date {
  return a.valueOf() <= b.valueOf() ? a : b;
}

function maxDate(a: Date, b: Date): Date {
  return a.valueOf() >= b.valueOf() ? a : b;
}

interface DeadlineChoice {
  date: Date;
  field:
    | "applies_to_new_types_from"
    | "applies_to_all_new_vehicles_from"
    | "applies_to_first_registration_from"
    | "applies_from_generic";
}

function chooseDeadline(
  temporal: RuleTemporalScope,
  approvalType: string,
): DeadlineChoice | null {
  if (approvalType === "new_type") {
    const d = parseIsoDate(temporal.applies_to_new_types_from);
    if (d) return { date: d, field: "applies_to_new_types_from" };
  }

  const allNew = parseIsoDate(temporal.applies_to_all_new_vehicles_from);
  if (allNew) {
    return { date: allNew, field: "applies_to_all_new_vehicles_from" };
  }

  const firstReg = parseIsoDate(temporal.applies_to_first_registration_from);
  if (firstReg) {
    return { date: firstReg, field: "applies_to_first_registration_from" };
  }

  const generic = parseIsoDate(temporal.applies_from_generic);
  if (generic) return { date: generic, field: "applies_from_generic" };

  return null;
}

function requiredDocumentsCount(result: EvaluationResult, rule?: Rule): number {
  const list = rule?.required_documents;
  if (list && list.length > 0) return list.length;
  return result.evidence_tasks.length;
}

function toTimelineItem(
  result: EvaluationResult,
  rule: Rule | undefined,
  reason: string,
): RuleTimelineItem {
  return {
    stable_id: result.rule_id,
    title: result.title,
    short_label: result.short_label,
    owner_hint: result.owner_hint,
    reason,
    required_documents_count: requiredDocumentsCount(result, rule),
    lifecycle_state: result.lifecycle_state,
    freshness_status: result.freshness_status ?? rule?.freshness_status,
  };
}

function toReviewItem(rule: Rule, reason: string): RuleTimelineItem {
  return {
    stable_id: rule.stable_id,
    title: rule.title,
    short_label: rule.short_label,
    owner_hint: rule.owner_hint,
    reason,
    required_documents_count: rule.required_documents?.length ?? 0,
    lifecycle_state: rule.lifecycle_state,
    freshness_status: rule.freshness_status,
  };
}

function ensureMilestone(
  map: Map<string, TimelineMilestone>,
  monthKey: string,
): TimelineMilestone {
  const existing = map.get(monthKey);
  if (existing) return existing;
  const milestone: TimelineMilestone = {
    month: monthKey,
    monthLabel: toMonthLabel(monthKey),
    deadline_rules: [],
    evidence_due: [],
    review_due: [],
  };
  map.set(monthKey, milestone);
  return milestone;
}

function isWithinRange(
  monthKey: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return monthKey >= rangeStart && monthKey <= rangeEnd;
}

export function buildTimeline(args: {
  config: VehicleConfig;
  results: EvaluationResult[];
  rules: Rule[];
  now?: Date;
}): TimelineOutput {
  const { config, results, rules } = args;
  const now = args.now ?? new Date();

  const rulesById = new Map<string, Rule>();
  for (const rule of rules) {
    rulesById.set(rule.stable_id, rule);
  }

  const sopDate = parseIsoDate(config.sopDate);
  const firstRegDate = parseIsoDate(config.firstRegistrationDate);

  const sopAnchor = sopDate ?? firstRegDate ?? monthStart(now);
  const firstRegAnchor = firstRegDate ?? sopAnchor;

  const sopMonthStart = monthStart(sopAnchor);
  const firstRegMonthStart = monthStart(firstRegAnchor);
  const todayMonthStart = monthStart(now);

  const rangeStartDate = minDate(todayMonthStart, addMonths(sopMonthStart, -24));
  const rangeEndDate = maxDate(
    addMonths(sopMonthStart, 24),
    addMonths(firstRegMonthStart, 12),
  );

  const rangeStart = toMonthKey(rangeStartDate);
  const rangeEnd = toMonthKey(rangeEndDate);

  const milestones = new Map<string, TimelineMilestone>();
  const unscheduled: RuleTimelineItem[] = [];

  const approvalType = config.approvalType ?? "new_type";

  for (const result of results) {
    if (!SCHEDULABLE_APPLICABILITY.has(result.applicability)) continue;

    const rule = rulesById.get(result.rule_id);
    const deadline = chooseDeadline(result.temporal, approvalType);

    if (!deadline) {
      unscheduled.push(
        toTimelineItem(
          result,
          rule,
          "No temporal date available for this rule.",
        ),
      );
      continue;
    }

    const deadlineMonthKey = toMonthKey(monthStart(deadline.date));
    const deadlineReason = deadline.field;

    if (isWithinRange(deadlineMonthKey, rangeStart, rangeEnd)) {
      ensureMilestone(milestones, deadlineMonthKey).deadline_rules.push(
        toTimelineItem(result, rule, deadlineReason),
      );
    }

    const leadTime =
      result.planning_lead_time_months && result.planning_lead_time_months > 0
        ? result.planning_lead_time_months
        : DEFAULT_EVIDENCE_LEAD_TIME;

    const evidenceDate = addMonths(monthStart(deadline.date), -leadTime);
    const evidenceMonthKey = toMonthKey(evidenceDate);

    if (isWithinRange(evidenceMonthKey, rangeStart, rangeEnd)) {
      const evidenceReason =
        result.planning_lead_time_months && result.planning_lead_time_months > 0
          ? `evidence_lead_time:${leadTime}m`
          : `evidence_lead_time_default:${DEFAULT_EVIDENCE_LEAD_TIME}m`;
      ensureMilestone(milestones, evidenceMonthKey).evidence_due.push(
        toTimelineItem(result, rule, evidenceReason),
      );
    }
  }

  for (const rule of rules) {
    if (rule.lifecycle_state !== "ACTIVE") continue;
    const reviewed = parseIsoDate(rule.last_human_review_at);
    if (!reviewed) continue;

    const cadenceDays =
      rule.review_cadence_days ?? defaultCadenceDays(rule.lifecycle_state);
    const triggerMs = reviewed.valueOf() + cadenceDays * 0.8 * 86_400_000;
    const triggerDate = new Date(triggerMs);
    const triggerMonthKey = toMonthKey(monthStart(triggerDate));

    if (!isWithinRange(triggerMonthKey, rangeStart, rangeEnd)) continue;

    ensureMilestone(milestones, triggerMonthKey).review_due.push(
      toReviewItem(
        rule,
        `review_due_at_80pct:${cadenceDays}d`,
      ),
    );
  }

  const sortedMilestones = Array.from(milestones.values())
    .filter(
      (m) =>
        m.deadline_rules.length > 0 ||
        m.evidence_due.length > 0 ||
        m.review_due.length > 0,
    )
    .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));

  return {
    sop_month: toMonthKey(sopMonthStart),
    first_registration_month: toMonthKey(firstRegMonthStart),
    milestones: sortedMilestones,
    unscheduled,
    range_start: rangeStart,
    range_end: rangeEnd,
  };
}
