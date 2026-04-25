import { expect, type Page, test } from "@playwright/test";

interface Cfg {
  route: string;
  testId: string;
  cta?: string;
  beforeGrid?: (page: Page) => Promise<void>;
}

const GRIDS: Cfg[] = [
  { route: "/clients", testId: "clients-grid", cta: "clients-grid-cta" },
  {
    route: "/stables",
    testId: "stables-grid",
    cta: "stables-grid-cta",
    beforeGrid: async (page) => page.getByTestId("stables-view-grid").click(),
  },
  {
    route: "/bookings",
    testId: "bookings-grid",
    cta: "bookings-grid-cta",
    beforeGrid: async (page) => page.getByTestId("bookings-view-list").click(),
  },
  { route: "/tasks", testId: "tasks-grid" },
  {
    route: "/health",
    testId: "health-grid",
    beforeGrid: async (page) => page.getByTestId("health-view-list").click(),
  },
  { route: "/finance", testId: "finance-grid", cta: "finance-grid-run-monthly" },
];

for (const g of GRIDS) {
  test(`${g.route} grid renders with rows @e2e:grids`, async ({ page }) => {
    await page.goto(g.route);
    if (g.beforeGrid) await g.beforeGrid(page);
    await expect(page.getByTestId(g.testId)).toBeVisible();
    if (g.cta) await expect(page.getByTestId(g.cta)).toBeVisible();
    await page.waitForSelector(".ag-row", { timeout: 10_000 });
    expect(await page.locator(".ag-row").count()).toBeGreaterThan(0);
  });
}
