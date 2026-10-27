import { getNotificationConfig } from "@/lib/notifications/config";
import { resolveNotificationProvider } from "@/lib/notifications/provider";
import type { NotificationSendResult } from "@/lib/notifications/types";

export type BookingConfirmationPayload = {
  reference: string;
  guestEmail: string;
  guestName: string;
  serviceDate: string;
};

export type GuestCancelPayload = {
  reference: string;
  /** Lookup contact (email or phone). Email send requires an address-like value. */
  guestContact: string;
};

export type NotificationDispatchResult = NotificationSendResult;

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Reservation emails are intentionally off until credentials, templates, and
 * consent copy are approved. Call sites must not treat "skipped" or "failed" as booking errors.
 */
export async function dispatchBookingConfirmation(
  payload: BookingConfirmationPayload,
): Promise<NotificationDispatchResult> {
  const config = getNotificationConfig();
  if (!config.sendEnabled) {
    return { status: "skipped", reason: "disabled" };
  }
  if (config.provider !== "resend" || !config.apiKeyConfigured) {
    return { status: "skipped", reason: "misconfigured" };
  }
  if (!looksLikeEmail(payload.guestEmail)) {
    return { status: "skipped", reason: "invalid_recipient" };
  }

  const provider = resolveNotificationProvider();
  if (!provider) {
    return { status: "skipped", reason: "unsupported_provider" };
  }

  const result = await provider.sendEmail({
    to: payload.guestEmail.trim(),
    subject: "Reservation request received",
    textBody: `Your reference is ${payload.reference}. Service date: ${payload.serviceDate}.`,
  });

  if (!result.ok) {
    return { status: "failed", reason: "not_implemented" };
  }

  return { status: "sent" };
}

export async function dispatchGuestCancellationNotice(
  payload: GuestCancelPayload,
): Promise<NotificationDispatchResult> {
  const config = getNotificationConfig();
  if (!config.sendEnabled) {
    return { status: "skipped", reason: "disabled" };
  }
  if (config.provider !== "resend" || !config.apiKeyConfigured) {
    return { status: "skipped", reason: "misconfigured" };
  }
  if (!looksLikeEmail(payload.guestContact)) {
    return { status: "skipped", reason: "invalid_recipient" };
  }

  const provider = resolveNotificationProvider();
  if (!provider) {
    return { status: "skipped", reason: "unsupported_provider" };
  }

  const result = await provider.sendEmail({
    to: payload.guestContact.trim(),
    subject: "Reservation cancelled",
    textBody: `Reference ${payload.reference} has been cancelled.`,
  });

  if (!result.ok) {
    return { status: "failed", reason: "not_implemented" };
  }

  return { status: "sent" };
}
