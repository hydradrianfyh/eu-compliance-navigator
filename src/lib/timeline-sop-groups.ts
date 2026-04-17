/**
 * SOP-anchored timeline grouping (UX Refactor v2 spec §6.1).
 *
 * Buckets the month-granular Timeline output into six semantic segments
 * anchored on SOP:
 *   - Immediate            today → today + 3 months
 *   - Pre-SOP critical      SOP - 12 mo → SOP - 3 mo
 *   - Pre-SOP final         SOP - 3 mo → SOP
 *   - Post-SOP              SOP → SOP + 12 mo
 *   - Later                 > SOP + 12 mo
 *   - Unscheduled           no date
 *
 * If the SOP date is null, falls back to firstRegistrationDate.
 * If both are null, returns a calendar-style grouping so Plan tab still
 * renders something.
 *
 * © Yanhao FU
 */

import type { TimelineMilestone, TimelineOutput } from "@/engine/timeline";

export type SopSegmentId =
  | "immediate"
  | "pre_sop_critical"
  | "pre_sop_final"
  | "post_sop"
  | "later"
  | "unscheduled";

export interface SopSegment {
  id: SopSegmentId;
  label: string;
  hint: string;
  milestones: TimelineMilestone[];
  defaultExpanded: boolean;
}

export interface SopGroupedTimeline {
  anchor: "sop" | "first_registration" | "calendar";
  anchorDate: string | null;
  segments: SopSegment[];
  unscheduled: SopSegment; // always present even if empty
}

function parseMonth(monthIso: string): Date | null {
  // monthIso is "YYYY-MM" per engine/timeline.ts.
  if (!/^\d{4}-\d{2}$/.test(monthIso)) return null;
  const [year, month] = monthIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

function parseDate(date: string | null): Date | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      date.getUTCDate(),
    ),
  );
}

function monthsBetween(from: Date, to: Date): number {
  const yearDiff = to.getUTCFullYear() - from.getUTCFullYear();
  const monthDiff = to.getUTCMonth() - from.getUTCMonth();
  return yearDiff * 12 + monthDiff;
}

interface AnchorResult {
  anchor: "sop" | "first_registration" | "calendar";
  sopDate: Date | null;
  today: Date;
}

function resolveAnchor(
  sopDate: string | null,
  firstRegistrationDate: string | null,
  today: Date = new Date(),
): AnchorResult {
  const parsedSop = parseDate(sopDate);
  if (parsedSop) return { anchor: "sop", sopDate: parsedSop, today };

  const parsedFirstReg = parseDate(firstRegistrationDate);
  if (parsedFirstReg)
    return { anchor: "first_registration", sopDate: parsedFirstReg, today };

  return { anchor: "calendar", sopDate: null, today };
}

function classifyMilestone(
  milestone: TimelineMilestone,
  anchor: AnchorResult,
): SopSegmentId {
  const milestoneDate = parseMonth(milestone.month);
  if (!milestoneDate) return "unscheduled";

  if (!anchor.sopDate) {
    // Calendar fallback: Immediate = today + 3 mo; rest = Later.
    const diff = monthsBetween(anchor.today, milestoneDate);
    return diff <= 3 ? "immediate" : "later";
  }

  // Immediate always wins (even when SOP is years away) so urgent items
  // are never hidden in a later bucket.
  if (monthsBetween(anchor.today, milestoneDate) <= 3) return "immediate";

  const monthsFromSop = monthsBetween(anchor.sopDate, milestoneDate);
  if (monthsFromSop <= -12) return "later"; // very pre-SOP (> 12 mo before) -> Later
  if (monthsFromSop <= -3) return "pre_sop_critical";
  if (monthsFromSop < 0) return "pre_sop_final";
  if (monthsFromSop <= 12) return "post_sop";
  return "later";
}

const SEGMENT_META: Record<
  SopSegmentId,
  { label: string; hint: string; defaultExpanded: boolean }
> = {
  immediate: {
    label: "Immediate",
    hint: "Due in the next 3 months",
    defaultExpanded: true,
  },
  pre_sop_critical: {
    label: "Pre-SOP critical",
    hint: "SOP − 12 to SOP − 3 months",
    defaultExpanded: true,
  },
  pre_sop_final: {
    label: "Pre-SOP final",
    hint: "SOP − 3 months to SOP",
    defaultExpanded: true,
  },
  post_sop: {
    label: "Post-SOP",
    hint: "SOP to SOP + 12 months",
    defaultExpanded: false,
  },
  later: {
    label: "Later",
    hint: "Beyond SOP + 12 months or far future",
    defaultExpanded: false,
  },
  unscheduled: {
    label: "Unscheduled",
    hint: "No specific deadline — background tasks",
    defaultExpanded: false,
  },
};

const SEGMENT_ORDER: SopSegmentId[] = [
  "immediate",
  "pre_sop_critical",
  "pre_sop_final",
  "post_sop",
  "later",
];

export function groupTimelineBySOP(
  timeline: TimelineOutput,
  sopDate: string | null,
  firstRegistrationDate: string | null,
  today: Date = new Date(),
): SopGroupedTimeline {
  const anchor = resolveAnchor(sopDate, firstRegistrationDate, today);

  // Empty buckets first so ordering is deterministic.
  const buckets: Record<SopSegmentId, TimelineMilestone[]> = {
    immediate: [],
    pre_sop_critical: [],
    pre_sop_final: [],
    post_sop: [],
    later: [],
    unscheduled: [],
  };

  for (const milestone of timeline.milestones) {
    const id = classifyMilestone(milestone, anchor);
    buckets[id].push(milestone);
  }

  // Milestones from the engine's "unscheduled" list flow through.
  const unscheduledMilestone: TimelineMilestone = {
    month: "",
    monthLabel: "Unscheduled",
    deadline_rules: [],
    evidence_due: [],
    review_due: timeline.unscheduled,
  };
  if (timeline.unscheduled.length > 0) {
    buckets.unscheduled.push(unscheduledMilestone);
  }

  const segments: SopSegment[] = SEGMENT_ORDER.map((id) => ({
    id,
    label: SEGMENT_META[id].label,
    hint: SEGMENT_META[id].hint,
    defaultExpanded: SEGMENT_META[id].defaultExpanded,
    milestones: buckets[id],
  }));

  return {
    anchor: anchor.anchor,
    anchorDate: anchor.sopDate ? anchor.sopDate.toISOString().slice(0, 10) : null,
    segments,
    unscheduled: {
      id: "unscheduled",
      label: SEGMENT_META.unscheduled.label,
      hint: SEGMENT_META.unscheduled.hint,
      defaultExpanded: SEGMENT_META.unscheduled.defaultExpanded,
      milestones: buckets.unscheduled,
    },
  };
}
