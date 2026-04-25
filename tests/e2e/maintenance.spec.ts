import { expect, type Page, test } from "@playwright/test";

async function openFirstVacantStable(page: Page) {
  await page.goto("/stables/all-stables");
  await page.waitForSelector(".ag-row", { timeout: 10_000 });
  // Apply the 'vacant' filter chip and wait for the grid to refresh.
  const vacantChip = page.getByTestId("chip-vacant");
  await vacantChip.dispatchEvent("click");
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll(".ag-row");
      if (rows.length === 0) return false;
      // After filter, every visible row should contain "Vacant" text.
      return Array.from(rows).every((r) => /vacant/i.test(r.textContent ?? ""));
    },
    { timeout: 10_000 },
  );
  const cell = page.locator(".ag-row").first().locator(".ag-cell").nth(2);
  await cell.waitFor({ state: "visible", timeout: 10_000 });
  await cell.evaluate((el) => {
    const opts = { bubbles: true, cancelable: true, view: window } as const;
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    el.dispatchEvent(new MouseEvent("mouseup", opts));
    el.dispatchEvent(new MouseEvent("click", opts));
  });
}

test.describe("Stable maintenance flow", () => {
  test("mark maintenance and end maintenance @e2e:maintenance", async ({ page, isMobile }) => {
    // TODO: mobile chip click doesn't filter the AG Grid reliably on iPhone/Pixel viewports.
    test.skip(isMobile, "Mobile chip filter flakes; covered by desktop projects.");
    await openFirstVacantStable(page);
    await expect(page.getByTestId("stable-sheet")).toBeVisible();

    const trigger = page.getByTestId("stable-mark-maintenance-trigger");
    await expect(trigger).toBeVisible();
    await trigger.dispatchEvent("click");

    await expect(page.getByTestId("dialog-mark-maintenance")).toBeVisible();
    const confirm = page.getByTestId("dialog-mark-maintenance-confirm");
    await expect(confirm).toBeDisabled();

    const reason = page.getByTestId("dialog-mark-maintenance-reason");
    await reason.click();
    await reason.pressSequentially("Drainage repair to back wall", { delay: 5 });
    await expect(confirm).toBeEnabled();
    await confirm.click({ force: true });
    await expect(page.getByTestId("dialog-mark-maintenance")).toBeHidden({ timeout: 5_000 });

    // The trigger label should now flip to "End maintenance"
    await expect(page.getByTestId("stable-mark-maintenance-trigger")).toContainText(
      "End maintenance",
      { timeout: 5_000 },
    );

    // End maintenance — confirm without reason field (it's hidden when ending)
    await page.getByTestId("stable-mark-maintenance-trigger").click({ force: true });
    await page.getByTestId("dialog-mark-maintenance-confirm").click({ force: true });
    await expect(page.getByTestId("dialog-mark-maintenance")).toBeHidden({ timeout: 5_000 });
    await expect(page.getByTestId("stable-mark-maintenance-trigger")).toContainText(
      "Mark maintenance",
      { timeout: 5_000 },
    );
  });
});
