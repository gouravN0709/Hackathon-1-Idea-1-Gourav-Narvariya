export type NotificationSendResult =
  | { status: "sent" }
  | {
      status: "skipped";
      reason: "disabled" | "misconfigured" | "unsupported_provider" | "invalid_recipient";
    }
  | { status: "failed"; reason: "provider_error" | "not_implemented" };

export type OutboundEmail = {
  to: string;
  subject: string;
  /** Plain-text body only until HTML templates are approved. */
  textBody: string;
};

export type NotificationProviderAdapter = {
  readonly id: "resend";
  sendEmail(message: OutboundEmail): Promise<{ ok: true } | { ok: false }>;
};
