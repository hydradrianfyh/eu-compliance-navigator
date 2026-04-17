import { TabPlaceholder } from "@/components/shell/TabPlaceholder";

export const metadata = { title: "Plan · EU Compliance Navigator" };

export default function PlanPage() {
  return (
    <TabPlaceholder
      title="Plan"
      description="Timeline of deadlines grouped by SOP-anchored segments (Immediate, Pre-SOP critical, Pre-SOP final, Post-SOP, Later) with the Owner Dashboard on the right."
      arrivingIn="Phase D"
    />
  );
}
