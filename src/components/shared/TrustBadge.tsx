"use client";

/**
 * TrustBadge — three-state visual indicator of how much a user can rely on
 * a rule (UX Refactor v2 §9.1 & §11.2). Always renders icon + text + color
 * so it remains distinguishable under grayscale print and forced-colors.
 *
 * © Yanhao FU
 */

export type TrustLevel = "verified" | "indicative" | "pending";

interface TrustBadgeProps {
  trust: TrustLevel;
  /** Optional freshness modifier rendered next to the badge. */
  freshnessHint?: string;
  title?: string;
}

const LABELS: Record<TrustLevel, { icon: string; text: string; cls: string }> = {
  verified: { icon: "✓", text: "Verified", cls: "trust-badge-verified" },
  indicative: { icon: "⚠", text: "Indicative", cls: "trust-badge-indicative" },
  pending: { icon: "○", text: "Pending", cls: "trust-badge-pending" },
};

export function TrustBadge({ trust, freshnessHint, title }: TrustBadgeProps) {
  const meta = LABELS[trust];
  return (
    <span className={`trust-badge ${meta.cls}`} title={title}>
      <span className="trust-badge-icon" aria-hidden="true">
        {meta.icon}
      </span>
      <span className="trust-badge-text">{meta.text}</span>
      {freshnessHint ? (
        <span className="trust-badge-freshness"> · {freshnessHint}</span>
      ) : null}
    </span>
  );
}
