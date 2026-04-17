import type { EvaluationResult } from "@/engine/types";
import { applicabilityResults } from "@/shared/constants";

export function computeSummary(results: EvaluationResult[]) {
  const byApplicability = Object.fromEntries(
    applicabilityResults.map((status) => [
      status,
      results.filter((result) => result.applicability === status).length,
    ]),
  ) as Record<(typeof applicabilityResults)[number], number>;

  return {
    total: results.length,
    byApplicability,
    manualReviewCount: results.filter((result) => result.manual_review_required).length,
  };
}
