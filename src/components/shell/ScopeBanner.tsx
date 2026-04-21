"use client";

/**
 * ScopeBanner — always-visible top strip declaring the tool's tiered coverage.
 *
 * Rationale: a manager opening the tool must grok what's actionable vs.
 * what's indicative vs. what's blank in 3 seconds. Collapsed state is one
 * line; expanded state is a 4-tier grid (production-grade / indicative /
 * not yet authored / out of scope) with rule counts per jurisdiction.
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
        <strong>✓ Scope:</strong> Germany + UK production-grade ·{" "}
        <span className="scope-banner-indicative">Spain + France indicative</span>{" "}
        ·{" "}
        <span className="scope-banner-pending">Netherlands + others pending</span>{" "}
        ·{" "}
        <span className="scope-banner-deferred">
          CN/US/JP/customs out of scope
        </span>
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
          <div className="scope-banner-detail-tiers">
            <section className="scope-tier scope-tier-verified">
              <p className="scope-tier-heading">
                <span aria-hidden="true">✓</span>
                Production-grade (fully verified, safe to act on)
              </p>
              <div className="scope-tier-body">
                <p>
                  <strong>EU horizontal: ~45 rules</strong> — WVTA, GSR2,
                  R155/156/157, Euro 6/7, Battery Regulation, AI Act, Data Act,
                  GDPR, PLD, R100, R171 DCAS
                </p>
                <p>
                  <strong>Germany (DE): 8 rules</strong> — registration (FZV),
                  roadworthiness (§29 StVZO HU/AU), insurance (PflVG), motor
                  tax (KraftStG), low-emission zones (BImSchV), E-plate
                  (EmoG), company-car tax (EStG), scrappage (AltfahrzeugV)
                </p>
                <p>
                  <strong>UK (non-EU market): 11 rules</strong> — GBTA,
                  DVLA V5C, MoT, VED, insurance (RTA 1988), London ULEZ,
                  regional CAZ, Scotland LEZ, ZEV sales mandate, UK GDPR,
                  automated vehicles (AV Act 2024)
                </p>
                <p>
                  <strong>Spain (ES): 7 rules</strong> — DGT registration, ITV,
                  insurance, IEDMT, IVTM, ZBE (Ley 7/2021), WVTA transposition
                  (RD 750/2010)
                </p>
                <p>
                  <strong>France (FR): 5 rules</strong> — SIV registration,
                  contrôle technique, assurance RC, bonus/malus CO2, ZFE-m
                </p>
              </div>
            </section>

            <section className="scope-tier scope-tier-indicative">
              <p className="scope-tier-heading">
                <span aria-hidden="true">◐</span>
                Indicative (authored but source pending human verification —
                use as pointer, confirm with official text)
              </p>
              <div className="scope-tier-body">
                <p>
                  <strong>Germany: 2</strong> — LSV AFIR transposition, KBA
                  statutory chain
                </p>
                <p>
                  <strong>UK: 2</strong> — Windsor Framework (NI), Public
                  Charge Point Regulations
                </p>
                <p>
                  <strong>Spain: 7</strong> — Etiqueta Ambiental,
                  Homologación Individual, ZEV 2040, Ley 3/2023 Movilidad,
                  MOVES III, batteries RD 106/2008, CCAA variation
                </p>
                <p>
                  <strong>France: 7</strong> — Crit&apos;Air, Prime à la
                  Conversion, TVS → TAVE+TAPVP, TICPE, LOM, Malus Masse, UTAC
                </p>
              </div>
            </section>

            <section className="scope-tier scope-tier-pending">
              <p className="scope-tier-heading">
                <span aria-hidden="true">○</span>
                Not yet authored (no coverage — user must do separate research)
              </p>
              <div className="scope-tier-body">
                <p>
                  <strong>Netherlands (NL): 5 rules pending authoring</strong>
                </p>
                <p>
                  <strong>Other EU (IT, PL, BE, AT, SE, CZ)</strong> —
                  factory stubs only
                </p>
              </div>
            </section>

            <section className="scope-tier scope-tier-out">
              <p className="scope-tier-heading">
                <span aria-hidden="true">✕</span>
                Out of scope (explicit non-goals)
              </p>
              <div className="scope-tier-body">
                <p>
                  Non-EU markets (CN, US, JP, TR) · Customs / CBAM / HS / FTA
                  · ISO standards prerequisites · UNECE Annex II beyond
                  pilot-triggered set
                </p>
              </div>
            </section>
          </div>

          <p className="scope-banner-disclaimer">
            This tool is a navigation aid, not legal advice. Always validate
            with your homologation partner and legal counsel before
            market-entry decisions.
          </p>
        </div>
      ) : null}
    </aside>
  );
}
