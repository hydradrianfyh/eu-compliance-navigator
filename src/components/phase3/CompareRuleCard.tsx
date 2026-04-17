import type { EvaluationComparisonRow } from "@/engine/comparator";

function formatBool(value: boolean | undefined) {
  if (value === undefined) {
    return "n/a";
  }

  return value ? "yes" : "no";
}

function explanationSummary(value: string | undefined) {
  if (!value) {
    return "n/a";
  }

  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

export function CompareRuleCard({ comparison }: { comparison: EvaluationComparisonRow }) {
  return (
    <article className="rule-card compare-card">
      <header className="rule-card-header">
        <div>
          <h4>{comparison.title}</h4>
          <p className="muted">{comparison.rule_id}</p>
        </div>
        <div className="badge-row">
          {comparison.applicability_changed ? <span className="badge">Applicability changed</span> : null}
          {comparison.lifecycle_changed ? <span className="badge">Lifecycle changed</span> : null}
          {comparison.manual_review_changed ? <span className="badge">Manual review changed</span> : null}
          {comparison.explanation_changed ? <span className="badge">Explanation changed</span> : null}
        </div>
      </header>

      <div className="compare-columns">
        <section className="compare-column">
          <h5>Left</h5>
          <dl className="detail-grid">
            <div>
              <dt>Applicability</dt>
              <dd>{comparison.left?.applicability ?? "n/a"}</dd>
            </div>
            <div>
              <dt>Lifecycle</dt>
              <dd>{comparison.left?.lifecycle_state ?? "n/a"}</dd>
            </div>
            <div>
              <dt>Manual review</dt>
              <dd>{formatBool(comparison.left?.manual_review_required)}</dd>
            </div>
            <div>
              <dt>Explanation</dt>
              <dd>{explanationSummary(comparison.left?.explanation)}</dd>
            </div>
          </dl>
        </section>
        <section className="compare-column">
          <h5>Right</h5>
          <dl className="detail-grid">
            <div>
              <dt>Applicability</dt>
              <dd>{comparison.right?.applicability ?? "n/a"}</dd>
            </div>
            <div>
              <dt>Lifecycle</dt>
              <dd>{comparison.right?.lifecycle_state ?? "n/a"}</dd>
            </div>
            <div>
              <dt>Manual review</dt>
              <dd>{formatBool(comparison.right?.manual_review_required)}</dd>
            </div>
            <div>
              <dt>Explanation</dt>
              <dd>{explanationSummary(comparison.right?.explanation)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </article>
  );
}
