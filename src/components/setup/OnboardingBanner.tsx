"use client";

/**
 * OnboardingBanner — first-visit guidance with a one-click sample loader.
 *
 * Appears only on the Setup tab, only when `onboardingDismissed` is false.
 * Dismissal is persisted (via the store). "Load sample" fills the pilot
 * config and routes the user to /status so they see the end-to-end flow.
 *
 * © Yanhao FU
 */

import { useRouter } from "next/navigation";

import { pilotMY2027BEV } from "../../../fixtures/pilot-my2027-bev";
import { useAppShellStore } from "@/state/app-shell-store";

export function OnboardingBanner() {
  const router = useRouter();
  const onboardingDismissed = useAppShellStore(
    (state) => state.onboardingDismissed,
  );
  const dismissOnboarding = useAppShellStore(
    (state) => state.dismissOnboarding,
  );
  const setConfig = useAppShellStore((state) => state.setConfig);

  if (onboardingDismissed) return null;

  const handleLoadSample = () => {
    setConfig(pilotMY2027BEV);
    dismissOnboarding();
    router.push("/status");
  };

  const handleStartBlank = () => {
    dismissOnboarding();
  };

  return (
    <section className="onboarding-banner panel" role="region">
      <div className="onboarding-banner-body">
        <h3 className="onboarding-banner-title">
          Welcome — 4 steps to know whether your program can enter the EU
        </h3>
        <ol className="onboarding-banner-steps">
          <li>Fill in your vehicle program below.</li>
          <li>Check the Status tab for market-entry readiness.</li>
          <li>Use Plan for month-by-month tasks and owners.</li>
          <li>Drill into Rules for legal evidence.</li>
        </ol>
      </div>
      <div className="onboarding-banner-actions">
        <button
          type="button"
          className="primary-button"
          onClick={handleLoadSample}
        >
          Load MY2027 BEV sample
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={handleStartBlank}
        >
          Start blank
        </button>
      </div>
      <button
        type="button"
        className="onboarding-banner-dismiss"
        aria-label="Dismiss onboarding"
        onClick={dismissOnboarding}
      >
        ×
      </button>
    </section>
  );
}
