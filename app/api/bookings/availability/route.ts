import { connection } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";
import { assessBookingSlotAvailability } from "@/lib/booking/assess-slot-availability";
import { createAdminClient, hasServiceRoleConfiguration } from "@/lib/supabase/admin";

const AVAILABILITY_LIMIT = 60;
const AVAILABILITY_WINDOW_MS = 15 * 60 * 1000;

export async function GET(request: Request) {
  await connection();

  const ip = clientIpFromRequest(request);
  const rate = await checkRateLimit(
    `bookings:availability:${ip}`,
    AVAILABILITY_LIMIT,
    AVAILABILITY_WINDOW_MS,
  );
  if (!rate.ok) {
    return NextResponse.json(
      {
        ok: false,
        bookable: false,
        error: {
          code: "rate_limit",
          message: "Too many checks. Wait a few minutes and try again.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  const url = new URL(request.url);
  const date = String(url.searchParams.get("date") ?? "").trim();
  const arrival = String(url.searchParams.get("arrival") ?? "").trim();

  if (!date || !arrival) {
    return NextResponse.json(
      {
        ok: false,
        bookable: false,
        error: { code: "validation", message: "Provide date and arrival." },
      },
      { status: 400 },
    );
  }

  if (!hasServiceRoleConfiguration()) {
    return NextResponse.json({
      ok: true,
      bookable: false,
      message: "Online booking is not available yet.",
    });
  }

  try {
    const supabase = createAdminClient();
    const result = await assessBookingSlotAvailability(supabase, date, arrival);
    return NextResponse.json({
      ok: true,
      bookable: result.bookable,
      message: result.bookable ? null : result.message,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      bookable: false,
      error: {
        code: "server",
        message: "Could not check availability. Try again or call the farm.",
      },
    });
  }
}
