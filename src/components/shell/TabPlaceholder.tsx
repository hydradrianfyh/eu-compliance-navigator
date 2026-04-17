"use client";

/**
 * TabPlaceholder — Phase A scaffolding for the five tab pages.
 *
 * Each tab receives a title and a one-sentence description of what the
 * finished Phase (B-E) will place here. The legacy renderer link lets
 * users still reach the old all-in-one page while the shell is unstable.
 *
 * Deleted in Phase G once every tab has its real content.
 *
 * © Yanhao FU
 */

import Link from "next/link";

interface TabPlaceholderProps {
  title: string;
  description: string;
  arrivingIn: "Phase B" | "Phase C" | "Phase D" | "Phase E";
}

export function TabPlaceholder({
  title,
  description,
  arrivingIn,
}: TabPlaceholderProps) {
  return (
    <section className="tab-placeholder panel">
      <h2>{title}</h2>
      <p className="tab-placeholder-description">{description}</p>
      <p className="tab-placeholder-note">
        <strong>Shell scaffolding:</strong> real content arriving in{" "}
        {arrivingIn}.
      </p>
      <p className="tab-placeholder-fallback">
        Need the full experience now?{" "}
        <Link href="/legacy" className="tab-placeholder-fallback-link">
          Open the legacy single-page view
        </Link>
        .
      </p>
    </section>
  );
}
