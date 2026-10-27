import { afterEach, describe, expect, it, vi } from "vitest";

describe("hasServiceRoleConfiguration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false when the secret key is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");

    const { hasServiceRoleConfiguration } = await import("@/lib/supabase/admin");
    expect(hasServiceRoleConfiguration()).toBe(false);
  });

  it("is false when the Supabase URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret-key");

    const { hasServiceRoleConfiguration } = await import("@/lib/supabase/admin");
    expect(hasServiceRoleConfiguration()).toBe(false);
  });

  it("is true when both URL and secret key are set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret-key");

    const { hasServiceRoleConfiguration } = await import("@/lib/supabase/admin");
    expect(hasServiceRoleConfiguration()).toBe(true);
  });

  it("accepts legacy SUPABASE_SERVICE_ROLE_KEY when canonical key is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "legacy-secret");

    vi.resetModules();
    const { hasServiceRoleConfiguration } = await import("@/lib/supabase/admin");
    expect(hasServiceRoleConfiguration()).toBe(true);
  });
});
