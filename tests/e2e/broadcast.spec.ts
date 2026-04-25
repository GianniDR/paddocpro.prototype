import { expect, test } from "@playwright/test";

test.describe("Communication broadcast", () => {
  test("composer opens + sends @e2e:broadcast", async ({ page }) => {
    await page.goto("/communication");
    await page.getByTestId("comms-broadcast-trigger").click();
    await expect(page.getByTestId("dialog-broadcast")).toBeVisible();
    await expect(page.getByTestId("dialog-broadcast-recipient-count")).toBeVisible();
    const subject = page.getByTestId("dialog-broadcast-subject");
    await subject.click();
    await subject.pressSequentially("Test subject", { delay: 5 });
    const body = page.getByTestId("dialog-broadcast-body");
    await body.click();
    await body.pressSequentially("Test message body for the broadcast.", { delay: 5 });
    const send = page.getByTestId("dialog-broadcast-send");
    await expect(send).toBeEnabled({ timeout: 5_000 });
    await send.dispatchEvent("click");
    await expect(page.getByTestId("dialog-broadcast")).toBeHidden();
  });

  test("notifications log route renders @e2e:broadcast", async ({ page }) => {
    // The old /communication shell linked to /communication/notifications. The
    // dashboard does not include that link, but the route still works — assert
    // the grid renders directly.
    await page.goto("/communication/notifications");
    await expect(page.getByTestId("notifications-grid")).toBeVisible();
  });
});
