import type { RuleNotes, RuleStatuses, VehicleConfig } from "@/config/schema";
import type { EvaluationResult } from "@/engine/types";

export interface ViewExportPayload {
  config: VehicleConfig;
  evaluatedResults: EvaluationResult[];
  userRuleStatuses: RuleStatuses;
  userRuleNotes: RuleNotes;
}

function escapeCsv(value: unknown): string {
  const normalized = String(value ?? "");
  const escaped = normalized.replace(/"/g, '""');

  return `"${escaped}"`;
}

export function buildViewExportPayload(
  config: VehicleConfig,
  evaluatedResults: EvaluationResult[],
  userRuleStatuses: RuleStatuses,
  userRuleNotes: RuleNotes,
): ViewExportPayload {
  return {
    config,
    evaluatedResults,
    userRuleStatuses,
    userRuleNotes,
  };
}

export function buildViewExportJsonBlob(payload: ViewExportPayload): Blob {
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
}

export function buildViewExportCsvBlob(payload: ViewExportPayload): Blob {
  const header = [
    "rule_id",
    "title",
    "applicability",
    "lifecycle_state",
    "explanation",
    "owner_hint",
    "user_status",
    "user_note",
    "config_json",
  ];

  const configJson = JSON.stringify(payload.config);
  const rows = payload.evaluatedResults.map((result) =>
    [
      result.rule_id,
      result.title,
      result.applicability,
      result.lifecycle_state,
      result.explanation,
      result.owner_hint,
      payload.userRuleStatuses[result.rule_id] ?? "todo",
      payload.userRuleNotes[result.rule_id] ?? "",
      configJson,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new Blob([[header.join(","), ...rows].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
}
