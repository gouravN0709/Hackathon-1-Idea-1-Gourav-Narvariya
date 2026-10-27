import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dispatchBookingConfirmation,
  dispatchGuestCancellationNotice,
} from "@/lib/notifications/dispatch";

describe("dispatchBookingConfirmation", () => {
  afterEach(() => {
    delete process.env.NOTIFICATIONS_PROVIDER;
    delete process.env.NOTIFICATIONS_API_KEY;
    delete process.env.NOTIFICATIONS_SEND_ENABLED;
    vi.restoreAllMocks();
  });

  it("skips when sending is disabled", async () => {
    const result = await dispatchBookingConfirmation({
      reference: "ITU-TEST",
      guestEmail: "guest@example.com",
      guestName: "Guest",
      serviceDate: "2026-11-01",
    });
    expect(result).toEqual({ status: "skipped", reason: "disabled" });
  });

  it("skips when provider env is incomplete", async () => {
    process.env.NOTIFICATIONS_SEND_ENABLED = "true";
    const result = await dispatchBookingConfirmation({
      reference: "ITU-TEST",
      guestEmail: "guest@example.com",
      guestName: "Guest",
      serviceDate: "2026-11-01",
    });
    expect(result).toEqual({ status: "skipped", reason: "misconfigured" });
  });

  it("skips invalid recipient without logging", async () => {
    process.env.NOTIFICATIONS_SEND_ENABLED = "true";
    process.env.NOTIFICATIONS_PROVIDER = "resend";
    process.env.NOTIFICATIONS_API_KEY = "re_test";
    const result = await dispatchBookingConfirmation({
      reference: "ITU-TEST",
      guestEmail: "not-an-email",
      guestName: "Guest",
      serviceDate: "2026-11-01",
    });
    expect(result).toEqual({ status: "skipped", reason: "invalid_recipient" });
  });

  it("returns not_implemented when provider send is not wired", async () => {
    process.env.NOTIFICATIONS_SEND_ENABLED = "true";
    process.env.NOTIFICATIONS_PROVIDER = "resend";
    process.env.NOTIFICATIONS_API_KEY = "re_test";
    const result = await dispatchBookingConfirmation({
      reference: "ITU-TEST",
      guestEmail: "guest@example.com",
      guestName: "Guest",
      serviceDate: "2026-11-01",
    });
    expect(result).toEqual({ status: "failed", reason: "not_implemented" });
  });

  it("reports provider failure when sendEmail returns false", async () => {
    process.env.NOTIFICATIONS_SEND_ENABLED = "true";
    process.env.NOTIFICATIONS_PROVIDER = "resend";
    process.env.NOTIFICATIONS_API_KEY = "re_test";

    const provider = await import("@/lib/notifications/provider");
    vi.spyOn(provider, "resolveNotificationProvider").mockReturnValue({
      id: "resend",
      sendEmail: async () => ({ ok: false }),
    });

    const result = await dispatchBookingConfirmation({
      reference: "ITU-TEST",
      guestEmail: "guest@example.com",
      guestName: "Guest",
      serviceDate: "2026-11-01",
    });
    expect(result).toEqual({ status: "failed", reason: "not_implemented" });
  });
});

describe("dispatchGuestCancellationNotice", () => {
  afterEach(() => {
    delete process.env.NOTIFICATIONS_PROVIDER;
    delete process.env.NOTIFICATIONS_API_KEY;
    delete process.env.NOTIFICATIONS_SEND_ENABLED;
    vi.restoreAllMocks();
  });

  it("skips when sending is disabled", async () => {
    const result = await dispatchGuestCancellationNotice({
      reference: "ITU-TEST",
      guestContact: "guest@example.com",
    });
    expect(result).toEqual({ status: "skipped", reason: "disabled" });
  });

  it("skips non-email contact without sending", async () => {
    process.env.NOTIFICATIONS_SEND_ENABLED = "true";
    process.env.NOTIFICATIONS_PROVIDER = "resend";
    process.env.NOTIFICATIONS_API_KEY = "re_test";
    const result = await dispatchGuestCancellationNotice({
      reference: "ITU-TEST",
      guestContact: "+34 945 123 456",
    });
    expect(result).toEqual({ status: "skipped", reason: "invalid_recipient" });
  });
});
