import type { LegalFamily } from "@/shared/constants";
import type { Rule } from "@/registry/schema";
import type { RegistryValidationReport } from "@/registry/governance";
import type {
  RulePromotabilityAssessment,
  SourceCompletenessReport,
  VerificationQueueItem,
} from "@/registry/verification";

export interface RegistryAdapter {
  getAllRules(): Promise<Rule[]>;
  getEvaluableRules(): Promise<Rule[]>;
  getRuleById(id: string): Promise<Rule | null>;
  getRulesByFamily(family: LegalFamily): Promise<Rule[]>;
  archiveRule(id: string, reason: string, by: string): Promise<void>;
  validateRegistry(): Promise<RegistryValidationReport>;
  getVerificationQueue(): Promise<VerificationQueueItem[]>;
  getPromotabilityAssessment(id: string): Promise<RulePromotabilityAssessment | null>;
  validateSourceCompleteness(): Promise<SourceCompletenessReport>;
  promoteRuleToActive(id: string, reviewer: string): Promise<RegistryAdapter>;
  getStaleRules(maxAgeDays: number): Promise<Rule[]>;
}
