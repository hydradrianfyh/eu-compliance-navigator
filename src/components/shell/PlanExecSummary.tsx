"use client";

/**
 * PlanExecSummary — Phase K.2 "3-second exec" block on top of Plan.
 *
 * Gives a management-audience viewer the SOP countdown, item counts by
 * status bucket, and the top 3 urgent items inside the next 90 days —
 * all above the fold, in one glance. Engineers scroll past it to the
 * existing timeline + owner dashboard which remain unchanged.
 *
 * Elements:
 *   1. SOP date + "N months away" countdown (or no-SOP fallback)
 *   2. Item counts: critical pre-SOP · on-track · at-risk
 *   3. Top 3 urgent items inside the next 90 days, sorted by soonest
 *      deadline
 *   4. Progressive-disclosure link "See full timeline ↓"
 *
 * All data is derived from the same `TimelineOutput` the timeline
 * column already consumes — no new engine computation.
 *
 * © Yanhao FU
 */

import { useMemo } from "react";
import Link from "next/link";

import type {
  TimelineMilestone,
  TimelineOutput,
  RuleTimelineItem,
} from "@/engine/timeline";
import type { SopGroupedTimeline } from "@/lib/timeline-sop-groups";
import { formatMonthsLabel } from "@/lib/format-months";

interface PlanExecSummaryProps {
  timeline: TimelineOutput;
  groupedTimeline: SopGroupedTimeline;
  sopDate: string | null;
  firstRegistrationDate: string | null;
  today?: Date;
}

interface UrgentPlanItem {
  stable_id: string;
  title: string;
  deadline: string;
  months_remaining: number;
  owner_hint: string;
}

function parseIsoDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function monthStartUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthKeyToDate(key: string): Date {
  return new Date(`${key}-01T00:00:00Z`);
}

function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth())
  );
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Pick deadline-style items landing in the next 90 days (≈ 3 calendar
 * months). Overdue items are intentionally excluded — they belong to
 * the Status-tab blocker list, not the forward-looking Plan exec block.
 * If the next-90-days window has fewer than 3 items, we fall back to
 * the soonest upcoming deadlines beyond 90 days so the block always
 * surfaces at least something actionable (unless the timeline is empty).
 */
function pickUrgentNext90Days(
  timeline: TimelineOutput,
  today: Date,
): UrgentPlanItem[] {
  const nowMonth = monthStartUtc(today);
  const cutoffMonths = 3;
  const seen = new Set<string>();
  const inWindow: UrgentPlanItem[] = [];
  const fallback: UrgentPlanItem[] = [];

  const milestones: TimelineMilestone[] = timeline.milestones;
  for (const m of milestones) {
    const mDate = monthKeyToDate(m.month);
    const delta = monthsBetween(nowMonth, mDate);
    for (const item of m.deadline_rules) {
      if (seen.has(item.stable_id)) continue;
      seen.add(item.stable_id);
      const record: UrgentPlanItem = {
        stable_id: item.stable_id,
        title: item.title,
        deadline: `${m.month}-01`,
        months_remaining: delta,
        owner_hint: item.owner_hint,
      };
      if (delta >= 0 && delta <= cutoffMonths) {
        inWindow.push(record);
      } else if (delta > cutoffMonths) {
        fallback.push(record);
      }
      // delta < 0 (overdue) deliberately ignored for this exec block.
    }
  }

  inWindow.sort((a, b) => a.months_remaining - b.months_remaining);
  if (inWindow.length >= 3) return inWindow;

  fallback.sort((a, b) => a.months_remaining - b.months_remaining);
  return [...inWindow, ...fallback].slice(0, Math.max(3, inWindow.length));
}

/**
 * Compute SOP-anchored counts for the exec block. "critical pre-SOP" is
 * any milestone in the Pre-SOP critical or Pre-SOP final buckets. "at-risk"
 * is anything in the Overdue bucket (deadline already passed).
 * "on-track" is anything still scheduled after today that's not overdue and
 * not yet inside the final pre-SOP window.
 *
 * Each milestone contributes one entry per deadline rule (dedup by id).
 */
interface PlanBucketCounts {
  criticalPreSop: number;
  onTrack: number;
  atRisk: number;
}

function countItemsByBucket(
  grouped: SopGroupedTimeline,
): PlanBucketCounts {
  const seen = new Set<string>();
  let critical = 0;
  let onTrack = 0;
  let atRisk = 0;

  function countRulesOnce(items: RuleTimelineItem[]) {
    let n = 0;
    for (const item of items) {
      if (seen.has(item.stable_id)) continue;
      seen.add(item.stable_id);
      n += 1;
    }
    return n;
  }

  for (const segment of grouped.segments) {
    for (const m of segment.milestones) {
      const count = countRulesOnce(m.deadline_rules);
      switch (segment.id) {
        case "overdue":
          atRisk += count;
          break;
        case "pre_sop_critical":
        case "pre_sop_final":
          critical += count;
          break;
        case "immediate":
        case "post_sop":
        case "later":
          onTrack += count;
          break;
        default:
          break;
      }
    }
  }

  return { criticalPreSop: critical, onTrack, atRisk };
}

