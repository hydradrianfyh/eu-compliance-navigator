# Phase L — UNECE Annex II Completion

Phase L delivered UNECE factory unlock + bare-stub content fill-in + BEV-priority
ACTIVE-ization across 3 sequential rounds (L.1, L.2, L.3).

- Spec: [`docs/superpowers/specs/2026-04-22-unece-annex-ii-completion-design.md`](../superpowers/specs/2026-04-22-unece-annex-ii-completion-design.md) (+ `-zh.md`)
- Plan: [`docs/superpowers/plans/2026-04-22-phase-l-unece-annex-ii.md`](../superpowers/plans/2026-04-22-phase-l-unece-annex-ii.md)

## Round outcomes

| Round | Commit | What shipped |
|---|---|---|
| L.1 | `9a1dcf5` | Factory unlock via `UneceAuthored.lifecycleOverride` + 5 new unit tests. `canPromote` gate requires all of: deep-link URL (≠ `UNECE_PRIMARY_PORTAL`), revision label, `lastVerifiedOn`, `humanReviewer`. |
| L.2 | `bb87e4c` | 11 bare factory-stub UNECE rules enriched with authored blocks (obligation text, evidence tasks, related refs, powertrain gating) — all kept at `SEED_UNVERIFIED`. |
| L.3 | (this commit) | 12 of 12 BEV-priority UNECE rules promoted to ACTIVE via the L.1 factory unlock. |

## Delta metrics

| Metric | Before Phase L | After Phase L |
|---|---|---|
| Registry total rules | 196 | 196 (unchanged — pure promotions) |
| Global ACTIVE rules | 73 | **85** (+12) |
| UNECE ACTIVE rules | 1 (REG-UN-100 only) | **13** (+12) |
| BEV × DE pilot APPLICABLE | 30 | **42** (+12) |
| BEV × DE pilot CONDITIONAL | 47 | 36 (−11) |
| BEV × DE pilot UNKNOWN | 70 | 69 (−1) |
| Verification backlog pending | 123 | 111 (−12) |
| Tests | 230 | **236** (+6 from L.1 factory tests + L.3 positive-case extension) |

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

## What's next (not in Phase L)

- **Phase L.4 candidate**: add missing R-numbers still absent from the
  registry (R7 exterior projections, R28 audible warning, R30 car tyres,
  R87 DRL, R112 asymmetric headlamps, R113 symmetric headlamps, R116
  anti-theft, R125 driver forward vision, R128 LED retrofit).
- **Phase L.5+ candidate**: second ACTIVE-promotion batch for remaining
  authored UNECE rules (R14, R21, R25, R34, R43, R44, R51, R83, R85,
  R118, R129, R134, R135, R137, R138, R140, R141, R142, R145, R149,
  R158, etc.) as deep-link URLs are verified.
- **Phase L never-planned**: CBAM / customs / non-EU market UNECE
  expansion (explicit non-goal per AGENTS.md).
