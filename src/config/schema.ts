import { z } from "zod";

import {
  aiLevelSchema,
  approvalTypeSchema,
  automationLevelSchema,
  batteryCapacityBandSchema,
  brakingTypeSchema,
  completionStateSchema,
  consumerOrFleetSchema,
  frameworkGroupSchema,
  fuelTypeSchema,
  headlampTypeSchema,
  powertrainSchema,
  reviewerDecisionSchema,
  salesModelSchema,
  steeringPositionSchema,
  steeringTypeSchema,
  verificationWorkflowStatusSchema,
} from "@/shared/constants";

export const readinessSchema = z.object({
  csmsAvailable: z.boolean(),
  sumsAvailable: z.boolean(),
  dpiaCompleted: z.boolean(),
  technicalDocStarted: z.boolean(),
  evidenceOwnerAssigned: z.boolean(),
  registrationAssumptionsKnown: z.boolean(),
  offersPublicChargingInfra: z.boolean(),
});

export const chargingCapabilitySchema = z.object({
  ac: z.boolean(),
  dc: z.boolean(),
  bidirectional: z.boolean(),
});

export const vehicleConfigSchema = z.object({
  projectName: z.string(),
  vehicleCode: z.string(),
  targetCountries: z.array(z.string()),
  sopDate: z.string().nullable(),
  firstRegistrationDate: z.string().nullable(),
  consumerOrFleet: consumerOrFleetSchema,
  salesModel: salesModelSchema,
  frameworkGroup: frameworkGroupSchema.nullable(),
  vehicleCategory: z.string().nullable(),
  bodyType: z.string(),
  approvalType: approvalTypeSchema,
  steeringPosition: steeringPositionSchema,
  completionState: completionStateSchema,
  powertrain: powertrainSchema.nullable(),
  batteryCapacityBand: batteryCapacityBandSchema.nullable(),
  chargingCapability: chargingCapabilitySchema,
  automationLevel: automationLevelSchema,
  adasFeatures: z.array(z.string()),
  parkingAutomation: z.boolean(),
  motorwayAssistant: z.boolean(),
  systemInitiatedLaneChange: z.boolean(),
  connectivity: z.array(z.string()),
  dataFlags: z.array(z.string()),
  aiLevel: aiLevelSchema,
  aiInventoryExists: z.boolean(),
  braking: z.object({
    type: brakingTypeSchema,
    absFitted: z.boolean(),
    espFitted: z.boolean(),
  }).optional(),
  steering: z.object({
    type: steeringTypeSchema,
    eps: z.boolean(),
  }).optional(),
  cabin: z.object({
    airbagCount: z.number().int(),
    isofixAnchors: z.boolean(),
    seatbeltReminder: z.boolean(),
  }).optional(),
  lighting: z.object({
    headlampType: headlampTypeSchema,
    avas: z.boolean(),
  }).optional(),
  fuel: z.object({
    tankType: fuelTypeSchema,
  }).optional(),
  hmi: z.object({
    touchscreenPrimary: z.boolean(),
    voiceControl: z.boolean(),
  }).optional(),
  readiness: readinessSchema,
});

export const engineConfigSchema = z.object({
  frameworkGroup: frameworkGroupSchema.nullable(),
  vehicleCategory: z.string().nullable(),
  powertrain: z.string().nullable(),
  automationLevel: z.string(),
  adasFeatures: z.array(z.string()),
  parkingAutomation: z.boolean(),
  motorwayAssistant: z.boolean(),
  systemInitiatedLaneChange: z.boolean(),
  connectivity: z.array(z.string()),
  dataFlags: z.array(z.string()),
  aiLevel: z.string(),
  targetCountries: z.array(z.string()),
  sopDate: z.string().nullable(),
  firstRegistrationDate: z.string().nullable(),
  salesModel: z.string(),
  approvalType: z.string(),
  batteryPresent: z.boolean(),
  hasOTA: z.boolean(),
  hasConnectedServices: z.boolean(),
  processesPersonalData: z.boolean(),
  hasAI: z.boolean(),
  hasSafetyRelevantAI: z.boolean(),
  isL3Plus: z.boolean(),
  isDriverless: z.boolean(),
  hasRegen: z.boolean(),
  hasEPS: z.boolean(),
  hasAVAS: z.boolean(),
  hasMatrixLED: z.boolean(),
  hasABS: z.boolean(),
  hasESP: z.boolean(),
  fuelType: fuelTypeSchema.nullable(),
  hasCombustionEngine: z.boolean(),
  hasDieselEngine: z.boolean(),
  hasFuelTank: z.boolean(),
  hasOBD: z.boolean(),
  isPlugInHybrid: z.boolean(),
  targetsEU: z.boolean(),
  targetsUK: z.boolean(),
  targetsMemberStates: z.array(z.string()),
  targetsNonEU: z.array(z.string()),
  readiness: readinessSchema,
});

export const userRuleStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const ruleStatusesSchema = z.record(z.string(), userRuleStatusSchema);

export const ruleNotesSchema = z.record(z.string(), z.string());

export const persistedUserStateSchema = z.object({
  ruleStatuses: ruleStatusesSchema,
  ruleNotes: ruleNotesSchema,
});

export const verificationReviewEntrySchema = z.object({
  official_url: z.string().nullable(),
  oj_reference: z.string().nullable(),
  last_verified_on: z.string().nullable(),
  reviewer_identity: z.string(),
  reviewer_decision: reviewerDecisionSchema,
  reviewer_notes: z.string(),
  workflow_status: verificationWorkflowStatusSchema,
  promoted_in_session: z.boolean(),
});

export const verificationReviewStateSchema = z.record(
  z.string(),
  verificationReviewEntrySchema,
);

export const promotionLogEntrySchema = z.object({
  stable_id: z.string(),
  title: z.string(),
  promoted_by: z.string(),
  promoted_at: z.string(),
  official_url: z.string(),
  oj_reference: z.string(),
  last_verified_on: z.string(),
  previous_lifecycle_state: z.string(),
});

export const promotionLogSchema = z.array(promotionLogEntrySchema);

export type VehicleConfig = z.infer<typeof vehicleConfigSchema>;
export type EngineConfig = z.infer<typeof engineConfigSchema>;
export type UserRuleStatus = z.infer<typeof userRuleStatusSchema>;
export type RuleStatuses = z.infer<typeof ruleStatusesSchema>;
export type RuleNotes = z.infer<typeof ruleNotesSchema>;
export type PersistedUserState = z.infer<typeof persistedUserStateSchema>;
export type VerificationReviewEntry = z.infer<typeof verificationReviewEntrySchema>;
export type VerificationReviewState = z.infer<typeof verificationReviewStateSchema>;
export type PromotionLogEntry = z.infer<typeof promotionLogEntrySchema>;
export type PromotionLog = z.infer<typeof promotionLogSchema>;
