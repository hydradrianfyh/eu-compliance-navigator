"use client";

/**
 * AdvancedSystemsSection — collapsible container for the five net-new
 * homologation-detail sub-forms: Braking, Steering, Cabin, Lighting, Fuel.
 *
 * Default collapsed so first-time users are not overwhelmed. Opens
 * automatically if `highlightField` targets a field in any of its sub-forms
 * (cross-tab RuleCard → Setup highlight, Q7 in the locked spec).
 *
 * © Yanhao FU
 */

import { useState } from "react";

import { advancedSectionDefaults } from "@/config/defaults";
import type { VehicleConfig } from "@/config/schema";
import { OptionalSection } from "@/components/setup/OptionalSection";
import {
  brakingTypes,
  fuelTypes,
  headlampTypes,
  steeringTypes,
} from "@/shared/constants";

interface AdvancedSystemsSectionProps {
  config: VehicleConfig;
  onChange: (patch: Partial<VehicleConfig>) => void;
  highlightField?: string;
}

const ADVANCED_FIELD_IDS = new Set([
  "braking.type",
  "braking.absFitted",
  "braking.espFitted",
  "steering.type",
  "steering.eps",
  "cabin.airbagCount",
  "cabin.isofixAnchors",
  "cabin.seatbeltReminder",
  "lighting.headlampType",
  "lighting.avas",
  "fuel.tankType",
]);

