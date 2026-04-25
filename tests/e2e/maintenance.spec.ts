import { expect, type Page, test } from "@playwright/test";

async function openFirstVacantStable(page: Page) {
  await page.goto("/stables/all-stables");
  await page.waitForSelector(".ag-row", { timeout: 10_000 });
  const rows = page.locator(".ag-row");
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = (await row.textContent()) ?? "";
    if (/vacant/i.test(text)) {
      await row.locator(".ag-cell").nth(2).evaluate((el) => {
        const opts = { bubbles: true, cancelable: true, view: window } as const;
        el.dispatchEvent(new MouseEvent("mousedown", opts));
        el.dispatchEvent(new MouseEvent("mouseup", opts));
        el.dispatchEvent(new MouseEvent("click", opts));
      });
      return;
    }
  }
  throw new Error("No vacant stable in fixture");
}

test.describe("Stable maintenance flow", () => {
  test("mark maintenance and end maintenance @e2e:maintenance", async ({ page }) => {
    await openFirstVacantStable(page);
    await expect(page.getByTestId("stable-sheet")).toBeVisible();

    const trigger = page.getByTestId("stable-mark-maintenance-trigger");
    await expect(trigger).toBeVisible();
    await trigger.dispatchEvent("click");

    await expect(page.getByTestId("dialog-mark-maintenance")).toBeVisible();
    const confirm = page.getByTestId("dialog-mark-maintenance-confirm");
    await expect(confirm).toBeDisabled();

    const reason = page.getByTestId("dialog-mark-maintenance-reason");
    await reason.click();
    await reason.pressSequentially("Drainage repair to back wall", { delay: 5 });
    await expect(confirm).toBeEnabled();
    await confirm.dispatchEvent("click");
    await expect(page.getByTestId("dialog-mark-maintenance")).toBeHidden({ timeout: 5_000 });

    // The trigger label should now flip to "End maintenance"
    await expect(page.getByTestId("stable-mark-maintenance-trigger")).toContainText(
      "End maintenance",
      { timeout: 5_000 },
    );

    // End maintenance — confirm without reason field (it's hidden when ending)
    await page.getByTestId("stable-mark-maintenance-trigger").dispatchEvent("click");
    await page.getByTestId("dialog-mark-maintenance-confirm").dispatchEvent("click");
    await expect(page.getByTestId("dialog-mark-maintenance")).toBeHidden({ timeout: 5_000 });
    await expect(page.getByTestId("stable-mark-maintenance-trigger")).toContainText(
      "Mark maintenance",
      { timeout: 5_000 },
    );
  });
});
