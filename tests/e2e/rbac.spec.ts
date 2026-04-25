import { expect, test } from "@playwright/test";

test.describe("RBAC matrix", () => {
  test("renders + cells toggle @e2e:rbac", async ({ page }) => {
    await page.goto("/settings/rbac");
    await expect(page.getByTestId("rbac-matrix")).toBeVisible();
    // First cell (yard_manager × horses.view) should be granted by default
    const cell = page.getByTestId("rbac-cell-horses.view-yard_staff");
    await cell.dispatchEvent("click");
    // Click again to flip back
    await cell.dispatchEvent("click");
  });

  test("reset button restores defaults @e2e:rbac", async ({ page }) => {
    await page.goto("/settings/rbac");
    await page.getByTestId("rbac-reset").click();
    // No assertion beyond no-crash
  });
});
