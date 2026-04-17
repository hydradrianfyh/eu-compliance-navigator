import {
  artifactTypes,
  jurisdictionLevels,
  processStages,
  ruleDomains,
  ruleLifecycleStates,
  type ArtifactType,
  type ProcessStage,
  type RuleDomain,
  type RuleLifecycleState,
} from "@/shared/constants";
import type { Rule } from "@/registry/schema";

export interface DomainCoverage {
  domain: RuleDomain;
  ruleCount: number;
  byLifecycle: Record<RuleLifecycleState, number>;
  byProcessStage: Record<ProcessStage, number>;
  byArtifactType: Record<ArtifactType, number>;
  hasSubstantiveRules: boolean;
  isPlaceholderOnly: boolean;
}

export interface MemberStateCoverage {
  countryCode: string;
  ruleCount: number;
  allPlaceholder: boolean;
}

export interface CoverageGap {
  area: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface CoverageMatrix {
  totalRules: number;
  evaluableRules: number;
  byLifecycle: Record<RuleLifecycleState, number>;
  byDomain: DomainCoverage[];
  memberStateCoverage: MemberStateCoverage[];
  uncoveredDomains: RuleDomain[];
  placeholderOnlyDomains: RuleDomain[];
  gaps: CoverageGap[];
  classifiedCount: number;
  unclassifiedCount: number;
}

const targetMemberStates = [
  "DE", "FR", "IT", "ES", "NL", "SE", "PL", "AT", "BE", "CZ",
  "DK", "FI", "IE", "PT", "RO", "GR", "HU", "SK", "BG", "HR",
  "LT", "LV", "EE", "SI", "CY", "LU", "MT",
];

function countByField<T extends string>(
  rules: Rule[],
  field: (rule: Rule) => T | undefined,
  values: readonly T[],
): Record<T, number> {
  const counts = Object.fromEntries(values.map((v) => [v, 0])) as Record<T, number>;
  for (const rule of rules) {
    const val = field(rule);
    if (val && val in counts) {
      counts[val]++;
    }
  }
  return counts;
}

export function computeCoverageMatrix(allRules: Rule[], evaluableRules: Rule[]): CoverageMatrix {
  const byLifecycle = countByField(
    allRules,
    (r) => r.lifecycle_state,
    ruleLifecycleStates,
  );

  const classifiedRules = allRules.filter((r) => r.domain);
  const classifiedCount = classifiedRules.length;
  const unclassifiedCount = allRules.length - classifiedCount;

  const byDomain: DomainCoverage[] = ruleDomains.map((domain) => {
    const domainRules = allRules.filter((r) => r.domain === domain);
    const domainByLifecycle = countByField(domainRules, (r) => r.lifecycle_state, ruleLifecycleStates);
    const domainByStage = countByField(domainRules, (r) => r.process_stage, processStages);
    const domainByArtifact = countByField(domainRules, (r) => r.artifact_type, artifactTypes);
    const hasSubstantive = domainRules.some(
      (r) => r.lifecycle_state !== "PLACEHOLDER" && r.lifecycle_state !== "ARCHIVED",
    );
    const isPlaceholderOnly =
      domainRules.length > 0 &&
      domainRules.every((r) => r.lifecycle_state === "PLACEHOLDER");

    return {
      domain,
      ruleCount: domainRules.length,
      byLifecycle: domainByLifecycle,
      byProcessStage: domainByStage,
      byArtifactType: domainByArtifact,
      hasSubstantiveRules: hasSubstantive,
      isPlaceholderOnly,
    };
  });

  const memberStateRules = allRules.filter(
    (r) => r.jurisdiction_level === "MEMBER_STATE",
  );
  const memberStateCoverage: MemberStateCoverage[] = targetMemberStates.map(
    (code) => {
      const countryRules = memberStateRules.filter((r) => r.jurisdiction === code);
      return {
        countryCode: code,
        ruleCount: countryRules.length,
        allPlaceholder:
          countryRules.length > 0 &&
          countryRules.every((r) => r.lifecycle_state === "PLACEHOLDER"),
      };
    },
  );

  const uncoveredDomains = ruleDomains.filter(
    (domain) => !allRules.some((r) => r.domain === domain),
  );
  const placeholderOnlyDomains = byDomain
    .filter((d) => d.isPlaceholderOnly)
    .map((d) => d.domain);

  const gaps = identifyGaps(byDomain, memberStateCoverage, allRules);

  return {
    totalRules: allRules.length,
    evaluableRules: evaluableRules.length,
    byLifecycle,
    byDomain,
    memberStateCoverage,
    uncoveredDomains,
    placeholderOnlyDomains,
    gaps,
    classifiedCount,
    unclassifiedCount,
  };
}

function identifyGaps(
  domainCoverage: DomainCoverage[],
  memberStates: MemberStateCoverage[],
  allRules: Rule[],
): CoverageGap[] {
  const gaps: CoverageGap[] = [];

  for (const dc of domainCoverage) {
    if (dc.ruleCount === 0) {
      gaps.push({
        area: dc.domain,
        severity: "high",
        description: `Domain "${dc.domain}" has zero rules.`,
      });
    } else if (dc.isPlaceholderOnly) {
      gaps.push({
        area: dc.domain,
        severity: "medium",
        description: `Domain "${dc.domain}" has ${dc.ruleCount} rules but all are PLACEHOLDER.`,
      });
    }
  }

  const missingMemberStates = memberStates.filter((ms) => ms.ruleCount === 0);
  if (missingMemberStates.length > 0) {
    gaps.push({
      area: "member_state_coverage",
      severity: "medium",
      description: `${missingMemberStates.length} target member states have no overlay rules: ${missingMemberStates.map((ms) => ms.countryCode).join(", ")}.`,
    });
  }

  const stageDistribution = countByField(allRules, (r) => r.process_stage, processStages);
  for (const stage of processStages) {
    if (stageDistribution[stage] === 0) {
      gaps.push({
        area: `process_stage:${stage}`,
        severity: "medium",
        description: `Process stage "${stage}" has no rules assigned.`,
      });
    }
  }

  const jurisdictionDistribution = countByField(
    allRules,
    (r) => r.jurisdiction_level,
    jurisdictionLevels,
  );
  for (const level of jurisdictionLevels) {
    if (jurisdictionDistribution[level] === 0) {
      gaps.push({
        area: `jurisdiction:${level}`,
        severity: "low",
        description: `Jurisdiction level "${level}" has no rules.`,
      });
    }
  }

  return gaps.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
