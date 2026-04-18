/**
 * Time-aware months-remaining label (UX-001 fix).
 *
 * The engine's `DeadlineItem.months_remaining` is a signed integer:
 *   - positive: deadline is in the future
 *   - zero:     deadline is this calendar month
 *   - negative: deadline is in the past (overdue)
 *
 * Prior to this helper, both the Status tab and the legacy Executive
 * Summary panel rendered the raw integer with "mo remaining" regardless
 * of sign, producing nonsense like "-14 mo remaining" for a deadline
 * that passed 14 months ago.
 *
 * © Yanhao FU
 */

export function formatMonthsLabel(months: number): string {
  if (!Number.isFinite(months)) return "unknown";

  if (months === 0) return "this month";
  if (months === 1) return "in 1 month";
  if (months > 1) return `in ${months} months`;
  if (months === -1) return "1 month overdue";
  return `${Math.abs(months)} months overdue`;
}

/**
 * Convenience for "chip" style rendering where we want just the
 * signed magnitude with a status word.
 *
 * Example output:
 *   - `{ magnitude: 14, status: "overdue" }` for months = -14
 *   - `{ magnitude: 7, status: "remaining" }` for months = 7
 *   - `{ magnitude: 0, status: "due_now" }` for months = 0
 */
export interface MonthsBreakdown {
  magnitude: number;
  status: "remaining" | "due_now" | "overdue";
}

export function breakdownMonths(months: number): MonthsBreakdown {
  if (!Number.isFinite(months)) {
    return { magnitude: 0, status: "due_now" };
  }
  if (months === 0) return { magnitude: 0, status: "due_now" };
  if (months > 0) return { magnitude: months, status: "remaining" };
  return { magnitude: Math.abs(months), status: "overdue" };
}
