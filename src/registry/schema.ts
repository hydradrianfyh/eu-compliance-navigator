import { z } from "zod";

import {
  artifactTypeSchema,
  frameworkGroupSchema,
  legalFamilySchema,
  outputKindSchema,
  ownerHintSchema,
  processStageSchema,
  ruleDomainSchema,
  ruleLifecycleStateSchema,
  sourceFamilySchema,
  uiPackageSchema,
  jurisdictionLevelSchema,
  conditionOperatorSchema,
  fallbackModeSchema,
  matchModeSchema,
} from "@/shared/constants";

export const freshnessStatuses = [
  "fresh",
  "due_soon",
  "overdue",
  "critically_overdue",
  "never_verified",
] as const;

export const freshnessStatusSchema = z.enum(freshnessStatuses);
export type FreshnessStatus = z.infer<typeof freshnessStatusSchema>;

export const sourceReferenceSchema = z.object({
  label: z.string(),
  source_family: sourceFamilySchema,
  reference: z.string(),
  official_url: z.string().nullable(),
  oj_reference: z.string().nullable(),
  authoritative_reference: z.string().nullable().optional(),
  last_verified_on: z.string().nullable(),
});

export const ruleTemporalScopeSchema = z.object({
  entry_into_force: z.string().nullable(),
  applies_to_new_types_from: z.string().nullable(),
  applies_to_all_new_vehicles_from: z.string().nullable(),
  applies_to_first_registration_from: z.string().nullable(),
  applies_from_generic: z.string().nullable(),
  effective_to: z.string().nullable(),
  small_volume_derogation_until: z.string().nullable(),
  notes: z.string().nullable(),
});

export const triggerConditionSchema = z.object({
  field: z.string(),
  operator: conditionOperatorSchema,
  value: z.unknown(),
  label: z.string().optional(),
});

export const triggerLogicDeclarativeSchema = z.object({
  mode: z.literal("declarative"),
  match_mode: matchModeSchema,
  conditions: z.array(triggerConditionSchema),
  fallback_if_missing: fallbackModeSchema,
  conditional_reason: z.string().optional(),
});

export const triggerLogicCustomSchema = z.object({
  mode: z.literal("custom"),
  evaluator_id: z.string(),
  description: z.string(),
});

export const triggerLogicSchema = z.discriminatedUnion("mode", [
  triggerLogicDeclarativeSchema,
  triggerLogicCustomSchema,
]);

export const ruleSchema = z.object({
  stable_id: z.string(),
  title: z.string(),
  short_label: z.string(),
  legal_family: legalFamilySchema,
  jurisdiction: z.string(),
  jurisdiction_level: jurisdictionLevelSchema,
  framework_group: z.array(frameworkGroupSchema),
  sources: z.array(sourceReferenceSchema).min(1),
  lifecycle_state: ruleLifecycleStateSchema,
  vehicle_scope: z.string(),
  applicability_summary: z.string(),
  exclusions: z.array(z.string()),
  trigger_logic: triggerLogicSchema,
  temporal: ruleTemporalScopeSchema,
  planning_lead_time_months: z.number().int().nullable(),
  output_kind: outputKindSchema,
  obligation_text: z.string(),
  evidence_tasks: z.array(z.string()),
  owner_hint: ownerHintSchema,
  owner_hint_detail: z.string().optional(),
  manual_review_required: z.boolean(),
  manual_review_reason: z.string().nullable(),
  notes: z.string().nullable(),
  ui_package: uiPackageSchema,
  process_stage: processStageSchema,
  domain: ruleDomainSchema.optional(),
  artifact_type: artifactTypeSchema.optional(),
  required_documents: z.array(z.string()).optional(),
  required_evidence: z.array(z.string()).optional(),
  submission_timing: z.string().optional(),
  language_or_localization_need: z.string().optional(),
  third_party_verification_required: z.boolean().optional(),
  recurring_post_market_obligation: z.boolean().optional(),
  created_on: z.string().optional(),
  created_by: z.string().optional(),
  promoted_on: z.string().optional(),
  promoted_by: z.string().optional(),
  archived_on: z.string().optional(),
  archived_reason: z.string().optional(),
  last_human_review_at: z.string().optional(),
  review_cadence_days: z.number().int().optional(),
  freshness_status: freshnessStatusSchema.optional(),
  change_watch_method: z.string().optional(),
  last_change_signal_at: z.string().optional(),
});

export type SourceReference = z.infer<typeof sourceReferenceSchema>;
export type RuleTemporalScope = z.infer<typeof ruleTemporalScopeSchema>;
export type TriggerCondition = z.infer<typeof triggerConditionSchema>;
export type TriggerLogicDeclarative = z.infer<
  typeof triggerLogicDeclarativeSchema
>;
export type TriggerLogicCustom = z.infer<typeof triggerLogicCustomSchema>;
export type TriggerLogic = z.infer<typeof triggerLogicSchema>;
export type Rule = z.infer<typeof ruleSchema>;
