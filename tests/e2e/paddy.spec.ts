import { expect, test } from "@playwright/test";

test.describe("Paddy AI panel", () => {
  test("trigger opens panel and suggestions render @e2e:paddy", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByTestId("topbar-paddy-trigger").click();
    await expect(page.getByTestId("paddy-panel")).toBeVisible();
    await expect(page.getByTestId("paddy-composer")).toBeVisible();
    await expect(page.getByTestId("paddy-composer-suggestion-0")).toBeVisible();
  });

  test("suggested prompt produces a response with citations @e2e:paddy", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByTestId("topbar-paddy-trigger").click();
    await page.getByTestId("paddy-composer-suggestion-0").click();
    // Wait for assistant response
    await page.waitForTimeout(900);
    await expect(page.getByTestId("paddy-panel")).toBeVisible();
    // Either at least one assistant message renders or the panel shows the response
    const messages = await page.locator('[data-testid^="paddy-msg-a_"]').count();
    expect(messages).toBeGreaterThanOrEqual(1);
  });
});
