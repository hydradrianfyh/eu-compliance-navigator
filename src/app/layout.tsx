import type { Metadata } from "next";

import {
  APP_AUTHOR_NAME,
  APP_AUTHOR_URL,
  APP_PRODUCT_NAME,
  APP_SHORT_NAME,
  getCopyrightLine,
} from "@/lib/app-info";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_PRODUCT_NAME,
    template: `%s · ${APP_SHORT_NAME}`,
  },
  description:
    "Configuration-driven, source-governed compliance checklist foundation.",
  applicationName: APP_SHORT_NAME,
  authors: APP_AUTHOR_URL
    ? [{ name: APP_AUTHOR_NAME, url: APP_AUTHOR_URL }]
    : [{ name: APP_AUTHOR_NAME }],
  creator: APP_AUTHOR_NAME,
  publisher: APP_AUTHOR_NAME,
  // Next 13+ doesn't have a first-class "copyright" field; the convention
  // is to stash it in `other` so it renders as <meta name="copyright">.
  other: {
    copyright: getCopyrightLine(),
  },
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
