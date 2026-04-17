"use client";

import { useState } from "react";

import type { EvaluationResult } from "@/engine/types";
import type { UserRuleStatus } from "@/config/schema";
import { FreshnessBadge } from "@/components/phase3/FreshnessBadge";

interface RuleCardProps {
  result: EvaluationResult;
  reportMode: boolean;
  defaultExpanded?: boolean;
  userStatus: UserRuleStatus;
  userNote: string;
  onStatusChange: (ruleId: string, value: UserRuleStatus) => void;
  onNoteChange: (ruleId: string, value: string) => void;
}

function formatTemporal(result: EvaluationResult) {
  return Object.entries(result.temporal).filter(([, value]) => value);
}

function truncate(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function RuleCard({
  result,
  reportMode,
  defaultExpanded = false,
  userStatus,
  userNote,
  onStatusChange,
  onNoteChange,
}: RuleCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const temporalEntries = formatTemporal(result);

  return (
    <article className="rule-card">
      <header
        className="rule-card-header rule-card-toggle"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setExpanded((prev) => !prev);
          }
        }}
      >
        <div>
          <h4>{result.title}</h4>
          <p className="muted">
            {result.rule_id} &middot; {truncate(result.explanation, 100)}
          </p>
        </div>
        <div className="badge-row">
          <span className="badge">{result.lifecycle_state}</span>
          <FreshnessBadge status={result.freshness_status} />
          <span className="badge">{result.applicability}</span>
          {result.manual_review_required ? (
            <span className="badge badge-warning">Manual review</span>
          ) : null}
          <span className="badge">{expanded ? "▲" : "▼"}</span>
        </div>
      </header>

      {expanded ? (
        <>
          <p>{result.explanation}</p>

          <dl className="detail-grid">
            <div>
              <dt>Owner</dt>
              <dd>{result.owner_hint}</dd>
            </div>
            <div>
              <dt>Trigger path</dt>
              <dd>{result.trigger_path}</dd>
            </div>
            <div>
              <dt>Matched conditions</dt>
              <dd>{result.matched_conditions.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt>Unmatched conditions</dt>
              <dd>{result.unmatched_conditions.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt>Missing inputs</dt>
              <dd>{result.missing_inputs.join(", ") || "None"}</dd>
            </div>
            <div>
              <dt>Manual review reason</dt>
              <dd>{result.manual_review_reason ?? "None"}</dd>
            </div>
          </dl>

          <section className="detail-section">
            <h5>Sources</h5>
            <ul>
              {result.sources.map((source) => (
                <li key={`${result.rule_id}-${source.reference}`}>
                  {source.reference}
                  {source.oj_reference ? ` — ${source.oj_reference}` : ""}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-section">
            <h5>Temporal fields</h5>
            <ul>
              {temporalEntries.length > 0 ? (
                temporalEntries.map(([key, value]) => (
                  <li key={`${result.rule_id}-${key}`}>
                    {key}: {value}
                  </li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </section>

          <section className="detail-section">
            <h5>User tracking</h5>
            {reportMode ? (
              <dl className="detail-grid">
                <div>
                  <dt>User status</dt>
                  <dd>{userStatus}</dd>
                </div>
                <div>
                  <dt>User note</dt>
                  <dd>{userNote || "None"}</dd>
                </div>
              </dl>
            ) : (
              <>
                <label>
                  <span>User status</span>
                  <select
                    aria-label="User status"
                    value={userStatus}
                    onChange={(event) =>
                      onStatusChange(
                        result.rule_id,
                        event.target.value as UserRuleStatus,
                      )
                    }
                  >
                    <option value="todo">todo</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                  </select>
                </label>
                <label>
                  <span>User note</span>
                  <textarea
                    aria-label="User note"
                    value={userNote}
                    onChange={(event) =>
                      onNoteChange(result.rule_id, event.target.value)
                    }
                    rows={3}
                  />
                </label>
              </>
            )}
          </section>
        </>
      ) : null}
    </article>
  );
}
