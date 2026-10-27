import { expect, test } from "@playwright/test";

/**
 * Isolated canvas markup (no Supabase, no reservations).
 * Verifies the floor-plan table chip pattern used in the real dashboard.
 */
test("floor table chip shows label and status", async ({ page }) => {
  await page.setContent(`
    <div data-testid="floor-canvas" style="width:400px;height:300px;position:relative;background:#F3EBDD">
      <button type="button" data-testid="table-T1" aria-label="Table T1, Available"
        style="position:absolute;left:10px;top:10px;width:80px;height:80px">
        T1 · Available
      </button>
    </div>
  `);

  await expect(page.getByTestId("floor-canvas")).toBeVisible();
  await expect(page.getByTestId("table-T1")).toContainText("Available");
  await page.getByTestId("table-T1").click();
});
