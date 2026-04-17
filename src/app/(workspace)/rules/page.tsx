"use client";

/**
 * Rules tab — tri-layer layout grouped by trust level.
 *
 *   - Verified (default expanded)
 *   - Indicative (default expanded)
 *   - Pending authoring (default collapsed)
 *   - Needs your input (only if non-empty)
 *
 * Each rule card auto-expands when arrived at via /rules?rule=REG-XX (e.g.
 * a click from the Plan tab's Owner Dashboard). Filter bar reuses existing
 * session filters held in the app-shell store.
 *
 * © Yanhao FU
 */

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { EvaluationResult } from "@/engine/types";
import type { Rule } from "@/registry/schema";
import { buildEngineConfig } from "@/engine/config-builder";
import { evaluateAllRules } from "@/engine/evaluator";
import { RuleRegistry } from "@/registry/registry";
import { rawSeedRules } from "@/registry/seed";
import { materializeRulesFromReviewState } from "@/registry/verification";
import { groupByTrust } from "@/lib/classify-trust";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExportAsPdfButton } from "@/components/shared/ExportAsPdfButton";
import { RuleCardV2 } from "@/components/rules/RuleCardV2";
import { useAppShellStore } from "@/state/app-shell-store";

function matchesSearch(result: EvaluationResult, search: string): boolean {
  if (!search.trim()) return true;
  const term = search.trim().toLowerCase();
  return [
    result.rule_id,
    result.title,
    result.short_label,
    result.legal_family,
    result.ui_package,
    result.explanation,
  ].some((value) => value.toLowerCase().includes(term));
}

interface TrustSectionProps {
  id: string;
  label: string;
  hint: string;
  defaultExpanded: boolean;
  results: EvaluationResult[];
  rulesById: Map<string, Rule>;
  highlightRuleId?: string;
  renderCard: (result: EvaluationResult, rule: Rule) => React.ReactNode;
}

