"use client";

/**
 * StatusExecSummary — Phase K.2 "3-second exec" block on top of Status.
 *
 * Renders a single-pane, management-audience summary *above* the existing
 * StatusHero. A non-technical viewer should grok the go/no-go verdict,
 * core counts, and the single most urgent action in 3 seconds; engineers
 * scroll past it to the full StatusHero + columns which remain unchanged.
 *
 * Elements (in order):
 *   1. Large verdict badge: LIKELY OK / OK WITH CAVEATS / AT RISK / INDETERMINATE
 *   2. Plain-English summary sentence derived from verdict + target countries
 *   3. Three core numbers on one line: "X apply · Y indicative · Z blockers"
 *   4. Exactly ONE top-urgent action (highest-severity or soonest blocker)
 *   5. Progressive disclosure link "See full status ↓"
 *
 * Styling uses existing semantic tokens (--status-ok / --status-attention /
 * --status-blocker) via `.status-exec-*` classes in globals.css.
 *
 * © Yanhao FU
 */

import { useMemo } from "react";

import { formatMonthsLabel } from "@/lib/format-months";
import { targetCountryOptions } from "@/shared/constants";
import type {
  BlockerItem,
  DeadlineItem,
  ExecutiveSummary,
} from "@/engine/executive-summary";

export type ExecVerdict =
  | "LIKELY OK"
  | "OK WITH CAVEATS"
  | "AT RISK"
  | "INDETERMINATE";

interface StatusExecSummaryProps {
  summary: ExecutiveSummary;
  verdict: ExecVerdict;
  targetCountries: string[];
}

type VerdictTone = "positive" | "caution" | "blocker" | "neutral";

function verdictTone(verdict: ExecVerdict): VerdictTone {
  switch (verdict) {
    case "LIKELY OK":
      return "positive";
    case "OK WITH CAVEATS":
      return "caution";
    case "AT RISK":
      return "blocker";
    case "INDETERMINATE":
    default:
      return "neutral";
  }
}

function verdictIcon(verdict: ExecVerdict): string {
  switch (verdict) {
    case "LIKELY OK":
      return "●";
    case "OK WITH CAVEATS":
      return "◐";
    case "AT RISK":
      return "▲";
    case "INDETERMINATE":
    default:
      return "◌";
  }
}

const COUNTRY_CODE_TO_LABEL: Readonly<Record<string, string>> = (() => {
  const lookup: Record<string, string> = {};
  for (const opt of targetCountryOptions.eu) lookup[opt.code] = opt.label;
  for (const opt of targetCountryOptions.nonEu) lookup[opt.code] = opt.label;
  return lookup;
})();

function labelCountry(code: string): string {
  return COUNTRY_CODE_TO_LABEL[code] ?? code;
}

