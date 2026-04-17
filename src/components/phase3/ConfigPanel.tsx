"use client";

import type { Dispatch, SetStateAction } from "react";

import type { VehicleConfig } from "@/config/schema";
import {
  adasFeatureOptions,
  bodyTypeOptions,
  connectivityOptions,
  dataFlagOptions,
  frameworkDefinitions,
  targetCountryOptions,
} from "@/shared/constants";

interface ConfigPanelProps {
  title?: string;
  config: VehicleConfig;
  onChange: Dispatch<SetStateAction<VehicleConfig>>;
  onClearSavedState?: () => void;
}

function toggleArrayItem(array: string[], item: string): string[] {
  return array.includes(item)
    ? array.filter((existing) => existing !== item)
    : [...array, item];
}

export function ConfigPanel({
  title = "Configuration",
  config,
  onChange,
  onClearSavedState,
}: ConfigPanelProps) {
  const update = <K extends keyof VehicleConfig>(key: K, value: VehicleConfig[K]) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  const updateReadiness = (key: keyof VehicleConfig["readiness"], value: boolean) => {
    onChange((current) => ({
      ...current,
      readiness: { ...current.readiness, [key]: value },
    }));
  };

  const updateCharging = (
    key: keyof VehicleConfig["chargingCapability"],
    value: boolean,
  ) => {
    onChange((current) => ({
      ...current,
      chargingCapability: { ...current.chargingCapability, [key]: value },
    }));
  };

  const categoryOptions = config.frameworkGroup
    ? frameworkDefinitions[config.frameworkGroup].categories
    : [];

  const showBattery =
    config.powertrain !== null &&
    ["HEV", "PHEV", "BEV", "FCEV"].includes(config.powertrain);

  return (
    <aside className="sidebar panel">
      <h2>{title}</h2>

      <fieldset className="config-section">
        <legend>Project / Market</legend>
        <div className="form-grid">
          <label>
            <span>Project name</span>
            <input
              aria-label="Project name"
              value={config.projectName}
              onChange={(event) => update("projectName", event.target.value)}
            />
          </label>
          <label>
            <span>Vehicle code</span>
            <input
              value={config.vehicleCode}
              onChange={(event) => update("vehicleCode", event.target.value)}
            />
          </label>
          <label>
            <span>Consumer or fleet</span>
            <select
              value={config.consumerOrFleet}
              onChange={(event) =>
                update(
                  "consumerOrFleet",
                  event.target.value as VehicleConfig["consumerOrFleet"],
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
              onChange={(event) =>
                update(
                  "salesModel",
                  event.target.value as VehicleConfig["salesModel"],
                )
              }
            >
              <option value="dealer">Dealer</option>
              <option value="direct">Direct</option>
              <option value="leasing">Leasing</option>
              <option value="subscription">Subscription</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label>
            <span>SOP date</span>
            <input
              type="date"
              value={config.sopDate ?? ""}
              onChange={(event) => update("sopDate", event.target.value || null)}
            />
          </label>
          <label>
            <span>First registration date</span>
            <input
              type="date"
              value={config.firstRegistrationDate ?? ""}
              onChange={(event) =>
                update("firstRegistrationDate", event.target.value || null)
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

      <fieldset className="config-section">
        <legend>Vehicle</legend>
        <div className="form-grid">
          <label>
            <span>Framework group</span>
            <select
              aria-label="Framework group"
              value={config.frameworkGroup ?? ""}
              onChange={(event) =>
                update(
                  "frameworkGroup",
                  (event.target.value || null) as VehicleConfig["frameworkGroup"],
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
          <label>
            <span>Vehicle category</span>
            <select
              value={config.vehicleCategory ?? ""}
              onChange={(event) =>
                update("vehicleCategory", event.target.value || null)
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
              onChange={(event) => update("bodyType", event.target.value)}
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
              onChange={(event) =>
                update(
                  "approvalType",
                  event.target.value as VehicleConfig["approvalType"],
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
              onChange={(event) =>
                update(
                  "steeringPosition",
                  event.target.value as VehicleConfig["steeringPosition"],
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
              onChange={(event) =>
                update(
                  "completionState",
                  event.target.value as VehicleConfig["completionState"],
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

      <fieldset className="config-section">
        <legend>Powertrain / Battery</legend>
        <div className="form-grid">
          <label>
            <span>Powertrain</span>
            <select
              value={config.powertrain ?? ""}
              onChange={(event) =>
                update(
                  "powertrain",
                  (event.target.value || null) as VehicleConfig["powertrain"],
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
          {showBattery ? (
            <>
              <label>
                <span>Battery capacity band</span>
                <select
                  value={config.batteryCapacityBand ?? ""}
                  onChange={(event) =>
                    update(
                      "batteryCapacityBand",
                      (event.target.value || null) as VehicleConfig["batteryCapacityBand"],
                    )
                  }
                >
                  <option value="">Unspecified</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <div className="checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={config.chargingCapability.ac}
                    onChange={(event) => updateCharging("ac", event.target.checked)}
                  />
                  <span>AC charging</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={config.chargingCapability.dc}
                    onChange={(event) => updateCharging("dc", event.target.checked)}
                  />
                  <span>DC charging</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={config.chargingCapability.bidirectional}
                    onChange={(event) =>
                      updateCharging("bidirectional", event.target.checked)
                    }
                  />
                  <span>Bidirectional</span>
                </label>
              </div>
            </>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="config-section">
        <legend>Driving / Automation</legend>
        <div className="form-grid">
          <label>
            <span>Automation level</span>
            <select
              value={config.automationLevel}
              onChange={(event) =>
                update(
                  "automationLevel",
                  event.target.value as VehicleConfig["automationLevel"],
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
        </div>
        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={config.motorwayAssistant}
              onChange={(event) => update("motorwayAssistant", event.target.checked)}
            />
            <span>Motorway assistant</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.parkingAutomation}
              onChange={(event) => update("parkingAutomation", event.target.checked)}
            />
            <span>Parking automation</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.systemInitiatedLaneChange}
              onChange={(event) =>
                update("systemInitiatedLaneChange", event.target.checked)
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

      <fieldset className="config-section">
        <legend>Connectivity / Data</legend>
        <div className="multi-select-section">
          <span className="multi-select-label">Connectivity</span>
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
          <span className="multi-select-label">Data processing flags</span>
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
      </fieldset>

      <fieldset className="config-section">
        <legend>AI</legend>
        <div className="form-grid">
          <label>
            <span>AI level</span>
            <select
              value={config.aiLevel}
              onChange={(event) =>
                update("aiLevel", event.target.value as VehicleConfig["aiLevel"])
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
              onChange={(event) => update("aiInventoryExists", event.target.checked)}
            />
            <span>AI inventory exists</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="config-section">
        <legend>Readiness</legend>
        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={config.readiness.csmsAvailable}
              onChange={(event) => updateReadiness("csmsAvailable", event.target.checked)}
            />
            <span>CSMS available</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.sumsAvailable}
              onChange={(event) => updateReadiness("sumsAvailable", event.target.checked)}
            />
            <span>SUMS available</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.dpiaCompleted}
              onChange={(event) => updateReadiness("dpiaCompleted", event.target.checked)}
            />
            <span>DPIA completed</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.technicalDocStarted}
              onChange={(event) =>
                updateReadiness("technicalDocStarted", event.target.checked)
              }
            />
            <span>Technical doc started</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.evidenceOwnerAssigned}
              onChange={(event) =>
                updateReadiness("evidenceOwnerAssigned", event.target.checked)
              }
            />
            <span>Evidence owner assigned</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.readiness.registrationAssumptionsKnown}
              onChange={(event) =>
                updateReadiness("registrationAssumptionsKnown", event.target.checked)
              }
            />
            <span>Registration assumptions known</span>
          </label>
        </div>
      </fieldset>

      {onClearSavedState ? (
        <button type="button" className="secondary-button" onClick={onClearSavedState}>
          Clear saved state
        </button>
      ) : null}
    </aside>
  );
}
