"use client";

import { useState } from "react";

import { FreshnessBadge } from "@/components/phase3/FreshnessBadge";
import type {
  OwnerBucket,
  OwnerDashboard,
  OwnerTaskItem,
} from "@/engine/by-owner";

interface OwnerDashboardPanelProps {
  dashboard: OwnerDashboard;
}

const DEFAULT_EXPANDED_BUCKETS = 3;

function leadTimeLabel(months: number | null): string {
  if (months === null || months <= 0) return "Lead time: TBD";
  return `Lead time: ${months} month${months === 1 ? "" : "s"}`;
}

function OwnerTaskItemRow({ item }: { item: OwnerTaskItem }) {
  return (
    <li
      className="flex flex-col gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2"
      data-testid={`owner-item-${item.stable_id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
          {item.short_label}
        </span>
        <span
          className="text-sm font-medium text-slate-900"
          title={item.title}
        >
          {item.title}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
          {item.lifecycle_state}
        </span>
        <FreshnessBadge status={item.freshness_status} />
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
          {item.required_documents_count} doc
          {item.required_documents_count === 1 ? "" : "s"}
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
          {item.required_evidence_count} evidence
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200">
          {leadTimeLabel(item.planning_lead_time_months)}
        </span>
        {item.third_party_verification_required ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-300">
            3rd-party
          </span>
        ) : null}
        {item.recurring_post_market_obligation ? (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-800 ring-1 ring-indigo-200">
            Recurring
          </span>
        ) : null}
      </div>
      {item.submission_timing ? (
        <p className="text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Submission:</span>{" "}
          {item.submission_timing}
        </p>
      ) : null}
    </li>
  );
}

function OwnerBucketCard({
  bucket,
  defaultExpanded,
}: {
  bucket: OwnerBucket;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const toggle = () => setExpanded((prev) => !prev);

  return (
    <article
      className="rounded-lg border border-slate-200 bg-white"
      data-testid={`owner-bucket-${bucket.owner_hint}`}
    >
      <header
        className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3"
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">
            {bucket.owner_label}
          </h3>
          <p className="text-xs text-slate-500">
            {bucket.items.length} task{bucket.items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-300">
            Applicable {bucket.applicable_count}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-300">
            Conditional {bucket.conditional_count}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-300">
            Unknown {bucket.unknown_count}
          </span>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-red-300">
            Blocked {bucket.blocked_count}
          </span>
          <span className="text-xs text-slate-500">{expanded ? "▲" : "▼"}</span>
        </div>
      </header>
      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          {bucket.items.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bucket.items.map((item) => (
                <OwnerTaskItemRow
                  key={`${bucket.owner_hint}-${item.stable_id}`}
                  item={item}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function OwnerDashboardPanel({ dashboard }: OwnerDashboardPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const isEmpty = dashboard.buckets.length === 0;

  return (
    <section
      className="panel owner-dashboard-panel"
      data-testid="owner-dashboard-panel"
    >
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
        <h2>
          Owner Dashboard ({dashboard.total_owners} team
          {dashboard.total_owners === 1 ? "" : "s"}, {dashboard.total_applicable}{" "}
          applicable task{dashboard.total_applicable === 1 ? "" : "s"})
        </h2>
        <div className="badge-row">
          <span className="badge">{dashboard.total_owners} owners</span>
          <span className="badge">{expanded ? "▲" : "▼"}</span>
        </div>
      </header>

      {expanded ? (
        <div className="mt-4 flex flex-col gap-3">
          {isEmpty ? (
            <p
              className="rounded-lg border border-slate-200 bg-white px-3 py-4 text-sm text-slate-600"
              data-testid="owner-dashboard-empty"
            >
              No tasks.
            </p>
          ) : (
            dashboard.buckets.map((bucket, index) => (
              <OwnerBucketCard
                key={bucket.owner_hint}
                bucket={bucket}
                defaultExpanded={index < DEFAULT_EXPANDED_BUCKETS}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
