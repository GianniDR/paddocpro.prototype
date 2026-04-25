import { expect, test } from "@playwright/test";

test.describe("Run monthly invoicing", () => {
  test("dialog opens with preview + can submit @e2e:finance", async ({ page }) => {
    await page.goto("/finance/all-invoices");
    await page.getByTestId("finance-grid-run-monthly").click();
    await expect(page.getByTestId("dialog-run-monthly-invoicing")).toBeVisible();
    await expect(page.getByTestId("dialog-run-monthly-invoicing-confirm")).toBeEnabled();
    await page.getByTestId("dialog-run-monthly-invoicing-confirm").click();
    // Dialog closes
    await expect(page.getByTestId("dialog-run-monthly-invoicing")).toBeHidden();
  });

  test("dialog cancel closes without changes @e2e:finance", async ({ page }) => {
    await page.goto("/finance/all-invoices");
    await page.getByTestId("finance-grid-run-monthly").click();
    await page.getByTestId("dialog-run-monthly-invoicing-cancel").click();
    await expect(page.getByTestId("dialog-run-monthly-invoicing")).toBeHidden();
  });
});
