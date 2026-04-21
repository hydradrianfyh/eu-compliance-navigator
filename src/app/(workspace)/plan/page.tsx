"use client";

/**
 * Plan tab — Timeline (SOP-anchored) + Owner Dashboard.
 * Empty owner buckets are hidden. Clicking a rule navigates to
 * /rules?rule=REG-XX with auto-expand.
 *
 * © Yanhao FU
 */

import { useMemo } from "react";
import Link from "next/link";

import { buildEngineConfig } from "@/engine/config-builder";
import { buildOwnerDashboard } from "@/engine/by-owner";
import { evaluateAllRules } from "@/engine/evaluator";
import { buildTimeline } from "@/engine/timeline";
import { RuleRegistry } from "@/registry/registry";
import { rawSeedRules } from "@/registry/seed";
import { materializeRulesFromReviewState } from "@/registry/verification";
import { groupTimelineBySOP } from "@/lib/timeline-sop-groups";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportAsPdfButton } from "@/components/shared/ExportAsPdfButton";
import { PlanExecSummary } from "@/components/shell/PlanExecSummary";
import { useAppShellStore } from "@/state/app-shell-store";

export default function PlanPage() {
  const config = useAppShellStore((state) => state.config);
  const verificationReviewState = useAppShellStore(
    (state) => state.verificationReviewState,
  );

  const { timeline, groupedTimeline, ownerDashboard } = useMemo(() => {
    const effectiveRules = materializeRulesFromReviewState(
      rawSeedRules,
      verificationReviewState,
    );
    const registry = new RuleRegistry(effectiveRules);
    const evaluated = evaluateAllRules(
      registry.getEvaluableRules(),
      buildEngineConfig(config),
    );
    const rawTimeline = buildTimeline({
      config,
      results: evaluated,
      rules: effectiveRules,
    });
    const owner = buildOwnerDashboard({
      results: evaluated,
      rules: effectiveRules,
    });
    return {
      timeline: rawTimeline,
      groupedTimeline: groupTimelineBySOP(
        rawTimeline,
        config.sopDate,
        config.firstRegistrationDate,
      ),
      ownerDashboard: owner,
    };
  }, [config, verificationReviewState]);

  const nonEmptyOwnerBuckets = ownerDashboard.buckets.filter(
    (b) => b.items.length > 0,
  );

  return (
    <div className="plan-tab">
      <header className="plan-tab-header">
        <div>
          <h2>Plan</h2>
          <p className="muted">
            Timeline anchored on{" "}
          {groupedTimeline.anchor === "sop"
            ? `SOP (${groupedTimeline.anchorDate})`
            : groupedTimeline.anchor === "first_registration"
              ? `first registration (${groupedTimeline.anchorDate})`
              : "today (no SOP set)"}
          . Owners on the right.
          </p>
        </div>
        <div className="tab-actions">
          <ExportAsPdfButton tabClass="plan-tab" />
        </div>
      </header>

      <PlanExecSummary
        timeline={timeline}
        groupedTimeline={groupedTimeline}
        sopDate={config.sopDate}
        firstRegistrationDate={config.firstRegistrationDate}
      />

      <div id="plan-full-detail" className="plan-columns">
        <section className="plan-column plan-column-timeline">
          {groupedTimeline.segments.map((segment) => (
            <details
              key={segment.id}
              className="plan-segment"
              open={segment.defaultExpanded}
            >
              <summary>
                <span className="plan-segment-label">{segment.label}</span>
                <span className="plan-segment-hint">{segment.hint}</span>
                <span className="plan-segment-count">
                  {segment.milestones.length === 0
                    ? "empty"
                    : `${segment.milestones.length} month${segment.milestones.length === 1 ? "" : "s"}`}
                </span>
              </summary>
              {segment.milestones.length === 0 ? (
                <p className="plan-segment-empty muted">No deadlines in this window.</p>
              ) : (
                <ul className="plan-milestone-list">
                  {segment.milestones.map((m) => (
                    <li key={m.month}>
                      <div className="plan-milestone-month">{m.monthLabel}</div>
                      <ul>
                        {[...m.deadline_rules, ...m.evidence_due, ...m.review_due].map((r) => (
                          <li key={r.stable_id}>
                            <Link
                              href={`/rules?rule=${encodeURIComponent(r.stable_id)}`}
                            >
                              <strong>{r.stable_id}</strong>
                            </Link>{" "}
                            <span>{r.title}</span>
                            <span className="plan-milestone-owner">
                              · {r.owner_hint}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}
          {groupedTimeline.unscheduled.milestones.length > 0 ? (
            <details className="plan-segment">
              <summary>
                <span className="plan-segment-label">Unscheduled</span>
                <span className="plan-segment-hint">
                  No specific deadline
                </span>
                <span className="plan-segment-count">
                  {groupedTimeline.unscheduled.milestones
                    .reduce((sum, m) => sum + m.review_due.length, 0)}{" "}
                  rules
                </span>
              </summary>
              <ul className="plan-milestone-list">
                {groupedTimeline.unscheduled.milestones[0]?.review_due.map((r) => (
                  <li key={r.stable_id}>
                    <Link
                      href={`/rules?rule=${encodeURIComponent(r.stable_id)}`}
                    >
                      <strong>{r.stable_id}</strong>
                    </Link>{" "}
                    <span>{r.title}</span>
                    <span className="plan-milestone-owner">· {r.owner_hint}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>

        <aside className="plan-column plan-column-owners panel">
          <h3>Owner Dashboard</h3>
          {nonEmptyOwnerBuckets.length === 0 ? (
            <EmptyState
              icon="⚑"
              title="No owner tasks yet"
              description="Once rules become Applicable for the current configuration, they will be grouped here by owning team."
              action={<Link href="/setup">Complete Setup</Link>}
              tone="neutral"
            />
          ) : (
            <div className="plan-owner-list">
              {nonEmptyOwnerBuckets.map((bucket) => (
                <section key={bucket.owner_hint} className="plan-owner-bucket">
                  <header>
                    <strong>{bucket.owner_label}</strong>
                    <span className="plan-owner-count">
                      {bucket.items.length} tasks
                    </span>
                  </header>
                  <ul>
                    {bucket.items.slice(0, 5).map((item) => (
                      <li key={item.stable_id}>
                        <Link
                          href={`/rules?rule=${encodeURIComponent(item.stable_id)}`}
                        >
                          {item.stable_id}
                        </Link>{" "}
                        <span className="muted">{item.short_label}</span>
                      </li>
                    ))}
                    {bucket.items.length > 5 ? (
                      <li className="muted">
                        +{bucket.items.length - 5} more (see Rules tab)
                      </li>
                    ) : null}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
