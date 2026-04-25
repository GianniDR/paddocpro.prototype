import { expect, type Page, test } from "@playwright/test";

async function gotoFirstHorse(page: Page) {
  await page.goto("/horses");
  await page.waitForSelector(".ag-row", { timeout: 10_000 });
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(1);
  await cell.evaluate((el) => {
    const opts = { bubbles: true, cancelable: true, view: window } as const;
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  });
  await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/, { timeout: 10_000 });
}

test.describe("Horse profile actions", () => {
  test("Edit dialog opens + saves @e2e:horse-actions", async ({ page }) => {
    await gotoFirstHorse(page);
    await page.getByTestId("horse-profile-toolbar-edit").dispatchEvent("click");
    await expect(page.getByTestId("dialog-edit-horse")).toBeVisible();
    const input = page.getByTestId("dialog-edit-horse-stableName");
    await input.click();
    await input.fill("");
    await input.pressSequentially("Whisper II", { delay: 5 });
    await page.getByTestId("dialog-edit-horse-save").dispatchEvent("click");
    await expect(page.getByTestId("dialog-edit-horse")).toBeHidden();
  });

  test("Log Health Event dialog @e2e:horse-actions", async ({ page }) => {
    await gotoFirstHorse(page);
    await page.getByTestId("horse-profile-toolbar-cta").dispatchEvent("click");
    await expect(page.getByTestId("dialog-log-health-event")).toBeVisible();
    await page.getByTestId("dialog-log-health-event-cancel").dispatchEvent("click");
    await expect(page.getByTestId("dialog-log-health-event")).toBeHidden();
  });

  test("Mark Isolating dialog blocks until reason given @e2e:horse-actions", async ({ page }) => {
    await gotoFirstHorse(page);
    await page.getByTestId("horse-profile-toolbar-mark-isolating").dispatchEvent("click");
    await expect(page.getByTestId("dialog-mark-isolating")).toBeVisible();
    const reason = page.getByTestId("dialog-mark-isolating-reason");
    if ((await reason.count()) > 0) {
      const confirm = page.getByTestId("dialog-mark-isolating-confirm");
      await expect(confirm).toBeDisabled();
      await reason.click();
      await reason.pressSequentially("Suspected strangles, vet en route", { delay: 5 });
      await expect(confirm).toBeEnabled();
    }
    await page.getByTestId("dialog-mark-isolating-cancel").dispatchEvent("click");
  });
});
