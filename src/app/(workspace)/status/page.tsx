import { TabPlaceholder } from "@/components/shell/TabPlaceholder";

export const metadata = { title: "Status · EU Compliance Navigator" };

export default function StatusPage() {
  return (
    <TabPlaceholder
      title="Status"
      description="Market-entry readiness: can-enter-market headline, confidence, four coverage metrics, top blockers, top deadlines, countries at risk."
      arrivingIn="Phase C"
    />
  );
}
