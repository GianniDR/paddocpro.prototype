import { expect, test } from "@playwright/test";

test.describe("Mobile bottom nav", () => {
  test("bottom nav visible only on mobile + nav works @e2e:mobile-nav", async ({ page, viewport }) => {
    await page.goto("/dashboard");
    if ((viewport?.width ?? 1280) < 768) {
      await expect(page.getByTestId("mobile-bottom-nav")).toBeVisible();
      // Nav to Horses
      await page.getByTestId("mobile-bottom-nav-horses").click();
      await page.waitForURL(/\/horses$/);
      await expect(page.getByTestId("mobile-bottom-nav-horses")).toBeVisible();
    } else {
      // Hidden on desktop (md+)
      const nav = page.getByTestId("mobile-bottom-nav");
      await expect(nav).toBeHidden();
    }
  });
});
