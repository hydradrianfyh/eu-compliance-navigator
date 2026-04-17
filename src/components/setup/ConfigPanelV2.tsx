"use client";

/**
 * ConfigPanelV2 — six-section primary configuration panel for the Setup tab.
 *
 * Sections (per UX Refactor v2 spec §4):
 *   1. Program & Market
 *   2. Homologation Basis
 *   3. Propulsion & Energy      — includes braking.type for EV
 *   4. ADAS & Automated Driving — includes lighting.headlampType
 *   5. Digital & Cockpit        — connectivity + data + AI + HMI (merged)
 *   6. Readiness
 *
 * Advanced vehicle systems (collapsible) rendered after the primary six.
 *
 * © Yanhao FU
 */

import { advancedSectionDefaults } from "@/config/defaults";
import type { VehicleConfig } from "@/config/schema";
import {
  adasFeatureOptions,
  bodyTypeOptions,
  brakingTypes,
  connectivityOptions,
  dataFlagOptions,
  frameworkDefinitions,
  headlampTypes,
  targetCountryOptions,
} from "@/shared/constants";
import { AdvancedSystemsSection } from "@/components/setup/AdvancedSystemsSection";
import { OptionalSection } from "@/components/setup/OptionalSection";
import { useAppShellStore } from "@/state/app-shell-store";

function toggleArrayItem(array: string[], item: string): string[] {
  return array.includes(item)
    ? array.filter((existing) => existing !== item)
    : [...array, item];
}

interface ConfigPanelV2Props {
  highlightField?: string;
}

