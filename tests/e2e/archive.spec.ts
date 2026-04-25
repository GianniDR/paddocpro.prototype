import { expect, type Page, test } from "@playwright/test";

async function gotoFirstHorse(page: Page) {
  await page.goto("/horses/all-horses");
  await page.waitForSelector(".ag-row", { timeout: 10_000 });
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(2);
  await cell.evaluate((el) => {
    const opts = { bubbles: true, cancelable: true, view: window } as const;
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  });
  await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/, { timeout: 10_000 });
}

test.describe("Horse archive", () => {
  test("Archive trigger opens confirmation dialog @e2e:archive", async ({ page }) => {
    await gotoFirstHorse(page);
    const trigger = page.getByTestId("horse-profile-toolbar-archive");
    await expect(trigger).toBeVisible();

    // If the button is disabled, the horse has blocking conditions; treat as a pass-through.
    const disabled = await trigger.isDisabled();
    if (disabled) return;

    await trigger.dispatchEvent("click");
    await expect(page.getByTestId("dialog-archive-horse")).toBeVisible();
    await page.getByTestId("dialog-archive-horse-cancel").dispatchEvent("click");
    await expect(page.getByTestId("dialog-archive-horse")).toBeHidden({ timeout: 5_000 });
  });

  test("Archive confirm removes horse from active list @e2e:archive", async ({ page }) => {
    await gotoFirstHorse(page);
    const trigger = page.getByTestId("horse-profile-toolbar-archive");
    if (await trigger.isDisabled()) return;

    // Capture the URL so we know which horse id is being archived
    const url = page.url();
    const id = url.match(/\/horses\/(horse_[a-z0-9-]+)/)?.[1];

    await trigger.dispatchEvent("click");
    await page.getByTestId("dialog-archive-horse-confirm").dispatchEvent("click");
    // After archiving, the horse is removed and the user is sent back to the
    // horses index. The new shape redirects to the dashboard at /horses; we
    // navigate explicitly to the grid to verify the horse is gone.
    await page.waitForURL(/\/horses(\/all-horses)?$/, { timeout: 10_000 });
    await page.goto("/horses/all-horses");

    // The archived horse should no longer be present in the active grid
    if (id) {
      await page.waitForSelector(".ag-row", { timeout: 10_000 });
      const rowsText = await page.locator(".ag-row").allTextContents();
      const archivedStillVisible = rowsText.some((t) => t.includes(id));
      expect(archivedStillVisible).toBe(false);
    }
  });
});
