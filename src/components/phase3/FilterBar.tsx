"use client";

import type { FreshnessStatus } from "@/registry/schema";
import { freshnessStatuses } from "@/registry/schema";
import { applicabilityResults } from "@/shared/constants";

export type FreshnessFilter = FreshnessStatus | "all";

interface FilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  applicabilityFilter: (typeof applicabilityResults)[number] | "all";
  onApplicabilityFilterChange: (
    value: (typeof applicabilityResults)[number] | "all",
  ) => void;
  freshnessFilter: FreshnessFilter;
  onFreshnessFilterChange: (value: FreshnessFilter) => void;
  groupMode: "legal_family" | "ui_package";
  onGroupModeChange: (value: "legal_family" | "ui_package") => void;
}

const groupModes = ["legal_family", "ui_package"] as const;

const freshnessLabels: Record<FreshnessStatus, string> = {
  fresh: "Fresh",
  due_soon: "Review due soon",
  overdue: "Overdue",
  critically_overdue: "Critical",
  never_verified: "Never verified",
};

function isApplicabilityFilter(
  value: string,
): value is (typeof applicabilityResults)[number] | "all" {
  return value === "all" || applicabilityResults.includes(value as (typeof applicabilityResults)[number]);
}

function isFreshnessFilter(value: string): value is FreshnessFilter {
  return (
    value === "all" ||
    (freshnessStatuses as readonly string[]).includes(value)
  );
}

function isGroupMode(value: string): value is "legal_family" | "ui_package" {
  return groupModes.includes(value as "legal_family" | "ui_package");
}

export function FilterBar({
  searchTerm,
  onSearchTermChange,
  applicabilityFilter,
  onApplicabilityFilterChange,
  freshnessFilter,
  onFreshnessFilterChange,
  groupMode,
  onGroupModeChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <label>
        <span>Search rules</span>
        <input
          aria-label="Search rules"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
      </label>
      <label>
        <span>Applicability</span>
        <select
          value={applicabilityFilter}
          onChange={(event) => {
            if (isApplicabilityFilter(event.target.value)) {
              onApplicabilityFilterChange(event.target.value);
            }
          }}
        >
          <option value="all">all</option>
          {applicabilityResults.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Freshness</span>
        <select
          aria-label="Freshness"
          value={freshnessFilter}
          onChange={(event) => {
            if (isFreshnessFilter(event.target.value)) {
              onFreshnessFilterChange(event.target.value);
            }
          }}
        >
          <option value="all">All</option>
          {freshnessStatuses.map((status) => (
            <option key={status} value={status}>
              {freshnessLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Group by</span>
        <select
          value={groupMode}
          onChange={(event) => {
            if (isGroupMode(event.target.value)) {
              onGroupModeChange(event.target.value);
            }
          }}
        >
          <option value="legal_family">legal_family</option>
          <option value="ui_package">ui_package</option>
        </select>
      </label>
    </div>
  );
}