interface SopCountdown {
  anchorLabel: string;
  anchorDate: string;
  countdownText: string;
}

function computeCountdown(
  anchor: SopGroupedTimeline["anchor"],
  anchorDateIso: string | null,
  sopDate: string | null,
  firstRegDate: string | null,
  today: Date,
): SopCountdown | null {
  if (anchor === "calendar" || !anchorDateIso) return null;

  const anchorDate =
    parseIsoDate(anchorDateIso) ??
    parseIsoDate(anchor === "sop" ? sopDate : firstRegDate);
  if (!anchorDate) return null;

  const days = daysBetween(today, anchorDate);
  let text: string;
  if (days < 0) {
    const abs = Math.abs(days);
    text = abs < 60 ? `${abs} days past` : `${Math.round(abs / 30)} months past`;
  } else if (days < 60) {
    text = `${days} days away`;
  } else {
    text = `${Math.round(days / 30)} months away`;
  }

  const label = anchor === "sop" ? "SOP" : "First registration";
  return {
    anchorLabel: label,
    anchorDate: anchorDateIso,
    countdownText: text,
  };
}

export function PlanExecSummary({
  timeline,
  groupedTimeline,
  sopDate,
  firstRegistrationDate,
  today,
}: PlanExecSummaryProps) {
  // Stabilise `now` so dependent useMemo hooks don't recompute on every
  // render when `today` is undefined. The fallback `new Date()` is intentional
  // and captured once per component instance.
  const now = useMemo(() => today ?? new Date(), [today]);

  const countdown = useMemo(
    () =>
      computeCountdown(
        groupedTimeline.anchor,
        groupedTimeline.anchorDate,
        sopDate,
        firstRegistrationDate,
        now,
      ),
    [
      groupedTimeline.anchor,
      groupedTimeline.anchorDate,
      sopDate,
      firstRegistrationDate,
      now,
    ],
  );

  const bucketCounts = useMemo(
    () => countItemsByBucket(groupedTimeline),
    [groupedTimeline],
  );

  const urgent = useMemo(
    () => pickUrgentNext90Days(timeline, now),
    [timeline, now],
  );

  const urgentTop3 = urgent.slice(0, 3);

  // Tone: amber if any at-risk, green if none pending soon.
  const tone: "positive" | "caution" | "blocker" =
    bucketCounts.atRisk > 0
      ? "blocker"
      : bucketCounts.criticalPreSop > 0
        ? "caution"
        : "positive";

  return (
    <section
      className={`plan-exec plan-exec-${tone}`}
      role="region"
      aria-label="Plan exec summary"
    >
      <header className="plan-exec-header">
        <span className="plan-exec-badge" aria-hidden="true">
          <span className="plan-exec-badge-icon">◆</span>
          <span className="plan-exec-badge-label">
            {countdown ? `${countdown.anchorLabel}: ${countdown.anchorDate}` : "No SOP set"}
          </span>
        </span>
        <span className="plan-exec-countdown">
          {countdown ? countdown.countdownText : "Add an SOP on Setup to see a countdown."}
        </span>
      </header>

      <p className="plan-exec-numbers">
        <strong>{bucketCounts.criticalPreSop}</strong> critical pre-SOP
        {" · "}
        <strong>{bucketCounts.onTrack}</strong> on-track
        {" · "}
        <strong>{bucketCounts.atRisk}</strong> at-risk
      </p>

      <div className="plan-exec-urgent">
        <span className="plan-exec-urgent-label">
          Most urgent upcoming deadlines:
        </span>
        {urgentTop3.length === 0 ? (
          <p className="plan-exec-urgent-none muted">
            No upcoming deadlines. Everything in the timeline is already past.
          </p>
        ) : (
          <ul className="plan-exec-urgent-list">
            {urgentTop3.map((item) => (
              <li key={item.stable_id}>
                <span className="plan-exec-urgent-marker" aria-hidden="true">
                  ▸
                </span>
                <Link href={`/rules?rule=${encodeURIComponent(item.stable_id)}`}>
                  <strong>{item.stable_id}</strong>
                </Link>{" "}
                <span>{item.title}</span>{" "}
                <span className="plan-exec-urgent-when">
                  (deadline {item.deadline.slice(0, 10)} ·{" "}
                  {formatMonthsLabel(item.months_remaining)})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a
        href="#plan-full-detail"
        className="plan-exec-disclosure"
        aria-label="Jump to full timeline detail"
      >
        See full timeline ↓
      </a>
    </section>
  );
}
