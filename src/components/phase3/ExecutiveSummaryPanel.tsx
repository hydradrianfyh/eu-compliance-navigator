"use client";

import { useState } from "react";

import type { ExecutiveSummary } from "@/engine/executive-summary";
import { formatMonthsLabel } from "@/lib/format-months";

interface ExecutiveSummaryPanelProps {
  summary: ExecutiveSummary;
}

type SeverityKey = "high" | "medium" | "low";
type ConfidenceKey = "high" | "medium" | "low";

const CONFIDENCE_BADGE: Record<ConfidenceKey, string> = {
  high: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
  medium: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  low: "bg-red-100 text-red-800 ring-1 ring-red-300",
};

const SEVERITY_BADGE: Record<SeverityKey, string> = {
  high: "bg-red-100 text-red-800 ring-1 ring-red-300",
  medium: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  low: "bg-slate-200 text-slate-700 ring-1 ring-slate-300",
};

const FRESHNESS_ROWS: ReadonlyArray<{
  key: keyof ExecutiveSummary["freshnessOverview"];
  label: string;
  color: string;
}> = [
  { key: "fresh", label: "Fresh", color: "#059669" },
  { key: "due_soon", label: "Review due soon", color: "#d97706" },
  { key: "overdue", label: "Overdue", color: "#ea580c" },
  { key: "critically_overdue", label: "Critical", color: "#dc2626" },
  { key: "never_verified", label: "Never verified", color: "#64748b" },
];

function formatGeneratedAt(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.valueOf())) return iso;
    return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  } catch {
    return iso;
  }
}

export function ExecutiveSummaryPanel({ summary }: ExecutiveSummaryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const canEnter = summary.canEnterMarket;
  const canEnterClasses = canEnter
    ? "text-emerald-600"
    : "text-red-600";

  const freshnessMax = Math.max(
    1,
    ...FRESHNESS_ROWS.map((row) => summary.freshnessOverview[row.key]),
  );

  return (
    <section
      className="panel executive-summary-panel"
      data-testid="executive-summary-panel"
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
        <h2>Executive Summary</h2>
        <div className="badge-row">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              canEnter
                ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                : "bg-red-100 text-red-800 ring-1 ring-red-300"
            }`}
            data-testid="can-enter-market-chip"
          >
            canEnterMarket: {canEnter ? "YES" : "NO"}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              CONFIDENCE_BADGE[summary.confidence]
            }`}
          >
            Confidence: {summary.confidence}
          </span>
          <span className="badge">{expanded ? "▲" : "▼"}</span>
        </div>
      </header>

      {expanded ? (
        <div className="mt-4 flex flex-col gap-6">
          <section
            className="rounded-xl border border-slate-200 bg-white p-5"
            data-testid="executive-summary-status"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Market entry
                </p>
                <p
                  className={`mt-1 text-3xl font-bold ${canEnterClasses}`}
                  data-testid="can-enter-market-large"
                >
                  canEnterMarket: {canEnter ? "YES" : "NO"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Confidence
                </p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                    CONFIDENCE_BADGE[summary.confidence]
                  }`}
                >
                  {summary.confidence}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Generated at {formatGeneratedAt(summary.generated_at)}
            </p>
          </section>

          <section
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            data-testid="executive-summary-metrics"
          >
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Coverage score
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {summary.coverageScore}
                <span className="ml-1 text-sm font-normal text-slate-500">
                  /100
                </span>
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${summary.coverageScore}%` }}
                  aria-hidden
                />
              </div>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Verified
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">
                {summary.verified_count}
              </p>
              <p className="text-xs text-slate-500">ACTIVE · APPLICABLE</p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Indicative
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">
                {summary.indicative_count}
              </p>
              <p className="text-xs text-slate-500">
                SEED_UNVERIFIED · APPLICABLE/CONDITIONAL
              </p>
            </article>
            <article className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending authoring
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-700">
                {summary.pending_authoring}
              </p>
              <p className="text-xs text-slate-500">PLACEHOLDER rules in scope</p>
            </article>
          </section>

          <section data-testid="executive-summary-freshness">
            <h3 className="text-sm font-semibold text-slate-900">
              Freshness overview
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Based on {summary.freshnessOverview.total} ACTIVE rules.
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {FRESHNESS_ROWS.map((row) => {
                const count = summary.freshnessOverview[row.key];
                const widthPct = Math.round((count / freshnessMax) * 100);
                return (
                  <div
                    key={row.key}
                    className="grid items-center gap-3"
                    style={{ gridTemplateColumns: "160px 48px 1fr" }}
                  >
                    <span className="text-sm text-slate-700">{row.label}</span>
                    <strong className="text-sm text-slate-900">{count}</strong>
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        height: 8,
                        width: `${widthPct}%`,
                        minWidth: count > 0 ? 4 : 0,
                        background: row.color,
                        borderRadius: 9999,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section data-testid="executive-summary-blockers">
            <h3 className="text-sm font-semibold text-slate-900">
              Top {Math.min(5, summary.topBlockers.length)} blockers
            </h3>
            {summary.topBlockers.length === 0 ? (
              <p
                className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                data-testid="no-blockers"
              >
                No immediate blockers.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {summary.topBlockers.map((blocker) => (
                  <li
                    key={blocker.stable_id}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          SEVERITY_BADGE[blocker.severity]
                        }`}
                      >
                        {blocker.severity}
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        {blocker.title}
                      </span>
                      <span className="text-xs text-slate-500">
                        {blocker.stable_id} · {blocker.short_label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      {blocker.reason}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Owner: {blocker.owner_hint}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-testid="executive-summary-deadlines">
            <h3 className="text-sm font-semibold text-slate-900">
              Top {Math.min(10, summary.topDeadlines.length)} deadlines
            </h3>
            {summary.topDeadlines.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                No scheduled deadlines.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                {summary.topDeadlines.map((item) => (
                  <li
                    key={item.stable_id}
                    className="flex flex-wrap items-center justify-between gap-3 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.stable_id} · Owner: {item.owner_hint}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.deadline}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatMonthsLabel(item.months_remaining)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section data-testid="executive-summary-countries">
            <h3 className="text-sm font-semibold text-slate-900">
              Countries at risk
            </h3>
            {summary.countriesAtRisk.length === 0 ? (
              <p
                className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                data-testid="no-countries-at-risk"
              >
                All target countries covered.
              </p>
            ) : (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex flex-wrap gap-2">
                  {summary.countriesAtRisk.map((cc) => (
                    <span
                      key={cc}
                      className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-300"
                    >
                      {cc}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-amber-800">
                  Rules for these countries are mostly UNKNOWN. Verify member-state
                  overlays before proceeding.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}
