export type NotificationProvider = "resend";

export type NotificationConfig = {
  provider: NotificationProvider | null;
  apiKeyConfigured: boolean;
  sendEnabled: boolean;
  readyToSend: boolean;
};

function readTrimmed(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Server-only. Sending stays off until provider, API key, and explicit opt-in are set. */
export function getNotificationConfig(): NotificationConfig {
  const providerRaw = readTrimmed("NOTIFICATIONS_PROVIDER");
  const provider =
    providerRaw === "resend" ? ("resend" as const) : providerRaw ? null : null;

  const apiKeyConfigured = Boolean(readTrimmed("NOTIFICATIONS_API_KEY"));
  const sendEnabled = readTrimmed("NOTIFICATIONS_SEND_ENABLED") === "true";

  /** Flip to true only after `lib/notifications/providers/resend.ts` performs reviewed outbound sends. */
  const outboundImplemented = false;
  const readyToSend =
    outboundImplemented && provider === "resend" && apiKeyConfigured && sendEnabled;

  return {
    provider,
    apiKeyConfigured,
    sendEnabled,
    readyToSend,
  };
}
