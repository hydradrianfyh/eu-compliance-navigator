// @vitest-environment jsdom

/**
 * Phase A (A10) store tests.
 *
 * Covers: hydrate idempotence, persisted-slice round-trip via legacy keys,
 * v2-only lastActiveTab + onboarding dismiss round-trip, and clearSavedState
 * wipes everything.
 *
 * © Yanhao FU
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { defaultVehicleConfig } from "@/config/defaults";
import {
  CONFIG_STORAGE_KEY,
  RULE_NOTES_STORAGE_KEY,
  RULE_STATUSES_STORAGE_KEY,
  serializeRuleNotes,
  serializeRuleStatuses,
  serializeVehicleConfig,
} from "@/config/persistence";
import {
  LAST_ACTIVE_TAB_STORAGE_KEY,
  ONBOARDING_DISMISSED_STORAGE_KEY,
  createAppShellStore,
  readLastActiveTab,
  readOnboardingDismissed,
  writeLastActiveTab,
  writeOnboardingDismissed,
} from "@/state/app-shell-store";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("app-shell-store · hydration", () => {
  it("starts with default values before hydrate() is called", () => {
    const useStore = createAppShellStore();
    const state = useStore.getState();
    expect(state.hydrated).toBe(false);
    expect(state.config).toEqual(defaultVehicleConfig);
    expect(state.lastActiveTab).toBe("setup");
    expect(state.onboardingDismissed).toBe(false);
  });

  it("hydrates persisted VehicleConfig via legacy key", () => {
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      serializeVehicleConfig({
        ...defaultVehicleConfig,
        projectName: "Phase A test program",
      }),
    );

    const useStore = createAppShellStore();
    useStore.getState().hydrate();

    expect(useStore.getState().hydrated).toBe(true);
    expect(useStore.getState().config.projectName).toBe("Phase A test program");
  });

  it("hydrates rule statuses and notes via legacy keys", () => {
    window.localStorage.setItem(
      RULE_STATUSES_STORAGE_KEY,
      serializeRuleStatuses({ "REG-TA-001": "done" }),
    );
    window.localStorage.setItem(
      RULE_NOTES_STORAGE_KEY,
      serializeRuleNotes({ "REG-TA-001": "checked OJ" }),
    );

    const useStore = createAppShellStore();
    useStore.getState().hydrate();

    expect(useStore.getState().ruleStatuses).toEqual({ "REG-TA-001": "done" });
    expect(useStore.getState().ruleNotes).toEqual({
      "REG-TA-001": "checked OJ",
    });
  });

  it("is idempotent — second hydrate() re-reads localStorage fresh", () => {
    const useStore = createAppShellStore();
    useStore.getState().hydrate();
    expect(useStore.getState().config.projectName).toBe("");

    // Someone wrote to localStorage after the first hydrate.
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      serializeVehicleConfig({
        ...defaultVehicleConfig,
        projectName: "Updated",
      }),
    );

    useStore.getState().hydrate();
    expect(useStore.getState().config.projectName).toBe("Updated");
  });

  it("resets session filters on hydrate", () => {
    const useStore = createAppShellStore();
    useStore.setState({
      searchTerm: "leftover",
      applicabilityFilter: "APPLICABLE",
      freshnessFilter: "overdue",
    });

    useStore.getState().hydrate();

    expect(useStore.getState().searchTerm).toBe("");
    expect(useStore.getState().applicabilityFilter).toBe("all");
    expect(useStore.getState().freshnessFilter).toBe("all");
  });
});

describe("app-shell-store · actions persist to legacy keys", () => {
  it("setConfig writes to CONFIG_STORAGE_KEY", () => {
    const useStore = createAppShellStore();
    useStore.getState().setConfig({
      ...defaultVehicleConfig,
      projectName: "Written via store",
    });
    const persisted = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    expect(persisted).toContain("Written via store");
  });

  it("patchConfig merges partial without clobbering other fields", () => {
    const useStore = createAppShellStore();
    useStore.getState().setConfig({
      ...defaultVehicleConfig,
      projectName: "Base",
      vehicleCode: "KEEP-ME",
    });
    useStore.getState().patchConfig({ projectName: "Patched" });

    expect(useStore.getState().config.projectName).toBe("Patched");
    expect(useStore.getState().config.vehicleCode).toBe("KEEP-ME");
  });

  it("setRuleStatus writes to RULE_STATUSES_STORAGE_KEY", () => {
    const useStore = createAppShellStore();
    useStore.getState().setRuleStatus("REG-TA-001", "in_progress");
    expect(window.localStorage.getItem(RULE_STATUSES_STORAGE_KEY)).toContain(
      '"REG-TA-001":"in_progress"',
    );
  });

  it("setRuleNote writes to RULE_NOTES_STORAGE_KEY", () => {
    const useStore = createAppShellStore();
    useStore.getState().setRuleNote("REG-CS-001", "CSMS certified 2026-Q1");
    expect(window.localStorage.getItem(RULE_NOTES_STORAGE_KEY)).toContain(
      "CSMS certified 2026-Q1",
    );
  });
});

describe("app-shell-store · v2-only keys (lastActiveTab + onboarding)", () => {
  it("round-trips lastActiveTab through its helper", () => {
    expect(readLastActiveTab()).toBeNull();
    writeLastActiveTab("plan");
    expect(readLastActiveTab()).toBe("plan");
    expect(window.localStorage.getItem(LAST_ACTIVE_TAB_STORAGE_KEY)).toBe("plan");
  });

  it("rejects invalid tab ids in localStorage", () => {
    window.localStorage.setItem(LAST_ACTIVE_TAB_STORAGE_KEY, "not-a-tab");
    expect(readLastActiveTab()).toBeNull();
  });

  it("setLastActiveTab updates state AND localStorage", () => {
    const useStore = createAppShellStore();
    useStore.getState().setLastActiveTab("rules");
    expect(useStore.getState().lastActiveTab).toBe("rules");
    expect(window.localStorage.getItem(LAST_ACTIVE_TAB_STORAGE_KEY)).toBe("rules");
  });

  it("dismissOnboarding sets the persisted flag", () => {
    expect(readOnboardingDismissed()).toBe(false);
    const useStore = createAppShellStore();
    useStore.getState().dismissOnboarding();
    expect(useStore.getState().onboardingDismissed).toBe(true);
    expect(window.localStorage.getItem(ONBOARDING_DISMISSED_STORAGE_KEY)).toBe("1");
  });

  it("resetOnboarding clears the persisted flag", () => {
    writeOnboardingDismissed(true);
    const useStore = createAppShellStore();
    useStore.getState().resetOnboarding();
    expect(useStore.getState().onboardingDismissed).toBe(false);
    expect(window.localStorage.getItem(ONBOARDING_DISMISSED_STORAGE_KEY)).toBeNull();
  });
});

describe("app-shell-store · clearSavedState", () => {
  it("wipes every persisted slice and resets in-memory state", () => {
    // Preload every legacy + v2 key.
    window.localStorage.setItem(
      CONFIG_STORAGE_KEY,
      serializeVehicleConfig({
        ...defaultVehicleConfig,
        projectName: "To be cleared",
      }),
    );
    window.localStorage.setItem(
      RULE_STATUSES_STORAGE_KEY,
      serializeRuleStatuses({ "REG-TA-001": "done" }),
    );
    writeLastActiveTab("coverage");
    writeOnboardingDismissed(true);

    const useStore = createAppShellStore();
    useStore.getState().hydrate();
    expect(useStore.getState().config.projectName).toBe("To be cleared");
    expect(useStore.getState().lastActiveTab).toBe("coverage");
    expect(useStore.getState().onboardingDismissed).toBe(true);

    useStore.getState().clearSavedState();

    expect(window.localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(RULE_STATUSES_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(LAST_ACTIVE_TAB_STORAGE_KEY)).toBe("setup");
    expect(window.localStorage.getItem(ONBOARDING_DISMISSED_STORAGE_KEY)).toBeNull();
    expect(useStore.getState().config).toEqual(defaultVehicleConfig);
    expect(useStore.getState().lastActiveTab).toBe("setup");
    expect(useStore.getState().onboardingDismissed).toBe(false);
  });
});
