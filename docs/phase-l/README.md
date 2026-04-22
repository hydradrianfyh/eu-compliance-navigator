# Phase L — UNECE Annex II Completion

Phase L delivered UNECE factory unlock + bare-stub content fill-in + BEV-priority
ACTIVE-ization across 3 sequential rounds (L.1, L.2, L.3), followed by missing
R-number addition (L.4), second promotion batch (L.5), and ES SEED_UNVERIFIED
cleanup (L.6).

- Spec: [`docs/superpowers/specs/2026-04-22-unece-annex-ii-completion-design.md`](../superpowers/specs/2026-04-22-unece-annex-ii-completion-design.md) (+ `-zh.md`)
- Plan (L.1–L.3): [`docs/superpowers/plans/2026-04-22-phase-l-unece-annex-ii.md`](../superpowers/plans/2026-04-22-phase-l-unece-annex-ii.md)
- Plan (L.4–L.6): [`docs/superpowers/plans/2026-04-22-phase-l-round-4-5-6.md`](../superpowers/plans/2026-04-22-phase-l-round-4-5-6.md)

## Round outcomes

| Round | Commit | What shipped |
|---|---|---|
| L.1 | `9a1dcf5` | Factory unlock via `UneceAuthored.lifecycleOverride` + 5 new unit tests. `canPromote` gate requires all of: deep-link URL (≠ `UNECE_PRIMARY_PORTAL`), revision label, `lastVerifiedOn`, `humanReviewer`. |
| L.2 | `bb87e4c` | 11 bare factory-stub UNECE rules enriched with authored blocks (obligation text, evidence tasks, related refs, powertrain gating) — all kept at `SEED_UNVERIFIED`. |
| L.3 | `4adecf3` | 12 of 12 BEV-priority UNECE rules promoted to ACTIVE via the L.1 factory unlock. |
| L.4 | `d44d779` | 9 missing R-numbers (R7, R28, R30, R87, R112, R113, R116, R125, R128) added as authored `SEED_UNVERIFIED` stubs. Portal URL, obligation text, component-level vs whole-vehicle scope, cross-references (R48 / R149) recorded. No promotions. |
| L.5 | (this commit) | 14 of 20 target UNECE rules promoted to ACTIVE via the L.1 factory unlock. 6 deferred (R25, R51, R101, R140, R34, R145) pending deep-link URL verification. R83 trigger logic enriched with `hasCombustionEngine` gating (excludes BEV / FCEV correctly). |

## Delta metrics

| Metric | Before Phase L | After L.3 | After L.4 | After L.5 |
|---|---|---|---|---|
| Registry total rules | 196 | 196 | 205 | 205 (unchanged — pure promotions) |
| Global ACTIVE rules | 73 | 85 (+12) | 85 | **99** (+14) |
| UNECE ACTIVE rules | 1 (REG-UN-100 only) | 13 (+12) | 13 | **27** (+14) |
| UNECE authored rules | 33 | 39 | 48 | 48 (unchanged) |
| BEV × DE pilot APPLICABLE | 30 | 42 (+12) | 42 | **51** (+9) |
| BEV × DE pilot CONDITIONAL | 47 | 36 | 36 | **27** (−9) |
| BEV × DE pilot UNKNOWN | 70 | 69 | 78 | 78 |
| Verification backlog pending | 123 | 111 | 120 | **106** (−14) |
| Tests | 230 | 236 | 236 | 236 (unchanged; L.5 snapshot refresh) |

## Rules promoted to ACTIVE in L.3

| Rule | Title | URL |
|---|---|---|
| REG-UN-010 | R10 EMC (Electromagnetic Compatibility) | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2019/E-ECE-324-Add.9-Rev.6.pdf` (Rev.6 / 06 series) |
| REG-UN-013H | R13-H Passenger Car Braking | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2018/R013hr4e.pdf` (Rev.4) |
| REG-UN-016 | R16 Safety Belts and Restraint Systems | `https://www.unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2018/R016r9e.pdf` (Rev.9) |
| REG-UN-017 | R17 Seat Strength | `https://unece.org/transport/documents/2023/08/standards/un-regulation-no-17-rev7` (Rev.7) |
| REG-UN-046 | R46 Rear-View Mirrors / CMS | `https://unece.org/transport/documents/2023/07/standards/regulation-no-46-revision-7` (Rev.7) |
| REG-UN-048 | R48 Installation of Lighting | `https://www.unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2015/R048r12e.pdf` (Rev.12 / 07 series) |
| REG-UN-079 | R79 Steering Equipment | `https://unece.org/sites/default/files/2024-04/R079r5e.pdf` (Rev.5 / 04 series) |
| REG-UN-094 | R94 Frontal Collision Protection | `https://unece.org/transport/documents/2022/12/standards/regulation-no-94-rev4` (Rev.4) |
| REG-UN-095 | R95 Side Collision Protection | `https://unece.org/transport/documents/2024/02/standards/un-regulation-no-95-revision-4-amendment-3` (Rev.4 Am.3) |
| REG-UN-117 | R117 Tyres (Rolling Resistance / Noise / Wet Grip) | `https://unece.org/sites/default/files/2025-09/R117r5e.pdf` (Rev.5) |
| REG-UN-127 | R127 Pedestrian Safety | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2018/R127r2e.pdf` (Rev.2 / 02 series) |
| REG-UN-152 | R152 Advanced Emergency Braking System (M1/N1) | `https://unece.org/transport/documents/2023/06/standards/un-regulation-no-152-rev2` (Rev.2) |

