import { getNotificationConfig } from "@/lib/notifications/config";
import { createResendProvider } from "@/lib/notifications/providers/resend";
import type { NotificationProviderAdapter } from "@/lib/notifications/types";

export function resolveNotificationProvider(): NotificationProviderAdapter | null {
  const config = getNotificationConfig();
  if (!config.sendEnabled || !config.apiKeyConfigured) {
    return null;
  }
  if (config.provider === "resend") {
    return createResendProvider();
  }
  return null;
}
