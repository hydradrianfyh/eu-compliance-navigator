import { z } from "zod";

import { applicabilityResultSchema } from "@/shared/constants";
import {
  freshnessStatusSchema,
  ruleSchema,
  ruleTemporalScopeSchema,
  sourceReferenceSchema,
} from "@/registry/schema";

export const triggerResultSchema = z.object({
  match: z.union([z.boolean(), z.literal("conditional")]),
  reason: z.string(),
  matched_conditions: z.array(z.string()).optional(),
  unmatched_conditions: z.array(z.string()).optional(),
});

export const evaluationResultSchema = z.object({
  rule_id: z.string(),
  title: z.string(),
  short_label: z.string(),
  legal_family: ruleSchema.shape.legal_family,
  ui_package: ruleSchema.shape.ui_package,
  process_stage: ruleSchema.shape.process_stage,
  jurisdiction: z.string(),
  jurisdiction_level: ruleSchema.shape.jurisdiction_level,
  sources: z.array(sourceReferenceSchema),
  lifecycle_state: ruleSchema.shape.lifecycle_state,
  applicability: applicabilityResultSchema,
  explanation: z.string(),
  matched_conditions: z.array(z.string()),
  unmatched_conditions: z.array(z.string()),
  missing_inputs: z.array(z.string()),
  trigger_path: z.string(),
  applicability_summary: z.string(),
  obligation_text: z.string(),
  evidence_tasks: z.array(z.string()),
  owner_hint: ruleSchema.shape.owner_hint,
  planning_lead_time_months: z.number().int().nullable(),
  exclusions: z.array(z.string()),
  temporal: ruleTemporalScopeSchema,
  manual_review_required: z.boolean(),
  manual_review_reason: z.string().nullable(),
  notes: z.string().nullable(),
  is_future_dated: z.boolean(),
  is_date_unknown: z.boolean(),
  months_until_effective: z.number().nullable(),
  was_downgraded_from_applicable: z.boolean(),
  freshness_status: freshnessStatusSchema.optional(),
});

export type TriggerResult = z.infer<typeof triggerResultSchema>;
export type EvaluationResult = z.infer<typeof evaluationResultSchema>;
