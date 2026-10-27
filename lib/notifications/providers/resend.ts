import type { NotificationProviderAdapter, OutboundEmail } from "@/lib/notifications/types";

/**
 * Resend integration boundary. Does not perform HTTP calls until templates,
 * consent copy, and production credentials are approved.
 */
export function createResendProvider(): NotificationProviderAdapter {
  return {
    id: "resend",
    async sendEmail(_message: OutboundEmail) {
      void _message;
      return { ok: false };
    },
  };
}
