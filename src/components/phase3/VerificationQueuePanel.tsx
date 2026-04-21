"use client";

import type { PromotionLog, VerificationReviewEntry } from "@/config/schema";
import type { RulePromotabilityAssessment } from "@/registry/verification";
import {
  buildPromotionChecklist,
  getDeprecationHint,
  getReferenceLabel,
  requiresOjReference,
  validateAllSourceFields,
} from "@/registry/source-validation";
import type {
  LegalFamily,
  OwnerHint,
  RuleLifecycleState,
  SourceFamily,
} from "@/shared/constants";

interface VerificationQueueItemView {
  stableId: string;
  title: string;
  reviewEntry: VerificationReviewEntry;
  assessment: RulePromotabilityAssessment;
}

/**
 * Phase J.5: full verification backlog entry (read-only).
 *
 * Used in `viewMode === "all-pending"` to surface every
 * SEED_UNVERIFIED / DRAFT / PLACEHOLDER rule in the registry (not just
 * the hardcoded 10-rule priority list), grouped by jurisdiction and
 * legal family, with the recommended reviewer (owner_hint).
 */
export interface PendingRuleEntry {
  stableId: string;
  title: string;
  jurisdiction: string;
  legalFamily: LegalFamily;
  lifecycleState: RuleLifecycleState;
  ownerHint: OwnerHint;
}

export interface PendingRuleGroup {
  /** Display label, e.g. "DE · member_state_overlay". */
  groupLabel: string;
  jurisdiction: string;
  legalFamily: LegalFamily;
  rules: PendingRuleEntry[];
}

type VerificationViewMode = "priority-10" | "all-pending";

interface VerificationQueuePanelProps {
  items: VerificationQueueItemView[];
  counts: Record<"blocked" | "partially_verified" | "promotable" | "promoted", number>;
  promotionLog: PromotionLog;
  onChange: (stableId: string, patch: Partial<VerificationReviewEntry>) => void;
  /**
   * Phase J.5: widens the panel from the 10-rule priority list to the
   * full SEED_UNVERIFIED / DRAFT / PLACEHOLDER backlog. Defaults to
   * "priority-10" for backward compatibility.
   */
  viewMode?: VerificationViewMode;
  /**
   * Phase J.5: required when `viewMode === "all-pending"`. Pre-grouped
   * by jurisdiction + legal family so the panel stays a pure renderer.
   */
  allPendingGroups?: PendingRuleGroup[];
}

export function VerificationQueuePanel({
  items,
  counts,
  promotionLog,
  onChange,
  viewMode = "priority-10",
  allPendingGroups,
}: VerificationQueuePanelProps) {
  const isAllPending = viewMode === "all-pending";

  if (isAllPending) {
    return (
      <section className="coverage-section verification-all-pending">
        <h3>Verification backlog — all pending rules</h3>
        <p className="muted">
          Every rule in SEED_UNVERIFIED, DRAFT, or PLACEHOLDER state, grouped
          by jurisdiction and legal family. Recommended reviewer comes from
          each rule&apos;s <code>owner_hint</code>.
        </p>
        {allPendingGroups && allPendingGroups.length > 0 ? (
          <div className="verification-backlog-groups">
            {allPendingGroups.map((group) => (
              <section
                key={group.groupLabel}
                className="verification-backlog-group"
                data-testid={`backlog-group-${group.jurisdiction}-${group.legalFamily}`}
              >
                <header className="verification-backlog-group-header">
                  <strong>{group.groupLabel}</strong>
                  <span className="muted">
                    {group.rules.length}{" "}
                    {group.rules.length === 1 ? "rule" : "rules"}
                  </span>
                </header>
                <table className="coverage-table">
                  <thead>
                    <tr>
                      <th scope="col">Rule</th>
                      <th scope="col">Title</th>
                      <th scope="col">Lifecycle</th>
                      <th scope="col">Recommended reviewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rules.map((rule) => (
                      <tr key={rule.stableId}>
                        <td>
                          <strong>{rule.stableId}</strong>
                        </td>
                        <td>{rule.title}</td>
                        <td>
                          <span
                            className={`badge badge-lifecycle-${rule.lifecycleState.toLowerCase()}`}
                          >
                            {rule.lifecycleState}
                          </span>
                        </td>
                        <td>{rule.ownerHint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        ) : (
          <p className="muted">No pending rules in the backlog.</p>
        )}

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
