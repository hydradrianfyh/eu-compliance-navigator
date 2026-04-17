import { applyGovernanceToRule, validateRegistryIntegrity } from "@/registry/governance";
import { ruleSchema, type Rule } from "@/registry/schema";
import {
  assessRulePromotability,
  prepareRuleForActivePromotion,
  buildVerificationQueue,
  validateSourceCompleteness,
  type RulePromotabilityAssessment,
} from "@/registry/verification";
import type { LegalFamily } from "@/shared/constants";

export class RuleRegistry {
  private readonly rawRules: Rule[];
  private readonly rules: Rule[];

  constructor(rules: Rule[]) {
    this.rawRules = rules.map((rule) => ruleSchema.parse(rule));
    this.rules = this.rawRules.map((rule) => applyGovernanceToRule(rule));
  }

  getAllRules(): Rule[] {
    return [...this.rules];
  }

  getEvaluableRules(): Rule[] {
    return this.rules.filter(
      (rule) => !["PLACEHOLDER", "ARCHIVED"].includes(rule.lifecycle_state),
    );
  }

  getRuleById(id: string): Rule | null {
    return this.rules.find((rule) => rule.stable_id === id) ?? null;
  }

  getRulesByFamily(family: LegalFamily): Rule[] {
    return this.rules.filter((rule) => rule.legal_family === family);
  }

  validateRegistry() {
    return validateRegistryIntegrity(this.rules);
  }

  getVerificationQueue() {
    return buildVerificationQueue(this.rawRules);
  }

  getPromotabilityAssessment(id: string): RulePromotabilityAssessment | null {
    const rule = this.getRuleById(id);

    return rule ? assessRulePromotability(rule) : null;
  }

  validateSourceCompleteness() {
    return validateSourceCompleteness(this.rawRules);
  }

  promoteRuleToActive(id: string, reviewer: string): RuleRegistry {
    const targetRule = this.rawRules.find((rule) => rule.stable_id === id);

    if (!targetRule) {
      throw new Error(`Rule ${id} was not found.`);
    }

    const promotedRule = prepareRuleForActivePromotion(targetRule, reviewer);
    const nextRawRules = this.rawRules.map((rule) =>
      rule.stable_id === id ? promotedRule : rule,
    );

    return new RuleRegistry(nextRawRules);
  }
}
