import { NextResponse } from "next/server";
import { describeRateLimitBackend } from "@/lib/api/rate-limit-store";
import { getNotificationConfig } from "@/lib/notifications/config";
import { hasPublishableSupabaseConfiguration } from "@/lib/staff/supabase-config";
import { hasServiceRoleConfiguration } from "@/lib/supabase/admin";

export async function GET() {
  const notifications = getNotificationConfig();
  const rateLimit = describeRateLimitBackend();

  return NextResponse.json({
    status: "ok",
    supabase: {
      publishableConfigured: hasPublishableSupabaseConfiguration(),
      serviceRoleConfigured: hasServiceRoleConfiguration(),
    },
    booking: {
      /** When false, POST /api/bookings and live availability reject guest submissions. */
      requiresLiveReadiness: true,
      serverCredentialsConfigured: hasServiceRoleConfiguration(),
    },
    rateLimit,
    notifications: {
      provider: notifications.provider,
      apiKeyConfigured: notifications.apiKeyConfigured,
      sendEnabled: notifications.sendEnabled,
      readyToSend: notifications.readyToSend,
    },
  });
}
