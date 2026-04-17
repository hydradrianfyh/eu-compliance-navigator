"use client";

/**
 * RuleCardV2 — the Rules-tab rule detail card defined in UX Refactor v2
 * spec §7.2. Five sections:
 *   - Summary
 *   - Why it applies (Plain = NL sentences; Engineering = raw conditions)
 *   - What to do (required documents, evidence, timing)
 *   - Reference (official source, freshness)
 *   - My tracking (user status + note)
 *
 * Collapsible. Plain ↔ Engineering toggle lives in the top-right of the
 * header. Plain is the default.
 *
 * © Yanhao FU
 */

import { useMemo, useState } from "react";
import Link from "next/link";

import type { UserRuleStatus } from "@/config/schema";
import type { EvaluationResult } from "@/engine/types";
import type { Rule } from "@/registry/schema";
import {
  classifyTrust,
  classifyUnknownSubState,
  freshnessHintFor,
} from "@/lib/classify-trust";
import {
  conditionToHumanText,
  customEvaluatorToHumanText,
} from "@/lib/condition-to-text";
import { ApplicabilityBadge } from "@/components/shared/ApplicabilityBadge";
import { TrustBadge } from "@/components/shared/TrustBadge";

interface RuleCardV2Props {
  result: EvaluationResult;
  rule: Rule;
  userStatus: UserRuleStatus;
  userNote: string;
  onStatusChange: (ruleId: string, status: UserRuleStatus) => void;
  onNoteChange: (ruleId: string, note: string) => void;
  defaultExpanded?: boolean;
}

