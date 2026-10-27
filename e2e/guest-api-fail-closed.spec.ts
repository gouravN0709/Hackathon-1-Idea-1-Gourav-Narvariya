import { expect, test } from "@playwright/test";

test.describe("Guest API fail-closed without live DB", () => {
  test("POST /api/bookings rejects invalid body", async ({ request }) => {
    const response = await request.post("/api/bookings", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(400);
    const body = (await response.json()) as { ok: boolean; error?: { code: string } };
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("validation");
  });

  test("GET /api/bookings/availability requires query params", async ({ request }) => {
    const response = await request.get("/api/bookings/availability");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
