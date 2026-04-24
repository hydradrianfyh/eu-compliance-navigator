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
        <strong>✓ Scope:</strong> Germany + UK + France + Spain production-grade ·{" "}
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
                  <strong>EU horizontal: 52 rules</strong> — WVTA (2018/858)
                  + Annex II master (2021/535), GSR2 + 6 delegated acts +
                  eCall 2015/758, R155/156/157, GDPR + ePrivacy + EDPB
                  Connected-Vehicle Guidelines, Data Act + AFIR, AI Act,
                  Battery + F-gas + REACH + MAC Directive, Euro 6 + Euro 7
                  (LD + HD split) + tyre label + CO2 label, PLD + GPSR,
                  RED cyber (Del Reg 2022/30), recall (2018/858 Arts 52-53),
                  R100, R171 DCAS
                </p>
                <p>
                  <strong>UNECE technical: 43 rules</strong> — Phase M.2.A
                  promoted 16 R-series to ACTIVE with verified deep links
                  (R7 / R25 / R28 / R30 / R34 / R51 / R67 / R87 / R101 /
                  R112 / R113 / R116 / R125 / R128 / R140 / R145) on top
                  of 27 prior ACTIVE from Phase L
                </p>
                <p>
                  <strong>Germany (DE): 8 rules</strong> — registration (FZV),
                  roadworthiness (§29 StVZO HU/AU), insurance (PflVG), motor
                  tax (KraftStG), low-emission zones (BImSchV), E-plate
                  (EmoG), company-car tax (EStG), scrappage (AltfahrzeugV)
                </p>
                <p>
                  <strong>UK (non-EU market): 14 rules</strong> — GBTA,
                  DVLA V5C, MoT, VED, insurance (RTA 1988), London ULEZ,
                  regional CAZ, Scotland LEZ, ZEV sales mandate, UK GDPR,
                  automated vehicles (AV Act 2024), Windsor Framework NI,
                  Public Charge Point Regs 2023, UK REACH (Phase M.4)
                </p>
                <p>
                  <strong>France (FR): 11 rules</strong> — SIV registration,
                  contrôle technique, assurance RC, bonus/malus CO2, ZFE-m,
                  Crit&apos;Air, TVS → TAVE+TAPVP, TICPE, LOM, Malus masse,
                  Prime à la conversion (terminated informational marker;
                  Phase M.3 lifted FR from 5 → 11 ACTIVE)
                </p>
                <p>
                  <strong>Spain (ES): 9 rules</strong> — DGT registration, ITV,
                  insurance, IEDMT, IVTM, ZBE (Ley 7/2021), WVTA transposition
                  (RD 750/2010), Etiqueta Ambiental, batteries RD 106/2008
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
                  <strong>UK: 1</strong> — UK ETS road-transport scope
                  (awaiting adopting SI)
                </p>
                <p>
                  <strong>France: 1</strong> — UTAC-CERAM designation
                  (no JORF designation decree located; blocker documented)
                </p>
                <p>
                  <strong>Spain: 5</strong> — Homologación Individual,
                  ZEV 2040, Ley Movilidad Sostenible, MOVES III,
                  CCAA regional variation
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
