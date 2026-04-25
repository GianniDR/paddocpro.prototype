import { expect,test } from "@playwright/test";

test("home page boots without console errors @smoke", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto("/");
  await expect(page).toHaveTitle(/PaddocPro/);
  await expect(page.getByTestId("boot-smoke-home")).toBeVisible();

  // Wait for hydration + any async errors.
  await page.waitForLoadState("networkidle");

  expect(errors).toEqual([]);
});

test("brand mark renders with Cormorant italic + horse icon @smoke", async ({ page }) => {
  await page.goto("/");
  // Wordmark text reachable by role
  await expect(page.getByRole("heading", { level: 1 })).toContainText("paddoc");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pro");

  // Cormorant Garamond is loaded — Next.js injects a hashed className like
  // "cormorant_garamond_<hash>...variable" on <html>.
  const html = page.locator("html");
  const className = await html.getAttribute("class");
  expect(className).toMatch(/cormorant/i);

  // Horse icon (custom SVG) renders next to the heading.
  await expect(page.getByTestId("boot-smoke-home").locator("svg").first()).toBeVisible();
});
