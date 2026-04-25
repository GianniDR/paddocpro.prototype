import { expect, test } from "@playwright/test";

const GRIDS = [
  { route: "/clients", testId: "clients-grid", cta: "clients-grid-cta" },
  { route: "/stables", testId: "stables-grid", cta: "stables-grid-cta" },
  { route: "/bookings", testId: "bookings-grid", cta: "bookings-grid-cta" },
  { route: "/tasks", testId: "tasks-grid", cta: null },
  { route: "/health", testId: "health-grid", cta: null },
  { route: "/finance", testId: "finance-grid", cta: "finance-grid-cta" },
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
