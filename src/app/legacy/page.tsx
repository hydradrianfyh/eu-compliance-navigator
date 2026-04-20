"use client";

/**
 * Legacy all-in-one fallback route.
 *
 * Kept until Phase G to let users (and acceptance tests) still reach the
 * pre-refactor experience while the new 5-tab shell is being proven.
 *
 * © Yanhao FU
 */

import dynamic from "next/dynamic";

const Phase3MainPage = dynamic(
  () =>
    import("@/components/phase3/Phase3MainPage").then(
      (module) => module.Phase3MainPage,
    ),
  { ssr: false },
);

export default function LegacyPage() {
  return <Phase3MainPage />;
}
