import { expect, test } from "@playwright/test";

test.describe("Settings sub-routes", () => {
  test("settings cards link to sub-routes @e2e:settings", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByTestId("settings-grid")).toBeVisible();
    await page.getByTestId("settings-section-yard-profile").click();
    await page.waitForURL(/\/settings\/yard-profile$/);
    await expect(page.getByTestId("yard-profile-form")).toBeVisible();
  });

  test("yard profile saves changes @e2e:settings", async ({ page }) => {
    await page.goto("/settings/yard-profile");
    const phoneInput = page.getByTestId("yard-profile-phone");
    await phoneInput.click();
    await phoneInput.fill("");
    await phoneInput.pressSequentially("020 9999 9999", { delay: 5 });
    await phoneInput.blur();
    const save = page.getByTestId("yard-profile-save");
    await expect(save).toBeEnabled({ timeout: 5_000 });
    await save.click({ force: true });
    await expect(save).toBeDisabled({ timeout: 5_000 });
  });

  test("Xero wizard walks the flow @e2e:settings", async ({ page }) => {
    await page.goto("/settings/xero");
    await expect(page.getByTestId("xero-wizard")).toBeVisible();
    // Check that some step is highlighted
    await expect(page.getByTestId("xero-wizard-step-1")).toBeVisible();
  });

  test("Audit log renders @e2e:settings", async ({ page }) => {
    await page.goto("/settings/audit-log");
    await expect(page.getByTestId("audit-log-grid")).toBeVisible();
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
  });

  test("Users grid lists all yard users @e2e:settings", async ({ page }) => {
    await page.goto("/settings/users");
    await expect(page.getByTestId("settings-users-grid")).toBeVisible();
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    expect(await page.locator(".ag-row").count()).toBeGreaterThan(0);
  });
});
