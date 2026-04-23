"use client";

/**
 * Root redirect.
 *
 * First visit (no localStorage) → /intro/{lang} (management briefing)
 * Returning visit → the tab the user was last on (lastActiveTab)
 *
 * Vercel's Clean URLs serves public/intro/zh.html at /intro/zh (no .html).
 *
 * The redirect must happen after client-side hydration because
 * localStorage and navigator.language are not available during SSR.
 *
 * © Yanhao FU
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { readLastActiveTab } from "@/state/app-shell-store";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const lastTab = readLastActiveTab();
    if (lastTab) {
      router.replace(`/${lastTab}`);
      return;
    }
    const prefersZh = navigator.language.toLowerCase().startsWith("zh");
    window.location.href = `/intro/${prefersZh ? "zh" : "en"}`;
  }, [router]);

  return (
    <div className="root-redirect-splash" role="status" aria-live="polite">
      <p>Loading EU Compliance Navigator…</p>
    </div>
  );
}
