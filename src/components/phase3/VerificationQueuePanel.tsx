"use client";

import type { PromotionLog, VerificationReviewEntry } from "@/config/schema";
import type { RulePromotabilityAssessment } from "@/registry/verification";
import {
  buildPromotionChecklist,
  getDeprecationHint,
  getReferenceLabel,
  isDeprecatedSourceFamily,
  requiresOjReference,
  validateAllSourceFields,
} from "@/registry/source-validation";
import type { SourceFamily } from "@/shared/constants";

interface VerificationQueueItemView {
  stableId: string;
  title: string;
  reviewEntry: VerificationReviewEntry;
  assessment: RulePromotabilityAssessment;
}

interface VerificationQueuePanelProps {
  items: VerificationQueueItemView[];
  counts: Record<"blocked" | "partially_verified" | "promotable" | "promoted", number>;
  promotionLog: PromotionLog;
  onChange: (stableId: string, patch: Partial<VerificationReviewEntry>) => void;
}

export function VerificationQueuePanel({
  items,
  counts,
  promotionLog,
  onChange,
}: VerificationQueuePanelProps) {
  return (
    <section className="coverage-section">
      <h3>Priority Source Verification Queue</h3>
      <div className="badge-row">
        <span className="badge badge-gap">Blocked {counts.blocked}</span>
        <span className="badge badge-warning">Partial {counts.partially_verified}</span>
        <span className="badge badge-ok">Promotable {counts.promotable}</span>
        <span className="badge">Promoted {counts.promoted}</span>
      </div>
      <div className="verification-list">
        {items.map((item) => {
          const sourceFamily = item.assessment
            .expected_authoritative_source_family as SourceFamily;
          const refLabel = getReferenceLabel(sourceFamily);
          const ojRequired = requiresOjReference(sourceFamily);
          const validation = validateAllSourceFields(
            item.reviewEntry.official_url,
            item.reviewEntry.oj_reference,
            item.reviewEntry.last_verified_on,
            sourceFamily,
          );

          return (
            <article key={item.stableId} className="panel verification-item">
              <header className="verification-header">
                <div>
                  <strong>{item.stableId}</strong>
                  <div className="muted">{item.title}</div>
                </div>
                <div className="badge-row">
                  <span
                    className={`badge ${
                      item.reviewEntry.workflow_status === "blocked"
                        ? "badge-gap"
                        : item.reviewEntry.workflow_status === "partially_verified"
                          ? "badge-warning"
                          : item.reviewEntry.workflow_status === "promotable"
                            ? "badge-ok"
                            : ""
                    }`}
                  >
                    {item.reviewEntry.workflow_status}
                  </span>
                  <span className="badge">
                    Source: {item.assessment.expected_authoritative_source_family}
                  </span>
                  <span className="badge">
                    {validation.validCount}/{validation.totalRequired} required fields valid
                  </span>
                </div>
              </header>

              <div className="form-grid">
                <label>
                  <span>
                    Official URL{" "}
                    <span
                      className={`validation-hint ${validation.validations[0].valid ? "hint-ok" : "hint-err"}`}
                    >
                      {validation.validations[0].hint}
                    </span>
                  </span>
                  <input
                    aria-label="Official URL"
                    value={item.reviewEntry.official_url ?? ""}
                    onChange={(event) =>
                      onChange(item.stableId, {
                        official_url: event.target.value || null,
                      })
                    }
                  />
                </label>
                <label>
                  <span>
                    {refLabel}{ojRequired ? "" : " (optional)"}{" "}
                    <span
                      className={`validation-hint ${validation.validations[1].valid ? "hint-ok" : "hint-err"}`}
                    >
                      {validation.validations[1].hint}
                    </span>
                  </span>
                  <input
                    aria-label="OJ reference"
                    value={item.reviewEntry.oj_reference ?? ""}
                    onChange={(event) =>
                      onChange(item.stableId, {
                        oj_reference: event.target.value || null,
                      })
                    }
                  />
                </label>
                <label>
                  <span>
                    Last verified on{" "}
                    <span
                      className={`validation-hint ${validation.validations[2].valid ? "hint-ok" : "hint-err"}`}
                    >
                      {validation.validations[2].hint}
                    </span>
                  </span>
                  <input
                    type="date"
                    aria-label="Last verified on"
                    value={item.reviewEntry.last_verified_on ?? ""}
                    onChange={(event) =>
                      onChange(item.stableId, {
                        last_verified_on: event.target.value || null,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Reviewer identity</span>
                  <input
                    aria-label="Reviewer identity"
                    value={item.reviewEntry.reviewer_identity}
                    onChange={(event) =>
                      onChange(item.stableId, {
                        reviewer_identity: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Reviewer decision</span>
                  <select
                    value={item.reviewEntry.reviewer_decision}
                    onChange={(event) =>
                      onChange(item.stableId, {
                        reviewer_decision:
                          event.target.value as VerificationReviewEntry["reviewer_decision"],
                      })
                    }
                  >
                    <option value="pending">pending</option>
                    <option value="request_changes">request_changes</option>
                    <option value="approve_for_promotion">approve_for_promotion</option>
                    <option value="promote_now">promote_now</option>
                  </select>
                </label>
                <label>
                  <span>Reviewer notes</span>
                  <textarea
                    aria-label="Reviewer notes"
                    value={item.reviewEntry.reviewer_notes}
                    onChange={(event) =>
                      onChange(item.stableId, {
                        reviewer_notes: event.target.value,
                      })
                    }
                    rows={2}
                  />
                </label>
              </div>

              {(() => {
                const checklist = buildPromotionChecklist(
                  item.reviewEntry.official_url,
                  item.reviewEntry.oj_reference,
                  item.reviewEntry.last_verified_on,
                  item.reviewEntry.reviewer_identity,
                  item.reviewEntry.reviewer_decision,
                  sourceFamily,
                );
                const deprecationHint = getDeprecationHint(sourceFamily);

                return (
                  <div className="checklist-section">
                    <h5>Promotion Checklist</h5>
                    {deprecationHint ? (
                      <div className="validation-hint hint-err">{deprecationHint}</div>
                    ) : null}
                    <ul className="checklist">
                      {checklist.map((ci) => (
                        <li key={ci.label} className="checklist-item">
                          <span className={ci.passed ? "check-pass" : "check-fail"}>
                            {ci.passed ? "✓" : "✗"}
                          </span>
                          <span>
                            <strong>{ci.label}</strong>
                            <br />
                            <span className="muted">{ci.detail}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </article>
          );
        })}
      </div>

      {promotionLog.length > 0 ? (
        <section className="coverage-section">
          <h4>Promotion History ({promotionLog.length})</h4>
          <div className="coverage-table-wrapper">
            <table className="coverage-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Promoted by</th>
                  <th>Promoted at</th>
                  <th>Previous state</th>
                </tr>
              </thead>
              <tbody>
                {promotionLog.map((entry) => (
                  <tr key={`${entry.stable_id}-${entry.promoted_at}`}>
                    <td>{entry.stable_id}</td>
                    <td>{entry.promoted_by}</td>
                    <td>{entry.promoted_at}</td>
                    <td>{entry.previous_lifecycle_state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
