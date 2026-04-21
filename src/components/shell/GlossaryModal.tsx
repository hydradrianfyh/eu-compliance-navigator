"use client";

/**
 * GlossaryModal — overlay that explains every badge and status term used
 * across the workspace. Opened from the GlobalNav ⚙ menu.
 *
 * Per ADR E-2 this is implemented as a modal rather than a dedicated route:
 * the Glossary is reference content, not a workspace, and needs to stay one
 * click from anywhere without polluting URL history.
 *
 * Accessibility:
 *   - role="dialog", aria-modal="true", aria-labelledby
 *   - Closes on ESC, overlay click, and the close button
 *   - On open, focus moves to the close button; on close, focus returns
 *     to the element that opened the modal (caller's responsibility —
 *     see GlobalNav)
 *
 * © Yanhao FU
 */

import { useEffect, useRef } from "react";

import { ApplicabilityBadge } from "@/components/shared/ApplicabilityBadge";
import { FreshnessBadge } from "@/components/phase3/FreshnessBadge";
import { TrustBadge } from "@/components/shared/TrustBadge";

interface GlossaryModalProps {
  open: boolean;
  onClose: () => void;
}

interface GlossaryEntry {
  term: React.ReactNode;
  definition: string;
}

interface GlossaryGroup {
  id: string;
  title: string;
  lede: string;
  entries: GlossaryEntry[];
}

