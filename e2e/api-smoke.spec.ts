import { expect, test } from "@playwright/test";

test.describe("API smoke", () => {
  test("GET /api/health returns ok JSON", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as { status: string; rateLimit: { mode: string } };
    expect(body.status).toBe("ok");
    expect(body.rateLimit.mode).toBeTruthy();
  });

  test("GET /api/bookings/status returns live flag", async ({ request }) => {
    const response = await request.get("/api/bookings/status");
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as { live: boolean; reason: string | null };
    expect(typeof body.live).toBe("boolean");
    expect(body.live).toBe(false);
  });
});
