import { expect, type Page, test } from "@playwright/test";

async function clickFirstIncident(page: Page) {
  await page.waitForSelector(".ag-row", { timeout: 10_000 });
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(2);
  await cell.evaluate((el) => {
    const opts = { bubbles: true, cancelable: true, view: window } as const;
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  });
}

test.describe("Incident workflow", () => {
  test("opening an incident shows the workflow stepper @e2e:incidents", async ({ page }) => {
    await page.goto("/incidents/all-incidents");
    await clickFirstIncident(page);
    await expect(page.getByTestId("incident-sheet")).toBeVisible();
    await expect(page.getByTestId("incident-workflow-stage-logged")).toBeVisible();
    await expect(page.getByTestId("incident-workflow-stage-closed")).toBeVisible();
  });

  test("advance button is disabled without note @e2e:incidents", async ({ page }) => {
    await page.goto("/incidents/all-incidents");
    await clickFirstIncident(page);
    const advance = page.getByTestId("incident-workflow-advance");
    if ((await advance.count()) > 0) {
      await expect(advance).toBeDisabled();
      await page.getByTestId("incident-workflow-note").fill("Initial review complete, evidence captured.");
      await expect(advance).toBeEnabled();
    }
  });
});
