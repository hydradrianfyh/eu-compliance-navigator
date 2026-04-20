# Team Leader (domain owner) · 5-minute Demo Script

**Persona**: Cybersecurity team lead (substitutable for AI governance / battery / privacy / ADAS leaders)
**Tab**: Plan (primary), with drill-downs to Rules
**Goal**: prove leader walks off saying "I know what my team owes the program this month, next quarter, and through SOP."

---

## 0:00 – 1:00 · Locate own domain in Owner Dashboard (1:00)

- Open `/plan`.
- Right-hand Owner Dashboard lists domains. For cybersecurity pilot: **Cybersecurity (3 tasks)** — REG-CS-001 R155, REG-CS-002 R156, REG-CS-003 CRA.
- Click **REG-CS-001 R155** deep link.
- **Talking point**: *"I land directly on my scope, not filtered globally. 3 tasks — that's what my team owns."*

## 1:00 – 2:30 · Jump to Rules, read R155 requirements (1:30)

- Land on `/rules?rule=REG-CS-001` with card auto-expanded.
- Read:
  - **Required documents (4)**: CSMS certificate application / CSMS process documentation / Vehicle type cybersecurity assessment / TARA.
  - **Required evidence (3)**: CSMS certificate from approval authority / Vehicle type-approval for cybersecurity / Continuous monitoring evidence.
  - **Submission timing**: CSMS certificate before vehicle type-approval; certificate valid max 3 years.
  - **Prerequisite standards**: ISO/SAE 21434 (from Sprint 3 provenance UI).
  - **Related: REG-CS-002 complements, REG-AD-001 requires** (deep links).
- Click REG-AD-001 related-link → R157 ALKS card opens.
- **Talking point**: *"My CSMS feeds directly into the ALKS approval. The tool shows me that link — I don't need a Confluence page."*

## 2:30 – 3:30 · Back to Plan · SOP-anchored Timeline (1:00)

- Hit browser back → `/plan`.
- Timeline left column: scroll down through segments:
  - **⚠ Overdue** (empty today in-demo — or populated depending on real date). Sprint 1 UX-006 fix ensures past items are here, not in Immediate.
  - **Immediate (Due in the next 3 months)**: today's 3-month horizon.
  - **Pre-SOP critical** (SOP − 12 to SOP − 3 = 2026-01 … 2026-10).
  - **Pre-SOP final** (SOP − 3 to SOP = 2026-10 … 2027-01).
- For each, show that the **cybersecurity-owned rules appear exactly once** in the correct bucket.
- **Talking point**: *"SOP is 2027-01-15. Pre-SOP critical window is hot right now. I can pre-commit capacity."*

## 3:30 – 4:30 · Status tab glance · deadline overdue labeling (1:00)

- Click Status tab.
- Top deadlines list uses **Sprint 1 UX-001 fix**: past items say "N months overdue" (red) not "-N mo remaining".
- Call out any overdue cybersecurity item (if any) and note the **countriesAtRiskDetail** reasoning: FR / NL `pending_overlay` with **"all rules placeholder (Phase 13+)"**.
- **Talking point**: *"Overdue items are flagged as overdue, not silently hidden. And I see FR / NL is pending overlay, not fake-covered."*

## 4:30 – 5:00 · Freshness spot-check (30 s)

- Back to `/rules?rule=REG-CS-001`.
- Point at FreshnessBadge — if present, show Fresh / Overdue / Drifted semantics.
- Open Glossary (⚙ menu) briefly to show the 6-state freshness explanation.
- **Talking point**: *"If an upstream drift is detected I'll see 'Drifted from source' here. Sprint 5 automated that."*

---

## Expected closing statement from stakeholder

> *"Weekly standup material, basically. I'd use this instead of my team's compliance tracker spreadsheet if I had an account for each of my 4 engineers."*

(Note: enterprise-level multi-user and RBAC are intentionally out of scope per plan §3.6 Non-goal #2. Note but do not promise.)

## Sprint 8 dry-run checklist

- [ ] Owner Dashboard opens to cybersecurity in ≤ 1 min
- [ ] At least one deep-link jump to Rules works (R155 or R156)
- [ ] Timeline shows SOP-anchored segments (Immediate / Pre-SOP critical / Pre-SOP final)
- [ ] Status tab overdue labeling is correct (Sprint 1 UX-001)
- [ ] FreshnessBadge or Glossary briefly shown
- [ ] Total time ≤ 5:30

© Yanhao FU