All 12 promotions carry `lastVerifiedOn: 2026-04-22`, `humanReviewer: yanhao`,
`promotedOn: 2026-04-22`, `promotedBy: phase-l-round-3`.

## Rules held back (none)

The research round resolved deep-link UNECE URLs for all 12 candidates — a
mix of the modern `/transport/documents/YYYY/MM/standards/…` pattern (6
rules), the stable `fileadmin/DAM/trans/main/wp29/wp29regs/…` pattern (5
rules), and the `sites/default/files/YYYY-MM/…` pattern (2 rules: R79,
R117). Every URL is present in `unece.org` search results tied to the
correct regulation + revision; none were fabricated.

Where the most recent consolidated text was ambiguous (e.g. R48 08/09
series proposals, R117 04 series proposals, R127 03 series proposals, R94
05 series in force since 2024 but no `rev5` deep link yet), the rule uses
the last confirmed consolidated revision + a `temporalNotes` field
flagging the pending upgrade with `[verify]`. This is conservative and
preserves auditability.

## Governance + regression posture

- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npx vitest run` — 236/236 green
- `tests/unit/governance.test.ts` — 3/3 green; `activeWithoutUrl` /
  `activeWithoutOjReference` / `activeWithoutVerification` all `[]`
- Pilot regression anchor: `applicable_ids` grew by 12; no removals
- Verification backlog: `docs/phase-j/verification-backlog.md`
  regenerated (`npm run verification-backlog`)

## Rules added in L.4 (9 authored `SEED_UNVERIFIED` stubs)

| Rule | R-number | Title | Scope |
|---|---|---|---|
| REG-UN-007 | R7 | Position / Stop / Direction-Indicator / End-Outline Marker Lamps | Component-level · M / N · complements R48 |
| REG-UN-028 | R28 | Audible Warning Devices (Horns) | Component-level · M / N |
| REG-UN-030 | R30 | Pneumatic Tyres for Passenger Cars and Trailers | Component-level · M1, O1, O2 · complements R117 / R142 |
| REG-UN-087 | R87 | Daytime Running Lamps (DRL) | Component-level · M / N · complements R48 / R7 |
| REG-UN-112 | R112 | Asymmetrical Passing-Beam Headlamps (Filament / Halogen / HID) | Component-level · M / N · R149 supersedes for LED / ADB |
| REG-UN-113 | R113 | Symmetrical Passing-Beam Headlamps | Component-level · M / N · R149 supersedes for LED / ADB |
| REG-UN-116 | R116 | Protection Against Unauthorized Use (Anti-Theft) | Whole-vehicle · M1 / N1 |
| REG-UN-125 | R125 | Driver's Forward Field of View | Whole-vehicle · M1 |
| REG-UN-128 | R128 | LED Light Sources | Component-level · M / N · complements R48 / R149 / R7 / R87 |

All 9 rules use `UNECE_PRIMARY_PORTAL` as `officialUrl` (deep-link verification deferred to L.7), no `revisionLabel`, no `applyToNewTypesFrom` / `applyToAllNewVehiclesFrom` — the lifecycle stays `SEED_UNVERIFIED` and the hard gate ensures UNKNOWN result on any config.

## Rules promoted to ACTIVE in L.5 (14 rules)

| Rule | Title | URL | Revision |
|---|---|---|---|
| REG-UN-014 | R14 Safety Belt Anchorages | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2020/R014r6e.pdf` | Rev.6 (07 series) |
| REG-UN-021 | R21 Interior Fittings | `https://unece.org/sites/default/files/2021-05/R021r2am3e.pdf` | Rev.2 Am.3 |
| REG-UN-043 | R43 Safety Glazing | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/R043r3e.pdf` | Rev.3 |
| REG-UN-044 | R44 Child Restraint Systems (legacy) | `https://www.unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/r044r2e.pdf` | Rev.2 (04 series) |
| REG-UN-083 | R83 Pollutant Emissions (LD) | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2020/R083r5am8e.pdf` | Rev.5 Am.8 (07 series) |
| REG-UN-129 | R129 i-Size Child Restraints | `https://unece.org/sites/default/files/2021-05/R129r4e.pdf` | Rev.4 (03 series) |
| REG-UN-134 | R134 Hydrogen Vehicle Safety | `https://unece.org/sites/default/files/2025-01/R134r1am3e.pdf` | Rev.1 Am.3 |
| REG-UN-138 | R138 AVAS (BEV / FCEV silent vehicles) | `https://unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2017/R138r1e.pdf` | Rev.1 (01 series) |
| REG-UN-141 | R141 TPMS | `https://www.unece.org/fileadmin/DAM/trans/main/wp29/wp29regs/2017/R141e.pdf` | Original (00 series) |
| REG-UN-142 | R142 Tyre Installation | `https://unece.org/transport/documents/2022/11/standards/un-regulation-no-142-rev-1-amend-1` | Rev.1 Am.1 (01 series) |
| REG-UN-149 | R149 LED / ADB Headlamp | `https://unece.org/sites/default/files/2021-03/R149e.pdf` | Original (00 series) |
| REG-UN-153 | R153 Fuel System Integrity (Rear Impact) | `https://unece.org/transport/documents/2021/03/standards/un-regulation-no-153-fuel-system-integrity-and-electric-power` | original + Am.4 (2024) |
| REG-UN-158 | R158 Reversing Detection Devices | `https://unece.org/sites/default/files/2024-02/R158am2e.pdf` | Original + Am.2 |
| REG-UN-160 | R160 Event Data Recorder (EDR) | `https://unece.org/sites/default/files/2023-10/R160E.pdf` | Original + Am.2 |

