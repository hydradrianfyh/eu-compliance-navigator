import type { Rule } from "@/registry/schema";

type EvidenceEnrichment = Pick<
  Rule,
  | "required_documents"
  | "required_evidence"
  | "submission_timing"
  | "language_or_localization_need"
  | "third_party_verification_required"
  | "recurring_post_market_obligation"
>;

export const evidenceEnrichments: Record<string, EvidenceEnrichment> = {
  "REG-TA-001": {
    required_documents: [
      "Type-approval application form",
      "Technical documentation package per Annex I of 2018/858",
      "Certificate of Conformity (CoC)",
      "Test reports from EU-designated technical service",
      "Manufacturer declaration of conformity of production",
    ],
    required_evidence: [
      "Completed information document",
      "CoP audit results",
      "Technical service test certificates",
    ],
    submission_timing: "Before SOP — type-approval must be granted before first vehicle is produced for the EU market",
    language_or_localization_need: "Application in language of granting authority; CoC in language of registration member state",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-GSR-001": {
    required_documents: [
      "GSR2 compliance declaration per system",
      "Delegated act compliance evidence for each mandatory feature",
      "Test reports per individual feature delegated acts",
    ],
    required_evidence: [
      "ISA/EDR/DMS/AEB/TPMS individual test certificates",
      "System integration evidence",
    ],
    submission_timing: "During type-approval application — each feature has its own phase-in date",
    language_or_localization_need: "Per granting authority requirements",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-CS-001": {
    required_documents: [
      "CSMS certificate application",
      "CSMS process documentation",
      "Vehicle type cybersecurity assessment",
      "Risk assessment and threat analysis (TARA)",
    ],
    required_evidence: [
      "CSMS certificate from approval authority",
      "Vehicle type-approval for cybersecurity",
      "Continuous monitoring evidence",
    ],
    submission_timing: "CSMS certificate before vehicle type-approval; certificate valid max 3 years",
    language_or_localization_need: "English accepted by most authorities; national language may be required for specific markets",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-CS-002": {
    required_documents: [
      "SUMS process documentation",
      "Software update type-approval application",
      "RXSWIN management documentation",
    ],
    required_evidence: [
      "SUMS certificate",
      "Software update validation reports",
      "OTA update delivery and verification records",
    ],
    submission_timing: "Before type-approval; ongoing for each software update campaign",
    language_or_localization_need: "Per approval authority",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-EM-001": {
    required_documents: [
      "Euro 7 type-approval application",
      "Exhaust emission test reports per 2025/1706",
      "OBM system compliance documentation",
      "OBFCM device compliance per 2025/1707",
      "Environmental Vehicle Passport (EVP)",
      "Battery durability documentation (if BEV/PHEV)",
    ],
    required_evidence: [
      "Emission test certificates (PN >= 10nm)",
      "WLTP/RDE test results",
      "OBM system validation",
      "EVP data file",
    ],
    submission_timing: "New types from 2026-11-29; all new vehicles from 2027-11-29",
    language_or_localization_need: "EVP must be in official language of registration state",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-PV-001": {
    required_documents: [
      "Data Protection Impact Assessment (DPIA)",
      "Record of processing activities (Art. 30)",
      "Privacy policy / notice for vehicle users",
      "Data processing agreements with processors",
    ],
    required_evidence: [
      "DPIA completion record",
      "Consent mechanism implementation evidence",
      "Data subject rights procedure documentation",
    ],
    submission_timing: "Before SOP for new data processing activities; DPIA before high-risk processing begins",
    language_or_localization_need: "Privacy notice in local language of each target market",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
  },

  "REG-AI-001": {
    required_documents: [
      "AI system inventory",
      "AI literacy training materials and records",
      "Prohibited practices compliance assessment",
    ],
    required_evidence: [
      "Training completion records for AI literacy (Art. 4)",
      "Self-assessment against prohibited practices list (Art. 5)",
    ],
    submission_timing: "Prohibited practices: from 2025-02-02; AI literacy: from 2025-02-02",
    language_or_localization_need: "Training materials in working language of staff",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
  },

  "REG-BAT-001": {
    required_documents: [
      "Battery sustainability declaration",
      "Carbon footprint declaration (from applicable date)",
      "Battery label design and content",
      "Digital battery passport data (from 2027)",
      "Due diligence policy for raw materials",
    ],
    required_evidence: [
      "Carbon footprint calculation per delegated act methodology",
      "Recycled content declaration",
      "Performance and durability test results",
      "Supply chain due diligence audit reports",
    ],
    submission_timing: "Phased: labelling from 2024; carbon footprint from 2025; battery passport from 2027",
    language_or_localization_need: "Label in official language of market; battery passport data in English + local language",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-DA-001": {
    required_documents: [
      "Data access technical specification",
      "User data access interface documentation",
      "Third-party data sharing contracts (where applicable)",
    ],
    required_evidence: [
      "Technical implementation of data access interface",
      "User-facing data access documentation",
    ],
    submission_timing: "Applies from 2025-09-12 for connected products placed on market",
    language_or_localization_need: "User-facing documentation in local language",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
  },

  "REG-CL-001": {
    required_documents: [
      "Product safety documentation",
      "Defect reporting mechanisms",
      "Software update / cybersecurity lifecycle documentation",
      "Insurance / risk assessment for software-related liability",
    ],
    required_evidence: [
      "Product safety file",
      "Liability risk assessment",
      "Member-state transposition tracking",
    ],
    submission_timing: "Applies to products placed on market after member-state transposition (deadline 2026-12-09)",
    language_or_localization_need: "Documentation in language of each target member state where litigation may occur",
    third_party_verification_required: false,
    recurring_post_market_obligation: true,
  },

  "REG-TA-002": {
    required_documents: [
      "L-category type-approval application per 168/2013",
      "Technical documentation package per 168/2013 Annex I",
      "Certificate of Conformity (CoC) for L-category",
      "Test reports from designated technical service",
      "Environmental and propulsion performance test results",
    ],
    required_evidence: [
      "Completed information document (L-cat specific)",
      "CoP audit results for L-category production",
      "Technical service test certificates (propulsion, functional safety, environmental)",
    ],
    submission_timing: "Before SOP — type-approval granted before first L-category vehicle placed on EU market",
    language_or_localization_need: "Application in language of granting authority; CoC in language of registration member state",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-AD-001": {
    required_documents: [
      "UN R157 ALKS type-approval application",
      "System safety case and operational design domain (ODD) definition",
      "Driver/vehicle interaction (DVI) validation report",
      "Data Storage System for Automated Driving (DSSAD) specification",
      "Cybersecurity and software update compliance evidence (R155/R156)",
    ],
    required_evidence: [
      "Audit trail of scenario-based testing per R157 Annex",
      "DSSAD event logging validation",
      "Minimum Risk Manoeuvre (MRM) demonstration",
      "Transition demand and handover test results",
    ],
    submission_timing: "Required for L3 vehicles before type-approval; amendment process if ODD expanded post-SOP",
    language_or_localization_need: "Application and safety case typically in English; user manual localised per market",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-AD-002": {
    required_documents: [
      "UN R171 DCAS type-approval application",
      "Driver monitoring / attentiveness system specification",
      "Functional safety concept for longitudinal/lateral control assistance",
      "Human-machine interface (HMI) validation report",
    ],
    required_evidence: [
      "DCAS feature test reports (lane centering, speed control, hands-on detection)",
      "Driver attention monitoring calibration results",
      "Override and deactivation behaviour test evidence",
    ],
    submission_timing: "Applies to L2+ systems placed on market from R171 entry into force; evidence submitted during type-approval",
    language_or_localization_need: "Driver-facing warnings localised per registration market",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-AI-004": {
    required_documents: [
      "AI system classification analysis (high-risk determination per Art. 6)",
      "Risk management system documentation (Art. 9)",
      "Data governance and training data documentation (Art. 10)",
      "Technical documentation per Annex IV",
      "Instructions for use and transparency information (Art. 13)",
      "Conformity assessment evidence aligned with vehicle type-approval",
    ],
    required_evidence: [
      "Quality management system records (Art. 17)",
      "Post-market monitoring plan and logs (Art. 72)",
      "Human oversight measures validation",
      "Accuracy, robustness and cybersecurity test results (Art. 15)",
    ],
    submission_timing: "High-risk AI obligations apply from 2027-08-02 for safety components covered by Art. 6(1); aligned with vehicle type-approval cycle",
    language_or_localization_need: "Instructions for use in official language(s) of each member state where system is used",
    third_party_verification_required: true,
    recurring_post_market_obligation: true,
  },

  "REG-UN-100": {
    required_documents: [
      "REESS (Rechargeable Energy Storage System) safety documentation",
      "High-voltage circuit isolation evidence",
      "Post-crash electrical safety test reports",
      "Thermal propagation / thermal runaway test results",
      "Charging system electrical safety documentation",
    ],
    required_evidence: [
      "R100 Part I — in-use electrical safety test certificate",
      "R100 Part II — safety requirements for REESS test certificate",
      "Vibration, thermal shock, mechanical shock test results",
      "Short-circuit, overcharge, over-discharge protection evidence",
    ],
    submission_timing: "During type-approval — R100 tests required before EV placed on market",
    language_or_localization_need: "Test reports accepted in English at most technical services",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-UN-013H": {
    required_documents: [
      "R13-H type-approval application for M1/N1 braking",
      "Braking system description (hydraulic/electro-hydraulic/electro-mechanical)",
      "Regenerative braking interaction documentation (for BEV/HEV)",
      "ABS performance and malfunction indication evidence",
    ],
    required_evidence: [
      "Service brake performance test (Type-0, Type-I)",
      "Parking brake test results",
      "ABS performance on various surfaces (split-mu, transitions)",
      "Brake assist system (BAS) compliance",
      "Regenerative brake blending validation (BEV-specific)",
    ],
    submission_timing: "Required for every new M1/N1 type approval; retrofitted on major changes to braking system",
    language_or_localization_need: "Technical service reports in English typical",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-UN-079": {
    required_documents: [
      "R79 steering system type-approval application",
      "EPS (Electric Power Steering) functional safety concept",
      "ACSF (Automatically Commanded Steering Function) categorisation and validation",
      "Steering system failure mode analysis",
    ],
    required_evidence: [
      "Steering effort and return-to-centre tests",
      "ACSF categories A/B/C/D/E compliance evidence",
      "Cybersecurity alignment for steer-by-wire (if fitted)",
      "Failure behaviour validation",
    ],
    submission_timing: "Required for type-approval; ACSF updates require amendment when new assistance features added",
    language_or_localization_need: "Technical documentation in English typical",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-UN-010": {
    required_documents: [
      "R10 EMC type-approval application",
      "EMC test plan per R10.06 series",
      "Wireless and connectivity module EMC compliance evidence",
    ],
    required_evidence: [
      "Radiated immunity test results",
      "Conducted emissions test results",
      "Transient immunity test results",
      "ESD test results for E/E systems",
    ],
    submission_timing: "Required for type-approval; re-testing required on significant E/E architecture changes",
    language_or_localization_need: "English accepted at most EU technical services",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-UN-140": {
    required_documents: [
      "R140 ESC type-approval application",
      "ESC system functional description",
      "Integration evidence with braking (R13-H) and steering (R79)",
    ],
    required_evidence: [
      "ESC performance test on wet/dry surfaces",
      "Lateral stability test results",
      "Malfunction indication validation",
    ],
    submission_timing: "Required for new M1/N1 type approvals; mandatory for all vehicles on EU market",
    language_or_localization_need: "English accepted at most technical services",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-UN-141": {
    required_documents: [
      "R141 TPMS type-approval application",
      "TPMS functional description (direct vs indirect)",
      "Tyre pressure warning threshold documentation",
    ],
    required_evidence: [
      "TPMS detection accuracy test",
      "Warning lamp activation validation",
      "Reset procedure verification",
    ],
    submission_timing: "Required for new M1 type approvals",
    language_or_localization_need: "Driver-facing warning symbols standardised; owner manual localised",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },

  "REG-UN-048": {
    required_documents: [
      "R48 lighting installation type-approval application",
      "Lighting layout and installation drawings",
      "Matrix LED / adaptive driving beam (ADB) compliance evidence (if fitted)",
    ],
    required_evidence: [
      "Installation geometry verification",
      "Photometric performance test results",
      "Circuit and fault detection validation",
      "Adaptive front lighting (AFS) compliance if fitted (R123/R149)",
    ],
    submission_timing: "Required for every type approval; amendment required for lighting architecture changes",
    language_or_localization_need: "Technical service reports in English typical",
    third_party_verification_required: true,
    recurring_post_market_obligation: false,
  },
};
