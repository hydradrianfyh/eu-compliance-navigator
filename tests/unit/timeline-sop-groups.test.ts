/**
 * Phase D tests for SOP-anchored timeline grouping.
 * © Yanhao FU
 */

import { describe, expect, it } from "vitest";

import type { TimelineMilestone, TimelineOutput } from "@/engine/timeline";
import { groupTimelineBySOP } from "@/lib/timeline-sop-groups";

function milestone(month: string, title: string): TimelineMilestone {
  return {
    month,
    monthLabel: month,
    deadline_rules: [
      {
        stable_id: `REG-${title}`,
        title,
        short_label: title,
        owner_hint: "homologation",
        reason: "test",
        required_documents_count: 0,
        lifecycle_state: "ACTIVE",
      },
    ],
    evidence_due: [],
    review_due: [],
  };
}

function timelineFrom(months: string[]): TimelineOutput {
  return {
    sop_month: "2027-01",
    first_registration_month: "2027-04",
    milestones: months.map((m, i) => milestone(m, `rule-${i}`)),
    unscheduled: [],
    range_start: months[0] ?? "",
    range_end: months[months.length - 1] ?? "",
  };
}

describe("groupTimelineBySOP · SOP anchor", () => {
  const today = new Date("2026-04-17");
  const sopDate = "2027-01-15";

  it("puts today + 3 months into Immediate", () => {
    const t = timelineFrom(["2026-04", "2026-06"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.anchor).toBe("sop");
    expect(g.segments.find((s) => s.id === "immediate")?.milestones).toHaveLength(
      2,
    );
  });

  it("puts SOP - 12 mo to SOP - 3 mo into Pre-SOP critical when beyond Immediate window", () => {
    // Today 2026-04-17 → Immediate covers 2026-04..2026-07.
    // 2026-09 is 5 months out, still in Pre-SOP critical (SOP - 4 mo).
    const t = timelineFrom(["2026-09"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(
      g.segments.find((s) => s.id === "pre_sop_critical")?.milestones,
    ).toHaveLength(1);
  });

  it("puts SOP - 3 mo to SOP into Pre-SOP final", () => {
    const t = timelineFrom(["2026-11", "2026-12"]); // SOP = 2027-01, so SOP - 3 = 2026-10
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(
      g.segments.find((s) => s.id === "pre_sop_final")?.milestones,
    ).toHaveLength(2);
  });

  it("puts SOP to SOP + 12 mo into Post-SOP", () => {
    const t = timelineFrom(["2027-06", "2027-12"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.segments.find((s) => s.id === "post_sop")?.milestones).toHaveLength(
      2,
    );
  });

  it("puts > SOP + 12 mo into Later", () => {
    const t = timelineFrom(["2028-06", "2030-01"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.segments.find((s) => s.id === "later")?.milestones).toHaveLength(2);
  });

  it("exposes unscheduled as its own segment", () => {
    const t: TimelineOutput = {
      sop_month: "2027-01",
      first_registration_month: "2027-04",
      milestones: [],
      unscheduled: [
        {
          stable_id: "REG-x",
          title: "Unscheduled rule",
          short_label: "U",
          owner_hint: "legal",
          reason: "",
          required_documents_count: 0,
          lifecycle_state: "ACTIVE",
        },
      ],
      range_start: "",
      range_end: "",
    };
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.unscheduled.milestones).toHaveLength(1);
  });
});

describe("groupTimelineBySOP · fallback anchors", () => {
  it("falls back to firstRegistrationDate when SOP is null", () => {
    const t = timelineFrom(["2027-05"]);
    const g = groupTimelineBySOP(t, null, "2027-06-01", new Date("2026-04-17"));
    expect(g.anchor).toBe("first_registration");
  });

  it("falls back to calendar anchor when both dates are null", () => {
    const t = timelineFrom(["2026-05", "2027-05"]);
    const g = groupTimelineBySOP(t, null, null, new Date("2026-04-17"));
    expect(g.anchor).toBe("calendar");
    // 2026-05 is within 3 months of today → Immediate
    expect(g.segments.find((s) => s.id === "immediate")?.milestones).toHaveLength(
      1,
    );
    // 2027-05 is far → Later
    expect(g.segments.find((s) => s.id === "later")?.milestones).toHaveLength(1);
  });
});

describe("groupTimelineBySOP · Overdue segment (UX-006 fix)", () => {
  const today = new Date("2026-04-17");
  const sopDate = "2027-01-15";

  it("puts months strictly before current month into Overdue (not Immediate)", () => {
    // Feb 2025 is way before today (Apr 2026) — regression case from PDF bug
    const t = timelineFrom(["2025-02", "2025-08", "2026-02"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.segments.find((s) => s.id === "overdue")?.milestones).toHaveLength(
      3,
    );
    expect(g.segments.find((s) => s.id === "immediate")?.milestones).toHaveLength(
      0,
    );
  });

  it("current month still counts as Immediate, not Overdue", () => {
    const t = timelineFrom(["2026-04"]); // same month as today
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.segments.find((s) => s.id === "overdue")?.milestones).toHaveLength(
      0,
    );
    expect(g.segments.find((s) => s.id === "immediate")?.milestones).toHaveLength(
      1,
    );
  });

  it("Overdue segment is first in segment order (most-urgent on top)", () => {
    const t = timelineFrom(["2025-02"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.segments[0].id).toBe("overdue");
  });

  it("Overdue segment is expanded by default", () => {
    const t = timelineFrom(["2025-02"]);
    const g = groupTimelineBySOP(t, sopDate, null, today);
    expect(g.segments.find((s) => s.id === "overdue")?.defaultExpanded).toBe(
      true,
    );
  });

  it("under calendar fallback, past months still go to Overdue not Immediate", () => {
    const t = timelineFrom(["2025-02"]);
    const g = groupTimelineBySOP(t, null, null, today);
    expect(g.anchor).toBe("calendar");
    expect(g.segments.find((s) => s.id === "overdue")?.milestones).toHaveLength(
      1,
    );
  });
});
