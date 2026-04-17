import { applyGovernanceToRule } from "@/registry/governance";
import type { Rule } from "@/registry/schema";
import { aiGovernanceRules } from "@/registry/seed/ai-governance";
import { consumerLiabilityRules } from "@/registry/seed/consumer-liability";
import { cybersecurityRules } from "@/registry/seed/cybersecurity";
import { dataAccessRules } from "@/registry/seed/data-access";
import { dcasAutomatedRules } from "@/registry/seed/dcas-automated";
import { emissionsCo2Rules } from "@/registry/seed/emissions-co2";
import { generalSafetyRules } from "@/registry/seed/general-safety";
import { materialsChemicalsRules } from "@/registry/seed/materials-chemicals";
import { memberStateOverlayRules } from "@/registry/seed/member-state-overlay";
import { nonEuMarketRules } from "@/registry/seed/non-eu-market";
import { privacyConnectedRules } from "@/registry/seed/privacy-connected";
import { uneceTechnicalRules } from "@/registry/seed/unece-technical";
import { vehicleApprovalRules } from "@/registry/seed/vehicle-approval";
import { insuranceRegistrationRules } from "@/registry/seed/insurance-registration";
import { marketSurveillanceRules } from "@/registry/seed/market-surveillance";
import { importCustomsRules } from "@/registry/seed/import-customs";
import { consumerInformationRules } from "@/registry/seed/consumer-information";
import { ruleClassifications } from "@/registry/seed/classification";
import { evidenceEnrichments } from "@/registry/seed/evidence-enrichment";
import { freshnessSeedData } from "@/registry/seed/freshness-data";
import { authoringGenerated } from "@/registry/seed/authoring-generated";

function applyEnrichments(rules: Rule[]): Rule[] {
  return rules.map((rule) => {
    const classification = ruleClassifications[rule.stable_id];
    const evidence = evidenceEnrichments[rule.stable_id];
    const freshness = freshnessSeedData[rule.stable_id];
    // Author-generated data overrides evidence/freshness so compliance team owns the final word.
    const authored = authoringGenerated[rule.stable_id];
    return { ...rule, ...classification, ...evidence, ...freshness, ...authored };
  });
}

export const rawSeedRules: Rule[] = applyEnrichments([
  ...vehicleApprovalRules,
  ...generalSafetyRules,
  ...cybersecurityRules,
  ...dcasAutomatedRules,
  ...privacyConnectedRules,
  ...dataAccessRules,
  ...aiGovernanceRules,
  ...materialsChemicalsRules,
  ...emissionsCo2Rules,
  ...consumerLiabilityRules,
  ...memberStateOverlayRules,
  ...nonEuMarketRules,
  ...uneceTechnicalRules,
  ...insuranceRegistrationRules,
  ...marketSurveillanceRules,
  ...importCustomsRules,
  ...consumerInformationRules,
]);

export const allSeedRules: Rule[] = rawSeedRules.map(applyGovernanceToRule);
