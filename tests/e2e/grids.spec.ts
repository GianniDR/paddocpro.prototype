import { expect, test } from "@playwright/test";

interface Cfg {
  route: string;
  testId: string;
  cta?: string;
}

const GRIDS: Cfg[] = [
  { route: "/clients/all-clients", testId: "clients-grid" },
  { route: "/stables/all-stables", testId: "stables-grid" },
  { route: "/bookings/all-bookings", testId: "bookings-grid" },
  { route: "/tasks/all-tasks", testId: "tasks-grid" },
  { route: "/health/all-events", testId: "health-grid" },
  { route: "/finance/all-invoices", testId: "finance-grid", cta: "finance-grid-run-monthly" },
];

for (const g of GRIDS) {
  test(`${g.route} grid renders with rows @e2e:grids`, async ({ page }) => {
    await page.goto(g.route);
    await expect(page.getByTestId(g.testId)).toBeVisible();
    if (g.cta) await expect(page.getByTestId(g.cta)).toBeVisible();
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    expect(await page.locator(".ag-row").count()).toBeGreaterThan(0);
  });
}
