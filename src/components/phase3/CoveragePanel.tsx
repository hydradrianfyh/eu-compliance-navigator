"use client";

import { useMemo, useState } from "react";

import type { PromotionLog, VerificationReviewEntry } from "@/config/schema";
import type { CoverageMatrix } from "@/registry/coverage-matrix";
import { summarizeFreshness } from "@/registry/freshness";
import type { FreshnessStatus } from "@/registry/schema";
import { allSeedRules } from "@/registry/seed";
import type { RulePromotabilityAssessment } from "@/registry/verification";
import { processStages } from "@/shared/constants";
import {
  VerificationQueuePanel,
  type PendingRuleGroup,
} from "@/components/phase3/VerificationQueuePanel";

interface CoveragePanelProps {
  matrix: CoverageMatrix;
  verificationQueueItems: Array<{
    stableId: string;
    title: string;
    reviewEntry: VerificationReviewEntry;
    assessment: RulePromotabilityAssessment;
  }>;
  verificationCounts: Record<
    "blocked" | "partially_verified" | "promotable" | "promoted",
    number
  >;
  promotionLog: PromotionLog;
  onVerificationReviewChange: (
    stableId: string,
    patch: Partial<VerificationReviewEntry>,
  ) => void;
  /**
   * Phase J.5: when provided, the coverage panel renders an expanded
   * verification view that shows every SEED_UNVERIFIED / DRAFT /
   * PLACEHOLDER rule grouped by jurisdiction + legal family, instead of
   * the hardcoded 10-rule priority queue. Backward-compatible: when
   * undefined, the legacy priority-queue view is used.
   */
  allPendingGroups?: PendingRuleGroup[];
}

type GapCause = "no_rules" | "placeholder_only" | "source_unverified" | "all";

