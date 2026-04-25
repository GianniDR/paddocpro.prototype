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

test("sidebar lists 15 primary nav entries + Settings @smoke", async ({ page, viewport }) => {
  // Sidebar is hidden under 768px — exercise the trigger on small screens.
  await page.goto("/dashboard");
  if ((viewport?.width ?? 1280) < 768) {
    await page.getByTestId("sidebar-trigger").click();
  }
  await expect(page.getByTestId("nav-dashboard")).toBeVisible();
  for (const slug of [
    "horses",
    "clients",
    "stables",
    "bookings",
    "tasks",
    "health",
    "feed-supplies",
    "staff",
    "documents",
    "communication",
    "incidents",
    "visitors",
    "finance",
    "reports",
    "settings",
  ]) {
    await expect(page.getByTestId(`nav-${slug}`)).toBeVisible();
  }
});

test("brand mark renders with Cormorant + horse icon @smoke", async ({ page, viewport }) => {
  await page.goto("/dashboard");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("class", /cormorant/i);
  if ((viewport?.width ?? 1280) < 768) {
    await page.getByTestId("sidebar-trigger").click();
  }
  await expect(page.getByTestId("nav-brand").locator("svg").first()).toBeVisible();
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
