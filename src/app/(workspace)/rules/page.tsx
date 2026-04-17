import { TabPlaceholder } from "@/components/shell/TabPlaceholder";

export const metadata = { title: "Rules · EU Compliance Navigator" };

export default function RulesPage() {
  return (
    <TabPlaceholder
      title="Rules"
      description="Rule detail grouped by trust level (Verified, Indicative, Pending authoring). Each card supports a Plain and Engineering view with natural-language condition explanations."
      arrivingIn="Phase C"
    />
  );
}