export function ConfigPanelV2({ highlightField }: ConfigPanelV2Props) {
  const config = useAppShellStore((state) => state.config);
  const patchConfig = useAppShellStore((state) => state.patchConfig);

  const update = <K extends keyof VehicleConfig>(
    key: K,
    value: VehicleConfig[K],
  ) => patchConfig({ [key]: value } as Partial<VehicleConfig>);

  const updateReadiness = (
    key: keyof VehicleConfig["readiness"],
    value: boolean,
  ) => patchConfig({ readiness: { ...config.readiness, [key]: value } });

  const updateCharging = (
    key: keyof VehicleConfig["chargingCapability"],
    value: boolean,
  ) =>
    patchConfig({
      chargingCapability: { ...config.chargingCapability, [key]: value },
    });

  const categoryOptions = config.frameworkGroup
    ? frameworkDefinitions[config.frameworkGroup].categories
    : [];

  const isBatteryPowertrain =
    config.powertrain !== null &&
    ["HEV", "PHEV", "BEV", "FCEV"].includes(config.powertrain);

  const isHighlighted = (field: string) =>
    highlightField === field ? "highlighted" : "";

  return (
    <aside className="sidebar panel config-panel-v2">
      <h2>Configuration</h2>

      {/* ------------------------------------------------------------------
       * 1. Program & Market
       * ------------------------------------------------------------------ */}
      <fieldset className="config-section">
        <legend>
          <span>1. Program &amp; Market</span>
          <span className="config-section-caption">Who, where, and when</span>
        </legend>
        <div className="form-grid">
          <label className={isHighlighted("projectName")}>
            <span>Project name</span>
            <input
              aria-label="Project name"
              value={config.projectName}
              onChange={(e) => update("projectName", e.target.value)}
            />
          </label>
          <label>
            <span>Vehicle code</span>
            <input
              value={config.vehicleCode}
              onChange={(e) => update("vehicleCode", e.target.value)}
            />
          </label>
          <label>
            <span>Consumer or fleet</span>
            <select
              value={config.consumerOrFleet}
              onChange={(e) =>
                update(
                  "consumerOrFleet",
                  e.target.value as VehicleConfig["consumerOrFleet"],
                )
              }
            >
              <option value="consumer">Consumer</option>
              <option value="fleet">Fleet</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label>
            <span>Sales model</span>
            <select
              value={config.salesModel}
              onChange={(e) =>
                update("salesModel", e.target.value as VehicleConfig["salesModel"])
              }
            >
              <option value="dealer">Dealer</option>
              <option value="direct">Direct</option>
              <option value="leasing">Leasing</option>
              <option value="subscription">Subscription</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className={isHighlighted("sopDate")}>
            <span>SOP date</span>
            <input
              type="date"
              value={config.sopDate ?? ""}
              onChange={(e) => update("sopDate", e.target.value || null)}
            />
          </label>
          <label>
            <span>First registration date</span>
            <input
              type="date"
              value={config.firstRegistrationDate ?? ""}
              onChange={(e) =>
                update("firstRegistrationDate", e.target.value || null)
              }
            />
          </label>
        </div>
        <div className="multi-select-section">
          <span className="multi-select-label">Target countries — EU</span>
          <div className="checkbox-grid">
            {targetCountryOptions.eu.map((country) => (
              <label key={country.code}>
                <input
                  type="checkbox"
                  checked={config.targetCountries.includes(country.code)}
                  onChange={() =>
                    update(
                      "targetCountries",
                      toggleArrayItem(config.targetCountries, country.code),
                    )
                  }
                />
                <span>
                  {country.code} {country.label}
                </span>
              </label>
            ))}
          </div>
          <span className="multi-select-label">Target countries — Non-EU</span>
          <div className="checkbox-grid">
            {targetCountryOptions.nonEu.map((country) => (
              <label key={country.code}>
                <input
                  type="checkbox"
                  checked={config.targetCountries.includes(country.code)}
                  onChange={() =>
                    update(
                      "targetCountries",
                      toggleArrayItem(config.targetCountries, country.code),
                    )
                  }
                />
                <span>
                  {country.code} {country.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------
       * 2. Homologation Basis
       * ------------------------------------------------------------------ */}
      <fieldset className="config-section">
        <legend>
          <span>2. Homologation Basis</span>
          <span className="config-section-caption">
            How the vehicle gets type-approved
          </span>
        </legend>
        <div className="form-grid">
          <label className={isHighlighted("frameworkGroup")}>
            <span>Framework group</span>
            <select
              aria-label="Framework group"
              value={config.frameworkGroup ?? ""}
              onChange={(e) =>
                update(
                  "frameworkGroup",
                  (e.target.value || null) as VehicleConfig["frameworkGroup"],
                )
              }
            >
              <option value="">Unspecified</option>
              <option value="MN">MN — Cars, trucks, buses</option>
              <option value="L">L — Two/three-wheelers</option>
              <option value="O">O — Trailers</option>
              <option value="AGRI">AGRI — Agricultural</option>
            </select>
          </label>
          <label className={isHighlighted("vehicleCategory")}>
            <span>Vehicle category</span>
            <select
              value={config.vehicleCategory ?? ""}
              onChange={(e) =>
                update("vehicleCategory", e.target.value || null)
              }
            >
              <option value="">Unspecified</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Body type</span>
            <select
              value={config.bodyType}
              onChange={(e) => update("bodyType", e.target.value)}
            >
              <option value="">Unspecified</option>
              {bodyTypeOptions.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Approval type</span>
            <select
              value={config.approvalType}
              onChange={(e) =>
                update(
                  "approvalType",
                  e.target.value as VehicleConfig["approvalType"],
                )
              }
            >
              <option value="new_type">New type</option>
              <option value="carry_over">Carry over</option>
              <option value="facelift">Facelift</option>
              <option value="major_update">Major update</option>
            </select>
          </label>
          <label>
            <span>Steering position</span>
            <select
              value={config.steeringPosition}
              onChange={(e) =>
                update(
                  "steeringPosition",
                  e.target.value as VehicleConfig["steeringPosition"],
                )
              }
            >
              <option value="LHD">LHD</option>
              <option value="RHD">RHD</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label>
            <span>Completion state</span>
            <select
              value={config.completionState}
              onChange={(e) =>
                update(
                  "completionState",
                  e.target.value as VehicleConfig["completionState"],
                )
              }
            >
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="multi_stage">Multi-stage</option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------
       * 3. Propulsion & Energy (incl. braking.type for EV)
       * ------------------------------------------------------------------ */}
      <fieldset className="config-section">
        <legend>
          <span>3. Propulsion &amp; Energy</span>
          <span className="config-section-caption">Powertrain architecture</span>
        </legend>
        <div className="form-grid">
          <label className={isHighlighted("powertrain")}>
            <span>Powertrain</span>
            <select
              value={config.powertrain ?? ""}
              onChange={(e) =>
                update(
                  "powertrain",
                  (e.target.value || null) as VehicleConfig["powertrain"],
                )
              }
            >
              <option value="">Unspecified</option>
              <option value="ICE">ICE</option>
              <option value="HEV">HEV</option>
              <option value="PHEV">PHEV</option>
              <option value="BEV">BEV</option>
              <option value="FCEV">FCEV</option>
            </select>
          </label>
          {isBatteryPowertrain ? (
            <>
              <label>
                <span>Battery capacity band</span>
                <select
                  value={config.batteryCapacityBand ?? ""}
                  onChange={(e) =>
                    update(
                      "batteryCapacityBand",
                      (e.target.value ||
                        null) as VehicleConfig["batteryCapacityBand"],
                    )
                  }
                >
                  <option value="">Unspecified</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label className={isHighlighted("braking.type")}>
                <span>Braking type (EV-relevant)</span>
                <select
                  value={config.braking?.type ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value) {
                      patchConfig({ braking: undefined });
                      return;
                    }
                    patchConfig({
                      braking: {
                        ...(config.braking ?? advancedSectionDefaults.braking),
                        type: value as (typeof brakingTypes)[number],
                      },
                    });
                  }}
                >
                  <option value="">Unspecified</option>
                  {brakingTypes.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </div>
        {isBatteryPowertrain ? (
          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={config.chargingCapability.ac}
                onChange={(e) => updateCharging("ac", e.target.checked)}
              />
              <span>AC charging</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.chargingCapability.dc}
                onChange={(e) => updateCharging("dc", e.target.checked)}
              />
              <span>DC charging</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.chargingCapability.bidirectional}
                onChange={(e) =>
                  updateCharging("bidirectional", e.target.checked)
                }
              />
              <span>Bidirectional</span>
            </label>
          </div>
        ) : null}
      </fieldset>

      {/* ------------------------------------------------------------------
       * 4. ADAS & Automated Driving (incl. lighting.headlampType)
       * ------------------------------------------------------------------ */}
      <fieldset className="config-section">
        <legend>
          <span>4. ADAS &amp; Automated Driving</span>
          <span className="config-section-caption">
            Driver assistance and autonomy level
          </span>
        </legend>
        <div className="form-grid">
          <label>
            <span>Automation level</span>
            <select
              value={config.automationLevel}
              onChange={(e) =>
                update(
                  "automationLevel",
                  e.target.value as VehicleConfig["automationLevel"],
                )
              }
            >
              <option value="none">None</option>
              <option value="basic_adas">Basic ADAS</option>
              <option value="l2">L2</option>
              <option value="l2plus">L2+</option>
              <option value="l3">L3</option>
              <option value="l4">L4</option>
              <option value="l4_driverless">L4 Driverless</option>
            </select>
          </label>
          <label className={isHighlighted("lighting.headlampType")}>
            <span>Headlamp type</span>
            <select
              value={config.lighting?.headlampType ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  patchConfig({ lighting: undefined });
                  return;
                }
                patchConfig({
                  lighting: {
                    ...(config.lighting ?? advancedSectionDefaults.lighting),
                    headlampType: value as (typeof headlampTypes)[number],
                  },
                });
              }}
            >
              <option value="">Unspecified</option>
              {headlampTypes.map((value) => (
                <option key={value} value={value}>
                  {value.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={config.motorwayAssistant}
              onChange={(e) => update("motorwayAssistant", e.target.checked)}
            />
            <span>Motorway assistant</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.parkingAutomation}
              onChange={(e) => update("parkingAutomation", e.target.checked)}
            />
            <span>Parking automation</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.systemInitiatedLaneChange}
              onChange={(e) =>
                update("systemInitiatedLaneChange", e.target.checked)
              }
            />
            <span>System-initiated lane change</span>
          </label>
        </div>
        <div className="multi-select-section">
          <span className="multi-select-label">ADAS features</span>
          <div className="checkbox-grid">
            {adasFeatureOptions.map((feature) => (
              <label key={feature.value}>
                <input
                  type="checkbox"
                  checked={config.adasFeatures.includes(feature.value)}
                  onChange={() =>
                    update(
                      "adasFeatures",
                      toggleArrayItem(config.adasFeatures, feature.value),
                    )
                  }
                />
                <span>{feature.label}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------
       * 5. Digital & Cockpit (merged: connectivity + data + AI + HMI)
       * ------------------------------------------------------------------ */}
      <fieldset className="config-section">
        <legend>
          <span>5. Digital &amp; Cockpit</span>
          <span className="config-section-caption">
            Software, connectivity, data, AI, and HMI
          </span>
        </legend>

        <div className="sub-block">
          <h4 className="sub-block-title">Connectivity</h4>
          <div className="checkbox-grid">
            {connectivityOptions.map((opt) => (
              <label key={opt.value}>
                <input
                  type="checkbox"
                  checked={config.connectivity.includes(opt.value)}
                  onChange={() =>
                    update(
                      "connectivity",
                      toggleArrayItem(config.connectivity, opt.value),
                    )
                  }
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sub-block">
          <h4 className="sub-block-title">Data processing</h4>
          <div className="checkbox-grid">
            {dataFlagOptions.map((opt) => (
              <label key={opt.value}>
                <input
                  type="checkbox"
                  checked={config.dataFlags.includes(opt.value)}
                  onChange={() =>
                    update("dataFlags", toggleArrayItem(config.dataFlags, opt.value))
                  }
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sub-block">
          <h4 className="sub-block-title">AI</h4>
          <div className="form-grid">
            <label>
              <span>AI level</span>
              <select
                value={config.aiLevel}
                onChange={(e) =>
                  update("aiLevel", e.target.value as VehicleConfig["aiLevel"])
                }
              >
                <option value="none">None</option>
                <option value="conventional">Conventional</option>
                <option value="ai_perception">AI perception</option>
                <option value="ai_dms">AI DMS</option>
                <option value="ai_analytics">AI analytics</option>
                <option value="ai_safety">AI safety</option>
                <option value="foundation_model">Foundation model</option>
              </select>
            </label>
          </div>
          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={config.aiInventoryExists}
                onChange={(e) => update("aiInventoryExists", e.target.checked)}
              />
              <span>AI inventory exists</span>
            </label>
          </div>
        </div>

        <div className="sub-block">
          <h4 className="sub-block-title">HMI</h4>
          <OptionalSection
            title="HMI"
            hint="Primary human-machine interface detail."
            populated={config.hmi !== undefined}
            onEnable={() =>
              patchConfig({ hmi: { ...advancedSectionDefaults.hmi } })
            }
            onClear={() => patchConfig({ hmi: undefined })}
          >
            <label>
              <input
                type="checkbox"
                checked={config.hmi?.touchscreenPrimary ?? false}
                onChange={(e) =>
                  patchConfig({
                    hmi: config.hmi && {
                      ...config.hmi,
                      touchscreenPrimary: e.target.checked,
                    },
                  })
                }
              />
              <span>Primary HMI is a touchscreen</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={config.hmi?.voiceControl ?? false}
                onChange={(e) =>
                  patchConfig({
                    hmi: config.hmi && {
                      ...config.hmi,
                      voiceControl: e.target.checked,
                    },
                  })
                }
              />
              <span>Voice control available</span>
            </label>
          </OptionalSection>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------
       * 6. Readiness
       * ------------------------------------------------------------------ */}
      <fieldset className="config-section">
        <legend>
          <span>6. Readiness</span>
          <span className="config-section-caption">
            What you have already prepared
          </span>
        </legend>
        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={config.readiness.csmsAvailable}
              onChange={(e) => updateReadiness("csmsAvailable", e.target.checked)}
            />
            <span>CSMS available</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.sumsAvailable}
              onChange={(e) => updateReadiness("sumsAvailable", e.target.checked)}
            />
            <span>SUMS available</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.dpiaCompleted}
              onChange={(e) => updateReadiness("dpiaCompleted", e.target.checked)}
            />
            <span>DPIA completed</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.technicalDocStarted}
              onChange={(e) =>
                updateReadiness("technicalDocStarted", e.target.checked)
              }
            />
            <span>Technical doc started</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.evidenceOwnerAssigned}
              onChange={(e) =>
                updateReadiness("evidenceOwnerAssigned", e.target.checked)
              }
            />
            <span>Evidence owner assigned</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.registrationAssumptionsKnown}
              onChange={(e) =>
                updateReadiness("registrationAssumptionsKnown", e.target.checked)
              }
            />
            <span>Registration assumptions known</span>
          </label>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------------
       * Advanced vehicle systems (collapsed by default)
       * ------------------------------------------------------------------ */}
      <AdvancedSystemsSection
        config={config}
        onChange={patchConfig}
        highlightField={highlightField}
      />
    </aside>
  );
}
