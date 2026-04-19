# ADR-P1 · Keep localStorage, defer backend to Phase 14+

**Status**: Proposed · Path B plan §3.5
**Date**: 2026-04-18 (decision) · 2026-04-19 (documented)
**Reviewer**: yanhao

## Context

The adversarial review (Phase 12 V1) identified "localStorage single-user"
as the #1 enterprise-grade gap, and competitor research (SAP RCS /
Siemens Teamcenter / Dassault 3DEXPERIENCE) showed multi-user + RBAC +
audit log as table stakes at 2026 OEM scale.

However, Path B (plan §0.2 IS NOT list) explicitly scopes this tool as
an **OEM project team workbench**, not a multi-tenant enterprise
platform. The intended user set is:

- Homologation lead (daily usage)
- Domain team leaders (weekly usage)
- Management / VP (5-minute status checks)

All within a single OEM team's shared workshop-scale environment.

## Decision

**Keep the current localStorage-based zustand store.** Defer any server-
side persistence, RBAC, SSO, audit log, multi-tenant concerns to
Phase 14+ (if and when the tool's positioning changes from workbench
to enterprise platform).

## Consequences

### Positive

- Zero infrastructure cost. No database migrations, no DevOps.
- Zero latency on all reads / writes — pure in-browser operation.
- Trivial rollback: user clears browser storage.
- The 10 non-goals in plan §3.6 are all trivially honoured by absence
  of backend.

### Negative / known debt

- Multi-device continuity is not possible (a user on laptop + desktop
  sees two separate states).
- No audit trail beyond git history of rule content.
- Bulk / team-level usage patterns (comments, mentions, assignments)
  are out of reach.
- Cannot prove to a regulator "who changed what, when, why" without
  screen-capture discipline.
- No disaster recovery beyond user-controlled browser profile backup.

### Mitigations

- Export-as-PDF per tab (Phase G Sprint 10) gives users point-in-time
  snapshots they can archive.
- ScopeBanner + per-tab disclaimer make the "not legal advice" stance
  explicit so a stakeholder cannot later argue the tool was
  represented as a system of record.

## When to revisit

Revisit if **any** of the following become true:
- 2+ OEM projects actively using the tool concurrently.
- Regulator (e.g. KBA, DEKRA) requests audit trail as evidence.
- Legal counsel requires sign-off signatures on rule promotions.
- Team grows beyond 5 active authors (collaboration friction).

None of the above is expected during plan §3.4's 10-week window.

## Related

- ADR-P6 · Reusable-layer seams (identifies what would survive a
  future backend migration with minimal change).
- Plan §3.6 Non-goals #2 (Not SSO/RBAC/audit/SOC 2), #10 (Not backend
  server).

---

© Yanhao FU
