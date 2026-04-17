import type { EvaluationComparisonRow } from "@/engine/comparator";
import { SummaryMetrics } from "@/components/phase3/SummaryMetrics";
import { CompareRuleCard } from "@/components/phase3/CompareRuleCard";
import { applicabilityResults } from "@/shared/constants";

interface CompareResultsPanelProps {
  leftSummary: {
    total: number;
    byApplicability: Record<(typeof applicabilityResults)[number], number>;
    manualReviewCount: number;
  };
  rightSummary: {
    total: number;
    byApplicability: Record<(typeof applicabilityResults)[number], number>;
    manualReviewCount: number;
  };
  groupedComparisons: Record<string, EvaluationComparisonRow[]>;
}

export function CompareResultsPanel({
  leftSummary,
  rightSummary,
  groupedComparisons,
}: CompareResultsPanelProps) {
  return (
    <section className="results panel">
      <div className="results-header">
        <div>
          <h2>Compare results</h2>
          <p className="muted">Side-by-side comparison uses the existing engine output only.</p>
        </div>
      </div>

      <div className="compare-summary-grid">
        <section className="panel">
          <h3>Left results</h3>
          <SummaryMetrics summary={leftSummary} />
        </section>
        <section className="panel">
          <h3>Right results</h3>
          <SummaryMetrics summary={rightSummary} />
        </section>
      </div>

      <div className="group-list">
        {Object.entries(groupedComparisons).map(([group, comparisons]) => (
          <section key={group} className="group-section">
            <h3>{group}</h3>
            <div className="rule-list">
              {comparisons.map((comparison) => (
                <CompareRuleCard key={comparison.rule_id} comparison={comparison} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
