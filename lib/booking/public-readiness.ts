import { assessBookingReadiness, type BookingReadiness } from "@/lib/booking/readiness";
import { createAdminClient, hasServiceRoleConfiguration } from "@/lib/supabase/admin";

export type { BookingReadiness };

export async function getPublicBookingReadiness(): Promise<BookingReadiness> {
  if (!hasServiceRoleConfiguration()) {
    return {
      live: false,
      reason: "Server booking credentials are not configured.",
    };
  }

  try {
    const supabase = createAdminClient();
    return await assessBookingReadiness(supabase);
  } catch {
    return {
      live: false,
      reason: "Could not reach the reservation database.",
    };
  }
}
