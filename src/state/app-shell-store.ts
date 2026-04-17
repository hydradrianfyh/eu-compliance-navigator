"use client";

/**
 * Global app-shell store for UX Refactor v2 (Phase A).
 *
 * Responsibilities:
 *   1. Hold in-memory state previously owned by Phase3MainPage (config, rule
 *      statuses, notes, verification review, promotion log, session filters).
 *   2. Track cross-tab UI state new to v2 (lastActiveTab, onboardingDismissed).
 *   3. Wrap the existing legacy persistence helpers in src/config/persistence.ts
 *      so that both Phase3MainPage (legacy) and the new shell can read/write the
 *      same localStorage keys — zero data loss during the 7-week transition.
 *
 * Non-goals in this file:
 *   - Zustand persist middleware is intentionally NOT used. Persistence runs
 *     through the existing schema-validated helpers so the two renderers share
 *     a single source of truth per key. Phase G will remove the legacy shim.
 *   - SSR hydration. All consumers are expected to live inside "use client"
 *     components. Calling `hydrate()` from a client-side effect is mandatory
 *     before reading persisted slices.
 *
 * © Yanhao FU
 */

import { create } from "zustand";

import { defaultVehicleConfig } from "@/config/defaults";
import {
  clearPersistedPhase4AState,
  loadPersistedPromotionLog,
  loadPersistedRuleNotes,
  loadPersistedRuleStatuses,
  loadPersistedVehicleConfig,
  loadPersistedVerificationReviewState,
  persistPromotionLog,
  persistRuleNotes,
  persistRuleStatuses,
  persistVehicleConfig,
  persistVerificationReviewState,
} from "@/config/persistence";
import type {
  PromotionLog,
  RuleNotes,
  RuleStatuses,
  UserRuleStatus,
  VehicleConfig,
  VerificationReviewEntry,
  VerificationReviewState,
} from "@/config/schema";
import type { FreshnessStatus } from "@/registry/schema";
import { applicabilityResults } from "@/shared/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const TAB_IDS = ["setup", "status", "plan", "rules", "coverage"] as const;
export type TabId = (typeof TAB_IDS)[number];

export type ApplicabilityFilter = (typeof applicabilityResults)[number] | "all";
export type FreshnessFilter = FreshnessStatus | "all";

// Storage keys specific to v2. Legacy keys remain in src/config/persistence.ts.
export const LAST_ACTIVE_TAB_STORAGE_KEY = "evcn:last-active-tab";
export const ONBOARDING_DISMISSED_STORAGE_KEY = "evcn:onboarding-dismissed";

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

export interface AppShellState {
  /** Set to true after `hydrate()` successfully reads localStorage. */
  hydrated: boolean;

  /** Session-only filters (lost on reload). */
  searchTerm: string;
  applicabilityFilter: ApplicabilityFilter;
  freshnessFilter: FreshnessFilter;

  /** Persisted via legacy helpers in src/config/persistence.ts. */
  config: VehicleConfig;
  ruleStatuses: RuleStatuses;
  ruleNotes: RuleNotes;
  verificationReviewState: VerificationReviewState;
  promotionLog: PromotionLog;

  /** Persisted via v2-only localStorage keys defined above. */
  lastActiveTab: TabId;
  onboardingDismissed: boolean;

  // ---- Actions -----------------------------------------------------------

  /** Reads all persisted slices from localStorage. Idempotent. Client-only. */
  hydrate: () => void;

  /** Replace the entire vehicle config (e.g. when loading a sample project). */
  setConfig: (config: VehicleConfig) => void;
  /** Shallow-merge a partial patch into the current config. */
  patchConfig: (patch: Partial<VehicleConfig>) => void;

  /** Per-rule tracking writes. */
  setRuleStatus: (ruleId: string, status: UserRuleStatus) => void;
  setRuleNote: (ruleId: string, note: string) => void;

  /** Verification queue / promotion. */
  patchVerificationReview: (
    stableId: string,
    entry: VerificationReviewEntry,
  ) => void;
  setPromotionLog: (log: PromotionLog) => void;

  /** Filters (session only). */
  setSearchTerm: (term: string) => void;
  setApplicabilityFilter: (filter: ApplicabilityFilter) => void;
  setFreshnessFilter: (filter: FreshnessFilter) => void;

  /** Navigation + onboarding. */
  setLastActiveTab: (tab: TabId) => void;
  dismissOnboarding: () => void;
  resetOnboarding: () => void;

  /** Lifecycle: wipes every persisted slice and resets in-memory state. */
  clearSavedState: () => void;
}

// ---------------------------------------------------------------------------
// Persistence helpers for v2-only keys
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readLastActiveTab(): TabId | null {
  if (!isBrowser()) return null;
  const value = window.localStorage.getItem(LAST_ACTIVE_TAB_STORAGE_KEY);
  if (!value) return null;
  if ((TAB_IDS as readonly string[]).includes(value)) {
    return value as TabId;
  }
  return null;
}