const GROUPS: readonly GlossaryGroup[] = [
  {
    id: "trust",
    title: "Trust levels",
    lede:
      "How much you can rely on a rule. Shown as the left-most badge on every rule card.",
    entries: [
      {
        term: <TrustBadge trust="verified" />,
        definition:
          "The rule is ACTIVE and its primary source (EUR-Lex / UNECE) has been verified by a reviewer. Safe to act on.",
      },
      {
        term: <TrustBadge trust="indicative" />,
        definition:
          "The rule is authored but its source has not yet been verified. Use as a pointer; always confirm with the official text before acting.",
      },
      {
        term: <TrustBadge trust="pending" />,
        definition:
          "Placeholder only — the rule is listed but not yet written up. Treat as a gap in coverage.",
      },
    ],
  },
  {
    id: "applicability",
    title: "Does it apply to this project?",
    lede:
      "Whether the current project configuration triggers this rule. Shown next to the trust badge.",
    entries: [
      {
        term: <ApplicabilityBadge applicability="APPLICABLE" />,
        definition:
          "All trigger conditions match. The rule applies to the current project.",
      },
      {
        term: <ApplicabilityBadge applicability="CONDITIONAL" />,
        definition:
          "Some conditions match; others depend on choices you have not yet made. Revisit after finalising those inputs.",
      },
      {
        term: <ApplicabilityBadge applicability="FUTURE" effectiveDate="2027-01-15" />,
        definition:
          "Will apply from a future date. Plan the work backwards from that date.",
      },
      {
        term: <ApplicabilityBadge applicability="NOT_APPLICABLE" />,
        definition:
          "Trigger conditions do not match. You can skip this rule for the current project.",
      },
      {
        term: <ApplicabilityBadge applicability="UNKNOWN" subState="not_authored" />,
        definition:
          "Rule is a placeholder and has not been authored. Cannot be evaluated.",
      },
      {
        term: <ApplicabilityBadge applicability="UNKNOWN" subState="source_not_verified" />,
        definition:
          "Rule was marked ACTIVE but its source is missing or stale. A reviewer must re-verify before it can evaluate.",
      },
      {
        term: <ApplicabilityBadge applicability="UNKNOWN" subState="missing_input" />,
        definition:
          "The engine needs a project field that is not yet filled in. Open Setup to complete the highlighted field.",
      },
    ],
  },
  {
    id: "freshness",
    title: "Source freshness",
    lede:
      "How recently the cited source was reviewed. Only shown on Verified rules.",
    entries: [
      {
        term: <FreshnessBadge status="fresh" />,
        definition: "Reviewed within the cadence window. No action required.",
      },
      {
        term: <FreshnessBadge status="due_soon" />,
        definition:
          "Within the last 20% of the cadence window. Schedule a review in the next sprint.",
      },
      {
        term: <FreshnessBadge status="overdue" />,
        definition:
          "Review cadence exceeded. Re-verify the source before relying on the rule.",
      },
      {
        term: <FreshnessBadge status="critically_overdue" />,
        definition:
          "Critically overdue — rule should not be relied on until re-verified.",
      },
      {
        term: <FreshnessBadge status="never_verified" />,
        definition: "No human review record exists for this rule yet.",
      },
    ],
  },
  {
    id: "member-state",
    title: "Member-state overlay status",
    lede:
      "Coverage of country-specific rules on top of EU-level framework. Shown on the Coverage tab.",
    entries: [
      {
        term: <strong>Operational (green)</strong>,
        definition:
          "Country has verified ACTIVE rules. Example: Germany (8 ACTIVE — registration, HU/AU, PflVG, KraftStG, Umweltzonen, E-plate, company-car tax, scrappage), UK (11 ACTIVE), Spain (7 ACTIVE), France (5 ACTIVE).",
      },
      {
        term: <strong>Indicative (amber)</strong>,
        definition:
          "Country has authored rules awaiting human source verification. Example: several specific rules in DE, UK, ES, and FR are pending reviewer sign-off (e.g. DE LSV AFIR transposition, FR Crit'Air, ES Etiqueta Ambiental).",
      },
      {
        term: <strong>Placeholder (slate)</strong>,
        definition:
          "National overlay not yet authored. Example: Netherlands (5 SEED_UNVERIFIED rules pending promotion), Italy / Poland / Belgium / Austria / Sweden / Czechia (factory stubs only).",
      },
      {
        term: <strong>Non-EU (blue)</strong>,
        definition:
          "Country is outside the EU type-approval framework. Example: UK operates under post-Brexit GBTA (11 ACTIVE rules in this tool).",
      },
    ],
  },
  {
    id: "lifecycle",
    title: "Rule lifecycle (engine-level)",
    lede:
      "Governance state of a rule in the registry. Mostly visible on the Coverage tab; users rarely need to read these directly.",
    entries: [
      {
        term: <code>ACTIVE</code>,
        definition:
          "Rule is authored and its primary source (official_url + oj_reference + last_verified_on) is complete.",
      },
      {
        term: <code>SEED_UNVERIFIED</code>,
        definition:
          "Rule has been authored but the source fields are incomplete; or it started ACTIVE and was downgraded by the governance gate.",
      },
      {
        term: <code>DRAFT</code>,
        definition: "Rule is being drafted; may contain gaps.",
      },
      {
        term: <code>PLACEHOLDER</code>,
        definition:
          "Stub entry so the domain is tracked in coverage, but no content yet.",
      },
      {
        term: <code>ARCHIVED</code>,
        definition: "Rule has been retired and no longer evaluates.",
      },
    ],
  },
];

export function GlossaryModal({ open, onClose }: GlossaryModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus to the close button when opening so keyboard users don't lose context.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  // Close on ESC.
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="glossary-overlay"
      role="presentation"
      onClick={onClose}
      data-testid="glossary-overlay"
    >
      <div
        className="glossary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="glossary-header">
          <h2 id="glossary-title">Glossary</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="glossary-close"
            aria-label="Close glossary"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <p className="glossary-intro">
          Every badge used across the workspace, in plain language. Not legal
          advice — always validate with your homologation partner.
        </p>
        <div className="glossary-body">
          {GROUPS.map((group) => (
            <section key={group.id} className="glossary-group" data-testid={`glossary-group-${group.id}`}>
              <h3>{group.title}</h3>
              <p className="glossary-lede">{group.lede}</p>
              <dl>
                {group.entries.map((entry, idx) => (
                  <div key={idx} className="glossary-entry">
                    <dt>{entry.term}</dt>
                    <dd>{entry.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
