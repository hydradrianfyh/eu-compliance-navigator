"use client";

import dynamic from "next/dynamic";

const Phase3MainPage = dynamic(
  () =>
    import("@/components/phase3/Phase3MainPage").then(
      (module) => module.Phase3MainPage,
    ),
  {
    ssr: false,
  },
);

export default function HomePage() {
  return <Phase3MainPage />;
}
