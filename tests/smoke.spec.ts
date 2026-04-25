import { expect, test } from "@playwright/test";

test("home redirects to dashboard @smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("dashboard renders for the bootstrapped session @smoke", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByTestId("dashboard-greeting")).toBeVisible();
  await expect(page.getByTestId("dashboard-kpi-occupancy")).toBeVisible();
  await expect(page.getByTestId("dashboard-kpi-vacc-overdue")).toBeVisible();
  await expect(page.getByTestId("dashboard-kpi-outstanding")).toBeVisible();
});

test("sidebar lists primary nav entries + Settings @smoke", async ({ page, viewport }) => {
  await page.goto("/dashboard");
  // The redesigned sidebar is hidden under md (768px) — on mobile viewports the
  // bottom nav is exercised by mobile-nav.spec.ts. Skip the desktop sidebar
  // check on mobile viewports rather than asserting a (deleted) sidebar trigger.
  if ((viewport?.width ?? 1280) < 768) {
    test.skip(true, "sidebar hidden on mobile viewports — see mobile-nav.spec.ts");
    return;
  }
  await expect(page.getByTestId("sidebar")).toBeVisible();
  await expect(page.getByTestId("nav-home")).toBeVisible();
  for (const slug of [
    "horses",
    "clients",
    "stables-&-paddocks",
    "bookings",
    "tasks",
    "health",
    "feed-&-supplies",
    "staff",
    "documents",
    "communication",
    "incidents",
    "visitors",
    "finance",
    "reports",
  ]) {
    await expect(page.getByTestId(`nav-${slug}`)).toBeVisible();
  }
});

test("brand mark renders in the sidebar @smoke", async ({ page, viewport }) => {
  await page.goto("/dashboard");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("class", /cormorant/i);
  if ((viewport?.width ?? 1280) < 768) {
    test.skip(true, "sidebar hidden on mobile viewports");
    return;
  }
  await expect(page.getByTestId("sidebar")).toContainText(/paddoc/i);
});

test("login page renders @smoke", async ({ page }) => {
  // First clear the bootstrapped session so login isn't auto-redirected away
  await page.goto("/dashboard");
  await page.evaluate(() => window.localStorage.removeItem("pp:session"));
  await page.goto("/login");
  await expect(page.getByTestId("login-page")).toBeVisible();
  await expect(page.getByTestId("login-form")).toBeVisible();
  await expect(page.getByTestId("login-submit")).toBeVisible();
});
