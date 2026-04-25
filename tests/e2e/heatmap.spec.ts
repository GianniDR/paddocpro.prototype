import { expect, test } from "@playwright/test";

test.describe("Health heatmap", () => {
  test("renders heatmap and drills to horse @e2e:heatmap", async ({ page }) => {
    await page.goto("/health");

    // The heatmap is now part of the Health Dashboard at /health
    await expect(page.getByTestId("health-heatmap")).toBeVisible();

    // At least one drill-to-horse link rendered
    const cell = page.locator('[data-testid^="heatmap-horse_"]').first();
    await cell.waitFor({ state: "visible", timeout: 10_000 });
    const tid = await cell.getAttribute("data-testid");
    expect(tid).toMatch(/heatmap-horse_[a-z0-9-]+-(vaccination|worming|farrier|dental)/);

    await cell.dispatchEvent("click");
    await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/, { timeout: 10_000 });
  });

  test("All events grid route renders rows @e2e:heatmap", async ({ page }) => {
    await page.goto("/health/all-events");
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    expect(await page.locator(".ag-row").count()).toBeGreaterThan(0);
  });
});