export function CoveragePanel({
  matrix,
  verificationQueueItems,
  verificationCounts,
  promotionLog,
  onVerificationReviewChange,
  allPendingGroups,
}: CoveragePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [gapCauseFilter, setGapCauseFilter] = useState<GapCause>("all");

  const freshnessSummary = useMemo(() => summarizeFreshness(allSeedRules), []);
  const freshnessRows: Array<{ key: FreshnessStatus; label: string; color: string }> = [
    { key: "fresh", label: "Fresh", color: "#059669" },
    { key: "due_soon", label: "Review due soon", color: "#d97706" },
    { key: "overdue", label: "Overdue", color: "#ea580c" },
    { key: "critically_overdue", label: "Critical", color: "#dc2626" },
    { key: "never_verified", label: "Never verified", color: "#64748b" },
  ];
  const freshnessMax = Math.max(
    1,
    ...freshnessRows.map((r) => freshnessSummary[r.key]),
  );

  const filteredDomains = useMemo(() => {
    return matrix.byDomain.filter((dc) => {
      if (stageFilter !== "all") {
        const stageCount =
          dc.byProcessStage[stageFilter as keyof typeof dc.byProcessStage];
        if (!stageCount || stageCount === 0) return false;
      }
      if (gapCauseFilter === "no_rules") return dc.ruleCount === 0;
      if (gapCauseFilter === "placeholder_only") return dc.isPlaceholderOnly;
      if (gapCauseFilter === "source_unverified")
        return dc.hasSubstantiveRules && !dc.isPlaceholderOnly;
      return true;
    });
  }, [matrix.byDomain, stageFilter, gapCauseFilter]);

  const euGaps = matrix.gaps.filter(
    (g) => !g.area.startsWith("member_state") && !g.area.includes("jurisdiction"),
  );
  const memberStateGaps = matrix.gaps.filter(
    (g) => g.area.startsWith("member_state") || g.area.includes("MEMBER_STATE"),
  );

  return (
    <section className="panel coverage-panel">
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
        <h2>Coverage Contract</h2>
        <div className="badge-row">
          <span className="badge">{matrix.totalRules} rules</span>
          <span className="badge">{matrix.evaluableRules} evaluable</span>
          <span className="badge">{matrix.byLifecycle.ACTIVE ?? 0} ACTIVE</span>
          <span className="badge">{matrix.gaps.length} gaps</span>
          <span className="badge">{expanded ? "▲" : "▼"}</span>
        </div>
      </header>

      {expanded ? (
        <div className="coverage-body">
          <section className="coverage-section">
            <h3>Lifecycle Distribution</h3>
            <div className="summary-grid">
              {Object.entries(matrix.byLifecycle).map(([state, count]) => (
                <article key={state} className="metric-card">
                  <span>{state}</span>
                  <strong>{count}</strong>
                </article>
              ))}
              <article className="metric-card">
                <span>Classified</span>
                <strong>{matrix.classifiedCount}</strong>
              </article>
              <article className="metric-card">
                <span>Unclassified</span>
                <strong>{matrix.unclassifiedCount}</strong>
              </article>
            </div>
          </section>

          <section className="coverage-section" data-testid="freshness-distribution">
            <h3>Freshness Distribution</h3>
            <p className="muted">
              Based on {freshnessSummary.total} seed rules, per last_human_review_at and review cadence.
            </p>
            <div className="freshness-distribution">
              {freshnessRows.map((row) => {
                const count = freshnessSummary[row.key];
                const widthPct = Math.round((count / freshnessMax) * 100);
                return (
                  <div
                    key={row.key}
                    className="freshness-row"
                    data-testid={`freshness-row-${row.key}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "160px 48px 1fr",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span>{row.label}</span>
                    <strong>{count}</strong>
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        height: "8px",
                        width: `${widthPct}%`,
                        minWidth: count > 0 ? "4px" : 0,
                        background: row.color,
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="coverage-section">
            <h3>Domain Coverage Query</h3>
            <div className="filter-bar">
              <label>
                <span>Process stage</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="all">All stages</option>
                  {processStages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Gap cause</span>
                <select
                  value={gapCauseFilter}
                  onChange={(e) => setGapCauseFilter(e.target.value as GapCause)}
                >
                  <option value="all">Show all</option>
                  <option value="no_rules">No rules (empty)</option>
                  <option value="placeholder_only">Placeholder only</option>
                  <option value="source_unverified">Has content (unverified)</option>
                </select>
              </label>
            </div>
            <div className="coverage-table-wrapper">
              <table className="coverage-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>Rules</th>
                    <th>pre_ta</th>
                    <th>type_approval</th>
                    <th>sop</th>
                    <th>post_market</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDomains.map((dc) => (
                    <tr key={dc.domain}>
                      <td>{dc.domain.replace(/_/g, " ")}</td>
                      <td>{dc.ruleCount}</td>
                      <td>{dc.byProcessStage.pre_ta || "—"}</td>
                      <td>{dc.byProcessStage.type_approval || "—"}</td>
                      <td>{dc.byProcessStage.sop || "—"}</td>
                      <td>{dc.byProcessStage.post_market || "—"}</td>
                      <td>
                        {dc.ruleCount === 0 ? (
                          <span className="badge badge-gap">Empty</span>
                        ) : dc.isPlaceholderOnly ? (
                          <span className="badge badge-warning">Placeholder</span>
                        ) : (
                          <span className="badge badge-ok">Content</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredDomains.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="muted">
                        No domains match current filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="coverage-section">
            <h3>Member State Overlays</h3>
            <div className="checkbox-grid">
              {matrix.memberStateCoverage.map((ms) => (
                <span key={ms.countryCode} className="ms-chip">
                  <span
                    className={`ms-dot ${
                      ms.ruleCount > 0
                        ? ms.allPlaceholder
                          ? "ms-dot-warn"
                          : "ms-dot-ok"
                        : "ms-dot-gap"
                    }`}
                  />
                  {ms.countryCode}
                  {ms.ruleCount > 0 ? ` (${ms.ruleCount})` : ""}
                </span>
              ))}
            </div>
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"
              data-testid="pending-overlays-callout"
              style={{ marginTop: "0.75rem" }}
            >
              <div className="font-medium text-amber-900">Pending national overlays</div>
              <p className="mt-1 text-amber-800">
                France (FR) and Netherlands (NL) overlay rules are placeholders awaiting authoring in Phase 12.
                Evaluation currently treats them as UNKNOWN. Germany (DE) has 5 ACTIVE overlay rules as of Phase 11C.
              </p>
            </div>
          </section>

          {euGaps.length > 0 ? (
            <section className="coverage-section">
              <h3>EU-Level Gaps ({euGaps.length})</h3>
              <ul className="gap-list">
                {euGaps.map((gap, i) => (
                  <li key={`eu-${i}`} className={`gap-item gap-${gap.severity}`}>
                    <span className="badge">{gap.severity}</span>
                    <span>{gap.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {memberStateGaps.length > 0 ? (
            <section className="coverage-section">
              <h3>Member-State Gaps ({memberStateGaps.length})</h3>
              <ul className="gap-list">
                {memberStateGaps.map((gap, i) => (
                  <li key={`ms-${i}`} className={`gap-item gap-${gap.severity}`}>
                    <span className="badge">{gap.severity}</span>
                    <span>{gap.description}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <VerificationQueuePanel
            items={verificationQueueItems}
            counts={verificationCounts}
            promotionLog={promotionLog}
            onChange={onVerificationReviewChange}
            viewMode={allPendingGroups ? "all-pending" : "priority-10"}
            allPendingGroups={allPendingGroups}
          />
        </div>
      ) : null}
    </section>
  );
}
