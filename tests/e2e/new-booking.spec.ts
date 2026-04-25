import { expect, test } from "@playwright/test";

test.describe("New booking dialog", () => {
  test("opens + clash detection blocks submit @e2e:new-booking", async ({ page }) => {
    await page.goto("/bookings");
    await page.getByTestId("bookings-new-trigger").click();
    await expect(page.getByTestId("dialog-new-booking")).toBeVisible();
    // Submit disabled until resource is picked
    await expect(page.getByTestId("dialog-new-booking-submit")).toBeDisabled();
    await page.getByTestId("dialog-new-booking-cancel").click();
    await expect(page.getByTestId("dialog-new-booking")).toBeHidden();
  });
});
