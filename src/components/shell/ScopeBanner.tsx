"use client";

/**
 * ScopeBanner — always-visible top strip declaring the tool's coverage.
 *
 * Rationale: stakeholders who see "Countries at risk: All targeted markets
 * covered" and "FR/NL pending overlay" on different screens must never
 * wonder which side is lying. The banner tells them up front what's in
 * scope, what's pending, and what's deferred to Phase 13+.
 *
 * © Yanhao FU
 */

import { useState } from "react";

export function ScopeBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="scope-banner"
      role="complementary"
      aria-label="Tool coverage scope"
    >
      <span className="scope-banner-icon" aria-hidden="true">
        ⓘ
      </span>
      <span className="scope-banner-summary">
        <strong>Scope:</strong> EU horizontal + DE overlay ACTIVE ·{" "}
        <span className="scope-banner-pending">FR / NL</span> overlay pending
        (Phase 13+) ·{" "}
        <span className="scope-banner-deferred">
          Others (IT/ES/NL/..., CN/US/JP, customs)
        </span>{" "}
        out of scope
      </span>
      <button
        type="button"
        className="scope-banner-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "Hide detail" : "Detail"}
      </button>
      {expanded ? (
        <div className="scope-banner-detail">
          <dl>
            <dt>✓ In scope (verified)</dt>
            <dd>
              EU horizontal regulations (WVTA 2018/858, GSR2, R155/R156/R157,
              GDPR, Data Act, AI Act, Battery, Euro 7, PLD) · Germany (DE)
              overlay: FZV registration, §29 StVZO HU/AU, PflVG insurance,
              KraftStG tax, Umweltzonen
            </dd>
            <dt>⚠ Pending overlay (Phase 13+)</dt>
            <dd>
              France (FR) and Netherlands (NL) overlays are placeholder — no
              ACTIVE national rules yet. Evaluation treats them as UNKNOWN.
            </dd>
            <dt>○ Out of scope (this phase)</dt>
            <dd>
              UNECE Annex II technical regulations (32 rules, source URLs not
              yet verified) · Other EU member states (IT/ES/PL/...) ·
              Non-EU markets (CN/US/JP/UK/TR) · Customs / CBAM / HS
              classification / FTA Rules-of-Origin · ISO standards prerequisites
            </dd>
            <dt>Disclaimer</dt>
            <dd>
              This tool is a navigation aid, not legal advice. Always validate
              with your homologation partner and legal counsel before
              making market-entry decisions.
            </dd>
          </dl>
        </div>
      ) : null}
    </aside>
  );
}
