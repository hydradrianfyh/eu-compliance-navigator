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
  /**
   * Sprint 5: rule's seed values drifted from the golden dataset (and/or
   * from the upstream official source). Set by the golden-regression CI
   * or the weekly drift-alert job; overrides the time-based state so
   * stakeholders see "rule is known to be out of sync".
   */
  "drifted",
] as const;

/**
 * content_provenance (Sprint 3, minimal UI version)
 *
 * Tracks where this rule's content came from and when it was human-reviewed.
 * Purpose: give stakeholders a one-line evidence-of-care in the Rules tab
 * ("Source: EUR-Lex · Last verified 2026-04-18") and lay the groundwork
 * for Sprint 4's golden-dataset regression tests.
 *
 * Kept minimal by design (5 fields, all optional) — the fuller provenance
 * UI with SPARQL query traces is Phase B's Path B completion, not this
 * sprint's scope.
 */
export const contentProvenanceSourceTypes = [
  "manual",
  "eur_lex",
  "unece",
  "national_gazette",
  "llm_draft",
] as const;

export const contentProvenanceSchema = z.object({
  source_type: z.enum(contentProvenanceSourceTypes),
  retrieved_at: z.string().nullable().optional(),
  human_reviewer: z.string().nullable().optional(),
  /** Optional — the SPARQL query / URL used if source is automated. */
  source_query: z.string().nullable().optional(),
  /** Optional — hash of the raw response body for drift detection. */
  source_hash: z.string().nullable().optional(),
});

export const freshnessStatusSchema = z.enum(freshnessStatuses);
export type FreshnessStatus = z.infer<typeof freshnessStatusSchema>;
export type ContentProvenance = z.infer<typeof contentProvenanceSchema>;

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

  /** Sprint 3: where the rule's content came from + who last checked it. */
  content_provenance: contentProvenanceSchema.optional(),

  /**
   * Sprint 3: stable_id references to related rules (e.g. R155 <-> R156,
   * R157 requires R155). Populated opportunistically in Sprint 6; Phase 13+
   * will add a dependency graph UI on top of this.
   */
  related_rules: z
    .array(
      z.object({
        rule_id: z.string(),
        relation: z.enum([
          "requires",
          "supersedes",
          "complements",
          "conflicts",
        ]),
      }),
    )
    .optional(),

  /**
   * Sprint 3: standards that must be satisfied for this rule's compliance
   * work to be credible (e.g. ISO 26262 for R157 ALKS). Free-form strings
   * so rule authors don't need a parallel standards registry.
   */
  prerequisite_standards: z.array(z.string()).optional(),
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
