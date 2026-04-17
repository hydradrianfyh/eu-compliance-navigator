import { TabPlaceholder } from "@/components/shell/TabPlaceholder";

export const metadata = { title: "Setup · EU Compliance Navigator" };

export default function SetupPage() {
  return (
    <TabPlaceholder
      title="Setup"
      description="Enter your vehicle program: program and market, homologation basis, propulsion, ADAS, digital and cockpit, readiness. Advanced vehicle systems live in a collapsible section."
      arrivingIn="Phase B"
    />
  );
}
