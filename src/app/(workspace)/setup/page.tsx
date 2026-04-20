"use client";

/**
 * Setup tab — vehicle program configuration.
 * Wires OnboardingBanner + SetupProgress + ConfigPanelV2 together.
 * Supports ?highlight=<fieldPath> to visually indicate which field the
 * user came from (e.g. a RuleCard "Missing input" deep link).
 *
 * © Yanhao FU
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ConfigPanelV2 } from "@/components/setup/ConfigPanelV2";
import { OnboardingBanner } from "@/components/setup/OnboardingBanner";
import { SetupProgress } from "@/components/setup/SetupProgress";

function SetupTabBody() {
  const searchParams = useSearchParams();
  const highlightField = searchParams.get("highlight") ?? undefined;

  return (
    <div className="setup-tab">
      <OnboardingBanner />
      <SetupProgress />
      <ConfigPanelV2 highlightField={highlightField} />
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <SetupTabBody />
    </Suspense>
  );
}
