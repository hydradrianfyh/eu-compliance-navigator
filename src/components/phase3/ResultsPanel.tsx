"use client";

import { type ReactNode, useState } from "react";

import type { UserRuleStatus } from "@/config/schema";
import type { EvaluationResult } from "@/engine/types";
import { SummaryMetrics } from "@/components/phase3/SummaryMetrics";
import { RuleCard } from "@/components/phase3/RuleCard";
import { applicabilityResults } from "@/shared/constants";

function groupCounts(results: EvaluationResult[]) {
  const applicable = results.filter((r) => r.applicability === "APPLICABLE").length;
  const conditional = results.filter((r) => r.applicability === "CONDITIONAL").length;
  const unknown = results.filter((r) => r.applicability === "UNKNOWN").length;
  return { applicable, conditional, unknown };
}

interface ResultsPanelProps {
  reportMode: boolean;
  summary: {
    total: number;
    byApplicability: Record<(typeof applicabilityResults)[number], number>;
    manualReviewCount: number;
  };
  coverage?: {
    totalRules: number;
    evaluableRules: number;
    placeholderCount: number;
    coveredFamilies: number;
    placeholderFamilies: number;
  };
  groupedResults: Record<string, EvaluationResult[]>;
  results: EvaluationResult[];
  filters: ReactNode;
  actions?: ReactNode;
  getUserStatus: (ruleId: string) => UserRuleStatus;
  getUserNote: (ruleId: string) => string;
  onStatusChange: (ruleId: string, value: UserRuleStatus) => void;
  onNoteChange: (ruleId: string, value: string) => void;
}

export function ResultsPanel({
  reportMode,
  summary,
  coverage,
  groupedResults,
  results,
  filters,
  actions,
  getUserStatus,
  getUserNote,
  onStatusChange,
  onNoteChange,
}: ResultsPanelProps) {
  const [allExpanded, setAllExpanded] = useState(false);

  return (
    <section className="results panel">
      <div className="results-header">
        <div>
          <h2>Results</h2>
          <p className="muted">
            {results.length} rendered results.
            {reportMode
              ? " Report mode reduces interactive controls and keeps the current grouped view readable."
              : " Summary cards reflect the current filters."}
          </p>
        </div>
        <div className={`results-controls ${reportMode ? "print-hidden" : ""}`}>
          {actions}
          {filters}
        </div>
      </div>

      <SummaryMetrics summary={summary} coverage={coverage} />

      <div className="expand-controls print-hidden">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setAllExpanded(true)}
        >
          Expand all
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setAllExpanded(false)}
        >
          Collapse all
        </button>
      </div>

      <div className="group-list">
        {Object.entries(groupedResults).map(([group, groupResults]) => {
          const counts = groupCounts(groupResults);
          return (
            <section key={group} className="group-section">
              <h3>
                {group}{" "}
                <span className="muted group-counts">
                  ({groupResults.length} rules
                  {counts.applicable > 0 ? ` · ${counts.applicable} applicable` : ""}
                  {counts.conditional > 0
                    ? ` · ${counts.conditional} conditional`
                    : ""}
                  {counts.unknown > 0 ? ` · ${counts.unknown} unknown` : ""})
                </span>
              </h3>
              <div className="rule-list">
                {groupResults.map((result) => (
                  <RuleCard
                    key={result.rule_id}
                    result={result}
                    reportMode={reportMode}
                    defaultExpanded={allExpanded}
                    userStatus={getUserStatus(result.rule_id)}
                    userNote={getUserNote(result.rule_id)}
                    onStatusChange={onStatusChange}
                    onNoteChange={onNoteChange}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
