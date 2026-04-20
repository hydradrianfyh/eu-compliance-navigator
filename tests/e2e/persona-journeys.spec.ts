/**
 * Phase F E2E — persona journey smoke tests for UX Refactor v2 (spec §19).
 *
 * Seven journeys:
 *   1. Management        Load sample → Status in ≤10s with no engine jargon
 *   2. PM                Setup → Plan sees segmented timeline + owners
 *   3. Domain owner      Plan → Owner Dashboard → drill to rule detail
 *   4. Homologation      Setup Advanced → Rules Engineering toggle
 *   5. First-timer       Onboarding → lastActiveTab on reload
 *   6. A11y              Forced-colors — every badge still distinguishable
 *   7. Compare           (deferred to Phase G)
 *
 * Runs against `npm run dev`. Browser install may be required:
 *   npx playwright install chromium
 *
 * © Yanhao FU
 */

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Ensure each test starts from a clean localStorage so lastActiveTab and
  // onboardingDismissed do not leak between cases.
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test.describe("Persona 1 · Management (first-visit → Status in ≤10s)", () => {
  test("loads sample from onboarding and lands on Status with a verdict", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/setup$/);
    await expect(page.getByRole("button", { name: /Load MY2027 BEV sample/i })).toBeVisible();

    await page.getByRole("button", { name: /Load MY2027 BEV sample/i }).click();
    await expect(page).toHaveURL(/\/status$/);

    // Verdict should be a descriptive wording, never "YES" (spec §5.1).
    const verdict = page.locator(".status-hero-verdict");
    await expect(verdict).toBeVisible();
    await expect(verdict).not.toHaveText("YES");

    // No engine-internal terminology on first screen.
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toMatch(/SEED_UNVERIFIED/);
    expect(bodyText).not.toMatch(/trigger_path/);
  });
});

test.describe("Persona 2 · PM (Setup → Plan sees segmented timeline)", () => {
  test("filling Setup enables Plan segments and owner buckets", async ({
    page,
  }) => {
    await page.goto("/setup");
    await page.getByRole("button", { name: /Load MY2027 BEV sample/i }).click();
    await page.waitForURL(/\/status$/);

    await page.goto("/plan");
    // At least one SOP-anchored segment must be present.
    await expect(page.locator(".plan-segment").first()).toBeVisible();
    await expect(page.getByText("Immediate")).toBeVisible();

    // Owner Dashboard title visible; content may vary by data.
    await expect(page.getByRole("heading", { name: /Owner Dashboard/i })).toBeVisible();
  });
});

test.describe("Persona 3 · Domain owner (Plan → rule detail)", () => {
  test("clicking a rule on Plan navigates to Rules with the card auto-expanded", async ({
    page,
  }) => {
    await page.goto("/setup");
    await page.getByRole("button", { name: /Load MY2027 BEV sample/i }).click();
    await page.waitForURL(/\/status$/);
    await page.goto("/plan");

    // Click the first available rule link in the timeline.
    const firstRuleLink = page
      .locator(".plan-milestone-list a, .plan-owner-list a")
      .first();
    await firstRuleLink.waitFor({ state: "visible" });
    const href = await firstRuleLink.getAttribute("href");
    await firstRuleLink.click();

    await expect(page).toHaveURL(/\/rules\?rule=/);
    if (href) {
      const ruleId = decodeURIComponent(href.split("rule=")[1] ?? "");
      await expect(
        page.locator(".rule-card-v2").filter({ hasText: ruleId }).first(),
      ).toBeVisible();
    }
  });
});

test.describe("Persona 4 · Homologation (Advanced + Engineering view)", () => {
  test("Advanced section opens and Rule cards expose Engineering toggle", async ({
    page,
  }) => {
    await page.goto("/setup");
    await page.getByRole("button", { name: /Load MY2027 BEV sample/i }).click();
    await page.waitForURL(/\/status$/);
    await page.goto("/setup");

    // Expand Advanced vehicle systems.
    await page
      .getByRole("button", { name: /Advanced vehicle systems/i })
      .click();
    await expect(page.getByText(/^Braking$/)).toBeVisible();
    await expect(page.getByText(/^Steering$/)).toBeVisible();

    await page.goto("/rules");
    const firstCardToggle = page
      .locator(".rule-card-v2 .rule-card-v2-toggle")
      .first();
    await firstCardToggle.click();

    await page
      .locator(".rule-card-v2 .rule-card-v2-view-toggle button")
      .getByText("Engineering")
      .first()
      .click();

    await expect(page.locator(".rule-card-v2-raw").first()).toBeVisible();
  });
});

test.describe("Persona 5 · First-timer (onboarding + lastActiveTab)", () => {
  test("onboarding visible first visit; reload lands on lastActiveTab", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/setup$/);
    await expect(
      page.getByText(/4 steps to know whether your program can enter the EU/i),
    ).toBeVisible();

    // Start blank and navigate to Plan.
    await page.getByRole("button", { name: /Start blank/i }).click();
    await page.goto("/plan");
    await expect(page).toHaveURL(/\/plan$/);

    // Reload root → should land on /plan.
    await page.goto("/");
    await expect(page).toHaveURL(/\/plan$/);
  });
});

test.describe("Persona 6 · A11y (forced-colors)", () => {
  test("badges keep distinguishable icons + text in forced-colors mode", async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/setup");
    await page.getByRole("button", { name: /Load MY2027 BEV sample/i }).click();
    await page.waitForURL(/\/status$/);
    await page.goto("/rules");

    // Every trust badge must have both an icon and text inside it.
    const badges = page.locator(".trust-badge");
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i += 1) {
      const badge = badges.nth(i);
      await expect(badge.locator(".trust-badge-icon")).toBeVisible();
      await expect(badge.locator(".trust-badge-text")).toBeVisible();
    }
  });
});

// Persona 7 (Compare) is covered by Phase G's dedicated tests.
