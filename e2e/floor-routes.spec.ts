import { expect, test } from "@playwright/test";

test.describe("Floor routes (unauthenticated)", () => {
  test("staff floor redirects to login with return path", async ({ page }) => {
    const response = await page.goto("/staff/floor");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/staff\/login\?next=%2Fstaff%2Ffloor/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("admin floor plan redirects to login with return path", async ({ page }) => {
    const response = await page.goto("/admin/floor-plan");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Ffloor-plan/);
  });

  test("staff floor login page preserves date query in return path", async ({ page }) => {
    await page.goto("/staff/floor?date=2026-10-30");
    await expect(page).toHaveURL(/next=%2Fstaff%2Ffloor%3Fdate%3D2026-10-30/);
  });
});
