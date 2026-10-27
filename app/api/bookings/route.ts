import { connection } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";
import { createReservation } from "@/lib/booking/create-reservation";
import type { BookingRequestInput } from "@/lib/booking/validate-request";
import { validateBookingRequest } from "@/lib/booking/validate-request";
import { dispatchBookingConfirmation } from "@/lib/notifications/dispatch";
import { createAdminClient, hasServiceRoleConfiguration } from "@/lib/supabase/admin";

const BOOKING_LIMIT = 10;
const BOOKING_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  await connection();

  const ip = clientIpFromRequest(request);
  const rate = await checkRateLimit(`bookings:create:${ip}`, BOOKING_LIMIT, BOOKING_WINDOW_MS);
  if (!rate.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "rate_limit",
          message: "Too many booking attempts. Wait a few minutes and try again.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  if (!hasServiceRoleConfiguration()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "configuration",
          message: "Online booking is not available yet.",
        },
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "validation", message: "Invalid request body." },
      },
      { status: 400 },
    );
  }

  const input = body as Partial<BookingRequestInput>;
  const parsed = validateBookingRequest({
    date: String(input.date ?? ""),
    arrival: String(input.arrival ?? ""),
    adults: Number(input.adults),
    children: Number(input.children),
    name: String(input.name ?? ""),
    email: String(input.email ?? ""),
    phone: String(input.phone ?? ""),
    notes: String(input.notes ?? ""),
  });

  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "validation", message: "Check the form and try again." } },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const result = await createReservation(supabase, parsed.value);

    if (!result.ok) {
      const status =
        result.error.code === "configuration"
          ? 503
          : result.error.code === "validation"
            ? 400
            : 409;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }

    void dispatchBookingConfirmation({
      reference: result.reference,
      guestEmail: parsed.value.email,
      guestName: parsed.value.name,
      serviceDate: parsed.value.date,
    });

    return NextResponse.json({
      ok: true,
      reference: result.reference,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "server",
          message: "We could not save your request. Try again or call the farm.",
        },
      },
      { status: 500 },
    );
  }
}
