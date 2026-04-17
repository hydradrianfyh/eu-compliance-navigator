"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { defaultVehicleConfig } from "@/config/defaults";
import {
  clearPersistedPhase4AState,
  loadPersistedPromotionLog,
  loadPersistedRuleNotes,
  loadPersistedRuleStatuses,
  loadPersistedVerificationReviewState,
  loadPersistedVehicleConfig,
  persistPromotionLog,
  persistRuleNotes,
  persistRuleStatuses,
  persistVerificationReviewState,
  persistVehicleConfig,
} from "@/config/persistence";
import { hasVehicleConfigInUrl, loadVehicleConfigFromUrl, syncVehicleConfigToUrl } from "@/config/sharing";
import type {
  PromotionLog,
  RuleNotes,
  RuleStatuses,
  UserRuleStatus,
  VehicleConfig,
  VerificationReviewEntry,
  VerificationReviewState,
} from "@/config/schema";
import { buildEngineConfig } from "@/engine/config-builder";
import { buildOwnerDashboard } from "@/engine/by-owner";
import { compareEvaluationRows, type EvaluationComparisonRow } from "@/engine/comparator";
import { evaluateAllRules } from "@/engine/evaluator";
import { buildExecutiveSummary } from "@/engine/executive-summary";
import { computeSummary } from "@/engine/summary";
import { buildTimeline } from "@/engine/timeline";
import type { EvaluationResult } from "@/engine/types";
import { downloadBlob } from "@/export/download";
import {
  buildViewExportCsvBlob,
  buildViewExportJsonBlob,
  buildViewExportPayload,
} from "@/export/view-export";
import { computeCoverageMatrix } from "@/registry/coverage-matrix";
import { RuleRegistry } from "@/registry/registry";
import { rawSeedRules } from "@/registry/seed";
import {
  buildPriorityVerificationQueueState,
  buildDefaultReviewEntry,
  materializeRulesFromReviewState,
  type VerificationQueueWorkflowItem,
} from "@/registry/verification";
import { applicabilityResults, legalFamilies } from "@/shared/constants";
import { CompareResultsPanel } from "@/components/phase3/CompareResultsPanel";
import { ConfigPanel } from "@/components/phase3/ConfigPanel";
import { CoveragePanel } from "@/components/phase3/CoveragePanel";
import { ExecutiveSummaryPanel } from "@/components/phase3/ExecutiveSummaryPanel";
import { FilterBar, type FreshnessFilter } from "@/components/phase3/FilterBar";
import { OwnerDashboardPanel } from "@/components/phase3/OwnerDashboardPanel";
import { ResultsPanel } from "@/components/phase3/ResultsPanel";
import { TimelinePanel } from "@/components/phase3/TimelinePanel";

type PageMode = "single" | "compare";
type GroupMode = "legal_family" | "ui_package";
type ApplicabilityFilter = (typeof applicabilityResults)[number] | "all";
type ViewMode = "interactive" | "report";

const priorityQueueIds: string[] = [
  "REG-TA-001",
  "REG-TA-002",
  "REG-GSR-001",
  "REG-CS-001",
  "REG-CS-002",
  "REG-AD-001",
  "REG-AD-002",
  "REG-PV-001",
  "REG-DA-001",
  "REG-AI-001",
];

