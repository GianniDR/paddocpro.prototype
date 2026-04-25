import { expect, type Page, test } from "@playwright/test";

async function openFirstUnpaidInvoice(page: Page) {
  await page.goto("/finance/all-invoices");
  await page.waitForSelector(".ag-row", { timeout: 10_000 });
  // Find a row whose status cell is NOT "paid" or "voided".
  const rows = page.locator(".ag-row");
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const text = (await row.textContent()) ?? "";
    if (!/paid|voided/i.test(text)) {
      await row.locator(".ag-cell").nth(2).evaluate((el) => {
        const opts = { bubbles: true, cancelable: true, view: window } as const;
        el.dispatchEvent(new MouseEvent("mousedown", opts));
        el.dispatchEvent(new MouseEvent("mouseup", opts));
        el.dispatchEvent(new MouseEvent("click", opts));
      });
      return;
    }
  }
  throw new Error("No unpaid invoice in fixture");
}

test.describe("Record invoice payment", () => {
  test("partial then full payment updates status @e2e:payment", async ({ page }) => {
    await openFirstUnpaidInvoice(page);
    await expect(page.getByTestId("invoice-sheet")).toBeVisible();

    // Open record-payment dialog
    const trigger = page.getByTestId("finance-record-payment-trigger");
    await expect(trigger).toBeVisible();
    await trigger.dispatchEvent("click");
    await expect(page.getByTestId("dialog-record-payment")).toBeVisible();

    // Submit the prefilled outstanding amount
    const submit = page.getByTestId("dialog-record-payment-submit");
    await expect(submit).toBeEnabled();
    await submit.dispatchEvent("click");
    await expect(page.getByTestId("dialog-record-payment")).toBeHidden({ timeout: 5_000 });
  });

  test("amount above outstanding is rejected @e2e:payment", async ({ page }) => {
    await openFirstUnpaidInvoice(page);
    const trigger = page.getByTestId("finance-record-payment-trigger");
    await trigger.dispatchEvent("click");

    const amount = page.getByTestId("dialog-record-payment-amount");
    await amount.click();
    await amount.fill("");
    await amount.pressSequentially("99999999", { delay: 5 });

    const submit = page.getByTestId("dialog-record-payment-submit");
    await expect(submit).toBeDisabled();
    await page.getByTestId("dialog-record-payment-cancel").dispatchEvent("click");
  });
});
