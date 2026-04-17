import { applicabilityResults } from "@/shared/constants";

interface RegistryCoverage {
  totalRules: number;
  evaluableRules: number;
  placeholderCount: number;
  coveredFamilies: number;
  placeholderFamilies: number;
}

interface SummaryMetricsProps {
  summary: {
    total: number;
    byApplicability: Record<(typeof applicabilityResults)[number], number>;
    manualReviewCount: number;
  };
  coverage?: RegistryCoverage;
}

export function SummaryMetrics({ summary, coverage }: SummaryMetricsProps) {
  return (
    <div className="summary-section">
      <section className="summary-grid">
        <article className="metric-card">
          <span>Visible rules</span>
          <strong>{summary.total}</strong>
        </article>
        {applicabilityResults.map((status) => (
          <article key={status} className="metric-card">
            <span>{status}</span>
            <strong>{summary.byApplicability[status]}</strong>
          </article>
        ))}
        <article className="metric-card">
          <span>Visible manual review</span>
          <strong>{summary.manualReviewCount}</strong>
        </article>
      </section>
      {coverage ? (
        <section className="coverage-bar">
          <span>
            Registry: <strong>{coverage.totalRules}</strong> total rules ·{" "}
            <strong>{coverage.evaluableRules}</strong> evaluable ·{" "}
            <strong>{coverage.placeholderCount}</strong> placeholders ·{" "}
            <strong>{coverage.coveredFamilies}</strong> families with rules ·{" "}
            <strong>{coverage.placeholderFamilies}</strong> families placeholder-only
          </span>
        </section>
      ) : null}
    </div>
  );
}