function matchesSearch(result: EvaluationResult, search: string): boolean {
  if (!search.trim()) {
    return true;
  }

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

function groupResults(results: EvaluationResult[], mode: GroupMode) {
  return results.reduce<Record<string, EvaluationResult[]>>((groups, result) => {
    const key = mode === "legal_family" ? result.legal_family : result.ui_package;
    groups[key] ??= [];
    groups[key].push(result);
    return groups;
  }, {});
}

function groupComparisons(comparisons: EvaluationComparisonRow[]) {
  return comparisons.reduce<Record<string, EvaluationComparisonRow[]>>(
    (groups, comparison) => {
      groups[comparison.group_key] ??= [];
      groups[comparison.group_key].push(comparison);
      return groups;
    },
    {},
  );
}

export function Phase3MainPage() {
  // Compare mode keeps a second VehicleConfig in memory. Switching back to single mode
  // hides the right-hand config/results but does not discard them, so a user can return
  // to compare without rebuilding the second scenario. Search/filter/grouping and user
  // annotations remain shared because they describe the current page view, not one side.
  const [pageMode, setPageMode] = useState<PageMode>("single");
  const [config, setConfig] = useState<VehicleConfig>(
    () =>
      (hasVehicleConfigInUrl() ? loadVehicleConfigFromUrl() : null) ??
      loadPersistedVehicleConfig() ??
      defaultVehicleConfig,
  );
  const [ruleStatuses, setRuleStatuses] = useState<RuleStatuses>(() =>
    loadPersistedRuleStatuses(),
  );
  const [ruleNotes, setRuleNotes] = useState<RuleNotes>(() =>
    loadPersistedRuleNotes(),
  );
  const [verificationReviewState, setVerificationReviewState] =
    useState<VerificationReviewState>(() => loadPersistedVerificationReviewState());
  const [promotionLog, setPromotionLog] = useState<PromotionLog>(() =>
    loadPersistedPromotionLog(),
  );
  const [compareConfig, setCompareConfig] = useState<VehicleConfig>(defaultVehicleConfig);
  const [searchTerm, setSearchTerm] = useState("");
  const [applicabilityFilter, setApplicabilityFilter] =
    useState<ApplicabilityFilter>("all");
  const [freshnessFilter, setFreshnessFilter] = useState<FreshnessFilter>("all");
  const [groupMode, setGroupMode] = useState<GroupMode>("legal_family");
  const [viewMode, setViewMode] = useState<ViewMode>("interactive");
  const hasMountedRef = useRef(false);
  const skipNextPersistRef = useRef(false);

  const effectiveRules = useMemo(
    () => materializeRulesFromReviewState(rawSeedRules, verificationReviewState),
    [verificationReviewState],
  );

  const registry = useMemo(() => new RuleRegistry(effectiveRules), [effectiveRules]);

  const registryCoverage = useMemo(() => {
    const allRules = registry.getAllRules();
    const evaluableRules = registry.getEvaluableRules();
    const placeholderCount = allRules.filter(
      (rule) => rule.lifecycle_state === "PLACEHOLDER",
    ).length;
    const familiesWithRules = new Set(allRules.map((rule) => rule.legal_family));
    const familiesPlaceholderOnly = legalFamilies.filter((family) => {
      const familyRules = allRules.filter((rule) => rule.legal_family === family);
      return (
        familyRules.length > 0 &&
        familyRules.every((rule) => rule.lifecycle_state === "PLACEHOLDER")
      );
    });
    return {
      totalRules: allRules.length,
      evaluableRules: evaluableRules.length,
      placeholderCount,
      coveredFamilies: familiesWithRules.size,
      placeholderFamilies: familiesPlaceholderOnly.length,
    };
  }, [registry]);

  const coverageMatrix = useMemo(
    () => computeCoverageMatrix(registry.getAllRules(), registry.getEvaluableRules()),
    [registry],
  );

  const evaluatedResults = useMemo(() => {
    const engineConfig = buildEngineConfig(config);
    return evaluateAllRules(registry.getEvaluableRules(), engineConfig);
  }, [config, registry]);

  const timeline = useMemo(
    () =>
      buildTimeline({
        config,
        results: evaluatedResults,
        rules: effectiveRules,
      }),
    [config, evaluatedResults, effectiveRules],
  );

  const executiveSummary = useMemo(
    () =>
      buildExecutiveSummary({
        config,
        results: evaluatedResults,
        rules: effectiveRules,
        timeline,
      }),
    [config, evaluatedResults, effectiveRules, timeline],
  );

  const ownerDashboard = useMemo(
    () => buildOwnerDashboard({ results: evaluatedResults, rules: effectiveRules }),
    [evaluatedResults, effectiveRules],
  );

  const comparedResults = useMemo(() => {
    const engineConfig = buildEngineConfig(compareConfig);
    return evaluateAllRules(registry.getEvaluableRules(), engineConfig);
  }, [compareConfig, registry]);

  const filterResultSet = useCallback(
    (results: EvaluationResult[]) =>
      results.filter((result) => {
        const applicabilityMatches =
          applicabilityFilter === "all" ||
          result.applicability === applicabilityFilter;

        const freshnessMatches =
          freshnessFilter === "all" ||
          result.freshness_status === freshnessFilter;

        return (
          applicabilityMatches &&
          freshnessMatches &&
          matchesSearch(result, searchTerm)
        );
      }),
    [applicabilityFilter, freshnessFilter, searchTerm],
  );

  const filteredResults = useMemo(
    () => filterResultSet(evaluatedResults),
    [evaluatedResults, filterResultSet],
  );
  const filteredComparedResults = useMemo(
    () => filterResultSet(comparedResults),
    [comparedResults, filterResultSet],
  );

  const summary = useMemo(() => computeSummary(filteredResults), [filteredResults]);
  const comparedSummary = useMemo(
    () => computeSummary(filteredComparedResults),
    [filteredComparedResults],
  );
  const groupedResults = useMemo(
    () => groupResults(filteredResults, groupMode),
    [filteredResults, groupMode],
  );
  const groupedComparisons = useMemo(
    () =>
      groupComparisons(
        compareEvaluationRows(filteredResults, filteredComparedResults, groupMode),
      ),
    [filteredComparedResults, filteredResults, groupMode],
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      syncVehicleConfigToUrl(config);
      return;
    }

    syncVehicleConfigToUrl(config);

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistVehicleConfig(config);
    persistRuleStatuses(ruleStatuses);
    persistRuleNotes(ruleNotes);
    persistVerificationReviewState(verificationReviewState);
    persistPromotionLog(promotionLog);
  }, [config, promotionLog, ruleNotes, ruleStatuses, verificationReviewState]);

  const getUserStatus = (ruleId: string): UserRuleStatus => {
    return ruleStatuses[ruleId] ?? "todo";
  };

  const getUserNote = (ruleId: string): string => {
    return ruleNotes[ruleId] ?? "";
  };

  const handleStatusChange = (ruleId: string, value: UserRuleStatus) => {
    setRuleStatuses((current) => ({
      ...current,
      [ruleId]: value,
    }));
  };

  const handleNoteChange = (ruleId: string, value: string) => {
    setRuleNotes((current) => ({
      ...current,
      [ruleId]: value,
    }));
  };

  const handleClearSavedState = () => {
    clearPersistedPhase4AState();
    skipNextPersistRef.current = true;
    setConfig(defaultVehicleConfig);
    setRuleStatuses({});
    setRuleNotes({});
    setVerificationReviewState({});
    setPromotionLog([]);
  };

  const verificationQueueState = useMemo<VerificationQueueWorkflowItem[]>(
    () =>
      buildPriorityVerificationQueueState(
        rawSeedRules,
        verificationReviewState,
        priorityQueueIds,
      ),
    [verificationReviewState],
  );

  const verificationQueueCounts = useMemo(() => {
    return verificationQueueState.reduce(
      (acc, item) => {
        acc[item!.reviewEntry.workflow_status] += 1;
        return acc;
      },
      {
        blocked: 0,
        partially_verified: 0,
        promotable: 0,
        promoted: 0,
      },
    );
  }, [verificationQueueState]);

  const handleVerificationReviewChange = (
    stableId: string,
    patch: Partial<VerificationReviewEntry>,
  ) => {
    const baseRule = rawSeedRules.find((rule) => rule.stable_id === stableId);
    if (!baseRule) return;

    setVerificationReviewState((current) => {
      const existing = current[stableId] ?? buildDefaultReviewEntry(baseRule);
      return {
        ...current,
        [stableId]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const exportPayload = useMemo(
    () =>
      buildViewExportPayload(config, filteredResults, ruleStatuses, ruleNotes),
    [config, filteredResults, ruleNotes, ruleStatuses],
  );

  const handleExportJson = () => {
    downloadBlob("compliance-view.json", buildViewExportJsonBlob(exportPayload));
  };

  const handleExportCsv = () => {
    downloadBlob("compliance-view.csv", buildViewExportCsvBlob(exportPayload));
  };

  return (
    <main className={`page-shell ${viewMode === "report" ? "report-mode" : ""}`}>
      <header className="page-header">
        <h1>EU Vehicle Compliance Navigator</h1>
        <p>
          Single-page compliance navigator with Phase 6A hardening on top of the
          existing Phase 2 engine.
        </p>
        <div className="mode-toggle print-hidden">
          <button
            type="button"
            className={pageMode === "single" ? "secondary-button active-mode" : "secondary-button"}
            onClick={() => setPageMode("single")}
          >
            Single mode
          </button>
          <button
            type="button"
            className={pageMode === "compare" ? "secondary-button active-mode" : "secondary-button"}
            onClick={() => setPageMode("compare")}
          >
            Compare mode
          </button>
        </div>
        <div className="mode-toggle print-hidden">
          <button
            type="button"
            className={viewMode === "interactive" ? "secondary-button active-mode" : "secondary-button"}
            onClick={() => setViewMode("interactive")}
          >
            Interactive mode
          </button>
          <button
            type="button"
            className={viewMode === "report" ? "secondary-button active-mode" : "secondary-button"}
            onClick={() => setViewMode("report")}
          >
            Report mode
          </button>
        </div>
      </header>
      <CoveragePanel
        matrix={coverageMatrix}
        verificationQueueItems={verificationQueueState}
        verificationCounts={verificationQueueCounts}
        promotionLog={promotionLog}
        onVerificationReviewChange={handleVerificationReviewChange}
      />
      <ExecutiveSummaryPanel summary={executiveSummary} />
      <TimelinePanel timeline={timeline} />
      <OwnerDashboardPanel dashboard={ownerDashboard} />
      <div className="workspace">
        {pageMode === "compare" && viewMode === "interactive" ? (
          <div className="compare-config-grid">
            <ConfigPanel
              title="Left configuration"
              config={config}
              onChange={setConfig}
              onClearSavedState={handleClearSavedState}
            />
            <ConfigPanel
              title="Right configuration"
              config={compareConfig}
              onChange={setCompareConfig}
            />
          </div>
        ) : pageMode === "single" && viewMode === "interactive" ? (
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onClearSavedState={handleClearSavedState}
          />
        ) : null}
        {pageMode === "compare" ? (
          <CompareResultsPanel
            leftSummary={summary}
            rightSummary={comparedSummary}
            groupedComparisons={groupedComparisons}
          />
        ) : (
          <ResultsPanel
            reportMode={viewMode === "report"}
            summary={summary}
            coverage={registryCoverage}
            groupedResults={groupedResults}
            results={filteredResults}
            actions={viewMode === "interactive" ? (
              <div className="action-bar">
                <button type="button" className="secondary-button" onClick={handleExportJson}>
                  Export JSON
                </button>
                <button type="button" className="secondary-button" onClick={handleExportCsv}>
                  Export CSV
                </button>
              </div>
            ) : null}
            getUserStatus={getUserStatus}
            getUserNote={getUserNote}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
            filters={viewMode === "interactive" ? (
              <FilterBar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                applicabilityFilter={applicabilityFilter}
                onApplicabilityFilterChange={setApplicabilityFilter}
                freshnessFilter={freshnessFilter}
                onFreshnessFilterChange={setFreshnessFilter}
                groupMode={groupMode}
                onGroupModeChange={setGroupMode}
              />
            ) : null}
          />
        )}
      </div>
    </main>
  );
}
