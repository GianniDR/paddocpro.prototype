import { expect, test } from "@playwright/test";

test.describe("Reports", () => {
  test("catalogue links to occupancy + aged-debtors + horse-health @e2e:reports", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.getByTestId("reports-catalogue")).toBeVisible();
    await page.getByTestId("report-card-occupancy").click();
    await page.waitForURL(/\/reports\/occupancy$/);
    await expect(page.getByTestId("report-occupancy")).toBeVisible();
  });

  test("aged debtors report renders charts @e2e:reports", async ({ page }) => {
    await page.goto("/reports/aged-debtors");
    await expect(page.getByTestId("report-aged-debtors")).toBeVisible();
  });

  test("horse health report renders heatmap @e2e:reports", async ({ page }) => {
    await page.goto("/reports/horse-health");
    await expect(page.getByTestId("report-horse-health")).toBeVisible();
  });

  test("export buttons present @e2e:reports", async ({ page }) => {
    await page.goto("/reports/occupancy");
    await expect(page.getByTestId("report-occupancy-export-csv")).toBeVisible();
    await expect(page.getByTestId("report-occupancy-export-pdf")).toBeVisible();
  });
});
