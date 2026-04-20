"use client";

/**
 * Coverage tab — reuses the existing CoveragePanel from the legacy
 * experience. Phase E will layer semantic tokens and a dedicated
 * verification-queue subsection, but functional coverage data is already
 * comprehensive.
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

export default function CoveragePage() {
  const verificationReviewState = useAppShellStore(
    (state) => state.verificationReviewState,
  );
  const promotionLog = useAppShellStore((state) => state.promotionLog);
  const patchVerificationReview = useAppShellStore(
    (state) => state.patchVerificationReview,
  );

  const { coverageMatrix, verificationQueueState, verificationQueueCounts } =
    useMemo(() => {
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
      return {
        coverageMatrix: matrix,
        verificationQueueState: queue,
        verificationQueueCounts: counts,
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
      />
    </div>
  );
}
