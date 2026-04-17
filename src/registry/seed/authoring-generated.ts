// AUTO-GENERATED from content/authoring.csv
// Do NOT edit by hand -- run `node scripts/generate-authoring-data.mjs`.
// Owner: compliance team.

import type { Rule } from "@/registry/schema";

type AuthoringEntry = Pick<
  Rule,
  | "last_human_review_at"
  | "review_cadence_days"
  | "change_watch_method"
  | "third_party_verification_required"
  | "recurring_post_market_obligation"
  | "submission_timing"
  | "language_or_localization_need"
  | "required_documents"
  | "required_evidence"
>;

export const authoringGenerated: Record<string, AuthoringEntry> = {
  "REG-EM-001": {
    "last_human_review_at": "2026-04-16",
    "review_cadence_days": 180,
    "change_watch_method": "eur-lex-sparql",
    "third_party_verification_required": true,
    "recurring_post_market_obligation": true,
    "submission_timing": "New types from 2026-11-29; all new vehicles from 2027-11-29",
    "language_or_localization_need": "EVP must be in official language of registration state",
    "required_documents": [
      "Euro 7 type-approval application",
      "Exhaust emission test reports per 2025/1706",
      "OBM system compliance documentation",
      "OBFCM device compliance per 2025/1707",
      "Environmental Vehicle Passport (EVP)",
      "Battery durability documentation (if BEV/PHEV)"
    ],
    "required_evidence": [
      "Emission test certificates (PN >= 10nm)",
      "WLTP/RDE test results",
      "OBM system validation",
      "EVP data file"
    ]
  },
  "REG-PV-001": {
    "last_human_review_at": "2026-04-16",
    "review_cadence_days": 180,
    "change_watch_method": "eur-lex-sparql",
    "third_party_verification_required": false,
    "recurring_post_market_obligation": true,
    "submission_timing": "Before SOP for new data processing activities; DPIA before high-risk processing begins",
    "language_or_localization_need": "Privacy notice in local language of each target market",
    "required_documents": [
      "Data Protection Impact Assessment (DPIA)",
      "Record of processing activities (Art. 30)",
      "Privacy policy / notice for vehicle users",
      "Data processing agreements with processors"
    ],
    "required_evidence": [
      "DPIA completion record",
      "Consent mechanism implementation evidence",
      "Data subject rights procedure documentation"
    ]
  },
  "REG-DA-001": {
    "last_human_review_at": "2026-04-16",
    "review_cadence_days": 180,
    "change_watch_method": "eur-lex-sparql",
    "third_party_verification_required": false,
    "recurring_post_market_obligation": true,
    "submission_timing": "Applies from 2025-09-12 for connected products placed on market",
    "language_or_localization_need": "User-facing documentation in local language",
    "required_documents": [
      "Data access technical specification",
      "User data access interface documentation",
      "Third-party data sharing contracts (where applicable)"
    ],
    "required_evidence": [
      "Technical implementation of data access interface",
      "User-facing data access documentation"
    ]
  }
};
