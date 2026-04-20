/**
 * Single source of truth for app-level branding: product name, author,
 * copyright holder. Any UI footer / head metadata / print header that
 * needs to show "© Yanhao FU" must import from here so the value is
 * changed in one place only.
 *
 * © Yanhao FU
 */

export const APP_PRODUCT_NAME = "EU Vehicle Compliance Navigator";
export const APP_SHORT_NAME = "EU Compliance Navigator";

export const APP_AUTHOR_NAME = "Yanhao FU";
export const APP_AUTHOR_URL: string | null = null; // set when publishing

/**
 * Copyright start year. The visible range auto-extends to the current
 * calendar year (e.g. "2026-2028") via {@link getCopyrightYearRange}.
 */
export const APP_COPYRIGHT_START_YEAR = 2026;

/** "2026" or "2026-2028" depending on current year. */
export function getCopyrightYearRange(now: Date = new Date()): string {
  const currentYear = now.getUTCFullYear();
  if (currentYear <= APP_COPYRIGHT_START_YEAR) {
    return String(APP_COPYRIGHT_START_YEAR);
  }
  return `${APP_COPYRIGHT_START_YEAR}–${currentYear}`;
}

/** Ready-made "© 2026 Yanhao FU · All rights reserved." for UI footers. */
export function getCopyrightLine(now: Date = new Date()): string {
  return `© ${getCopyrightYearRange(now)} ${APP_AUTHOR_NAME} · All rights reserved.`;
}
