import { expect, test } from "@playwright/test";

test.describe("Dashboard", () => {
  test("renders all KPI cards + charts @e2e:dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-greeting")).toBeVisible();
    await expect(page.getByTestId("dashboard-kpi-occupancy")).toBeVisible();
    await expect(page.getByTestId("dashboard-kpi-todays-tasks")).toBeVisible();
    await expect(page.getByTestId("dashboard-kpi-vacc-overdue")).toBeVisible();
    await expect(page.getByTestId("dashboard-kpi-outstanding")).toBeVisible();
    await expect(page.getByTestId("dashboard-chart-activity")).toBeVisible();
    await expect(page.getByTestId("dashboard-chart-yard-health")).toBeVisible();
    await expect(page.getByTestId("dashboard-financial-strip")).toBeVisible();
  });

  test("KPI drill links navigate to source routes @e2e:dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByTestId("dashboard-kpi-vacc-overdue").click();
    await page.waitForURL(/\/health/);
    expect(page.url()).toContain("/health");
  });

  test("quick actions are present and link out @e2e:dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-quick-action-add-horse")).toBeVisible();
    await expect(page.getByTestId("dashboard-quick-action-new-booking")).toBeVisible();
    await expect(page.getByTestId("dashboard-quick-action-log-incident")).toBeVisible();
    await expect(page.getByTestId("dashboard-quick-action-record-charge")).toBeVisible();
  });
});
