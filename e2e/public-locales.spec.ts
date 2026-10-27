import { expect, test } from "@playwright/test";

const locales = ["en", "es", "eu"] as const;

test.describe("Public locale routes", () => {
  for (const locale of locales) {
    test(`${locale} home responds`, async ({ page }) => {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
    });

    test(`${locale} book page loads`, async ({ page }) => {
      const response = await page.goto(`/${locale}/book`);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test(`${locale} manage-booking loads`, async ({ page }) => {
      const response = await page.goto(`/${locale}/manage-booking`);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
});
