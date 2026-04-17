import type { FreshnessStatus } from "@/registry/schema";

const styles: Record<FreshnessStatus, { bg: string; text: string; label: string }> = {
  fresh: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Fresh" },
  due_soon: { bg: "bg-amber-100", text: "text-amber-800", label: "Review due soon" },
  overdue: { bg: "bg-orange-100", text: "text-orange-800", label: "Overdue" },
  critically_overdue: { bg: "bg-red-100", text: "text-red-800", label: "Critical" },
  never_verified: { bg: "bg-slate-200", text: "text-slate-700", label: "Never verified" },
};

export function FreshnessBadge({ status }: { status?: FreshnessStatus }) {
  if (!status) return null;
  const style = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
      title={`Freshness: ${style.label}`}
      data-testid={`freshness-badge-${status}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {style.label}
    </span>
  );
}
