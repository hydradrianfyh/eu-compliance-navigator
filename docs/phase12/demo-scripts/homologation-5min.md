# Homologation Lead · 5-minute Demo Script

**Persona**: Homologation lead preparing MY2027 BEV for EU + DE launch
**Tab**: Rules (primary) · ScopeBanner always visible
**Goal**: prove she/he can walk off the demo saying "I can use this to talk to TÜV".

---

## 0:00 – 0:30 · Open WVTA card direct-link (30 s)

- Navigate: `/rules?rule=REG-TA-001`
- **What stakeholder sees**: WVTA card auto-expanded, 5 required_documents + 3 required_evidence + "Submission timing: Before SOP" + EUR-Lex `Open on EUR-Lex ↗` link + provenance line **"Source: EUR-Lex (official) · Reviewed by yanhao · Retrieved 2026-04-19"**.
- **Talking point**: *"This is what I'd hand a junior engineer on day 1."*

## 0:30 – 2:00 · Filter to Applicable + scan scope (1:30)

- Apply filter: **Applicability = Applies**. Result should show ~15-17 rules (post-Sprint-6 GSR family ACTIVE).
- Point at **ScopeBanner** at the top (amber strip): *"EU horizontal + DE overlay ACTIVE · FR/NL pending"*.
- Click **Detail** on ScopeBanner. Show 4-row dl: In-scope / Pending / Out-of-scope / Disclaimer.
- **Talking point**: *"No hidden regulations — everything in scope is listed, everything pending is labelled."*

## 2:00 – 3:30 · Expand R155 CSMS · Plain ↔ Engineering toggle (1:30)

- Expand REG-CS-001 R155 CSMS.
- Show **Plain** view: 5-section card (Summary, Why it applies, What to do, Reference, My tracking).
- Why-it-applies shows ✓ **matched** icons for "Framework group is MN".
- Reference section: 1 primary source + **provenance line** (UNECE, reviewer, retrieved 2026-04-16) + **prerequisite_standards: ISO/SAE 21434** + **Related: REG-CS-002 (complements), REG-AD-001 (requires)** — each related rule is a deep link.
- Click **Engineering** toggle → raw trigger_logic JSON + matched_conditions / unmatched_conditions.
- **Talking point**: *"Plain view for the VP. Engineering view for me when I'm arguing with a technical service."*

## 3:30 – 4:30 · GSR2 delegated acts: phase-in dates all verified (1:00)

- Filter search: "GSR" → 6 rules (framework + 5 delegated).
- Expand REG-GSR-002 ISA:
  - Canonical source: `Commission Implementing Regulation (EU) 2021/1958 · OJ L 409, 17.11.2021`
  - Temporal: `applies_to_new_types_from: 2022-07-06 · applies_to_all_new_vehicles_from: 2024-07-07`
- Briefly open GSR-003..006 — all ACTIVE, all dated.
- **Talking point**: *"Pre-Sprint-6 these 5 were 'Source URL not yet verified'. Now they're all anchored. This is the kind of follow-through I need."*

## 4:30 – 5:00 · Provenance close (30 s)

- Expand REG-CL-001 PLD. Show Why-it-applies matches "Market includes at least one EU country" ✓ (Sprint 2 UX-004 fix).
- Close with provenance on PLD: "Source: EUR-Lex · Reviewed by yanhao · Retrieved 2026-04-17 · Prerequisite standards: ISO 26262, ISO/SAE 21434".

---

## Expected closing statement from stakeholder

> *"Rules, required documents, source traceability, ISO prerequisites — all there. I can use this to drive our Type-Approval application plan. Next I want to see the timeline."*

(…which sets up Script 2, team-leader Plan tab.)

## Sprint 8 dry-run checklist

- [ ] Reached WVTA card in ≤ 30 s
- [ ] ScopeBanner seen
- [ ] Plain ↔ Engineering toggle exercised at least once
- [ ] GSR-002..006 all show ACTIVE / green (Sprint 6 proof)
- [ ] Provenance line read aloud once
- [ ] Total time ≤ 5:30

© Yanhao FU
