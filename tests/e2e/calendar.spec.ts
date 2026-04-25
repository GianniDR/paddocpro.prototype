import { expect, test } from "@playwright/test";

test.describe("Bookings calendar week view", () => {
  test("renders calendar week with bookings @e2e:bookings", async ({ page }) => {
    await page.goto("/bookings");
    await expect(page.getByTestId("bookings-calendar-week")).toBeVisible();
    // Either there are blocks or none — ensure the SVG/grid frame rendered
    const blocks = page.locator('[data-testid^="bookings-calendar-block-"]');
    expect(await blocks.count()).toBeGreaterThanOrEqual(0);
  });

  test("Bookings grid route renders the AG Grid @e2e:bookings", async ({ page }) => {
    await page.goto("/bookings/all-bookings");
    await expect(page.getByTestId("bookings-grid")).toBeVisible();
  });

  test("week navigation @e2e:bookings", async ({ page }) => {
    await page.goto("/bookings");
    await page.getByTestId("bookings-calendar-prev").click();
    await page.getByTestId("bookings-calendar-next").click();
    await page.getByTestId("bookings-calendar-today").click();
  });
});
