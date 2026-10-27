import { afterEach, describe, expect, it } from "vitest";
import { getNotificationConfig } from "@/lib/notifications/config";

describe("getNotificationConfig", () => {
  afterEach(() => {
    delete process.env.NOTIFICATIONS_PROVIDER;
    delete process.env.NOTIFICATIONS_API_KEY;
    delete process.env.NOTIFICATIONS_SEND_ENABLED;
  });

  it("defaults to disabled sending", () => {
    const config = getNotificationConfig();
    expect(config.sendEnabled).toBe(false);
    expect(config.readyToSend).toBe(false);
  });

  it("requires explicit opt-in even with provider and key", () => {
    process.env.NOTIFICATIONS_PROVIDER = "resend";
    process.env.NOTIFICATIONS_API_KEY = "re_test";
    const config = getNotificationConfig();
    expect(config.apiKeyConfigured).toBe(true);
    expect(config.readyToSend).toBe(false);
  });
});
