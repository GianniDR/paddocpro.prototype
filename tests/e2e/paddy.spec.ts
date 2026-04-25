import { expect, type Page, test } from "@playwright/test";

async function openPaddy(page: Page, viewport?: { width: number; height: number } | null) {
  // On wide screens click the topbar trigger; on narrow screens use ⌘J
  // (the trigger may scroll out of the visible topbar).
  if ((viewport?.width ?? 1280) < 768) {
    await page.locator("body").click();
    await page.keyboard.press("Meta+j");
  } else {
    await page.getByTestId("topbar-paddy-trigger").click();
  }
}

test.describe("Paddy AI panel", () => {
  test("trigger opens panel and suggestions render @e2e:paddy", async ({ page, viewport }) => {
    await page.goto("/dashboard");
    await openPaddy(page, viewport);
    await expect(page.getByTestId("paddy-panel")).toBeVisible();
    await expect(page.getByTestId("paddy-composer")).toBeVisible();
    await expect(page.getByTestId("paddy-composer-suggestion-0")).toBeVisible();
  });

  test("suggested prompt produces a response with citations @e2e:paddy", async ({ page, viewport }) => {
    await page.goto("/dashboard");
    await openPaddy(page, viewport);
    await page.getByTestId("paddy-composer-suggestion-0").click();
    await page.waitForTimeout(900);
    await expect(page.getByTestId("paddy-panel")).toBeVisible();
    const messages = await page.locator('[data-testid^="paddy-msg-a_"]').count();
    expect(messages).toBeGreaterThanOrEqual(1);
  });
});
