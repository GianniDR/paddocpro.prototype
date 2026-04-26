import { expect, test } from "@playwright/test";

/**
 * One test = one scene = one MP4. Each test holds for a target number of seconds
 * matching the composition timeline in ../composition.html.
 *
 * Playwright stores videos under outputDir; we move/rename them afterwards via the
 * shell script in ../record-scenes.sh.
 */

const SECOND = 1000;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
});

test("scene-3-dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(6 * SECOND);
});

test("scene-4-horses-grid-and-profile", async ({ page }) => {
  await page.goto("/horses/all-horses");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2 * SECOND);

  // Hover Isolating chip
  const chip = page.getByTestId("chip-isolating");
  if (await chip.count()) await chip.hover();
  await page.waitForTimeout(1.5 * SECOND);

  // Click first horse row
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(2);
  await cell.evaluate((el) => {
    const opts = { bubbles: true, cancelable: true, view: window } as const;
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  });
  await page.waitForURL(/\/horses\/horse_/, { timeout: 5_000 });
  await page.waitForTimeout(1.5 * SECOND);

  // Walk through tabs
  for (const tab of [
    "horse-profile-tab-health",
    "horse-profile-tab-bookings",
    "horse-profile-tab-documents",
    "horse-profile-tab-charges",
    "horse-profile-tab-profile",
  ]) {
    const t = page.getByTestId(tab);
    if (await t.count()) {
      await t.dispatchEvent("click");
      await page.waitForTimeout(1.2 * SECOND);
    }
  }
});

test("scene-5-paddy", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1 * SECOND);

  // Open Paddy via custom event (avoids ⌘J browser eccentricities)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("paddy:toggle"));
  });
  await page.waitForTimeout(2 * SECOND);

  // Try clicking a suggestion if visible — falls back to typing
  const suggestion = page.getByTestId("paddy-composer-suggestion-0");
  if (await suggestion.count()) {
    await suggestion.dispatchEvent("click");
  } else {
    const composer = page.locator('[data-testid*="paddy-composer"] textarea').first();
    if (await composer.count()) {
      await composer.click();
      await composer.pressSequentially("Which horses are overdue for vaccinations?", {
        delay: 30,
      });
      await page.keyboard.press("Enter");
    }
  }
  await page.waitForTimeout(10 * SECOND);
});

test("scene-6-yard-map-and-tenant", async ({ page }) => {
  await page.goto("/stables");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2 * SECOND);

  // Click any stable cell on the SVG yard map
  const stableCell = page.locator('[data-testid^="yard-stable-"]').first();
  if (await stableCell.count()) {
    await stableCell.dispatchEvent("click");
    await page.waitForTimeout(2 * SECOND);
    await page.goBack();
    await page.waitForTimeout(1 * SECOND);
  }

  // Open tenant switcher and pick the second tenant
  const switcher = page.locator('[data-testid*="tenant-switcher"]').first();
  if (await switcher.count()) {
    await switcher.dispatchEvent("click");
    await page.waitForTimeout(800);
    const secondTenant = page.locator('[role="menuitem"]').nth(1);
    if (await secondTenant.count()) {
      await secondTenant.dispatchEvent("click");
      await page.waitForTimeout(2 * SECOND);
    }
  }
  await page.waitForTimeout(2 * SECOND);
});

test("scene-7a-audit-log", async ({ page }) => {
  await page.goto("/settings/audit-log");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2.5 * SECOND);
});

test("scene-7b-incidents", async ({ page }) => {
  await page.goto("/incidents/all-incidents");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1 * SECOND);
  // Click a row to show incident detail
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(2);
  if (await cell.count()) {
    await cell.evaluate((el) => {
      const opts = { bubbles: true, cancelable: true, view: window } as const;
      el.dispatchEvent(new MouseEvent("click", opts));
    });
    await page.waitForTimeout(1.5 * SECOND);
  }
});

test("scene-7c-rbac", async ({ page }) => {
  await page.goto("/settings/rbac");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2.5 * SECOND);
});

test("scene-7d-finance", async ({ page }) => {
  await page.goto("/finance/all-invoices");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1 * SECOND);
  // Open Actions menu, then run monthly invoicing
  const actions = page.getByTestId("feature-actions-menu");
  if (await actions.count()) {
    await actions.dispatchEvent("click");
    await page.waitForTimeout(800);
    const run = page.getByTestId("finance-grid-run-monthly");
    if (await run.count()) {
      await run.dispatchEvent("click");
      await page.waitForTimeout(1500);
    }
  } else {
    await page.waitForTimeout(2 * SECOND);
  }
});