export function AdvancedSystemsSection({
  config,
  onChange,
  highlightField,
}: AdvancedSystemsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [lastHighlight, setLastHighlight] = useState<string | undefined>(
    undefined,
  );

  // Auto-expand when an Advanced-field highlight arrives (e.g. a Rules-tab
  // deep link). This is setState-during-render gated on prop change, which
  // React 19 supports and avoids useEffect's re-render penalty.
  if (highlightField !== lastHighlight) {
    setLastHighlight(highlightField);
    if (highlightField && ADVANCED_FIELD_IDS.has(highlightField)) {
      setExpanded(true);
    }
  }

  const isHighlighted = (field: string) => highlightField === field;

  return (
    <fieldset className="config-section advanced-section">
      <legend>
        <button
          type="button"
          className="advanced-section-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
          Advanced vehicle systems
        </button>
      </legend>
      {expanded ? (
        <>
          <p className="advanced-section-hint">
            Detail for homologation engineers. Leave collapsed for a first-pass
            scan.
          </p>

          {/* Braking (ABS/ESP; braking.type lives in Propulsion for EV) */}
          <OptionalSection
            title="Braking"
            hint="ABS and ESP fitment."
            populated={config.braking !== undefined}
            onEnable={() =>
              onChange({
                braking: { ...advancedSectionDefaults.braking },
              })
            }
            onClear={() => onChange({ braking: undefined })}
          >
            <label>
              <input
                type="checkbox"
                checked={config.braking?.absFitted ?? false}
                className={isHighlighted("braking.absFitted") ? "highlighted" : ""}
                onChange={(event) =>
                  onChange({
                    braking: config.braking && {
                      ...config.braking,
                      absFitted: event.target.checked,
                    },
                  })
                }
              />
              <span>ABS fitted</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.braking?.espFitted ?? false}
                className={isHighlighted("braking.espFitted") ? "highlighted" : ""}
                onChange={(event) =>
                  onChange({
                    braking: config.braking && {
                      ...config.braking,
                      espFitted: event.target.checked,
                    },
                  })
                }
              />
              <span>ESP fitted</span>
            </label>
          </OptionalSection>

          {/* Steering */}
          <OptionalSection
            title="Steering"
            hint="Steering technology stack."
            populated={config.steering !== undefined}
            onEnable={() =>
              onChange({ steering: { ...advancedSectionDefaults.steering } })
            }
            onClear={() => onChange({ steering: undefined })}
          >
            <label>
              <span>Steering type</span>
              <select
                value={config.steering?.type ?? "electric"}
                onChange={(event) =>
                  onChange({
                    steering: config.steering && {
                      ...config.steering,
                      type: event.target.value as (typeof steeringTypes)[number],
                    },
                  })
                }
              >
                {steeringTypes.map((value) => (
                  <option key={value} value={value}>
                    {value.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.steering?.eps ?? false}
                onChange={(event) =>
                  onChange({
                    steering: config.steering && {
                      ...config.steering,
                      eps: event.target.checked,
                    },
                  })
                }
              />
              <span>Electric power steering (EPS)</span>
            </label>
          </OptionalSection>

          {/* Cabin */}
          <OptionalSection
            title="Cabin"
            hint="Occupant safety detail."
            populated={config.cabin !== undefined}
            onEnable={() =>
              onChange({ cabin: { ...advancedSectionDefaults.cabin } })
            }
            onClear={() => onChange({ cabin: undefined })}
          >
            <label>
              <span>Airbag count</span>
              <input
                type="number"
                min={0}
                value={config.cabin?.airbagCount ?? 0}
                onChange={(event) =>
                  onChange({
                    cabin: config.cabin && {
                      ...config.cabin,
                      airbagCount: Number.parseInt(event.target.value, 10) || 0,
                    },
                  })
                }
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.cabin?.isofixAnchors ?? false}
                onChange={(event) =>
                  onChange({
                    cabin: config.cabin && {
                      ...config.cabin,
                      isofixAnchors: event.target.checked,
                    },
                  })
                }
              />
              <span>ISOFIX anchors</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.cabin?.seatbeltReminder ?? false}
                onChange={(event) =>
                  onChange({
                    cabin: config.cabin && {
                      ...config.cabin,
                      seatbeltReminder: event.target.checked,
                    },
                  })
                }
              />
              <span>Seatbelt reminder</span>
            </label>
          </OptionalSection>

          {/* Lighting (non-Matrix details; headlampType lives in ADAS) */}
          <OptionalSection
            title="Lighting"
            hint="AVAS and additional lighting detail (headlamp type is in ADAS)."
            populated={config.lighting !== undefined}
            onEnable={() =>
              onChange({ lighting: { ...advancedSectionDefaults.lighting } })
            }
            onClear={() => onChange({ lighting: undefined })}
          >
            <label>
              <span>Headlamp type (mirror of ADAS)</span>
              <select
                value={config.lighting?.headlampType ?? "led"}
                onChange={(event) =>
                  onChange({
                    lighting: config.lighting && {
                      ...config.lighting,
                      headlampType: event.target
                        .value as (typeof headlampTypes)[number],
                    },
                  })
                }
              >
                {headlampTypes.map((value) => (
                  <option key={value} value={value}>
                    {value.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.lighting?.avas ?? false}
                onChange={(event) =>
                  onChange({
                    lighting: config.lighting && {
                      ...config.lighting,
                      avas: event.target.checked,
                    },
                  })
                }
              />
              <span>AVAS (Acoustic Vehicle Alerting System)</span>
            </label>
          </OptionalSection>

          {/* Fuel */}
          <OptionalSection
            title="Fuel"
            hint="Fuel storage detail (set to `none` for BEV)."
            populated={config.fuel !== undefined}
            onEnable={() =>
              onChange({ fuel: { ...advancedSectionDefaults.fuel } })
            }
            onClear={() => onChange({ fuel: undefined })}
          >
            <label>
              <span>Tank type</span>
              <select
                value={config.fuel?.tankType ?? "none"}
                onChange={(event) =>
                  onChange({
                    fuel: config.fuel && {
                      ...config.fuel,
                      tankType: event.target.value as (typeof fuelTypes)[number],
                    },
                  })
                }
              >
                {fuelTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </OptionalSection>
        </>
      ) : null}
    </fieldset>
  );
}

// Exported for router-level "/setup?highlight=X" to confirm a field exists.
export function isAdvancedField(field: string): boolean {
  return ADVANCED_FIELD_IDS.has(field);
}
