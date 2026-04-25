import { expect, test } from "@playwright/test";

// The previous full-page Add Horse wizard at `/horses/new` was deleted as part
// of the riskhub realignment. Add Horse is now a modal triggered from the
// horses grid toolbar. This spec verifies the modal opens.

test.describe("Add Horse modal", () => {
  test("opens from the horses grid toolbar @e2e:wizard", async ({ page }) => {
    await page.goto("/horses/all-horses");
    await page.getByTestId("horses-grid-add").click();
    await expect(page.getByTestId("dialog-add-horse")).toBeVisible();
    await page.getByTestId("dialog-add-horse-cancel").click();
    await expect(page.getByTestId("dialog-add-horse")).toBeHidden();
  });
});
