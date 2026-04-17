import type { Rule } from "@/registry/schema";

type FreshnessSeed = Pick<
  Rule,
  | "last_human_review_at"
  | "review_cadence_days"
  | "change_watch_method"
  | "last_change_signal_at"
>;

/**
 * Central registry of freshness data for ACTIVE rules.
 *
 * Only ACTIVE rules need explicit entries here. Non-ACTIVE rules fall back
 * to the default cadence computed by `defaultCadenceDays`.
 *
 * change_watch_method convention:
 *   "eur-lex-sparql"   -- poll EUR-Lex SPARQL / CELLAR for CELEX updates
 *   "unece-rss"        -- poll UNECE WP.29 RSS / publication feed
 *   "national-manual"  -- manual quarterly human review (no automated feed)
 */
export const freshnessSeedData: Record<string, FreshnessSeed> = {
  // Vehicle approval (EU)
  "REG-TA-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // General safety (EU)
  "REG-GSR-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Cybersecurity (UNECE)
  "REG-CS-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "unece-rss",
  },
  "REG-CS-002": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "unece-rss",
  },

  // Battery regulation (EU)
  "REG-BAT-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // R100 EV Safety (UNECE)
  "REG-UN-100": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "unece-rss",
  },

  // Automated driving (UNECE) — ACTIVE per classification
  "REG-AD-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "unece-rss",
  },
  "REG-AD-002": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "unece-rss",
  },

  // AI Act (EU) — ACTIVE per classification
  "REG-AI-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-AI-004": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Privacy (EU)
  "REG-PV-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-PV-002": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // AI Act (additional — promoted phase-11b2-batch2)
  "REG-AI-002": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-AI-003": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Data Act (EU)
  "REG-DA-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Emissions (EU)
  "REG-EM-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-EM-002": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-EM-003": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Consumer liability (EU)
  "REG-CL-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-CL-003": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Battery Regulation — sub-obligations
  "REG-BAT-004": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },
  "REG-BAT-005": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // UK Automated Vehicles Act (NON_EU_MARKET — no EUR-Lex feed)
  "REG-UK-001": {
    last_human_review_at: "2026-04-17",
    review_cadence_days: 180,
    change_watch_method: "national-manual",
  },

  // L-category vehicle approval (EU)
  "REG-TA-002": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 180,
    change_watch_method: "eur-lex-sparql",
  },

  // Germany overlay (Phase 11C) — national law, manual cadence
  "REG-MS-DE-001": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 365,
    change_watch_method: "national-manual",
  },
  "REG-MS-DE-002": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 365,
    change_watch_method: "national-manual",
  },
  "REG-MS-DE-003": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 365,
    change_watch_method: "national-manual",
  },
  "REG-MS-DE-004": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 365,
    change_watch_method: "national-manual",
  },
  "REG-MS-DE-005": {
    last_human_review_at: "2026-04-16",
    review_cadence_days: 365,
    change_watch_method: "national-manual",
  },
};
