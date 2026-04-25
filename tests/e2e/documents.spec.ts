import { expect, test } from "@playwright/test";

test.describe("Documents", () => {
  test("upload dialog opens with form @e2e:documents", async ({ page }) => {
    await page.goto("/documents");
    await page.getByTestId("documents-upload-trigger").click();
    await expect(page.getByTestId("dialog-upload-document")).toBeVisible();
    await expect(page.getByTestId("dialog-upload-document-file")).toBeVisible();
    await expect(page.getByTestId("dialog-upload-document-submit")).toBeDisabled();
    await page.getByTestId("dialog-upload-document-cancel").click();
    await expect(page.getByTestId("dialog-upload-document")).toBeHidden();
  });

  test("signature pad opens and clears @e2e:documents", async ({ page }) => {
    await page.goto("/documents");
    await page.getByTestId("signature-pad-trigger").click();
    await expect(page.getByTestId("dialog-signature-pad")).toBeVisible();
    await expect(page.getByTestId("signature-pad-canvas")).toBeVisible();
    // Save disabled until signed
    await expect(page.getByTestId("signature-pad-save")).toBeDisabled();
    await page.getByTestId("signature-pad-clear").click();
  });
});
