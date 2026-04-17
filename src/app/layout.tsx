import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "EU Vehicle Compliance Navigator",
  description:
    "Configuration-driven, source-governed compliance checklist foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