All 14 promotions carry `lastVerifiedOn: 2026-04-22`, `humanReviewer: yanhao`, `promotedOn: 2026-04-22`, `promotedBy: phase-l-round-5`. R44 and R142 reused existing L.2-enriched deep links. R83 extended with `hasCombustionEngine` trigger gating so BEV / FCEV correctly evaluate to NOT_APPLICABLE.

## Rules held back in L.5 (6 deferred)

| Rule | Reason |
|---|---|
| REG-UN-025 (R25 Head Restraints) | Consolidated PDF deep link not located on unece.org — only landing-page references. EUR-Lex mirrors exist; defer to a Phase L.7 targeted round. |
| REG-UN-051 (R51 Noise Emissions) | No `fileadmin` or `sites/default/files` deep-link confirmed for the 03-series Rev.3/Rev.4 consolidated text. |
| REG-UN-101 (R101 CO2 + Fuel/Energy Consumption LD) | Agent found a `ECE-TRANS-WP29-2025-101e_clean.pdf` working-doc URL; not a consolidated-regulation deep link. Also being superseded by R154 for new approvals. |
| REG-UN-140 (R140 ESC) | Portal-only path; consolidated PDF not found. Amendments Supp.1-3 exist but no single consolidated URL. |
| REG-UN-034 (R34 Fire Prevention — Fuel Tank) | Only admin-doc URL (WP.29-194-14e.pdf) found, not a standalone R34 consolidated PDF. |
| REG-UN-145 (R145 ISOFIX Anchorages) | 00 series (2017) + supplements 1-4 tracked in GAR but no stable consolidated deep link on unece.org. |

All 6 remain at SEED_UNVERIFIED with portal URL — factory hard gate ensures UNKNOWN / CONDITIONAL result only.

## What's next

- **Phase L.6** (in-flight): ES SEED_UNVERIFIED cleanup — verify + promote REG-MS-ES-007 / -008 / -013 (Etiqueta Ambiental, Homologación Individual, RD 106/2008 batteries waste).
- **Phase L.7** (not yet scheduled): deep-link URL verification for the 9 R-numbers added in L.4 (R7, R28, R30, R87, R112, R113, R116, R125, R128); re-attempt deep-link verification for the 6 L.5 holdouts (R25, R51, R101, R140, R34, R145); HD / bus / niche rules (R13, R49, R58, R66, R67, R85, R110, R115, R118, R135, R137).
- **Phase L never-planned**: CBAM / customs / non-EU market UNECE expansion (explicit non-goal per AGENTS.md).
