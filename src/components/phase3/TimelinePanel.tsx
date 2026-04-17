"use client";

import { useState } from "react";

import type {
  RuleTimelineItem,
  TimelineMilestone,
  TimelineOutput,
} from "@/engine/timeline";

interface TimelinePanelProps {
  timeline: TimelineOutput;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const idx = Number.parseInt(month, 10) - 1;
  const labels = [
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
  ];
  const label = labels[idx] ?? month;
  return `${label} ${year}`;
}

function TimelineItem({ item }: { item: RuleTimelineItem }) {
  const docsCount = item.required_documents_count;
  const docsLabel =
    docsCount > 0 ? `${docsCount} doc${docsCount === 1 ? "" : "s"}` : "TBD";
  return (
    <li
      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
      data-testid="timeline-item"
    >
      <p className="text-sm font-medium text-slate-900">{item.short_label}</p>
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-slate-200">
          {item.owner_hint}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1 ${
            docsCount > 0
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-amber-200"
          }`}
        >
          {docsLabel}
        </span>
      </div>
      <p className="mt-0.5 truncate text-[11px] text-slate-500" title={item.title}>
        {item.title}
      </p>
    </li>
  );
}

function TimelineColumn({
  items,
  headerColor,
  headerLabel,
  testId,
}: {
  items: RuleTimelineItem[];
  headerColor: string;
  headerLabel: string;
  testId: string;
}) {
  return (
    <div className="flex flex-col" data-testid={testId}>
      <div
        className={`mb-1.5 inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-xs font-semibold ${headerColor}`}
      >
        {headerLabel}
        <span className="rounded-full bg-white/70 px-1.5 text-[10px] text-slate-700">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">—</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <TimelineItem
              key={`${testId}-${item.stable_id}`}
              item={item}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MilestoneRow({ milestone }: { milestone: TimelineMilestone }) {
  return (
    <article
      className="grid gap-4 border-b border-slate-100 py-4 last:border-b-0 md:grid-cols-[120px_1fr]"
      data-testid={`timeline-row-${milestone.month}`}
    >
      <div className="md:sticky md:top-0">
        <p className="text-base font-semibold text-slate-900">
          {milestone.monthLabel || formatMonthLabel(milestone.month)}
        </p>
        <p className="text-xs text-slate-500">{milestone.month}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TimelineColumn
          items={milestone.deadline_rules}
          headerLabel="Deadlines"
          headerColor="bg-red-100 text-red-800"
          testId={`timeline-deadlines-${milestone.month}`}
        />
        <TimelineColumn
          items={milestone.evidence_due}
          headerLabel="Evidence due"
          headerColor="bg-amber-100 text-amber-800"
          testId={`timeline-evidence-${milestone.month}`}
        />
        <TimelineColumn
          items={milestone.review_due}
          headerLabel="Review due"
          headerColor="bg-blue-100 text-blue-800"
          testId={`timeline-review-${milestone.month}`}
        />
      </div>
    </article>
  );
}

export function TimelinePanel({ timeline }: TimelinePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const milestones = timeline.milestones;
  const isEmpty =
    milestones.length === 0 && timeline.unscheduled.length === 0;

  return (
    <section className="panel timeline-panel" data-testid="timeline-panel">
      <header
        className="rule-card-toggle coverage-header"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setExpanded((prev) => !prev);
          }
        }}
      >
        <h2>Timeline</h2>
        <div className="badge-row">
          <span className="badge">
            {milestones.length} milestone{milestones.length === 1 ? "" : "s"}
          </span>
          <span className="badge">
            {timeline.unscheduled.length} unscheduled
          </span>
          <span className="badge">{expanded ? "▲" : "▼"}</span>
        </div>
      </header>

      {expanded ? (
        <div className="mt-4 flex flex-col gap-4">
          <div
            className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
            data-testid="timeline-meta"
          >
            <span>
              <span className="font-semibold text-slate-900">SOP:</span>{" "}
              {formatMonthLabel(timeline.sop_month)}
            </span>
            <span>
              <span className="font-semibold text-slate-900">
                First registration:
              </span>{" "}
              {formatMonthLabel(timeline.first_registration_month)}
            </span>
            <span>
              <span className="font-semibold text-slate-900">Range:</span>{" "}
              {timeline.range_start} — {timeline.range_end}
            </span>
          </div>

          {isEmpty ? (
            <p
              className="rounded-lg border border-slate-200 bg-white px-3 py-4 text-sm text-slate-600"
              data-testid="timeline-empty"
            >
              No applicable rules to schedule.
            </p>
          ) : (
            <>
              {milestones.length > 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-4">
                  {milestones.map((milestone) => (
                    <MilestoneRow
                      key={milestone.month}
                      milestone={milestone}
                    />
                  ))}
                </div>
              ) : null}

              {timeline.unscheduled.length > 0 ? (
                <section
                  className="rounded-lg border border-slate-200 bg-white p-4"
                  data-testid="timeline-unscheduled"
                >
                  <h3 className="text-sm font-semibold text-slate-900">
                    Unscheduled (no deadline info)
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    These rules are applicable but have no temporal anchor yet.
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {timeline.unscheduled.map((item) => (
                      <TimelineItem
                        key={`unscheduled-${item.stable_id}`}
                        item={item}
                      />
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
