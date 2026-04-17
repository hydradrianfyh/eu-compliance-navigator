import { describe, expect, it } from "vitest";

import { RuleRegistry } from "@/registry/registry";
import { allSeedRules } from "@/registry/seed";

describe("RuleRegistry", () => {
  it("excludes PLACEHOLDER and ARCHIVED rules from evaluable queries", () => {
    const registry = new RuleRegistry(allSeedRules);

    const evaluableRules = registry.getEvaluableRules();

    expect(evaluableRules.every((rule) => rule.lifecycle_state !== "PLACEHOLDER")).toBe(true);
    expect(evaluableRules.every((rule) => rule.lifecycle_state !== "ARCHIVED")).toBe(true);
  });

  it("can query rules by legal family", () => {
    const registry = new RuleRegistry(allSeedRules);

    const rules = registry.getRulesByFamily("cybersecurity");

    expect(rules.map((rule) => rule.stable_id)).toEqual([
      "REG-CS-001",
      "REG-CS-002",
      "REG-CS-003",
    ]);
  });
});