function TrustSection({
  id,
  label,
  hint,
  defaultExpanded,
  results,
  rulesById,
  highlightRuleId,
  renderCard,
}: TrustSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Auto-expand if a rule in this section is being deep-linked.
  const shouldAutoExpand =
    highlightRuleId && results.some((r) => r.rule_id === highlightRuleId);
  const actuallyExpanded = expanded || !!shouldAutoExpand;

  if (results.length === 0) return null;

  return (
    <section className={`trust-section trust-section-${id}`}>
      <header className="trust-section-header">
        <button
          type="button"
          className="trust-section-toggle"
          aria-expanded={actuallyExpanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="trust-section-label">{label}</span>
          <span className="trust-section-count">({results.length})</span>
          <span className="trust-section-hint">{hint}</span>
          <span className="trust-section-arrow" aria-hidden="true">
            {actuallyExpanded ? "▾" : "▸"}
          </span>
        </button>
      </header>
      {actuallyExpanded ? (
        <div className="trust-section-body">
          {results.map((result) => {
            const rule = rulesById.get(result.rule_id);
            if (!rule) return null;
            return (
              <div key={result.rule_id} className="trust-section-item">
                {renderCard(result, rule)}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function RulesTabBody() {
  const searchParams = useSearchParams();
  const highlightRuleId = searchParams.get("rule") ?? undefined;

  const config = useAppShellStore((state) => state.config);
  const verificationReviewState = useAppShellStore(
    (state) => state.verificationReviewState,
  );
  const ruleStatuses = useAppShellStore((state) => state.ruleStatuses);
  const ruleNotes = useAppShellStore((state) => state.ruleNotes);
  const searchTerm = useAppShellStore((state) => state.searchTerm);
  const applicabilityFilter = useAppShellStore(
    (state) => state.applicabilityFilter,
  );
  const freshnessFilter = useAppShellStore((state) => state.freshnessFilter);
  const setSearchTerm = useAppShellStore((state) => state.setSearchTerm);
  const setApplicabilityFilter = useAppShellStore(
    (state) => state.setApplicabilityFilter,
  );
  const setFreshnessFilter = useAppShellStore(
    (state) => state.setFreshnessFilter,
  );
  const setRuleStatus = useAppShellStore((state) => state.setRuleStatus);
  const setRuleNote = useAppShellStore((state) => state.setRuleNote);

  const effectiveRules = useMemo(
    () =>
      materializeRulesFromReviewState(rawSeedRules, verificationReviewState),
    [verificationReviewState],
  );
  const registry = useMemo(() => new RuleRegistry(effectiveRules), [
    effectiveRules,
  ]);
  const rulesById = useMemo(
    () => new Map(effectiveRules.map((r) => [r.stable_id, r])),
    [effectiveRules],
  );

  const evaluated = useMemo(() => {
    const engineConfig = buildEngineConfig(config);
    return evaluateAllRules(registry.getEvaluableRules(), engineConfig);
  }, [config, registry]);

  const filtered = useMemo(
    () =>
      evaluated.filter((result) => {
        if (
          applicabilityFilter !== "all" &&
          result.applicability !== applicabilityFilter
        )
          return false;
        if (
          freshnessFilter !== "all" &&
          result.freshness_status !== freshnessFilter
        )
          return false;
        return matchesSearch(result, searchTerm);
      }),
    [evaluated, applicabilityFilter, freshnessFilter, searchTerm],
  );

  const groups = useMemo(() => groupByTrust(filtered), [filtered]);

  const renderCard = (result: EvaluationResult, rule: Rule) => (
    <RuleCardV2
      result={result}
      rule={rule}
      userStatus={ruleStatuses[result.rule_id] ?? "todo"}
      userNote={ruleNotes[result.rule_id] ?? ""}
      onStatusChange={setRuleStatus}
      onNoteChange={setRuleNote}
      defaultExpanded={result.rule_id === highlightRuleId}
    />
  );

  return (
    <div className="rules-tab">
      <header className="rules-tab-header">
        <div>
          <h2>Rules</h2>
          <p className="muted">
            Grouped by how much you can rely on each rule. Use the filters to
            narrow the view.
          </p>
        </div>
        <div className="tab-actions">
          <ExportAsPdfButton tabClass="rules-tab" />
        </div>
      </header>

      <div className="rules-tab-filters panel">
        <label>
          <span>Search</span>
          <input
            type="search"
            aria-label="Search rules"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rule ID, title, legal family…"
          />
        </label>
        <label>
          <span>Applicability</span>
          <select
            aria-label="Applicability filter"
            value={applicabilityFilter}
            onChange={(e) =>
              setApplicabilityFilter(
                e.target.value as typeof applicabilityFilter,
              )
            }
          >
            <option value="all">All</option>
            <option value="APPLICABLE">Applies</option>
            <option value="CONDITIONAL">May apply</option>
            <option value="FUTURE">Applies from</option>
            <option value="NOT_APPLICABLE">Does not apply</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </label>
        <label>
          <span>Freshness</span>
          <select
            aria-label="Freshness filter"
            value={freshnessFilter}
            onChange={(e) =>
              setFreshnessFilter(e.target.value as typeof freshnessFilter)
            }
          >
            <option value="all">All</option>
            <option value="fresh">Fresh</option>
            <option value="due_soon">Due soon</option>
            <option value="overdue">Overdue</option>
            <option value="critically_overdue">Critically overdue</option>
            <option value="never_verified">Never verified</option>
          </select>
        </label>
        <span className="rules-tab-counts">
          Showing {filtered.length} of {evaluated.length} rules
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="⌕"
          title="No rules match your filters"
          description={
            evaluated.length === 0
              ? "The registry returned no evaluable rules. Finish Setup before reviewing rule details."
              : "Try clearing the search term or switching an Applicability / Freshness filter to 'All'."
          }
          action={
            evaluated.length === 0 ? (
              <Link href="/setup">Go to Setup</Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setApplicabilityFilter("all");
                  setFreshnessFilter("all");
                }}
              >
                Clear filters
              </button>
            )
          }
          secondaryAction={
            <Link href="/coverage" className="empty-state-link-secondary">
              Check coverage →
            </Link>
          }
        />
      ) : (
        <>
          {groups.needs_input.length > 0 ? (
            <TrustSection
              id="needs-input"
              label="— Needs your input"
              hint="Fill the highlighted fields in Setup to evaluate these."
              defaultExpanded
              results={groups.needs_input}
              rulesById={rulesById}
              highlightRuleId={highlightRuleId}
              renderCard={renderCard}
            />
          ) : null}

          <TrustSection
            id="verified"
            label="✓ Verified"
            hint="You can rely on these — source verified, evaluation live."
            defaultExpanded
            results={groups.verified}
            rulesById={rulesById}
            highlightRuleId={highlightRuleId}
            renderCard={renderCard}
          />

          <TrustSection
            id="indicative"
            label="⚠ Indicative"
            hint="Review before trusting — authored but source not yet verified."
            defaultExpanded
            results={groups.indicative}
            rulesById={rulesById}
            highlightRuleId={highlightRuleId}
            renderCard={renderCard}
          />

          <TrustSection
            id="pending"
            label="○ Pending authoring"
            hint="Not yet written up — expect content in later phases."
            defaultExpanded={false}
            results={groups.pending}
            rulesById={rulesById}
            highlightRuleId={highlightRuleId}
            renderCard={renderCard}
          />
        </>
      )}
    </div>
  );
}

export default function RulesPage() {
  return (
    <Suspense fallback={<div>Loading rules…</div>}>
      <RulesTabBody />
    </Suspense>
  );
}
