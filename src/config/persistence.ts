import {
  promotionLogSchema,
  ruleNotesSchema,
  ruleStatusesSchema,
  verificationReviewStateSchema,
  vehicleConfigSchema,
  type PromotionLog,
  type RuleNotes,
  type RuleStatuses,
  type VerificationReviewState,
  type VehicleConfig,
} from "@/config/schema";

export const CONFIG_STORAGE_KEY = "evcn:config";
export const RULE_STATUSES_STORAGE_KEY = "evcn:rule-statuses";
export const RULE_NOTES_STORAGE_KEY = "evcn:rule-notes";
export const VERIFICATION_REVIEW_STORAGE_KEY = "evcn:verification-review";
export const PROMOTION_LOG_STORAGE_KEY = "evcn:promotion-log";

export function serializeVehicleConfig(config: VehicleConfig): string {
  return JSON.stringify(vehicleConfigSchema.parse(config));
}

export function deserializeVehicleConfig(payload: string): VehicleConfig {
  return vehicleConfigSchema.parse(JSON.parse(payload));
}

export function serializeRuleStatuses(ruleStatuses: RuleStatuses): string {
  return JSON.stringify(ruleStatusesSchema.parse(ruleStatuses));
}

export function deserializeRuleStatuses(payload: string): RuleStatuses {
  return ruleStatusesSchema.parse(JSON.parse(payload));
}

export function serializeRuleNotes(ruleNotes: RuleNotes): string {
  return JSON.stringify(ruleNotesSchema.parse(ruleNotes));
}

export function deserializeRuleNotes(payload: string): RuleNotes {
  return ruleNotesSchema.parse(JSON.parse(payload));
}

export function serializeVerificationReviewState(
  state: VerificationReviewState,
): string {
  return JSON.stringify(verificationReviewStateSchema.parse(state));
}

export function deserializeVerificationReviewState(
  payload: string,
): VerificationReviewState {
  return verificationReviewStateSchema.parse(JSON.parse(payload));
}

function readStorageItem(storageKey: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(storageKey);
}

export function loadPersistedVehicleConfig(): VehicleConfig | null {
  const payload = readStorageItem(CONFIG_STORAGE_KEY);

  if (!payload) {
    return null;
  }

  try {
    return deserializeVehicleConfig(payload);
  } catch {
    return null;
  }
}

export function loadPersistedRuleStatuses(): RuleStatuses {
  const payload = readStorageItem(RULE_STATUSES_STORAGE_KEY);

  if (!payload) {
    return {};
  }

  try {
    return deserializeRuleStatuses(payload);
  } catch {
    return {};
  }
}

export function loadPersistedRuleNotes(): RuleNotes {
  const payload = readStorageItem(RULE_NOTES_STORAGE_KEY);

  if (!payload) {
    return {};
  }

  try {
    return deserializeRuleNotes(payload);
  } catch {
    return {};
  }
}

export function loadPersistedVerificationReviewState(): VerificationReviewState {
  const payload = readStorageItem(VERIFICATION_REVIEW_STORAGE_KEY);

  if (!payload) {
    return {};
  }

  try {
    return deserializeVerificationReviewState(payload);
  } catch {
    return {};
  }
}

export function persistVehicleConfig(config: VehicleConfig) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONFIG_STORAGE_KEY, serializeVehicleConfig(config));
}

export function persistRuleStatuses(ruleStatuses: RuleStatuses) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    RULE_STATUSES_STORAGE_KEY,
    serializeRuleStatuses(ruleStatuses),
  );
}

export function persistRuleNotes(ruleNotes: RuleNotes) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RULE_NOTES_STORAGE_KEY, serializeRuleNotes(ruleNotes));
}

export function loadPersistedPromotionLog(): PromotionLog {
  const payload = readStorageItem(PROMOTION_LOG_STORAGE_KEY);

  if (!payload) {
    return [];
  }

  try {
    return promotionLogSchema.parse(JSON.parse(payload));
  } catch {
    return [];
  }
}

export function persistPromotionLog(log: PromotionLog) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PROMOTION_LOG_STORAGE_KEY,
    JSON.stringify(promotionLogSchema.parse(log)),
  );
}

export function persistVerificationReviewState(state: VerificationReviewState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    VERIFICATION_REVIEW_STORAGE_KEY,
    serializeVerificationReviewState(state),
  );
}

export function clearPersistedPhase4AState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONFIG_STORAGE_KEY);
  window.localStorage.removeItem(RULE_STATUSES_STORAGE_KEY);
  window.localStorage.removeItem(RULE_NOTES_STORAGE_KEY);
  window.localStorage.removeItem(VERIFICATION_REVIEW_STORAGE_KEY);
  window.localStorage.removeItem(PROMOTION_LOG_STORAGE_KEY);
}