export function RuleCardV2({
  result,
  rule,
  userStatus,
  userNote,
  onStatusChange,
  onNoteChange,
  defaultExpanded = false,
}: RuleCardV2Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [mode, setMode] = useState<"plain" | "engineering">("plain");

  const trust = classifyTrust(result);
  const subState = classifyUnknownSubState(result);
  const freshness = freshnessHintFor(result);

  // NL whys from the rule's ORIGINAL trigger logic — ensures even
  // fallback-labelled conditions render as sentences.
  const whyLines: string[] = useMemo(() => {
    if (rule.trigger_logic.mode === "declarative") {
      return rule.trigger_logic.conditions.map((c) => conditionToHumanText(c));
    }
    return [customEvaluatorToHumanText(rule.trigger_logic)];
  }, [rule]);

  const effectiveDate = useMemo(() => {
    if (result.applicability !== "FUTURE") return null;
    const t = result.temporal;
    return (
      t.applies_to_new_types_from ||
      t.applies_to_all_new_vehicles_from ||
      t.applies_from_generic ||
      null
    );
  }, [result]);

  const primarySource = result.sources[0];
  const hasOfficialUrl = !!primarySource?.official_url;

  // For the "Needs your input" case, offer a deep-link back to /setup.
  const firstMissingField = result.missing_inputs[0];
  const setupHref = firstMissingField
    ? `/setup?highlight=${encodeURIComponent(firstMissingField)}`
    : "/setup";

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <article className={`rule-card-v2 rule-card-v2-${trust}`}>
      <header className="rule-card-v2-header">
        <button
          type="button"
          className="rule-card-v2-toggle"
          aria-expanded={expanded}
          onClick={toggleExpanded}
        >
          <span className="rule-card-v2-titleblock">
            <span className="rule-card-v2-rule-id">{result.rule_id}</span>
            <span className="rule-card-v2-title">{result.title}</span>
          </span>
          <span className="rule-card-v2-badges" aria-hidden="true">
            <TrustBadge
              trust={trust}
              freshnessHint={freshness?.hint}
              title={
                trust === "verified"
                  ? "Verified source and live evaluation"
                  : trust === "indicative"
                    ? "Authored but source not yet verified"
                    : "Placeholder — not authored yet"
              }
            />
            <ApplicabilityBadge
              applicability={result.applicability}
              subState={subState}
              effectiveDate={effectiveDate}
            />
            <span className="rule-card-v2-owner">{result.owner_hint}</span>
          </span>
          <span className="rule-card-v2-toggle-arrow" aria-hidden="true">
            {expanded ? "▾" : "▸"}
          </span>
        </button>
        <div className="rule-card-v2-view-toggle">
          <button
            type="button"
            className={mode === "plain" ? "active" : ""}
            onClick={() => setMode("plain")}
          >
            Plain
          </button>
          <button
            type="button"
            className={mode === "engineering" ? "active" : ""}
            onClick={() => setMode("engineering")}
          >
            Engineering
          </button>
        </div>
      </header>

      {expanded ? (
        <div className="rule-card-v2-body">
          {/* Summary */}
          <section className="rule-card-v2-section">
            <h5>Summary</h5>
            <p>
              {result.applicability_summary || result.obligation_text.slice(0, 240)}
            </p>
            {result.explanation ? (
              <p className="rule-card-v2-muted">{result.explanation}</p>
            ) : null}
          </section>

          {/* Why it applies */}
          <section className="rule-card-v2-section">
            <h5>Why it applies</h5>
            {mode === "plain" ? (
              <ul className="rule-card-v2-why-list">
                {whyLines.map((line, idx) => (
                  <li key={idx}>
                    <span className="rule-card-v2-match-icon" aria-hidden="true">
                      ✓
                    </span>{" "}
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <dl className="rule-card-v2-engineering">
                <dt>Trigger path</dt>
                <dd>{result.trigger_path}</dd>
                <dt>Matched conditions</dt>
                <dd>
                  {result.matched_conditions.length === 0 ? (
                    <em>(none)</em>
                  ) : (
                    <ul>
                      {result.matched_conditions.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                </dd>
                <dt>Unmatched conditions</dt>
                <dd>
                  {result.unmatched_conditions.length === 0 ? (
                    <em>(none)</em>
                  ) : (
                    <ul>
                      {result.unmatched_conditions.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                </dd>
                <dt>Missing inputs</dt>
                <dd>
                  {result.missing_inputs.length === 0 ? (
                    <em>(none)</em>
                  ) : (
                    <ul>
                      {result.missing_inputs.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                </dd>
                {result.manual_review_reason ? (
                  <>
                    <dt>Manual review reason</dt>
                    <dd>{result.manual_review_reason}</dd>
                  </>
                ) : null}
                <dt>Raw trigger logic</dt>
                <dd>
                  <pre className="rule-card-v2-raw">
                    {JSON.stringify(rule.trigger_logic, null, 2)}
                  </pre>
                </dd>
              </dl>
            )}
            {result.missing_inputs.length > 0 ? (
              <p className="rule-card-v2-cta">
                Missing input:{" "}
                <Link href={setupHref} className="rule-card-v2-cta-link">
                  go to Setup and complete {firstMissingField}
                </Link>
              </p>
            ) : null}
          </section>

          {/* What to do */}
          {(result.evidence_tasks.length > 0 ||
            (rule.required_documents?.length ?? 0) > 0 ||
            (rule.required_evidence?.length ?? 0) > 0 ||
            rule.submission_timing) ? (
            <section className="rule-card-v2-section">
              <h5>What to do</h5>
              {rule.required_documents && rule.required_documents.length > 0 ? (
                <div>
                  <strong>Required documents ({rule.required_documents.length}):</strong>
                  <ul>
                    {rule.required_documents.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {rule.required_evidence && rule.required_evidence.length > 0 ? (
                <div>
                  <strong>Required evidence ({rule.required_evidence.length}):</strong>
                  <ul>
                    {rule.required_evidence.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {result.evidence_tasks.length > 0 ? (
                <div>
                  <strong>Evidence tasks:</strong>
                  <ul>
                    {result.evidence_tasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {rule.submission_timing ? (
                <p>
                  <strong>Submission timing:</strong> {rule.submission_timing}
                </p>
              ) : null}
            </section>
          ) : null}

          {/* Reference */}
          <section className="rule-card-v2-section">
            <h5>Reference</h5>
            {primarySource ? (
              <>
                <p>
                  <strong>{primarySource.reference}</strong>
                  {primarySource.oj_reference
                    ? ` · ${primarySource.oj_reference}`
                    : null}
                </p>
                {primarySource.last_verified_on ? (
                  <p className="rule-card-v2-muted">
                    Last verified {primarySource.last_verified_on}
                    {rule.review_cadence_days
                      ? ` · Review cadence ${rule.review_cadence_days} days`
                      : null}
                  </p>
                ) : (
                  <p className="rule-card-v2-muted">
                    Source URL not yet verified.
                  </p>
                )}
                {hasOfficialUrl ? (
                  <a
                    href={primarySource.official_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rule-card-v2-external"
                  >
                    Open on {primarySource.source_family} ↗
                  </a>
                ) : null}
              </>
            ) : (
              <p className="rule-card-v2-muted">
                No source reference recorded.
              </p>
            )}
          </section>

          {/* My tracking */}
          <section className="rule-card-v2-section rule-card-v2-tracking">
            <h5>My tracking</h5>
            <div className="rule-card-v2-tracking-fields">
              <label>
                <span>Status</span>
                <select
                  aria-label="User status"
                  value={userStatus}
                  onChange={(e) =>
                    onStatusChange(
                      result.rule_id,
                      e.target.value as UserRuleStatus,
                    )
                  }
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label>
                <span>Note</span>
                <input
                  type="text"
                  aria-label="User note"
                  value={userNote}
                  onChange={(e) => onNoteChange(result.rule_id, e.target.value)}
                  placeholder="Add a note for this rule…"
                />
              </label>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}
