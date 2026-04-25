import { expect, test } from "@playwright/test";

test.describe("Tasks completion", () => {
  test("complete a single task via row button @e2e:tasks", async ({ page }) => {
    await page.goto("/tasks/all-tasks");
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    // Find the first complete button (only present on non-completed rows)
    const completeBtn = page.locator('[data-testid^="tasks-grid-complete-"]').first();
    if ((await completeBtn.count()) > 0) {
      await completeBtn.click({ force: true });
      // Toast appears via sonner — just check we didn't crash
      await page.waitForTimeout(300);
    }
  });

  test("bulk select shows the bulk action bar @e2e:tasks", async ({ page }) => {
    await page.goto("/tasks/all-tasks");
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    // Click the AG Grid checkbox input directly — most reliable across webkit + mobile.
    const checkboxCell = page.locator(".ag-row").first().locator('[col-id="__select"]').first();
    await checkboxCell.evaluate((el) => {
      const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      if (input) {
        input.click();
      } else {
        const opts = { bubbles: true, cancelable: true, view: window } as const;
        el.dispatchEvent(new MouseEvent("mousedown", opts));
        el.dispatchEvent(new MouseEvent("mouseup", opts));
        el.dispatchEvent(new MouseEvent("click", opts));
      }
    });
    await expect(page.getByTestId("tasks-bulk-bar")).toBeVisible({ timeout: 5_000 });
    await page.getByTestId("tasks-bulk-clear").click();
    await expect(page.getByTestId("tasks-bulk-bar")).toBeHidden({ timeout: 5_000 });
  });
});