export function writeLastActiveTab(tab: TabId) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LAST_ACTIVE_TAB_STORAGE_KEY, tab);
}

export function readOnboardingDismissed(): boolean {
  if (!isBrowser()) return false;
  return window.localStorage.getItem(ONBOARDING_DISMISSED_STORAGE_KEY) === "1";
}

export function writeOnboardingDismissed(dismissed: boolean) {
  if (!isBrowser()) return;
  if (dismissed) {
    window.localStorage.setItem(ONBOARDING_DISMISSED_STORAGE_KEY, "1");
  } else {
    window.localStorage.removeItem(ONBOARDING_DISMISSED_STORAGE_KEY);
  }
}

// ---------------------------------------------------------------------------
// Store factory (exported for tests that need isolated instances)
// ---------------------------------------------------------------------------

export function createAppShellStore() {
  return create<AppShellState>((set, get) => ({
    hydrated: false,
    searchTerm: "",
    applicabilityFilter: "all",
    freshnessFilter: "all",
    config: defaultVehicleConfig,
    ruleStatuses: {},
    ruleNotes: {},
    verificationReviewState: {},
    promotionLog: [],
    lastActiveTab: "setup",
    onboardingDismissed: false,

    hydrate: () => {
      if (!isBrowser()) return;
      if (get().hydrated) return;

      set({
        hydrated: true,
        config: loadPersistedVehicleConfig() ?? defaultVehicleConfig,
        ruleStatuses: loadPersistedRuleStatuses(),
        ruleNotes: loadPersistedRuleNotes(),
        verificationReviewState: loadPersistedVerificationReviewState(),
        promotionLog: loadPersistedPromotionLog(),
        lastActiveTab: readLastActiveTab() ?? "setup",
        onboardingDismissed: readOnboardingDismissed(),
      });
    },

    setConfig: (config) => {
      set({ config });
      persistVehicleConfig(config);
    },

    patchConfig: (patch) => {
      const next = { ...get().config, ...patch };
      set({ config: next });
      persistVehicleConfig(next);
    },

    setRuleStatus: (ruleId, status) => {
      const next = { ...get().ruleStatuses, [ruleId]: status };
      set({ ruleStatuses: next });
      persistRuleStatuses(next);
    },

    setRuleNote: (ruleId, note) => {
      const next = { ...get().ruleNotes, [ruleId]: note };
      set({ ruleNotes: next });
      persistRuleNotes(next);
    },

    patchVerificationReview: (stableId, entry) => {
      const next = { ...get().verificationReviewState, [stableId]: entry };
      set({ verificationReviewState: next });
      persistVerificationReviewState(next);
    },

    setPromotionLog: (log) => {
      set({ promotionLog: log });
      persistPromotionLog(log);
    },

    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setApplicabilityFilter: (applicabilityFilter) =>
      set({ applicabilityFilter }),
    setFreshnessFilter: (freshnessFilter) => set({ freshnessFilter }),

    setLastActiveTab: (tab) => {
      set({ lastActiveTab: tab });
      writeLastActiveTab(tab);
    },

    dismissOnboarding: () => {
      set({ onboardingDismissed: true });
      writeOnboardingDismissed(true);
    },

    resetOnboarding: () => {
      set({ onboardingDismissed: false });
      writeOnboardingDismissed(false);
    },

    clearSavedState: () => {
      clearPersistedPhase4AState();
      writeLastActiveTab("setup");
      writeOnboardingDismissed(false);
      set({
        config: defaultVehicleConfig,
        ruleStatuses: {},
        ruleNotes: {},
        verificationReviewState: {},
        promotionLog: [],
        lastActiveTab: "setup",
        onboardingDismissed: false,
        searchTerm: "",
        applicabilityFilter: "all",
        freshnessFilter: "all",
      });
    },
  }));
}

// ---------------------------------------------------------------------------
// Module-level singleton (the store the app uses at runtime)
// ---------------------------------------------------------------------------

export const useAppShellStore = createAppShellStore();

// ---------------------------------------------------------------------------
// Selector hooks — prefer these over consuming the whole state to minimize
// unnecessary re-renders.
// ---------------------------------------------------------------------------

export const useHydrated = () => useAppShellStore((s) => s.hydrated);
export const useConfig = () => useAppShellStore((s) => s.config);
export const useLastActiveTab = () =>
  useAppShellStore((s) => s.lastActiveTab);
export const useOnboardingDismissed = () =>
  useAppShellStore((s) => s.onboardingDismissed);
export const useRuleStatuses = () =>
  useAppShellStore((s) => s.ruleStatuses);
export const useRuleNotes = () => useAppShellStore((s) => s.ruleNotes);
export const useSessionFilters = () =>
  useAppShellStore((s) => ({
    searchTerm: s.searchTerm,
    applicabilityFilter: s.applicabilityFilter,
    freshnessFilter: s.freshnessFilter,
  }));
