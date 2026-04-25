import { expect, test } from "@playwright/test";

test.describe("Yard map", () => {
  test("renders SVG with stable cells @e2e:yard-map", async ({ page }) => {
    await page.goto("/stables");
    await expect(page.getByTestId("yard-map")).toBeVisible();
    // At least one stable rendered as a clickable group
    const cells = page.locator('[data-testid^="yard-map-stable-"]');
    expect(await cells.count()).toBeGreaterThan(0);
  });

  test("clicking a stable opens its sheet @e2e:yard-map", async ({ page }) => {
    await page.goto("/stables");
    await expect(page.getByTestId("yard-map")).toBeVisible();
    const cell = page.locator('[data-testid^="yard-map-stable-"]').first();
    await cell.click();
    await expect(page.getByTestId("stable-sheet")).toBeVisible();
  });

  test("Grid view toggles to AG Grid @e2e:yard-map", async ({ page }) => {
    await page.goto("/stables");
    await page.getByTestId("stables-view-grid").click();
    await expect(page.getByTestId("stables-grid")).toBeVisible();
  });
});
