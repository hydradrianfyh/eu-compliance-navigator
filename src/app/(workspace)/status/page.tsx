"use client";

/**
 * Status tab — market-entry readiness (UX Refactor v2 spec §5).
 *
 * Hero card with `canEnterMarket`, confidence, and four coverage metrics.
 * Three-column body: Top blockers / Top deadlines / Countries at risk.
 *
 * © Yanhao FU
 */

import { useMemo } from "react";
import Link from "next/link";

import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { buildExecutiveSummary } from "@/engine/executive-summary";
import { buildTimeline } from "@/engine/timeline";
import { RuleRegistry } from "@/registry/registry";
import { rawSeedRules } from "@/registry/seed";
import { materializeRulesFromReviewState } from "@/registry/verification";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportAsPdfButton } from "@/components/shared/ExportAsPdfButton";
import { breakdownMonths, formatMonthsLabel } from "@/lib/format-months";
import { useAppShellStore } from "@/state/app-shell-store";

function confidenceLabel(c: "high" | "medium" | "low"): string {
  return { high: "High", medium: "Medium", low: "Low" }[c];
}

function marketVerdict(canEnter: boolean, confidence: "high" | "medium" | "low") {
  if (canEnter && confidence === "high") return "LIKELY OK";
  if (canEnter) return "OK WITH CAVEATS";
  if (confidence === "high") return "AT RISK";
  return "INDETERMINATE";
}

export default function StatusPage() {
  const config = useAppShellStore((state) => state.config);
  const verificationReviewState = useAppShellStore(
    (state) => state.verificationReviewState,
  );

  const { summary, hasRules } = useMemo(() => {
    const effectiveRules = materializeRulesFromReviewState(
      rawSeedRules,
      verificationReviewState,
    );
    const registry = new RuleRegistry(effectiveRules);
    const evaluated = evaluateAllRules(
      registry.getEvaluableRules(),
      buildEngineConfig(config),
    );
    const timeline = buildTimeline({
      config,
      results: evaluated,
      rules: effectiveRules,
    });
    const execSummary = buildExecutiveSummary({
      config,
      results: evaluated,
      rules: effectiveRules,
      timeline,
    });
    return { summary: execSummary, hasRules: evaluated.length > 0 };
  }, [config, verificationReviewState]);

  if (!hasRules) {
    return (
      <section className="status-tab status-tab-empty">
        <EmptyState
          icon="◎"
          title="Nothing to assess yet"
          description="The engine has no evaluable rules for the current project. Finish the Setup tab so Status can compute market-entry readiness."
          action={<Link href="/setup">Go to Setup</Link>}
          secondaryAction={
            <Link href="/coverage">Review coverage →</Link>
          }
        />
      </section>
    );
  }

  const verdict = marketVerdict(summary.canEnterMarket, summary.confidence);
  const verdictClass = summary.canEnterMarket
    ? "status-hero-positive"
    : "status-hero-caution";

  return (
    <div className="status-tab">
      <div className="tab-actions tab-actions-floating">
        <ExportAsPdfButton tabClass="status-tab" />
      </div>
      <section className={`status-hero panel ${verdictClass}`}>
        <header className="status-hero-header">
          <span className="status-hero-eyebrow">Market entry status</span>
          <h1 className="status-hero-verdict">{verdict}</h1>
          <p className="status-hero-confidence">
            Confidence: <strong>{confidenceLabel(summary.confidence)}</strong>
          </p>
        </header>
        <dl className="status-hero-metrics">
          <div>
            <dt>Coverage score</dt>
            <dd>{summary.coverageScore} / 100</dd>
            <p className="status-metric-note">project-scoped</p>
          </div>
          <div>
            <dt>Verified applicable</dt>
            <dd>{summary.verified_count}</dd>
            <p className="status-metric-note">
              of {summary.registry_totals.active} ACTIVE in registry
            </p>
          </div>
          <div>
            <dt>Indicative applicable</dt>
            <dd>{summary.indicative_count}</dd>
            <p className="status-metric-note">
              of {summary.registry_totals.seed_unverified} SEED_UNVERIFIED in registry
            </p>
          </div>
          <div>
            <dt>Pending authoring (in scope)</dt>
            <dd>{summary.pending_authoring}</dd>
            <p className="status-metric-note">
              of {summary.registry_totals.placeholder} PLACEHOLDER in registry
            </p>
          </div>
        </dl>
        <p className="status-hero-generated">
          Generated {summary.generated_at}
        </p>
      </section>

      <div className="status-columns">
        <section className="status-column panel">
          <h3>Top blockers</h3>
          {summary.topBlockers.length === 0 ? (
            <p className="muted">No blockers detected — good to proceed.</p>
          ) : (
            <ul className="status-column-list">
              {summary.topBlockers.map((b) => (
                <li key={b.stable_id}>
                  <Link href={`/rules?rule=${encodeURIComponent(b.stable_id)}`}>
                    <strong>{b.stable_id}</strong>
                  </Link>
                  <span className={`status-severity status-severity-${b.severity}`}>
                    {b.severity}
                  </span>
                  <p className="status-column-item-title">{b.title}</p>
                  <p className="status-column-item-reason">{b.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="status-column panel">
          <h3>Top deadlines</h3>
          {summary.topDeadlines.length === 0 ? (
            <p className="muted">No upcoming deadlines.</p>
          ) : (
            <ul className="status-column-list">
              {summary.topDeadlines.map((d) => {
                const breakdown = breakdownMonths(d.months_remaining);
                return (
                  <li key={d.stable_id} className={`status-deadline-row status-deadline-${breakdown.status}`}>
                    <Link href={`/rules?rule=${encodeURIComponent(d.stable_id)}`}>
                      <strong>{d.stable_id}</strong>
                    </Link>
                    <span className="status-deadline">
                      {d.deadline} · {formatMonthsLabel(d.months_remaining)}
                    </span>
                    <p className="status-column-item-title">{d.title}</p>
                    <p className="status-column-item-owner">owner: {d.owner_hint}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="status-column panel">
          <h3>Countries at risk</h3>
          {summary.countriesAtRiskDetail.length === 0 ? (
            <p className="muted">All targeted markets covered.</p>
          ) : (
            <ul className="status-country-list">
              {summary.countriesAtRiskDetail.map((c) => {
                const reasonLabel =
                  c.reason === "pending_overlay"
                    ? "pending overlay — all rules placeholder (Phase 13+)"
                    : c.reason === "no_overlay"
                      ? "no overlay rules in registry yet"
                      : `low coverage — ${c.unknown_count} of ${c.total_overlay_rules} rules UNKNOWN`;
                return (
                  <li key={c.country} className={`status-country-${c.reason}`}>
                    <strong>{c.country}</strong>{" "}
                    <span className="muted">{reasonLabel}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
