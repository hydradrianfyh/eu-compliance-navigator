"use client";

/**
 * Coverage tab — reuses the existing CoveragePanel from the legacy
 * experience. Phase E will layer semantic tokens and a dedicated
 * verification-queue subsection, but functional coverage data is already
 * comprehensive.
 *
 * Phase J.5: expanded the verification view from the hardcoded 10-rule
 * priority list to the full SEED_UNVERIFIED / DRAFT / PLACEHOLDER
 * backlog, grouped by jurisdiction + legal family, with owner_hint as
 * the recommended reviewer column.
 *
 * © Yanhao FU
 */

import { useMemo } from "react";

import { computeCoverageMatrix } from "@/registry/coverage-matrix";
import { RuleRegistry } from "@/registry/registry";
import { rawSeedRules } from "@/registry/seed";
import {
  buildDefaultReviewEntry,
  buildPriorityVerificationQueueState,
  materializeRulesFromReviewState,
  type VerificationQueueWorkflowItem,
} from "@/registry/verification";
import type { VerificationReviewEntry } from "@/config/schema";
import { CoveragePanel } from "@/components/phase3/CoveragePanel";
import type { PendingRuleGroup } from "@/components/phase3/VerificationQueuePanel";
import { ExportAsPdfButton } from "@/components/shared/ExportAsPdfButton";
import { useAppShellStore } from "@/state/app-shell-store";

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

const pendingLifecycleStates = new Set(["SEED_UNVERIFIED", "DRAFT", "PLACEHOLDER"] as const);

export default function CoveragePage() {
  const verificationReviewState = useAppShellStore(
    (state) => state.verificationReviewState,
  );
  const promotionLog = useAppShellStore((state) => state.promotionLog);
  const patchVerificationReview = useAppShellStore(
    (state) => state.patchVerificationReview,
  );

  const {
    coverageMatrix,
    verificationQueueState,
    verificationQueueCounts,
    allPendingGroups,
  } = useMemo(() => {
    const effectiveRules = materializeRulesFromReviewState(
      rawSeedRules,
      verificationReviewState,
    );
    const registry = new RuleRegistry(effectiveRules);
    const matrix = computeCoverageMatrix(
      registry.getAllRules(),
      registry.getEvaluableRules(),
    );
    const queue: VerificationQueueWorkflowItem[] =
      buildPriorityVerificationQueueState(
        rawSeedRules,
        verificationReviewState,
        priorityQueueIds,
      );
    const counts = queue.reduce(
      (acc, item) => {
        acc[item!.reviewEntry.workflow_status] += 1;
        return acc;
      },
      { blocked: 0, partially_verified: 0, promotable: 0, promoted: 0 },
    );

    // Phase J.5: full verification backlog — every SEED_UNVERIFIED,
    // DRAFT, or PLACEHOLDER rule grouped by jurisdiction + legal family,
    // so reviewers can see the complete work queue rather than the
    // hardcoded top-10 priority list.
    const pendingRules = effectiveRules.filter((rule) =>
      pendingLifecycleStates.has(
        rule.lifecycle_state as "SEED_UNVERIFIED" | "DRAFT" | "PLACEHOLDER",
      ),
    );
    const groupsMap = new Map<string, PendingRuleGroup>();
    for (const rule of pendingRules) {
      const key = `${rule.jurisdiction}::${rule.legal_family}`;
      let group = groupsMap.get(key);
      if (!group) {
        group = {
          groupLabel: `${rule.jurisdiction} · ${rule.legal_family}`,
          jurisdiction: rule.jurisdiction,
          legalFamily: rule.legal_family,
          rules: [],
        };
        groupsMap.set(key, group);
      }
      group.rules.push({
        stableId: rule.stable_id,
        title: rule.title,
        jurisdiction: rule.jurisdiction,
        legalFamily: rule.legal_family,
        lifecycleState: rule.lifecycle_state,
        ownerHint: rule.owner_hint,
        manualReviewReason: rule.manual_review_reason,
      });
    }
    const groups: PendingRuleGroup[] = Array.from(groupsMap.values())
      .map((group) => ({
        ...group,
        rules: [...group.rules].sort((a, b) =>
          a.stableId < b.stableId ? -1 : a.stableId > b.stableId ? 1 : 0,
        ),
      }))
      .sort((a, b) => {
        if (a.jurisdiction !== b.jurisdiction) {
          return a.jurisdiction < b.jurisdiction ? -1 : 1;
        }
        return a.legalFamily < b.legalFamily ? -1 : 1;
      });

    return {
      coverageMatrix: matrix,
      verificationQueueState: queue,
      verificationQueueCounts: counts,
      allPendingGroups: groups,
    };
  }, [verificationReviewState]);

  const handleVerificationReviewChange = (
    stableId: string,
    patch: Partial<VerificationReviewEntry>,
  ) => {
    const baseRule = rawSeedRules.find((rule) => rule.stable_id === stableId);
    if (!baseRule) return;
    const current =
      verificationReviewState[stableId] ?? buildDefaultReviewEntry(baseRule);
    patchVerificationReview(stableId, { ...current, ...patch });
  };

  return (
    <div className="coverage-tab">
      <header className="coverage-tab-header">
        <div>
          <h2>Coverage</h2>
          <p className="muted">
            Lifecycle / freshness distribution, domain coverage, and the
            verification queue.
          </p>
        </div>
        <div className="tab-actions">
          <ExportAsPdfButton tabClass="coverage-tab" />
        </div>
      </header>
      <CoveragePanel
        matrix={coverageMatrix}
        verificationQueueItems={verificationQueueState}
        verificationCounts={verificationQueueCounts}
        promotionLog={promotionLog}
        onVerificationReviewChange={handleVerificationReviewChange}
        allPendingGroups={allPendingGroups}
      />
    </div>
  );
}
