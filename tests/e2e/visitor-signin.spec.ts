import { expect, test } from "@playwright/test";

test.describe("Sign-in visitor", () => {
  test("dialog opens, validates name + purpose @e2e:visitor-signin", async ({ page }) => {
    await page.goto("/visitors");
    await page.getByTestId("visitors-signin-trigger").click();
    await expect(page.getByTestId("dialog-signin-visitor")).toBeVisible();
    const submit = page.getByTestId("dialog-signin-submit");
    await expect(submit).toBeDisabled();
    const name = page.getByTestId("dialog-signin-name");
    await name.click();
    await name.pressSequentially("Stourbridge Equine Clinic", { delay: 5 });
    const purpose = page.getByTestId("dialog-signin-purpose");
    await purpose.click();
    await purpose.pressSequentially("Vacc round", { delay: 5 });
    await expect(submit).toBeEnabled();
    await page.getByTestId("dialog-signin-cancel").click();
  });
});
