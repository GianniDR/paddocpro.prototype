import { expect, type Page, test } from "@playwright/test";

async function nextStep(page: Page, step: number) {
  const btn = page.getByTestId(`wizard-add-horse-step-${step}-next`);
  // Webkit + Base UI needs a generous wait for the disabled prop to flip after fills.
  await expect(btn).toBeEnabled({ timeout: 5_000 });
  await btn.click({ force: true });
}

async function fillField(page: Page, testId: string, value: string) {
  const field = page.getByTestId(testId);
  await field.click();
  await field.fill("");
  await field.pressSequentially(value, { delay: 10 });
  // Tab away to commit
  await field.blur();
}

test.describe("Add Horse wizard", () => {
  test("walks all 5 steps and submits @e2e:wizard", async ({ page }) => {
    await page.goto("/horses/new");
    await expect(page.getByTestId("add-horse-wizard")).toBeVisible();
    await expect(page.getByTestId("wizard-add-horse-step-1")).toBeVisible();

    // Step 1 — Identity
    await fillField(page, "wizard-add-horse-field-stableName", "Tester");
    await fillField(page, "wizard-add-horse-field-registeredName", "Tester of Riverbend");
    await fillField(page, "wizard-add-horse-field-breed", "Connemara");
    await fillField(page, "wizard-add-horse-field-height", "15.2");
    await nextStep(page, 1);

    // Step 2 — Identifiers
    await fillField(page, "wizard-add-horse-field-microchip", "985121999000777");
    await fillField(page, "wizard-add-horse-field-passport", "GB999777");
    await nextStep(page, 2);

    // Step 3 — Ownership
    await page.getByTestId("wizard-add-horse-field-owner").click();
    await page.locator("[role=option]").first().click();
    await nextStep(page, 3);

    // Step 4 — Assignment
    await page.getByTestId("wizard-add-horse-field-livery").click();
    await page.locator("[role=option]").first().click();
    await nextStep(page, 4);

    // Step 5 — Submit
    await page.getByTestId("wizard-add-horse-submit").click({ force: true });
    await page.waitForURL(/\/horses\/horse_[a-z0-9-]+/, { timeout: 10_000 });
    await expect(page.getByTestId("horse-profile-toolbar")).toBeVisible();
  });
});
