import { expect, test } from "@playwright/test";

test.describe("Integrations admin", () => {
  test("toggle Stripe persists to localStorage @e2e:integrations", async ({ page }) => {
    await page.goto("/settings/integrations");
    await expect(page.getByTestId("integrations-shell")).toBeVisible();

    // Ensure starting from disconnected
    await page.evaluate(() => window.localStorage.removeItem("pp:integration:stripe"));
    await page.reload();

    const action = page.getByTestId("integration-card-stripe-action");
    await expect(action).toContainText("Connect");
    await action.dispatchEvent("click");

    await expect(action).toContainText("Disconnect", { timeout: 3_000 });
    const stored = await page.evaluate(() => window.localStorage.getItem("pp:integration:stripe"));
    expect(stored).toBe("1");

    await action.dispatchEvent("click");
    await expect(action).toContainText("Connect", { timeout: 3_000 });
    const cleared = await page.evaluate(() =>
      window.localStorage.getItem("pp:integration:stripe"),
    );
    expect(cleared).toBeNull();
  });

  test("Xero card links to wizard @e2e:integrations", async ({ page }) => {
    await page.goto("/settings/integrations");
    const xero = page.getByTestId("integration-card-xero-action");
    await expect(xero).toBeVisible();
    await xero.dispatchEvent("click");
    await page.waitForURL(/\/settings\/xero$/, { timeout: 10_000 });
  });
});