function joinCountryList(codes: readonly string[]): string {
  const labels = codes.map(labelCountry);
  if (labels.length === 0) return "no target market";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} + ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} + ${labels[labels.length - 1]}`;
}

/**
 * Classify each target country as "ready" (not in `countriesAtRisk`) vs.
 * "at-risk". The summary sentence uses this split to phrase the state in
 * plain English.
 */
function splitCountriesByReadiness(
  targetCountries: readonly string[],
  atRisk: readonly string[],
): { ready: string[]; atRisk: string[] } {
  const riskSet = new Set(atRisk);
  const ready: string[] = [];
  const atRiskList: string[] = [];
  for (const code of targetCountries) {
    if (riskSet.has(code)) atRiskList.push(code);
    else ready.push(code);
  }
  return { ready, atRisk: atRiskList };
}

interface SummarySentenceInput {
  verdict: ExecVerdict;
  targetCountries: readonly string[];
  countriesAtRisk: readonly string[];
  blockerCount: number;
}

function composeSummarySentence(input: SummarySentenceInput): string {
  const { ready, atRisk } = splitCountriesByReadiness(
    input.targetCountries,
    input.countriesAtRisk,
  );

  if (input.targetCountries.length === 0) {
    return "No target market selected — pick one on the Setup tab to get a verdict.";
  }

  switch (input.verdict) {
    case "LIKELY OK":
      return `${joinCountryList(ready)} ready to ship.`;
    case "OK WITH CAVEATS": {
      if (atRisk.length > 0) {
        return `Pilot-quality for ${joinCountryList(ready.length > 0 ? ready : input.targetCountries)} — ${joinCountryList(atRisk)} still pending coverage.`;
      }
      return `Pilot-quality for ${joinCountryList(input.targetCountries)} — ${input.blockerCount === 1 ? "1 blocker" : `${input.blockerCount} blockers`} to resolve before final sign-off.`;
    }
    case "AT RISK": {
      if (input.blockerCount > 0) {
        return `${input.blockerCount === 1 ? "1 critical blocker" : `${input.blockerCount} critical blockers`} prevent shipping in ${joinCountryList(input.targetCountries)}.`;
      }
      if (atRisk.length > 0) {
        return `Coverage gap for ${joinCountryList(atRisk)} — national rules not yet authored.`;
      }
      return `Not ready to ship — see blockers below.`;
    }
    case "INDETERMINATE":
    default:
      return `Not enough verified rules in ${joinCountryList(input.targetCountries)} to reach a confident verdict.`;
  }
}

/**
 * Pick the ONE most urgent action for the exec block. Priority:
 *   1. Highest-severity blocker with a deadline (high > medium > low);
 *      tie-break by soonest deadline.
 *   2. If no blockers, the soonest deadline overall.
 *   3. If neither, null — exec block renders a calm "no urgent action".
 */
interface UrgentAction {
  stable_id: string;
  title: string;
  deadline?: string;
  months_remaining?: number;
  severity?: BlockerItem["severity"];
}

function pickMostUrgentAction(
  blockers: readonly BlockerItem[],
  deadlines: readonly DeadlineItem[],
): UrgentAction | null {
  if (blockers.length > 0) {
    const deadlineById = new Map<string, DeadlineItem>();
    for (const d of deadlines) deadlineById.set(d.stable_id, d);
    const sorted = [...blockers].sort((a, b) => {
      const rank: Record<BlockerItem["severity"], number> = {
        high: 3,
        medium: 2,
        low: 1,
      };
      const dr = rank[b.severity] - rank[a.severity];
      if (dr !== 0) return dr;
      const am = deadlineById.get(a.stable_id)?.months_remaining ?? Infinity;
      const bm = deadlineById.get(b.stable_id)?.months_remaining ?? Infinity;
      return am - bm;
    });
    const top = sorted[0];
    const d = deadlineById.get(top.stable_id);
    return {
      stable_id: top.stable_id,
      title: top.title,
      deadline: d?.deadline,
      months_remaining: d?.months_remaining,
      severity: top.severity,
    };
  }

  if (deadlines.length > 0) {
    const soonest = [...deadlines].sort(
      (a, b) => a.months_remaining - b.months_remaining,
    )[0];
    return {
      stable_id: soonest.stable_id,
      title: soonest.title,
      deadline: soonest.deadline,
      months_remaining: soonest.months_remaining,
    };
  }

  return null;
}

export function StatusExecSummary({
  summary,
  verdict,
  targetCountries,
}: StatusExecSummaryProps) {
  const tone = verdictTone(verdict);
  const sentence = useMemo(
    () =>
      composeSummarySentence({
        verdict,
        targetCountries,
        countriesAtRisk: summary.countriesAtRisk,
        blockerCount: summary.topBlockers.length,
      }),
    [verdict, targetCountries, summary.countriesAtRisk, summary.topBlockers.length],
  );

  const urgent = useMemo(
    () => pickMostUrgentAction(summary.topBlockers, summary.topDeadlines),
    [summary.topBlockers, summary.topDeadlines],
  );

  const apply = summary.verified_count + summary.indicative_count;
  const indicative = summary.indicative_count;
  const blockers = summary.topBlockers.length;

  return (
    <section
      className={`status-exec status-exec-${tone}`}
      role="region"
      aria-label="Market-entry exec summary"
    >
      <header className="status-exec-header">
        <span
          className={`status-exec-verdict status-exec-verdict-${tone}`}
          aria-label={`Verdict: ${verdict}`}
        >
          <span className="status-exec-verdict-icon" aria-hidden="true">
            {verdictIcon(verdict)}
          </span>
          <span className="status-exec-verdict-label">{verdict}</span>
        </span>
        <span className="status-exec-sentence">{sentence}</span>
      </header>

      <p className="status-exec-numbers">
        <strong>{apply}</strong> rules apply ·{" "}
        <strong>{indicative}</strong> indicative ·{" "}
        <strong>{blockers}</strong>{" "}
        {blockers === 1 ? "blocker" : "blockers"} to resolve
      </p>

      {urgent ? (
        <div className="status-exec-urgent">
          <span className="status-exec-urgent-label">
            Next urgent action:
          </span>
          <p className="status-exec-urgent-body">
            <span className="status-exec-urgent-marker" aria-hidden="true">
              ▸
            </span>
            <strong>{urgent.stable_id}</strong> {urgent.title}
            {urgent.deadline && typeof urgent.months_remaining === "number" ? (
              <span className="status-exec-urgent-when">
                {" "}— applies from {urgent.deadline.slice(0, 10)} (
                {formatMonthsLabel(urgent.months_remaining)})
              </span>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="status-exec-urgent-none muted">
          No urgent action in the next 12 months.
        </p>
      )}

      <a
        href="#status-full-detail"
        className="status-exec-disclosure"
        aria-label="Jump to full status detail"
      >
        See full status ↓
      </a>
    </section>
  );
}
