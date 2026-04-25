import { expect, test } from "@playwright/test";

test.describe("Horses module", () => {
  test("grid loads with rows and a search bar @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await expect(page.getByTestId("horses-grid-search")).toBeVisible();
    await expect(page.getByTestId("horses-grid-cta")).toBeVisible();
    await expect(page.getByTestId("horses-grid-chip-row")).toBeVisible();
    // Wait for AG Grid to render at least one row.
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    expect(await page.locator(".ag-row").count()).toBeGreaterThan(0);
  });

  test("filter chips toggle the grid @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await expect(page.getByTestId("chip-horses-isolating")).toBeVisible();
    await page.getByTestId("chip-horses-isolating").click();
    // After applying, grid still renders (count may be 0 or 1).
    await page.waitForTimeout(200);
    await page.getByTestId("chip-horses-all").click();
  });

  test("row click opens horse profile with all 7 tabs @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    await page.locator(".ag-row").first().click();
    await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/);
    await expect(page.getByTestId("horse-profile-toolbar")).toBeVisible();
    for (const tab of [
      "horse-profile-tab-profile",
      "horse-profile-tab-health",
      "horse-profile-tab-bookings",
      "horse-profile-tab-documents",
      "horse-profile-tab-feed",
      "horse-profile-tab-charges",
      "horse-profile-tab-activity",
    ]) {
      await expect(page.getByTestId(tab)).toBeVisible();
    }
    await expect(page.getByTestId("horse-profile-toolbar-cta")).toBeVisible();
  });

  test("horse profile health tab shows event history @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    await page.locator(".ag-row").first().click();
    await page.getByTestId("horse-profile-tab-health").click();
    await expect(page.getByTestId("horse-profile-tabpanel-health")).toBeVisible();
  });
});
