import { expect, type Page, test } from "@playwright/test";

async function clickFirstRow(page: Page) {
  // AG Grid v35 + webkit + tailwind v4 has a layered DOM where Playwright's
  // built-in click sometimes doesn't reach the grid's onCellClicked handler.
  // Dispatch synthetic mousedown+mouseup+click on the first non-checkbox cell.
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(1);
  await cell.waitFor({ state: "visible", timeout: 10_000 });
  await cell.evaluate((el) => {
    const opts = { bubbles: true, cancelable: true, view: window } as const;
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  });
}

test.describe("Horses module", () => {
  test("grid loads with rows and a search bar @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await expect(page.getByTestId("horses-grid-search")).toBeVisible();
    await expect(page.getByTestId("horses-grid-cta")).toBeVisible();
    await expect(page.getByTestId("horses-grid-chip-row")).toBeVisible();
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    expect(await page.locator(".ag-row").count()).toBeGreaterThan(0);
  });

  test("filter chips toggle the grid @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await expect(page.getByTestId("chip-horses-isolating")).toBeVisible();
    await page.getByTestId("chip-horses-isolating").click();
    await page.waitForTimeout(200);
    await page.getByTestId("chip-horses-all").click();
  });

  test("row click opens horse profile with all 7 tabs @e2e:horses", async ({ page }) => {
    await page.goto("/horses");
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    await clickFirstRow(page);
    await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/, { timeout: 10_000 });
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
    await clickFirstRow(page);
    await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/, { timeout: 10_000 });
    await page.getByTestId("horse-profile-tab-health").click();
    await expect(page.getByTestId("horse-profile-tabpanel-health")).toBeVisible();
  });
});
